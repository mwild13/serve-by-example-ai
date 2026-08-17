import type { ReactNode } from "react";
import { Lora, Outfit, DM_Mono } from "next/font/google";

// Scoped to /management only — the Mission Control redesign (Figma: Venue
// Manager Dashboard) uses a 3-font system: Lora for section headings/page
// titles/KPI numbers, Outfit as the base body font, and DM Mono for
// metadata/status pills/sidebar category headers/chart labels — distinct
// from the marketing site's Fraunces/Manrope pair. Loading the fonts here
// (rather than in the root layout) keeps that typographic choice contained
// to the manager console instead of bleeding into the staff dashboard or
// marketing pages. See app/globals.css "Mission Control — Terracotta
// Console Theme" section for how these variables are consumed.
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-outfit",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
