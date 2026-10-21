"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Image as GalleryIcon, Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import Screen from "./ui/Screen";
import { useMobileSession } from "../_lib/mobile-session-context";
import {
  BACKGROUND_STYLES,
  COMPOSITE_SIZE,
  drawComposite,
  exportCompositeBlob,
  loadImageFromUrl,
  type BackgroundStyleId,
} from "@/lib/photo-composite";

// Replaces AiProfilePhotoScreen.tsx (face-swap, deleted). New flow: capture
// or pick a photo -> automatic center-square crop (no interactive cropping
// UI) -> strip its background via app/api/profile-photo/remove-background
// -> pick a hospitality background (switches instantly, no re-call) -> save
// the flattened composite via app/api/profile-photo/save.
//
// No style/gender selector up front like the old screen had — the 4
// BACKGROUND_STYLES below are picked *after* the user's own photo comes
// back as a cutout, and switching between them is a synchronous canvas
// redraw (lib/photo-composite.ts), not a new Fal call.
//
// No localStorage draft cache (unlike the old screen) — background removal
// is ~1s, so losing an unsaved preview to back-navigation and re-running it
// is an acceptable, cheap cost, not a wasted expensive generation.
//
// Redesign phase 6: on the mobile frame (ui/Screen), opened from Me and
// Settings. Back steps back through the stages before leaving; saving goes
// to Me. Styles: the sm-photoedit rules in app/styles/staff.css.

type Stage = "idle" | "cropping" | "capturing" | "removingBackground" | "previewingComposite" | "saving";

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

/** Center-square crop of any drawImage-able source, scaled to
 *  COMPOSITE_SIZE — the automatic 1:1 crop-lock shared by both the
 *  live-camera and gallery-upload paths. `mirror` flips the result
 *  left-to-right so a selfie matches the mirrored camera preview. */
function cropToSquareDataUrl(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  mirror = false,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = COMPOSITE_SIZE;
  canvas.height = COMPOSITE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const side = Math.min(sourceWidth, sourceHeight);
  const sx = (sourceWidth - side) / 2;
  const sy = (sourceHeight - side) / 2;
  if (mirror) {
    ctx.translate(COMPOSITE_SIZE, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, sx, sy, side, side, 0, 0, COMPOSITE_SIZE, COMPOSITE_SIZE);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read the composite image."));
    reader.readAsDataURL(blob);
  });
}

type CropCenter = { x: number; y: number };

const CROP_MIN_ZOOM = 1;
const CROP_MAX_ZOOM = 3;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** The interactive gallery-upload crop step (pinch/drag) works entirely in
 *  source-image pixel space: a square "window" of side length `L` sits
 *  centered on `center`, sized so that at userScale=1 it exactly covers the
 *  square preview (matching CSS object-fit: cover), and shrinks as
 *  userScale increases (zooming in = looking at a smaller region of the
 *  source at higher magnification). Keeping `center` clamped so the window
 *  never leaves the source image is the only invariant this whole feature
 *  depends on — every other calculation (drag, pinch, draw) derives from
 *  it. */
function clampCropCenter(
  center: CropCenter,
  sourceWidth: number,
  sourceHeight: number,
  containerSize: number,
  userScale: number,
): CropCenter {
  const coverScale = Math.max(containerSize / sourceWidth, containerSize / sourceHeight);
  const windowSize = containerSize / (coverScale * userScale);
  return {
    x: clampNumber(center.x, windowSize / 2, sourceWidth - windowSize / 2),
    y: clampNumber(center.y, windowSize / 2, sourceHeight - windowSize / 2),
  };
}

/** Draws the current crop window onto `canvas` at `outputSize`x`outputSize`
 *  — used both for the live interactive preview (small, container-sized)
 *  and the final high-resolution export (COMPOSITE_SIZE), sharing the same
 *  windowing math so what the user sees while pinch/dragging is exactly
 *  what gets sent for background removal. */
function drawCropWindow(
  canvas: HTMLCanvasElement,
  source: ImageBitmap,
  containerSize: number,
  userScale: number,
  center: CropCenter,
  outputSize: number,
) {
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const coverScale = Math.max(containerSize / source.width, containerSize / source.height);
  const windowSize = containerSize / (coverScale * userScale);
  const clamped = clampCropCenter(center, source.width, source.height, containerSize, userScale);
  ctx.clearRect(0, 0, outputSize, outputSize);
  ctx.drawImage(
    source,
    clamped.x - windowSize / 2,
    clamped.y - windowSize / 2,
    windowSize,
    windowSize,
    0,
    0,
    outputSize,
    outputSize,
  );
}

export default function PhotoUploadScreen() {
  const router = useRouter();
  const session = useMobileSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cutoutImgRef = useRef<HTMLImageElement | null>(null);
  const backgroundImgsRef = useRef<Record<BackgroundStyleId, HTMLImageElement> | null>(null);
  const cropSourceRef = useRef<ImageBitmap | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const cropPinchStartDistRef = useRef<number | null>(null);
  const cropPinchStartZoomRef = useRef<number>(1);

  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<BackgroundStyleId>(BACKGROUND_STYLES[0].id);
  const [remaining, setRemaining] = useState<number>(session.profilePhotoGenerationsRemaining);
  const [cropCenter, setCropCenter] = useState<CropCenter | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropContainerSize, setCropContainerSize] = useState(280);

  const releaseCropSource = () => {
    cropSourceRef.current?.close();
    cropSourceRef.current = null;
  };

  // Stop the camera and release the decoded gallery-photo bitmap on
  // unmount, whatever stage we're in — this codebase has no prior
  // getUserMedia usage, so there's no existing pattern to copy correctness
  // from; a leaked camera stream is a real privacy issue, not just a
  // resource leak, and an unclosed ImageBitmap holds onto decoded pixel
  // data until GC gets around to it.
  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
      releaseCropSource();
    };
  }, []);

  // Measures the actual rendered size of the crop box (it's CSS-responsive
  // — up to 280px, less on narrow phones) so the pinch/drag math below
  // operates in real on-screen pixels, not an assumed constant. A layout
  // effect, not a regular one, so the very first crop-window draw already
  // uses the real size instead of flashing the 280px default first.
  useLayoutEffect(() => {
    if (stage !== "cropping") return;
    const el = cropContainerRef.current;
    if (!el) return;
    const update = () => setCropContainerSize(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stage]);

  // Same class of timing bug fixed above for the composite canvas — redraw
  // synchronously after commit, keyed on every value the crop window
  // depends on, rather than firing once from inside an event handler.
  useLayoutEffect(() => {
    const canvas = cropCanvasRef.current;
    const source = cropSourceRef.current;
    if (stage !== "cropping" || !canvas || !source || !cropCenter) return;
    const dpr = window.devicePixelRatio || 1;
    drawCropWindow(canvas, source, cropContainerSize, cropZoom, cropCenter, Math.round(cropContainerSize * dpr));
  }, [stage, cropContainerSize, cropZoom, cropCenter]);

  const stopCamera = () => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const redrawComposite = (styleId: BackgroundStyleId) => {
    const canvas = canvasRef.current;
    const cutout = cutoutImgRef.current;
    const background = backgroundImgsRef.current?.[styleId];
    if (!canvas || !cutout || !background) return;
    drawComposite(canvas, background, cutout);
  };

  // Redraw whenever the composite becomes visible or the chosen background
  // changes. Not folded into removeBackground/handleSelectStyle directly —
  // a canvas ref attached via a rAF callback scheduled from an async
  // (post-fetch) continuation isn't reliably ready by the time that
  // callback runs, since React's commit for a state update made outside a
  // synchronous event handler isn't guaranteed to land before the next
  // animation frame. That produced a real bug: the first composite render
  // came up blank until some other state change (e.g. tapping a swatch)
  // forced a second draw. A layout effect keyed on [stage, selectedStyle]
  // runs synchronously right after React commits the DOM, so the <canvas>
  // is guaranteed to exist by the time this fires.
  useLayoutEffect(() => {
    if (stage === "previewingComposite" || stage === "saving") {
      redrawComposite(selectedStyle);
    }
  }, [stage, selectedStyle]);

  // Same class of bug, same fix, for the live-camera <video> element.
  useLayoutEffect(() => {
    if (stage === "capturing" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [stage]);

  const removeBackground = async (selfieDataUrl: string) => {
    setStage("removingBackground");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/profile-photo/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ image: selfieDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        const message = data.error || "Couldn't process your photo.";
        throw new Error(data.detail ? `${message} (${data.detail})` : message);
      }

      const [cutoutImg, ...backgroundImgs] = await Promise.all([
        loadImageFromUrl(data.cutout),
        ...BACKGROUND_STYLES.map((s) => loadImageFromUrl(s.src)),
      ]);

      cutoutImgRef.current = cutoutImg;
      backgroundImgsRef.current = BACKGROUND_STYLES.reduce((acc, s, i) => {
        acc[s.id] = backgroundImgs[i];
        return acc;
      }, {} as Record<BackgroundStyleId, HTMLImageElement>);

      if (typeof data.remaining === "number") setRemaining(data.remaining);
      setStage("previewingComposite");
    } catch (err) {
      setStage("idle");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't process your photo. Please try again.");
    }
  };

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setStage("capturing");
    } catch {
      setErrorMsg("Couldn't access your camera. You can choose a photo from your gallery instead.");
    }
  };

  const handleShutter = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    // Mirrored to match the preview, so the saved photo is what was framed.
    const dataUrl = cropToSquareDataUrl(video, video.videoWidth, video.videoHeight, true);
    stopCamera();
    void removeBackground(dataUrl);
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file.");
      return;
    }
    try {
      setErrorMsg(null);
      // createImageBitmap with imageOrientation: "from-image" applies EXIF
      // rotation before any canvas draw — canvas drawImage() ignores EXIF
      // metadata entirely, and many iOS/Android photos are stored sideways
      // relying on that metadata to display upright. Do not swap this back
      // for a plain FileReader-to-<img> decode.
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      // Unlike the live-camera path (already framed via the oval overlay
      // before the shot is taken), a gallery photo could be framed any way
      // — keep the decoded bitmap around and let the user pinch/drag it
      // into position themselves instead of silently processing whatever a
      // blind center-crop landed on.
      cropSourceRef.current = bitmap;
      setCropZoom(1);
      setCropCenter({ x: bitmap.width / 2, y: bitmap.height / 2 });
      setStage("cropping");
    } catch {
      setErrorMsg("Couldn't read that photo. Please try another.");
    }
  };

  const handleCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    cropPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (cropPointersRef.current.size === 2) {
      const [a, b] = Array.from(cropPointersRef.current.values());
      cropPinchStartDistRef.current = Math.hypot(a.x - b.x, a.y - b.y);
      cropPinchStartZoomRef.current = cropZoom;
    }
  };

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const source = cropSourceRef.current;
    const prev = cropPointersRef.current.get(e.pointerId);
    if (!source || !prev) return;

    if (cropPointersRef.current.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      cropPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const coverScale = Math.max(cropContainerSize / source.width, cropContainerSize / source.height);
      const totalScale = coverScale * cropZoom;
      // Content follows the finger (standard photo-crop UX): dragging right
      // reveals content that was further left in the source image.
      setCropCenter((c) =>
        c
          ? clampCropCenter(
              { x: c.x - dx / totalScale, y: c.y - dy / totalScale },
              source.width,
              source.height,
              cropContainerSize,
              cropZoom,
            )
          : c,
      );
    } else if (cropPointersRef.current.size === 2) {
      cropPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = Array.from(cropPointersRef.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (cropPinchStartDistRef.current) {
        const nextZoom = clampNumber(
          cropPinchStartZoomRef.current * (dist / cropPinchStartDistRef.current),
          CROP_MIN_ZOOM,
          CROP_MAX_ZOOM,
        );
        setCropZoom(nextZoom);
        setCropCenter((c) =>
          c ? clampCropCenter(c, source.width, source.height, cropContainerSize, nextZoom) : c,
        );
      }
    }
  };

  const handleCropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    cropPointersRef.current.delete(e.pointerId);
    if (cropPointersRef.current.size < 2) cropPinchStartDistRef.current = null;
  };

  const handleCropZoomBy = (delta: number) => {
    const source = cropSourceRef.current;
    if (!source || !cropCenter) return;
    const nextZoom = clampNumber(cropZoom + delta, CROP_MIN_ZOOM, CROP_MAX_ZOOM);
    setCropZoom(nextZoom);
    setCropCenter(clampCropCenter(cropCenter, source.width, source.height, cropContainerSize, nextZoom));
  };

  const handleConfirmCrop = () => {
    const source = cropSourceRef.current;
    if (!source || !cropCenter) return;
    const canvas = document.createElement("canvas");
    drawCropWindow(canvas, source, cropContainerSize, cropZoom, cropCenter, COMPOSITE_SIZE);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    releaseCropSource();
    setCropCenter(null);
    void removeBackground(dataUrl);
  };

  const handleChooseDifferentPhoto = () => {
    releaseCropSource();
    setCropCenter(null);
    setCropZoom(1);
    setStage("idle");
  };

  const handleSelectStyle = (styleId: BackgroundStyleId) => {
    setSelectedStyle(styleId);
  };

  const handleRetake = () => {
    cutoutImgRef.current = null;
    backgroundImgsRef.current = null;
    releaseCropSource();
    setCropCenter(null);
    setCropZoom(1);
    setErrorMsg(null);
    setStage("idle");
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setStage("saving");
    setErrorMsg(null);
    try {
      const blob = await exportCompositeBlob(canvas);
      const dataUrl = await blobToDataUrl(blob);
      const res = await fetch("/api/profile-photo/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save your photo.");

      // Put the new photo into the shared session first so Home and Me
      // show it the moment they render. router.refresh() then re-seeds the
      // server layout in the background.
      if (typeof data.url === "string") session.setProfilePhotoUrl(data.url);
      router.refresh();
      router.push("/mobile/progress");
    } catch (err) {
      setStage("previewingComposite");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't save your photo. Please try again.");
    }
  };

  const handleBack = () => {
    if (stage === "capturing") {
      stopCamera();
      setStage("idle");
      return;
    }
    if (stage === "cropping") {
      handleChooseDifferentPhoto();
      return;
    }
    router.back();
  };

  const isBusy = stage === "removingBackground" || stage === "saving";

  const hint =
    stage === "previewingComposite" || stage === "saving"
      ? "Pick a background. You can switch any time before saving."
      : stage === "cropping"
        ? "Crop to head and shoulders, with your face in the middle."
        : stage === "capturing"
          ? "Fit your face inside the oval."
          : "Take a photo or choose one from your photos.";

  return (
    <Screen title="Profile photo" back={{ href: "/mobile/progress", label: "Back", onClick: handleBack }}>
      <div className="sm-photoedit">
        <p className="sm-photoedit-hint">{hint}</p>

        {errorMsg && (
          <p className="sm-photoedit-error" role="alert">
            {errorMsg}
          </p>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGallerySelect} hidden />

        {stage === "idle" && (
          <>
            <div className="sm-photoedit-current">
              {session.profilePhotoUrl ? (
                <Image src={session.profilePhotoUrl} alt="Your profile photo now" fill style={{ objectFit: "cover" }} unoptimized />
              ) : (
                <Camera size={40} strokeWidth={1.8} aria-hidden="true" />
              )}
            </div>
            <div className="sm-photoedit-actions">
              <button type="button" className="sm-btn sm-btn--primary" onClick={startCamera} disabled={remaining <= 0}>
                <Camera size={18} strokeWidth={2.4} aria-hidden="true" />
                Take photo
              </button>
              <button type="button" className="sm-btn sm-btn--secondary" onClick={() => fileInputRef.current?.click()} disabled={remaining <= 0}>
                <GalleryIcon size={18} strokeWidth={2.4} aria-hidden="true" />
                Library
              </button>
            </div>
            <p className="sm-photoedit-note">
              {remaining <= 0 ? "No photo edits left today" : `${remaining} photo edit${remaining === 1 ? "" : "s"} left today`}
            </p>
          </>
        )}

        {stage === "cropping" && (
          <>
            <div
              ref={cropContainerRef}
              className="sm-photoedit-frame sm-photoedit-crop"
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerCancel={handleCropPointerUp}
            >
              <canvas ref={cropCanvasRef} />
              <div className="sm-photoedit-zoom">
                <button type="button" aria-label="Zoom in" onClick={() => handleCropZoomBy(0.25)}>
                  <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Zoom out" onClick={() => handleCropZoomBy(-0.25)}>
                  <Minus size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="sm-photoedit-note">Pinch to zoom, drag to move it.</p>
            <div className="sm-photoedit-actions">
              <button type="button" className="sm-btn sm-btn--secondary" onClick={handleChooseDifferentPhoto}>
                Choose another
              </button>
              <button type="button" className="sm-btn sm-btn--primary" onClick={handleConfirmCrop}>
                Looks good
              </button>
            </div>
          </>
        )}

        {stage === "capturing" && (
          <>
            <div className="sm-photoedit-frame sm-photoedit-camera">
              {/* Mirrored like a phone's own selfie camera: moving left
                  moves the picture left. handleShutter mirrors the capture
                  to match. */}
              <video ref={videoRef} autoPlay playsInline muted />
              {/* Face guide: an oval about 1 : 1.3, everything outside it dimmed. */}
              <div className="sm-photoedit-oval" aria-hidden="true" />
            </div>
            <button type="button" aria-label="Take photo" className="sm-photoedit-shutter" onClick={handleShutter} />
          </>
        )}

        {stage === "removingBackground" && (
          <div className="sm-photoedit-wait" role="status">
            <Loader2 size={28} className="mobile-spin" aria-hidden="true" />
            Removing the background
          </div>
        )}

        {(stage === "previewingComposite" || stage === "saving") && (
          <>
            <div className="sm-photoedit-frame">
              <canvas ref={canvasRef} />
            </div>
            <div className="sm-photoedit-styles" role="radiogroup" aria-label="Background">
              {BACKGROUND_STYLES.map((style) => {
                const isSelected = style.id === selectedStyle;
                return (
                  <button
                    key={style.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isBusy}
                    className="sm-photoedit-style"
                    onClick={() => handleSelectStyle(style.id)}
                  >
                    <span className="sm-photoedit-swatch">
                      <Image src={style.src} alt="" fill style={{ objectFit: "cover" }} />
                    </span>
                    {style.label}
                  </button>
                );
              })}
            </div>
            <div className="sm-photoedit-actions">
              <button type="button" className="sm-btn sm-btn--secondary" onClick={handleRetake} disabled={stage === "saving"}>
                <RotateCcw size={18} strokeWidth={2.4} aria-hidden="true" />
                Retake
              </button>
              <button type="button" className="sm-btn sm-btn--primary" onClick={handleSave} disabled={stage === "saving"}>
                {stage === "saving" ? "Saving…" : "Save photo"}
              </button>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
