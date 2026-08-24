"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import { useMarkChallengeComplete } from "../_lib/use-challenge-complete";
import { FeedbackBanner, TryAgainButton, CompletionCard, mobileShellStyle } from "./challenges/MobileChallengeChrome";

// Phase C file 05 (remaining games) — real content ported verbatim from
// desktop's MultipleChoiceGame.tsx. challengeIndex 4.

const CHALLENGE_INDEX = 4;

const MC_SCENARIO = "A guest flags you down and points out their wine glass has a lipstick mark on the rim. What do you do?";
const MC_OPTIONS = [
  { id: "a", text: "“I'll let the bar team know.”", correct: false },
  { id: "b", text: "“I'm so sorry, let me replace that immediately.”", correct: true },
  { id: "c", text: "“That must have been there before. I'll just wipe it.”", correct: false },
];
const MC_EXPLANATION =
  "Always own the problem immediately and replace the glass. Deflecting to another team member or wiping a soiled glass both undermine guest trust — a quick apology and immediate replacement is the professional standard.";

export default function MultipleChoiceScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const correctId = MC_OPTIONS.find((o) => o.correct)?.id;
  const answeredCorrect = checked && selected === correctId;

  useMarkChallengeComplete(CHALLENGE_INDEX, answeredCorrect);

  function choose(id: string) {
    if (checked) return;
    setSelected(id);
    setChecked(true);
  }

  function reset() {
    setSelected(null);
    setChecked(false);
  }

  return (
    <div style={mobileShellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ padding: 20 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Speed Round</p>
        </div>

        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold-mobile)" }}>
              Guest Interaction
            </p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-mobile)", lineHeight: 1.4 }}>{MC_SCENARIO}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px 20px" }}>
          {MC_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            const showCorrect = checked && opt.id === correctId;
            const showWrong = checked && isSelected && !opt.correct;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${showCorrect ? "var(--green-mobile)" : showWrong ? "var(--gold-mobile)" : "var(--border-mobile)"}`,
                  background: showCorrect ? "var(--green-mobile-bg)" : showWrong ? "var(--gold-mobile-bg)" : "var(--surface-mobile)",
                  color: "var(--text-mobile)",
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "left",
                  cursor: checked ? "default" : "pointer",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `2px solid ${showCorrect ? "var(--green-mobile)" : "var(--border-mobile)"}`,
                    background: showCorrect ? "var(--green-mobile)" : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showCorrect && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--bg-mobile-dark)" }} />}
                </span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {checked && (
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <FeedbackBanner correct={answeredCorrect} explanation={MC_EXPLANATION} />
            {!answeredCorrect && <TryAgainButton onReset={reset} />}
          </div>
        )}

        {answeredCorrect && (
          <CompletionCard title="Correct!" subtitle="That's the professional standard response." onReplay={reset} />
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
