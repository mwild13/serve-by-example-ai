"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, RotateCcw, AlertCircle } from "lucide-react";

// The pieces round a mobile Challenge game: the answer feedback, Try again,
// and the finished card. The mobile counterpart of desktop's ChallengeCard
// pieces. Styles: the sm-game rules in app/styles/staff.css.

export function FeedbackBanner({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <div className={`sm-feedback${correct ? " sm-feedback--right" : ""}`} role="status">
      <p className="sm-feedback-head">
        {correct ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : <AlertCircle size={16} strokeWidth={2.6} aria-hidden="true" />}
        {correct ? "Correct" : "Not quite, try again"}
      </p>
      <p className="sm-feedback-text">{explanation}</p>
    </div>
  );
}

export function TryAgainButton({ onReset }: { onReset: () => void }) {
  return (
    <button type="button" className="sm-btn sm-btn--secondary sm-btn--block" onClick={onReset}>
      Try again
    </button>
  );
}

// Scrolls itself into view: below the fold with no cue, a finished game
// looked stuck on real phones.
export function CompletionCard({ title, subtitle, onReplay }: { title: string; subtitle: string; onReplay: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div ref={ref} className="sm-game-done">
      <div className="sm-card sm-quiz-end">
        <span className="sm-quiz-badge" aria-hidden="true">
          <Check size={30} strokeWidth={2.8} />
        </span>
        <h2 className="sm-quiz-end-title">{title}</h2>
        <p className="sm-quiz-end-text">{subtitle}</p>
        <Link href="/mobile/challenges" className="sm-btn sm-btn--primary sm-btn--block">
          Back to Challenges
        </Link>
        <button type="button" className="sm-btn sm-btn--text sm-btn--block" onClick={onReplay}>
          <RotateCcw size={16} strokeWidth={2.4} aria-hidden="true" />
          Play again
        </button>
      </div>
    </div>
  );
}
