import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import { RuledList, SplitPanel, Strip, type RuledItem, type StripItem } from "@/components/marketing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Data Safety | Serve By Example",
  description:
    "Serve By Example stores only what training requires: names, emails, and learning progress. Your staff data, recipes, and operational policies stay private.",
  alternates: { canonical: "/security" },
};

const WE_STORE = [
  { label: "Name", note: "Used for personalised training progress." },
  { label: "Email address", note: "For account access and notifications." },
  { label: "Training progress & scores", note: "Scenario results, mastery levels, module completions." },
  { label: "Venue association", note: "Which venue a staff member belongs to." },
];

const WE_NEVER_STORE = [
  "Government-issued ID or date of birth",
  "Home address or personal contact details",
  "Payment card numbers (handled entirely by Stripe)",
  "Tax file numbers or employment contracts",
  "Medical or personal records of any kind",
];

// This page names the AI provider on purpose: it is a data-handling disclosure,
// not marketing copy (see the note in To_do_list.md).
const AI_PRINCIPLES: RuledItem[] = [
  {
    title: "Only the scenario context is sent",
    body: "When staff practice a roleplay, only the training prompt and their response text is sent to OpenAI for evaluation. No venue names, staff names, or operational data is transmitted.",
  },
  {
    title: "Your recipes stay yours",
    body: "Your menu specs, house rules, and internal policies are stored in your venue's isolated account. They are never shared with external services or model providers.",
  },
  {
    title: "No model training on your data",
    body: "OpenAI processes evaluation requests via their API under their data usage policy for API customers, which does not use input data to train their models.",
  },
  {
    title: "Isolation between venues",
    body: "Each venue account is fully separated. Staff from one venue cannot view the data, training results, or settings of any other venue, even within the same group.",
  },
  {
    title: "AI outputs are for training only",
    body: "AI-generated feedback, coaching responses, and scenario evaluations are educational tools only. They do not constitute professional business, legal, financial, HR, or OHS/WHS advice. Users are responsible for verifying outputs before acting on them in any operational context.",
  },
];

const PAYMENTS: StripItem[] = [
  {
    title: "Processed by Stripe",
    body: "All billing is processed by Stripe, a PCI-DSS Level 1 certified payment processor.",
  },
  {
    title: "No card details held",
    body: "Serve By Example never sees, stores, or has access to your card details.",
  },
  {
    title: "A confirmation token only",
    body: "Stripe handles the entire payment flow. We receive only a confirmation token.",
  },
];

export default function SecurityPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <PageHero
          eyebrow="Trust & Security"
          title="Your team’s data stays yours."
          subtitle="Serve By Example is a training platform, not a data platform. We collect the minimum required to run an effective training experience, nothing more."
        />

        <SplitPanel
          kicker="Data transparency"
          title="Exactly what we collect, and what we never touch."
          items={[
            {
              label: "What we never store",
              title: "No sensitive personal data",
              points: WE_NEVER_STORE,
              body: "We are a training tool. We have no reason to collect sensitive personal data.",
            },
          ]}
        >
          <p className="sbe-mkt-show-tag sbe-mkt-duo-sub">What we store</p>
          <p className="sbe-mkt-lede">Only the minimum needed to run personalised training for your staff.</p>
          <ul className="sbe-mkt-points">
            {WE_STORE.map((item) => (
              <li key={item.label}>
                <strong>{item.label}.</strong> {item.note}
              </li>
            ))}
          </ul>
        </SplitPanel>

        <RuledList
          tone="alt"
          kicker="Platform transparency"
          title="How the platform handles your data."
          lede="We use OpenAI’s API for scenario evaluation. Here is exactly how it interacts with your content."
          items={AI_PRINCIPLES}
        />

        <Strip
          kicker="Payments"
          title="Payment data never touches our servers."
          items={PAYMENTS}
          action={{ label: "Stripe’s security documentation", href: "https://stripe.com/docs/security" }}
        />

        <CTABand
          eyebrow="Still have questions?"
          title="We’re happy to go deeper."
          copy="If your organisation has specific data requirements, compliance questions, or a security review process, contact us directly."
          primary={{ label: "Contact Us", href: "/contact" }}
          secondary={{ label: "Privacy Policy", href: "/privacy" }}
        />
      </main>
      <Footer />
    </div>
  );
}
