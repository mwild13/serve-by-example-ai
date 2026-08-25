import LearnHubScreen from "../_components/LearnHubScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Hub | Serve By Example",
  description: "Browse training modules and scenario practice.",
  robots: { index: false, follow: false },
};

// Phase B preview route — renders the dumb-UI skeleton so it can be viewed at
// /mobile/learn. No auth/data wiring yet.
export default function MobileLearnPage() {
  return <LearnHubScreen />;
}
