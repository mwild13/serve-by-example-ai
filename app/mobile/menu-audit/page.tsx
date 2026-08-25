import SpotErrorScreen from "../_components/SpotErrorScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Audit | Serve By Example",
  description: "Spot-the-error challenge for menu and service accuracy.",
  robots: { index: false, follow: false },
};

// Phase C file 05 (remaining games) — "Menu Audit" / Spot the Error,
// challengeIndex 3. Reached from ChallengesScreen's "Menu Audit" row.
export default function MobileMenuAuditPage() {
  return <SpotErrorScreen />;
}
