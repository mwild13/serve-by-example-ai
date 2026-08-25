import ChallengesScreen from "../_components/ChallengesScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges | Serve By Example",
  description: "Interactive tap-based mini-games for hospitality skills practice.",
  robots: { index: false, follow: false },
};

// Phase B preview route — renders the dumb-UI skeleton so it can be viewed at
// /mobile/challenges. No auth/data wiring yet.
export default function MobileChallengesPage() {
  return <ChallengesScreen />;
}
