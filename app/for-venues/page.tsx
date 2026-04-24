import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaitlistSection from "@/components/ui/WaitlistSection";
import DashboardMockup from "@/components/ui/DashboardMockup";

const whyItMatters = [
  {
    title: "Poor training is a revenue problem",
    text: "When staff can't upsell confidently, handle complaints or recommend drinks well, every shift costs you in missed sales and guests who don't come back.",
  },
  {
    title: "Turnover starts with poor onboarding",
    text: "New staff who feel underprepared leave faster. A structured, scenario-based start builds confidence — and confident staff stay.",
  },
  {
    title: "Manager time is your most expensive resource",
    text: "Every hour spent repeating the same onboarding basics is time away from service, operations and developing your team.",
  },
  {
    title: "Gaps are invisible until they become complaints",
    text: "Without visibility into where your team stands, training failures only surface as incidents. SBE shows you weak areas before they reach your guests.",
  },
  {
    title: "Your staff are your brand",
    text: "Every greeting, recommendation and guest interaction is a brand moment. How your team performs on shift determines your venue's reputation.",
  },
  {
    title: "Training only works if staff actually do it",
    text: "Passive training gets ignored. AI-powered scenario practice is short, relevant and engaging — designed to fit between shifts, not replace them.",
  },
];

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
              consistently and improve service standards with AI-powered
              hospitality training.
            </p>
            <div className="inner-hero-actions">
              <Link href="/pricing" className="btn btn-primary btn-lg">
                View Venue Pricing
              </Link>
              <Link href="#venue-enquiry" className="btn btn-secondary btn-lg">
                Request Venue Access
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

        {/* ── Why It Matters ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Why It Matters</span>
              <h2>The business case for better-trained staff.</h2>
              <p>Australia&rsquo;s hospitality sector faces some of the highest staff turnover of any industry. The cost isn&rsquo;t just recruitment &mdash; it&rsquo;s every inconsistent shift in between.</p>
            </div>
            <div className="card-grid card-grid-3">
              {whyItMatters.map((item) => (
                <article key={item.title} className="info-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
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

        <WaitlistSection
          id="venue-enquiry"
          eyebrow="Venue access"
          title="Request early access for your venue team."
          copy="Join the venue rollout list for onboarding updates, early-access windows and pricing suited to bars, pubs and hospitality groups."
          inputLabel="Venue contact email"
          inputPlaceholder="ops@yourvenue.com"
          buttonLabel="Request venue access"
          successTitle="Venue enquiry received."
          successCopy="You are on the venue rollout list. We will contact you with launch timing, access options and next steps for team onboarding."
          successPrimaryHref="/pricing"
          successPrimaryLabel="Review venue pricing"
          successSecondaryHref="/demo"
          successSecondaryLabel="Try the demo"
          successSteps={[
            "We group venue demand by rollout timing and onboarding capacity.",
            "You receive early-access updates and any pricing changes before public release.",
            "When spots open, you get a direct next step for bringing your team on platform.",
          ]}
        />

        {/* ── CTA ── */}
        <section className="section section-cta">
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
              <Link href="#venue-enquiry" className="btn btn-gold btn-lg">
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
