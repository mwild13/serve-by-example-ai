import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions by Venue Type | Serve By Example",
  description:
    "AI training built for every hospitality format — pub groups, fine dining, cocktail bars, franchises, and QSRs.",
};

const segments = [
  {
    id: "pub-groups",
    eyebrow: "Multi-Venue Pub Groups",
    headline: "Train hundreds of staff across every site — consistently.",
    body: "Inconsistent training is the silent killer of multi-site brands. One venue does upselling correctly; three others improvise. Serve By Example gives every staff member the same quality training experience, regardless of location, manager, or roster.",
    points: [
      "Standardise brand tone, product knowledge, and service standards across all sites",
      "Onboard new starters in weeks, not months — without pulling managers off the floor",
      "Compare venue health scores and spot skill gaps across your entire group at a glance",
      "Reduce reliance on individual senior staff to train junior team members",
    ],
    stat: { value: "70%", label: "reduction in average onboarding time for multi-site groups" },
    cta: { href: "/demo", label: "See it in action" },
  },
  {
    id: "fine-dining",
    eyebrow: "Fine Dining & Cocktail Bars",
    headline: "Spec sheets memorised. Service elevated. Guests impressed.",
    body: "Premium venues live and die by the detail. A staff member who can't describe a cocktail's ingredients or explain a dish's provenance isn't just uninformed — they damage the experience. Serve By Example trains your team on the precise knowledge that earns loyalty.",
    points: [
      "Drill cocktail recipes, spirit profiles, and cellar knowledge through scenario repetition",
      "Practice premium guest recovery — handling complaints with composure and confidence",
      "Simulate high-pressure service situations before they happen on a Friday night",
      "Track individual staff mastery scores so managers know exactly where to focus coaching",
    ],
    stat: { value: "22%", label: "average upsell revenue lift within 8 weeks of adoption" },
    cta: { href: "/demo", label: "Try a scenario" },
  },
  {
    id: "franchises",
    eyebrow: "Franchises & QSRs",
    headline: "High volume. High turnover. High standards — maintained.",
    body: "Franchise training at scale is a logistics problem. Printed manuals get ignored. Video modules go unwatched. AI training engages staff the way a great manager would — conversationally, adaptively, and on the device they already have in their pocket.",
    points: [
      "Replace printed training manuals with an always-current AI training platform",
      "Train new starters on speed of service, order accuracy, and upsell prompts from day one",
      "Reduce the cost of high-turnover onboarding with a scalable, self-serve training system",
      "Ensure brand compliance across every franchisee location without head-office oversight",
    ],
    stat: { value: "200+", label: "staff onboarded across 12 locations in under 30 days" },
    cta: { href: "/pricing", label: "View plans" },
  },
];

export default function SolutionsPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Solutions</span>
            <h1>Built for the way hospitality actually works.</h1>
            <p className="inner-hero-sub">
              Every venue type has different priorities. Serve By Example adapts to yours — whether
              you&rsquo;re running a pub group, a cocktail bar, or a national franchise.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Demo
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* ── Segment sections ── */}
        {segments.map((seg, i) => (
          <section
            key={seg.id}
            id={seg.id}
            className={`section${i % 2 === 1 ? " section-alt" : ""}`}
          >
            <div className="container">
              <div className="solutions-segment">
                <div className="solutions-segment-text">
                  <span className="eyebrow">{seg.eyebrow}</span>
                  <h2>{seg.headline}</h2>
                  <p className="solutions-segment-body">{seg.body}</p>
                  <ul className="check-list solutions-check-list">
                    {seg.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link href={seg.cta.href} className="btn btn-primary">
                    {seg.cta.label}
                  </Link>
                </div>
                <div className="solutions-segment-stat">
                  <div className="solutions-stat-card">
                    <div className="solutions-stat-value">{seg.stat.value}</div>
                    <div className="solutions-stat-label">{seg.stat.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container" style={{ textAlign: "center" }}>
            <span className="eyebrow">Get started</span>
            <h2>Your venue type. Your training platform.</h2>
            <p style={{ maxWidth: 520, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              Start with a free demo and see how Serve By Example fits your operation — no commitment required.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Free Demo
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-lg">
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .solutions-segment {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 64px;
          align-items: start;
        }
        .solutions-segment-body {
          color: var(--text-soft);
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .solutions-check-list {
          margin-bottom: 32px;
        }
        .solutions-segment-stat {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 8px;
        }
        .solutions-stat-card {
          background: var(--green-light);
          border: 1px solid rgba(31, 78, 55, 0.15);
          border-radius: var(--radius-xl);
          padding: 36px 28px;
          text-align: center;
        }
        .solutions-stat-value {
          font-family: var(--font-heading);
          font-size: 3.2rem;
          font-weight: 700;
          color: var(--green);
          line-height: 1;
          margin-bottom: 12px;
        }
        .solutions-stat-label {
          font-size: 0.82rem;
          color: var(--text-soft);
          line-height: 1.5;
        }
        @media (max-width: 860px) {
          .solutions-segment {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .solutions-segment-stat {
            justify-content: flex-start;
          }
          .solutions-stat-card {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
    </div>
  );
}
