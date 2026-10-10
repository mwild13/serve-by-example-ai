import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareMatrix from "@/components/ui/CompareMatrix";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import {
  Ledger,
  MediaRows,
  SplitPanel,
  Strip,
  type LedgerRow,
  type StripItem,
} from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Training for Venue Operators | Serve By Example",
  description:
    "Onboard faster, train consistently, and improve service standards across your venue. Serve By Example gives operators real-time visibility into every staff member's readiness.",
  alternates: { canonical: "/for-venues" },
};

const venueServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Serve By Example Staff Training",
  "provider": { "@id": "https://servebyexample.co/#organization" },
  "description": "AI-powered hospitality staff training for venue operators. Onboard faster, train consistently, and get real-time visibility into every staff member's readiness.",
  "areaServed": { "@type": "Country", "name": "Australia" },
  "serviceType": "Hospitality Staff Training",
};

// The figures in rows 02 and the lede are carried over unchanged and flagged in
// To_do_list.md ("Marketing copy to source or remove").
const BUSINESS_CASE: LedgerRow[] = [
  {
    metric: "01",
    title: "Poor training is a direct revenue problem",
    body: "When frontline floor teams cannot upsell menu options confidently, recommend pairings, or manage guest complaints under pressure, every single shift costs you in missed sales and lost repeat customers.",
  },
  {
    metric: "02",
    title: "Attrition starts with weak onboarding",
    body: "Up to 39% of FOH and 42% of BOH staff quit within their first 90 days of work. Providing structured, AI-guided scenario training builds confidence early, which directly reduces turnover by 20–23%.",
  },
  {
    metric: "03",
    title: "Manager hours are your most expensive resource",
    body: "Every hour a senior manager spends repeating the same onboarding and menu basics is an hour lost from active floor support, venue operations, and developing your team.",
  },
  {
    metric: "04",
    title: "Training only works if staff actually do it",
    body: "Long videos and physical training binders are ignored by younger staff. Interactive active-recall mobile modules are short, relevant, and engaging, and they are built to fit seamlessly between shifts.",
  },
];

const USE_CASES: StripItem[] = [
  {
    title: "New starter onboarding",
    body: "Help junior staff build confidence in greetings, drink orders and guest interaction before peak service.",
  },
  {
    title: "Sales improvement",
    body: "Train teams to recommend premium drinks and upsell naturally without sounding scripted.",
  },
  {
    title: "Leadership development",
    body: "Support managers with complaint handling, delegation and operational decision-making under pressure.",
  },
];

export default function ForVenuesPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueServiceSchema) }} />

        <PageHero
          variant="dark"
          eyebrow="For Venues"
          title="Built for venue owners, operators and hospitality groups."
          subtitle="Serve By Example helps teams onboard faster, train more consistently and improve service standards with interactive hospitality training."
          actions={[
            { label: "Request Venue Access", href: "/contact", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        <MediaRows
          rows={[
            {
              tag: "The platform",
              title: "Everything you need to manage and measure your team’s training.",
              body: "Training completion, compliance status and the staff who need attention, in one view.",
              image: {
                src: "/shots/Overview Console Wide.webp",
                alt: "Serve By Example manager console: venue overview with training completion, compliance status, and staff needing attention",
                width: 3004,
                height: 1654,
              },
            },
          ]}
        />

        <Ledger
          tone="alt"
          kicker="The business case"
          title="Why structured training matters"
          lede="Australia’s hospitality sector operates on thin 3–9% net profit margins. The cost isn’t just recruiting and placing staff. It’s the massive revenue drain of inconsistent floor shifts in between."
          rows={BUSINESS_CASE}
        />

        <SplitPanel
          kicker="The approach"
          title="Training that supports service, not slows it down."
          lede="Venue teams are often trained in rushed moments, inconsistently across shifts and without a clear way to measure growth. Serve By Example gives operators a more scalable, structured way to train."
          items={[
            {
              label: "In practice",
              title: "What venues get",
              points: [
                "Reduce time spent repeating the same training basics",
                "Support junior staff with more confidence before service",
                "Improve consistency across bartenders, floor staff and leaders",
                "Identify weak points in communication, sales and service standards",
              ],
            },
          ]}
        />

        <Strip
          tone="warm"
          kicker="Example use cases"
          title="Real ways venues use the platform"
          items={USE_CASES}
        />

        {/* Same flush, collapsible table as /pricing */}
        <section className="sbe-mkt-compare-band">
          <div className="container">
            <CompareMatrix flush collapsible hideFranchise />
          </div>
        </section>

        <div id="venue-enquiry">
          <CTABand
            background="neutral"
            title="Train your team with more consistency."
            copy="Whether you run one venue or multiple locations, Serve By Example gives your team a clearer path to better service and stronger performance."
            primary={{ label: "Request Venue Access", href: "/contact" }}
            secondary={{ label: "See How It Works", href: "/how-it-works" }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
