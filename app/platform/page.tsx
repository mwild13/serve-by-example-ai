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

// Figures carried over from the previous page. They are flagged in To_do_list.md
// ("Marketing copy to source or remove") — do not add to them.
const STATS: LedgerRow[] = [
  { metric: "90", unit: "%", title: "Mobile completion rate", body: "Training is built for the phone staff already carry, so it gets finished between shifts." },
  { metric: "3", unit: "×", title: "Faster onboarding", body: "Compared with traditional on-the-job training." },
  { metric: "+15", unit: "%", title: "Avg upsell improvement", body: "Sales scenarios are practised and scored before staff try them on a guest." },
  { metric: "40", unit: "+", title: "Training modules", body: "Across bartending, sales and management." },
];

const CONSOLE_ROWS: MediaRow[] = [
  {
    tag: "Overview",
    title: "Who is ready for tonight",
    body: "A live dashboard that shows staff performance, training completion, upsell trends, and venue health, all in one view.",
    image: {
      src: "/shots/Overview Console Wide.png",
      alt: "Serve By Example manager console – venue overview with training completion, compliance status, and staff needing attention",
      width: 3004,
      height: 1654,
    },
  },
  {
    tag: "AI Coach",
    title: "Ask about your team in plain language",
    body: "The AI Coach answers management questions in plain language. Ask who needs training this week and get an instant answer.",
    image: {
      src: "/shots/AI Coach Chat.png",
      alt: "Serve By Example AI Coach – answering a manager's question about staff training progress with real venue data",
      width: 1800,
      height: 1654,
    },
  },
];

const FEATURES: RuledItem[] = [
  {
    title: "Scenario Training",
    body: "Staff practice real hospitality situations through guided scenario roleplay: upselling, de-escalation, cocktail knowledge, service recovery.",
  },
  {
    title: "Role-Based Learning Paths",
    body: "Tailor training to bartenders, floor staff, sales-focused team members and managers. Each role gets a targeted pathway.",
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
      training between shifts, at the bar, or on the way to work. Platforms built this way achieve{" "}
      <strong>90%+ completion rates</strong> with frontline teams.
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
    src: "/shots/Modules View.png",
    alt: "Staff training modules view – full course library",
    width: 1400,
    height: 875,
  },
  phone: {
    src: "/shots/Cocktail-mobile.png",
    alt: "Serve By Example staff training app on mobile – 38-cocktail drink library",
    width: 912,
    height: 1844,
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
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(platformSchema) }} />
        <div className="section-subnav-sentinel" aria-hidden="true" />
        <SectionSubNav items={[
          { id: "overview", label: "Overview" },
          { id: "insights", label: "Analytics" },
          { id: "arena", label: "Live Scenarios" },
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

        <Ledger tone="alt" kicker="In numbers" title="What the platform is built to move." rows={STATS} />

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
          primary={{ label: "Try a live scenario", href: "/demo" }}
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
          copy="Major hospitality platforms are just now beginning to build what Serve By Example already has. Your window of competitive advantage is now, while the incumbents are still in the planning phase."
          primary={{ label: "Start Free Trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Try the Demo", href: "/demo" }}
        />
      </main>
      <Footer />
    </div>
  );
}
