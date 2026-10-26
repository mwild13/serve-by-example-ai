"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { useDragReorder } from "@/lib/use-drag-reorder";
import Screen from "./ui/Screen";
import { useMarkChallengeComplete } from "../_lib/use-challenge-complete";
import { FeedbackBanner, TryAgainButton, CompletionCard } from "./challenges/MobileChallengeChrome";

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
  const { listRef: dragListRef, dragging, onPointerDown: onDragStart } = useDragReorder({ items, onChange: setItems, disabled: checked });

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
    <Screen title="Recipe Order" back={{ href: "/mobile/challenges", label: "Challenges" }} tab="practise">
      <div className="sm-game">
        <p className="sm-quiz-sub">A Guinness, a Margarita, and a Pinot Grigio arrive simultaneously. What order do you build them?</p>

        {!checked && <p className="sm-quiz-sub">Drag the drinks into order, or use the arrows.</p>}
        <ol ref={dragListRef} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px 20px", margin: 0, listStyle: "none" }}>
          {items.map((item, i) => (
            <li
              key={item.id}
              onPointerDown={onDragStart}
              data-drag-index={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: "var(--radius-md)",
                background: "var(--sm-card)",
                border: dragging === i ? "1px solid var(--sm-accent)" : "1px solid var(--sm-bar-line)",
                boxShadow: dragging === i ? "var(--shadow-md)" : undefined,
                userSelect: "none",
                cursor: checked ? undefined : "grab",
              }}
            >
              {!checked && (
                <span
                  aria-hidden="true"
                  onPointerDown={onDragStart}
                  data-drag-index={i}
                  data-drag-grip=""
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 40, margin: "-8px -6px -8px -4px", touchAction: "none", cursor: "grab" }}
                >
                  <GripVertical size={18} strokeWidth={2} color="var(--sm-ink-soft)" />
                </span>
              )}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--sm-accent-tint)",
                  color: "var(--sm-good)",
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
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--sm-ink)" }}>{item.text}</span>
              {!checked && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.3 : 1, padding: 2 }}
                  >
                    <ChevronUp size={16} strokeWidth={2} color="var(--sm-ink-soft)" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="Move down"
                    style={{ background: "none", border: "none", cursor: i === items.length - 1 ? "default" : "pointer", opacity: i === items.length - 1 ? 0.3 : 1, padding: 2 }}
                  >
                    <ChevronDown size={16} strokeWidth={2} color="var(--sm-ink-soft)" aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>

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
                background: "var(--sm-accent)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--sm-bg)" }}>Verify Order</span>
            </button>
          </div>
        )}

        {checked && correct && (
          <CompletionCard title="Order verified!" subtitle="Nice work. That's the right build sequence." onReplay={reset} />
        )}
      </div>
    </Screen>
  );
}
