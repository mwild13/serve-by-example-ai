"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { STEP_LABELS } from "./challenge-types";

// ── Completion summary / scoreboard ─────────────────────────────────────────

export default function ChallengeScoreBoard({
  score,
  hadError,
  onRetry,
  onReview,
}: {
  score: number;
  hadError: Set<number>;
  onRetry: () => void;
  onReview: () => void;
}) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    if (score === 0) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const count = window.innerWidth < 768 ? 50 : 150;
    void confetti({ particleCount: count, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
  }, [score]);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1.5px solid var(--green)",
        borderRadius: "var(--radius-lg)",
        padding: "2rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12l6 6L20 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.75rem", fontWeight: 700, color: "var(--green)", margin: "0 0 0.25rem" }}>
          {score} of 5 correct
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-soft)", margin: 0 }}>
          {score === 5 ? "Perfect run. All 5 on the first try." : score >= 3 ? "Good effort. Review the ones you missed." : "Keep practising. These questions are always replayable."}
        </p>
      </div>

      {/* Per-step result rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {STEP_LABELS.map((label, i) => {
          const firstTry = !hadError.has(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                background: firstTry ? "var(--green-light)" : "var(--bg-alt)",
                border: `1px solid ${firstTry ? "var(--green)" : "var(--line)"}`,
              }}
            >
              {firstTry ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l6 6L20 6" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="var(--gold)" strokeWidth="2"/>
                  <path d="M12 8v4" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: firstTry ? "var(--green-deep)" : "var(--text-soft)", flex: 1 }}>
                {label}
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: firstTry ? "var(--green)" : "var(--text-muted)" }}>
                {firstTry ? "First try" : "Needed retry"}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <button
          onClick={onReview}
          style={{
            width: "100%", padding: "0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-alt)",
            color: "var(--text-soft)",
            fontSize: "0.875rem", fontWeight: 700,
            border: "1px solid var(--line)", cursor: "pointer", minHeight: "48px",
          }}
        >
          Review all answers
        </button>
        <button
          onClick={onRetry}
          style={{
            width: "100%", padding: "0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "0.85rem", fontWeight: 600,
            border: "1px solid var(--line)", cursor: "pointer", minHeight: "48px",
          }}
        >
          Try again from the start
        </button>
      </div>
    </div>
  );
}
