import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { FounderStory, RuledList, type RuledItem } from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Serve By Example | AI Hospitality Staff Training",
  description: "Serve By Example was built by people who know hospitality. Learn about our mission to replace inconsistent on-floor training with scalable, structured digital learning.",
  alternates: { canonical: "/about" },
};

const STORY: RuledItem[] = [
  {
    label: "The problem",
    title: "Staff learn on the job",
    body: "Most venue staff learn on the job, which means inconsistent guest experiences, slow onboarding, and managers constantly plugging gaps. Written manuals gather dust. One-off training days are forgotten within weeks.",
  },
  {
    label: "Our approach",
    title: "Practice that fits around shifts",
    body: "Scenario-based training that fits around shifts. Staff practice real situations (difficult guests, upsell moments, service recovery) and get instant, specific feedback. No dedicated trainer required.",
  },
  {
    label: "Who we’re for",
    title: "Venues without a training department",
    body: "Independent bars, hotel F&B teams, restaurant groups, and event venues that want consistent, confident staff without the overhead of a full training department.",
  },
  {
    label: "Where we’re headed",
    title: "The whole staff development path",
    body: "We’re building the complete staff development platform for hospitality, from first-shift onboarding through to team management and progression tracking.",
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <PageHero
          eyebrow="About us"
          title="Built by people who know hospitality"
          subtitle="Serve By Example started from a simple frustration: great hospitality training was out of reach for most venues: too expensive, too generic, too slow. We built the platform we wished existed."
        />

        <FounderStory />

        <RuledList
          kicker="Why it exists"
          title="The platform we wished existed."
          items={STORY}
        />

        <CTABand
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
