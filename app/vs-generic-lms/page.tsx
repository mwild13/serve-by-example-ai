import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serve By Example vs Generic LMS | Hospitality Training Built for Real Venues",
  description:
    "Generic LMS platforms were built for corporate compliance training — not hospitality. See exactly how Serve By Example compares: scenario scoring, shift-ready modules, and real-time manager visibility vs. passive video courses.",
  alternates: { canonical: "/vs-generic-lms" },
};

const comparisonRows = [
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

// SVG check icon — no emojis
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: "2px" }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// SVG X icon
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: "2px" }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function VsGenericLmsPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Serve By Example vs Generic LMS</span>
            <h1>
              Why a generic LMS won&rsquo;t work for hospitality.
            </h1>
            <p className="inner-hero-sub" style={{ maxWidth: "640px" }}>
              Generic LMS platforms were built for corporate compliance training:
              long videos, passive click-through modules, and no real skill
              measurement. Hospitality training requires something built for the
              reality of a busy service — not a boardroom.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Free Demo
              </Link>
              <Link href="/membership" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* ── Core differentiator callout ── */}
        <section className="section" style={{ background: "var(--surface-raised)", padding: "2.5rem 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
              {[
                { stat: "5", label: "Service dimensions scored per AI scenario response — not just pass/fail" },
                { stat: "40+", label: "Hospitality-specific modules across bartending, sales, and management" },
                { stat: "1 day", label: "Average setup time — no content creation or SCORM uploads required" },
                { stat: "90%+", label: "Mobile completion rates when staff train between shifts on their phone" },
              ].map(({ stat, label }) => (
                <div key={stat} style={{ textAlign: "center", padding: "1.5rem 1rem", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", background: "var(--surface)" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--green-deep)", lineHeight: 1, marginBottom: "0.5rem" }}>{stat}</div>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-soft)", lineHeight: 1.5 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Head-to-head comparison table ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Head-to-head</span>
              <h2>What generic LMS platforms get wrong for hospitality.</h2>
              <p>Eight dimensions where the platform design fundamentally differs.</p>
            </div>

            <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "0", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "var(--green-deep)", color: "var(--surface-raised)", padding: "1rem 1.5rem", gap: "1.5rem" }}>
                <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>Area</div>
                <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.875rem" }}>Generic LMS</div>
                <div style={{ fontFamily: "var(--font-fraunces)", fontWeight: 700, fontSize: "0.975rem", color: "var(--gold)" }}>Serve By Example</div>
              </div>

              {comparisonRows.map((row, i) => (
                <div
                  key={row.topic}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1.5rem",
                    padding: "1.25rem 1.5rem",
                    borderTop: i === 0 ? "none" : "1px solid var(--line-light)",
                    background: i % 2 === 0 ? "var(--surface)" : "var(--bg-alt)",
                    alignItems: "start",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.875rem", color: "var(--text)", paddingTop: "2px" }}>
                    {row.topic}
                  </div>
                  <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <XIcon />
                    <p style={{ margin: 0, fontFamily: "var(--font-manrope)", fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
                      {row.generic}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <CheckIcon />
                    <p style={{ margin: 0, fontFamily: "var(--font-manrope)", fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.6, fontWeight: 500 }}>
                      {row.sbe}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why structured training matters ── */}
        <section style={{ padding: "64px 24px", width: "100%", backgroundColor: "var(--bg-alt)", borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ marginBottom: "48px", maxWidth: "650px" }}>
              <span className="eyebrow">The Business Case</span>
              <h2 style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>Why the training format actually matters for your bottom line.</h2>
              <p style={{ fontSize: "0.975rem", color: "var(--text-soft)", lineHeight: 1.7 }}>
                Australia&rsquo;s hospitality sector operates on 3–9% net profit margins. The cost
                of weak training isn&rsquo;t just recruitment — it&rsquo;s the revenue drain of
                inconsistent floor shifts compounding week after week.
              </p>
            </div>

            <div className="why-grid-2x2">
              <div className="why-grid-item">
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>Poor training is a direct revenue problem</h3>
                <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  When frontline staff cannot upsell menu options confidently, recommend pairings, or manage guest complaints under pressure, every single shift costs you in missed sales and lost repeat customers.
                </p>
              </div>

              <div className="why-grid-item">
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>Attrition starts with weak onboarding</h3>
                <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  Up to 39% of FOH and 42% of BOH staff quit within their first 90 days. Structured, AI-guided scenario training builds confidence early and directly reduces turnover by 20–23%.
                </p>
              </div>

              <div className="why-grid-item" style={{ borderBottom: "none" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>Manager hours are your most expensive resource</h3>
                <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  Every hour a senior manager repeats the same onboarding basics is an hour lost from active floor support, venue operations, and coaching your best staff.
                </p>
              </div>

              <div style={{ borderBottom: "none" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>Training only works if staff actually do it</h3>
                <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  Long videos and physical training binders are ignored by younger staff. Interactive mobile modules built for between-shift use see 90%+ completion rates vs. 20–30% for video-based LMS courses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h2>See what hospitality training looks like when it&rsquo;s built for hospitality.</h2>
              <p className="cta-proof">No credit card required. Full platform access in the demo.</p>
            </div>
            <div className="cta-actions">
              <Link href="/demo" className="btn btn-gold btn-lg">
                Try the Free Demo
              </Link>
              <Link href="/contact" className="btn btn-outline-light btn-lg">
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
