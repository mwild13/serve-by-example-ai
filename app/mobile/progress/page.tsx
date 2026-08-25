import ProgressScreen from "../_components/ProgressScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Me | Serve By Example",
  description: "Your personal stats, mastery, and progress overview.",
  robots: { index: false, follow: false },
};

// Phase B preview route — renders the dumb-UI skeleton so it can be viewed at
// /mobile/progress. No auth/data wiring yet.
export default function MobileProgressPage() {
  return <ProgressScreen />;
}
