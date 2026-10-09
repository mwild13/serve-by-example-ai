import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ui/ROICalculator";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { Ledger, type LedgerRow } from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hospitality Training ROI Calculator | Serve By Example",
  description:
    "Calculate the revenue impact of scenario-based training for your hospitality team. See what better training is worth to your venue.",
  alternates: { canonical: "/roi" },
};

const GAINS: LedgerRow[] = [
  {
    metric: "3",
    unit: "×",
    title: "Faster onboarding",
    body: "Average time to full service confidence drops from 6 months to under 6 weeks.",
  },
  {
    metric: "40",
    unit: "+",
    title: "Self-serve modules",
    body: "Staff work through structured modules on their own device, without a manager running induction sessions or shadowing new starters.",
  },
  {
    metric: "5",
    title: "Service dimensions scored",
    body: "Every scenario response is scored on communication, hospitality, problem-solving, professionalism and guest experience, including upsell technique.",
  },
];

export default function ROIPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* Light, compact hero so the dark calculator band starts near the fold */}
        <PageHero
          compact
          variant="light"
          eyebrow="ROI Calculator"
          title="Calculate your training return on investment."
        />

        {/* ROICalculator renders its own full-bleed band (shared with the homepage) */}
        <Suspense fallback={<div style={{ height: "400px", background: "var(--bg-dark)" }} />}>
          <ROICalculator />
        </Suspense>

        <Ledger
          kicker="The numbers behind the calculator"
          title="Where the gains come from."
          lede="How the platform is built to move these numbers: structured scenario practice and scored feedback in place of one-off inductions."
          rows={GAINS}
        />

        <CTABand
          eyebrow="Ready to see it live?"
          title="Put the numbers into practice."
          copy="The calculator gives you the estimate. A demo shows you how it actually works for your team."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "View Pricing", href: "/membership" }}
        />
      </main>
      <Footer />
    </div>
  );
}
