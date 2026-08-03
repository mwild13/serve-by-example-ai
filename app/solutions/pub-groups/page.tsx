import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import MetricsStrip from "@/components/marketing/MetricsStrip";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  IconBuilding,
  IconUsers,
  IconClock,
  IconCheckSquare,
  IconChart,
  IconStar,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Pub Groups & Multi-Venue Operators | Serve By Example",
  description:
    "Centralised staff training for pub groups and multi-venue hospitality operators. Standardise service quality, track compliance, and manage up to 125 staff from one console.",
  alternates: { canonical: "/solutions/pub-groups" },
};

const features: FeatureGridItem[] = [
  {
    icon: <IconBuilding />,
    title: "Consistent training across all sites",
    body: "Every staff member in every venue goes through the same quality training. No more \"it depends on the manager\" variation.",
  },
  {
    icon: <IconUsers />,
    title: "Group-wide visibility in one console",
    body: "Compare readiness scores across venues, spot skill gaps before they become service issues, and direct coaching where it matters most. Manage up to 125 staff across 5 venues from a single dashboard.",
  },
  {
    icon: <IconClock />,
    title: "New starters floor-ready in weeks",
    body: "Structured onboarding modules get bartenders and floor staff service-ready without pulling your best people off their shifts to train.",
  },
  {
    icon: <IconCheckSquare />,
    title: "Compliance tracked automatically",
    body: "RSA, responsible service, and venue policy modules are completed and logged. Managers are alerted before anything lapses.",
  },
  {
    icon: <IconChart />,
    title: "Skill gap analysis across the group",
    body: "The platform identifies patterns across venues. If multiple sites have weak upsell scores, you know to run group-wide coaching before it affects revenue.",
  },
  {
    icon: <IconStar />,
    title: "Cross-venue performance tracking",
    body: "Staff across all venues train on the same content. Group leaderboards surface your top performers and flag who needs support across the whole group.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://servebyexample.co" },
    { "@type": "ListItem", "position": 2, "name": "Industries", "item": "https://servebyexample.co/solutions" },
    { "@type": "ListItem", "position": 3, "name": "Pubs & Multi-Venue Groups", "item": "https://servebyexample.co/solutions/pub-groups" },
  ],
};

export default function PubGroupsPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        {/* ── Hero ── */}
        <PageHero
          variant="solution"
          breadcrumb={[
            { label: "Industries", href: "/solutions" },
            { label: "Pubs & Multi-Venue Groups" },
          ]}
          eyebrow="Pubs & Multi-Venue Groups"
          title="Train every venue. Manage from one place."
          subtitle="Inconsistent training is the silent killer of multi-site operations. One venue nails upselling; three others improvise. Serve By Example gives every staff member the same quality training experience, regardless of location, manager, or roster — and gives operators a single view across their entire group."
          actions={[
            { label: "Request Venue Access", href: "/contact", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        {/* ── Metrics strip ── */}
        <MetricsStrip
          metrics={[
            { value: "3", label: "stage structured onboarding path — from knowledge to verified floor readiness" },
            { value: "5 venues", label: "managed from a single console on multi-venue plans" },
            { value: "125", label: "staff supported across all venues on the top tier" },
          ]}
        />

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Multi-site management"
              title="Built for the complexity of pub groups and multi-venue operators"
            />
            <FeatureGrid items={features} columns={3} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          eyebrow="Get started"
          title="Ready to standardise training across your group?"
          copy="Start with a free demo. No commitment, no credit card."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
