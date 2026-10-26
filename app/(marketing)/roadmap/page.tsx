import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import {
  RuledList,
  SplitPanel,
  Strip,
  type RuledItem,
  type SplitPanelItem,
  type StripItem,
} from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Roadmap | What We're Building | Serve By Example",
  description:
    "What shipped recently, what we're building now, and what comes next for Australian venues: certificate expiry emails, gaming certificates, allergen training and your own SOPs turned into training.",
  alternates: { canonical: "/roadmap" },
};

// Reviewed 2026-10-23. Now, next and later, never dates: a promised month
// goes stale silently, and a shifted priority shouldn't read as a broken
// promise. Everything under SHIPPED must be live; move an item up when it
// ships. Internal detail lives in To_do_list.md.

const SHIPPED: StripItem[] = [
  {
    label: "Live Guest",
    title: "Guests who talk back",
    body: "60 guests, from a flat schooner to a regular who's had too many. Staff reply in their own words, typed or spoken, and see what the guest was thinking at each turn.",
  },
  {
    label: "Saturday Rush",
    title: "A Saturday night in twelve calls",
    body: "Orders land fast, the bar-back needs directing, and every decision moves speed, safety and money.",
  },
  {
    label: "Venue content",
    title: "Your menu, your questions",
    body: "Add this week's specs, specials and 86'd items, typed or from a photo of the menu. The AI drafts questions, you approve them, and staff get them in their next drill.",
  },
  {
    label: "Pre-shift drill",
    title: "Six questions before every shift",
    body: "A shift streak, reminders on the days staff work, and questions drawn from what they've already learnt.",
  },
  {
    label: "This Week",
    title: "One goal for the whole team",
    body: "Set a team goal and a guest of the week, then print a briefing card for your pre-shift meeting.",
  },
  {
    label: "Applicant Testing",
    title: "Test applicants before you meet them",
    body: "Email a job applicant a 30 minute test built from the same training your team uses. You get their answers in their own words, how each answer was produced, and questions to ask in the interview.",
  },
  {
    label: "Staff app",
    title: "Rebuilt for phone and desktop",
    body: "A cleaner staff app with a dark mode, made for a five-minute break between orders.",
  },
];

// In order. The label is the stage, not a date.
const ROADMAP: RuledItem[] = [
  {
    label: "Building now",
    title: "Applicant tests for chefs and managers",
    body: "Applicant tests for kitchen and management roles, alongside the bar and floor tests: food safety and the pass for chefs, running a shift and handling incidents for managers.",
  },
  {
    label: "Building now",
    title: "Certificate expiry emails",
    body: "Your Manager Console already tracks every RSA and Food Safety Supervisor certificate. Next, managers get an email before one runs out, so nobody finds out on the night.",
  },
  {
    label: "Building now",
    title: "Gaming certificates",
    body: "RSG and RCG certificates tracked alongside RSA and food safety, with the same expiry warnings, for pubs and clubs with a gaming room.",
  },
  {
    label: "Building now",
    title: "Menu and allergens for floor staff",
    body: "A module on answering a guest's allergen question: what to ask, when to check with the kitchen, and never guessing.",
  },
  {
    label: "Next",
    title: "Your SOPs, turned into training",
    body: "Upload your house rules or an SOP document. The AI drafts short cards and questions from it, and you approve them before staff see them.",
  },
  {
    label: "Next",
    title: "Gaming floor basics",
    body: "For pubs and clubs: signs of gambling harm, self-exclusion, minors in the room and payouts. Day-to-day practice that sits alongside the RSG or RCG certificate, not in place of it.",
  },
  {
    label: "Next",
    title: "Guests from your own venue",
    body: "Live Guest conversations built around your menu, your prices and your house rules, so staff practise the moments they'll meet on your floor.",
  },
  {
    label: "Later",
    title: "Learning paths by role",
    body: "Separate paths for bar, kitchen and gaming staff on a shared core of service, sales and RSA. The first path we build is the one venues ask for most.",
  },
  {
    label: "Later",
    title: "Rostering connections",
    body: "Connect your rostering system so new starters are invited the moment they're added. We'll start with the system our venues use most.",
  },
  {
    label: "Later",
    title: "App Store and Google Play apps",
    body: "Staff can already add Serve By Example to their phone's home screen. Store apps come once venues ask for them.",
  },
];

const WONT_BUILD: SplitPanelItem[] = [
  {
    label: "Certificate courses",
    title: "RSA, RSG, RCG and Food Safety Supervisor",
    body: "Only approved training providers can issue these, and the rules differ by state. Your staff get certified with an approved provider; we keep track of every certificate and when it runs out.",
  },
  {
    label: "Generic courses",
    title: "Off-the-shelf WHS training",
    body: "It's widely available elsewhere. What's specific to your venue, your induction and your house rules, belongs in your own training, which is where we're heading.",
  },
];

export default function RoadmapPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Product Roadmap"
          title="What we’re building next."
          subtitle="Built with the people who run Australian venues. What shipped lately, what we’re building now, and what comes after. No dates we can’t keep."
        />

        <Strip
          kicker="Recently shipped"
          title="New in October 2026."
          lede="All live today, and all included in every venue plan."
          items={SHIPPED}
          action={{ label: "Try Live Guest now, no sign-up", href: "/demo" }}
        />

        <RuledList
          kicker="Now, next, later"
          title="What comes next, in order."
          items={ROADMAP}
        />

        <SplitPanel
          kicker="What we won’t build"
          title="Some things belong elsewhere."
          lede="Saying no keeps the product focused, and keeps your certificates with the people licensed to issue them."
          items={WONT_BUILD}
        />

        {/* Light band: the split panel above ends on a dark panel. */}
        <CTABand
          background="neutral"
          eyebrow="Shape what gets built"
          title="Tell us what your venue needs next."
          copy="Founding venues have a direct line to the people building Serve By Example. What you ask for decides what moves up this list."
          primary={{ label: "Start my free trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Tell us what you need", href: "/contact?source=roadmap" }}
        />
      </main>
      <Footer />
    </div>
  );
}
