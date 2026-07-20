"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/ui/SectionHeading";
import ROICalculator from "@/components/ui/ROICalculator";
import CompareMatrix from "@/components/ui/CompareMatrix";

// ── Feature item: premium name + muted plain sub-label ────────────────────────
function FeatureItem({ name, sublabel }: { name: string; sublabel?: string }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "4px 0",
        listStyle: "none",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--green)", flexShrink: 0, marginTop: 3 }}
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span style={{ lineHeight: 1.5 }}>
        <span
          style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text)",
            display: "block",
          }}
        >
          {name}
        </span>
        {sublabel && (
          <span
            style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              display: "block",
              marginTop: "1px",
            }}
          >
            {sublabel}
          </span>
        )}
      </span>
    </li>
  );
}

// ── Price block: large dominant figure + muted annual sub-line ────────────────
function PriceBlock({
  billing,
  monthly,
  annualMonthly,
  annualTotal,
  isCustom,
}: {
  billing: "monthly" | "yearly";
  monthly: string;
  annualMonthly: string;
  annualTotal: string;
  isCustom?: boolean;
}) {
  return (
    <div style={{ marginBottom: "1.25rem", minHeight: "4rem" }}>
      <div
        style={{
          fontFamily: "var(--font-fraunces)",
          fontSize: "2.25rem",
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1.1,
        }}
      >
        {isCustom ? "Custom" : billing === "yearly" ? annualMonthly : monthly}
      </div>
      <div
        style={{
          fontFamily: "var(--font-manrope)",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          marginTop: "4px",
          minHeight: "1.2em",
        }}
      >
        {isCustom
          ? "Per arrangement"
          : billing === "yearly"
          ? `Billed annually (${annualTotal})`
          : ""}
      </div>
    </div>
  );
}

export default function PricingPage() {
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
        window.location.href = `/login?intent=trial&tier=${tier}`;
        return;
      }
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/management/dashboard";
      } else {
        setLoading(null);
        setCheckoutError(data.error || "Unable to start trial. Please try again.");
      }
    } catch {
      setLoading(null);
      setCheckoutError("Network error. Please try again.");
    }
  }

  const isLoading = (monthly: string, yearly: string) =>
    loading === monthly || loading === yearly;

  const isTrialLoading = (tier: string) => loading === `trial-${tier}`;

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Membership hero — minimal, announcement-first ── */}
        <section
          style={{
            paddingTop: "clamp(3rem, 6vw, 5rem)",
            paddingBottom: "clamp(1.5rem, 3vw, 2.5rem)",
            textAlign: "center",
          }}
        >
          <div className="container" style={{ maxWidth: 560 }}>
            {/* Announcement pill — mirrors Kimi's top banner */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--green-light)",
                border: "1px solid rgba(31,78,55,0.18)",
                borderRadius: "999px",
                padding: "5px 14px 5px 10px",
                marginBottom: "1.75rem",
              }}
            >
              {/* Lock icon */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--green)", flexShrink: 0 }}
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: "0.775rem",
                  fontWeight: 700,
                  color: "var(--green)",
                  letterSpacing: "0.02em",
                }}
              >
                Founding Member Rates — Locked In For Life
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "clamp(2rem, 4.5vw, 2.75rem)",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.15,
                margin: "0 0 0.875rem",
                letterSpacing: "-0.01em",
              }}
            >
              Your Membership Starts Here.
            </h1>
            <p
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                color: "var(--text-soft)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Built for hospitality operators. Priced for founders.{" "}
              <span style={{ color: "var(--text-muted)" }}>
                Lock in your rate before the industry catches up.
              </span>
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 8 }}>
          <div className="container">
            {checkoutError && (
              <div
                className="auth-status auth-status-error"
                style={{ marginBottom: 16, maxWidth: 480, margin: "0 auto 16px" }}
              >
                {checkoutError}
              </div>
            )}

            {/* ── Billing toggle — Kimi-style pill ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0",
                marginBottom: "2.5rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  background: "var(--bg-alt)",
                  border: "1px solid var(--line)",
                  borderRadius: "999px",
                  padding: "4px",
                  gap: "2px",
                }}
              >
                <button
                  onClick={() => setBilling("monthly")}
                  style={{
                    padding: "7px 24px",
                    borderRadius: "999px",
                    border: "none",
                    background: billing === "monthly" ? "var(--surface)" : "transparent",
                    fontFamily: "var(--font-manrope)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: billing === "monthly" ? "var(--text)" : "var(--text-muted)",
                    cursor: "pointer",
                    boxShadow: billing === "monthly" ? "var(--shadow-sm)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  style={{
                    padding: "7px 20px",
                    borderRadius: "999px",
                    border: "none",
                    background: billing === "yearly" ? "var(--surface)" : "transparent",
                    fontFamily: "var(--font-manrope)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: billing === "yearly" ? "var(--text)" : "var(--text-muted)",
                    cursor: "pointer",
                    boxShadow: billing === "yearly" ? "var(--shadow-sm)" : "none",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Annually
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "var(--green)",
                      background: "var(--green-light)",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    Save $298
                  </span>
                </button>
              </div>
            </div>

            {/* ── Four tier cards ── */}
            <div
              className="pricing-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "12px",
                alignItems: "stretch",
              }}
            >
              {/* Staff | Pro */}
              <div className="price-card" style={{ background: "var(--surface)" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      margin: "0 0 2px",
                    }}
                  >
                    Staff
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--font-manrope)",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    Pro
                  </span>
                </div>

                <PriceBlock
                  billing={billing}
                  monthly="AUD $19 / mo"
                  annualMonthly="AUD $15.83 / mo"
                  annualTotal="AUD $190/yr"
                />

                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.8125rem",
                    color: "var(--text-soft)",
                    marginBottom: "1.25rem",
                  }}
                >
                  For individual bartenders and hospitality staff.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}>
                  <FeatureItem
                    name="Neural Scenario Forge"
                    sublabel="AI live roleplay evaluation"
                  />
                  <FeatureItem
                    name="Mastery Protocol Engine"
                    sublabel="40 modules across Bartending, Sales &amp; Management"
                  />
                  <FeatureItem
                    name="Dynamic Skill Calibration"
                    sublabel="Adapts to what each staff member still needs to learn"
                  />
                  <FeatureItem
                    name="Rapid Deploy Drilling"
                    sublabel="Streak-based rapid-fire quiz mode"
                  />
                  <FeatureItem
                    name="Reflex Scenario Challenges"
                    sublabel="5 tap-based mobile mini-games"
                  />
                </ul>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleCheckout(billing === "monthly" ? "pro" : "pro_yearly")
                  }
                  disabled={isLoading("pro", "pro_yearly")}
                  style={{ width: "100%" }}
                >
                  {isLoading("pro", "pro_yearly") ? "Redirecting..." : "Subscribe now"}
                </button>
                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  No credit card required for trial. Billed annually. Cancel anytime.
                </p>
              </div>

              {/* Venue | Boutique — Most Popular */}
              <div
                className="price-card"
                style={{
                  background: "var(--surface)",
                  borderTop: "4px solid var(--green)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        margin: "0 0 2px",
                      }}
                    >
                      Venue
                    </h3>
                    <span
                      style={{
                        fontFamily: "var(--font-manrope)",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                      }}
                    >
                      Boutique
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "var(--green)",
                      background: "var(--green-light)",
                      borderRadius: "999px",
                      padding: "3px 10px",
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      marginTop: 2,
                    }}
                  >
                    Most Popular
                  </span>
                </div>

                <PriceBlock
                  billing={billing}
                  monthly="AUD $79 / mo"
                  annualMonthly="AUD $65.83 / mo"
                  annualTotal="AUD $790/yr"
                />

                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.8125rem",
                    color: "var(--text-soft)",
                    marginBottom: "1.25rem",
                  }}
                >
                  For single-venue operators and small teams.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}>
                  <FeatureItem name="Everything in Staff" />
                  <FeatureItem
                    name="Up to 15 staff seats"
                    sublabel="Invite via venue code, live in under 5 minutes"
                  />
                  <FeatureItem
                    name="Command &amp; Compliance Centre"
                    sublabel="Real-time team progress and compliance dashboard"
                  />
                  <FeatureItem
                    name="Competitive Performance Index"
                    sublabel="Live staff leaderboards"
                  />
                  <FeatureItem
                    name="Guided venue setup call"
                    sublabel="1-on-1 onboarding session included"
                  />
                </ul>

                <button
                  className="btn btn-primary"
                  onClick={() => handleTrialStart("boutique")}
                  disabled={isTrialLoading("boutique")}
                  style={{ width: "100%" }}
                >
                  {isTrialLoading("boutique") ? "Starting..." : "Try Free for 14 Days"}
                </button>
                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  14-day free trial. No credit card required. Pick a plan when
                  you&rsquo;re ready.
                </p>
              </div>

              {/* Group | Commercial */}
              <div className="price-card" style={{ background: "var(--surface)" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      margin: "0 0 2px",
                    }}
                  >
                    Group
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--font-manrope)",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    Commercial
                  </span>
                </div>

                <PriceBlock
                  billing={billing}
                  monthly="AUD $149 / mo"
                  annualMonthly="AUD $124.17 / mo"
                  annualTotal="AUD $1,490/yr"
                />

                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.8125rem",
                    color: "var(--text-soft)",
                    marginBottom: "1.25rem",
                  }}
                >
                  For growing venues with larger teams and multiple locations.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}>
                  <FeatureItem name="Everything in Venue" />
                  <FeatureItem
                    name="Up to 35 staff seats"
                    sublabel="Across one or multiple service areas"
                  />
                  <FeatureItem
                    name="Compliance Pulse Monitoring"
                    sublabel="Live cross-team training compliance"
                  />
                  <FeatureItem
                    name="Advanced analytics"
                    sublabel="Cohort comparisons and performance trends"
                  />
                  <FeatureItem
                    name="Dedicated onboarding specialist"
                    sublabel="2 setup sessions included"
                  />
                </ul>

                <button
                  className="btn btn-primary"
                  onClick={() => handleTrialStart("commercial")}
                  disabled={isTrialLoading("commercial")}
                  style={{ width: "100%" }}
                >
                  {isTrialLoading("commercial") ? "Starting..." : "Try Free for 14 Days"}
                </button>
                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  14-day free trial. No credit card required. Pick a plan when
                  you&rsquo;re ready.
                </p>
              </div>

              {/* Franchise | Enterprise */}
              <div className="price-card" style={{ background: "var(--surface)" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      margin: "0 0 2px",
                    }}
                  >
                    Franchise
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--font-manrope)",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    Enterprise
                  </span>
                </div>

                <PriceBlock
                  billing={billing}
                  monthly=""
                  annualMonthly=""
                  annualTotal=""
                  isCustom
                />

                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.8125rem",
                    color: "var(--text-soft)",
                    marginBottom: "1.25rem",
                  }}
                >
                  For venue groups and large hospitality organisations.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}>
                  <FeatureItem name="Everything in Group" />
                  <FeatureItem
                    name="Unlimited staff seats"
                    sublabel="Across unlimited venues"
                  />
                  <FeatureItem
                    name="Franchise Command Network"
                    sublabel="Multi-venue staff roster and analytics"
                  />
                  <FeatureItem
                    name="Custom module development"
                    sublabel="Training tailored to your brand"
                  />
                  <FeatureItem
                    name="White-glove onboarding"
                    sublabel="Dedicated account management included"
                  />
                </ul>

                <Link
                  href="/contact"
                  className="btn btn-secondary"
                  style={{ display: "block", textAlign: "center" }}
                >
                  Talk to us
                </Link>
                <p
                  style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Custom pricing. SLA included. White-label available.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ROI Calculator — distinct background ── */}
        <section
          style={{
            background: "var(--bg-alt)",
            padding: "var(--section-pad, 5rem) 0",
          }}
        >
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
                  Experience Mission Control and the full training library before
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
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <p
                style={{
                  color: "var(--text-soft)",
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                }}
              >
                Still have questions?
              </p>
              <a href="mailto:hello@serve-by-example.com" className="btn btn-secondary">
                Contact support
              </a>
            </div>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Curious about what we&rsquo;re building next?{" "}
                <a
                  href="/roadmap"
                  style={{
                    color: "var(--green)",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  View our product roadmap &rarr;
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
