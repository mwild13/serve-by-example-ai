"use client";

import { useState } from "react";
import { ChallengeCard, FeedbackBanner } from "./ChallengeCard";
import type { ChallengeGameProps } from "./challenge-types";

// ── Question 3: Match Pair ───────────────────────────────────────────────────

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

export default function MatchPairGame({ onComplete, onIncorrect }: ChallengeGameProps) {
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
          explanation="Margarita – coupe (or salt-rimmed rocks). Old Fashioned – rocks glass, always. Mojito – highball, to allow the mint and ice to breathe."
        />
      ) : (
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
          {selectedLeft
            ? `${MATCH_LEFT.find((l) => l.id === selectedLeft)?.label} selected, now tap a glass`
            : `${Object.keys(matched).length} of ${MATCH_LEFT.length} matched`}
        </p>
      )}
    </ChallengeCard>
  );
}
