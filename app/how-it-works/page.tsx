import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import {
  Ledger,
  MediaRows,
  RuledList,
  SplitPanel,
  Steps,
  Strip,
  type RuledItem,
  type SplitPanelItem,
  type Step,
  type StripItem,
} from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Serve By Example",
  description: "See how Serve By Example's three-stage training loop takes hospitality staff from onboarding through to real-world confidence, with scenario practice, scoring, and performance tracking.",
  alternates: { canonical: "/how-it-works" },
};

const PROBLEM: SplitPanelItem[] = [
  {
    title: "Trained on the job",
    body: "New staff are often trained on the job, under pressure and with limited manager time.",
  },
  {
    title: "Passive and one-size-fits-all",
    body: "Traditional training is usually passive, one-size-fits-all and difficult to apply during real service.",
  },
  {
    title: "Practice before the floor",
    body: "Serve By Example bridges that gap by letting staff practice realistic service situations before they face them in venue.",
  },
];

// Feeds both the ledger and the HowTo JSON-LD, so the two cannot drift apart.
const LOOP = [
  {
    number: "01",
    title: "Choose a pathway",
    description:
      "Start with Beginner, Bartender, Sales or Management Training depending on the staff member’s role and experience level.",
  },
  {
    number: "02",
    title: "Learn the essentials",
    description:
      "Complete short, practical learning modules covering service basics, drink knowledge, sales skills and decision-making.",
  },
  {
    number: "03",
    title: "Practice real scenarios",
    description:
      "Staff respond to realistic hospitality situations using scenario-based simulations designed to build confidence under pressure.",
  },
  {
    number: "04",
    title: "Get instant scored feedback",
    description:
      "Every response is scored against service criteria like communication, professionalism, problem-solving and guest experience.",
  },
  {
    number: "05",
    title: "Track progress over time",
    description:
      "Staff can see improvement, while managers get visibility across completion, strengths, gaps and overall team performance.",
  },
];

const FRAMEWORK: RuledItem[] = [
  {
    title: "Beginner Training",
    body: "Build confidence with guest greetings, taking drink orders and basic drink knowledge.",
  },
  {
    title: "Bartender Training",
    body: "Improve cocktail knowledge, speed, workflow, consistency and bar setup habits.",
  },
  {
    title: "Sales Training",
    body: "Teach natural upselling, premium recommendations and suggestive selling without sounding pushy.",
  },
  {
    title: "Management Training",
    body: "Develop leadership, complaint handling, team communication and venue decision-making.",
  },
  {
    title: "Scenario Simulations",
    body: "The core training feature where staff practice realistic service situations and receive coaching.",
  },
  {
    title: "Performance Tracking",
    body: "Measure growth across communication, drink knowledge, sales, problem-solving and team performance.",
  },
];

const EXAMPLE: StripItem[] = [
  {
    label: "Scenario",
    title: "A guest approaches the bar",
    body: "A guest approaches the bar while you’re finishing another drink. How do you acknowledge them?",
  },
  {
    label: "Staff response",
    title: "The reply",
    body: "“Hi there, I’ll be with you in just a moment.”",
  },
  {
    label: "Scored feedback",
    title: "Score: 22/25",
    body: "Clear acknowledgement, friendly tone and good guest awareness. A strong service response.",
  },
];

const SCORING: Step[] = [
  {
    num: "01",
    title: "Score every response",
    body: "Rated across 5 dimensions: communication, hospitality, problem-solving, professionalism and guest experience.",
  },
  {
    num: "02",
    title: "Track every scenario",
    body: "Each scenario keeps its own record. A miss drops it back a level, so the scenarios you struggle with stay visible instead of getting lost in an average.",
  },
  {
    num: "03",
    title: "Bring them back automatically",
    body: "A missed scenario is due for review straight away. Ones you pass come back at widening intervals: 1, 4, then 9 days.",
  },
  {
    num: "04",
    title: "Master it, then move on",
    body: "A scenario counts as mastered after three passes in a row, at least an hour apart. A miss drops it back a level, so mastery means you can repeat it, not that you got lucky once.",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How Serve By Example Works",
  "description":
    "Serve By Example's three-stage training loop takes hospitality staff from onboarding through to real-world confidence, with scenario practice, scoring, and performance tracking.",
  "step": LOOP.map((s, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": s.title,
    "text": s.description,
  })),
};

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />

        <PageHero
          eyebrow="How It Works"
          title="From onboarding to real-world confidence."
          subtitle="Serve By Example combines short learning modules, scenario-based practice and performance tracking to help hospitality teams train faster and perform better on shift."
          actions={[
            { label: "See the Platform", href: "/platform", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        <SplitPanel
          kicker="The problem"
          title="Most hospitality training is inconsistent and hard to scale."
          items={PROBLEM}
        />

        <Ledger
          kicker="The system"
          title="A simple training loop that improves with every session."
          rows={LOOP.map((s) => ({ metric: s.number, title: s.title, body: s.description }))}
        />

        <RuledList
          tone="alt"
          kicker="The training framework"
          title="Built around six core parts of hospitality performance."
          items={FRAMEWORK}
          primary={{ label: "See the platform", href: "/platform" }}
        />

        <Strip
          kicker="Example scenario"
          title="How a scored scenario response works"
          lede="Every response is scored instantly. The platform tracks each scenario you miss and brings it back, so improvement isn’t left to chance."
          items={EXAMPLE}
        />

        <Steps
          kicker="After the score"
          title="How the system improves your score over time"
          steps={SCORING}
        />

        <MediaRows
          tone="warm"
          rows={[
            {
              tag: "Consoles",
              title: "The manager and staff consoles, side by side",
              body: "Two powerful tools working together: one for managers, one for staff.",
              image: {
                src: "/shots/Overview Console Compact.png",
                alt: "Serve By Example manager console: venue overview with training completion, compliance status, and staff needing attention",
                width: 2416,
                height: 1558,
              },
              phone: {
                src: "/shots/Progress Skill Rings.png",
                alt: "Serve By Example staff mobile app: mastery breakdown by category with modules mastered and skill level",
                width: 912,
                height: 1844,
              },
            },
          ]}
        />

        <CTABand
          title="Ready to train smarter?"
          copy="Give every staff member a clearer path to confidence, consistency and better service."
          primary={{ label: "Try the Demo", href: "/demo" }}
        />
      </main>
      <Footer />
    </div>
  );
}
