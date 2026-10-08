import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
} from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Challenges | Serve By Example",
  description:
    "Tap-based hospitality training mini-games. Sequence sorts, recipe builds, match pairs, and scenario responses. No typing, no exam pressure.",
  alternates: { canonical: "/platform/challenges" },
};

const SCREENS: MediaRow[] = [
  {
    tag: "Sequence Sort",
    title: "Put the steps in order",
    body: "Three drinks land at once. Staff arrange the steps to build them in the right order.",
    image: {
      src: "/shots/Challenge Sequence Sort.png",
      alt: "Serve By Example Sequence Sort challenge – ordering the steps to build three drinks that arrive at once",
      width: 3024,
      height: 1654,
    },
  },
  {
    tag: "Multiple Choice",
    title: "Pick the best response",
    body: "A guest complaint plays out and staff choose the best immediate response.",
    image: {
      src: "/shots/Challenge Multiple Choice.png",
      alt: "Serve By Example Multiple Choice challenge – choosing the best immediate response to a guest complaint",
      width: 3024,
      height: 1654,
    },
  },
  {
    tag: "Match Pair",
    title: "Match the pairs",
    body: "Cocktails on one side, glassware on the other. Tap to link them.",
    image: {
      src: "/shots/Challenge Match Pair.png",
      alt: "Serve By Example Match Pair challenge – matching cocktails to their correct glassware",
      width: 3024,
      height: 1654,
    },
  },
];

// Figures carried over from the previous page. They are flagged in To_do_list.md
// ("Marketing copy to source or remove") — do not add to them.
const RATIONALE: LedgerRow[] = [
  {
    metric: "65",
    unit: "%",
    title: "Faster completion vs written inputs",
    body: "Interactive tapping removes the friction of typing, so staff get through a challenge in the gap between orders, not during a sit-down break.",
  },
  {
    metric: "40",
    unit: "%",
    title: "Higher knowledge retention",
    body: "Visual associations, like matching a cocktail to its glass, create stronger memory anchors than reading a paragraph and answering from memory.",
  },
  {
    metric: "<45",
    unit: "s",
    title: "Average time per challenge",
    body: "By mimicking mechanics found in casual mobile games, the training process feels like a quick break, not mandatory paperwork.",
  },
];

const FORMATS: RuledItem[] = [
  {
    label: "Workflow",
    title: "Sequence Sort",
    body: "Arrange multi-step tasks in the correct order. A Guinness round, a wine and cocktail pour. Staff learn operational workflow without memorising a checklist.",
  },
  {
    label: "Recipe Knowledge",
    title: "Fill the Blank",
    body: "Reconstruct a cocktail recipe or service procedure from a word bank. Tap a blank, pick the right term. No typing, just fast, tactile recall.",
  },
  {
    label: "Association",
    title: "Match Pair",
    body: "Link cocktails to their glassware, wines to their regions, or complaints to their correct responses. Two-column tap interaction that builds instant pattern recognition.",
  },
  {
    label: "Quality Control",
    title: "Spot the Error",
    body: "A recipe card or service procedure has one deliberate mistake. Staff tap what is wrong. Trains quality control instincts faster than any written test.",
  },
  {
    label: "Service",
    title: "Multiple Choice Scenario",
    body: "A guest interaction plays out. Three response options appear. Staff choose the best one under time pressure, building instinct before they ever face the situation for real.",
  },
];

export default function ChallengesMarketingPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <PageHero
          eyebrow="Experimental Learning Engine"
          title="Training that feels like a game"
          subtitle="Interactive Challenges replaces the blank text box with five tap-based mini-game formats. Built for the 18–25 cohort who learn faster through doing than reading, designed to fit in a 45-second break between orders."
          actions={[
            { label: "Try it in the dashboard", href: "/login", variant: "primary" },
            { label: "Book a demo", href: "/demo", variant: "secondary" },
          ]}
        />

        <MediaRows
          head={{
            kicker: "Live inside the dashboard",
            title: "What staff actually see",
            lede: "Tap-based. No keyboard. Every format renders instantly on any screen, from the staff break room to the bar.",
          }}
          rows={SCREENS}
        />

        <Ledger
          tone="alt"
          kicker="The data behind the shift"
          title="Why tap-based beats typing"
          lede="Every challenge, module, and scenario is scored the moment staff finish it — no separate reporting step, no manager chasing a paper checklist."
          rows={RATIONALE}
        />

        <RuledList
          kicker="The formats"
          title="Five challenge formats"
          lede="No typing required. Just tap, drag, and learn. Every format completes in under 45 seconds and works on any screen size."
          items={FORMATS}
        />

        <SplitPanel
          kicker="How it fits a shift"
          title="Micro-Burst Learning"
          lede="The core philosophy of the challenge engine is Micro-Burst Learning. Every format is designed to be finished in a couple of minutes, so it fits into the natural downtime of a hospitality shift: during a commute, waiting for a manager, or before a briefing."
          items={[
            {
              label: "Deeper formats",
              title: "Sequence Sort",
              body: "Formats requiring higher cognitive synthesis take slightly longer but yield deeper workflow comprehension.",
            },
            {
              label: "Quick formats",
              title: "Match Pair, Multiple Choice",
              body: "Formats relying on quick recognition are designed for rapid knowledge reinforcement.",
            },
          ]}
        />

        <CTABand
          title="Available now inside the dashboard"
          copy="Interactive Challenges is live for all staff accounts. Log in and find it under Challenges in the sidebar. No setup required."
          primary={{ label: "Open the dashboard", href: "/login" }}
          secondary={{ label: "View pricing", href: "/membership" }}
        />
      </main>
      <Footer />
    </div>
  );
}
