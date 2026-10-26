import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { Ledger, RuledList, SectionHead, type LedgerRow, type RuledItem } from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serve By Example vs Generic LMS | Hospitality Training Built for Real Venues",
  description:
    "Generic LMS platforms were built for corporate compliance training, not hospitality. See exactly how Serve By Example compares: scenario scoring, shift-ready modules, and real-time manager visibility vs. passive video courses.",
  alternates: { canonical: "/vs-generic-lms" },
};

const COMPARISON = [
  {
    topic: "Training format",
    generic: "Long videos and passive click-through modules. Staff watch, answer a quiz, move on. No pressure, no real skill measurement.",
    sbe: "Live Guest conversations with a guest who talks back, quizzes in six formats, mixed drills, tap-based challenges and spaced repetition. Active recall, not passive consumption.",
  },
  {
    topic: "Industry focus",
    generic: "Built for corporate compliance: OH&S, HR onboarding, software tutorials. Content is generic by necessity.",
    sbe: "Built exclusively for hospitality: bartending specs, upsell technique, guest complaint recovery, RSA-adjacent knowledge, and service standards.",
  },
  {
    topic: "Skill measurement",
    generic: "Pass/fail quizzes with a percentage score. No dimensional scoring, no feedback on why an answer was wrong.",
    sbe: "Every Live Guest conversation shows how the guest felt at each turn and what each reply did to speed, safety and money, with a score and a short debrief. Every quiz answer comes with the reason it's right.",
  },
  {
    topic: "Manager visibility",
    generic: "Module completion rates in a spreadsheet export. No real-time alerts, no skill-gap analysis, no per-staff drill-down.",
    sbe: "The Manager Console shows every module completion, quiz score, and scenario session in real time. Every certificate's expiry date sits on the Compliance tab. No chasing, no guessing.",
  },
  {
    topic: "Mobile experience",
    generic: "Responsive website at best. Not designed to be used between shifts on a phone in a noisy back-of-house.",
    sbe: "Mobile-first from the ground up. Staff train pre-service, on a break, or on the floor. Built for fast completion between shifts.",
  },
  {
    topic: "Setup time",
    generic: "Weeks of content creation, SCORM uploads, user provisioning, and course mapping before a single staff member trains.",
    sbe: "Create your account in 2 minutes, launch your venue in under 10. Pre-built hospitality modules, starter templates, and venue code invites mean no content creation is required.",
  },
  {
    topic: "Multi-venue support",
    generic: "Additional licences at flat per-seat rates with no cross-venue analytics or group health scoring.",
    sbe: "Group health scores, cross-venue skill gap analysis, and every venue managed from one console. Up to 35 staff on the Group plan, unlimited on Franchise.",
  },
  {
    topic: "Hiring",
    generic: "Nothing for applicants. Someone becomes a user only after they're hired, so the interview is the only test.",
    sbe: "Applicant Testing on Venue and Group plans: email an applicant a 30 minute test for bar, floor, kitchen or management, built from the same training, and read every answer and questions for the interview.",
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

// Product facts only. No outcome figures: there is no customer data yet.
const DIFFERENCES: LedgerRow[] = [
  { metric: "5", title: "Service dimensions scored", body: "Per AI scenario response, not just pass/fail." },
  { metric: "40", unit: "+", title: "Hospitality-specific modules", body: "Across bartending, sales, and management." },
  { metric: "10", unit: "min", title: "To launch your venue", body: "Create your account in 2 minutes. No content creation or SCORM uploads required." },
  { metric: "3", title: "Stage mastery path", body: "From knowledge to verified floor readiness." },
];

const BUSINESS_CASE: RuledItem[] = [
  {
    title: "Poor training is a direct revenue problem",
    body: "When frontline staff cannot upsell menu options confidently, recommend pairings, or manage guest complaints under pressure, every single shift costs you in missed sales and lost repeat customers.",
  },
  {
    title: "Attrition starts with weak onboarding",
    body: "Hospitality has high 90-day turnover. Structured, AI-guided scenario training builds confidence early and is designed to boost staff retention in the first 90 days.",
  },
  {
    title: "Manager hours are your most expensive resource",
    body: "Every hour a senior manager repeats the same onboarding basics is an hour lost from active floor support, venue operations, and coaching your best staff.",
  },
  {
    title: "Training only works if staff actually do it",
    body: "Long videos and physical training binders are ignored by younger staff. Interactive mobile modules are built for fast completion between shifts.",
  },
];

export default function VsGenericLmsPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main id="main-content">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        <PageHero
          eyebrow="Serve By Example vs Generic LMS"
          title="Why a generic LMS won’t work for hospitality."
          subtitle="Generic LMS platforms were built for corporate compliance training: long videos, passive click-through modules, and no real skill measurement. Hospitality training requires something built for the reality of a busy service, not a boardroom."
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
              lede="Nine areas where the platform design fundamentally differs."
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
          lede="Australian venues operate on razor-thin hospitality margins. The cost of weak training isn’t just recruitment. It’s the revenue drain of inconsistent floor shifts compounding week after week."
          items={BUSINESS_CASE}
        />

        <CTABand
          title="See what hospitality training looks like when it’s built for hospitality."
          copy="Try a live scenario in the demo, then start a 14-day free trial. Cancel anytime."
          primary={{ label: "Try the Free Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
