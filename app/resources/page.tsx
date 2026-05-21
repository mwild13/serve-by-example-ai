import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Hospitality Training Resources | Serve By Example",
  description:
    "Download free hospitality training guides, onboarding checklists, and SOP templates for bars, restaurants, and hotel F&B teams across Australia.",
};

type Resource = {
  title: string;
  desc: string;
  category: string;
  pages: string;
  format: string;
};

const RESOURCES: Resource[] = [
  {
    title: "The Ultimate Bartender Onboarding Checklist",
    desc: "A week-by-week onboarding framework covering product knowledge, service standards, compliance, and first-shift readiness milestones for new bartenders.",
    category: "Onboarding",
    pages: "8 pages",
    format: "PDF",
  },
  {
    title: "6 Hospitality Onboarding Mistakes That Kill Staff Retention in 2026",
    desc: "The most common onboarding failures in Australian hospitality venues — and the practical fixes that prevent your best new hires from walking out in week three.",
    category: "Staff Retention",
    pages: "12 pages",
    format: "PDF",
  },
  {
    title: "Service Standards SOP Template for Bars & Restaurants",
    desc: "A customisable Standard Operating Procedure template covering opening procedures, service flow, guest greeting, complaint handling, and closing standards.",
    category: "SOP Templates",
    pages: "16 pages",
    format: "PDF",
  },
  {
    title: "The Hospitality Manager&rsquo;s Guide to AI Training",
    desc: "What AI training is, how it differs from video modules and printed manuals, and how to introduce it to your team without resistance. Includes a 30-day implementation roadmap.",
    category: "Manager Guide",
    pages: "10 pages",
    format: "PDF",
  },
  {
    title: "RSA Compliance Checklist for Venue Managers",
    desc: "A practical compliance checklist covering Responsible Service of Alcohol requirements for Australian venues — what to track, when to review, and how to stay audit-ready.",
    category: "Compliance",
    pages: "6 pages",
    format: "PDF",
  },
  {
    title: "How to Build a Pre-Shift Training Ritual That Staff Actually Do",
    desc: "Short, high-impact pre-shift habits that reinforce training without eating into service time. Includes a 5-minute pre-shift routine template your team can start this week.",
    category: "Training Culture",
    pages: "8 pages",
    format: "PDF",
  },
];

const CATEGORIES = ["All", "Onboarding", "SOP Templates", "Compliance", "Manager Guide", "Staff Retention", "Training Culture"];

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

export default function ResourcesPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="inner-hero resources-hero">
          <div className="container">
            <span className="eyebrow">Free Resources</span>
            <h1>Practical tools for hospitality operators.</h1>
            <p className="inner-hero-sub">
              Free guides, checklists, and SOP templates built specifically for Australian
              hospitality venues. Download, use, and keep them — no strings attached.
            </p>
          </div>
        </section>

        {/* ── Resource grid ── */}
        <section className="section">
          <div className="container">
            <div className="resources-category-nav" role="list" aria-label="Filter by category">
              {CATEGORIES.map((cat) => (
                <span key={cat} className="resources-category-pill" role="listitem">
                  {cat}
                </span>
              ))}
            </div>

            <div className="resources-grid">
              {RESOURCES.map((r) => (
                <div key={r.title} className="resource-card">
                  <div className="resource-card-meta">
                    <span className="resource-category-tag">{r.category}</span>
                    <span className="resource-format-tag">
                      <DownloadIcon />
                      {r.format} &middot; {r.pages}
                    </span>
                  </div>
                  <h3
                    className="resource-title"
                    dangerouslySetInnerHTML={{ __html: r.title }}
                  />
                  <p
                    className="resource-desc"
                    dangerouslySetInnerHTML={{ __html: r.desc }}
                  />
                  <div className="resource-card-footer">
                    <Link
                      href={`/contact?resource=${encodeURIComponent(r.title)}`}
                      className="resource-download-btn"
                    >
                      <DownloadIcon />
                      Download free
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Complaint Master CTA ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="resources-tool-promo">
              <div className="resources-tool-promo-text">
                <span className="eyebrow">Free Training Tool</span>
                <h2>Complaint Master</h2>
                <p>
                  Practice handling real guest complaints with live AI feedback. Three scenarios,
                  five dimensions scored, no sign-up required. Used by hospitality staff across
                  Australia to sharpen their guest recovery skills.
                </p>
                <Link href="/demo/complaint-master" className="btn btn-primary">
                  Start practising free
                </Link>
              </div>
              <div className="resources-tool-promo-scores" aria-hidden="true">
                <div className="resources-score-mock">
                  <span className="resources-score-num">22</span>
                  <span className="resources-score-denom">/25</span>
                  <span className="resources-score-label">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Newsletter / Stay updated ── */}
        <section className="section trust-section trust-section-green">
          <div className="container">
            <div className="resources-newsletter">
              <h2>New resources every month.</h2>
              <p>
                We publish new guides, templates, and tools for hospitality operators regularly.
                Leave your email and we&rsquo;ll send them straight to you.
              </p>
              <form className="resources-newsletter-form" action="/contact" method="get">
                <input
                  type="email"
                  name="email"
                  placeholder="you@yourvenue.com.au"
                  className="roi-email-input resources-email-input"
                  required
                />
                <button type="submit" className="roi-email-btn">
                  Keep me updated
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
