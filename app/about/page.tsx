import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import {
  IconMessage,
  IconZap,
  IconUsers,
  IconChart,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Serve By Example | AI Hospitality Staff Training",
  description: "Serve By Example was built by people who know hospitality. Learn about our mission to replace inconsistent on-floor training with scalable, structured digital learning.",
  alternates: { canonical: "/about" },
};

const aboutBlocks: FeatureGridItem[] = [
  {
    icon: <IconMessage />,
    title: "The problem",
    body: "Most venue staff learn on the job, which means inconsistent guest experiences, slow onboarding, and managers constantly plugging gaps. Written manuals gather dust. One-off training days are forgotten within weeks.",
  },
  {
    icon: <IconZap size={22} />,
    title: "Our approach",
    body: "Scenario-based training that fits around shifts. Staff practice real situations (difficult guests, upsell moments, service recovery) and get instant, specific feedback. No dedicated trainer required.",
  },
  {
    icon: <IconUsers />,
    title: "Who we're for",
    body: "Independent bars, hotel F&B teams, restaurant groups, and event venues that want consistent, confident staff without the overhead of a full training department.",
  },
  {
    icon: <IconChart />,
    title: "Where we're headed",
    body: "We're building the complete staff development platform for hospitality, from first-shift onboarding through to team management and progression tracking.",
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <PageHero
          eyebrow="About us"
          title="Built by people who know hospitality"
          subtitle="Serve By Example started from a simple frustration: great hospitality training was out of reach for most venues: too expensive, too generic, too slow. We built the platform we wished existed."
        />

        {/* ── Founder Story — ported from homepage, minus the stat row
              (numbers-as-decoration, per Pages-Redesign.md §6.3) ── */}
        <section className="section section-alt" style={{ border: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ maxWidth: "880px" }}>
              <div className="founder-row">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <Image
                    src="/24 May Jpg's/Founder.webp"
                    alt="Mitch, Founder of Serve By Example"
                    width={140}
                    height={140}
                    loading="lazy"
                    quality={60}
                    style={{ borderRadius: "4px", objectFit: "cover", width: "140px", height: "140px", display: "block" }}
                  />
                  <span style={{ marginTop: "0.625rem", fontSize: "0.875rem", fontWeight: 700, color: "var(--text-soft)", textAlign: "center" }}>Mitch</span>
                </div>
                <div className="founder-text">
                  <span className="eyebrow">Built From Experience</span>
                  <h2 style={{ marginBottom: "1rem" }}>Built by a 15-year hospitality veteran.</h2>
                  <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                    Serve By Example was created and is managed by a real hospitality professional with over 15 years of experience across Australian bars, pubs and venues. Not built in a boardroom, built behind the bar.
                  </p>
                </div>
              </div>
              <blockquote style={{
                margin: "2rem 0 0",
                maxWidth: "600px",
                padding: "1.5rem 2rem",
                background: "var(--surface-raised)",
                border: "1.5px solid var(--divider-light)",
                borderLeft: "4px solid var(--green-mid)",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
              }}>
                <p style={{ margin: 0, fontSize: "1.05rem", fontStyle: "italic", color: "var(--green-deep)", lineHeight: 1.65, fontWeight: 500 }}>
                  &ldquo;I built the training tool I always wished I had, one that works for real venues, real staff, and the real pressure of a busy service.&rdquo;
                </p>
                <footer style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--color-text-muted)", fontStyle: "normal", fontWeight: 600 }}>
                  Mitch, Serve By Example, Australia
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ── Story blocks ── */}
        <section className="section">
          <div className="container">
            <FeatureGrid items={aboutBlocks} columns={2} />
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          title="Ready to see it in action?"
          copy="Try the free demo. No account needed. See exactly how it feels for your staff."
          primary={{ label: "Try the demo", href: "/demo" }}
          secondary={{ label: "Get in touch", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
