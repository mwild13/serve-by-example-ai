"use client";

import { useState } from "react";
import { ChallengeCard, FeedbackBanner, ResetButton } from "./ChallengeCard";
import type { ChallengeGameProps } from "./challenge-types";

// ── Question 1: Sequence Sort ────────────────────────────────────────────────

const SEQUENCE_ITEMS = [
  { id: "margarita", text: "Build the Margarita" },
  { id: "wine", text: "Pour the Pinot Grigio" },
  { id: "guinness-start", text: "Start the Guinness pour" },
  { id: "guinness-top", text: "Top up the Guinness" },
];
const SEQUENCE_CORRECT = ["guinness-start", "margarita", "wine", "guinness-top"];
const SEQUENCE_EXPLANATION =
  "Guinness requires a two-stage pour with roughly 90 seconds to settle, always start it first. Build other drinks while it settles, then top it up last.";

export default function SequenceSortGame({ onComplete, onIncorrect }: ChallengeGameProps) {
  const [items, setItems] = useState(SEQUENCE_ITEMS);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const updated = [...items];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    setItems(updated);
  };

  const check = () => {
    const match = items.map((i) => i.id).join(",") === SEQUENCE_CORRECT.join(",");
    setCorrect(match);
    setChecked(true);
    if (match) onComplete?.();
    else onIncorrect?.();
  };

  const reset = () => {
    setItems(SEQUENCE_ITEMS);
    setChecked(false);
    setCorrect(false);
  };

  return (
    <ChallengeCard formatLabel="Question 1" title="Sequence Sort" isCorrect={checked && correct} isIncorrect={checked && !correct}>
      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.5 }}>
        A Guinness, a Margarita, and a Pinot Grigio arrive simultaneously. What order do you build them?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.85rem 1rem",
              background: "var(--surface-raised)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
              minHeight: "48px",
            }}
          >
            <div
              style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "50%",
                background: "var(--green-light)",
                color: "var(--green)",
                fontSize: "0.75rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>
              {item.text}
            </span>
            {!checked && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  style={{
                    background: "none", border: "none",
                    cursor: i === 0 ? "default" : "pointer",
                    opacity: i === 0 ? 0.25 : 1,
                    color: "var(--text-muted)", padding: "4px 6px", minHeight: "24px",
                  }}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  style={{
                    background: "none", border: "none",
                    cursor: i === items.length - 1 ? "default" : "pointer",
                    opacity: i === items.length - 1 ? 0.25 : 1,
                    color: "var(--text-muted)", padding: "4px 6px", minHeight: "24px",
                  }}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {checked ? (
        <FeedbackBanner correct={correct} explanation={SEQUENCE_EXPLANATION} />
      ) : (
        <button
          onClick={check}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--green)",
            color: "white",
            fontSize: "0.875rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-end",
            minHeight: "48px",
          }}
        >
          Verify Order
        </button>
      )}
      {checked && !correct && <ResetButton onReset={reset} />}
    </ChallengeCard>
  );
}
