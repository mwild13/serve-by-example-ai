"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Image as GalleryIcon, Loader2, RotateCcw } from "lucide-react";
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

type Stage = "idle" | "capturing" | "removingBackground" | "previewingComposite" | "saving";

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

export default function PhotoUploadScreen() {
  const router = useRouter();
  const session = useMobileSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cutoutImgRef = useRef<HTMLImageElement | null>(null);
  const backgroundImgsRef = useRef<Record<BackgroundStyleId, HTMLImageElement> | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<BackgroundStyleId>(BACKGROUND_STYLES[0].id);
  const [remaining, setRemaining] = useState<number>(session.profilePhotoGenerationsRemaining);

  // Stop the camera on unmount, whatever stage we're in — this codebase has
  // no prior getUserMedia usage, so there's no existing pattern to copy
  // correctness from; a leaked camera stream is a real privacy issue, not
  // just a resource leak.
  useEffect(() => {
    return () => stopStream(streamRef.current);
  }, []);

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
      // The <canvas> isn't mounted until the previewingComposite branch
      // renders — draw on the next frame once the ref is attached.
      requestAnimationFrame(() => redrawComposite(selectedStyle));
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
      // The <video> isn't mounted until the "capturing" branch renders.
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
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
      const dataUrl = cropToSquareDataUrl(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      void removeBackground(dataUrl);
    } catch {
      setErrorMsg("Couldn't read that photo. Please try another.");
    }
  };

  const handleSelectStyle = (styleId: BackgroundStyleId) => {
    setSelectedStyle(styleId);
    redrawComposite(styleId);
  };

  const handleRetake = () => {
    cutoutImgRef.current = null;
    backgroundImgsRef.current = null;
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

      {(stage === "previewingComposite" || stage === "saving") && (
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
