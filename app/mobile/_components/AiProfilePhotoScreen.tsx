"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Award } from "lucide-react";

// Phase B.5 — back button routes via router.back(); style chips hold local
// selection state; "Skip for now" and "Save Portrait" both route to Home
// (actual image generation is net-new Phase C work — see
// v4-migration-plan/08). "Retake Selfie" stays inert — no camera flow exists.

type StyleOption = { label: string; image: string };

const STYLES: StyleOption[] = [
  { label: "Classic Bar", image: "/mobile/ai-style-classic-bar.png" },
  { label: "Fine Dining", image: "/mobile/ai-style-fine-dining.png" },
  { label: "Cocktail Lounge", image: "/mobile/ai-style-cocktail-lounge.png" },
  { label: "Hotel Lobby", image: "/mobile/ai-style-hotel-lobby.png" },
  { label: "Rooftop Bar", image: "/mobile/ai-style-rooftop-bar.png" },
  { label: "Wine Cellar", image: "/mobile/ai-style-wine-cellar.png" },
  { label: "Coffee House", image: "/mobile/ai-style-coffee-house.png" },
  { label: "Beach Club", image: "/mobile/ai-style-beach-club.png" },
  { label: "Speakeasy", image: "/mobile/ai-style-speakeasy.png" },
  { label: "Corporate", image: "/mobile/ai-style-corporate.png" },
];

export default function AiProfilePhotoScreen() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState("Classic Bar");

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
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mobile)" }}>12 Days</span>
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
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
              <Image src="/mobile/ai-portrait-main.png" alt="" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
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
            const isSelected = style.label === selectedStyle;
            return (
              <button
                key={style.label}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedStyle(style.label)}
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
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: "var(--radius-pill)",
              background: "none",
              border: "1px solid var(--border-mobile)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-mobile)" }}>Retake Selfie</span>
          </button>
          <Link
            href="/mobile/home"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 0",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile)",
              border: "none",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>Save Portrait</span>
          </Link>
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
