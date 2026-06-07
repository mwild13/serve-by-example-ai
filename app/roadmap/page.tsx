import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Roadmap | Serve By Example",
  description:
    "See what we're building next. Serve By Example is actively developing new training modules, platform features, and tools for Australian hospitality venues.",
};

const roadmapItems = [
  {
    eta: "2 months",
    status: "soon",
    title: "Expanded Staff Modules",
    desc: "New training modules covering coffee service, food pairing, wine fundamentals and advanced guest interaction, built around Australian hospitality standards.",
  },
  {
    eta: "4 months",
    status: "soon",
    title: "Large-Venue & Events Training",
    desc: "Expanded scenario sets for large-venue management, events service and high-volume bar operations.",
  },
  {
    eta: "6 months",
    status: "planned",
    title: "Certification Deep-Dives",
    desc: "Deep-dive certifications in spirits, cocktail history, advanced bar technique and cellar management for venues that want to build genuine expertise.",
  },
  {
    eta: "Within 6 months",
    status: "soon",
    title: "V2: Major Platform Release",
    desc: "A significant platform update informed by founding member feedback, with new features across training, analytics and management. Founding members shape what gets prioritised.",
  },
  {
    eta: "TBA",
    status: "planned",
    title: "Custom Scenario Builder",
    desc: "Upload your venue's menus, house rules, and POS workflows directly into the AI model. Generate training scenarios built around your specific operation, not a generic template.",
  },
  {
    eta: "TBA",
    status: "planned",
    title: "iOS & Android Native Apps",
    desc: "Native mobile apps so staff can train on the go, anytime, anywhere, fully synced with their progress, badges, and manager-assigned tasks.",
  },
  {
    eta: "TBA",
    status: "planned",
    title: "Further Design & Functionality",
    desc: "Continuous UI improvements, accessibility updates and performance enhancements across all pages and flows, informed by real venue feedback.",
  },
];

export default function RoadmapPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Product Roadmap</span>
            <h1>What we&rsquo;re building next.</h1>
            <p className="inner-hero-sub">
              Serve By Example is actively built and improved based on venue operator feedback.
              Here&rsquo;s what&rsquo;s coming, and when founding members can expect it.
            </p>
          </div>
        </section>

        {/* ── Roadmap grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {roadmapItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--surface)",
                    border: `1.5px solid ${item.status === "soon" ? "var(--green-light)" : "var(--line)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "1.5rem",
                  }}
                >
                  <div style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: item.status === "soon" ? "var(--green-mid)" : "var(--text-muted)",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}>
                    {item.eta}
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-soft)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Founding member callout ── */}
        <section className="section">
          <div className="container" style={{ maxWidth: 680, textAlign: "center" }}>
            <span className="eyebrow">Shape What Gets Built</span>
            <h2>Founding members influence the roadmap directly.</h2>
            <p style={{ color: "var(--text-soft)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              We run monthly calls with founding venue members to review what&rsquo;s working, what&rsquo;s missing, and what gets prioritised next.
              If you join now, your operation shapes the platform.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn btn-primary btn-lg">
                Request Venue Access
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
