import PractiseScreen from "../_components/PractiseScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practise | Serve By Example",
  description: "The mixed drill, Live Guest, Saturday Rush and the challenges.",
  robots: { index: false, follow: false },
};

export default function MobilePractisePage() {
  return <PractiseScreen />;
}
