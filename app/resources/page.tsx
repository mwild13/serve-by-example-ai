import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Hospitality Operator Resources | Serve By Example",
  description:
    "Free SOP templates for Australian hospitality venues — select your venue type and get a structured, copy-pasteable onboarding SOP in under 60 seconds.",
  alternates: { canonical: "/resources" },
};

function BuildIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

export default function ResourcesPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <PageHero
          compact
          eyebrow="Free Resources"
          title="Practical tools for Australian hospitality operators."
          subtitle="Download, use, and keep them. No strings attached."
        />

        {/* ── SOP Template Builder ── */}
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 760 }}>
            <div style={{
              background: "var(--surface)",
              border: "1.5px solid var(--line)",
              borderRadius: "var(--radius-lg)",
              padding: "3.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--green-mid)",
              }}>
                <BuildIcon />
                Interactive Builder &middot; Free
              </div>
              <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.25, fontFamily: "var(--font-heading)" }}>
                Free Staff Onboarding SOP Templates
              </h2>
              <p style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-soft)", lineHeight: 1.8 }}>
                Select your venue type, state, and biggest compliance pain point. We generate a structured,
                copy-pasteable SOP template matched to your operation in under 60 seconds.
                Covers RSA, allergens, opening/closing, and pre-start paperwork.
              </p>
              <Link
                href="/resources/sop-toolkit"
                className="btn btn-primary"
                style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "0.9rem 2rem" }}
              >
                <BuildIcon />
                Build my free SOP template
              </Link>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Customised to your venue type and jurisdiction.
              </p>
            </div>
          </div>
        </section>

        {/* ── Platform nudge ── */}
        <CTABand
          background="neutral"
          eyebrow="Take it further"
          title="Want the full training platform?"
          copy="The SOP templates give you a starting point. Serve By Example gives your team AI-scored scenario practice, progress tracking, and a manager console, all in one place."
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "View Pricing", href: "/membership" }}
        />
      </main>
      <Footer />
    </div>
  );
}
