import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions by Venue Type | Serve By Example",
  description:
    "Interactive training built for every hospitality format: pub groups, fine dining, cocktail bars, franchises, and QSRs.",
  alternates: { canonical: "/solutions" },
};

const segments = [
  {
    id: "pub-groups",
    eyebrow: "Multi-Venue Pub Groups",
    headline: "Train hundreds of staff across every site, consistently.",
    body: "Inconsistent training is the silent killer of multi-site brands. One venue does upselling correctly; three others improvise. Serve By Example gives every staff member the same quality training experience, regardless of location, manager, or roster.",
    points: [
      "Standardise brand tone, product knowledge, and service standards across all sites",
      "Onboard new starters in weeks, not months, without pulling managers off the floor",
      "Compare venue health scores and spot skill gaps across your entire group at a glance",
      "Reduce reliance on individual senior staff to train junior team members",
    ],
    stat: { value: "3", label: "stage structured onboarding path — from knowledge to verified floor readiness" },
    cta: { href: "/solutions/pub-groups", label: "See pub group features" },
  },
  {
    id: "fine-dining",
    eyebrow: "Fine Dining & Cocktail Bars",
    headline: "Spec sheets memorised. Service elevated. Guests impressed.",
    body: "Premium venues live and die by the detail. A staff member who can't describe a cocktail's ingredients or explain a dish's provenance isn't just uninformed. They damage the experience. Serve By Example trains your team on the precise knowledge that earns loyalty.",
    points: [
      "Drill cocktail recipes, spirit profiles, and cellar knowledge through scenario repetition",
      "Practice premium guest recovery, handling complaints with composure and confidence",
      "Simulate high-pressure service situations before they happen on a Friday night",
      "Track individual staff mastery scores so managers know exactly where to focus coaching",
    ],
    stat: { value: "65+", label: "bartending and service scenarios to practise before the next big service" },
    cta: { href: "/solutions/fine-dining", label: "See fine dining features" },
  },
  {
    id: "franchises",
    eyebrow: "Franchises & QSRs",
    headline: "High volume. High turnover. High standards, maintained.",
    body: "Franchise training at scale is a logistics problem. Printed manuals get ignored. Video modules go unwatched. Scenario-based training engages staff the way a great manager would: conversationally, adaptively, and on the device they already have in their pocket.",
    points: [
      "Replace printed training manuals with an always-current training platform",
      "Train new starters on speed of service, order accuracy, and upsell prompts from day one",
      "Reduce the cost of high-turnover onboarding with a scalable, self-serve training system",
      "Ensure brand compliance across every franchisee location without head-office oversight",
    ],
    stat: { value: "200+", label: "staff capacity across 12+ locations, supported from day one" },
    cta: { href: "/solutions/franchise-systems", label: "See franchise features" },
  },
  {
    id: "hotel-fb",
    eyebrow: "Hotel F&B",
    headline: "Consistent service standards across every outlet, every shift.",
    body: "Hotel F&B teams face a unique training challenge: multiple outlets, rotating staff, and guests with elevated expectations. Serve By Example gives every team member — whether they're on room service or behind the rooftop bar — the same quality training experience.",
    points: [
      "Train all-day dining, room service, rooftop bars, and banquet staff from a single platform",
      "Build the language, composure, and problem-resolution skills that five-star service demands",
      "Track readiness scores per outlet so coaching targets the right team at the right time",
      "Onboard seasonal and contract staff quickly without pulling supervisors off the floor",
    ],
    stat: { value: "5★", label: "service standards trained through scenario practice, not classroom briefings" },
    cta: { href: "/solutions/hotel-fb", label: "See hotel F&B features" },
  },
  {
    id: "multi-venue",
    eyebrow: "Multi-Venue Groups",
    headline: "One console. Five venues. 125 staff. Full visibility.",
    body: "Multi-venue groups lose consistency at scale. The training that works at your flagship rarely reaches every site. Serve By Example gives you a centralised view of every venue's readiness, with the ability to compare, manage, and course-correct across your entire group.",
    points: [
      "Compare venue health scores side by side to see which site needs coaching before it shows in revenue",
      "Manage up to 125 staff across 5 venues from one console — transfer, assign, and track",
      "Standardise brand voice, product knowledge, and service protocols across all locations",
      "Spot individual skill gaps before they become team-wide performance problems",
    ],
    stat: { value: "125", label: "staff manageable across 5 venues from the Manager Console" },
    cta: { href: "/solutions/pub-groups", label: "See multi-venue features" },
  },
];

export default function SolutionsPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <PageHero
          eyebrow="Solutions"
          title="Built for the way hospitality actually works."
          subtitle="Every venue type has different priorities. Serve By Example adapts to yours, whether you’re running a pub group, a cocktail bar, or a national franchise."
          actions={[
            { label: "Try the Demo", href: "/demo", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        {/* ── Segment sections — alternating asymmetric splits, kept per
              Pages-Redesign.md §6.3 (this is the good pattern, not a grid) ── */}
        {segments.map((seg, i) => (
          <section
            key={seg.id}
            id={seg.id}
            className={`section${i % 2 === 1 ? " section-alt" : ""}`}
          >
            <div className="container">
              <div className="sbe-mkt-solutions-segment">
                <div>
                  <span className="eyebrow">{seg.eyebrow}</span>
                  <h2>{seg.headline}</h2>
                  <p className="sbe-mkt-solutions-segment-body">{seg.body}</p>
                  <ul className="check-list sbe-mkt-solutions-check-list">
                    {seg.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link href={seg.cta.href} className="btn btn-primary">
                    {seg.cta.label}
                  </Link>
                </div>
                <div className="sbe-mkt-solutions-segment-stat">
                  <div className="sbe-mkt-solutions-stat-card">
                    <div className="sbe-mkt-solutions-stat-value">{seg.stat.value}</div>
                    <div className="sbe-mkt-solutions-stat-label">{seg.stat.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── CTA ── */}
        <CTABand
          background="green"
          eyebrow="Get started"
          title="Your venue type. Your training platform."
          copy="Start with a free demo and see how Serve By Example fits your operation, no commitment required."
          primary={{ label: "Try the Free Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>

      <Footer />
    </div>
  );
}
