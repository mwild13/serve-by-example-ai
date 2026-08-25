import { Suspense } from "react";
import ArenaScreen from "../_components/ArenaScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Arena | Serve By Example",
  description: "Live AI-scored roleplay evaluation for hospitality service scenarios.",
  robots: { index: false, follow: false },
};

// Phase C file 04 — ArenaScreen reads scenario payload via useSearchParams(),
// which Next.js requires to be wrapped in Suspense.
export default function MobileArenaPage() {
  return (
    <Suspense fallback={null}>
      <ArenaScreen />
    </Suspense>
  );
}
