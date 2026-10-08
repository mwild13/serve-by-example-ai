import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import {
  Ledger,
  MediaRows,
  RuledList,
  type LedgerRow,
  type MediaRow,
  type RuledItem,
} from "@/components/marketing/sections";

/*
 * SolutionPage — the shared layout for every /solutions/<vertical> page.
 * A vertical's page file holds its metadata and one SolutionContent constant;
 * the structure lives here so the four pages cannot drift apart.
 * Order: hero, ledger (three facts), one product screenshot, ruled feature
 * list with the trial action and the guarantee, closing band.
 */

export type SolutionContent = {
  slug: string;
  /** Name used in the breadcrumb and the BreadcrumbList JSON-LD. */
  crumb: string;
  schemaName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  facts: { kicker: string; title: string; rows: LedgerRow[] };
  shot: MediaRow;
  features: { kicker: string; title: string; items: RuledItem[] };
  cta: { title: string; copy: string };
};

const SITE = "https://servebyexample.co";

export default function SolutionPage({ content }: { content: SolutionContent }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": `${SITE}/solutions` },
      { "@type": "ListItem", "position": 3, "name": content.schemaName, "item": `${SITE}/solutions/${content.slug}` },
    ],
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

        <PageHero
          variant="solution"
          breadcrumb={[{ label: "Solutions", href: "/solutions" }, { label: content.crumb }]}
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.subtitle}
          actions={[
            { label: "Request Venue Access", href: "/contact", variant: "primary" },
            { label: "View Pricing", href: "/membership", variant: "secondary" },
          ]}
        />

        <Ledger kicker={content.facts.kicker} title={content.facts.title} rows={content.facts.rows} />

        <MediaRows tone="warm" rows={[content.shot]} />

        <RuledList
          tone="alt"
          kicker={content.features.kicker}
          title={content.features.title}
          items={content.features.items}
          primary={{ label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Compare plans and prices", href: "/membership" }}
          note={{
            title: "14-Day Performance Guarantee. Zero risk to your floor operations.",
            body: "If your team’s training engagement doesn’t noticeably increase in the first 14 days, you won’t be charged. No questions asked.",
          }}
        />

        <CTABand
          eyebrow="Get started"
          title={content.cta.title}
          copy={content.cta.copy}
          primary={{ label: "Try the Demo", href: "/demo" }}
          secondary={{ label: "Talk to Us", href: "/contact" }}
        />
      </main>
      <Footer />
    </div>
  );
}
