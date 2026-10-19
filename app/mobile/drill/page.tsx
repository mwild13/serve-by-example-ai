import DrillScreen from "../_components/DrillScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mixed Drill | Serve By Example",
  description: "A quick mixed quiz across the modules you've started.",
  robots: { index: false, follow: false },
};

export default function MobileDrillPage() {
  return <DrillScreen />;
}
