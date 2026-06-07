import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Pub Groups | Serve By Example",
  description:
    "Standardise training across every site in your pub group. Consistent service, faster onboarding, and real visibility into staff readiness, from a single console.",
};

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
      </svg>
    ),
    title: "Consistent training across all sites",
    desc: "Every staff member in every venue goes through the same quality training. No more \"it depends on the manager\" variation.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Group-wide visibility in one console",
    desc: "Compare readiness scores across venues, spot skill gaps before they become service issues, and direct coaching where it matters.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "New starters floor-ready in weeks",
    desc: "Structured onboarding modules get bartenders and floor staff service-ready without pulling your best people off their shifts to train.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: "Compliance tracked automatically",
    desc: "RSA, responsible service, and venue policy modules are completed and logged. Managers are alerted before anything lapses.",
  },
];

export default function PubGroupsPage() {
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
              <span>Pub Groups</span>
            </div>
            <span className="eyebrow">Multi-Venue Pub Groups</span>
            <h1>Train every venue. Manage from one place.</h1>
            <p className="inner-hero-sub">
              Inconsistent training is the silent killer of multi-site pub brands. One venue nails
              upselling; three others improvise. Serve By Example gives every staff member the same
              quality training experience, regardless of location, manager, or roster.
            </p>
            <div className="inner-hero-actions">
              <Link href="/contact" className="btn btn-primary btn-lg">Request Venue Access</Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">View Pricing</Link>
            </div>
          </div>
        </section>

        {/* ── Metrics strip ── */}
        <section className="section trust-section trust-section-green metrics-strip">
          <div className="container">
            <div className="metrics-strip-row">
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">70%</div>
                <div className="metrics-strip-label">reduction in average onboarding time</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">6 wks</div>
                <div className="metrics-strip-label">to floor-ready from day one</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">1 console</div>
                <div className="metrics-strip-label">to manage every site and every staff member</div>
              </div>
            </div>
            <p className="metrics-strip-disclaimer">*Based on hospitality group onboarding models and multi-venue industry averages.</p>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Multi-site management</span>
              <h2>Built for the complexity of a pub group</h2>
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

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container" style={{ textAlign: "center" }}>
            <span className="eyebrow">Get started</span>
            <h2>Ready to standardise training across your group?</h2>
            <p style={{ maxWidth: 520, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              Start with a free demo. No commitment, no credit card.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/demo" className="btn btn-primary btn-lg">Try the Demo</Link>
              <Link href="/contact" className="btn btn-secondary btn-lg">Talk to Us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
