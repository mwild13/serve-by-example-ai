import TermsScreen from "../_components/TermsScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Serve By Example",
  description: "The terms and conditions governing your use of the Serve By Example platform.",
  robots: { index: false, follow: false },
};

// Mobile bugfix pass (2026-09-02) — real in-app destination for Settings'
// "Terms of Service" link, replacing the old redirect out to the public
// marketing /terms page.
export default function MobileTermsPage() {
  return <TermsScreen />;
}
