import OnboardingDiagnosticScreen from "../_components/OnboardingDiagnosticScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Check | Serve By Example",
  description: "Take the skill check.",
  robots: { index: false, follow: false },
};

// Phase C file 08 Half A — real placement-check diagnostic via
// app/api/training/diagnostic/start + .../submit. Retake-only entry point,
// reachable from ProgressScreen's "Retake placement assessment" link (see
// docs/zHistorical/v4-migration-plan/08's Implementation Notes for why first-time onboarding
// still redirects to desktop's /onboarding instead of here).
export default function MobileOnboardingPage() {
  return <OnboardingDiagnosticScreen />;
}
