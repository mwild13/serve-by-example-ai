// Client-side face crop for AI Portrait uploads (see AiProfilePhotoScreen.tsx).
//
// Why this exists: the selfie sent to Fal's face-swap model previously went
// out full-frame, background and all — the model only needs the face, so
// the rest is unnecessary third-party exposure of a staff member's
// environment plus inconsistent framing (a face that's small/off-center in
// the source photo feeds the swap model a worse identity reference).
//
// Why MediaPipe: the browser-native Shape Detection API (`FaceDetector`) was
// removed from Chrome and never shipped in Safari, so it can't be the
// cross-platform mechanism for a mobile PWA whose staff users are on iOS as
// much as Android. `@mediapipe/tasks-vision`'s FaceDetector runs a small
// on-device WASM model instead, works the same across browsers, and is only
// imported here — lazily, from this route — so it never adds weight to the
// rest of the app's bundle.
//
// Fails open: any detection miss (no face found, low confidence, WASM/model
// load failure, unsupported device) returns null and the caller falls back
// to sending the original, uncropped photo. A client-side detector glitch
// must never block generation.

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

// Pad the detected face box out to this multiple on each side before
// cropping, so the result is a head-and-shoulders portrait rather than a
// tight face-only crop (which would look wrong as a selfie preview and
// gives the swap model less context than a real headshot would).
const CROP_PADDING = 1.6;
const MIN_CONFIDENCE = 0.5;

let detectorPromise: Promise<import("@mediapipe/tasks-vision").FaceDetector> | null = null;

async function getDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_BASE);
      return FaceDetector.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        minDetectionConfidence: MIN_CONFIDENCE,
      });
    })();
  }
  return detectorPromise;
}

/**
 * Detects the largest face in `img` and returns a cropped, padded
 * head-and-shoulders data URL, or null if no face was confidently detected
 * (caller should fall back to the uncropped photo).
 */
export async function cropToFace(img: HTMLImageElement): Promise<string | null> {
  try {
    const detector = await getDetector();
    const result = detector.detect(img);
    if (!result.detections.length) return null;

    // Largest box wins — the subject taking a selfie, not a stray face in
    // the background.
    const box = result.detections
      .map((d) => d.boundingBox)
      .filter((b): b is NonNullable<typeof b> => b != null)
      .sort((a, b) => b.width * b.height - a.width * a.height)[0];
    if (!box) return null;

    const cx = box.originX + box.width / 2;
    const cy = box.originY + box.height / 2;
    const side = Math.max(box.width, box.height) * CROP_PADDING;

    const sx = Math.max(0, cx - side / 2);
    const sy = Math.max(0, cy - side / 2);
    const sw = Math.min(side, img.width - sx);
    const sh = Math.min(side, img.height - sy);
    if (sw <= 0 || sh <= 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (err) {
    console.error("[face-crop] Detection failed, falling back to uncropped photo:", err);
    return null;
  }
}
