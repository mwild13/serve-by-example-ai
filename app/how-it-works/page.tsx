import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
