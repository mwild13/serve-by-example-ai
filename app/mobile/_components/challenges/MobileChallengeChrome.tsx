"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, RotateCcw, AlertCircle } from "lucide-react";

// Shared mobile-dark presentational chrome for the 4 single-question
// Challenge games built this pass (Sequence Sort, Fill the Blank, Spot the
// Error, Multiple Choice) — the mobile-dark equivalent of desktop's
// ChallengeCard.tsx/FeedbackBanner/ResetButton (app/dashboard/_components/
// challenges/ChallengeCard.tsx), restyled to --*-mobile tokens rather than
// ported 1:1, since desktop's version is light-theme only.

export function FeedbackBanner({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: 16,
        borderRadius: "var(--radius-md)",
        background: correct ? "var(--green-mobile-bg)" : "var(--gold-mobile-bg)",
        border: `1px solid ${correct ? "var(--green-mobile)" : "var(--gold-mobile)"}`,
      }}
    >
      <p
        style={{
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: correct ? "var(--green-mobile)" : "var(--gold-mobile)",
        }}
      >
        {correct ? (
          <Check size={14} strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <AlertCircle size={14} strokeWidth={2.5} aria-hidden="true" />
        )}
        {correct ? "Correct" : "Not quite, try again"}
      </p>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-mobile)" }}>{explanation}</p>
    </div>
  );
}

export function TryAgainButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      style={{
        width: "100%",
        padding: "12px 0",
        borderRadius: "var(--radius-pill)",
        background: "none",
        border: "1px solid var(--border-mobile)",
        color: "var(--text-mobile)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Try Again
    </button>
  );
}

// Completion footer + auto-scroll-into-view, matching the live-QA fix
// applied to MatchPairsScreen.tsx (the completion state rendering below the
// fold with no scroll cue looked "stuck"/broken on real devices).
export function CompletionCard({ title, subtitle, onReplay }: { title: string; subtitle: string; onReplay: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div ref={ref} style={{ padding: "0 20px 20px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--green-mobile)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{title}</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>{subtitle}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            type="button"
            onClick={onReplay}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile-bg)",
              border: "1px solid var(--gold-mobile)",
              color: "var(--gold-mobile)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
            Play Again
          </button>
          <Link
            href="/mobile/challenges"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile)",
              color: "var(--bg-mobile-dark)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to Challenges
          </Link>
        </div>
      </div>
    </div>
  );
}

export const mobileShellStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: 390,
  margin: "0 auto",
  minHeight: "100dvh",
  background: "var(--bg-mobile-dark)",
  fontFamily: "var(--font-body)",
};
