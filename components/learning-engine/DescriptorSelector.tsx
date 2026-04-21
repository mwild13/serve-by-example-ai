"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

type Scenario = {
  id: string;
  module_id: number;
  scenario_index: number;
  scenario_type: string;
  prompt: string;
  content: Record<string, unknown>;
  difficulty: number;
};

type DescriptorContent = {
  prompt: string;
  descriptors: string[];
  correctIndices: number[];
  explanation: string;
};

type Props = {
  scenarios: Scenario[];
  moduleId: number;
  level: 2 | 3;
  onComplete: (score: number) => void;
  initialScore?: number;
};

const selectCountByLevel = { 2: 2, 3: 3 };
const requiredCorrectByLevel = { 2: 4, 3: 5 };
const totalQuestionsTarget = { 2: 6, 3: 7 };

export default function DescriptorSelector({
  scenarios,
  moduleId,
  level,
  onComplete,
  initialScore = 0,
}: Props) {
  const selectCount = selectCountByLevel[level];
  const requiredCorrect = requiredCorrectByLevel[level];
  const totalQuestionsValue: number = totalQuestionsTarget[level];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(initialScore);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const shuffledScenarios = useMemo(() => {
    if (level === 3) {
      // For level 3, shuffle descriptors within each scenario
      return scenarios.map((scenario) => ({
        ...scenario,
        content: {
          ...(scenario.content as DescriptorContent),
          shuffled_indices: shuffleArray([0, 1, 2, 3, 4]),
        },
      }));
    }
    return scenarios;
  }, [scenarios, level, shuffleKey]);

  const currentScenario = shuffledScenarios[questionIndex % shuffledScenarios.length];
  const currentContent = currentScenario?.content as DescriptorContent | undefined;

  const toggleDescriptor = useCallback(
    (index: number) => {
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
    },
    [submitted, selectCount]
  );

  const handleSubmit = useCallback(() => {
    if (submitted || selected.size !== selectCount || !currentContent) return;
    setSubmitted(true);

    const correct = currentContent.correctIndices;
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

    const remaining = totalQuestionsValue - newAnswered;
    const currentCorrects = isCorrect ? correctCount + 1 : correctCount;
    if (remaining + currentCorrects < requiredCorrect && !isCorrect) {
      setFailed(true);
    }
  }, [submitted, selected.size, selectCount, currentContent, questionsAnswered, correctCount, requiredCorrect, totalQuestionsValue]);

  const nextQuestion = useCallback(() => {
    if (completed) {
      onComplete(correctCount);
      return;
    }
    if (!failed) {
      setQuestionIndex((i) => (i + 1) % shuffledScenarios.length);
      setSelected(new Set());
      setSubmitted(false);
      setWasCorrect(null);
      setShuffleKey((k) => k + 1);
    }
  }, [completed, failed, onComplete, correctCount, shuffledScenarios.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (e.key === "Enter" && submitted) {
        e.preventDefault();
        nextQuestion();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submitted, nextQuestion]);

  if (scenarios.length === 0 || !currentContent) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <p>No scenarios available</p>
      </div>
    );
  }

  return (
    <div className="descriptor-container">
      {/* Progress */}
      <div className="descriptor-progress">
        <p className="descriptor-progress-text">
          Question {questionIndex + 1} of {totalQuestionsValue} • {correctCount}/{requiredCorrect} correct
        </p>
        <div className="descriptor-progress-bar">
          <div
            className="descriptor-progress-fill"
            style={{
              width: `${(correctCount / requiredCorrect) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Scenario */}
      <div className="descriptor-card">
        <h2 className="descriptor-prompt">{currentContent.prompt}</h2>

        {/* Descriptors */}
        <div className="descriptor-options">
          {currentContent.descriptors.map((descriptor, idx) => (
            <button
              key={idx}
              className={`descriptor-option${selected.has(idx) ? " descriptor-option-selected" : ""}${
                submitted
                  ? currentContent.correctIndices.includes(idx)
                    ? " descriptor-option-correct"
                    : selected.has(idx)
                    ? " descriptor-option-incorrect"
                    : ""
                  : ""
              }`}
              onClick={() => toggleDescriptor(idx)}
              disabled={submitted}
            >
              <span className="descriptor-option-checkbox">
                {selected.has(idx) ? "✓" : ""}
              </span>
              <span className="descriptor-option-text">{descriptor}</span>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {submitted && currentContent.explanation && (
          <div
            className={`descriptor-explanation${
              wasCorrect
                ? " descriptor-explanation-correct"
                : " descriptor-explanation-incorrect"
            }`}
          >
            <p>{currentContent.explanation}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="descriptor-actions">
        {!submitted && (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selected.size !== selectCount}
          >
            Submit ({selectCount} selected)
          </button>
        )}

        {submitted && (
          <button
            className="btn btn-primary"
            onClick={nextQuestion}
            disabled={completed || failed}
          >
            {completed ? "Stage Complete! →" : failed ? "Failed" : "Next →"}
          </button>
        )}
      </div>

      {/* Completion/Failure states */}
      {completed && (
        <div className="descriptor-completion">
          <p>Level {level} complete!</p>
        </div>
      )}

      {failed && (
        <div className="descriptor-failure">
          <p>You needed {requiredCorrect} correct to pass. Better luck next time!</p>
        </div>
      )}
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
