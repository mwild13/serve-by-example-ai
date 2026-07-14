"use client";

import { useState } from "react";
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
              Five interactive formats. Tap-based, no typing required. Each round tests a different skill area.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                "Sequence Sort – arrange steps in the right order",
                "Fill the Blank – complete the key phrase",
                "Match Pair – link terms to their definitions",
                "Spot the Error – identify what went wrong",
                "Multiple Choice – pick the correct answer",
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
