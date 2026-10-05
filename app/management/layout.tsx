import type { ReactNode } from "react";
import localFont from "next/font/local";

// Scoped to /management only — the Mission Control redesign (Figma: Venue
// Manager Dashboard) uses a 3-font system: Lora for section headings/page
// titles/KPI numbers, Outfit as the base body font, and DM Mono for
// metadata/status pills/sidebar category headers/chart labels — distinct
// from the marketing site's Fraunces/Manrope pair. Loading the fonts here
// (rather than in the root layout) keeps that typographic choice contained
// to the manager console instead of bleeding into the staff dashboard or
// marketing pages. See app/globals.css "Mission Control — Terracotta
// Console Theme" section for how these variables are consumed.
//
// Self-hosted, not next/font/google (2026-10-05): the Cloudflare build kept
// failing on next/font/google's build-time fetch of Outfit ("Cannot read
// properties of null (reading '1')" in its loader), the same failure that
// moved the root layout's fonts to local files (see app/layout.tsx). These
// are the latin-subset files Google's CSS served for the weights below.
// Lora and Outfit ship as variable fonts, so one file per style covers
// every weight; DM Mono is static, so one file per weight.
const lora = localFont({
  src: [
    { path: "../fonts/lora-latin-variable.woff2", weight: "400 600", style: "normal" },
    { path: "../fonts/lora-italic-latin-variable.woff2", weight: "400 600", style: "italic" },
  ],
  display: "swap",
  variable: "--font-lora",
});

const outfit = localFont({
  src: "../fonts/outfit-latin-variable.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-outfit",
});

const dmMono = localFont({
  src: [
    { path: "../fonts/dm-mono-latin-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/dm-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/dm-mono-latin-500.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--font-dm-mono",
});

export default function ManagementLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${lora.variable} ${outfit.variable} ${dmMono.variable}`} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
