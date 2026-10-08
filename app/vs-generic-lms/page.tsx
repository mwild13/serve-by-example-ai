import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { Ledger, RuledList, SectionHead, type LedgerRow, type RuledItem } from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serve By Example vs Generic LMS | Hospitality Training Built for Real Venues",
  description:
    "Generic LMS platforms were built for corporate compliance training — not hospitality. See exactly how Serve By Example compares: scenario scoring, shift-ready modules, and real-time manager visibility vs. passive video courses.",
  alternates: { canonical: "/vs-generic-lms" },
};

const COMPARISON = [
  {
    topic: "Training format",
    generic: "Long videos and passive click-through modules. Staff watch, answer a quiz, move on. No pressure, no real skill measurement.",
    sbe: "Scenario roleplay evaluated across 5 service dimensions in real time. Rapid-fire quizzes, tap-based challenges, and spaced repetition. Active recall, not passive consumption.",
  },
  {
    topic: "Industry focus",
    generic: "Built for corporate compliance: OH&S, HR onboarding, software tutorials. Content is generic by necessity.",
    sbe: "Built exclusively for hospitality: bartending specs, upsell technique, guest complaint recovery, RSA-adjacent knowledge, and service standards.",
  },
  {
    topic: "Skill measurement",
    generic: "Pass/fail quizzes with a percentage score. No dimensional scoring, no feedback on why an answer was wrong.",
    sbe: "Every scenario response scored across 5 dimensions: communication, hospitality, problem-solving, professionalism, and guest experience. Written AI feedback on every answer.",
  },
  {
    topic: "Manager visibility",
    generic: "Module completion rates in a spreadsheet export. No real-time alerts, no skill-gap analysis, no per-staff drill-down.",
    sbe: "The Manager Console shows every module completion, quiz score, and scenario session in real time. Managers are alerted when compliance lapses. No chasing, no guessing.",
  },
  {
    topic: "Mobile experience",
    generic: "Responsive website at best. Not designed to be used between shifts on a phone in a noisy back-of-house.",
    sbe: "Mobile-first from the ground up. Staff train between shifts, pre-service, or on the floor. 90%+ completion rates on mobile.",
  },
  {
    topic: "Setup time",
    generic: "Weeks of content creation, SCORM uploads, user provisioning, and course mapping before a single staff member trains.",
    sbe: "Most venues are fully set up within a day. Pre-built hospitality modules, starter templates, and venue code invites — no content creation required.",
  },
  {
    topic: "Multi-venue support",
    generic: "Additional licences at flat per-seat rates with no cross-venue analytics or group health scoring.",
    sbe: "Group health scores, cross-venue skill gap analysis, and up to 125 staff across 5 venues managed from one console.",
  },
  {
    topic: "Engagement",
    generic: "Staff log in when forced to. Completion deadlines and reminders via email are the engagement strategy.",
    sbe: "Badge system, streaks, leaderboards, and daily focus recommendations keep staff returning voluntarily. Built for the people who actually have to use it.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://servebyexample.co" },
    { "@type": "ListItem", "position": 2, "name": "vs Generic LMS", "item": "https://servebyexample.co/vs-generic-lms" },
  ],
};

// Figures carried over from the previous page. "90%+" and the figures in the
// business case are flagged in To_do_list.md ("Marketing copy to source or remove").
const DIFFERENCES: LedgerRow[] = [
  { metric: "5", title: "Service dimensions scored", body: "Per AI scenario response — not just pass/fail." },
  { metric: "40", unit: "+", title: "Hospitality-specific modules", body: "Across bartending, sales, and management." },
  { metric: "1", unit: "day", title: "Average setup time", body: "No content creation or SCORM uploads required." },
  { metric: "90", unit: "%+", title: "Mobile completion rates", body: "When staff train between shifts on their phone." },
];

const BUSINESS_CASE: RuledItem[] = [
  {
    title: "Poor training is a direct revenue problem",
    body: "When frontline staff cannot upsell menu options confidently, recommend pairings, or manage guest complaints under pressure, every single shift costs you in missed sales and lost repeat customers.",
  },
  {
    title: "Attrition starts with weak onboarding",
    body: "Up to 39% of FOH and 42% of BOH staff quit within their first 90 days. Structured, AI-guided scenario training builds confidence early and directly reduces turnover by 20–23%.",
  },
  {
    title: "Manager hours are your most expensive resource",
    body: "Every hour a senior manager repeats the same onboarding basics is an hour lost from active floor support, venue operations, and coaching your best staff.",
  },
  {
    title: "Training only works if staff actually do it",
    body: "Long videos and physical training binders are ignored by younger staff. Interactive mobile modules built for between-shift use see 90%+ completion rates vs. 20–30% for video-based LMS courses.",
  },
];

export default function VsGenericLmsPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        <PageHero
          eyebrow="Serve By Example vs Generic LMS"
          title="Why a generic LMS won’t work for hospitality."
          subtitle="Generic LMS platforms were built for corporate compliance training: long videos, passive click-through modules, and no real skill measurement. Hospitality training requires something built for the reality of a busy service — not a boardroom."
          actions={[
            { label: "Try the Free Demo", href: "/demo", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        <Ledger
          tone="alt"
          kicker="The short version"
          title="Four differences you feel on a shift."
          rows={DIFFERENCES}
        />

        {/* ── Head-to-head: a hairline table, stacked per area on phones ── */}
        <section className="sbe-mkt-versus">
          <div className="container">
            <SectionHead
              kicker="Head-to-head"
              title="What generic LMS platforms get wrong for hospitality."
              lede="Eight dimensions where the platform design fundamentally differs."
            />
            <table className="sbe-mkt-versus-table">
              <thead>
                <tr>
                  <th scope="col">Area</th>
                  <th scope="col">Generic LMS</th>
                  <th scope="col">Serve By Example</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.topic}>
                    <th scope="row">{row.topic}</th>
                    <td data-label="Generic LMS">{row.generic}</td>
                    <td data-label="Serve By Example">{row.sbe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <RuledList
          tone="alt"
          kicker="The business case"
          title="Why the training format actually matters for your bottom line."
          lede="Australia’s hospitality sector operates on 3–9% net profit margins. The cost of weak training isn’t just recruitment — it’s the revenue drain of inconsistent floor shifts compounding week after week."
          items={BUSINESS_CASE}
        />

        <CTABand
          title="See what hospitality training looks like when it’s built for hospitality."
          copy="No credit card required. Full platform access in the demo."
          primary={{ label: "Try the Free Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
