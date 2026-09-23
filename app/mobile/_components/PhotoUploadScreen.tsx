"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Image as GalleryIcon, Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import MobileScreenShell from "./MobileScreenShell";
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

type Stage = "idle" | "cropping" | "capturing" | "removingBackground" | "previewingComposite" | "saving";

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

/** Center-square crop of any drawImage-able source, scaled to
 *  COMPOSITE_SIZE — the automatic 1:1 crop-lock shared by both the
 *  live-camera and gallery-upload paths. */
function cropToSquareDataUrl(source: CanvasImageSource, sourceWidth: number, sourceHeight: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = COMPOSITE_SIZE;
  canvas.height = COMPOSITE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const side = Math.min(sourceWidth, sourceHeight);
  const sx = (sourceWidth - side) / 2;
  const sy = (sourceHeight - side) / 2;
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
    const dataUrl = cropToSquareDataUrl(video, video.videoWidth, video.videoHeight);
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

      // profilePhotoUrl is seeded once by the shared server layout into
      // MobileSessionContext, which has no client setter for it —
      // router.refresh() forces that layout to re-fetch before navigating
      // so Home/Progress show the new photo immediately instead of after a
      // hard reload. Same fix the old screen's handleSave used.
      router.refresh();
      router.push("/mobile/home");
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

  return (
    <MobileScreenShell style={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <button
            type="button"
            aria-label="Back"
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 24px 0" }}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Your Profile Photo</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
            {stage === "previewingComposite" || stage === "saving"
              ? "Pick a background — you can switch anytime before saving"
              : stage === "cropping"
                ? "Crop to head and shoulders, with your face centered"
                : "Take a photo or choose one from your gallery"}
          </p>
        </div>

        {errorMsg && (
          <p style={{ margin: "0 24px", fontSize: 12, color: "var(--red-mobile)", textAlign: "center" }}>
            {errorMsg}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGallerySelect}
          style={{ display: "none" }}
        />

        {stage === "idle" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "8px 24px" }}>
            <div
              style={{
                width: 176,
                height: 176,
                borderRadius: "var(--radius-pill)",
                border: "2px solid var(--gold-mobile)",
                boxShadow: "0px 8px 24px 0px rgba(242, 175, 52, 0.2)",
                overflow: "hidden",
                position: "relative",
                background: "var(--surface-mobile)",
              }}
            >
              {session.profilePhotoUrl && (
                <Image src={session.profilePhotoUrl} alt="Current profile photo" fill style={{ objectFit: "cover" }} unoptimized />
              )}
            </div>

            <div style={{ display: "flex", gap: 12, width: "100%" }}>
              <button
                type="button"
                onClick={startCamera}
                disabled={remaining <= 0}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 0",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gold-mobile)",
                  border: "none",
                  cursor: remaining <= 0 ? "not-allowed" : "pointer",
                  opacity: remaining <= 0 ? 0.6 : 1,
                }}
              >
                <Camera size={16} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>Take Photo</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={remaining <= 0}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 0",
                  borderRadius: "var(--radius-pill)",
                  background: "none",
                  border: "1px solid var(--border-mobile)",
                  cursor: remaining <= 0 ? "not-allowed" : "pointer",
                  opacity: remaining <= 0 ? 0.6 : 1,
                }}
              >
                <GalleryIcon size={16} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-mobile)" }}>Gallery</span>
              </button>
            </div>

            <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
              {remaining <= 0 ? "No photo edits left today" : `${remaining} photo edit${remaining === 1 ? "" : "s"} left today`}
            </p>
          </div>
        )}

        {stage === "cropping" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "0 24px" }}>
            <div
              ref={cropContainerRef}
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerCancel={handleCropPointerUp}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 280,
                aspectRatio: "1 / 1",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "2px solid var(--gold-mobile)",
                background: "var(--bg-mobile-dark)",
                touchAction: "none",
                cursor: "grab",
              }}
            >
              <canvas ref={cropCanvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
              <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => handleCropZoomBy(0.25)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "var(--radius-pill)",
                    background: "rgba(11, 13, 22, 0.75)",
                    border: "1px solid var(--border-mobile)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => handleCropZoomBy(-0.25)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "var(--radius-pill)",
                    background: "rgba(11, 13, 22, 0.75)",
                    border: "1px solid var(--border-mobile)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Minus size={14} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />
                </button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)", textAlign: "center" }}>
              Pinch to zoom, drag to reposition.
            </p>
          </div>
        )}

        {stage === "capturing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px", gap: 16 }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-mobile-dark)" }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* Oval "spotlight" framing mask — a CSS box-shadow large
                  enough to blanket the rest of the frame, cut out by
                  border-radius, rather than a canvas/SVG mask layered on
                  top of a live <video>. */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  margin: "auto",
                  width: "68%",
                  height: "82%",
                  borderRadius: "50% / 60%",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                  border: "2px solid rgba(255,255,255,0.85)",
                  pointerEvents: "none",
                }}
              />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Align head and shoulders here</p>
            <button
              type="button"
              aria-label="Take photo"
              onClick={handleShutter}
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "4px solid var(--bg-mobile-dark)",
                boxShadow: "0 0 0 2px var(--gold-mobile)",
                cursor: "pointer",
              }}
            />
          </div>
        )}

        {stage === "removingBackground" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 12 }}>
            <Loader2 size={28} className="mobile-spin" color="var(--gold-mobile)" aria-hidden="true" />
            <span style={{ fontSize: 13, color: "var(--text-mobile-muted)" }}>Removing background...</span>
          </div>
        )}

        {(stage === "previewingComposite" || stage === "saving") && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "0 24px" }}>
            <div style={{ width: "100%", maxWidth: 280, aspectRatio: "1 / 1", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "2px solid var(--gold-mobile)" }}>
              <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
            </div>

            <div style={{ display: "flex", gap: 10, overflowX: "auto", width: "100%", padding: "2px 0" }}>
              {BACKGROUND_STYLES.map((style) => {
                const isSelected = style.id === selectedStyle;
                return (
                  <button
                    key={style.id}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={isBusy}
                    onClick={() => handleSelectStyle(style.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      width: 72,
                      flexShrink: 0,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: isBusy ? "not-allowed" : "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "var(--radius-md)",
                        border: isSelected ? "2px solid var(--gold-mobile)" : "1px solid var(--border-mobile)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Image src={style.src} alt="" fill style={{ objectFit: "cover" }} />
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 10,
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? "var(--gold-mobile)" : "var(--text-mobile-muted)",
                        textAlign: "center",
                      }}
                    >
                      {style.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(stage === "cropping" || stage === "previewingComposite" || stage === "saving") && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "14px 24px",
            background: "var(--surface-mobile)",
            borderTop: "1px solid var(--border-mobile)",
            borderTopLeftRadius: "var(--radius-xl)",
            borderTopRightRadius: "var(--radius-xl)",
          }}
        >
          {stage === "cropping" ? (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={handleChooseDifferentPhoto}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 0",
                  borderRadius: "var(--radius-pill)",
                  background: "none",
                  border: "1px solid var(--border-mobile)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-mobile)" }}>Choose Different Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 0",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gold-mobile)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>Looks Good</span>
              </button>
            </div>
          ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={handleRetake}
              disabled={stage === "saving"}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 0",
                borderRadius: "var(--radius-pill)",
                background: "none",
                border: "1px solid var(--border-mobile)",
                cursor: stage === "saving" ? "not-allowed" : "pointer",
                opacity: stage === "saving" ? 0.6 : 1,
              }}
            >
              <RotateCcw size={16} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-mobile)" }}>Retake</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={stage === "saving"}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 0",
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "none",
                cursor: stage === "saving" ? "not-allowed" : "pointer",
                opacity: stage === "saving" ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>
                {stage === "saving" ? "Saving..." : "Save Photo"}
              </span>
            </button>
          </div>
          )}
        </div>
      )}

      {stage === "idle" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "14px 24px" }}>
          <Link
            href="/mobile/home"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-mobile-muted)",
              textDecoration: "underline",
            }}
          >
            Skip for now
          </Link>
        </div>
      )}
    </MobileScreenShell>
  );
}
