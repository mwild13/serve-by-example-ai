import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Fine Dining & Cocktail Bars | Serve By Example",
  description:
    "Train your team on the precise product knowledge and elevated service standards that premium venues demand. Cocktail specs, wine pairings, guest recovery — all scenario-coached.",
};

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 10v12"/>
        <path d="M5 10C5 5.58 8.13 2 12 2s7 3.58 7 8"/>
      </svg>
    ),
    title: "Cocktail and wine knowledge drilled daily",
    desc: "Staff practise recipes, spirit profiles, and provenance stories through scenario repetition until they can describe them fluently under pressure.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Premium guest recovery training",
    desc: "Handle complaints, special requests, and high-expectation guests with the composure and language that protects your reputation and earns repeat visits.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Upsell confidence scored and tracked",
    desc: "The platform tracks every staff member&rsquo;s upsell scenario performance and flags who needs targeted coaching before the next big service.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: "High-pressure simulation before Friday night",
    desc: "Staff rehearse service timing, course pacing, and multi-table management in scenario practice — before the stakes are real.",
  },
];

export default function FineDiningPage() {
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
              <span>Fine Dining &amp; Bars</span>
            </div>
            <span className="eyebrow">Fine Dining &amp; Cocktail Bars</span>
            <h1>Spec sheets memorised. Service elevated. Guests impressed.</h1>
            <p className="inner-hero-sub">
              Premium venues live and die by the detail. A staff member who can&rsquo;t describe a
              cocktail&rsquo;s ingredients or explain a dish&rsquo;s provenance isn&rsquo;t just
              uninformed — they damage the experience. Serve By Example trains your team on the
              precise knowledge that earns loyalty.
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
                <div className="metrics-strip-value">22%</div>
                <div className="metrics-strip-label">average upsell revenue lift within 8 weeks</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">65+</div>
                <div className="metrics-strip-label">bartending and service scenarios to practise</div>
              </div>
              <div className="metrics-strip-item">
                <div className="metrics-strip-value">5 dims</div>
                <div className="metrics-strip-label">every response evaluated across 5 service dimensions</div>
              </div>
            </div>
            <p className="metrics-strip-disclaimer">*Based on premium venue recipe specification audits and cocktail sales velocity averages.</p>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Premium training tools</span>
              <h2>Training as precise as your menu</h2>
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
            <h2>Ready to elevate your service standards?</h2>
            <p style={{ maxWidth: 520, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              Try a live bartending or upsell scenario now — no sign-up required.
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
