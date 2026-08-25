import OnboardingDiagnosticScreen from "../_components/OnboardingDiagnosticScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placement Assessment | Serve By Example",
  description: "Retake your onboarding placement assessment.",
  robots: { index: false, follow: false },
};

// Phase C file 08 Half A — real 10-question diagnostic via
// app/api/training/diagnostic/start + .../submit. Retake-only entry point,
// reachable from ProgressScreen's "Retake placement assessment" link (see
// v4-migration-plan/08's Implementation Notes for why first-time onboarding
// still redirects to desktop's /onboarding instead of here).
export default function MobileOnboardingPage() {
  return <OnboardingDiagnosticScreen />;
}
