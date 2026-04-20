import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">About us</div>
            <h1>Built by people who know hospitality</h1>
            <p className="hero-sub">
              Serve By Example started from a simple frustration: great hospitality training
              was out of reach for most venues — too expensive, too generic, too slow. We
              built the platform we wished existed.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container about-grid">
            <div className="about-block">
              <h2>The problem</h2>
              <p>
                Most venue staff learn on the job — which means inconsistent guest
                experiences, slow onboarding, and managers constantly plugging gaps. Written
                manuals gather dust. One-off training days are forgotten within weeks.
              </p>
            </div>
            <div className="about-block">
              <h2>Our approach</h2>
              <p>
                Scenario-based AI training that fits around shifts. Staff practice real
                situations — difficult guests, upsell moments, service recovery — and get
                instant, specific feedback. No dedicated trainer required.
              </p>
            </div>
            <div className="about-block">
              <h2>Who we&apos;re for</h2>
              <p>
                Independent bars, hotel F&amp;B teams, restaurant groups, and event venues
                that want consistent, confident staff without the overhead of a full training
                department.
              </p>
            </div>
            <div className="about-block">
              <h2>Where we&apos;re headed</h2>
              <p>
                We&apos;re building the complete staff development platform for hospitality —
                from first-shift onboarding through to team management and progression
                tracking.
              </p>
            </div>
          </div>
        </section>

        <section className="section about-cta-section">
          <div className="container">
            <div className="about-cta">
              <h2>Ready to see it in action?</h2>
              <p>
                Try the free demo — no account needed. See exactly how it feels for your
                staff.
              </p>
              <div className="hero-actions">
                <Link href="/demo" className="btn btn-primary btn-lg">
                  Try the demo
                </Link>
                <Link href="/contact" className="btn btn-secondary btn-lg">
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
