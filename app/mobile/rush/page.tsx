import RushScreen from "../_components/RushScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saturday Rush | Serve By Example",
  description: "A Saturday night shift against the clock.",
  robots: { index: false, follow: false },
};

export default function MobileRushPage() {
  return <RushScreen />;
}
