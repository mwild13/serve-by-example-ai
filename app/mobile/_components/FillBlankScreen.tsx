"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import { useMarkChallengeComplete } from "../_lib/use-challenge-complete";
import { FeedbackBanner, TryAgainButton, CompletionCard, mobileShellStyle } from "./challenges/MobileChallengeChrome";

// Phase C file 05 (remaining games) — real content ported verbatim from
// desktop's FillBlankGame.tsx. challengeIndex 1.

const CHALLENGE_INDEX = 1;

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
  "The Classic Daiquiri spec is 60ml White Rum / 25ml Fresh Lime Juice / 15ml Sugar Syrup, served in a chilled coupe. Always use fresh lime — bottled juice alters the acidity balance.";

export default function FillBlankScreen() {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [activeSlot, setActiveSlot] = useState<number | null>(0);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  useMarkChallengeComplete(CHALLENGE_INDEX, checked && correct);

  function fillSlot(word: string) {
    if (activeSlot === null || checked) return;
    const next = { ...selected, [activeSlot]: word };
    setSelected(next);
    const nextEmpty = FILL_CORRECT.findIndex((_, i) => i > activeSlot && !next[i]);
    setActiveSlot(nextEmpty === -1 ? null : nextEmpty);
  }

  const allFilled = FILL_CORRECT.every((_, i) => selected[i]);

  function check() {
    const match = FILL_CORRECT.every((ans, i) => selected[i] === ans);
    setCorrect(match);
    setChecked(true);
  }

  function reset() {
    setSelected({});
    setActiveSlot(0);
    setChecked(false);
    setCorrect(false);
  }

  return (
    <div style={mobileShellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ padding: 20 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Memory Test</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-mobile-muted)" }}>
            Reconstruct the Classic Daiquiri recipe.
          </p>
        </div>

        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              padding: 16,
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              fontSize: 14,
              lineHeight: 2.1,
              color: "var(--text-mobile)",
            }}
          >
            {FILL_PARTS.map((part, i) => (
              <span key={i}>
                <span>{part}</span>
                {i < FILL_CORRECT.length && (
                  <button
                    type="button"
                    onClick={() => !checked && setActiveSlot(i)}
                    style={{
                      display: "inline-block",
                      minWidth: 76,
                      padding: "2px 10px",
                      margin: "0 2px",
                      borderRadius: "var(--radius-sm)",
                      border: `1.5px solid ${activeSlot === i && !checked ? "var(--gold-mobile)" : "var(--border-mobile)"}`,
                      borderStyle: selected[i] ? "solid" : "dashed",
                      background: activeSlot === i && !checked ? "var(--gold-mobile-bg)" : "var(--surface-mobile-alt)",
                      color: selected[i] ? "var(--text-mobile)" : "var(--text-mobile-muted)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: checked ? "default" : "pointer",
                    }}
                  >
                    {selected[i] || "tap to fill"}
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              padding: 14,
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-mobile-muted)" }}>
              Word Bank
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FILL_WORD_BANK.map((word) => {
                const used = Object.values(selected).includes(word);
                return (
                  <button
                    key={word}
                    type="button"
                    onClick={() => !used && fillSlot(word)}
                    disabled={used || checked}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-mobile)",
                      background: used ? "var(--surface-mobile-alt)" : "var(--bg-mobile-dark)",
                      color: used ? "var(--text-mobile-muted)" : "var(--text-mobile)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: used || checked ? "default" : "pointer",
                      opacity: used ? 0.5 : 1,
                      textDecoration: used ? "line-through" : "none",
                    }}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {checked ? (
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <FeedbackBanner correct={correct} explanation={FILL_EXPLANATION} />
            {!correct && <TryAgainButton onReset={reset} />}
          </div>
        ) : (
          <div style={{ padding: "0 20px 20px" }}>
            <button
              type="button"
              onClick={check}
              disabled={!allFilled}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "none",
                opacity: allFilled ? 1 : 0.5,
                cursor: allFilled ? "pointer" : "default",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>Check Recipe</span>
            </button>
          </div>
        )}

        {checked && correct && (
          <CompletionCard title="Recipe correct!" subtitle="That's the exact Classic Daiquiri spec." onReplay={reset} />
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
