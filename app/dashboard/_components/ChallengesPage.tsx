"use client";

import { useState, useEffect } from "react";
import Stepper from "./challenges/Stepper";
import ChallengeScoreBoard from "./challenges/ChallengeScoreBoard";
import SequenceSortGame from "./challenges/SequenceSortGame";
import FillBlankGame from "./challenges/FillBlankGame";
import MatchPairGame from "./challenges/MatchPairGame";
import SpotErrorGame from "./challenges/SpotErrorGame";
import MultipleChoiceGame from "./challenges/MultipleChoiceGame";

// ── Page shell / dispatcher ──────────────────────────────────────────────────

export default function ChallengesPage() {
  const [phase, setPhase] = useState<"lobby" | "quiz" | "summary">("lobby");
  const [currentStep, setCurrentStep] = useState(0);
  const [hadError, setHadError] = useState<Set<number>>(new Set());
  const [reviewMode, setReviewMode] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sbe-challenges-best-score");
      if (stored !== null) setPersonalBest(parseInt(stored, 10));
    } catch { /* ignore */ }
  }, []);

  function markComplete(index: number) {
    // Persist to localStorage as cache (for instant UI feedback)
    try {
      const stored = localStorage.getItem("sbe_challenges_completed");
      const existing: number[] = stored ? (JSON.parse(stored) as number[]) : [];
      if (!existing.includes(index)) {
        localStorage.setItem("sbe_challenges_completed", JSON.stringify([...existing, index]));
      }
    } catch { /* ignore */ }

    // Sync to server via API (non-blocking; fires in background)
    void fetch("/api/training/challenges/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeIndex: index }),
    }).catch((err) => console.error("[ChallengesPage] Failed to sync challenge:", err));

    // Advance wizard
    if (index === 4) {
      const finalScore = 5 - hadError.size;
      try {
        const stored = localStorage.getItem("sbe-challenges-best-score");
        const prev = stored !== null ? parseInt(stored, 10) : -1;
        if (finalScore > prev) {
          localStorage.setItem("sbe-challenges-best-score", String(finalScore));
          setPersonalBest(finalScore);
        }
      } catch { /* ignore */ }
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
      <div style={{ background: "var(--green)", padding: "20px 16px 16px", borderRadius: "0 0 var(--radius-xl) var(--radius-xl)", boxShadow: "0 4px 20px rgba(15,45,29,0.18)", margin: "0 -1rem 1.25rem" }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "block" }}>Interactive Challenges</span>
        <h1 style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 22, fontWeight: 600, color: "#fff", margin: "2px 0 4px" }}>Test your knowledge</h1>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>5 questions · tap-based · no typing required</span>
      </div>

      {/* Lobby landing state */}
      {phase === "lobby" && (
        <div style={{ padding: "0.25rem 0 2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}>
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6h8M8 10h5M8 14h8M8 18h5"/>
                    <path d="M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"/>
                  </svg>
                ),
                name: "Sequence Sort",
                desc: "Arrange steps in the right order",
                tint: "var(--green-light)", color: "var(--green)",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                ),
                name: "Fill the Blank",
                desc: "Complete the key phrase",
                tint: "var(--gold-light)", color: "var(--gold)",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="8" r="2"/><circle cx="18" cy="8" r="2"/>
                    <circle cx="6" cy="16" r="2"/><circle cx="18" cy="16" r="2"/>
                    <path d="M8 8h8M8 16h8"/>
                  </svg>
                ),
                name: "Match Pair",
                desc: "Link terms to their definitions",
                tint: "var(--green-light)", color: "var(--green)",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
                    <path d="M11 8v4M11 15h.01"/>
                  </svg>
                ),
                name: "Spot the Error",
                desc: "Identify what went wrong",
                tint: "var(--gold-light)", color: "var(--gold)",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                ),
                name: "Multiple Choice",
                desc: "Pick the correct answer",
                tint: "var(--green-light)", color: "var(--green)",
              },
            ].map((game, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line-light)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  gridColumn: i === 4 ? "1 / -1" : undefined,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-sm)",
                  background: game.tint, color: game.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {game.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{game.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{game.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("quiz")}
            style={{
              width: "100%",
              background: "var(--green)",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "0.9rem 2rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.01em",
            }}
          >
            Start Challenges
          </button>

          {personalBest !== null && (
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                Personal best:&nbsp;
              </span>
              <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 800 }}>
                {personalBest}/5
              </span>
            </div>
          )}
        </div>
      )}

      {/* 5-dot stepper */}
      {phase !== "lobby" && <Stepper currentStep={currentStep} phase={phase} />}

      {phase === "quiz" && (
        <div>
          {currentStep === 0 && (
            <SequenceSortGame
              onComplete={() => markComplete(0)}
              onIncorrect={() => markIncorrect(0)}
            />
          )}
          {currentStep === 1 && (
            <FillBlankGame
              onComplete={() => markComplete(1)}
              onIncorrect={() => markIncorrect(1)}
            />
          )}
          {currentStep === 2 && (
            <MatchPairGame
              onComplete={() => markComplete(2)}
              onIncorrect={() => markIncorrect(2)}
            />
          )}
          {currentStep === 3 && (
            <SpotErrorGame
              onComplete={() => markComplete(3)}
              onIncorrect={() => markIncorrect(3)}
            />
          )}
          {currentStep === 4 && (
            <MultipleChoiceGame
              onComplete={() => markComplete(4)}
              onIncorrect={() => markIncorrect(4)}
            />
          )}
        </div>
      )}

      {phase === "summary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <ChallengeScoreBoard
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
              <SequenceSortGame onComplete={() => {}} />
              <FillBlankGame onComplete={() => {}} />
              <MatchPairGame onComplete={() => {}} />
              <SpotErrorGame onComplete={() => {}} />
              <MultipleChoiceGame onComplete={() => {}} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
