"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  LEVEL2_DESCRIPTORS,
  LEVEL3_DESCRIPTORS,
  LEVEL_THRESHOLDS,
  shuffleDescriptors,
  type Module,
  type DescriptorQuestion,
} from "@/lib/scaffolded-questions";

type Props = {
  module: Module;
  level: 2 | 3;
  onComplete: () => void;
  initialScore?: number;
};

export default function DescriptorSelector({ module, level, onComplete, initialScore = 0 }: Props) {
  const rawQuestions = level === 2 ? LEVEL2_DESCRIPTORS[module] : LEVEL3_DESCRIPTORS[module];
  const requiredCorrect = level === 2 ? LEVEL_THRESHOLDS.level2CorrectRequired : LEVEL_THRESHOLDS.level3CorrectRequired;
  const totalQuestions = level === 2 ? LEVEL_THRESHOLDS.level2TotalQuestions : LEVEL_THRESHOLDS.level3TotalQuestions;
  const selectCount = level === 2 ? 2 : 3;

  const questions: DescriptorQuestion[] = useMemo(() => {
    if (level === 3) return rawQuestions.map(shuffleDescriptors);
    return rawQuestions;
  }, [rawQuestions, level]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(initialScore);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0); // triggers re-shuffle animation

  const currentQuestion = questions[questionIndex % questions.length];

  const toggleDescriptor = useCallback((index: number) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < selectCount) {
        next.add(index);
      }
      return next;
    });
  }, [submitted, selectCount]);

  const handleSubmit = useCallback(() => {
    if (submitted || selected.size !== selectCount || !currentQuestion) return;
    setSubmitted(true);

    const correct = currentQuestion.correctIndices;
    const isCorrect = correct.length === selected.size &&
      correct.every((ci) => selected.has(ci));

    setWasCorrect(isCorrect);
    const newAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newAnswered);

    if (isCorrect) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      if (newCorrect >= requiredCorrect) {
        setCompleted(true);
      }
    }

    const remaining = totalQuestions - newAnswered;
    const currentCorrects = isCorrect ? correctCount + 1 : correctCount;
    if (remaining + currentCorrects < requiredCorrect && !isCorrect) {
      setFailed(true);
    }
  }, [submitted, selected, selectCount, currentQuestion, questionsAnswered, correctCount, requiredCorrect, totalQuestions]);

  const nextQuestion = useCallback(() => {
    if (completed) {
      onComplete();
      return;
    }
    if (failed) {
      setQuestionIndex(0);
      setCorrectCount(0);
      setQuestionsAnswered(0);
      setSelected(new Set());
      setSubmitted(false);
      setWasCorrect(null);
      setFailed(false);
      setShuffleKey((k) => k + 1);
      return;
    }
    setQuestionIndex((i) => (i + 1) % questions.length);
    setSelected(new Set());
    setSubmitted(false);
    setWasCorrect(null);
    // In Stage 3, trigger shuffle animation on incorrect answers
    if (level === 3 && wasCorrect === false) {
      setShuffleKey((k) => k + 1);
    }
  }, [completed, failed, onComplete, questions.length, level, wasCorrect]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (!submitted && selected.size === selectCount) {
          handleSubmit();
        } else if (submitted) {
          nextQuestion();
        }
      }
      if (!submitted && e.key >= "1" && e.key <= "5") {
        const idx = parseInt(e.key) - 1;
        if (idx < (currentQuestion?.descriptors.length ?? 0)) {
          toggleDescriptor(idx);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submitted, selected, selectCount, handleSubmit, nextQuestion, currentQuestion, toggleDescriptor]);

  if (questions.length === 0) return null;

  const progressPct = Math.min((questionsAnswered / totalQuestions) * 100, 100);
  const nextStage = level === 2 ? 3 : 4;
  const remaining = selectCount - selected.size;

  // Contextual button text
  const submitLabel = submitted
    ? (completed ? `Continue to Stage ${nextStage} →` : "Next question →")
    : remaining > 0
      ? `Select ${remaining} more`
      : "Submit recommendation";

  return (
    <div className="ds-container">
      {/* Header */}
      <div className="ds-header">
        <div className="ds-level-badge">Stage {level}</div>
        <h2 className="ds-title">
          {level === 2 ? "Descriptor Selection" : "Advanced Descriptors"}
        </h2>
        <p className="ds-subtitle">
          Select {selectCount} correct descriptors — {requiredCorrect}/{totalQuestions} correct to advance
        </p>
      </div>

      {/* Progress */}
      <div className="ds-progress-section">
        <div className="ds-progress-bar">
          <div className="ds-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="ds-progress-stats">
          <span>Correct: <strong>{correctCount}</strong> / {requiredCorrect} needed</span>
          <span>Questions: {questionsAnswered} / {totalQuestions}</span>
        </div>
      </div>

      {/* Completion */}
      {completed && (
        <div className="ds-complete">
          <div className="ds-complete-icon">🎉</div>
          <h3>Stage {level} Complete!</h3>
          <p>
            You got {correctCount}/{questionsAnswered} correct. Stage {nextStage} is now unlocked.
          </p>
          <button className="btn btn-primary" onClick={onComplete}>
            Continue to Stage {nextStage} &rarr;
          </button>
        </div>
      )}

      {/* Failed */}
      {failed && !completed && (
        <div className="ds-failed">
          <div className="ds-failed-icon">✗</div>
          <h3>Not quite</h3>
          <p>
            You got {correctCount}/{questionsAnswered}. You need {requiredCorrect}/{totalQuestions} to advance. Try again — the review helps.
          </p>
          <button className="btn btn-primary" onClick={nextQuestion}>
            Retry Stage {level}
          </button>
        </div>
      )}

      {/* Question card */}
      {!completed && !failed && currentQuestion && (
        <div className="ds-question-card" key={`q-${shuffleKey}-${questionIndex}`}>
          <div className="ds-question-number">
            Question {questionsAnswered + 1} of {totalQuestions}
          </div>
          <p className="ds-question-text">{currentQuestion.prompt}</p>

          <div className="ds-descriptor-grid">
            {currentQuestion.descriptors.map((desc, i) => {
              const isSelected = selected.has(i);
              const isCorrectAnswer = submitted && currentQuestion.correctIndices.includes(i);
              const isWrongSelection = submitted && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={`${shuffleKey}-${i}`}
                  className={[
                    "ds-chip",
                    isSelected && !submitted ? "ds-chip-selected" : "",
                    submitted && isCorrectAnswer ? "ds-chip-correct" : "",
                    isWrongSelection ? "ds-chip-wrong" : "",
                    submitted ? "ds-chip-disabled" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => toggleDescriptor(i)}
                  disabled={submitted}
                >
                  <span className="ds-chip-text">{desc}</span>
                  {isSelected && !submitted && <span className="ds-chip-check">✓</span>}
                  {submitted && isCorrectAnswer && <span className="ds-chip-check">✓</span>}
                  {isWrongSelection && <span className="ds-chip-x">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Submit button — contextual */}
          {!submitted && (
            <div className="ds-submit-row">
              <button
                className="btn btn-primary"
                disabled={selected.size !== selectCount}
                onClick={handleSubmit}
              >
                {submitLabel}
              </button>
            </div>
          )}

          {/* Explanation */}
          {submitted && (
            <div className={`ds-explanation${wasCorrect ? " ds-explanation-correct" : " ds-explanation-incorrect"}`}>
              <div className="ds-result-label">
                {wasCorrect ? "✓ Correct" : "✗ Incorrect"}
              </div>
              <p>{currentQuestion.explanation}</p>
              <button className="btn btn-primary ds-next-btn" onClick={nextQuestion}>
                {submitLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="ds-keyboard-hints">
        {!submitted ? (
          <>Press <kbd>1</kbd>-<kbd>5</kbd> to toggle, <kbd>Enter</kbd> to submit</>
        ) : (
          <>Press <kbd>Enter</kbd> to continue</>
        )}
      </div>
    </div>
  );
}
