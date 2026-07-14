"use client";

import { useState } from "react";
import { ChallengeCard, FeedbackBanner, ResetButton } from "./ChallengeCard";
import type { ChallengeGameProps } from "./challenge-types";

// ── Question 4: Spot the Error ───────────────────────────────────────────────

const SPOT_ITEMS = [
  { id: "rum", text: "60ml White Rum", correct: true },
  { id: "lime", text: "25ml Bottled Lime Juice", correct: false },
  { id: "syrup", text: "15ml Sugar Syrup", correct: true },
  { id: "method", text: "Shake with ice", correct: true },
];
const SPOT_EXPLANATION =
  "The error is \"Bottled Lime Juice\". A Classic Daiquiri always uses fresh lime juice. Bottled juice contains preservatives and citric acid that flatten the flavour and alter the acidity balance.";

export default function SpotErrorGame({ onComplete, onIncorrect }: ChallengeGameProps) {
  const [tapped, setTapped] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [answeredCorrect, setAnsweredCorrect] = useState(false);

  const tap = (id: string) => {
    if (checked) return;
    const item = SPOT_ITEMS.find((i) => i.id === id);
    const isCorrectTap = item && !item.correct;
    setTapped(id);
    setChecked(true);
    setAnsweredCorrect(!!isCorrectTap);
    if (isCorrectTap) onComplete?.();
    else onIncorrect?.();
  };

  const reset = () => {
    setTapped(null);
    setChecked(false);
    setAnsweredCorrect(false);
  };

  return (
    <ChallengeCard formatLabel="Question 4" title="Spot the Error" isCorrect={checked && answeredCorrect} isIncorrect={checked && !answeredCorrect}>
      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
        One ingredient on this Classic Daiquiri recipe card is wrong. Tap it to identify the mistake.
      </p>

      <div
        style={{
          background: "var(--surface-raised)",
          border: "2px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          maxWidth: "360px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "999px",
            padding: "3px 16px",
            fontFamily: "var(--font-fraunces)",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--gold-warm)",
            whiteSpace: "nowrap",
          }}
        >
          Classic Daiquiri
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            paddingBottom: "0.6rem",
            borderBottom: "1px solid var(--line-light)",
            marginBottom: "0.75rem",
            marginTop: "0.5rem",
          }}
        >
          <span>Spec</span>
          <span>Method</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {SPOT_ITEMS.map((item) => {
            const isTapped = tapped === item.id;
            const isError = !item.correct;
            const showResult = checked && isTapped;
            return (
              <button
                key={item.id}
                onClick={() => tap(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${
                    showResult && isError ? "var(--gold)"
                    : showResult && !isError ? "var(--red-text, #b91c1c)"
                    : "transparent"
                  }`,
                  background: showResult && isError
                    ? "var(--gold-light)"
                    : showResult && !isError
                    ? "var(--red-soft, #fee2e2)"
                    : "transparent",
                  color: "var(--text)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: checked ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  width: "100%",
                  minHeight: "44px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: showResult && isError ? "var(--gold-warm)" : "var(--green)",
                  }}
                />
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      {checked && (
        <FeedbackBanner
          correct={answeredCorrect}
          explanation={SPOT_EXPLANATION}
        />
      )}
      {checked && !answeredCorrect && <ResetButton onReset={reset} />}
    </ChallengeCard>
  );
}
