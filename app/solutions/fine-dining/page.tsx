import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  IconGlass,
  IconMessage,
  IconChart,
  IconStar,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Fine Dining & Cocktail Bars | Serve By Example",
  description:
    "Train your team on the precise product knowledge and elevated service standards that premium venues demand. Cocktail specs, wine pairings, guest recovery, all scenario-coached.",
  alternates: { canonical: "/solutions/fine-dining" },
};

const features: FeatureGridItem[] = [
  {
    icon: <IconGlass />,
    title: "Cocktail and wine knowledge drilled daily",
    body: "Staff practise recipes, spirit profiles, and provenance stories through scenario repetition until they can describe them fluently under pressure.",
  },
  {
    icon: <IconMessage />,
    title: "Premium guest recovery training",
    body: "Handle complaints, special requests, and high-expectation guests with the composure and language that protects your reputation and earns repeat visits.",
  },
  {
    icon: <IconChart />,
    title: "Upsell confidence scored and tracked",
    body: "The platform tracks every staff member’s upsell scenario performance and flags who needs targeted coaching before the next big service.",
  },
  {
    icon: <IconStar />,
    title: "High-pressure simulation before Friday night",
    body: "Staff rehearse service timing, course pacing, and multi-table management in scenario practice, before the stakes are real.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://servebyexample.co" },
    { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://servebyexample.co/solutions" },
    { "@type": "ListItem", "position": 3, "name": "Fine Dining & Cocktail Bars", "item": "https://servebyexample.co/solutions/fine-dining" },
  ],
};

export default function FineDiningPage() {
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
            { label: "Fine Dining & Bars" },
          ]}
          eyebrow="Fine Dining & Cocktail Bars"
          title="Spec sheets memorised. Service elevated. Guests impressed."
          subtitle="Premium venues live and die by the detail. A staff member who can’t describe a cocktail’s ingredients or explain a dish’s provenance isn’t just uninformed. They damage the experience. Serve By Example trains your team on the precise knowledge that earns loyalty."
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
                <div className="metrics-strip-value">38</div>
                <div className="metrics-strip-label">cocktail and spirit specs embedded in the training library</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">65+</div>
                <div className="metrics-strip-label">bartending and service scenarios to practise</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">5 dims</div>
                <div className="metrics-strip-label">every response evaluated across 5 service dimensions</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Premium training tools"
              title="Training as precise as your menu"
            />
            <FeatureGrid items={features} columns={2} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          eyebrow="Get started"
          title="Ready to elevate your service standards?"
          copy="Try a live bartending or upsell scenario now. No sign-up required."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
