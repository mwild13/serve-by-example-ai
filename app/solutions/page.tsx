import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { RuledList, type RuledItem } from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions by Venue Type | Serve By Example",
  description:
    "Interactive training built for every hospitality format: pub groups, fine dining, cocktail bars, franchises, and QSRs.",
  alternates: { canonical: "/solutions" },
};

// One row per vertical page. Multi-venue groups are covered by the pub groups
// page (/solutions/multi-venue redirects there in next.config.ts).
const SEGMENTS: RuledItem[] = [
  {
    label: "Pubs & groups",
    title: "Train hundreds of staff across every site, consistently.",
    body: "Inconsistent training is the silent killer of multi-site brands. One venue does upselling correctly; three others improvise. Serve By Example gives every staff member the same quality training experience, regardless of location, manager, or roster.",
    href: "/solutions/pub-groups",
    linkLabel: "See pub group and multi-venue features",
  },
  {
    label: "Fine dining & bars",
    title: "Spec sheets memorised. Service elevated. Guests impressed.",
    body: "Premium venues live and die by the detail. A staff member who can’t describe a cocktail’s ingredients or explain a dish’s provenance isn’t just uninformed. They damage the experience. Serve By Example trains your team on the precise knowledge that earns loyalty.",
    href: "/solutions/fine-dining",
    linkLabel: "See fine dining features",
  },
  {
    label: "Franchises & QSRs",
    title: "High volume. High turnover. High standards, maintained.",
    body: "Franchise training at scale is a logistics problem. Printed manuals get ignored. Video modules go unwatched. Scenario-based training engages staff the way a great manager would: conversationally, adaptively, and on the device they already have in their pocket.",
    href: "/solutions/franchise-systems",
    linkLabel: "See franchise features",
  },
  {
    label: "Hotel F&B",
    title: "Consistent service standards across every outlet, every shift.",
    body: "Hotel F&B teams face a unique training challenge: multiple outlets, rotating staff, and guests with elevated expectations. Serve By Example gives every team member, whether they’re on room service or behind the rooftop bar, the same quality training experience.",
    href: "/solutions/hotel-fb",
    linkLabel: "See hotel F&B features",
  },
];

export default function SolutionsPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <PageHero
          eyebrow="Solutions"
          title="Built for the way hospitality actually works."
          subtitle="Every venue type has different priorities. Serve By Example adapts to yours, whether you’re running a pub group, a cocktail bar, or a national franchise."
          actions={[
            { label: "Try the Demo", href: "/demo", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        <RuledList
          kicker="By venue type"
          title="Pick the operation closest to yours."
          items={SEGMENTS}
        />

        <CTABand
          eyebrow="Get started"
          title="Your venue type. Your training platform."
          copy="Start with a free demo and see how Serve By Example fits your operation, no commitment required."
          primary={{ label: "Try the Free Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
