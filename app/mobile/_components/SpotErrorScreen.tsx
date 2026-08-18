"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import { useMarkChallengeComplete } from "../_lib/use-challenge-complete";
import { FeedbackBanner, TryAgainButton, CompletionCard, mobileShellStyle } from "./challenges/MobileChallengeChrome";

// Phase C file 05 (remaining games) — real content ported verbatim from
// desktop's SpotErrorGame.tsx. challengeIndex 3.

const CHALLENGE_INDEX = 3;

const SPOT_ITEMS = [
  { id: "rum", text: "60ml White Rum", correct: true },
  { id: "lime", text: "25ml Bottled Lime Juice", correct: false },
  { id: "syrup", text: "15ml Sugar Syrup", correct: true },
  { id: "method", text: "Shake with ice", correct: true },
];
const SPOT_EXPLANATION =
  "The error is \"Bottled Lime Juice.\" A Classic Daiquiri always uses fresh lime juice — bottled juice contains preservatives and citric acid that flatten the flavour and alter the acidity balance.";

export default function SpotErrorScreen() {
  const [tapped, setTapped] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [answeredCorrect, setAnsweredCorrect] = useState(false);

  useMarkChallengeComplete(CHALLENGE_INDEX, checked && answeredCorrect);

  function tap(id: string) {
    if (checked) return;
    const item = SPOT_ITEMS.find((i) => i.id === id);
    const isCorrectTap = !!item && !item.correct;
    setTapped(id);
    setChecked(true);
    setAnsweredCorrect(isCorrectTap);
  }

  function reset() {
    setTapped(null);
    setChecked(false);
    setAnsweredCorrect(false);
  }

  return (
    <div style={mobileShellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ padding: 20 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Menu Audit</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-mobile-muted)" }}>
            One ingredient on this Classic Daiquiri recipe card is wrong. Tap it to identify the mistake.
          </p>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <p style={{ margin: "0 0 12px", fontFamily: "var(--font-heading, var(--font-body))", fontWeight: 700, fontSize: 15, color: "var(--gold-mobile)", textAlign: "center" }}>
              Classic Daiquiri
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SPOT_ITEMS.map((item) => {
                const isTapped = tapped === item.id;
                const isError = !item.correct;
                const showResult = checked && isTapped;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => tap(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 12,
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${
                        showResult && isError ? "var(--gold-mobile)" : showResult && !isError ? "var(--red-mobile)" : "var(--border-mobile)"
                      }`,
                      background: showResult && isError ? "var(--gold-mobile-bg)" : showResult && !isError ? "var(--red-mobile-bg, var(--surface-mobile))" : "var(--surface-mobile-alt)",
                      color: "var(--text-mobile)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: checked ? "default" : "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: showResult && isError ? "var(--gold-mobile)" : "var(--green-mobile)",
                      }}
                    />
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {checked && (
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <FeedbackBanner correct={answeredCorrect} explanation={SPOT_EXPLANATION} />
            {!answeredCorrect && <TryAgainButton onReset={reset} />}
          </div>
        )}

        {checked && answeredCorrect && (
          <CompletionCard title="Error spotted!" subtitle="Nice eye — that recipe card is fixed." onReplay={reset} />
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
