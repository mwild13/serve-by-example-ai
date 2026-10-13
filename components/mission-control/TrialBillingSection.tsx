"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/consent";
import { StatRow, StatusText } from "./console-ui";

interface TrialBillingSectionProps {
  trialTier: string;
  trialEndsAt: string;
  daysRemaining: number;
  staffCount: number;
  scenariosRun: number;
}

const TIER_CONFIG: Record<string, { label: string; monthly: number; yearly: number; seats: string; venues: string }> = {
  boutique:     { label: "Boutique",   monthly: 79,  yearly: 790,   seats: "15", venues: "1 venue" },
  venue_single: { label: "Boutique",   monthly: 79,  yearly: 790,   seats: "15", venues: "1 venue" },
  commercial:   { label: "Commercial", monthly: 149, yearly: 1490,  seats: "35", venues: "Multiple venues" },
  venue_multi:  { label: "Commercial", monthly: 149, yearly: 1490,  seats: "35", venues: "Multiple venues" },
};

// /api/billing/checkout only accepts these plan keys (app/api/billing/checkout/route.ts's
// PLAN_METADATA) — trialTier can be either the current tier id ("boutique"/"commercial")
// or a legacy value ("venue_single"/"venue_multi"), both map to the same checkout plan.
const CHECKOUT_PLAN: Record<string, string> = {
  boutique: "boutique",
  venue_single: "boutique",
  commercial: "commercial",
  venue_multi: "commercial",
};

export function TrialBillingSection({
  trialTier,
  trialEndsAt,
  daysRemaining,
  staffCount,
  scenariosRun,
}: TrialBillingSectionProps) {
  const config = TIER_CONFIG[trialTier] ?? TIER_CONFIG.boutique;
  const checkoutPlan = CHECKOUT_PLAN[trialTier];
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // "Reactivate" used to be a 4-hop detour: sidebar → Settings/Billing →
  // this "Add billing details" link → the generic /pricing page → manager
  // picks a tier there and clicks *its* Subscribe button. This calls the
  // same /api/billing/checkout endpoint app/(marketing)/pricing/page.tsx's own
  // handleCheckout() already uses, pre-filled with the org's existing
  // trialTier so reactivating doesn't ask the manager to re-pick a plan
  // they already chose when they started the trial.
  async function handleReactivate() {
    if (!checkoutPlan) {
      window.location.href = "/pricing";
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: checkoutPlan }),
      });
      const data = await res.json();
      if (data.url) {
        trackEvent("begin_checkout", { plan: checkoutPlan });
        window.location.href = data.url;
      } else {
        setCheckoutLoading(false);
        setCheckoutError(data.error || "Unable to start checkout. Please try again.");
      }
    } catch {
      setCheckoutLoading(false);
      setCheckoutError("Network error. Please try again.");
    }
  }

  const isUrgent = daysRemaining <= 3;
  const daysElapsed = 14 - daysRemaining;
  const progressPct = Math.min(100, (daysElapsed / 14) * 100);
  const expiryDate = new Date(trialEndsAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const consequences: Array<{ good: boolean; text: string }> = [
    { good: false, text: "Your manager dashboard access is paused" },
    { good: false, text: "Staff training sessions are suspended" },
    { good: true, text: "All your data is saved for 30 days" },
    { good: true, text: "Add billing now and nothing changes" },
  ];
  const included = [
    `Up to ${config.seats} staff seats`,
    config.venues,
    "Full 40-module training library",
    "AI Arena and scenario training",
    "Manager Console",
    "Cancel any time",
  ];
  const sectionGap = { marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--mc-line-soft)" };
  const plainList = { margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 10 };

  return (
    <div>
      {/* Countdown */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <StatusText tone={isUrgent ? "warn" : "ok"}>
            {config.label} trial{isUrgent ? ", action needed" : ""}
          </StatusText>
          <h2 className="mc-page-title" style={{ marginTop: 6 }}>
            {daysRemaining === 0
              ? "Your trial ends today"
              : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
          </h2>
        </div>
        <p className="mc-row-meta" style={{ margin: 0, textAlign: "right" }}>
          Trial ends
          <br />
          <strong style={{ color: "var(--mc-text)" }}>{expiryDate}</strong>
        </p>
      </div>
      <div
        className="mc-progress-track"
        style={{ marginTop: 16 }}
        role="progressbar"
        aria-label="Trial days used"
        aria-valuemin={0}
        aria-valuemax={14}
        aria-valuenow={daysElapsed}
      >
        <div className="mc-progress-fill" style={{ width: `${progressPct}%`, background: isUrgent ? "var(--gold)" : undefined }} />
      </div>
      <p className="mc-row-meta" style={{ margin: "6px 0 0" }}>{daysElapsed} of 14 days used</p>

      {/* What the trial has been used for */}
      <div style={{ marginTop: 24 }}>
        <StatRow
          items={[
            { label: "Days left", value: daysRemaining === 0 ? "Today" : String(daysRemaining), sub: "in your trial" },
            { label: "Staff added", value: String(staffCount), sub: "during trial" },
            { label: "Scenarios run", value: String(scenariosRun), sub: "by your team" },
          ]}
        />
      </div>

      {/* Consequences and pricing */}
      <div className="mc-two-col" style={sectionGap}>
        <div>
          <h3 className="mc-panel-title" style={{ margin: 0 }}>When your trial ends</h3>
          <ul style={plainList}>
            {consequences.map((item) => (
              <li key={item.text}>
                <StatusText tone={item.good ? "ok" : "warn"}>
                  <span style={{ whiteSpace: "normal" }}>{item.text}</span>
                </StatusText>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mc-panel-title" style={{ margin: 0 }}>Continue with {config.label}</h3>
          <ul className="mc-rows" style={{ marginTop: 4 }}>
            <li className="mc-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <div className="mc-row-main">
                <div className="mc-row-title">Monthly</div>
                <div className="mc-row-meta">Billed each month</div>
              </div>
              <span className="mc-row-value">AUD ${config.monthly}</span>
            </li>
            <li className="mc-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <div className="mc-row-main">
                <div className="mc-row-title">Annual</div>
                <div className="mc-row-meta">Billed once a year, 2 months free</div>
              </div>
              <span className="mc-row-value">AUD ${config.yearly.toLocaleString("en-AU")}</span>
            </li>
          </ul>
          <ul style={{ ...plainList, gap: 6 }}>
            {included.map((feat) => (
              <li key={feat} className="mc-row-meta">{feat}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Call to action */}
      <div style={{ ...sectionGap, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ flex: "1 1 260px" }}>
          <div className="mc-row-title">Keep your team&apos;s training running</div>
          <div className="mc-row-meta">Add your billing details now and nothing is interrupted when the trial ends.</div>
          {checkoutError && (
            <div className="mc-row-meta" role="alert" style={{ color: "var(--status-error-text)", marginTop: 6 }}>
              {checkoutError}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/contact" className="mc-btn mc-btn-quiet">Talk to us first</a>
          <button type="button" className="mc-btn mc-btn-primary" onClick={handleReactivate} disabled={checkoutLoading}>
            {checkoutLoading ? "Redirecting..." : "Add billing details"}
          </button>
        </div>
      </div>
    </div>
  );
}
