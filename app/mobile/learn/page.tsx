import LearnScreen from "../_components/LearnScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | Serve By Example",
  description: "Your training modules, from foundations to advanced.",
  robots: { index: false, follow: false },
};

export default function MobileLearnPage() {
  return <LearnScreen />;
}
