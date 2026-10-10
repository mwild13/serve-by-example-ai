import SolutionPage, { type SolutionContent } from "@/components/marketing/SolutionPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Training for Hotel F&B Teams | Serve By Example",
  description:
    "From all-day dining to rooftop bars, equip every hotel F&B outlet with consistent, scalable interactive training. Serve By Example works across multiple outlets, service styles, and staff levels.",
  alternates: { canonical: "/solutions/hotel-fb" },
};

// Facts and claims are carried over from the previous page unchanged; the ones
// that need a source are listed in To_do_list.md.
const CONTENT: SolutionContent = {
  slug: "hotel-fb",
  crumb: "Hotel F&B",
  schemaName: "Hotel F&B",
  eyebrow: "Hotel Food & Beverage",
  title: "Multiple outlets. One standard of service.",
  subtitle: "Hotel F&B is complex: multiple outlets, rotating staff, elevated guest expectations, and non-negotiable compliance requirements. Serve By Example gives your entire F&B operation a single, consistent training platform, from the breakfast shift to the late-night bar.",
  facts: {
    kicker: "For every outlet",
    title: "What every team member gets.",
    rows: [
      {
        metric: "3",
        title: "Stage structured onboarding path",
        body: "For seasonal and casual intake.",
      },
      {
        metric: "19",
        title: "Languages supported",
        body: "For diverse hotel teams.",
      },
      {
        metric: "40",
        unit: "+",
        title: "Training modules",
        body: "Available to staff on any shift, any device.",
      },
    ],
  },
  shot: {
    tag: "In the product",
    title: "Compliance and certification tracked",
    body: "RSA modules, allergen awareness, and brand standards are tracked automatically. F&B managers receive alerts before any certification lapses.",
    image: {
      src: "/shots/Overview Console Compact.webp",
      alt: "Serve By Example manager console: venue overview with training completion, compliance status, and staff needing attention",
      width: 2416,
      height: 1558,
    },
  },
  features: {
    kicker: "Hotel F&B features",
    title: "Purpose-built for hotel F&B complexity",
    items: [
      {
        title: "One platform across all outlets",
        body: "Train your all-day restaurant, room service team, rooftop bar, and banquet staff from a single platform. Consistent standards regardless of outlet.",
      },
      {
        title: "Guest experience standards, not just product knowledge",
        body: "Hotel guests have elevated expectations. Our scenarios train staff on the language, demeanour, and problem resolution that five-star service demands.",
      },
      {
        title: "Fast onboarding for seasonal and casual staff",
        body: "Hotel F&B teams turn over fast, especially seasonally. Our structured onboarding gets casual and new starters performing to standard within weeks.",
      },
    ],
  },
  cta: {
    title: "Ready to standardise your hotel F&B training?",
    copy: "Book a walkthrough or try the demo yourself. No commitment required.",
  },
};

export default function HotelFBPage() {
  return <SolutionPage content={CONTENT} />;
}
