import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ui/ROICalculator";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hospitality Training ROI Calculator | Serve By Example",
  description:
    "Calculate the revenue impact of scenario-based training for your hospitality team. See what better training is worth to your venue.",
  alternates: { canonical: "/roi" },
};

const supportingStats: FeatureGridItem[] = [
  {
    variant: "stat",
    eyebrow: "faster onboarding",
    title: "3×",
    body: "Average time to full service confidence drops from 6 months to under 6 weeks.",
  },
  {
    variant: "stat",
    eyebrow: "self-serve modules",
    title: "40+",
    body: "Staff work through structured modules on their own device — without a manager running induction sessions or shadowing new starters.",
  },
  {
    variant: "stat",
    eyebrow: "service dimensions scored",
    title: "5",
    body: "Every scenario response is scored on communication, hospitality, problem-solving, professionalism and guest experience — including upsell technique.",
  },
];

export default function ROIPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero — compact so the calculator stays near the fold ── */}
        <PageHero
          compact
          eyebrow="ROI Calculator"
          title="Calculate your training return on investment."
        />

        {/* ── Calculator ── */}
        <section className="section section-alt" style={{ paddingTop: 0 }}>
          <div className="container">
            <ROICalculator />
          </div>
        </section>

        {/* ── Supporting stats ── */}
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="The numbers behind the calculator"
              title="Where the gains come from."
              copy="How the platform is built to move these numbers: structured scenario practice and scored feedback in place of one-off inductions."
            />
            <FeatureGrid items={supportingStats} columns={3} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
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
