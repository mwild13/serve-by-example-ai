import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/SectionHeading";

export default function PricingPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="page-hero">
          <div className="container">
            <div className="eyebrow">Pricing</div>
            <h1>Simple plans for individuals and venue teams.</h1>
            <p>
              Early access pricing for founding members and venue teams. Start
              with the demo, upgrade when you are ready, and lock in launch-stage
              rates while onboarding is still hands-on.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 24 }}>
          <div className="container">
            <div className="pricing-grid">
              <div className="price-card">
                <h3>Free Demo</h3>
                <div className="price">
                  $0 <small>/ try it</small>
                </div>
                <div className="price-note">
                  Best for curious users wanting to preview the platform.
                </div>
                <ul className="feature-list">
                  <li>Limited demo access</li>
                  <li>Sample AI prompts</li>
                  <li>1 bartender module preview</li>
                </ul>
                <Link href="/demo" className="btn btn-secondary">
                  Start Demo
                </Link>
              </div>

              <div className="price-card featured">
                <h3>Pro</h3>
                <div className="price">
                  $19 <small>/ month</small>
                </div>
                <div className="price-note">
                  Best for individual bartenders and hospitality staff.
                </div>
                <ul className="feature-list">
                  <li>Full bartending training</li>
                  <li>Sales and service prompts</li>
                  <li>Management starter modules</li>
                  <li>Progress tracking</li>
                </ul>
                <Link href="/login" className="btn btn-gold">
                  Join Pro
                </Link>
              </div>

              <div className="price-card">
                <h3>Venue</h3>
                <div className="price">
                  $149 <small>/ month</small>
                </div>
                <div className="price-note">
                  Best for bars, pubs and teams wanting structured staff
                  training.
                </div>
                <ul className="feature-list">
                  <li>Team access</li>
                  <li>Multiple user logins</li>
                  <li>Management modules</li>
                  <li>Venue onboarding framework</li>
                </ul>
                <Link href="/for-venues#venue-enquiry" className="btn btn-secondary">
                  Request Venue Access
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="What each plan solves"
              title="Pricing should reflect real use cases."
              copy="One free preview, one core individual plan and one venue plan for teams that need structured rollout support."
            />

            <div className="grid-3">
              <div className="card">
                <h3>For individuals</h3>
                <p>
                  Build confidence, improve service and strengthen practical
                  hospitality knowledge.
                </p>
              </div>
              <div className="card">
                <h3>For staff development</h3>
                <p>
                  Use the platform as a learning asset alongside real on-shift
                  experience.
                </p>
              </div>
              <div className="card">
                <h3>For venues</h3>
                <p>
                  Standardise training and improve readiness without relying on
                  the same manual onboarding every time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}