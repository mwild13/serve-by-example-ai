"use client";

import { STEP_LABELS } from "./challenge-types";

// ── 5-dot stepper ─────────────────────────────────────────────────────────────

export default function Stepper({ currentStep, phase }: { currentStep: number; phase: "lobby" | "quiz" | "summary" }) {
  const allDone = phase === "summary";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "1rem 1.5rem",
        background: "var(--surface)",
        borderBottom: "1px solid var(--line-light)",
        marginBottom: "1.5rem",
      }}
    >
      {STEP_LABELS.map((label, i) => {
        const completed = allDone || i < currentStep;
        const current = !allDone && i === currentStep;
        return (
          <div
            key={i}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}
          >
            <div
              className={`challenge-step-dot${current ? " is-current" : ""}`}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: `2px solid ${completed ? "var(--green)" : current ? "var(--gold)" : "var(--line)"}`,
                background: completed ? "var(--green)" : current ? "var(--gold-light)" : "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: current ? "scale(1.1)" : "scale(1)",
                transition: "transform 150ms ease",
              }}
              aria-label={`Step ${i + 1}: ${label}${completed ? " – complete" : current ? " – current" : ""}`}
            >
              {completed ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l6 6L20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: current ? "var(--gold)" : "var(--text-muted)" }}>
                  {i + 1}
                </span>
              )}
            </div>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: completed ? "var(--green)" : current ? "var(--text-soft)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", lineHeight: 1.2 }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
