import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const aiPrinciples = [
  {
    title: "Only the scenario context is sent",
    desc: "When staff practice a roleplay, only the training prompt and their response text is sent to OpenAI for evaluation. No venue names, staff names, or operational data is transmitted.",
  },
  {
    title: "Your recipes stay yours",
    desc: "Your menu specs, house rules, and internal policies are stored in your venue's isolated account. They are never shared with external services or model providers.",
  },
  {
    title: "No model training on your data",
    desc: "OpenAI processes evaluation requests via their API under their data usage policy for API customers, which does not use input data to train their models.",
  },
  {
    title: "Isolation between venues",
    desc: "Each venue account is fully separated. Staff from one venue cannot view the data, training results, or settings of any other venue, even within the same group.",
  },
  {
    title: "AI outputs are for training only",
    desc: "AI-generated feedback, coaching responses, and scenario evaluations are educational tools only. They do not constitute professional business, legal, financial, HR, or OHS/WHS advice. Users are responsible for verifying outputs before acting on them in any operational context.",
  },
];

export default function SecurityPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Trust &amp; Security</span>
            <h1>Your team&rsquo;s data stays yours.</h1>
            <p className="inner-hero-sub">
              Serve By Example is a training platform, not a data platform. We collect the minimum
              required to run an effective training experience, nothing more.
            </p>
          </div>
        </section>

        {/* ── What we store vs what we don't ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Data transparency</span>
              <h2>Exactly what we collect, and what we never touch.</h2>
            </div>
            <div className="security-data-grid">
              <div className="security-data-card security-data-card--store">
                <div className="security-data-card-header">
                  <div className="security-data-badge security-data-badge--yes">What we store</div>
                  <p className="security-data-card-sub">
                    Only the minimum needed to run personalised training for your staff.
                  </p>
                </div>
                <ul className="security-data-list">
                  {weStore.map((item) => (
                    <li key={item.label} className="security-data-item security-data-item--yes">
                      <div className="security-data-item-label">{item.label}</div>
                      <div className="security-data-item-note">{item.note}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="security-data-card security-data-card--never">
                <div className="security-data-card-header">
                  <div className="security-data-badge security-data-badge--no">What we never store</div>
                  <p className="security-data-card-sub">
                    We are a training tool. We have no reason to collect sensitive personal data.
                  </p>
                </div>
                <ul className="security-data-list">
                  {weNeverStore.map((item) => (
                    <li key={item.label} className="security-data-item security-data-item--no">
                      <div className="security-data-item-label">{item.label}</div>
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
            <div className="section-header center">
              <span className="eyebrow">Platform transparency</span>
              <h2>How the platform handles your data.</h2>
              <p>
                We use OpenAI&rsquo;s API for scenario evaluation. Here is exactly how it interacts
                with your content.
              </p>
            </div>
            <div className="card-grid card-grid-2" style={{ marginTop: 40 }}>
              {aiPrinciples.map((item) => (
                <article key={item.title} className="info-card">
                  <h3 style={{ fontSize: "1rem", marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontSize: "0.86rem", color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Payments ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="security-payments">
              <div className="security-payments-text">
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
              <div className="security-payments-badge">
                <div className="security-badge-card">
                  <div className="security-badge-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="security-badge-label">PCI-DSS compliant</div>
                  <div className="security-badge-sub">via Stripe</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container" style={{ textAlign: "center" }}>
            <span className="eyebrow">Still have questions?</span>
            <h2>We&rsquo;re happy to go deeper.</h2>
            <p style={{ maxWidth: 480, margin: "0 auto 32px", color: "var(--text-soft)" }}>
              If your organisation has specific data requirements, compliance questions, or a security
              review process, contact us directly.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/contact" className="btn btn-primary btn-lg">
                Contact Us
              </Link>
              <Link href="/privacy" className="btn btn-secondary btn-lg">
                Privacy Policy
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .security-data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 48px;
        }
        .security-data-card {
          background: var(--surface);
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--line);
        }
        .security-data-card-header {
          padding: 24px 28px 16px;
          border-bottom: 1px solid var(--line-faint);
        }
        .security-data-card-sub {
          font-size: 0.83rem;
          color: var(--text-muted);
          margin: 8px 0 0;
          line-height: 1.5;
        }
        .security-data-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-radius: var(--radius-pill);
          padding: 4px 12px;
        }
        .security-data-badge--yes {
          background: var(--green-light);
          color: var(--green);
          border: 1px solid rgba(31, 78, 55, 0.15);
        }
        .security-data-badge--no {
          background: #f8eded;
          color: #7d3535;
          border: 1px solid rgba(125, 53, 53, 0.15);
        }
        .security-data-list {
          padding: 8px 0;
        }
        .security-data-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 12px 28px;
          border-bottom: 1px solid var(--line-faint);
        }
        .security-data-item:last-child {
          border-bottom: none;
        }
        .security-data-item--yes .security-data-item-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--green-deep);
        }
        .security-data-item--no .security-data-item-label {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-soft);
          text-decoration: line-through;
          text-decoration-color: rgba(125, 53, 53, 0.4);
        }
        .security-data-item-note {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .security-payments {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 64px;
          align-items: center;
        }
        .security-payments-text h2 {
          margin: 12px 0 16px;
        }
        .security-payments-text p {
          color: var(--text-soft);
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .security-payments-badge {
          display: flex;
          justify-content: center;
        }
        .security-badge-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          padding: 32px 24px;
          text-align: center;
          width: 100%;
        }
        .security-badge-icon {
          width: 56px;
          height: 56px;
          background: var(--green-light);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: var(--green);
        }
        .security-badge-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--green-deep);
          margin-bottom: 4px;
        }
        .security-badge-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        @media (max-width: 860px) {
          .security-data-grid {
            grid-template-columns: 1fr;
          }
          .security-payments {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .security-payments-badge {
            justify-content: flex-start;
          }
          .security-badge-card {
            max-width: 220px;
          }
        }
      `}</style>
    </div>
  );
}
