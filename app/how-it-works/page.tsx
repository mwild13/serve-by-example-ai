import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardMockup from "@/components/ui/DashboardMockup";

const steps = [
  {
    number: "01",
    title: "Choose a pathway",
    description:
      "Start with Beginner, Bartender, Sales or Management Training depending on the staff member\u2019s role and experience level.",
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
      "Staff respond to realistic hospitality situations using AI-powered simulations designed to build confidence under pressure.",
  },
  {
    number: "04",
    title: "Get instant AI feedback",
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

const pillars = [
  {
    title: "Beginner Training",
    text: "Build confidence with guest greetings, taking drink orders and basic drink knowledge.",
  },
  {
    title: "Bartender Training",
    text: "Improve cocktail knowledge, speed, workflow, consistency and bar setup habits.",
  },
  {
    title: "Sales Training",
    text: "Teach natural upselling, premium recommendations and suggestive selling without sounding pushy.",
  },
  {
    title: "Management Training",
    text: "Develop leadership, complaint handling, team communication and venue decision-making.",
  },
  {
    title: "Scenario Simulations",
    text: "The core AI feature where staff practice realistic service situations and receive coaching.",
  },
  {
    title: "Performance Tracking",
    text: "Measure growth across communication, drink knowledge, sales, problem-solving and team performance.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">How It Works</span>
            <h1>From onboarding to real-world confidence.</h1>
            <p className="inner-hero-sub">
              Serve By Example combines short learning modules, AI-powered
              scenario practice and performance tracking to help hospitality
              teams train faster and perform better on shift.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Demo
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* ── The Problem ── */}
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
            <div className="section-header center">
              <span className="eyebrow">The System</span>
              <h2>A simple training loop that improves with every session.</h2>
            </div>
            <div className="card-grid card-grid-5">
              {steps.map((step) => (
                <article key={step.number} className="info-card">
                  <span className="info-card-num">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Training Framework (6 Pillars) ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">The Training Framework</span>
              <h2>
                Built around six core parts of hospitality performance.
              </h2>
            </div>
            <div className="card-grid card-grid-3">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="info-card">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Example Scenario ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Example Scenario</span>
              <h2>See the product in one glance.</h2>
              <p style={{ maxWidth: "560px", margin: "0 auto" }}>
                Every response is scored instantly. Over time, the AI tracks your weak areas and resurfaces them — so improvement isn&rsquo;t left to chance.
              </p>
            </div>
            <div className="card-grid card-grid-3">
              <article className="info-card">
                <span className="info-card-label">Scenario</span>
                <p>
                  A guest approaches the bar while you&rsquo;re finishing
                  another drink. How do you acknowledge them?
                </p>
              </article>
              <article className="info-card">
                <span className="info-card-label">Staff response</span>
                <p>
                  &ldquo;Hi there, I&rsquo;ll be with you in just a
                  moment.&rdquo;
                </p>
              </article>
              <article className="info-card">
                <span className="info-card-label">AI feedback</span>
                <p>
                  Score: 22/25. Clear acknowledgement, friendly tone and good
                  guest awareness. A strong service response.
                </p>
              </article>
            </div>

            {/* How AI improves your score */}
            <div style={{
              marginTop: "2.5rem",
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: "16px",
              padding: "2rem 2.5rem",
            }}>
              <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 700, color: "#1b4332" }}>
                How AI improves your score over time
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
                {[
                  { n: "01", title: "Score every response", desc: "Rated across 5 dimensions: communication, hospitality, problem-solving, professionalism and guest experience." },
                  { n: "02", title: "Identify weak areas", desc: "The system flags dimensions where your score drops consistently — not just one-off mistakes." },
                  { n: "03", title: "Resurface weak areas automatically", desc: "Spaced repetition brings back scenarios in those areas at the right intervals — 1, 4, 9 and 16 days." },
                  { n: "04", title: "Adjust difficulty to your level", desc: "The ELO rating system matches you to harder scenarios as you improve — always training at your current edge." },
                ].map(({ n, title, desc }) => (
                  <div key={n} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "8px", background: "#2d6a4f", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>{n}</span>
                    <div>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.875rem", color: "#1b4332" }}>{title}</p>
                      <p style={{ margin: 0, fontSize: "0.825rem", color: "#374151", lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Management console mockup */}
            <div style={{ marginTop: "2.5rem" }}>
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>Ready to train smarter?</h3>
              <p>
                Give every staff member a clearer path to confidence,
                consistency and better service.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/demo" className="btn btn-gold btn-lg">
                Try the Demo
              </Link>
              <Link href="/for-venues" className="btn btn-outline-light btn-lg">
                Explore For Venues
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
