"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

// ── Shared card shell ─────────────────────────────────────────────────────────

function ChallengeCard({
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
function CheckmarkSVG() {
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

function FeedbackBanner({ correct, explanation }: { correct: boolean; explanation: string }) {
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
        {correct ? "Correct" : "Not quite — try again"}
      </p>
      <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{explanation}</p>
    </div>
  );
}

function ResetButton({ onReset, label = "Try Again" }: { onReset: () => void; label?: string }) {
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

// ── 5-dot stepper ─────────────────────────────────────────────────────────────

const STEP_LABELS = ["Sequence Sort", "Fill the Blank", "Match Pair", "Spot the Error", "Multiple Choice"];

function Stepper({ currentStep, phase }: { currentStep: number; phase: "lobby" | "quiz" | "summary" }) {
  const allDone = phase === "summary";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "1rem 1.5rem",
        background: "var(--surface)",
        borderBottom: "1px solid var(--line-light)",
        marginBottom: "1.5rem",
      }}
    >
      {STEP_LABELS.map((label, i) => {
        const completed = allDone || i < currentStep;
        const current = !allDone && i === currentStep;
        return (
          <div
            key={i}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}
          >
            <div
              className={`challenge-step-dot${current ? " is-current" : ""}`}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: `2px solid ${completed ? "var(--green)" : current ? "var(--gold)" : "var(--line)"}`,
                background: completed ? "var(--green)" : current ? "var(--gold-light)" : "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: current ? "scale(1.1)" : "scale(1)",
                transition: "transform 150ms ease",
              }}
              aria-label={`Step ${i + 1}: ${label}${completed ? " — complete" : current ? " — current" : ""}`}
            >
              {completed ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l6 6L20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: current ? "var(--gold)" : "var(--text-muted)" }}>
                  {i + 1}
                </span>
              )}
            </div>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: completed ? "var(--green)" : current ? "var(--text-soft)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", lineHeight: 1.2 }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Completion summary ────────────────────────────────────────────────────────

function CompletionSummary({
  score,
  hadError,
  onRetry,
  onReview,
}: {
  score: number;
  hadError: Set<number>;
  onRetry: () => void;
  onReview: () => void;
}) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    if (score === 0) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const count = window.innerWidth < 768 ? 50 : 150;
    void confetti({ particleCount: count, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
  }, [score]);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1.5px solid var(--green)",
        borderRadius: "var(--radius-lg)",
        padding: "2rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12l6 6L20 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.75rem", fontWeight: 700, color: "var(--green)", margin: "0 0 0.25rem" }}>
          {score} of 5 correct
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-soft)", margin: 0 }}>
          {score === 5 ? "Perfect run — all 5 on the first try." : score >= 3 ? "Good effort. Review the ones you missed." : "Keep practising — these questions are always replayable."}
        </p>
      </div>

      {/* Per-step result rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {STEP_LABELS.map((label, i) => {
          const firstTry = !hadError.has(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                background: firstTry ? "var(--green-light)" : "var(--bg-alt)",
                border: `1px solid ${firstTry ? "var(--green)" : "var(--line)"}`,
              }}
            >
              {firstTry ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l6 6L20 6" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="var(--gold)" strokeWidth="2"/>
                  <path d="M12 8v4" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: firstTry ? "var(--green-deep)" : "var(--text-soft)", flex: 1 }}>
                {label}
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: firstTry ? "var(--green)" : "var(--text-muted)" }}>
                {firstTry ? "First try" : "Needed retry"}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <button
          onClick={onReview}
          style={{
            width: "100%", padding: "0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-alt)",
            color: "var(--text-soft)",
            fontSize: "0.875rem", fontWeight: 700,
            border: "1px solid var(--line)", cursor: "pointer", minHeight: "48px",
          }}
        >
          Review all answers
        </button>
        <button
          onClick={onRetry}
          style={{
            width: "100%", padding: "0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "0.85rem", fontWeight: 600,
            border: "1px solid var(--line)", cursor: "pointer", minHeight: "48px",
          }}
        >
          Try again from the start
        </button>
      </div>
    </div>
  );
}

// ── Format 1: Sequence Sort ──────────────────────────────────────────────────

const SEQUENCE_ITEMS = [
  { id: "margarita", text: "Build the Margarita" },
  { id: "wine", text: "Pour the Pinot Grigio" },
  { id: "guinness-start", text: "Start the Guinness pour" },
  { id: "guinness-top", text: "Top up the Guinness" },
];
const SEQUENCE_CORRECT = ["guinness-start", "margarita", "wine", "guinness-top"];
const SEQUENCE_EXPLANATION =
  "Guinness requires a two-stage pour with roughly 90 seconds to settle — always start it first. Build other drinks while it settles, then top it up last.";

function SequenceSort({ onComplete, onIncorrect }: { onComplete?: () => void; onIncorrect?: () => void }) {
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

// ── Format 2: Fill the Blank ─────────────────────────────────────────────────

const FILL_PARTS = [
  "A Classic Daiquiri uses ",
  " White Rum, ",
  " fresh lime juice, and ",
  " sugar syrup — shaken and served in a ",
  ".",
];
const FILL_CORRECT = ["60ml", "25ml", "15ml", "chilled coupe"];
const FILL_WORD_BANK = ["25ml", "60ml", "30ml", "15ml", "highball", "chilled coupe", "rocks glass", "20ml"];
const FILL_EXPLANATION =
  "The Classic Daiquiri spec is 60ml White Rum / 25ml Fresh Lime Juice / 15ml Sugar Syrup, served in a chilled coupe. Always use fresh lime — bottled juice alters the acidity balance.";

function FillBlank({ onComplete, onIncorrect }: { onComplete?: () => void; onIncorrect?: () => void }) {
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

// ── Format 3: Match Pair ─────────────────────────────────────────────────────

const MATCH_LEFT = [
  { id: "margarita", label: "Margarita" },
  { id: "old-fashioned", label: "Old Fashioned" },
  { id: "mojito", label: "Mojito" },
];
const MATCH_RIGHT = [
  { id: "coupe", label: "Coupe glass" },
  { id: "rocks", label: "Rocks glass" },
  { id: "highball", label: "Highball glass" },
];
const MATCH_CORRECT: Record<string, string> = {
  margarita: "coupe",
  "old-fashioned": "rocks",
  mojito: "highball",
};

function MatchPair({ onComplete, onIncorrect }: { onComplete?: () => void; onIncorrect?: () => void }) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleLeft = (id: string) => {
    if (matched[id] || done) return;
    setSelectedLeft(id);
    setWrong(null);
  };

  const handleRight = (id: string) => {
    if (!selectedLeft || done) return;
    if (MATCH_CORRECT[selectedLeft] === id) {
      const nextMatched = { ...matched, [selectedLeft]: id };
      setMatched(nextMatched);
      setSelectedLeft(null);
      setWrong(null);
      if (Object.keys(nextMatched).length === MATCH_LEFT.length) {
        setDone(true);
        onComplete?.();
      }
    } else {
      setWrong(selectedLeft);
      setSelectedLeft(null);
      setTimeout(() => setWrong(null), 800);
      onIncorrect?.();
    }
  };

  const leftItemStyle = (id: string): React.CSSProperties => {
    const isMatched = !!matched[id];
    const isSelected = selectedLeft === id;
    const isWrong = wrong === id;
    return {
      padding: "0.8rem 1rem",
      borderRadius: "var(--radius-md)",
      border: `1.5px solid ${isWrong ? "var(--gold)" : isMatched ? "var(--green-mid)" : isSelected ? "var(--green)" : "var(--line)"}`,
      background: isWrong ? "var(--gold-light)" : isMatched ? "var(--green-light)" : isSelected ? "var(--green-light)" : "var(--surface-raised)",
      color: isMatched ? "var(--green-deep)" : isSelected ? "var(--green-deep)" : "var(--text)",
      fontWeight: 700,
      fontSize: "0.88rem",
      cursor: isMatched || done ? "default" : "pointer",
      textAlign: "center",
      transition: "all 0.15s",
      opacity: isMatched ? 0.8 : 1,
      minHeight: "48px",
    };
  };

  const rightItemStyle = (id: string): React.CSSProperties => {
    const isMatched = Object.values(matched).includes(id);
    const isTarget = !!(selectedLeft && MATCH_CORRECT[selectedLeft] === id);
    return {
      padding: "0.8rem 1rem",
      borderRadius: "var(--radius-md)",
      border: `1.5px solid ${isMatched ? "var(--green-mid)" : isTarget ? "var(--green)" : "var(--line)"}`,
      background: isMatched ? "var(--green-light)" : "var(--surface-raised)",
      color: isMatched ? "var(--green-deep)" : "var(--text)",
      fontWeight: 700,
      fontSize: "0.88rem",
      cursor: isMatched || done ? "default" : "pointer",
      textAlign: "center",
      transition: "all 0.15s",
      opacity: isMatched ? 0.8 : 1,
      minHeight: "48px",
    };
  };

  return (
    <ChallengeCard formatLabel="Question 3" title="Match Pair" isCorrect={done}>
      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
        Match each cocktail to its correct glassware. Tap a cocktail, then tap its glass.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {MATCH_LEFT.map((item) => (
            <button key={item.id} onClick={() => handleLeft(item.id)} style={leftItemStyle(item.id)}>
              {item.label}
              {matched[item.id] && (
                <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "var(--green-mid)", marginTop: "2px" }}>
                  Matched
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {MATCH_RIGHT.map((item) => (
            <button key={item.id} onClick={() => handleRight(item.id)} style={rightItemStyle(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {done ? (
        <FeedbackBanner
          correct={true}
          explanation="Margarita — coupe (or salt-rimmed rocks). Old Fashioned — rocks glass, always. Mojito — highball, to allow the mint and ice to breathe."
        />
      ) : (
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
          {selectedLeft
            ? `${MATCH_LEFT.find((l) => l.id === selectedLeft)?.label} selected — now tap a glass`
            : `${Object.keys(matched).length} of ${MATCH_LEFT.length} matched`}
        </p>
      )}
    </ChallengeCard>
  );
}

// ── Format 4: Spot the Error ──────────────────────────────────────────────────

const SPOT_ITEMS = [
  { id: "rum", text: "60ml White Rum", correct: true },
  { id: "lime", text: "25ml Bottled Lime Juice", correct: false },
  { id: "syrup", text: "15ml Sugar Syrup", correct: true },
  { id: "method", text: "Shake with ice", correct: true },
];
const SPOT_EXPLANATION =
  "The error is \"Bottled Lime Juice\". A Classic Daiquiri always uses fresh lime juice. Bottled juice contains preservatives and citric acid that flatten the flavour and alter the acidity balance.";

function SpotError({ onComplete, onIncorrect }: { onComplete?: () => void; onIncorrect?: () => void }) {
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

// ── Format 5: Multiple Choice ─────────────────────────────────────────────────

const MC_SCENARIO = "A guest flags you down and points out their wine glass has a lipstick mark on the rim. What do you do?";
const MC_OPTIONS = [
  { id: "a", text: "\"I'll let the bar team know.\"", correct: false },
  { id: "b", text: "\"I'm so sorry — let me replace that immediately.\"", correct: true },
  { id: "c", text: "\"That must have been there before — I'll just wipe it.\"", correct: false },
];
const MC_EXPLANATION =
  "Always own the problem immediately and replace the glass. Deflecting to another team member or wiping a soiled glass both undermine guest trust. A quick apology and immediate replacement is the professional standard.";

function MultipleChoice({ onComplete, onIncorrect }: { onComplete?: () => void; onIncorrect?: () => void }) {
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

// ── Page shell ────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [phase, setPhase] = useState<"lobby" | "quiz" | "summary">("lobby");
  const [currentStep, setCurrentStep] = useState(0);
  const [hadError, setHadError] = useState<Set<number>>(new Set());
  const [reviewMode, setReviewMode] = useState(false);

  function markComplete(index: number) {
    // Persist to localStorage so ProgressOverview can read completion state
    try {
      const stored = localStorage.getItem("sbe_challenges_completed");
      const existing: number[] = stored ? (JSON.parse(stored) as number[]) : [];
      if (!existing.includes(index)) {
        localStorage.setItem("sbe_challenges_completed", JSON.stringify([...existing, index]));
      }
    } catch { /* ignore */ }
    // Advance wizard
    if (index === 4) {
      setPhase("summary");
    } else {
      setCurrentStep(index + 1);
    }
  }

  function markIncorrect(index: number) {
    setHadError((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  function reset() {
    setPhase("quiz");
    setCurrentStep(0);
    setHadError(new Set());
    setReviewMode(false);
    // Clear localStorage so ProgressOverview reflects the restart
    try {
      localStorage.removeItem("sbe_challenges_completed");
    } catch { /* ignore */ }
  }

  const score = 5 - hadError.size;

  return (
    <div style={{ width: "100%", paddingBottom: "3rem" }}>
      {/* Header */}
      <div
        className="sbe-command-bar sbe-command-bar-active"
        style={{ color: "white", marginBottom: "1.25rem" }}
      >
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Interactive Challenges</span>
          <strong>Test your knowledge</strong>
          <span className="sbe-command-meta">
            5 questions · tap-based · no typing required
          </span>
        </div>
      </div>

      {/* Lobby landing state */}
      {phase === "lobby" && (
        <div style={{ padding: "0.25rem 0 2rem" }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "2.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}>
            <p style={{ fontSize: "0.95rem", color: "var(--text-soft)", lineHeight: 1.65, margin: 0 }}>
              Five interactive formats. Tap-based — no typing required. Each round tests a different skill area.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                "Sequence Sort — arrange steps in the right order",
                "Fill the Blank — complete the key phrase",
                "Match Pair — link terms to their definitions",
                "Spot the Error — identify what went wrong",
                "Multiple Choice — pick the correct answer",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "var(--green-light)", color: "var(--green)",
                    fontSize: "0.72rem", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: "2px",
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPhase("quiz")}
              style={{
                alignSelf: "flex-start",
                background: "var(--green)",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "0.8rem 2rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.01em",
              }}
            >
              Start Challenges
            </button>
          </div>
        </div>
      )}

      {/* 5-dot stepper */}
      {phase !== "lobby" && <Stepper currentStep={currentStep} phase={phase} />}

      {phase === "quiz" && (
        <div>
          {currentStep === 0 && (
            <SequenceSort
              onComplete={() => markComplete(0)}
              onIncorrect={() => markIncorrect(0)}
            />
          )}
          {currentStep === 1 && (
            <FillBlank
              onComplete={() => markComplete(1)}
              onIncorrect={() => markIncorrect(1)}
            />
          )}
          {currentStep === 2 && (
            <MatchPair
              onComplete={() => markComplete(2)}
              onIncorrect={() => markIncorrect(2)}
            />
          )}
          {currentStep === 3 && (
            <SpotError
              onComplete={() => markComplete(3)}
              onIncorrect={() => markIncorrect(3)}
            />
          )}
          {currentStep === 4 && (
            <MultipleChoice
              onComplete={() => markComplete(4)}
              onIncorrect={() => markIncorrect(4)}
            />
          )}
        </div>
      )}

      {phase === "summary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <CompletionSummary
            score={score}
            hadError={hadError}
            onRetry={reset}
            onReview={() => setReviewMode(true)}
          />
          {reviewMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                Review all answers
              </p>
              <SequenceSort onComplete={() => {}} />
              <FillBlank onComplete={() => {}} />
              <MatchPair onComplete={() => {}} />
              <SpotError onComplete={() => {}} />
              <MultipleChoice onComplete={() => {}} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
