"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { VerifyAnswerResult, VerifyQuizQuestion } from "@/lib/verify-quiz-client";

type Props = {
  /** Prompts in the order the server will ask them; no answers. */
  questions: VerifyQuizQuestion[];
  required: number;
  /** Grades one answer server-side. Rejects on a network or server error. */
  onAnswer: (position: number, answer: "true" | "false") => Promise<VerifyAnswerResult>;
  /** Called when the user moves on from the final answer: passed, or out of questions. */
  onComplete: (passed: boolean, streak: number) => void;
  onError: (message: string) => void;
};

const SPEED_BONUS_MS = 3000;

// Every answer is graded by /api/training/verify/answer, which also keeps the
// streak; this component only shows what the server says. It used to grade
// in the browser against an answer key shipped in the bundle (audit
// 2026-09-30, C4).
export default function RapidFireQuiz({ questions, required, onAnswer, onComplete, onError }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [answered, setAnswered] = useState<"true" | "false" | null>(null);
  const [checking, setChecking] = useState(false);
  const [graded, setGraded] = useState<VerifyAnswerResult | null>(null);
  const [speedBonus, setSpeedBonus] = useState(false);
  const [streakPop, setStreakPop] = useState(false);
  const [buttonFlash, setButtonFlash] = useState<string | null>(null);
  // Stamped in a mount effect rather than here — calling Date.now() directly
  // in the render body is an impure side effect the React Compiler flags.
  const questionStartRef = useRef<number>(0);
  // Blocks a second answer (click + keypress) while the first is in flight.
  const checkingRef = useRef(false);

  const currentQuestion = questions[questionIndex] ?? questions[questions.length - 1];
  const completed = graded !== null && graded.status !== "active";

  // Stamp the start time for the first question once, on mount.
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, []);

  const handleAnswer = useCallback(
    async (userAnswer: "true" | "false") => {
      if (answered !== null || checkingRef.current || !currentQuestion) return;
      checkingRef.current = true;

      const elapsed = Date.now() - questionStartRef.current;
      setAnswered(userAnswer);
      setChecking(true);
      setButtonFlash(userAnswer);
      setTimeout(() => setButtonFlash(null), 400);

      try {
        const result = await onAnswer(currentQuestion.position, userAnswer);
        setGraded(result);
        setConsecutiveCorrect(result.streak);
        if (result.correct) {
          if (elapsed <= SPEED_BONUS_MS) setSpeedBonus(true);
          if (result.streak >= 3 && (result.streak % 2 === 1 || result.streak >= required)) {
            setStreakPop(true);
            setTimeout(() => setStreakPop(false), 800);
          }
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : "Could not check that answer.");
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    },
    [answered, currentQuestion, onAnswer, onError, required]
  );

  const nextQuestion = useCallback(() => {
    if (!graded) return;
    if (graded.status !== "active") {
      onComplete(graded.status === "passed", graded.streak);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setAnswered(null);
    setGraded(null);
    setSpeedBonus(false);
    questionStartRef.current = Date.now();
  }, [graded, onComplete]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (answered === null) {
        if (e.key === "t" || e.key === "T") {
          void handleAnswer("true");
        }
        if (e.key === "f" || e.key === "F") {
          void handleAnswer("false");
        }
      } else if (graded) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextQuestion();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [answered, graded, handleAnswer, nextQuestion]);

  if (questions.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <p>No scenarios available</p>
      </div>
    );
  }

  function buttonClass(choice: "true" | "false"): string {
    let cls = `quiz-button quiz-button-${choice}`;
    if (graded) {
      if (answered === choice) {
        cls += graded.correct ? " quiz-button-correct" : " quiz-button-incorrect";
      } else if (graded.correctAnswer === choice) {
        cls += " quiz-button-correct"; // reveal correct answer when user chose wrong
      }
    }
    if (buttonFlash === choice) cls += " quiz-button-flash";
    return cls;
  }

  return (
    <div className="quiz-container">
      {/* Progress — tracks streak goal, not question index */}
      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${Math.min((consecutiveCorrect / required) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="quiz-progress-text">
          {consecutiveCorrect} / {required} correct in a row
        </p>
      </div>

      {/* Streak counter */}
      <div className="quiz-streak">
        <span className={`quiz-streak-number${streakPop ? " quiz-streak-pop" : ""}`}>
          {consecutiveCorrect}
        </span>
        <span className="quiz-streak-label">in a row</span>
      </div>

      {/* Question — key forces a fresh mount on every question change,
          guaranteeing the text and buttons never show stale content */}
      <div key={questionIndex} className="quiz-question-card">
        <h2 className="quiz-question-text">{currentQuestion?.prompt ?? ""}</h2>
        <div className="quiz-button-group">
          <button
            className={buttonClass("true")}
            onClick={() => void handleAnswer("true")}
            disabled={answered !== null}
          >
            <span className="quiz-button-label">True</span>
            <span className="quiz-button-hint">or press T</span>
          </button>

          <button
            className={buttonClass("false")}
            onClick={() => void handleAnswer("false")}
            disabled={answered !== null}
          >
            <span className="quiz-button-label">False</span>
            <span className="quiz-button-hint">or press F</span>
          </button>
        </div>

        {checking && (
          <p className="quiz-progress-text" style={{ textAlign: "center" }}>Checking…</p>
        )}

        {/* Explanation + Next button live inside the card so they never scroll off screen */}
        {graded?.explanation && (
          <div
            className={`quiz-explanation${graded.correct ? " quiz-explanation-correct" : " quiz-explanation-incorrect"}`}
          >
            <p className="quiz-explanation-text">{graded.explanation}</p>
            {speedBonus && <p className="quiz-explanation-bonus">Speed bonus!</p>}
          </div>
        )}

        {graded && (
          <button
            className="btn btn-primary quiz-next-btn"
            onClick={nextQuestion}
          >
            {completed ? (graded.status === "passed" ? "Complete Stage →" : "See result →") : "Next question →"}
          </button>
        )}
      </div>

      {/* Completion state */}
      {graded?.status === "passed" && (
        <div className="quiz-completion">
          <p className="quiz-completion-text">
            Stage completed! You got {consecutiveCorrect} in a row.
          </p>
        </div>
      )}
    </div>
  );
}
