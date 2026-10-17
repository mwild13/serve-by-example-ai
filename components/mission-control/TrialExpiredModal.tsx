"use client";

import { useEffect, useRef, useState } from "react";

interface TrialExpiredModalProps {
  trialTier: string;
}

const TIER_LABEL: Record<string, string> = {
  boutique: "Boutique",
  commercial: "Commercial",
  venue_single: "Boutique",
  venue_multi: "Commercial",
};

const PAUSED = [
  "Staff training across all 40 modules",
  "AI Arena scenario coaching",
  "Real-time team performance analytics",
  "Manager coaching and compliance tracking",
];

const BILLING_URL = "/management/dashboard?tab=settings&subtab=billing";

function markShown() {
  // keepalive lets the request finish while the page navigates away.
  return fetch("/api/billing/trial/mark-modal-shown", { method: "POST", keepalive: true }).catch(() => undefined);
}

// Shown once when an org trial runs out. Either button records that it was
// seen, so it does not come back on the next visit.
export function TrialExpiredModal({ trialTier }: TrialExpiredModalProps) {
  const [dismissed, setDismissed] = useState(false);
  const primaryRef = useRef<HTMLButtonElement>(null);

  function handleDismiss() {
    void markShown();
    setDismissed(true);
  }

  function handleSetUpBilling() {
    void markShown();
    window.location.href = BILLING_URL;
  }

  useEffect(() => {
    if (dismissed) return;
    primaryRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      void markShown();
      setDismissed(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissed]);

  if (dismissed) return null;

  const tierLabel = TIER_LABEL[trialTier] ?? "Trial";

  return (
    <div className="mc-dialog-backdrop">
      <div className="mc-dialog" role="dialog" aria-modal="true" aria-labelledby="mc-trial-ended-title" aria-describedby="mc-trial-ended-lede">
        <h2 id="mc-trial-ended-title" className="mc-dialog-title mc-trial-ended-title">
          Your {tierLabel} trial has ended
        </h2>
        <p id="mc-trial-ended-lede" className="mc-trial-ended-lede">
          Your team&apos;s training access is now paused. Add billing details to restore it immediately.
        </p>

        <span className="mc-caps">Paused until billing is added</span>
        <ul className="mc-trial-ended-list">
          {PAUSED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="mc-dialog-actions">
          <button type="button" className="mc-btn mc-btn-quiet" onClick={handleDismiss}>
            Not now
          </button>
          <button ref={primaryRef} type="button" className="mc-btn mc-btn-primary" onClick={handleSetUpBilling}>
            Add billing details
          </button>
        </div>
      </div>
    </div>
  );
}
