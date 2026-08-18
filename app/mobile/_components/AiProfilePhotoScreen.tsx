"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Award, Loader2 } from "lucide-react";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";

// Phase C file 08, Half B — real generation via app/api/profile-photo/generate
// (Fal.ai flux/schnell) and app/api/profile-photo/save. Prompts moved
// server-side (see the API route) — this list only needs id/label/thumbnail
// for the UI and to select a style server-side. See
// v4-migration-plan/08-onboarding-diagnostic-and-profile.md.

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

export default function AiProfilePhotoScreen() {
  const router = useRouter();
  const session = useMobileSession();
  const { status, data } = useTrainingProgress();
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES[0]);
  const [avatarUrl, setAvatarUrl] = useState<string>(PLACEHOLDER_AVATAR);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasGenerated = avatarUrl !== PLACEHOLDER_AVATAR;

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
        body: JSON.stringify({ styleId: selectedStyle.id }),
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
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
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
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>Snap a selfie, pick your look</p>
        </div>

        {/* preview-container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 210,
              height: 210,
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
          </div>
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

        {/* tagline-row */}
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 24px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <Award size={14} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-mobile-muted)" }}>
              Helps managers put a face to the team
            </span>
          </div>
        </div>
      </div>

      {/* footer-dock */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "20px 24px",
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