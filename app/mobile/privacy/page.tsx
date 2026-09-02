import PrivacyScreen from "../_components/PrivacyScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Serve By Example",
  description: "How Serve By Example collects, uses, and protects your personal data under the Australian Privacy Principles.",
  robots: { index: false, follow: false },
};

// Mobile bugfix pass (2026-09-02) — real in-app destination for Settings'
// "Privacy Policy" link, replacing the old redirect out to the public
// marketing /privacy page.
export default function MobilePrivacyPage() {
  return <PrivacyScreen />;
}
