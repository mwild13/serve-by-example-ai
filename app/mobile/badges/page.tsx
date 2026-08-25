import BadgesGalleryScreen from "../_components/BadgesGalleryScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badges | Serve By Example",
  description: "Your earned achievement badges and mastery milestones.",
  robots: { index: false, follow: false },
};

// Phase C file 07 — real badge data via computeBadges(). Reachable from
// HomeScreen's Quick Access row ("Achievements" tile) as well as directly
// at /mobile/badges.
export default function MobileBadgesPage() {
  return <BadgesGalleryScreen />;
}
