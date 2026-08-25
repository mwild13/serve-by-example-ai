import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Serve By Example",
  description: "Complete your onboarding placement assessment.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
