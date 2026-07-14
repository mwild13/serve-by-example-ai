"use client";

// ── Shared card shell ─────────────────────────────────────────────────────────

export function ChallengeCard({
  formatLabel,
  title,
  children,
  isCorrect,
  isIncorrect,
}: {
  formatLabel: string;
  title: string;
  children: React.ReactNode;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}) {
  const cls = isCorrect ? "answer-card is-correct" : isIncorrect ? "answer-card is-incorrect" : "answer-card";
  return (
    <div
      className={cls}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--line-light)",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
          }}
        >
          {formatLabel}
        </span>
        <span
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--green)",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// Inline checkmark SVG with animated draw-in
export function CheckmarkSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        className="check-path"
        d="M4 12l6 6L20 6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedbackBanner({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${correct ? "var(--green-mid)" : "var(--gold)"}`,
        background: correct ? "var(--green-light)" : "var(--gold-light)",
        color: correct ? "var(--green-deep)" : "var(--text)",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
    >
      <p style={{ fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {correct ? <CheckmarkSVG /> : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        {correct ? "Correct" : "Not quite, try again"}
      </p>
      <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{explanation}</p>
    </div>
  );
}

export function ResetButton({ onReset, label = "Try Again" }: { onReset: () => void; label?: string }) {
  return (
    <button
      onClick={onReset}
      style={{
        width: "100%",
        padding: "0.75rem",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--line)",
        background: "var(--bg-alt)",
        color: "var(--text-soft)",
        fontSize: "0.8rem",
        fontWeight: 700,
        cursor: "pointer",
        minHeight: "48px",
      }}
    >
      {label}
    </button>
  );
}
