import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  IconCheckSquare,
  IconChart,
  IconUsers,
  IconMessage,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Franchise Systems | Serve By Example",
  description:
    "Replace inconsistent franchisee training with a scalable training platform that enforces brand standards across every location without head-office oversight.",
  alternates: { canonical: "/solutions/franchise-systems" },
};

const features: FeatureGridItem[] = [
  {
    icon: <IconCheckSquare />,
    title: "Brand standards enforced, not just suggested",
    body: "Every franchisee’s staff trains on the same materials. Service language, upsell scripts, and compliance modules are standardised across the network.",
  },
  {
    icon: <IconChart />,
    title: "Scalable from 5 to 500 staff",
    body: "Whether you have 3 locations or 30, the platform scales without additional overhead. New franchisees are onboarded to the training system in minutes.",
  },
  {
    icon: <IconUsers />,
    title: "High-turnover onboarding without the overhead",
    body: "Hospitality turnover is real. Self-serve digital onboarding means new starters train themselves through structured modules without pulling management time.",
  },
  {
    icon: <IconMessage />,
    title: "Head-office visibility without micromanagement",
    body: "Franchise support managers see training completion, compliance status, and readiness scores across all locations, without visiting every site.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://servebyexample.co" },
    { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://servebyexample.co/solutions" },
    { "@type": "ListItem", "position": 3, "name": "Franchises & QSRs", "item": "https://servebyexample.co/solutions/franchise-systems" },
  ],
};

export default function FranchiseSystemsPage() {
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
            { label: "Franchise Systems" },
          ]}
          eyebrow="Franchises & QSRs"
          title="High volume. High turnover. High standards, maintained."
          subtitle="Franchise training at scale is a logistics problem. Printed manuals get ignored. Video modules go unwatched. Scenario-based training engages staff the way a great manager would: conversationally, adaptively, and on the device they already have in their pocket."
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
                <div className="metrics-strip-value">200+</div>
                <div className="metrics-strip-label">staff capacity across 12+ locations, supported from Day 1</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">0</div>
                <div className="metrics-strip-label">head-office visits required to enforce training compliance</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">90%</div>
                <div className="metrics-strip-label">of training completed on mobile, no desktop required</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Franchise-ready tools"
              title="Training infrastructure your franchisees will actually use"
            />
            <FeatureGrid items={features} columns={2} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          eyebrow="Get started"
          title="Ready to standardise training across your franchise network?"
          copy="Try the demo or talk to us about a network rollout."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
