import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionSubNav from "@/components/SectionSubNav";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  IconUsers,
  IconBuilding,
  IconLayers,
  IconZap,
  IconMessage,
  IconChart,
  IconAward,
} from "@/components/icons/MarketingIcons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Overview | AI Hospitality Training | Serve By Example",
  description:
    "Scenario simulators, live performance tracking, AI coaching, and multi-venue management. The full Serve By Example training platform for hospitality teams.",
  alternates: { canonical: "/platform" },
};

const features: FeatureGridItem[] = [
  {
    icon: <IconMessage />,
    title: "Scenario Training",
    body: "Staff practice real hospitality situations through guided scenario roleplay: upselling, de-escalation, cocktail knowledge, service recovery.",
  },
  {
    icon: <IconLayers />,
    title: "Role-Based Learning Paths",
    body: "Tailor training to bartenders, floor staff, sales-focused team members and managers. Each role gets a targeted pathway.",
  },
  {
    icon: <IconChart />,
    title: "Live Performance Tracking",
    body: "Track progress across service, product knowledge, and sales skills. Real data shows you who is on-track and who needs support.",
  },
  {
    icon: <IconZap size={22} />,
    title: "AI Coach (Ask Anything)",
    body: "The AI Coach answers management questions in plain language. Ask who needs training this week and get an instant answer.",
  },
  {
    icon: <IconAward />,
    title: "Gamification & Badges",
    body: "Staff earn milestone badges for completion, skill mastery, and top performance. Portable digital credentials boost engagement.",
  },
  {
    icon: <IconBuilding />,
    title: "Multi-Venue Management",
    body: "Manage multiple sites from a single console. Compare venue health scores, spot group-wide skill gaps, and standardise training.",
  },
];

const staffPoints = [
  "Short, mobile-first learning modules",
  "Realistic scenario-based practice",
  "Instant scored feedback on every response",
  "Earn badges and track your own progress",
];

const managerPoints = [
  "Full staff roster with skill analytics",
  "Ask the AI Coach about your team instantly",
  "Assign targeted training by role or gap",
  "Multi-venue health score comparison",
];

const stats: FeatureGridItem[] = [
  { title: "90%", body: "Mobile completion rate", variant: "stat" },
  { title: "3×", body: "Faster onboarding vs. traditional training", variant: "stat" },
  { title: "+15%", body: "Avg upsell improvement", variant: "stat" },
  { title: "40+", body: "Training modules across bartending, sales and management", variant: "stat" },
];

const audienceBlocks: FeatureGridItem[] = [
  {
    icon: <IconUsers />,
    eyebrow: "For Frontline Staff",
    title: "For staff",
    variant: "dark",
    body: (
      <ul className="sbe-mkt-checklist">
        {staffPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    ),
  },
  {
    icon: <IconChart />,
    eyebrow: "For General Managers",
    title: "For managers",
    body: (
      <ul className="sbe-mkt-checklist">
        {managerPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    ),
  },
];

const platformSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Serve By Example",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "AI-powered hospitality staff training platform featuring scenario simulators, live performance tracking, AI coaching, and multi-venue management for bars, restaurants, and hotel groups.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "AUD", "description": "Free trial available" },
  "provider": { "@id": "https://servebyexample.co/#organization" },
};

export default function PlatformPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(platformSchema) }} />
        <div className="section-subnav-sentinel" aria-hidden="true" />
        <SectionSubNav items={[
          { id: "overview", label: "Overview" },
          { id: "insights", label: "Analytics" },
          { id: "arena", label: "Live Scenarios" },
          { id: "mobile", label: "Mobile" },
        ]} />

        {/* ── Hero ── */}
        <div id="overview">
          <PageHero
            eyebrow="Platform tour"
            title="Interactive hospitality training that actually moves the needle."
            subtitle="Serve By Example gives your team scenario-based practice, live performance tracking, and an AI Coach that knows your venue, all from a single management console."
            actions={[
              { label: "Try the Demo", href: "/demo", variant: "primary" },
              { label: "For Venues", href: "/for-venues", variant: "secondary" },
            ]}
          />
        </div>

        {/* ── Stats bar ── */}
        <section className="section-tight section-alt">
          <div className="container">
            <FeatureGrid items={stats} columns={4} />
          </div>
        </section>

        {/* ── Dashboard Preview ── */}
        <section id="insights" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Management console"
              title="Your venue’s mission control."
              copy="A live dashboard that shows staff performance, training completion, upsell trends, and venue health, all in one view."
            />
            <div className="solution-grid">
              <div className="solution-col">
                <Image
                  src="/shots/Overview Console Wide.png"
                  alt="Serve By Example manager console – venue overview with training completion, compliance status, and staff needing attention"
                  width={3004}
                  height={1654}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)" }}
                />
              </div>
              <div className="solution-col">
                <Image
                  src="/shots/AI Coach Chat.png"
                  alt="Serve By Example AI Coach – answering a manager's question about staff training progress with real venue data"
                  width={3024}
                  height={1654}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section id="arena" className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="What’s inside"
              title="Everything your team needs to perform at their best."
            />
            <FeatureGrid items={features} columns={3} />
          </div>
        </section>

        {/* ── Two Systems ── */}
        <section id="features" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Two Systems, One Platform"
              title="What each layer actually does."
            />
            <FeatureGrid items={audienceBlocks} columns={2} />
          </div>
        </section>

        {/* ── Mobile-first ── */}
        <section id="mobile" className="section section-alt">
          <div className="container platform-mobile-section">
            <div className="platform-mobile-text">
              <span className="eyebrow">Mobile-first training</span>
              <h2>Your staff live on their phones. Your training should too.</h2>
              <p>
                Every scenario, coaching interaction, and progress dashboard is fully optimised for mobile.
                Staff can complete training between shifts, at the bar, or on the way to work.
                Platforms built this way achieve <strong>90%+ completion rates</strong> with frontline teams.
              </p>
              <ul className="check-list" style={{ marginTop: 16 }}>
                <li>Scenarios fully functional on a 6-inch screen</li>
                <li>AI Coach accessible with a single tap</li>
                <li>Progress badges shareable to LinkedIn</li>
                <li>Managers get push alerts for team milestones</li>
              </ul>
              <div style={{ marginTop: 24 }}>
                <Link href="/membership" className="btn btn-secondary">View Pricing →</Link>
              </div>
            </div>
            <div className="platform-mobile-visual" style={{ gap: "1rem" }}>
              <Image
                src="/shots/Mobile-home.png"
                alt="Serve By Example staff training app on mobile – home screen with streak, pre-shift brief, and quick access training"
                width={1920}
                height={1920}
                sizes="(max-width: 768px) 42vw, 220px"
                style={{ width: "100%", maxWidth: "220px", height: "auto", display: "block" }}
              />
              <Image
                src="/shots/Cocktail-mobile.png"
                alt="Serve By Example staff training app on mobile – 38-cocktail drink library"
                width={1920}
                height={1920}
                sizes="(max-width: 768px) 42vw, 220px"
                style={{ width: "100%", maxWidth: "220px", height: "auto", display: "block", marginTop: "2.5rem" }}
              />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
          title="The market is shifting to interactive, scenario-based training. You’re already there."
          copy="Major hospitality platforms are just now beginning to build what Serve By Example already has. Your window of competitive advantage is now, while the incumbents are still in the planning phase."
          primary={{ label: "Start Free Trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Try the Demo", href: "/demo" }}
        />
      </main>

      <Footer />
    </div>
  );
}
