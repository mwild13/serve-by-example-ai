import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaitlistSection from "@/components/WaitlistSection";

const benefits = [
  {
    title: "Faster staff onboarding",
    text: "Give new team members structured training before and between shifts instead of relying only on busy floor time.",
  },
  {
    title: "More consistent service",
    text: "Train staff on communication, sales, drink knowledge and venue decision-making through one clear system.",
  },
  {
    title: "Better sales confidence",
    text: "Build natural upselling and recommendation skills that improve guest experience and increase spend.",
  },
  {
    title: "Manager visibility",
    text: "See who is completing training, where the gaps are and which areas need reinforcement across the team.",
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

        {/* ── Benefits Grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="card-grid card-grid-2">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="info-card">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why It Matters ── */}
        <section className="section">
          <div className="container">
            <div className="split-grid">
              <div>
                <span className="eyebrow">Why It Matters</span>
                <h2 className="split-heading">
                  Training should support service, not slow it down.
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
