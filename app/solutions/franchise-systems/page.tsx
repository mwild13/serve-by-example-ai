import SolutionPage, { type SolutionContent } from "@/components/marketing/SolutionPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Franchise Systems | Serve By Example",
  description:
    "Replace inconsistent franchisee training with a scalable training platform that enforces brand standards across every location without head-office oversight.",
  alternates: { canonical: "/solutions/franchise-systems" },
};

// Facts and claims are carried over from the previous page unchanged; the ones
// that need a source are listed in To_do_list.md.
const CONTENT: SolutionContent = {
  slug: "franchise-systems",
  crumb: "Franchise Systems",
  schemaName: "Franchises & QSRs",
  eyebrow: "Franchises & QSRs",
  title: "High volume. High turnover. High standards, maintained.",
  subtitle: "Franchise training at scale is a logistics problem. Printed manuals get ignored. Video modules go unwatched. Scenario-based training engages staff the way a great manager would: conversationally, adaptively, and on the device they already have in their pocket.",
  facts: {
    kicker: "At network scale",
    title: "What a rollout looks like.",
    rows: [
      {
        metric: "200",
        unit: "+",
        title: "Staff capacity across 12+ locations",
        body: "Supported from Day 1.",
      },
      {
        metric: "0",
        title: "Head-office visits",
        body: "Required to see training compliance.",
      },
      {
        metric: "100",
        unit: "%",
        title: "Completable on mobile",
        body: "All training, no desktop required.",
      },
    ],
  },
  shot: {
    tag: "In the product",
    title: "Head-office visibility without micromanagement",
    body: "Franchise support managers see training completion, compliance status, and readiness scores across all locations, without visiting every site.",
    image: {
      src: "/shots/Overview Console Wide.png",
      alt: "Serve By Example manager console: venue overview with training completion, compliance status, and staff needing attention",
      width: 3004,
      height: 1654,
    },
  },
  features: {
    kicker: "Franchise-ready tools",
    title: "Training infrastructure your franchisees will actually use",
    items: [
      {
        title: "Brand standards enforced, not just suggested",
        body: "Every franchisee’s staff trains on the same materials. Service language, upsell scripts, and compliance modules are standardised across the network.",
      },
      {
        title: "Scalable from 5 to 500 staff",
        body: "Whether you have 3 locations or 30, the platform scales without additional overhead. New franchisees are onboarded to the training system in minutes.",
      },
      {
        title: "High-turnover onboarding without the overhead",
        body: "Hospitality turnover is real. Self-serve digital onboarding means new starters train themselves through structured modules without pulling management time.",
      },
    ],
  },
  cta: {
    title: "Ready to standardise training across your franchise network?",
    copy: "Try the demo or talk to us about a network rollout.",
  },
};

export default function FranchiseSystemsPage() {
  return <SolutionPage content={CONTENT} />;
}
