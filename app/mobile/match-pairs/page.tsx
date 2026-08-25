import MatchPairsScreen from "../_components/MatchPairsScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Pairs | Serve By Example",
  description: "Match Pairs challenge — hospitality knowledge mini-game.",
  robots: { index: false, follow: false },
};

// Phase B preview route — renders the dumb-UI skeleton so it can be viewed at
// /mobile/match-pairs. No auth/data wiring yet.
export default function MobileMatchPairsPage() {
  return <MatchPairsScreen />;
}
