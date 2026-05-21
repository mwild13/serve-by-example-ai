import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ui/ROICalculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Training for Franchise Systems | Serve By Example",
  description:
    "Replace inconsistent franchisee training with a scalable, AI-powered platform that enforces brand standards across every location without head-office oversight.",
};

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: "Brand standards enforced, not just suggested",
    desc: "Every franchisee&rsquo;s staff trains on the same materials. Service language, upsell scripts, and compliance modules are standardised across the network.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Scalable from 5 to 500 staff",
    desc: "Whether you have 3 locations or 30, the platform scales without additional overhead. New franchisees are onboarded to the training system in minutes.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "High-turnover onboarding without the overhead",
    desc: "Hospitality turnover is real. Self-serve AI onboarding means new starters train themselves through structured modules without pulling management time.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Head-office visibility without micromanagement",
    desc: "Franchise support managers see training completion, compliance status, and readiness scores across all locations — without visiting every site.",
  },
];

export default function FranchiseSystemsPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="inner-hero sol-hero">
          <div className="container">
            <div className="sol-hero-breadcrumb">
              <Link href="/solutions">Solutions</Link>
              <span aria-hidden="true"> / </span>
              <span>Franchise Systems</span>
            </div>
            <span className="eyebrow">Franchises &amp; QSRs</span>
            <h1>High volume. High turnover. High standards, maintained.</h1>
            <p className="inner-hero-sub">
              Franchise training at scale is a logistics problem. Printed manuals get ignored. Video
              modules go unwatched. AI training engages staff the way a great manager would:
              conversationally, adaptively, and on the device they already have in their pocket.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">Try the Demo</Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">View Pricing</Link>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="section trust-section trust-section-green">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card stat-card-green">
                <div className="stat-value stat-value-green">200+</div>
                <div className="stat-label stat-label-green">staff onboarded across 12 locations in under 30 days</div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-value stat-value-green">0</div>
                <div className="stat-label stat-label-green">head-office visits required to enforce training compliance</div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-value stat-value-green">90%</div>
                <div className="stat-label stat-label-green">of training completed on mobile — no desktop required</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">What you get</span>
              <h2>Training infrastructure your franchisees will actually use</h2>
            </div>
            <div className="sol-feature-grid">
              {features.map((f) => (
                <div key={f.title} className="sol-feature-card">
                  <span className="sol-feature-icon">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Case study ── */}
        <section className="section">
          <div className="container">
            <div className="sol-case-study">
              <blockquote className="sol-case-quote">
                &ldquo;Before Serve By Example, every franchisee trained differently. Now they all
                train the same way and I can see exactly which locations are compliant without
                visiting them.&rdquo;
              </blockquote>
              <cite className="sol-case-cite">Franchise Development Manager, QSR group, New South Wales</cite>
              <div className="sol-case-stats">
                <div>
                  <strong>12 locations</strong>
                  <span>onboarded to the platform within the first month</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>compliance visibility without any site visits</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ROICalculator />

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container" style={{ textAlign: "center" }}>
            <span className="eyebrow">Get started</span>
            <h2>Ready to standardise training across your franchise network?</h2>
            <p style={{ maxWidth: 520, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              Try the demo or talk to us about a network rollout.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/demo" className="btn btn-primary btn-lg">Try the Free Demo</Link>
              <Link href="/contact" className="btn btn-secondary btn-lg">Talk to Us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
