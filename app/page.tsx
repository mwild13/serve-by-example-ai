import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">Hospitality Training Platform</span>
              <h1>Serve By Example AI</h1>
              <p>
                AI-powered bartending, hospitality and management training that
                helps staff learn faster, build confidence and perform better in
                real-world venue environments.
              </p>

              <div className="hero-actions">
                <Link href="/demo" className="btn btn-primary">
                  Start Free Demo
                </Link>
                <Link href="/dashboard" className="btn btn-secondary">
                  View Training Modules
                </Link>
              </div>

              <div className="hero-stats">
                <article className="stat-card">
                  <div className="stat-value">3x</div>
                  <div className="stat-label">Faster Onboarding</div>
                </article>
                <article className="stat-card">
                  <div className="stat-value">92%</div>
                  <div className="stat-label">Completion Rate</div>
                </article>
                <article className="stat-card">
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">AI Coach Access</div>
                </article>
              </div>
            </div>

            <aside className="hero-panel">
              <h3>Today in Training</h3>
              <ul>
                <li>
                  <strong>Bartending Essentials</strong>
                  <span>Cocktail build speed and service flow</span>
                </li>
                <li>
                  <strong>Upsell Intelligence</strong>
                  <span>Practical prompts for higher ticket averages</span>
                </li>
                <li>
                  <strong>Shift Leadership</strong>
                  <span>Team standards and venue decision-making</span>
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Built For High-Performance Venue Teams</h2>
              <p>
                Real scenarios, rapid feedback and role-based pathways for bars,
                restaurants and hospitality groups.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <h4>Bartending Training</h4>
                <p>
                  Learn cocktails, spirits, service rhythm and practical bar
                  systems your team can apply immediately.
                </p>
              </article>

              <article className="feature-card">
                <h4>Sales Training</h4>
                <p>
                  Strengthen upselling, menu language and customer interaction
                  with AI-guided roleplay.
                </p>
              </article>

              <article className="feature-card">
                <h4>Management Training</h4>
                <p>
                  Build leadership confidence, enforce standards and improve
                  shift decisions under pressure.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>Ready To Train Smarter?</h3>
              <p>
                Launch your first team pathway in minutes and give every staff
                member a clear plan to level up.
              </p>
            </div>
            <Link href="/demo" className="btn btn-gold">
              Book Demo
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
