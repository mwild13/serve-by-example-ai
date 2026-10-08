"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

/*
 * PricingPlans — the /pricing price board (Pages-Redesign.md 2.1, 5.4).
 * The only interactive part of the page: billing toggle, trial start and
 * Stripe checkout. Everything else on /pricing is server-rendered.
 *
 * Layout: one four-track grid. Track 1 is the intro (toggle, guarantee),
 * tracks 2 to 4 are the three priced plans. The founding strip and the
 * comparison table below reuse the same four tracks so their columns sit
 * under the plans.
 */

// ── Tier data: prices match live Stripe prices, do not edit without a pricing review ──

type Tier = {
  /** Monthly checkout plan key. The yearly key is `${id}_yearly`. */
  id: "pro" | "boutique" | "commercial";
  name: string;
  audience: string;
  monthly: number;
  yearly: number;
  yearlyPerMonth: string;
  trial: boolean;
  featured?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "pro",
    name: "Staff",
    audience: "One person, one seat",
    monthly: 19,
    yearly: 190,
    yearlyPerMonth: "15.83",
    trial: false,
    features: [
      "40 modules across Bartending, Sales and Management",
      "AI Arena: live scenarios with written feedback",
      "Mastery levels, spaced repetition, badges and streaks",
      "Rapid-fire drills and interactive challenges",
    ],
  },
  {
    id: "boutique",
    name: "Venue",
    audience: "One venue, up to 15 staff",
    monthly: 79,
    yearly: 790,
    yearlyPerMonth: "65.83",
    trial: true,
    featured: true,
    features: [
      "Everything in Staff",
      "Manager Console with live team progress",
      "Team performance leaderboard",
      "Guided venue setup call",
    ],
  },
  {
    id: "commercial",
    name: "Group",
    audience: "Multi-site, up to 35 staff",
    monthly: 149,
    yearly: 1490,
    yearlyPerMonth: "124.17",
    trial: true,
    features: [
      "Everything in Venue",
      "Compliance tracking across teams",
      "Cohort analytics and trend reporting",
      "Two onboarding sessions and priority email support",
    ],
  },
];

const dollars = (n: number) => `$${n.toLocaleString("en-AU")}`;

export default function PricingPlans() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  // Defaults to "monthly", the full undiscounted rate, so the price shown on
  // first load always matches the toggle button that looks selected.
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  // Reset stuck "Redirecting..." when user presses browser back from Stripe
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setLoading(null);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // A logged-in visitor whose org has already used its 14-day trial (or is
  // already subscribed) shouldn't be offered a second trial. Null until this
  // resolves, or on fetch failure/logged-out: both fail open to the default
  // trial buttons rather than blocking a fresh visitor on a network hiccup.
  const [trialGate, setTrialGate] = useState<{ subscriptionActive: boolean; trialStatus: string } | null>(null);
  useEffect(() => {
    fetch("/api/billing/trial/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setTrialGate(data); })
      .catch(() => { /* fail open: default trial buttons stay as-is */ });
  }, []);
  const alreadyTrialed = !!trialGate && (trialGate.subscriptionActive || trialGate.trialStatus !== "none");

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
        // Stripe Checkout is on an external domain. router.push only handles
        // internal app routes, so a full browser navigation is required here.
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
    const plan = billing === "monthly" ? tier.id : `${tier.id}_yearly`;
    const buying = loading === plan;
    const btnClass = `sbe-mkt-price-btn${tier.featured ? " sbe-mkt-price-btn-featured" : ""}`;

    if (tier.trial && !alreadyTrialed) {
      const starting = loading === `trial-${tier.id}`;
      return (
        <>
          <button className={btnClass} onClick={() => handleTrialStart(tier.id)} disabled={starting}>
            {starting ? "Starting..." : "Start my 14-day trial"}
          </button>
          <p className="sbe-mkt-price-alt">
            or
            <button
              className="sbe-mkt-price-buynow"
              onClick={() => handleCheckout(plan)}
              disabled={buying}
              aria-label={`Buy ${tier.name} now`}
            >
              {buying ? "redirecting..." : "buy now"}
            </button>
          </p>
        </>
      );
    }

    return (
      <>
        <button
          className={btnClass}
          onClick={() => handleCheckout(plan)}
          disabled={buying}
          aria-label={`Buy ${tier.name} now`}
        >
          {buying ? "Redirecting..." : "Buy now"}
        </button>
        <p className="sbe-mkt-price-alt">
          Billed {billing === "monthly" ? "monthly" : "yearly"}. Cancel anytime.
        </p>
      </>
    );
  }

  return (
    <section className="sbe-mkt-pricing">
      <div className="container">
        {checkoutError && (
          <div className="auth-status auth-status-error sbe-mkt-price-error" role="alert">
            {checkoutError}
          </div>
        )}

        <div className="sbe-mkt-price-board">
          <div className="sbe-mkt-price-intro">
            <h2 className="sbe-mkt-price-intro-title">Pick your plan.</h2>
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
              </button>
            </div>
            <p className="sbe-mkt-price-intro-note">Pay annually and get 2 months free.</p>
          </div>

          <ul className="sbe-mkt-price-plans">
            {TIERS.map((tier) => (
              <li
                key={tier.id}
                className={`sbe-mkt-price-col${tier.featured ? " sbe-mkt-price-col-featured" : ""}`}
              >
                <p className="sbe-mkt-price-audience">{tier.audience}</p>
                <div className="sbe-mkt-price-namerow">
                  <h3 className="sbe-mkt-price-name">{tier.name}</h3>
                  {tier.featured ? <span className="sbe-mkt-price-flag">Recommended</span> : null}
                </div>

                <p className="sbe-mkt-price-figure">
                  <span className="sbe-mkt-price-currency">AUD</span>
                  <span className="sbe-mkt-price-amount">
                    {dollars(billing === "monthly" ? tier.monthly : tier.yearly)}
                  </span>
                  <span className="sbe-mkt-price-unit">
                    {billing === "monthly" ? "per month" : "per year"}
                  </span>
                </p>
                <p className="sbe-mkt-price-note">
                  {billing === "monthly"
                    ? `Or AUD ${dollars(tier.yearly)} a year, 2 months free.`
                    : `2 months free. Works out at AUD $${tier.yearlyPerMonth} a month.`}
                </p>

                {renderAction(tier)}

                <ul className="sbe-mkt-price-features">
                  {tier.features.map((feature) => (
                    <li key={feature} className="sbe-mkt-pricefeature">
                      <span className="sbe-mkt-pricefeature-name">{feature}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* One consolidated risk-reversal moment (Pages-Redesign.md 6.3) */}
          <p className="sbe-mkt-guarantee sbe-mkt-price-guarantee">
            <strong>14-Day Performance Guarantee.</strong>
            If your team&rsquo;s training engagement doesn&rsquo;t noticeably increase in the first 14 days, you won&rsquo;t be charged. No questions asked.
          </p>

          <div className="sbe-mkt-price-franchise">
            <div className="sbe-mkt-price-franchise-head">
              <p className="sbe-mkt-price-audience">Venue groups and franchises</p>
              <h3 className="sbe-mkt-price-name">Franchise</h3>
            </div>
            <p className="sbe-mkt-price-franchise-copy">
              Unlimited staff seats across unlimited venues, custom module development, white-label
              options, a dedicated account manager and SLA documentation. Priced per arrangement.
            </p>
            <div className="sbe-mkt-price-franchise-action">
              <Link href="/contact?source=pricing&package=franchise" className="sbe-mkt-price-btn">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
