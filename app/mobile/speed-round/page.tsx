import MultipleChoiceScreen from "../_components/MultipleChoiceScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speed Round | Serve By Example",
  description: "Multiple-choice speed round challenge.",
  robots: { index: false, follow: false },
};

// Phase C file 05 (remaining games) — "Speed Round" / Multiple Choice,
// challengeIndex 4. Reached from ChallengesScreen's "Speed Round" row.
export default function MobileSpeedRoundPage() {
  return <MultipleChoiceScreen />;
}
