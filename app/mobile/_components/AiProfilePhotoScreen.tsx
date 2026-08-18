"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Loader2, Camera, X } from "lucide-react";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";

// Phase C file 08, Half B — real generation via app/api/profile-photo/generate
// (Fal.ai flux/schnell) and app/api/profile-photo/save. Prompts moved
// server-side (see the API route) — this list only needs id/label/thumbnail
// for the UI and to select a style server-side. See
// v4-migration-plan/08-onboarding-diagnostic-and-profile.md.
//
// Live-QA fix (2026-08-19): reported "No place to take photo on ai photo
// page." True at the time — generation was text-to-image only (a style
// prompt, no reference to the user at all), so a camera control would have
// had nothing to feed. Closed 2026-08-19: capture/upload now feeds a real
// selfie into the generate call as an image-to-image reference (see the
// route's comment for the fal-ai/flux/dev/image-to-image switch). The raw
// selfie itself is never persisted anywhere in Supabase — it's downscaled
// client-side, sent once to the generate route, and only the AI-generated
// result (a fal.media URL) is ever eligible to be saved as
// profiles.profile_photo_url (see app/api/profile-photo/save/route.ts's
// isAllowedFalUrl check, unchanged by this feature).

type StyleOption = { id: string; label: string; image: string };

const STYLES: StyleOption[] = [
  { id: "classic-bar", label: "Classic Bar", image: "/mobile/ai-style-classic-bar.png" },
  { id: "fine-dining", label: "Fine Dining", image: "/mobile/ai-style-fine-dining.png" },
  { id: "cocktail-lounge", label: "Cocktail Lounge", image: "/mobile/ai-style-cocktail-lounge.png" },
  { id: "hotel-lobby", label: "Hotel Lobby", image: "/mobile/ai-style-hotel-lobby.png" },
  { id: "rooftop-bar", label: "Rooftop Bar", image: "/mobile/ai-style-rooftop-bar.png" },
  { id: "wine-cellar", label: "Wine Cellar", image: "/mobile/ai-style-wine-cellar.png" },
  { id: "coffee-house", label: "Coffee House", image: "/mobile/ai-style-coffee-house.png" },
  { id: "beach-club", label: "Beach Club", image: "/mobile/ai-style-beach-club.png" },
  { id: "speakeasy", label: "Speakeasy", image: "/mobile/ai-style-speakeasy.png" },
  { id: "corporate", label: "Corporate", image: "/mobile/ai-style-corporate.png" },
];

const PLACEHOLDER_AVATAR = "/mobile/ai-portrait-main.png";

// Downscales a captured/selected photo client-side before it ever leaves the
// device — a phone camera photo can be several MB; the model only needs a
// modest reference image, and keeping the request small matters more here
// than on a text-only prompt. Caps the longest edge at 768px, re-encodes as
// JPEG at 0.85 quality.
async function downscaleImage(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read the photo."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Couldn't read the photo."));
    el.src = dataUrl;
  });

  const maxEdge = 768;
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function AiProfilePhotoScreen() {
  const router = useRouter();
  const session = useMobileSession();
  const { status, data } = useTrainingProgress();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES[0]);
  const [avatarUrl, setAvatarUrl] = useState<string>(PLACEHOLDER_AVATAR);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasGenerated = avatarUrl !== PLACEHOLDER_AVATAR;

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file.");
      return;
    }
    try {
      setErrorMsg(null);
      setSelfieDataUrl(await downscaleImage(file));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't read the photo.");
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profile-photo/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          styleId: selectedStyle.id,
          ...(selfieDataUrl ? { selfieImage: selfieDataUrl } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to generate photo");
      }

      setAvatarUrl(data.url);
    } catch (err) {
      console.error("Failed to generate avatar:", err);
      setErrorMsg(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasGenerated) {
      router.push("/mobile/home");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profile-photo/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ url: avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save portrait");
      }

      router.push("/mobile/home");
    } catch (err) {
      console.error("Failed to save avatar:", err);
      setErrorMsg(err instanceof Error ? err.message : "Couldn't save your portrait. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <button
            type="button"
            aria-label="Back"
            onClick={() => router.back()}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--green-mobile-bg)",
            }}
          >
            <Zap size={12} strokeWidth={2} color="var(--text-mobile)" fill="var(--text-mobile)" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mobile)" }}>
              {status === "ready" ? `${data.bestCorrectStreak} Streak` : "—"}
            </span>
          </div>
        </div>

        {/* prompt-header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 24px 0" }}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Your AI Portrait</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
            {selfieDataUrl
              ? "Pick a style — we'll generate a portrait using your photo"
              : "Take a photo or pick a style, we'll generate your portrait"}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoSelected}
          style={{ display: "none" }}
        />

        {/* preview-container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 176,
              height: 176,
              padding: 4,
              borderRadius: "var(--radius-pill)",
              border: "2px solid var(--gold-mobile)",
              boxShadow: "0px 8px 24px 0px rgba(242, 175, 52, 0.2)",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
              <Image src={avatarUrl} alt="AI Portrait Preview" fill style={{ objectFit: "cover" }} unoptimized={avatarUrl.startsWith("http")} />
              {isLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.65)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Loader2 size={28} className="mobile-spin" color="var(--gold-mobile)" />
                  <span style={{ fontSize: 12, color: "var(--text-mobile)", fontWeight: 600 }}>Generating...</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={selfieDataUrl ? "Retake photo" : "Take or upload a photo"}
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "2px solid var(--bg-mobile-dark)",
                cursor: "pointer",
              }}
            >
              <Camera size={16} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
            </button>
          </div>

          {selfieDataUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <div style={{ position: "relative", width: 28, height: 28, borderRadius: "var(--radius-pill)", overflow: "hidden", border: "1px solid var(--border-mobile)" }}>
                <Image src={selfieDataUrl} alt="Your photo" fill style={{ objectFit: "cover" }} unoptimized />
              </div>
              <span style={{ fontSize: 12, color: "var(--text-mobile-muted)" }}>Your photo will guide the AI portrait</span>
              <button
                type="button"
                onClick={() => setSelfieDataUrl(null)}
                aria-label="Remove photo"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={12} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
              </button>
            </div>
          )}

          {errorMsg && (
            <p style={{ margin: "8px 24px 0", fontSize: 12, color: "var(--red-mobile)", textAlign: "center" }}>
              {errorMsg}
            </p>
          )}
        </div>

        {/* category-label */}
        <div style={{ padding: "0 24px" }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)", textTransform: "uppercase" }}>
            Hospitality Styles
          </p>
        </div>

        {/* styles-scroller */}
        <div style={{ display: "flex", gap: 12, padding: "0 24px", overflowX: "auto" }}>
          {STYLES.map((style) => {
            const isSelected = style.label === selectedStyle.label;
            return (
              <button
                key={style.label}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedStyle(style)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  width: 76,
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    padding: 3,
                    borderRadius: "var(--radius-pill)",
                    border: isSelected ? "2px solid var(--gold-mobile)" : "1px solid var(--border-mobile)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
                    <Image src={style.image} alt="" fill style={{ objectFit: "cover" }} />
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--gold-mobile)" : "var(--text-mobile-muted)",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {style.label}
                </p>
              </button>
            );
          })}
        </div>

      </div>

      {/* footer-dock */}
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
            onClick={handleGenerate}
            disabled={isLoading}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 0",
              borderRadius: "var(--radius-pill)",
              background: "none",
              border: "1px solid var(--border-mobile)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-mobile)" }}>
              {isLoading ? "Generating..." : "Generate Portrait"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 0",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile)",
              border: "none",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>
              {isSaving ? "Saving..." : "Save Portrait"}
            </span>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
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
          <div style={{ width: 120, height: 5, borderRadius: 10, background: "var(--text-mobile-faint)" }} />
        </div>
      </div>
    </div>
  );
}