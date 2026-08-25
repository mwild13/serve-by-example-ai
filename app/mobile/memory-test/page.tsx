import FillBlankScreen from "../_components/FillBlankScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Test | Serve By Example",
  description: "Fill-the-blank memory challenge for hospitality knowledge.",
  robots: { index: false, follow: false },
};

// Phase C file 05 (remaining games) — "Memory Test" / Fill the Blank,
// challengeIndex 1. Reached from ChallengesScreen's "Memory Test" row.
export default function MobileMemoryTestPage() {
  return <FillBlankScreen />;
}
