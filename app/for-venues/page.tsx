import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareMatrix from "@/components/ui/CompareMatrix";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
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

const outcomes = [
  "Reduce time spent repeating the same training basics",
  "Support junior staff with more confidence before service",
  "Improve consistency across bartenders, floor staff and leaders",
  "Identify weak points in communication, sales and service standards",
];

const useCases: FeatureGridItem[] = [
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

        {/* ── Hero — dark variant, reserved for /for-venues and /pricing ── */}
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

        {/* ── Platform Screenshot ── */}
        <section className="section" style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
          <div className="container">
            <SectionHeading
              eyebrow="The Platform"
              title="Everything you need to manage and measure your team’s training."
            />
            <div style={{ maxWidth: "1000px" }}>
              <Image
                src="/shots/Overview Console Wide.png"
                alt="Serve By Example manager console – venue overview with training completion, compliance status, and staff needing attention"
                width={3004}
                height={1654}
                sizes="(max-width: 1000px) 100vw, 1000px"
                style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)" }}
              />
            </div>
          </div>
        </section>

        {/* ── Why It Matters — 2×2 editorial grid, kept ── */}
        <section className="sbe-mkt-scope" style={{ padding: "64px 24px", width: "100%", borderTop: "1px solid var(--line)", backgroundColor: "var(--mkt-cream-100)" }}>
          <div className="container">
            <div style={{ marginBottom: "48px", maxWidth: "650px" }}>
              <span className="sbe-eyebrow">The Business Case</span>
              <h2 className="sbe-serif-title" style={{ fontSize: "36px", marginTop: "8px" }}>Why Structured Training Matters</h2>
              <p className="sbe-sans-body" style={{ color: "var(--mkt-charcoal-400)", fontSize: "14px", marginTop: "16px" }}>
                Australia&rsquo;s hospitality sector operates on thin 3&ndash;9% net profit margins. The cost isn&rsquo;t just recruiting and placing staff &mdash; it&rsquo;s the massive revenue drain of inconsistent floor shifts in between.
              </p>
            </div>

            <div className="why-grid-2x2">
              <div className="why-grid-item">
                <h3 className="sbe-serif-title" style={{ fontSize: "20px", marginBottom: "8px" }}>1. Poor training is a direct revenue problem</h3>
                <p className="sbe-sans-body" style={{ color: "var(--mkt-charcoal-400)", fontSize: "14px" }}>
                  When frontline floor teams cannot upsell menu options confidently, recommend pairings, or manage guest complaints under pressure, every single shift costs you in missed sales and lost repeat customers.
                </p>
              </div>

              <div className="why-grid-item">
                <h3 className="sbe-serif-title" style={{ fontSize: "20px", marginBottom: "8px" }}>2. Attrition starts with weak onboarding</h3>
                <p className="sbe-sans-body" style={{ color: "var(--mkt-charcoal-400)", fontSize: "14px" }}>
                  Up to 39% of FOH and 42% of BOH staff quit within their first 90 days of work. Providing structured, AI-guided scenario training builds confidence early, which directly reduces turnover by 20&ndash;23%.
                </p>
              </div>

              <div className="why-grid-item" style={{ borderBottom: "none" }}>
                <h3 className="sbe-serif-title" style={{ fontSize: "20px", marginBottom: "8px" }}>3. Manager hours are your most expensive resource</h3>
                <p className="sbe-sans-body" style={{ color: "var(--mkt-charcoal-400)", fontSize: "14px" }}>
                  Every hour a senior manager spends repeating the same onboarding and menu basics is an hour lost from active floor support, venue operations, and developing your team.
                </p>
              </div>

              <div style={{ borderBottom: "none" }}>
                <h3 className="sbe-serif-title" style={{ fontSize: "20px", marginBottom: "8px" }}>4. Training only works if staff actually do it</h3>
                <p className="sbe-sans-body" style={{ color: "var(--mkt-charcoal-400)", fontSize: "14px" }}>
                  Long videos and physical training binders are ignored by younger staff. Interactive active-recall mobile modules are short, relevant, and engaging &mdash; built to fit seamlessly between shifts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── The Approach — asymmetric split, kept ── */}
        <section className="section">
          <div className="container">
            <div className="split-grid">
              <div>
                <span className="eyebrow">The Approach</span>
                <h2 className="split-heading">
                  Training that supports service, not slows it down.
                </h2>
                <p className="split-sub">
                  Venue teams are often trained in rushed moments,
                  inconsistently across shifts and without a clear way to
                  measure growth. Serve By Example gives operators a more
                  scalable, structured way to train.
                </p>
              </div>
              <article className="info-card">
                <h3>What venues get</h3>
                <ul className="check-list">
                  {outcomes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Example Use Cases"
              title="Real ways venues use the platform"
            />
            <FeatureGrid items={useCases} columns={3} />
          </div>
        </section>

        {/* ── Comparison Matrix ── */}
        <section className="section section-alt">
          <div className="container">
            <CompareMatrix />
          </div>
        </section>

        {/* ── CTA ── */}
        <div id="venue-enquiry">
          <CTABand
            background="green"
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
