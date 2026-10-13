import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Serve By Example",
  description:
    "Compare Serve By Example plans for solo practitioners, single venues, and multi-venue groups. Start a free 14-day trial and lock in founding rates before prices rise.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
