"use client";

import { useState, useEffect } from "react";
import Stepper from "./challenges/Stepper";
import ChallengeScoreBoard from "./challenges/ChallengeScoreBoard";
import SequenceSortGame from "./challenges/SequenceSortGame";
import FillBlankGame from "./challenges/FillBlankGame";
import MatchPairGame from "./challenges/MatchPairGame";
import SpotErrorGame from "./challenges/SpotErrorGame";
import MultipleChoiceGame from "./challenges/MultipleChoiceGame";
import { ArrowRight } from "lucide-react";
import { TOTAL_CHALLENGES, MAX_CHALLENGE_INDEX } from "@/lib/challenges";

const GAMES = [
  { name: "Sequence Sort", desc: "Put the steps in the right order" },
  { name: "Fill the Blank", desc: "Complete the key phrase" },
  { name: "Match Pair", desc: "Link each term to what it means" },
  { name: "Spot the Error", desc: "Find what went wrong" },
  { name: "Multiple Choice", desc: "Pick the right answer" },
];

// ── Page shell / dispatcher ──────────────────────────────────────────────────

export default function ChallengesPage() {
  const [phase, setPhase] = useState<"lobby" | "quiz" | "summary">("lobby");
  const [currentStep, setCurrentStep] = useState(0);
  const [hadError, setHadError] = useState<Set<number>>(new Set());
  const [reviewMode, setReviewMode] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  useEffect(() => {
    // Mount-only client read (localStorage is unavailable during SSR).
    try {
      const stored = localStorage.getItem("sbe-challenges-best-score");
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (index === MAX_CHALLENGE_INDEX) {
      const finalScore = TOTAL_CHALLENGES - hadError.size;
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

  const score = TOTAL_CHALLENGES - hadError.size;

  return (
    <div className="sd-page">
      <header className="sd-head">
        <p className="sd-kicker">Practise</p>
        <h1 className="sd-title">Challenges</h1>
        <p className="sd-lede">Five quick games on the basics of the floor. Tap to answer, no typing.</p>
      </header>

      {phase === "lobby" && (
        <>
          <ol className="sd-rows sd-games">
            {GAMES.map((game, i) => (
              <li key={game.name} className="sd-row-item">
                <div className="sd-game">
                  <span className="sd-path-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="sd-row-main">
                    <span className="sd-row-title">{game.name}</span>
                    <span className="sd-row-desc">{game.desc}</span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <div className="sd-tonight-actions sd-games-actions">
            <button type="button" className="sd-btn sd-btn-brass" onClick={() => setPhase("quiz")}>
              Start the five
              <ArrowRight size={18} strokeWidth={2} aria-hidden />
            </button>
            {personalBest !== null && (
              <p className="sd-meta sd-games-best">
                Your best: <strong>{personalBest} of {TOTAL_CHALLENGES}</strong>
              </p>
            )}
          </div>
        </>
      )}

      {phase !== "lobby" && (
      <div className="sd-docket sd-games-docket">
      {/* 5-dot stepper */}
      <Stepper currentStep={currentStep} phase={phase} />

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
      )}
    </div>
  );
}
