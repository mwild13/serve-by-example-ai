import HelpScreen from "../_components/HelpScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQ | Serve By Example",
  description: "How the Serve By Example mobile app works.",
  robots: { index: false, follow: false },
};

// Mobile cleanup pass (2026-08-25) — real in-app destination for Settings'
// "Help & FAQ" link, replacing the old redirect out to /resources.
export default function MobileHelpPage() {
  return <HelpScreen />;
}
