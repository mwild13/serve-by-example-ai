import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardMockup from "@/components/ui/DashboardMockup";
import CompareMatrix from "@/components/ui/CompareMatrix";

const outcomes = [
  "Reduce time spent repeating the same training basics",
  "Support junior staff with more confidence before service",
  "Improve consistency across bartenders, floor staff and leaders",
  "Identify weak points in communication, sales and service standards",
];

export default function ForVenuesPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">For Venues</span>
            <h1>
              Built for venue owners, operators and hospitality&nbsp;groups.
            </h1>
            <p className="inner-hero-sub">
              Serve By Example helps teams onboard faster, train more
              consistently and improve service standards with interactive
              hospitality training.
            </p>
            <div className="inner-hero-actions">
              <Link href="/contact" className="btn btn-primary btn-lg">
                Request Venue Access
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* ── Platform Screenshot ── */}
        <section className="section" style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <span className="eyebrow">The Platform</span>
              <h3 style={{ margin: "0.5rem 0 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
                Everything you need to manage and measure your team&rsquo;s training.
              </h3>
            </div>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* ── Why It Matters — 2×2 ── */}
        <section className="sbe-mkt-scope" style={{ padding: "64px 24px", width: "100%", borderTop: "1px solid rgba(11,41,27,0.1)", backgroundColor: "var(--mkt-cream-100)" }}>
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

        {/* ── The Approach ── */}
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
            <div className="section-header center">
              <span className="eyebrow">Example Use Cases</span>
              <h2>Real ways venues use the platform</h2>
            </div>
            <div className="card-grid card-grid-3">
              <article className="info-card">
                <h3>New starter onboarding</h3>
                <p>
                  Help junior staff build confidence in greetings, drink orders
                  and guest interaction before peak service.
                </p>
              </article>
              <article className="info-card">
                <h3>Sales improvement</h3>
                <p>
                  Train teams to recommend premium drinks and upsell naturally
                  without sounding scripted.
                </p>
              </article>
              <article className="info-card">
                <h3>Leadership development</h3>
                <p>
                  Support managers with complaint handling, delegation and
                  operational decision-making under pressure.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Comparison Matrix ── */}
        <section className="section section-alt">
          <div className="container">
            <CompareMatrix />
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="venue-enquiry" className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>Train your team with more consistency.</h3>
              <p>
                Whether you run one venue or multiple locations, Serve By
                Example gives your team a clearer path to better service and
                stronger performance.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/contact" className="btn btn-gold btn-lg">
                Request Venue Access
              </Link>
              <Link
                href="/how-it-works"
                className="btn btn-outline-light btn-lg"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
