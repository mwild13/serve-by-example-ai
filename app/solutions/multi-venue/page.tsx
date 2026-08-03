import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  IconBuilding,
  IconUsers,
  IconChart,
  IconStar,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Multi-Venue Groups | Serve By Example",
  description:
    "Centralised staff training and analytics for multi-venue hospitality groups. Compare venue health, spot skill gaps across sites, and manage up to 125 staff from one console.",
  alternates: { canonical: "/solutions/multi-venue" },
};

const features: FeatureGridItem[] = [
  {
    icon: <IconBuilding />,
    title: "Group health scores at a glance",
    body: "See readiness scores for every venue side by side. Identify which site needs attention before it shows up in your revenue or your reviews.",
  },
  {
    icon: <IconUsers />,
    title: "Staff managed across all venues centrally",
    body: "One console, up to 125 staff across 5 venues. Transfer staff between venues, assign targeted training, and compare individual performance across your group.",
  },
  {
    icon: <IconChart />,
    title: "Skill gap analysis across the group",
    body: "The platform identifies patterns across venues. If multiple sites have weak upsell scores, you know to run group-wide coaching before it affects revenue.",
  },
  {
    icon: <IconStar />,
    title: "Competitive training with Live Scenarios",
    body: "Staff across all venues compete on the same weekly ranked challenges. Cross-venue leaderboards create healthy competition and surface your best performers.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://servebyexample.co" },
    { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://servebyexample.co/solutions" },
    { "@type": "ListItem", "position": 3, "name": "Multi-Venue Groups", "item": "https://servebyexample.co/solutions/multi-venue" },
  ],
};

export default function MultiVenuePage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        {/* ── Hero ── */}
        <PageHero
          variant="solution"
          breadcrumb={[
            { label: "Solutions", href: "/solutions" },
            { label: "Multi-Venue Groups" },
          ]}
          eyebrow="Multi-Venue Groups"
          title="Manage every venue’s training from one place."
          subtitle="Running multiple venues means managing complexity at scale. Serve By Example gives group operators a single platform to train, track, and compare staff performance across every site, with the analytics to act before problems compound."
          actions={[
            { label: "Request Venue Access", href: "/contact", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        {/* ── Metrics strip ── */}
        <section className="section trust-section trust-section-green metrics-strip">
          <div className="container">
            <div className="metrics-strip-row">
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">5 venues</div>
                <div className="metrics-strip-label">managed from a single console on our Multi-Venue plan</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">125</div>
                <div className="metrics-strip-label">staff supported across all venues on the top tier</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">1 view</div>
                <div className="metrics-strip-label">group health score across every venue, instantly</div>
              </div>
            </div>
            <p className="metrics-strip-disclaimer">*Based on centralised hospitality analytics modelling and group training industry averages.</p>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Group operations"
              title="The operator’s view across your entire group"
            />
            <FeatureGrid items={features} columns={2} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          eyebrow="Get started"
          title="Ready to take the group view?"
          copy="Talk to us about a multi-venue setup or try the platform yourself."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
