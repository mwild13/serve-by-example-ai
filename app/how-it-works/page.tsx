import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Serve By Example",
  description: "See how Serve By Example's three-stage training loop takes hospitality staff from onboarding through to real-world confidence — with scenario practice, scoring, and performance tracking.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    number: "01",
    title: "Choose a pathway",
    description:
      "Start with Beginner, Bartender, Sales or Management Training depending on the staff member’s role and experience level.",
  },
  {
    number: "02",
    title: "Learn the essentials",
    description:
      "Complete short, practical learning modules covering service basics, drink knowledge, sales skills and decision-making.",
  },
  {
    number: "03",
    title: "Practice real scenarios",
    description:
      "Staff respond to realistic hospitality situations using scenario-based simulations designed to build confidence under pressure.",
  },
  {
    number: "04",
    title: "Get instant scored feedback",
    description:
      "Every response is scored against service criteria like communication, professionalism, problem-solving and guest experience.",
  },
  {
    number: "05",
    title: "Track progress over time",
    description:
      "Staff can see improvement, while managers get visibility across completion, strengths, gaps and overall team performance.",
  },
];

const stepItems: FeatureGridItem[] = steps.map((s) => ({
  eyebrow: s.number,
  title: s.title,
  body: s.description,
}));

const pillarItems: FeatureGridItem[] = [
  {
    title: "Beginner Training",
    body: "Build confidence with guest greetings, taking drink orders and basic drink knowledge.",
  },
  {
    title: "Bartender Training",
    body: "Improve cocktail knowledge, speed, workflow, consistency and bar setup habits.",
  },
  {
    title: "Sales Training",
    body: "Teach natural upselling, premium recommendations and suggestive selling without sounding pushy.",
  },
  {
    title: "Management Training",
    body: "Develop leadership, complaint handling, team communication and venue decision-making.",
  },
  {
    title: "Scenario Simulations",
    body: "The core training feature where staff practice realistic service situations and receive coaching.",
  },
  {
    title: "Performance Tracking",
    body: "Measure growth across communication, drink knowledge, sales, problem-solving and team performance.",
  },
];

const scenarioItems: FeatureGridItem[] = [
  {
    eyebrow: "Scenario",
    title: "A guest approaches the bar",
    body: "A guest approaches the bar while you’re finishing another drink. How do you acknowledge them?",
  },
  {
    eyebrow: "Staff response",
    title: "The reply",
    body: "“Hi there, I’ll be with you in just a moment.”",
  },
  {
    eyebrow: "Scored feedback",
    title: "Score: 22/25",
    body: "Clear acknowledgement, friendly tone and good guest awareness. A strong service response.",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How Serve By Example Works",
  "description":
    "Serve By Example's three-stage training loop takes hospitality staff from onboarding through to real-world confidence — with scenario practice, scoring, and performance tracking.",
  "step": steps.map((s, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": s.title,
    "text": s.description,
  })),
};

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />

        {/* ── Hero ── */}
        <PageHero
          eyebrow="How It Works"
          title="From onboarding to real-world confidence."
          subtitle="Serve By Example combines short learning modules, scenario-based practice and performance tracking to help hospitality teams train faster and perform better on shift."
          actions={[
            { label: "See the Platform", href: "/platform", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        {/* ── The Problem — asymmetric split, kept ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="split-grid">
              <div>
                <span className="eyebrow">The Problem</span>
                <h2 className="split-heading">
                  Most hospitality training is inconsistent and hard to scale.
                </h2>
              </div>
              <div className="split-body">
                <p>
                  New staff are often trained on the job, under pressure and
                  with limited manager time.
                </p>
                <p>
                  Traditional training is usually passive, one-size-fits-all
                  and difficult to apply during real service.
                </p>
                <p>
                  Serve By Example bridges that gap by letting staff practice
                  realistic service situations before they face them in venue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── The System (5 Steps) ── */}
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="The System"
              title="A simple training loop that improves with every session."
            />
            <FeatureGrid items={stepItems} columns={3} />
          </div>
        </section>

        {/* ── Training Framework (6 Pillars) ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="The Training Framework"
              title="Built around six core parts of hospitality performance."
            />
            <FeatureGrid items={pillarItems} columns={3} />
          </div>
        </section>

        {/* ── Example Scenario ── */}
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Example Scenario"
              title="How a scored scenario response works"
              copy="Every response is scored instantly. Over time, the platform tracks your weak areas and resurfaces them, so improvement isn’t left to chance."
            />
            <FeatureGrid items={scenarioItems} columns={3} />

            {/* How AI improves your score */}
            <div style={{
              marginTop: "2.5rem",
              background: "var(--status-success-bg)",
              border: "1.5px solid var(--status-success-light)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem 2.5rem",
            }}>
              <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 700, color: "var(--green-gradient-stop)" }}>
                How the system improves your score over time
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
                {[
                  { n: "01", title: "Score every response", desc: "Rated across 5 dimensions: communication, hospitality, problem-solving, professionalism and guest experience." },
                  { n: "02", title: "Identify weak areas", desc: "The system flags dimensions where your score drops consistently, not just one-off mistakes." },
                  { n: "03", title: "Resurface weak areas automatically", desc: "Spaced repetition brings back scenarios in those areas at the right intervals: 1, 4, 9 and 16 days." },
                  { n: "04", title: "Adjust difficulty to your level", desc: "The ELO rating system matches you to harder scenarios as you improve, always training at your current edge." },
                ].map(({ n, title, desc }) => (
                  <div key={n} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "var(--radius-sm)", background: "var(--green-gradient-mid)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>{n}</span>
                    <div>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.875rem", color: "var(--green-gradient-stop)" }}>{title}</p>
                      <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Consoles ── */}
        <section className="section" style={{ background: "var(--ip-green)" }}>
          <div className="container">
            <div className="section-header">
              <span className="eyebrow" style={{ color: "var(--status-success-border)" }}>Consoles</span>
              <h2 style={{ color: "white", marginBottom: "0.5rem" }}>The manager and staff consoles, side by side</h2>
              <p style={{ color: "var(--color-text-faint)", maxWidth: "560px" }}>
                Two powerful tools working together: one for managers, one for staff.
              </p>
            </div>
            <div className="hiw-consoles-grid">

              {/* Management Console */}
              <div>
                <p style={{ color: "var(--divider-light)", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Manager Console</p>
                <Image
                  src="/shots/Overview Console Compact.png"
                  alt="Serve By Example manager console – venue overview with training completion, compliance status, and staff needing attention"
                  width={2416}
                  height={1558}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)" }}
                />
              </div>

              {/* Staff Mobile Console */}
              <div>
                <p style={{ color: "var(--divider-light)", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Staff Mobile Console</p>
                <Image
                  src="/shots/Progress Skill Rings.png"
                  alt="Serve By Example staff mobile app – mastery breakdown by category with modules mastered and skill level"
                  width={912}
                  height={1844}
                  sizes="(max-width: 768px) 45vw, 200px"
                  style={{ width: "100%", maxWidth: "200px", height: "auto", display: "block", margin: "0 auto" }}
                />
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="gold"
          title="Ready to train smarter?"
          copy="Give every staff member a clearer path to confidence, consistency and better service."
          primary={{ label: "Try the Demo", href: "/demo" }}
        />
      </main>

      <Footer />
    </div>
  );
}
