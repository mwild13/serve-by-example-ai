"use client";

import { useState } from "react";

// ── Shared card shell ─────────────────────────────────────────────────────────

function ChallengeCard({
  formatLabel,
  title,
  children,
}: {
  formatLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
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

function FeedbackBanner({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${correct ? "var(--green-mid)" : "var(--gold)"}`,
        background: correct ? "var(--green-light)" : "var(--gold-light)",
        color: correct ? "var(--green-deep)" : "var(--text)",
      }}
    >
      <p style={{ fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
        {correct ? "Correct" : "Not quite"}
      </p>
      <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{explanation}</p>
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={onReset}
      style={{
        width: "100%",
        padding: "0.65rem",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--line)",
        background: "var(--bg-alt)",
        color: "var(--text-soft)",
        fontSize: "0.8rem",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Try Again
    </button>
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

function SequenceSort() {
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
  };

  const reset = () => {
    setItems(SEQUENCE_ITEMS);
    setChecked(false);
    setCorrect(false);
  };

  return (
    <ChallengeCard formatLabel="Format 1" title="Sequence Sort">
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
                    background: "none",
                    border: "none",
                    cursor: i === 0 ? "default" : "pointer",
                    opacity: i === 0 ? 0.25 : 1,
                    color: "var(--text-muted)",
                    padding: "2px 4px",
                  }}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: i === items.length - 1 ? "default" : "pointer",
                    opacity: i === items.length - 1 ? 0.25 : 1,
                    color: "var(--text-muted)",
                    padding: "2px 4px",
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
        <>
          <FeedbackBanner correct={correct} explanation={SEQUENCE_EXPLANATION} />
          <ResetButton onReset={reset} />
        </>
      ) : (
        <button
          onClick={check}
          style={{
            padding: "0.7rem 1.5rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--green)",
            color: "white",
            fontSize: "0.85rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-end",
          }}
        >
          Verify Order
        </button>
      )}
    </ChallengeCard>
  );
}

// ── Format 2: Fill the Blank ─────────────────────────────────────────────────

// Sentence parts with blank slots interleaved
// Parts: ["A Classic Daiquiri uses ", " White Rum, ", " fresh lime juice, and ", " sugar syrup — shaken and served in a ", "."]
// Blanks at indices 0–3 map to correctAnswers
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

function FillBlank() {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [activeSlot, setActiveSlot] = useState<number | null>(0);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const fillSlot = (word: string) => {
    if (activeSlot === null || checked) return;
    const next = { ...selected, [activeSlot]: word };
    setSelected(next);
    // Advance to next empty slot
    const nextEmpty = FILL_CORRECT.findIndex((_, i) => i > activeSlot && !next[i]);
    setActiveSlot(nextEmpty === -1 ? null : nextEmpty);
  };

  const allFilled = FILL_CORRECT.every((_, i) => selected[i]);

  const check = () => {
    const match = FILL_CORRECT.every((ans, i) => selected[i] === ans);
    setCorrect(match);
    setChecked(true);
  };

  const reset = () => {
    setSelected({});
    setActiveSlot(0);
    setChecked(false);
    setCorrect(false);
  };

  return (
    <ChallengeCard formatLabel="Format 2" title="Fill the Blank">
      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
        Reconstruct the Classic Daiquiri recipe:
      </p>

      {/* Sentence with blank slots */}
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
                  border: `2px solid ${
                    activeSlot === i && !checked
                      ? "var(--green)"
                      : selected[i]
                      ? "var(--line)"
                      : "var(--line)"
                  }`,
                  borderStyle: selected[i] ? "solid" : "dashed",
                  background: selected[i]
                    ? activeSlot === i && !checked
                      ? "var(--green-light)"
                      : "var(--surface-raised)"
                    : activeSlot === i && !checked
                    ? "var(--green-light)"
                    : "transparent",
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

      {/* Word bank */}
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
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {checked ? (
        <>
          <FeedbackBanner correct={correct} explanation={FILL_EXPLANATION} />
          <ResetButton onReset={reset} />
        </>
      ) : (
        <button
          onClick={check}
          disabled={!allFilled}
          style={{
            padding: "0.7rem 1.5rem",
            borderRadius: "var(--radius-sm)",
            background: allFilled ? "var(--green)" : "var(--line)",
            color: allFilled ? "white" : "var(--text-muted)",
            fontSize: "0.85rem",
            fontWeight: 700,
            border: "none",
            cursor: allFilled ? "pointer" : "not-allowed",
            alignSelf: "flex-end",
            transition: "all 0.2s",
          }}
        >
          Check Recipe
        </button>
      )}
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

function MatchPair() {
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
      if (Object.keys(nextMatched).length === MATCH_LEFT.length) setDone(true);
    } else {
      setWrong(selectedLeft);
      setSelectedLeft(null);
      setTimeout(() => setWrong(null), 800);
    }
  };

  const reset = () => {
    setSelectedLeft(null);
    setMatched({});
    setWrong(null);
    setDone(false);
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
    };
  };

  const rightItemStyle = (id: string): React.CSSProperties => {
    const isMatched = Object.values(matched).includes(id);
    const isTarget = selectedLeft && MATCH_CORRECT[selectedLeft] === id;
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
    };
  };

  return (
    <ChallengeCard formatLabel="Format 3" title="Match Pair">
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
        <>
          <FeedbackBanner
            correct={true}
            explanation="Margarita — coupe (or salt-rimmed rocks). Old Fashioned — rocks glass, always. Mojito — highball, to allow the mint and ice to breathe."
          />
          <ResetButton onReset={reset} />
        </>
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

function SpotError() {
  const [tapped, setTapped] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const tap = (id: string) => {
    if (checked) return;
    setTapped(id);
    setChecked(true);
  };

  const reset = () => {
    setTapped(null);
    setChecked(false);
  };

  return (
    <ChallengeCard formatLabel="Format 4" title="Spot the Error">
      <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
        One ingredient on this Classic Daiquiri recipe card is wrong. Tap it to identify the mistake.
      </p>

      {/* Recipe card */}
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
                  padding: "0.55rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${
                    showResult && isError
                      ? "var(--gold)"
                      : showResult && !isError
                      ? "var(--red-text)"
                      : "transparent"
                  }`,
                  background: showResult && isError
                    ? "var(--gold-light)"
                    : showResult && !isError
                    ? "var(--red-soft)"
                    : "transparent",
                  color: "var(--text)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: checked ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  width: "100%",
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
        <>
          <FeedbackBanner correct={!!(tapped && SPOT_ITEMS.find((i) => i.id === tapped)?.correct === false)} explanation={SPOT_EXPLANATION} />
          <ResetButton onReset={reset} />
        </>
      )}
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

function MultipleChoice() {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const choose = (id: string) => {
    if (checked) return;
    setSelected(id);
    setChecked(true);
  };

  const reset = () => {
    setSelected(null);
    setChecked(false);
  };

  const correctId = MC_OPTIONS.find((o) => o.correct)?.id;

  return (
    <ChallengeCard formatLabel="Format 5" title="Multiple Choice">
      {/* Guest scenario bubble */}
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
                border: `1.5px solid ${
                  showCorrect ? "var(--green)" : showWrong ? "var(--gold)" : "var(--line)"
                }`,
                background: showCorrect ? "var(--green-light)" : showWrong ? "var(--gold-light)" : "var(--surface-raised)",
                color: showCorrect ? "var(--green-deep)" : "var(--text)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textAlign: "left",
                cursor: checked ? "default" : "pointer",
                transition: "all 0.15s",
                position: "relative",
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
        <>
          <FeedbackBanner correct={selected === correctId} explanation={MC_EXPLANATION} />
          <ResetButton onReset={reset} />
        </>
      )}
    </ChallengeCard>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  return (
    <div style={{ width: "100%", paddingBottom: "3rem" }}>
      {/* Header */}
      <div
        className="sbe-command-bar sbe-command-bar-active"
        style={{ color: "white", marginBottom: "1.75rem" }}
      >
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Experimental</span>
          <strong>Interactive Challenges</strong>
          <span className="sbe-command-meta">
            5 formats · tap-based · no typing required
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--text-soft)",
          lineHeight: 1.65,
          marginBottom: "2rem",
          maxWidth: "640px",
        }}
      >
        Bite-sized training built for a busy shift. Tap, drag, and match your way through real hospitality scenarios — no blank text boxes, no exam pressure.
      </p>

      {/* Challenge cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <SequenceSort />
        <FillBlank />
        <MatchPair />
        <SpotError />
        <MultipleChoice />
      </div>
    </div>
  );
}
