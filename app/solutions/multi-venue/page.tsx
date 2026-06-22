import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Multi-Venue Groups | Serve By Example",
  description:
    "Centralised staff training and analytics for multi-venue hospitality groups. Compare venue health, spot skill gaps across sites, and manage up to 125 staff from one console.",
};

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <path d="M9 22v-4h6v4"/>
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
      </svg>
    ),
    title: "Group health scores at a glance",
    desc: "See readiness scores for every venue side by side. Identify which site needs attention before it shows up in your revenue or your reviews.",
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
    title: "Staff managed across all venues centrally",
    desc: "One console, up to 125 staff across 5 venues. Transfer staff between venues, assign targeted training, and compare individual performance across your group.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Skill gap analysis across the group",
    desc: "The platform identifies patterns across venues. If multiple sites have weak upsell scores, you know to run group-wide coaching before it affects revenue.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: "Competitive training with Live Scenarios",
    desc: "Staff across all venues compete on the same weekly ranked challenges. Cross-venue leaderboards create healthy competition and surface your best performers.",
  },
];

export default function MultiVenuePage() {
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
              <span>Multi-Venue Groups</span>
            </div>
            <span className="eyebrow">Multi-Venue Groups</span>
            <h1>Manage every venue&rsquo;s training from one place.</h1>
            <p className="inner-hero-sub">
              Running multiple venues means managing complexity at scale. Serve By Example gives
              group operators a single platform to train, track, and compare staff performance across
              every site, with the analytics to act before problems compound.
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
                <div className="metrics-strip-value">5 venues</div>
                <div className="metrics-strip-label">managed from a single console on our Multi-Venue plan</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">125</div>
                <div className="metrics-strip-label">staff supported across all venues on the top tier</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">1 view</div>
                <div className="metrics-strip-label">group health score across every venue, instantly</div>
              </div>
            </div>
            <p className="metrics-strip-disclaimer">*Based on centralised hospitality analytics modelling and group training industry averages.</p>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Group operations</span>
              <h2>The operator&rsquo;s view across your entire group</h2>
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
            <h2>Ready to take the group view?</h2>
            <p style={{ maxWidth: 520, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              Talk to us about a multi-venue setup or try the platform yourself.
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
