import SolutionPage, { type SolutionContent } from "@/components/marketing/SolutionPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Fine Dining & Cocktail Bars | Serve By Example",
  description:
    "Train your team on the precise product knowledge and elevated service standards that premium venues demand. Cocktail specs, wine pairings, guest recovery, all scenario-coached.",
  alternates: { canonical: "/solutions/fine-dining" },
};

// Facts and claims are carried over from the previous page unchanged; the ones
// that need a source are listed in To_do_list.md.
const CONTENT: SolutionContent = {
  slug: "fine-dining",
  crumb: "Fine Dining & Bars",
  schemaName: "Fine Dining & Cocktail Bars",
  eyebrow: "Fine Dining & Cocktail Bars",
  title: "Spec sheets memorised. Service elevated. Guests impressed.",
  subtitle: "Premium venues live and die by the detail. A staff member who can’t describe a cocktail’s ingredients or explain a dish’s provenance isn’t just uninformed. They damage the experience. Serve By Example trains your team on the precise knowledge that earns loyalty.",
  facts: {
    kicker: "In the library",
    title: "What your team trains on.",
    rows: [
      {
        metric: "38",
        title: "Cocktail and spirit specs",
        body: "Embedded in the training library.",
      },
      {
        metric: "65",
        unit: "+",
        title: "Bartending and service scenarios",
        body: "To practise before the next big service.",
      },
      {
        metric: "5",
        title: "Service dimensions",
        body: "Every response is evaluated across all five.",
      },
    ],
  },
  shot: {
    tag: "In the product",
    title: "Cocktail and wine knowledge drilled daily",
    body: "Staff practise recipes, spirit profiles, and provenance stories through scenario repetition until they can describe them fluently under pressure.",
    image: {
      src: "/shots/Cocktail-mobile.png",
      alt: "Serve By Example staff training app on mobile – 38-cocktail drink library",
      width: 912,
      height: 1844,
    },
    bare: true,
  },
  features: {
    kicker: "Premium training tools",
    title: "Training as precise as your menu",
    items: [
      {
        title: "Premium guest recovery training",
        body: "Handle complaints, special requests, and high-expectation guests with the composure and language that protects your reputation and earns repeat visits.",
      },
      {
        title: "Upsell confidence scored and tracked",
        body: "The platform tracks every staff member’s upsell scenario performance and flags who needs targeted coaching before the next big service.",
      },
      {
        title: "High-pressure simulation before Friday night",
        body: "Staff rehearse service timing, course pacing, and multi-table management in scenario practice, before the stakes are real.",
      },
    ],
  },
  cta: {
    title: "Ready to elevate your service standards?",
    copy: "Try a live bartending or upsell scenario now. No sign-up required.",
  },
};

export default function FineDiningPage() {
  return <SolutionPage content={CONTENT} />;
}
