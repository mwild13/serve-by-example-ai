"use client";

import { useState } from "react";
import { ChallengeCard, FeedbackBanner, ResetButton } from "./ChallengeCard";
import type { ChallengeGameProps } from "./challenge-types";

// ── Question 5: Multiple Choice ──────────────────────────────────────────────

const MC_SCENARIO = "A guest flags you down and points out their wine glass has a lipstick mark on the rim. What do you do?";
const MC_OPTIONS = [
  { id: "a", text: "\"I'll let the bar team know.\"", correct: false },
  { id: "b", text: "\"I'm so sorry, let me replace that immediately.\"", correct: true },
  { id: "c", text: "\"That must have been there before. I'll just wipe it.\"", correct: false },
];
const MC_EXPLANATION =
  "Always own the problem immediately and replace the glass. Deflecting to another team member or wiping a soiled glass both undermine guest trust. A quick apology and immediate replacement is the professional standard.";

export default function MultipleChoiceGame({ onComplete, onIncorrect }: ChallengeGameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const correctId = MC_OPTIONS.find((o) => o.correct)?.id;

  const choose = (id: string) => {
    if (checked) return;
    setSelected(id);
    setChecked(true);
    if (correctId === id) onComplete?.();
    else onIncorrect?.();
  };

  const reset = () => {
    setSelected(null);
    setChecked(false);
  };

  const answeredCorrect = checked && selected === correctId;

  return (
    <ChallengeCard formatLabel="Question 5" title="Multiple Choice" isCorrect={answeredCorrect} isIncorrect={checked && !answeredCorrect}>
      <div
        style={{
          background: "var(--surface-raised)",
          border: "2px solid var(--line)",
          borderRadius: "var(--radius-xl)",
          borderTopLeftRadius: "4px",
          padding: "1rem 1.25rem",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "-11px",
            left: "1rem",
            background: "var(--text)",
            color: "var(--surface)",
            fontSize: "0.65rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "2px 10px",
            borderRadius: "999px",
          }}
        >
          Guest Interaction
        </span>
        <p
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.5,
            marginTop: "0.25rem",
          }}
        >
          {MC_SCENARIO}
        </p>
      </div>

      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-soft)", borderLeft: "3px solid var(--gold)", paddingLeft: "0.75rem" }}>
        Choose the best immediate response.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {MC_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = checked && opt.id === correctId;
          const showWrong = checked && isSelected && !opt.correct;

          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: "0.9rem 1.1rem",
                borderRadius: "var(--radius-md)",
                border: `1.5px solid ${showCorrect ? "var(--green)" : showWrong ? "var(--gold)" : "var(--line)"}`,
                background: showCorrect ? "var(--green-light)" : showWrong ? "var(--gold-light)" : "var(--surface-raised)",
                color: showCorrect ? "var(--green-deep)" : "var(--text)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textAlign: "left",
                cursor: checked ? "default" : "pointer",
                transition: "all 0.15s",
                position: "relative",
                minHeight: "48px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `2px solid ${showCorrect ? "var(--green)" : showWrong ? "var(--gold-warm)" : "var(--line)"}`,
                  background: showCorrect ? "var(--green)" : "transparent",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showCorrect && (
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white" }} />
                )}
              </div>
              <span>{opt.text}</span>
              {showCorrect && (
                <span
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "var(--green)",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Correct
                </span>
              )}
            </button>
          );
        })}
      </div>

      {checked && (
        <FeedbackBanner correct={answeredCorrect} explanation={MC_EXPLANATION} />
      )}
      {checked && !answeredCorrect && <ResetButton onReset={reset} />}
    </ChallengeCard>
  );
}
