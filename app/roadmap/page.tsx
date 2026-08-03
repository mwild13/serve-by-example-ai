import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Roadmap | What We're Building | Serve By Example",
  description:
    "See what we're building next. Serve By Example is actively developing new training modules, platform features, and tools for Australian hospitality venues.",
  alternates: { canonical: "/roadmap" },
};

const roadmapItems: FeatureGridItem[] = [
  {
    eyebrow: "2 months",
    title: "Expanded Staff Modules",
    body: "New training modules covering coffee service, food pairing, wine fundamentals and advanced guest interaction, built around Australian hospitality standards.",
  },
  {
    eyebrow: "4 months",
    title: "Large-Venue & Events Training",
    body: "Expanded scenario sets for large-venue management, events service and high-volume bar operations.",
  },
  {
    eyebrow: "6 months",
    title: "Certification Deep-Dives",
    body: "Deep-dive certifications in spirits, cocktail history, advanced bar technique and cellar management for venues that want to build genuine expertise.",
  },
  {
    eyebrow: "Within 6 months",
    title: "V2: Major Platform Release",
    body: "A significant platform update informed by founding member feedback, with new features across training, analytics and management. Founding members shape what gets prioritised.",
  },
  {
    eyebrow: "TBA",
    title: "Custom Scenario Builder",
    body: "Upload your venue's menus, house rules, and POS workflows directly into the AI model. Generate training scenarios built around your specific operation, not a generic template.",
  },
  {
    eyebrow: "TBA",
    title: "iOS & Android Native Apps",
    body: "Native mobile apps so staff can train on the go, anytime, anywhere, fully synced with their progress, badges, and manager-assigned tasks.",
  },
  {
    eyebrow: "TBA",
    title: "Further Design & Functionality",
    body: "Continuous UI improvements, accessibility updates and performance enhancements across all pages and flows, informed by real venue feedback.",
  },
];

export default function RoadmapPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <PageHero
          eyebrow="Product Roadmap"
          title="What we’re building next."
          subtitle="Serve By Example is actively built and improved based on venue operator feedback. Here’s what’s coming, and when founding members can expect it."
        />

        {/* ── Roadmap grid ── */}
        <section className="section section-alt">
          <div className="container">
            <FeatureGrid items={roadmapItems} columns={3} />
          </div>
        </section>

        {/* ── Founding member callout ── */}
        <CTABand
          background="green"
          eyebrow="Shape What Gets Built"
          title="Founding members influence the roadmap directly."
          copy="We run monthly calls with founding venue members to review what’s working, what’s missing, and what gets prioritised next. If you join now, your operation shapes the platform."
          primary={{ label: "Request Venue Access", href: "/contact" }}
          secondary={{ label: "View Pricing", href: "/membership" }}
        />
      </main>

      <Footer />
    </div>
  );
}
