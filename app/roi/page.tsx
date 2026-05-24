import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ui/ROICalculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI Calculator | Serve By Example",
  description:
    "Calculate the revenue impact of AI-powered training for your hospitality team. See what better training is worth to your venue.",
};

const supportingStats = [
  {
    value: "3×",
    label: "faster onboarding",
    desc: "Average time to full service confidence drops from 6 months to under 6 weeks.",
  },
  {
    value: "70%",
    label: "less manager overhead",
    desc: "Venue managers spend dramatically less time running induction sessions and shadowing new starters.",
  },
  {
    value: "+15%",
    label: "avg upsell lift",
    desc: "Staff trained on AI scenario practice consistently outperform on upsell metrics within 8 weeks.",
  },
];

export default function ROIPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">ROI Calculator</span>
            <h1>Calculate your training return on investment.</h1>
            <p className="inner-hero-sub">
              Adjust the inputs below to see what better-trained staff means for your venue&rsquo;s
              bottom line, then share the result with your team or stakeholders.
            </p>
          </div>
        </section>

        {/* ── Calculator ── */}
        <section className="section section-alt" style={{ paddingTop: 0 }}>
          <div className="container">
            <ROICalculator />
          </div>
        </section>

        {/* ── Supporting stats ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">The numbers behind the calculator</span>
              <h2>Where the gains come from.</h2>
              <p>
                These benchmarks are drawn from venues using AI-assisted training versus traditional
                induction methods.
              </p>
            </div>
            <div className="roi-stats-grid">
              {supportingStats.map((stat) => (
                <div key={stat.value} className="roi-stat-card">
                  <div className="roi-stat-value">{stat.value}</div>
                  <div className="roi-stat-label">{stat.label}</div>
                  <p className="roi-stat-desc">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-alt">
          <div className="container" style={{ textAlign: "center" }}>
            <span className="eyebrow">Ready to see it live?</span>
            <h2>Put the numbers into practice.</h2>
            <p style={{ maxWidth: 480, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              The calculator gives you the estimate. A demo shows you how it actually works for your team.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Demo
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .roi-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 48px;
        }
        .roi-stat-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 32px 28px;
          text-align: center;
        }
        .roi-stat-value {
          font-family: var(--font-heading);
          font-size: 3rem;
          font-weight: 700;
          color: var(--green);
          line-height: 1;
          margin-bottom: 8px;
        }
        .roi-stat-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--green-deep);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 12px;
        }
        .roi-stat-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin: 0;
        }
        @media (max-width: 720px) {
          .roi-stats-grid {
            grid-template-columns: 1fr;
            max-width: 380px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </div>
  );
}
