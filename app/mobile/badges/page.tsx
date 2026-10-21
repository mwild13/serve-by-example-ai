import BadgesGalleryScreen from "../_components/BadgesGalleryScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badges | Serve By Example",
  description: "Your earned achievement badges and mastery milestones.",
  robots: { index: false, follow: false },
};

// Real badge data via badgesFromProgress() (lib/badges.ts). Reachable from
// Me and Home (the Badges row), as well as directly
// at /mobile/badges.
export default function MobileBadgesPage() {
  return <BadgesGalleryScreen />;
}
