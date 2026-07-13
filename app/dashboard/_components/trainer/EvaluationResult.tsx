"use client";

import RecommenderCard from "@/app/dashboard/_components/RecommenderCard";
import type { EvalResult, Module, Scenario } from "./trainer-data";
import { SCORE_DIMENSIONS } from "./trainer-data";

type MasteryFeedback = {
  level: number; previousLevel: number; levelChanged: boolean;
  spamGuarded: boolean; eloRating: number; eloDelta: number;
  isBridge: boolean; consecutiveFails: number;
  confidenceAccuracy: string;
} | null;

export default function EvaluationResult({
  result,
  lastScore,
  currentInsight,
  masteryFeedback,
  activeModule,
  currentScenario,
  onNext,
  onTryAgain,
}: {
  result: EvalResult;
  lastScore: number | null;
  currentInsight: string | null;
  masteryFeedback: MasteryFeedback;
  activeModule: Module;
  currentScenario: Scenario;
  onNext: () => void;
  onTryAgain: () => void;
}) {
  const delta = lastScore !== null ? result.overallScore - lastScore : null;
  const weakest = [...SCORE_DIMENSIONS].sort((a, b) => (result[a.key] as number) - (result[b.key] as number))[0];
  const strongest = [...SCORE_DIMENSIONS].sort((a, b) => (result[b.key] as number) - (result[a.key] as number))[0];

  return (
    <div className="trainer-result">
      <div className="sbe-score-hero">
        <div className="sbe-score-number">
          <span className="sbe-score-val">{result.overallScore}</span>
          <span className="sbe-score-denom">/25</span>
        </div>
        {delta !== null && delta !== 0 && (
          <span className={`sbe-score-delta ${delta > 0 ? "sbe-delta-up" : "sbe-delta-down"}`}>
            {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`} from last attempt
          </span>
        )}
        {delta === null && <span className="sbe-score-delta sbe-delta-first">First attempt on this scenario</span>}
      </div>

      <div className="sbe-dimension-list">
        {SCORE_DIMENSIONS.map(({ key, label }) => {
          const val = result[key] as number;
          const icon = val >= 4 ? "✔" : val === 3 ? "⚠" : "✖";
          const cls = val >= 4 ? "sbe-dim-good" : val === 3 ? "sbe-dim-warn" : "sbe-dim-miss";
          return (
            <div key={key} className={`sbe-dimension-row ${cls}`}>
              <span className="sbe-dim-icon">{icon}</span>
              <span className="sbe-dim-label">{label}</span>
              <span className="sbe-dim-score">{val}/5</span>
            </div>
          );
        })}
      </div>

      <div className="sbe-coach-tip">
        <strong>Coach focus for your next attempt</strong>
        <p>→ {result.improvement}</p>
      </div>

      {currentInsight && (
        <div className="sbe-scenario-insight">
          <strong>Why this matters</strong>
          <p>{currentInsight}</p>
        </div>
      )}

      <details className="sbe-full-feedback">
        <summary>See full feedback</summary>
        <div className="trainer-feedback">
          <div className="trainer-feedback-block trainer-feedback-good">
            <strong>✔ {strongest.label} – strength</strong>
            <p>{result.strengths}</p>
          </div>
          <div className="trainer-feedback-block trainer-feedback-improve">
            <strong>✖ {weakest.label} – missed opportunity</strong>
            <p>{result.improvement}</p>
          </div>
          <div className="trainer-feedback-block trainer-feedback-example">
            <strong>Stronger response</strong>
            <p>{result.improvedResponse}</p>
          </div>
        </div>
      </details>

      {masteryFeedback && (
        <div className="sbe-mastery-feedback">
          <div className="sbe-mastery-feedback-row">
            <span>Mastery Level: <strong>{['Novice', 'Learning', 'Proficient', 'Mastered'][masteryFeedback.level]}</strong></span>
            {masteryFeedback.levelChanged && (
              <span className="sbe-level-up">Level up!</span>
            )}
          </div>
          <div className="sbe-mastery-feedback-row">
            <span>Confidence: {masteryFeedback.confidenceAccuracy}</span>
          </div>
          {masteryFeedback.spamGuarded && (
            <p className="sbe-spam-notice">⏳ This attempt was recorded but won&apos;t advance mastery. Retry after 60 min for credit.</p>
          )}
        </div>
      )}

      {/* Recommender: show when the score is below passing */}
      {result.overallScore < 15 && (
        <RecommenderCard
          tags={[
            activeModule,
            ...currentScenario.pills
              .filter((p) => p.positive)
              .map((p) => p.intent.toLowerCase()),
          ]}
          score={result.overallScore}
          maxScore={25}
        />
      )}

      <div className="trainer-after">
        <button className="btn btn-primary" onClick={onNext}>
          I&apos;m ready →
        </button>
        <button className="btn btn-secondary" onClick={onTryAgain}>
          Try again
        </button>
      </div>
    </div>
  );
}
