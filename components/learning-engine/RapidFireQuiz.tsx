"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { LEVEL1_QUESTIONS, LEVEL_THRESHOLDS, type Module, type QuizQuestion } from "@/lib/scaffolded-questions";

type Props = {
  module: Module;
  onComplete: () => void;
  initialScore?: number;
};

const SPEED_BONUS_MS = 3000;

export default function RapidFireQuiz({ module, onComplete, initialScore = 0 }: Props) {
  const allQuestions = LEVEL1_QUESTIONS[module];
  const required = LEVEL_THRESHOLDS.level1ConsecutiveRequired;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(initialScore);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [speedBonus, setSpeedBonus] = useState(false);
  const [streakPop, setStreakPop] = useState(false);
  const [buttonFlash, setButtonFlash] = useState<"true" | "false" | null>(null);
  const questionStartRef = useRef(Date.now());

  const [shuffledQuestions] = useState<QuizQuestion[]>(() => {
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const currentQuestion = shuffledQuestions[questionIndex % shuffledQuestions.length];

  const handleAnswer = useCallback((userAnswer: boolean) => {
    if (answered !== null || !currentQuestion) return;

    const elapsed = Date.now() - questionStartRef.current;
    const correct = userAnswer === currentQuestion.answer;
    setAnswered(userAnswer);
    setWasCorrect(correct);
    setShowExplanation(true);
    setTotalAttempted((p) => p + 1);
    setButtonFlash(userAnswer ? "true" : "false");

    if (correct) {
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      if (elapsed <= SPEED_BONUS_MS) setSpeedBonus(true);
      // Trigger streak pop animation on milestones (3, 5, or completing)
      if (newStreak >= 3 && (newStreak % 2 === 1 || newStreak >= required)) {
        setStreakPop(true);
        setTimeout(() => setStreakPop(false), 800);
      }
      if (newStreak >= required) {
        setCompleted(true);
      }
    } else {
      setConsecutiveCorrect(0);
    }

    setTimeout(() => setButtonFlash(null), 400);
  }, [answered, currentQuestion, consecutiveCorrect, required]);

  const nextQuestion = useCallback(() => {
    if (completed) {
      onComplete();
      return;
    }
    setQuestionIndex((i) => (i + 1) % shuffledQuestions.length);
    setAnswered(null);
    setWasCorrect(null);
    setShowExplanation(false);
    setSpeedBonus(false);
    questionStartRef.current = Date.now();
  }, [completed, onComplete, shuffledQuestions.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (answered === null) {
        if (e.key === "t" || e.key === "T") handleAnswer(true);
        if (e.key === "f" || e.key === "F") handleAnswer(false);
      } else {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextQuestion();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [answered, handleAnswer, nextQuestion]);

  if (shuffledQuestions.length === 0) return null;

  const progressPct = Math.min((consecutiveCorrect / required) * 100, 100);
  const hasStreakGlow = consecutiveCorrect >= 3;

  return (
    <div className={`rfq-container${hasStreakGlow ? " rfq-streak-glow" : ""}`}>
      {/* Header */}
      <div className="rfq-header">
        <div className="rfq-level-badge">Stage 1</div>
        <h2 className="rfq-title">Rapid-Fire Knowledge Check</h2>
        <p className="rfq-subtitle">
          True or False — {required} consecutive correct to advance
        </p>
      </div>

      {/* Progress bar */}
      <div className="rfq-progress-section">
        <div className="rfq-progress-bar">
          <div className="rfq-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="rfq-progress-stats">
          <span className={`rfq-streak${streakPop ? " rfq-streak-pop" : ""}`}>
            🔥 <strong>{consecutiveCorrect}</strong> / {required}
          </span>
          <span className="rfq-total">
            Attempted: {totalAttempted}
          </span>
          {speedBonus && wasCorrect && (
            <span className="rfq-speed-badge">⚡ Speed bonus!</span>
          )}
        </div>
      </div>

      {/* Streak milestone banner */}
      {consecutiveCorrect >= 3 && answered === null && (
        <div className="rfq-streak-banner">
          {consecutiveCorrect >= 5 ? "🔥 On fire! Perfect streak!" : "💪 Keep it going!"}
        </div>
      )}

      {/* Completion celebration */}
      {completed && (
        <div className="rfq-complete">
          <div className="rfq-complete-icon">🎉</div>
          <h3>Stage 1 Complete!</h3>
          <p>You nailed {required} in a row. Stage 2 is now unlocked.</p>
          <button className="btn btn-primary" onClick={onComplete}>
            Continue to Stage 2 &rarr;
          </button>
        </div>
      )}

      {/* Question card */}
      {!completed && currentQuestion && (
        <div key={questionIndex} className={`rfq-question-card${wasCorrect === true ? " rfq-correct" : ""}${wasCorrect === false ? " rfq-incorrect" : ""}`}>
          <div className="rfq-question-number">
            Question {totalAttempted + (answered === null ? 1 : 0)}
          </div>
          <p className="rfq-question-text">{currentQuestion.question}</p>

          {/* Answer buttons */}
          {answered === null && (
            <div className="rfq-answer-buttons">
              <button
                className={`rfq-btn rfq-btn-true${buttonFlash === "true" ? " rfq-btn-flash" : ""}`}
                onClick={() => handleAnswer(true)}
              >
                <span className="rfq-btn-icon">✓</span> True <kbd>T</kbd>
              </button>
              <button
                className={`rfq-btn rfq-btn-false${buttonFlash === "false" ? " rfq-btn-flash" : ""}`}
                onClick={() => handleAnswer(false)}
              >
                <span className="rfq-btn-icon">✗</span> False <kbd>F</kbd>
              </button>
            </div>
          )}

          {/* Result + explanation */}
          {showExplanation && (
            <div className={`rfq-explanation${wasCorrect ? " rfq-explanation-correct" : " rfq-explanation-incorrect"}`}>
              <div className="rfq-result-label">
                {wasCorrect ? "✓ Correct" : "✗ Incorrect"}
                {!wasCorrect && " — streak reset to 0"}
                {wasCorrect && speedBonus && " · ⚡ Speed bonus"}
              </div>
              <p>{currentQuestion.explanation}</p>
              <button className="btn btn-primary rfq-next-btn" onClick={nextQuestion}>
                {completed ? "Continue to Stage 2 →" : "Next question →"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="rfq-keyboard-hints">
        {answered === null ? (
          <>Press <kbd>T</kbd> for True, <kbd>F</kbd> for False</>
        ) : (
          <>Press <kbd>Enter</kbd> to continue</>
        )}
      </div>
    </div>
  );
}
