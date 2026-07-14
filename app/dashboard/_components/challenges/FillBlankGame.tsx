"use client";

import { useState } from "react";
import { ChallengeCard, FeedbackBanner, ResetButton } from "./ChallengeCard";
import type { ChallengeGameProps } from "./challenge-types";

// ── Question 2: Fill the Blank ───────────────────────────────────────────────

const FILL_PARTS = [
  "A Classic Daiquiri uses ",
  " White Rum, ",
  " fresh lime juice, and ",
  " sugar syrup, shaken and served in a ",
  ".",
];
const FILL_CORRECT = ["60ml", "25ml", "15ml", "chilled coupe"];
const FILL_WORD_BANK = ["25ml", "60ml", "30ml", "15ml", "highball", "chilled coupe", "rocks glass", "20ml"];
const FILL_EXPLANATION =
  "The Classic Daiquiri spec is 60ml White Rum / 25ml Fresh Lime Juice / 15ml Sugar Syrup, served in a chilled coupe. Always use fresh lime. Bottled juice alters the acidity balance.";

export default function FillBlankGame({ onComplete, onIncorrect }: ChallengeGameProps) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [activeSlot, setActiveSlot] = useState<number | null>(0);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const fillSlot = (word: string) => {
    if (activeSlot === null || checked) return;
    const next = { ...selected, [activeSlot]: word };
    setSelected(next);
    const nextEmpty = FILL_CORRECT.findIndex((_, i) => i > activeSlot && !next[i]);
    setActiveSlot(nextEmpty === -1 ? null : nextEmpty);
  };

  const allFilled = FILL_CORRECT.every((_, i) => selected[i]);

  const check = () => {
    const match = FILL_CORRECT.every((ans, i) => selected[i] === ans);
    setCorrect(match);
    setChecked(true);
    if (match) onComplete?.();
    else onIncorrect?.();
  };

  const reset = () => {
    setSelected({});
    setActiveSlot(0);
    setChecked(false);
    setCorrect(false);
  };

  return (
    <ChallengeCard formatLabel="Question 2" title="Fill the Blank" isCorrect={checked && correct} isIncorrect={checked && !correct}>
      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
        Reconstruct the Classic Daiquiri recipe:
      </p>

      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          fontSize: "0.9rem",
          lineHeight: 2.2,
          color: "var(--text)",
          fontWeight: 500,
        }}
      >
        {FILL_PARTS.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < FILL_CORRECT.length && (
              <button
                onClick={() => !checked && setActiveSlot(i)}
                style={{
                  display: "inline-block",
                  minWidth: "80px",
                  padding: "2px 10px",
                  margin: "0 2px",
                  borderRadius: "var(--radius-sm)",
                  border: `2px solid ${activeSlot === i && !checked ? "var(--green)" : "var(--line)"}`,
                  borderStyle: selected[i] ? "solid" : "dashed",
                  background: selected[i]
                    ? activeSlot === i && !checked ? "var(--green-light)" : "var(--surface-raised)"
                    : activeSlot === i && !checked ? "var(--green-light)" : "transparent",
                  color: selected[i] ? "var(--text)" : "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: checked ? "default" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {selected[i] || "tap to fill"}
              </button>
            )}
          </span>
        ))}
      </div>

      <div
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--line-light)",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
        }}
      >
        <p style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
          Word Bank
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {FILL_WORD_BANK.map((word) => {
            const used = Object.values(selected).includes(word);
            return (
              <button
                key={word}
                onClick={() => !used && fillSlot(word)}
                disabled={used || checked}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: used ? "var(--bg-alt)" : "var(--surface)",
                  color: used ? "var(--text-muted)" : "var(--text)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: used || checked ? "default" : "pointer",
                  opacity: used ? 0.5 : 1,
                  textDecoration: used ? "line-through" : "none",
                  transition: "all 0.15s",
                  minHeight: "44px",
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {checked ? (
        <FeedbackBanner correct={correct} explanation={FILL_EXPLANATION} />
      ) : (
        <button
          onClick={check}
          disabled={!allFilled}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-sm)",
            background: allFilled ? "var(--green)" : "var(--line)",
            color: allFilled ? "white" : "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 700,
            border: "none",
            cursor: allFilled ? "pointer" : "not-allowed",
            alignSelf: "flex-end",
            minHeight: "48px",
            transition: "all 0.2s",
          }}
        >
          Check Recipe
        </button>
      )}
      {checked && !correct && <ResetButton onReset={reset} />}
    </ChallengeCard>
  );
}
