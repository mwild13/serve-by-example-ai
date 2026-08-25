import { Suspense } from "react";
import ScenarioPracticeScreen from "../_components/ScenarioPracticeScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scenario Practice | Serve By Example",
  description: "Written scenario practice for real hospitality situations.",
  robots: { index: false, follow: false },
};

// Phase 3 (v4-migration-plan/00, item 7) — ScenarioPracticeScreen reads its
// module/index payload via useSearchParams(), which Next.js requires to be
// wrapped in Suspense (same pattern as app/mobile/arena/page.tsx).
export default function MobileScenarioPracticePage() {
  return (
    <Suspense fallback={null}>
      <ScenarioPracticeScreen />
    </Suspense>
  );
}
