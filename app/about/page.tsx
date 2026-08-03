import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import {
  IconMessage,
  IconZap,
  IconUsers,
  IconChart,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Serve By Example | AI Hospitality Staff Training",
  description: "Serve By Example was built by people who know hospitality. Learn about our mission to replace inconsistent on-floor training with scalable, structured digital learning.",
  alternates: { canonical: "/about" },
};

const aboutBlocks: FeatureGridItem[] = [
  {
    icon: <IconMessage />,
    title: "The problem",
    body: "Most venue staff learn on the job, which means inconsistent guest experiences, slow onboarding, and managers constantly plugging gaps. Written manuals gather dust. One-off training days are forgotten within weeks.",
  },
  {
    icon: <IconZap size={22} />,
    title: "Our approach",
    body: "Scenario-based training that fits around shifts. Staff practice real situations (difficult guests, upsell moments, service recovery) and get instant, specific feedback. No dedicated trainer required.",
  },
  {
    icon: <IconUsers />,
    title: "Who we're for",
    body: "Independent bars, hotel F&B teams, restaurant groups, and event venues that want consistent, confident staff without the overhead of a full training department.",
  },
  {
    icon: <IconChart />,
    title: "Where we're headed",
    body: "We're building the complete staff development platform for hospitality, from first-shift onboarding through to team management and progression tracking.",
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <PageHero
          eyebrow="About us"
          title="Built by people who know hospitality"
          subtitle="Serve By Example started from a simple frustration: great hospitality training was out of reach for most venues: too expensive, too generic, too slow. We built the platform we wished existed."
        />

        {/* ── Story blocks ── */}
        <section className="section">
          <div className="container">
            <FeatureGrid items={aboutBlocks} columns={2} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          title="Ready to see it in action?"
          copy="Try the free demo. No account needed. See exactly how it feels for your staff."
          primary={{ label: "Try the demo", href: "/demo" }}
          secondary={{ label: "Get in touch", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
