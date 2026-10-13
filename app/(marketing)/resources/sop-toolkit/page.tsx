import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import {
  Faq,
  RuledList,
  SplitPanel,
  Steps,
  Strip,
  type RuledItem,
  type SplitPanelItem,
  type Step,
  type StripItem,
} from "@/components/marketing/sections";

export const metadata: Metadata = {
  title: "Free Staff Onboarding SOP Templates | Serve By Example",
  description:
    "Generate customised, venue-specific staff onboarding SOP templates for Australian hospitality operators in 60 seconds. Covers RSA, allergens, opening/closing, and compliance paperwork.",
  alternates: { canonical: "/resources/sop-toolkit" },
};

// Feeds both the accordion and the FAQPage JSON-LD, so the two cannot drift apart.
const FAQS = [
  { q: "Is this actually free?", a: "Yes. No credit card, no account, no catch. Enter your name and email to unlock your editable template." },
  { q: "Which Australian states are covered?", a: "All 8 states and territories. Regulatory references are tailored to the jurisdiction you select." },
  { q: "Can I edit the template?", a: "Yes. You receive a fully editable Notion document you can duplicate into your own workspace and customise from there." },
  { q: "Is this a substitute for legal or HR advice?", a: "No. Templates are aligned to publicly available Award and licensing frameworks. Seek qualified advice for complex compliance questions." },
  { q: "What's the difference between this and the Serve By Example platform?", a: "The SOP template is a one-time static document. The platform gives your team interactive training, AI scenario practice, progress tracking, and a full manager dashboard." },
];

const sopFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQS.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a },
  })),
};

// Each area pairs what the template covers with one line taken from it.
const withSample = (covers: string, sample: string) => (
  <>
    {covers}
    <span className="sbe-mkt-plan-quote">&ldquo;{sample}&rdquo;</span>
  </>
);

const AREAS: RuledItem[] = [
  {
    title: "RSA & Responsible Service",
    body: withSample(
      "State liquor legislation, shift registry requirements, refusal-of-service escalation protocols, and competency card verification procedures.",
      "Log all incident reports inside the Shift Registry within 30 minutes of any patron eviction event.",
    ),
  },
  {
    title: "Allergen Communication",
    body: withSample(
      "Food Standards Code 1.2.3 disclosure obligations, cross-contamination prevention, and kitchen-to-floor sign-off accountability.",
      "Verify alternative milk pitchers are chemically isolated and machine-washed after every single use.",
    ),
  },
  {
    title: "Opening & Closing Procedures",
    body: withSample(
      "Security lockout compliance, environmental control shutdown checklists, incident register handover, and end-of-shift POS reconciliation.",
      "Confirm all fire egress pathways are cleared and unlocked before opening for service.",
    ),
  },
  {
    title: "Pre-Start Compliance Paperwork",
    body: withSample(
      "Right-to-work verification, tax file number collection, Fair Work Information Statement, and policy declaration signatures.",
      "Issue the Fair Work Information Statement before assigning the first paid roster shift.",
    ),
  },
];

const BUILD_STEPS: Step[] = [
  {
    num: "01",
    title: "Select your venue type",
    body: "Pick from bars, cafes, full-service restaurants, clubs, or multi-outlet hotel F&B operations.",
  },
  {
    num: "02",
    title: "Select your state and pain point",
    body: "We align the template to your local regulatory framework and your primary operational friction point.",
  },
  {
    num: "03",
    title: "Unlock your editable template",
    body: "Receive a fully editable Notion document you can copy straight into your own workspace.",
  },
];

const VENUE_TYPES: RuledItem[] = [
  { title: "Late-Night Bar / Pub", body: "Liquor licensing curfews, lockout laws, RSA shift registry" },
  { title: "Cafe or Brunch Venue", body: "BYO licensing edge cases, allergen menus, food safety supervisor requirements" },
  { title: "Full-Service Restaurant", body: "FOH/BOH handover documentation, allergen accountability chains" },
  { title: "Hotel F&B", body: "Cross-venue shift compliance, multi-outlet incident registers" },
  { title: "Club or Nightclub", body: "Crowd controller registry, lockout/curfew procedures, patron ID logs" },
];

const WHO: StripItem[] = [
  {
    title: "Venue Manager",
    body: "Streamline casual inductions, reduce RSA exposure, and close procedural gaps before a compliance visit.",
  },
  {
    title: "Owner-Operator",
    body: "Protect your licence, document your standards, and hand off training to floor staff with confidence.",
  },
  {
    title: "Hotel F&B / Ops Manager",
    body: "Standardise onboarding across sites and audit compliance variation between venues.",
  },
];

const LAW: SplitPanelItem[] = [
  {
    title: "Fair Work Act 2009",
    body: "Employers must provide the Fair Work Information Statement to every new employee at commencement.",
  },
  {
    title: "Food Standards Code 1.2.3",
    body: "Allergen declaration is a legal obligation under the Australia New Zealand Food Standards Code, not a best-practice guideline.",
  },
  {
    title: "State Liquor Acts",
    body: "RSA competency card verification is a venue licence condition in every Australian state and territory.",
  },
];

export default function SopToolkitPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sopFaqSchema) }}
        />

        <PageHero
          eyebrow="Free Resource"
          title="Free Staff Onboarding SOP Templates for Australian Hospitality Venues"
          subtitle="Built in 60 seconds. Customised to your venue type, your state, and your biggest compliance pain point."
          actions={[
            { label: "Build My Free SOP Template", href: "/toolkit", variant: "primary" },
            { label: "Download PDF Checklist", href: "/resources", variant: "secondary" },
          ]}
        />

        <RuledList
          tone="alt"
          kicker="Four compliance areas"
          title="Every template covers one critical friction point."
          items={AREAS}
          primary={{ label: "Build my free SOP template", href: "/toolkit" }}
        />

        <Steps
          kicker="Three steps"
          title="Personalised to your venue in under a minute."
          steps={BUILD_STEPS}
        />

        <RuledList
          kicker="Five venue categories"
          title="Built for every type of Australian hospitality operation."
          items={VENUE_TYPES}
        />

        <Strip
          tone="warm"
          kicker="Built for operators"
          title="Whether you run one venue or five."
          items={WHO}
        />

        <SplitPanel
          kicker="Compliance context"
          title="Why documentation matters under Australian law."
          lede="Templates are aligned to the Hospitality Industry (General) Award 2020 and applicable state licensing requirements. Not a substitute for legal or HR advice. Current as at June 2026."
          items={LAW}
        />

        <Faq tone="alt" kicker="Common questions" title="SOP Toolkit FAQ" items={FAQS} name="sop-faq" />

        <CTABand
          background="gold"
          title="Build your free SOP template now."
          copy="No account required. Takes 60 seconds."
          primary={{ label: "Build My Free SOP Template", href: "/toolkit" }}
        />
      </main>
      <Footer />
    </div>
  );
}
