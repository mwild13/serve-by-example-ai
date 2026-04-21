"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Scenario = {
  id: string;
  module_id: number;
  scenario_index: number;
  scenario_type: string;
  prompt: string;
  content: Record<string, unknown>;
  difficulty: number;
};

type QuizContent = {
  question: string;
  answer: string;
  explanation: string;
  option_type?: string;
};

type Props = {
  scenarios: Scenario[];
  moduleId: number;
  onComplete: (score: number) => void;
  initialScore?: number;
};

const SPEED_BONUS_MS = 3000;
const CONSECUTIVE_REQUIRED = 5;

export default function RapidFireQuiz({
  scenarios,
  moduleId,
  onComplete,
  initialScore = 0,
}: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(initialScore);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [speedBonus, setSpeedBonus] = useState(false);
  const [streakPop, setStreakPop] = useState(false);
  const [buttonFlash, setButtonFlash] = useState<string | null>(null);
  const questionStartRef = useRef(Date.now());

  const [shuffledScenarios, setShuffledScenarios] = useState<Scenario[]>([]);

  // Shuffle scenarios whenever the scenarios prop changes
  useEffect(() => {
    const shuffled = [...scenarios];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledScenarios(shuffled);
    setQuestionIndex(0); // Reset to first question when scenarios change
  }, [scenarios]);

  const currentScenario = shuffledScenarios[questionIndex % shuffledScenarios.length];
  const currentContent = currentScenario?.content as QuizContent | undefined;

  const handleAnswer = useCallback(
    (userAnswer: string) => {
      if (answered !== null || !currentContent) return;

      const elapsed = Date.now() - questionStartRef.current;
      const correctAnswer = String(currentContent.answer).toLowerCase();
      const correct = userAnswer === correctAnswer;
      setAnswered(userAnswer);
      setWasCorrect(correct);
      setShowExplanation(true);
      setTotalAttempted((p) => p + 1);
      setButtonFlash(userAnswer);

      if (correct) {
        const newStreak = consecutiveCorrect + 1;
        setConsecutiveCorrect(newStreak);
        if (elapsed <= SPEED_BONUS_MS) setSpeedBonus(true);

        if (newStreak >= 3 && (newStreak % 2 === 1 || newStreak >= CONSECUTIVE_REQUIRED)) {
          setStreakPop(true);
          setTimeout(() => setStreakPop(false), 800);
        }

        if (newStreak >= CONSECUTIVE_REQUIRED) {
          setCompleted(true);
        }
      } else {
        setConsecutiveCorrect(0);
      }

      setTimeout(() => setButtonFlash(null), 400);
    },
    [answered, currentContent, consecutiveCorrect]
  );

  const nextQuestion = useCallback(() => {
    if (completed) {
      onComplete(consecutiveCorrect);
      return;
    }
    if (shuffledScenarios.length > 0) {
      setQuestionIndex((i) => (i + 1) % shuffledScenarios.length);
    }
    setAnswered(null);
    setWasCorrect(null);
    setShowExplanation(false);
    setSpeedBonus(false);
    questionStartRef.current = Date.now();
  }, [completed, onComplete, shuffledScenarios.length, consecutiveCorrect]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (answered === null) {
        if (e.key === "t" || e.key === "T") {
          handleAnswer("true");
        }
        if (e.key === "f" || e.key === "F") {
          handleAnswer("false");
        }
      } else {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextQuestion();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [answered, currentContent, handleAnswer, nextQuestion]);

  if (scenarios.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <p>No scenarios available</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* Progress */}
      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${((questionIndex + 1) / shuffledScenarios.length) * 100}%`,
            }}
          />
        </div>
        <p className="quiz-progress-text">
          Question {questionIndex + 1} of {shuffledScenarios.length}
        </p>
      </div>

      {/* Streak counter */}
      <div className="quiz-streak">
        <span className={`quiz-streak-number${streakPop ? " quiz-streak-pop" : ""}`}>
          {consecutiveCorrect}
        </span>
        <span className="quiz-streak-label">in a row</span>
      </div>

      {/* Question */}
      <div className="quiz-question-card">
        <h2 className="quiz-question-text">{currentScenario?.prompt ?? currentContent?.question ?? ""}</h2>
        <div className="quiz-button-group">
          <button
            className={`quiz-button quiz-button-true${
              answered !== null
                ? answered === "true"
                  ? wasCorrect
                    ? " quiz-button-correct"
                    : " quiz-button-incorrect"
                  : currentContent && String(currentContent.answer).toLowerCase() === "true"
                    ? " quiz-button-correct"   // reveal correct answer when user chose wrong
                    : ""
                : ""
            }${buttonFlash === "true" ? " quiz-button-flash" : ""}`}
            onClick={() => handleAnswer("true")}
            disabled={answered !== null}
          >
            <span className="quiz-button-label">True</span>
            <span className="quiz-button-hint">or press T</span>
          </button>

          <button
            className={`quiz-button quiz-button-false${
              answered !== null
                ? answered === "false"
                  ? wasCorrect
                    ? " quiz-button-correct"
                    : " quiz-button-incorrect"
                  : currentContent && String(currentContent.answer).toLowerCase() === "false"
                    ? " quiz-button-correct"   // reveal correct answer when user chose wrong
                    : ""
                : ""
            }${buttonFlash === "false" ? " quiz-button-flash" : ""}`}
            onClick={() => handleAnswer("false")}
            disabled={answered !== null}
          >
            <span className="quiz-button-label">False</span>
            <span className="quiz-button-hint">or press F</span>
          </button>
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && currentContent?.explanation && (
        <div
          className={`quiz-explanation${wasCorrect ? " quiz-explanation-correct" : " quiz-explanation-incorrect"}`}
        >
          <p className="quiz-explanation-text">{currentContent.explanation}</p>
          {speedBonus && <p className="quiz-explanation-bonus">⚡ Speed bonus!</p>}
        </div>
      )}

      {/* Next button */}
      {answered !== null && (
        <button
          className="btn btn-primary"
          onClick={nextQuestion}
          style={{ marginTop: "16px", width: "100%" }}
        >
          {completed ? "Complete Stage →" : "Next question →"}
        </button>
      )}

      {/* Completion state */}
      {completed && (
        <div className="quiz-completion">
          <p className="quiz-completion-text">
            Stage completed! You got {consecutiveCorrect} in a row.
          </p>
        </div>
      )}
    </div>
  );
}
