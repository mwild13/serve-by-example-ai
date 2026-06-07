import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Training Checklist | Serve By Example",
  description:
    "Free onboarding guide specifically for Australian hospitality venues. Download, use, and keep it. No strings attached.",
};

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Free Resource</span>
            <h1>Free onboarding guide for Australian hospitality venues.</h1>
            <p className="inner-hero-sub">
              Download, use, and keep it. No strings attached.
            </p>
          </div>
        </section>

        {/* ── Download section ── */}
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 1080 }}>
            <div className="resource-download-grid">
              {/* Left: card with text + download */}
              <div className="resource-download-card" style={{
                background: "var(--surface)",
                border: "1.5px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                padding: "2.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.35rem",
                alignSelf: "stretch",
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
                  <DownloadIcon />
                  PDF &middot; Free Download
                </div>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                  Hospitality Staff Training Checklist
                </h2>
                <p style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-soft)", lineHeight: 1.75 }}>
                  A practical onboarding checklist built specifically for Australian bars, restaurants, and venue teams.
                  Covers first-week milestones, service basics, product knowledge, compliance, and shift readiness.
                  Use it with new starters or as a team reset. No software required.
                </p>
                <a
                  href="/downloads/SBE-Training-Checklist.pdf"
                  download="SBE-Training-Checklist.pdf"
                  className="btn btn-primary"
                  style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", padding: "0.85rem 1.75rem" }}
                >
                  <DownloadIcon />
                  Download free checklist
                </a>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  No email required. No account needed.
                </p>
              </div>

              {/* Right: checklist preview image – slightly larger than the card */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/downloads/training-checklist-preview.png"
                alt="Training Checklist preview"
                className="resource-download-img"
                style={{
                  width: "100%",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl)",
                  display: "block",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Platform nudge ── */}
        <section className="section">
          <div className="container" style={{ maxWidth: 640, textAlign: "center" }}>
            <span className="eyebrow">Take it further</span>
            <h2>Want the full training platform?</h2>
            <p style={{ color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "2rem" }}>
              The checklist gives you a starting point. Serve By Example gives your team AI-scored
              scenario practice, progress tracking, and a manager console, all in one place.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/demo" className="btn btn-primary btn-lg">Try the Demo</a>
              <a href="/pricing" className="btn btn-secondary btn-lg">View Pricing</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
