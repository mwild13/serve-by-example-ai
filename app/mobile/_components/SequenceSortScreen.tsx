"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMarkChallengeComplete } from "../_lib/use-challenge-complete";
import { FeedbackBanner, TryAgainButton, CompletionCard, mobileShellStyle } from "./challenges/MobileChallengeChrome";

// Phase C file 05 (remaining games) — real content ported verbatim from
// desktop's SequenceSortGame.tsx (app/dashboard/_components/challenges/),
// not new domain content, restyled to the mobile dark shell. challengeIndex
// 0 in V3's 5-challenge ordering (confirmed against ChallengesPage.tsx).

const CHALLENGE_INDEX = 0;

const SEQUENCE_ITEMS = [
  { id: "margarita", text: "Build the Margarita" },
  { id: "wine", text: "Pour the Pinot Grigio" },
  { id: "guinness-start", text: "Start the Guinness pour" },
  { id: "guinness-top", text: "Top up the Guinness" },
];
const SEQUENCE_CORRECT = ["guinness-start", "margarita", "wine", "guinness-top"];
const SEQUENCE_EXPLANATION =
  "Guinness requires a two-stage pour with roughly 90 seconds to settle, always start it first. Build other drinks while it settles, then top it up last.";

export default function SequenceSortScreen() {
  const [items, setItems] = useState(SEQUENCE_ITEMS);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  useMarkChallengeComplete(CHALLENGE_INDEX, checked && correct);

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const updated = [...items];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    setItems(updated);
  }

  function check() {
    const match = items.map((i) => i.id).join(",") === SEQUENCE_CORRECT.join(",");
    setCorrect(match);
    setChecked(true);
  }

  function reset() {
    setItems(SEQUENCE_ITEMS);
    setChecked(false);
    setCorrect(false);
  }

  return (
    <div style={mobileShellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ padding: 20 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Recipe Order</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-mobile-muted)" }}>
            A Guinness, a Margarita, and a Pinot Grigio arrive simultaneously. What order do you build them?
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px 20px" }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--green-mobile-bg)",
                  color: "var(--green-mobile)",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text-mobile)" }}>{item.text}</span>
              {!checked && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.3 : 1, padding: 2 }}
                  >
                    <ChevronUp size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="Move down"
                    style={{ background: "none", border: "none", cursor: i === items.length - 1 ? "default" : "pointer", opacity: i === items.length - 1 ? 0.3 : 1, padding: 2 }}
                  >
                    <ChevronDown size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {checked ? (
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <FeedbackBanner correct={correct} explanation={SEQUENCE_EXPLANATION} />
            {!correct && <TryAgainButton onReset={reset} />}
          </div>
        ) : (
          <div style={{ padding: "0 20px 20px" }}>
            <button
              type="button"
              onClick={check}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>Verify Order</span>
            </button>
          </div>
        )}

        {checked && correct && (
          <CompletionCard title="Order verified!" subtitle="Nice work — that's the right build sequence." onReplay={reset} />
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
