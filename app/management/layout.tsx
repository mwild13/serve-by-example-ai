import type { ReactNode } from "react";
import { Lora, DM_Mono } from "next/font/google";

// Scoped to /management only — the Mission Control redesign (Figma: Venue
// Manager Dashboard) uses Lora for headings and DM Mono for labels/data,
// distinct from the marketing site's Fraunces/Manrope pair. Loading the
// fonts here (rather than in the root layout) keeps that typographic choice
// contained to the manager console instead of bleeding into the staff
// dashboard or marketing pages. See app/globals.css "Mission Control —
// Terracotta Console Theme" section for how these variables are consumed.
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-mc-lora",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-mc-dm-mono",
});

export default function ManagementLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${lora.variable} ${dmMono.variable}`} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
