import { Suspense } from "react";
import QuizScreen from "../_components/QuizScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz | Serve By Example",
  description: "Rapid-fire true/false training quiz.",
  robots: { index: false, follow: false },
};

// Phase 3 (v4-migration-plan/00, item 6) — QuizScreen reads its scenario
// payload via useSearchParams(), which Next.js requires to be wrapped in
// Suspense (same pattern as app/mobile/arena/page.tsx).
export default function MobileQuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizScreen />
    </Suspense>
  );
}
