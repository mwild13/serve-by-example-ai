import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Plans | Serve By Example",
  description:
    "Join as a Founding Member. Choose from solo practitioner, single venue, or multi-venue plans and lock in founding rates before prices rise.",
  alternates: { canonical: "/membership" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
