import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Data Safety | Serve By Example",
  description:
    "Serve By Example stores only what training requires: names, emails, and learning progress. Your staff data, recipes, and operational policies stay private.",
  alternates: { canonical: "/security" },
};

const weStore = [
  { label: "Name", note: "Used for personalised training progress." },
  { label: "Email address", note: "For account access and notifications." },
  { label: "Training progress & scores", note: "Scenario results, mastery levels, module completions." },
  { label: "Venue association", note: "Which venue a staff member belongs to." },
];

const weNeverStore = [
  { label: "Government-issued ID or date of birth" },
  { label: "Home address or personal contact details" },
  { label: "Payment card numbers (handled entirely by Stripe)" },
  { label: "Tax file numbers or employment contracts" },
  { label: "Medical or personal records of any kind" },
];

const aiPrinciples: FeatureGridItem[] = [
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

export default function SecurityPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <PageHero
          eyebrow="Trust & Security"
          title="Your team’s data stays yours."
          subtitle="Serve By Example is a training platform, not a data platform. We collect the minimum required to run an effective training experience, nothing more."
        />

        {/* ── What we store vs what we don't ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Data transparency"
              title="Exactly what we collect, and what we never touch."
            />
            <div className="sbe-mkt-security-data-grid">
              <div className="sbe-mkt-security-data-card">
                <div className="sbe-mkt-security-data-card-header">
                  <div className="sbe-mkt-security-data-badge sbe-mkt-security-data-badge--yes">What we store</div>
                  <p className="sbe-mkt-security-data-card-sub">
                    Only the minimum needed to run personalised training for your staff.
                  </p>
                </div>
                <ul className="sbe-mkt-security-data-list">
                  {weStore.map((item) => (
                    <li key={item.label} className="sbe-mkt-security-data-item sbe-mkt-security-data-item--yes">
                      <div className="sbe-mkt-security-data-item-label">{item.label}</div>
                      <div className="sbe-mkt-security-data-item-note">{item.note}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sbe-mkt-security-data-card">
                <div className="sbe-mkt-security-data-card-header">
                  <div className="sbe-mkt-security-data-badge sbe-mkt-security-data-badge--no">What we never store</div>
                  <p className="sbe-mkt-security-data-card-sub">
                    We are a training tool. We have no reason to collect sensitive personal data.
                  </p>
                </div>
                <ul className="sbe-mkt-security-data-list">
                  {weNeverStore.map((item) => (
                    <li key={item.label} className="sbe-mkt-security-data-item sbe-mkt-security-data-item--no">
                      <div className="sbe-mkt-security-data-item-label">{item.label}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── AI transparency ── */}
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Platform transparency"
              title="How the platform handles your data."
              copy="We use OpenAI’s API for scenario evaluation. Here is exactly how it interacts with your content."
            />
            <FeatureGrid items={aiPrinciples} columns={2} />
          </div>
        </section>

        {/* ── Payments ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="sbe-mkt-security-payments">
              <div className="sbe-mkt-security-payments-text">
                <span className="eyebrow">Payments</span>
                <h2>Payment data never touches our servers.</h2>
                <p>
                  All billing is processed by Stripe, a PCI-DSS Level 1 certified payment processor.
                  Serve By Example never sees, stores, or has access to your card details. Stripe
                  handles the entire payment flow. We receive only a confirmation token.
                </p>
                <Link href="https://stripe.com/docs/security" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                  Stripe&rsquo;s security documentation
                </Link>
              </div>
              <div className="sbe-mkt-security-payments-badge">
                <div className="sbe-mkt-security-badge-card">
                  <div className="sbe-mkt-security-badge-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="sbe-mkt-security-badge-label">PCI-DSS compliant</div>
                  <div className="sbe-mkt-security-badge-sub">via Stripe</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="green"
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
