import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionSubNav from "@/components/SectionSubNav";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import {
  Ledger,
  MediaRows,
  RuledList,
  SplitPanel,
  type LedgerRow,
  type MediaRow,
  type RuledItem,
  type SplitPanelItem,
} from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Overview | AI Hospitality Training | Serve By Example",
  description:
    "Scenario simulators, live performance tracking, AI coaching, and multi-venue management. The full Serve By Example training platform for hospitality teams.",
  alternates: { canonical: "/platform" },
};

// Product facts only. There is no customer data yet, so no outcome figures
// (completion rates, uplift, "x times faster") belong here.
const STATS: LedgerRow[] = [
  { metric: "3", title: "Stage mastery path", body: "From knowledge to verified floor readiness." },
  { metric: "5", title: "Service dimensions scored", body: "Every scenario answer gets written feedback, not just a pass or fail." },
  { metric: "14", title: "Day free trial", body: "On Venue and Group plans." },
  { metric: "40", unit: "+", title: "Training modules", body: "Across bartending, sales and management." },
];

const CONSOLE_ROWS: MediaRow[] = [
  {
    tag: "Overview",
    title: "Who is ready for tonight",
    body: "A live dashboard that shows staff performance, training completion, upsell trends, and venue health, all in one view.",
    image: {
      src: "/shots/console-staff.webp",
      alt: "Serve By Example manager console: the staff list with each person's training progress and whether they are ready for the floor",
      width: 2000,
      height: 1250,
    },
  },
  {
    tag: "AI Coach",
    title: "Ask about your team in plain language",
    body: "The AI Coach answers management questions in plain language. Ask who needs training this week and get an instant answer.",
    image: {
      src: "/shots/console-coach.webp",
      alt: "Serve By Example AI Coach: answering a manager's question about staff training progress with real venue data",
      width: 2000,
      height: 1250,
    },
  },
];

const FEATURES: RuledItem[] = [
  {
    title: "Live Guest",
    body: "Staff talk to a practice guest who talks back: a flat schooner, a cold parmy, a guest who's had too many. Afterwards they see what the guest was thinking at each turn.",
    href: "/demo",
    linkLabel: "Try the cold parmy now, no sign-up",
  },
  {
    title: "Your Menu, Your Questions",
    body: "Add this week's cocktail specs, specials and sold-out items in the Manager Console. The AI drafts the questions, you approve them, and staff get them in their next drill.",
  },
  {
    title: "Live Performance Tracking",
    body: "Track progress across service, product knowledge, and sales skills. Real data shows you who is on-track and who needs support.",
  },
  {
    title: "Gamification & Badges",
    body: "Staff earn milestone badges for completion, skill mastery, and top performance. Portable digital credentials boost engagement.",
  },
  {
    title: "Multi-Venue Management",
    body: "Manage multiple sites from a single console. Compare venue health scores, spot group-wide skill gaps, and standardise training.",
  },
];

const AUDIENCES: SplitPanelItem[] = [
  {
    label: "For frontline staff",
    title: "For staff",
    points: [
      "Short, mobile-first learning modules",
      "Realistic scenario-based practice",
      "Instant scored feedback on every response",
      "Earn badges and track your own progress",
    ],
  },
  {
    label: "For general managers",
    title: "For managers",
    points: [
      "Full staff roster with skill analytics",
      "Ask the AI Coach about your team instantly",
      "Assign targeted training by role or gap",
      "Multi-venue health score comparison",
    ],
  },
];

const MOBILE_ROW: MediaRow = {
  tag: "Mobile-first training",
  title: "Your staff live on their phones. Your training should too.",
  body: (
    <>
      Every scenario, coaching interaction, and progress dashboard is fully optimised for mobile. Staff can complete
      training at the bar, on a break, or on the way to work.{" "}
      <strong>Built for fast completion between shifts.</strong>
    </>
  ),
  points: [
    "Scenarios fully functional on a 6-inch screen",
    "AI Coach accessible with a single tap",
    "Progress badges shareable to LinkedIn",
    "Managers get push alerts for team milestones",
  ],
  action: { label: "View pricing", href: "/membership" },
  image: {
    src: "/shots/desktop-modules.webp",
    alt: "Staff training modules view: full course library",
    width: 2000,
    height: 1250,
  },
  phone: {
    src: "/shots/phone-cocktails.webp",
    alt: "Serve By Example staff training app on mobile: 38-cocktail drink library",
    width: 836,
    height: 1744,
  },
};

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
      <main id="main-content">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(platformSchema) }} />
        <div className="section-subnav-sentinel" aria-hidden="true" />
        <SectionSubNav items={[
          { id: "overview", label: "Overview" },
          { id: "insights", label: "Analytics" },
          { id: "arena", label: "What's inside" },
          { id: "mobile", label: "Mobile" },
        ]} />

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

        <Ledger tone="alt" kicker="In numbers" title="What is in the platform." rows={STATS} />

        <MediaRows
          id="insights"
          head={{ kicker: "Manager Console", title: "Your whole venue on one screen." }}
          rows={CONSOLE_ROWS}
        />

        <RuledList
          id="arena"
          tone="alt"
          kicker="What’s inside"
          title="Everything your team needs to perform at their best."
          items={FEATURES}
          primary={{ label: "Try the demo", href: "/demo" }}
        />

        <SplitPanel
          id="features"
          kicker="Two systems, one platform"
          title="What each layer actually does."
          items={AUDIENCES}
        />

        <MediaRows id="mobile" tone="warm" rows={[MOBILE_ROW]} />

        <CTABand
          title="The market is shifting to interactive, scenario-based training. You’re already there."
          copy="Major hospitality platforms are just now beginning to build what Serve By Example already has. Your window of competitive advantage is now, with a platform built for hospitality, not corporate desks."
          primary={{ label: "Start Free Trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Try the Demo", href: "/demo" }}
        />
      </main>
      <Footer />
    </div>
  );
}
