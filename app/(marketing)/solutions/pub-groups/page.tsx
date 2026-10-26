import SolutionPage, { type SolutionContent } from "@/components/marketing/SolutionPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Pub Groups & Multi-Venue Operators | Serve By Example",
  description:
    "Centralised staff training for pub groups and multi-venue hospitality operators. Standardise service quality, track compliance, and manage every venue from one console.",
  alternates: { canonical: "/solutions/pub-groups" },
};

// Facts and claims are carried over from the previous page unchanged; the ones
// that need a source are listed in To_do_list.md.
const CONTENT: SolutionContent = {
  slug: "pub-groups",
  crumb: "Pubs & Multi-Venue Groups",
  schemaName: "Pubs & Multi-Venue Groups",
  eyebrow: "Pubs & Multi-Venue Groups",
  title: "Train every venue. Manage from one place.",
  subtitle: "Inconsistent training is the silent killer of multi-site operations. One venue nails upselling; three others improvise. Serve By Example gives every staff member the same quality training experience, regardless of location, manager, or roster, and gives operators a single view across their entire group.",
  facts: {
    kicker: "Across the group",
    title: "What one console covers.",
    rows: [
      {
        metric: "3",
        title: "Stage structured onboarding path",
        body: "From knowledge to verified floor readiness.",
      },
      {
        metric: "1",
        title: "Console for every venue",
        body: "No venue cap on multi-venue plans.",
      },
      {
        metric: "35",
        title: "Staff seats on the Group plan",
        body: "Unlimited seats on Franchise.",
      },
    ],
  },
  shot: {
    tag: "In the product",
    title: "Group-wide visibility in one console",
    body: "Compare readiness scores across venues, spot skill gaps before they become service issues, and direct coaching where it matters most. Manage every venue in the group from a single dashboard.",
    image: {
      src: "/shots/console-teams.webp",
      alt: "Serve By Example manager console: training completion and scores for each team and role",
      width: 2000,
      height: 1250,
    },
  },
  features: {
    kicker: "Multi-site management",
    title: "Built for the complexity of pub groups and multi-venue operators",
    items: [
      {
        title: "Consistent training across all sites",
        body: "Every staff member in every venue goes through the same quality training. No more \"it depends on the manager\" variation.",
      },
      {
        title: "New starters floor-ready in weeks",
        body: "Structured onboarding modules get bartenders and floor staff service-ready without pulling your best people off their shifts to train.",
      },
      {
        title: "Compliance tracked automatically",
        body: "RSA, responsible service, and venue policy modules are completed and logged. Each certificate's expiry date sits on the Compliance tab.",
      },
      {
        title: "Skill gap analysis across the group",
        body: "The platform identifies patterns across venues. If multiple sites have weak upsell scores, you know to run group-wide coaching before it affects revenue.",
      },
      {
        title: "Cross-venue performance tracking",
        body: "Staff across all venues train on the same content. Group leaderboards surface your top performers and flag who needs support across the whole group.",
      },
      {
        title: "Test applicants at every venue",
        body: "Each venue manager can email an applicant a 30 minute test for the bar, the floor, the kitchen or a supervisor role, so every site hires against the same questions.",
        href: "/applicant-testing",
        linkLabel: "How applicant tests work",
      },
    ],
  },
  cta: {
    title: "Ready to standardise training across your group?",
    copy: "Start with a free demo, then a 14-day free trial. Cancel anytime.",
  },
};

export default function PubGroupsPage() {
  return <SolutionPage content={CONTENT} />;
}
