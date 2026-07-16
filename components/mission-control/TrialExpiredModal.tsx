"use client";

import { useState } from "react";

interface TrialExpiredModalProps {
  trialTier: string;
}

const TIER_LABEL: Record<string, string> = {
  boutique: "Boutique",
  commercial: "Commercial",
  venue_single: "Boutique",
  venue_multi: "Commercial",
};

export function TrialExpiredModal({ trialTier }: TrialExpiredModalProps) {
  const [dismissed, setDismissed] = useState(false);

  async function markShown() {
    await fetch("/api/billing/trial/mark-modal-shown", { method: "POST" });
  }

  async function handleDismiss() {
    await markShown();
    setDismissed(true);
  }

  async function handleSetUpBilling() {
    await markShown();
    window.location.href = "/management/dashboard?tab=settings&subtab=billing";
  }

  if (dismissed) return null;

  const tierLabel = TIER_LABEL[trialTier] ?? "Trial";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 29, 24, 0.65)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--surface-raised)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)",
          maxWidth: 460,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 28px 20px",
            background: "var(--gold-light)",
            borderBottom: "1.5px solid var(--gold)",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--gold-warm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 4,
              }}
            >
              Your {tierLabel} trial has ended
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.5 }}>
              Your team&apos;s training access is now paused. Add billing details to restore it immediately.
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px" }}>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            What&apos;s currently paused
          </div>
          {[
            "Staff training across all 40 modules",
            "AI Arena scenario coaching",
            "Real-time team performance analytics",
            "Manager coaching and compliance tracking",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                fontSize: "0.875rem",
                color: "var(--text-soft)",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(169,129,42,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold-warm)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              {item}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            borderTop: "1px solid var(--line-light)",
          }}
        >
          <button
            onClick={handleSetUpBilling}
            style={{
              width: "100%",
              padding: "13px 20px",
              background: "var(--green)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "0.925rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Add billing details
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
