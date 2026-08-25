import HomeScreen from "../_components/HomeScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Serve By Example",
  description: "Your daily training dashboard and recommended next steps.",
  robots: { index: false, follow: false },
};

// Phase B preview route — renders the dumb-UI skeleton so it can be viewed at
// /mobile/home. No auth/data wiring yet.
export default function MobileHomePage() {
  return <HomeScreen />;
}
