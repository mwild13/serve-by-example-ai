"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/ui/SectionHeading";
import ROICalculator from "@/components/ui/ROICalculator";
import CompareMatrix from "@/components/ui/CompareMatrix";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";

// ── Tier data — copy locked, do not edit without a pricing review ─────────────

type TierAction =
  | { kind: "checkout"; monthlyPlan: string; yearlyPlan: string; label: string }
  | { kind: "trial"; tier: string; label: string }
  | { kind: "contact"; label: string };

type Tier = {
  id: string;
  name: string;
  sublabel: string;
  badge?: string;
  highlight?: boolean;
  monthly: string;
  annualMonthly: string;
  annualTotal: string;
  isCustom?: boolean;
  description: string;
  features: { name: string; sublabel?: string }[];
  action: TierAction;
  microcopy: string;
};

const TIERS: Tier[] = [
  {
    id: "staff",
    name: "Staff",
    sublabel: "Pro",
    monthly: "AUD $19 / mo",
    annualMonthly: "AUD $15.83 / mo",
    annualTotal: "AUD $190/yr",
    description: "For individual bartenders and hospitality staff.",
    features: [
      { name: "Neural Scenario Forge", sublabel: "AI live roleplay evaluation" },
      { name: "Mastery Protocol Engine", sublabel: "40 modules across Bartending, Sales & Management" },
      { name: "Dynamic Skill Calibration", sublabel: "Adapts to what each staff member still needs to learn" },
      { name: "Rapid Deploy Drilling", sublabel: "Streak-based rapid-fire quiz mode" },
      { name: "Reflex Scenario Challenges", sublabel: "5 tap-based mobile mini-games" },
    ],
    action: { kind: "checkout", monthlyPlan: "pro", yearlyPlan: "pro_yearly", label: "Subscribe now" },
    microcopy: "No credit card required for trial. Billed annually. Cancel anytime.",
  },
  {
    id: "boutique",
    name: "Venue",
    sublabel: "Boutique",
    badge: "Most Popular",
    highlight: true,
    monthly: "AUD $79 / mo",
    annualMonthly: "AUD $65.83 / mo",
    annualTotal: "AUD $790/yr",
    description: "For single-venue operators and small teams.",
    features: [
      { name: "Everything in Staff" },
      { name: "Up to 15 staff seats", sublabel: "Invite via venue code, live in under 5 minutes" },
      { name: "Command & Compliance Centre", sublabel: "Real-time team progress and compliance dashboard" },
      { name: "Competitive Performance Index", sublabel: "Live staff leaderboards" },
      { name: "Guided venue setup call", sublabel: "1-on-1 onboarding session included" },
    ],
    action: { kind: "trial", tier: "boutique", label: "Try Free for 14 Days" },
    microcopy: "14-day free trial. No credit card required. Pick a plan when you’re ready.",
  },
  {
    id: "commercial",
    name: "Group",
    sublabel: "Commercial",
    monthly: "AUD $149 / mo",
    annualMonthly: "AUD $124.17 / mo",
    annualTotal: "AUD $1,490/yr",
    description: "For growing venues with larger teams and multiple locations.",
    features: [
      { name: "Everything in Venue" },
      { name: "Up to 35 staff seats", sublabel: "Across one or multiple service areas" },
      { name: "Compliance Pulse Monitoring", sublabel: "Live cross-team training compliance" },
      { name: "Advanced analytics", sublabel: "Cohort comparisons and performance trends" },
      { name: "Dedicated onboarding specialist", sublabel: "2 setup sessions included" },
    ],
    action: { kind: "trial", tier: "commercial", label: "Try Free for 14 Days" },
    microcopy: "14-day free trial. No credit card required. Pick a plan when you’re ready.",
  },
  {
    id: "enterprise",
    name: "Franchise",
    sublabel: "Enterprise",
    monthly: "",
    annualMonthly: "",
    annualTotal: "",
    isCustom: true,
    description: "For venue groups and large hospitality organisations.",
    features: [
      { name: "Everything in Group" },
      { name: "Unlimited staff seats", sublabel: "Across unlimited venues" },
      { name: "Franchise Command Network", sublabel: "Multi-venue staff roster and analytics" },
      { name: "Custom module development", sublabel: "Training tailored to your brand" },
      { name: "White-glove onboarding", sublabel: "Dedicated account management included" },
    ],
    action: { kind: "contact", label: "Talk to us" },
    microcopy: "Custom pricing. SLA included. White-label available.",
  },
];

// ── Small presentational pieces ───────────────────────────────────────────────

function FeatureItem({ name, sublabel }: { name: string; sublabel?: string }) {
  return (
    <li className="sbe-mkt-pricefeature">
      <span className="sbe-mkt-pricefeature-name">{name}</span>
      {sublabel ? <span className="sbe-mkt-pricefeature-sub">{sublabel}</span> : null}
    </li>
  );
}

function PriceBlock({
  billing,
  tier,
}: {
  billing: "monthly" | "yearly";
  tier: Tier;
}) {
  return (
    <div className="sbe-mkt-priceblock">
      <div className="sbe-mkt-priceblock-figure">
        {tier.isCustom ? "Custom" : billing === "yearly" ? tier.annualMonthly : tier.monthly}
      </div>
      <div className="sbe-mkt-priceblock-note">
        {tier.isCustom
          ? "Per arrangement"
          : billing === "yearly"
          ? `Billed annually (${tier.annualTotal})`
          : ""}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  // Reset stuck "Redirecting..." when user presses browser back from Stripe
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setLoading(null);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function handleCheckout(plan: string) {
    setLoading(plan);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        // Stripe Checkout is on an external domain — router.push only
        // handles internal app routes, so a full browser navigation via
        // window.location.href is required (and correct) here.
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = data.url;
      } else {
        setLoading(null);
        setCheckoutError(data.error || "Unable to start checkout. Please try again.");
      }
    } catch {
      setLoading(null);
      setCheckoutError("Network error. Please try again.");
    }
  }

  async function handleTrialStart(tier: string) {
    setLoading(`trial-${tier}`);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.status === 401) {
        router.push(`/login?intent=trial&tier=${tier}`);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        router.push("/management/dashboard");
      } else {
        setLoading(null);
        setCheckoutError(data.error || "Unable to start trial. Please try again.");
      }
    } catch {
      setLoading(null);
      setCheckoutError("Network error. Please try again.");
    }
  }

  function renderAction(tier: Tier) {
    const a = tier.action;
    if (a.kind === "contact") {
      return (
        <Link href="/contact" className="btn btn-secondary sbe-mkt-pricecard-btn">
          {a.label}
        </Link>
      );
    }
    if (a.kind === "trial") {
      const busy = loading === `trial-${a.tier}`;
      return (
        <button
          className="btn btn-primary sbe-mkt-pricecard-btn"
          onClick={() => handleTrialStart(a.tier)}
          disabled={busy}
        >
          {busy ? "Starting..." : a.label}
        </button>
      );
    }
    const busy = loading === a.monthlyPlan || loading === a.yearlyPlan;
    return (
      <button
        className="btn btn-primary sbe-mkt-pricecard-btn"
        onClick={() => handleCheckout(billing === "monthly" ? a.monthlyPlan : a.yearlyPlan)}
        disabled={busy}
      >
        {busy ? "Redirecting..." : a.label}
      </button>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero — dark anchor, compact so tier cards stay near the fold ── */}
        <PageHero
          variant="dark"
          compact
          eyebrow="Founding Member Rates — Locked In For Life"
          title="Your Membership Starts Here."
          subtitle="Built for hospitality operators. Priced for founders. Lock in your rate before the industry catches up."
        />

        <section className="section" style={{ paddingTop: "2rem" }}>
          <div className="container">
            {checkoutError && (
              <div
                className="auth-status auth-status-error"
                style={{ marginBottom: 16, maxWidth: 480, margin: "0 auto 16px" }}
              >
                {checkoutError}
              </div>
            )}

            {/* ── Billing toggle ── */}
            <div className="sbe-mkt-billing-toggle-wrap">
              <div className="sbe-mkt-billing-toggle" role="group" aria-label="Billing period">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`sbe-mkt-billing-btn${billing === "monthly" ? " active" : ""}`}
                  aria-pressed={billing === "monthly"}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`sbe-mkt-billing-btn${billing === "yearly" ? " active" : ""}`}
                  aria-pressed={billing === "yearly"}
                >
                  Annually
                  <span className="sbe-mkt-billing-save">Save $298</span>
                </button>
              </div>
            </div>

            {/* ── Tier cards ── */}
            <div className="sbe-mkt-pricing-grid">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`sbe-mkt-pricecard${tier.highlight ? " sbe-mkt-pricecard-highlight" : ""}`}
                >
                  <div className="sbe-mkt-pricecard-head">
                    <div>
                      <h3 className="sbe-mkt-pricecard-name">{tier.name}</h3>
                      <span className="sbe-mkt-pricecard-sublabel">{tier.sublabel}</span>
                    </div>
                    {tier.badge ? (
                      <span className="sbe-mkt-pricecard-badge">{tier.badge}</span>
                    ) : null}
                  </div>

                  <PriceBlock billing={billing} tier={tier} />

                  <p className="sbe-mkt-pricecard-desc">{tier.description}</p>

                  <ul className="sbe-mkt-pricecard-features">
                    {tier.features.map((f) => (
                      <FeatureItem key={f.name} name={f.name} sublabel={f.sublabel} />
                    ))}
                  </ul>

                  {renderAction(tier)}
                  <p className="sbe-mkt-pricecard-microcopy">{tier.microcopy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROI Calculator — distinct background ── */}
        <section style={{ background: "var(--bg-alt)", padding: "var(--section-spacing-md) 0" }}>
          <div className="container">
            <ROICalculator />
          </div>
        </section>

        {/* ── Feature Comparison Matrix ── */}
        <section className="section">
          <div className="container">
            <CompareMatrix />
          </div>
        </section>

        {/* ── Investment Protection ── */}
        <section className="section founding-section">
          <div className="container">
            <div className="founding-inner">
              <div className="founding-header">
                <span className="eyebrow eyebrow-gold">Investment Protection</span>
                <h2>Lock In Founding Member Rates &mdash; Before Prices Rise</h2>
                <p>
                  Serve By Example is opening to its first venues now. Join as a
                  Founding Member and your rate is locked in for life &mdash;
                  guaranteed, regardless of future pricing. This isn&apos;t a
                  discount. It&apos;s rate protection.
                </p>
              </div>
              <div className="founding-cards">
                <div className="founding-card">
                  <div className="founding-card-icon">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3>Locked Rates, Forever</h3>
                  <p>
                    Join at <strong>AUD $79/venue</strong> today &mdash; as our
                    platform scales, rates will rise. Founding Members are
                    grandfathered at their original rate for life.
                  </p>
                </div>
                <div className="founding-card">
                  <div className="founding-card-icon">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
                      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
                      <path d="m21 3 1 11h-2" />
                      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
                      <path d="M3 4h8" />
                    </svg>
                  </div>
                  <h3>1-on-1 Onboarding</h3>
                  <p>
                    We personally walk your team through setup. Get your first staff
                    trained in week one &mdash; a direct conversation, not a video
                    tutorial.
                  </p>
                </div>
                <div className="founding-card">
                  <div className="founding-card-icon">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  </div>
                  <h3>Shape What We Build Next</h3>
                  <p>
                    Monthly calls with our product team. Founding members directly
                    influence what modules, features, and tools get prioritised. Your
                    operation shapes the roadmap.
                  </p>
                </div>
              </div>
              <div className="founding-cta">
                <Link href="/contact" className="btn btn-gold btn-lg">
                  Secure Founding Member Rate
                </Link>
                <p className="founding-cta-note">
                  Strictly limited spots. Month-to-month. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Support & Operations"
              title="Common questions."
              copy="Everything you need to know before getting started."
            />
            <div className="faq-list">
              <details className="faq-item">
                <summary>Is there a free trial?</summary>
                <p>
                  Yes. <strong>Venue</strong> and <strong>Group</strong> plans
                  include a 14-day free trial with no credit card required.
                  Experience the Manager Console and the full training library before
                  committing to a paid tier.
                </p>
              </details>
              <details className="faq-item">
                <summary>How is billing structured?</summary>
                <p>
                  We offer monthly and annual billing. Annual billing saves up to
                  AUD $298 per year compared to monthly. There are no long-term
                  contracts or lock-in periods; you may cancel at any time, with
                  access continuing through the end of your billing cycle.
                </p>
              </details>
              <details className="faq-item">
                <summary>What is your refund policy?</summary>
                <p>
                  We offer a 14-day window on your initial payment should the
                  platform not meet your operational standards. Beyond this period,
                  we do not offer refunds, though you retain the flexibility to
                  cancel at any time.
                </p>
              </details>
              <details className="faq-item">
                <summary>What occurs upon cancellation?</summary>
                <p>
                  Your access remains active until your current paid period
                  concludes. Your historical training data is securely archived,
                  allowing you to reactivate your subscription whenever you are
                  ready.
                </p>
              </details>
              <details className="faq-item">
                <summary>What are the limits on staff access?</summary>
                <p>
                  <strong>Venue</strong> plans provide up to 15 staff seats for one
                  venue. <strong>Group</strong> plans support up to 35 staff across
                  your team. <strong>Franchise</strong> plans are custom-scoped and
                  support unlimited staff across multiple venues. For very large
                  venue groups, please use our contact form to discuss custom
                  arrangements.
                </p>
              </details>
              <details className="faq-item">
                <summary>Is my training data secure and private?</summary>
                <p>
                  Absolutely. All scenario responses are utilised exclusively to
                  calculate your personal performance metrics. Your data is strictly
                  private and is never disclosed to third parties or other venues
                  without your explicit consent. All data is isolated per venue
                  using Supabase Row-Level Security. Refer to our{" "}
                  <a href="/privacy">Privacy Policy</a> for technical
                  specifications.
                </p>
              </details>
              <details className="faq-item">
                <summary>Do you provide enterprise-level solutions?</summary>
                <p>
                  Yes. Our <strong>Franchise</strong> tier is designed for venue
                  groups and large hospitality organisations. It includes unlimited
                  seats, dedicated account management, custom module development,
                  and white-label options. Please use our{" "}
                  <a href="/contact">contact form</a> to discuss a custom
                  arrangement.
                </p>
              </details>
            </div>
            <div className="sbe-mkt-pricing-support">
              <p className="sbe-mkt-pricing-support-lead">Still have questions?</p>
              <a href="mailto:hello@serve-by-example.com" className="btn btn-secondary">
                Contact support
              </a>
              <p className="sbe-mkt-pricing-roadmap">
                Curious about what we&rsquo;re building next?{" "}
                <a href="/roadmap">View our product roadmap &rarr;</a>
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <CTABand
          background="green"
          title="Start training your team this week."
          copy="14-day free trial. No credit card required. Set up in under 10 minutes."
          primary={{ label: "Start Free Trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Talk to us", href: "/contact" }}
        />
      </main>

      <Footer />
    </div>
  );
}
