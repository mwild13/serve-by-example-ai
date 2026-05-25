import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Hotel F&B Teams | Serve By Example",
  description:
    "From all-day dining to rooftop bars, equip every hotel F&B outlet with consistent, scalable interactive training. Serve By Example works across multiple outlets, service styles, and staff levels.",
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
    title: "One platform across all outlets",
    desc: "Train your all-day restaurant, room service team, rooftop bar, and banquet staff from a single platform. Consistent standards regardless of outlet.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: "Guest experience standards, not just product knowledge",
    desc: "Hotel guests have elevated expectations. Our scenarios train staff on the language, demeanour, and problem resolution that five-star service demands.",
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
    title: "Fast onboarding for seasonal and casual staff",
    desc: "Hotel F&B teams turn over fast, especially seasonally. Our structured onboarding gets casual and new starters performing to standard within weeks.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: "Compliance and certification tracked",
    desc: "RSA modules, allergen awareness, and brand standards are tracked automatically. F&B managers receive alerts before any certification lapses.",
  },
];

export default function HotelFBPage() {
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
              <span>Hotel F&amp;B</span>
            </div>
            <span className="eyebrow">Hotel Food &amp; Beverage</span>
            <h1>Multiple outlets. One standard of service.</h1>
            <p className="inner-hero-sub">
              Hotel F&amp;B is complex: multiple outlets, rotating staff, elevated guest
              expectations, and non-negotiable compliance requirements. Serve By Example gives your
              entire F&amp;B operation a single, consistent training platform — from the breakfast
              shift to the late-night bar.
            </p>
            <div className="inner-hero-actions">
              <Link href="/for-venues#venue-enquiry" className="btn btn-primary btn-lg">Request Venue Access</Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">View Pricing</Link>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="section trust-section trust-section-green">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card stat-card-green">
                <div className="stat-value stat-value-green">40%</div>
                <div className="stat-label stat-label-green">reduction in onboarding time for seasonal intake</div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-value stat-value-green">19</div>
                <div className="stat-label stat-label-green">languages supported for diverse hotel teams</div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-value stat-value-green">24/7</div>
                <div className="stat-label stat-label-green">Live coaching available across all shifts</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Hotel F&amp;B features</span>
              <h2>Purpose-built for hotel F&amp;B complexity</h2>
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
            <h2>Ready to standardise your hotel F&amp;B training?</h2>
            <p style={{ maxWidth: 520, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              Book a walkthrough or try the demo yourself — no commitment required.
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
