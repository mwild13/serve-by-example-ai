import SequenceSortScreen from "../_components/SequenceSortScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Order | Serve By Example",
  description: "Sequence-sort challenge for cocktail recipe steps.",
  robots: { index: false, follow: false },
};

// Phase C file 05 (remaining games) — "Recipe Order" / Sequence Sort,
// challengeIndex 0. Reached from ChallengesScreen's "Recipe Order" row.
export default function MobileRecipeOrderPage() {
  return <SequenceSortScreen />;
}
