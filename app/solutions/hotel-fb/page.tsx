import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import MetricsStrip from "@/components/marketing/MetricsStrip";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  IconBuilding,
  IconStar,
  IconUsers,
  IconCheckSquare,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Hotel F&B Teams | Serve By Example",
  description:
    "From all-day dining to rooftop bars, equip every hotel F&B outlet with consistent, scalable interactive training. Serve By Example works across multiple outlets, service styles, and staff levels.",
  alternates: { canonical: "/solutions/hotel-fb" },
};

const features: FeatureGridItem[] = [
  {
    icon: <IconBuilding />,
    title: "One platform across all outlets",
    body: "Train your all-day restaurant, room service team, rooftop bar, and banquet staff from a single platform. Consistent standards regardless of outlet.",
  },
  {
    icon: <IconStar />,
    title: "Guest experience standards, not just product knowledge",
    body: "Hotel guests have elevated expectations. Our scenarios train staff on the language, demeanour, and problem resolution that five-star service demands.",
  },
  {
    icon: <IconUsers />,
    title: "Fast onboarding for seasonal and casual staff",
    body: "Hotel F&B teams turn over fast, especially seasonally. Our structured onboarding gets casual and new starters performing to standard within weeks.",
  },
  {
    icon: <IconCheckSquare />,
    title: "Compliance and certification tracked",
    body: "RSA modules, allergen awareness, and brand standards are tracked automatically. F&B managers receive alerts before any certification lapses.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://servebyexample.co" },
    { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://servebyexample.co/solutions" },
    { "@type": "ListItem", "position": 3, "name": "Hotel F&B", "item": "https://servebyexample.co/solutions/hotel-fb" },
  ],
};

export default function HotelFBPage() {
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
            { label: "Hotel F&B" },
          ]}
          eyebrow="Hotel Food & Beverage"
          title="Multiple outlets. One standard of service."
          subtitle="Hotel F&B is complex: multiple outlets, rotating staff, elevated guest expectations, and non-negotiable compliance requirements. Serve By Example gives your entire F&B operation a single, consistent training platform, from the breakfast shift to the late-night bar."
          actions={[
            { label: "Request Venue Access", href: "/contact", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        {/* ── Metrics strip — softened to platform facts (ACCC pass) ── */}
        <MetricsStrip
          metrics={[
            { value: "3", label: "stage structured onboarding path for seasonal and casual intake" },
            { value: "19", label: "languages supported for diverse hotel teams" },
            { value: "40+", label: "training modules available to staff on any shift, any device" },
          ]}
        />

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Hotel F&B features"
              title="Purpose-built for hotel F&B complexity"
            />
            <FeatureGrid items={features} columns={2} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          eyebrow="Get started"
          title="Ready to standardise your hotel F&B training?"
          copy="Book a walkthrough or try the demo yourself. No commitment required."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
