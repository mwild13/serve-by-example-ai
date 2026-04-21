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
        <p style={{ color: "#6b7280" }}>No scenarios available</p>
      </div>
    );
  }

  const progressPct = (correctCount / requiredCorrect) * 100;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 4px" }}>
      {/* Progress */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
            Question {questionIndex + 1} of {totalQuestionsValue}
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#1d4ed8" }}>
            {correctCount}/{requiredCorrect} correct
          </p>
        </div>
        <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "#1d4ed8",
              borderRadius: "999px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
          Stage {level} — Select {selectCount} descriptors that best describe the scenario
        </p>
      </div>

      {/* Scenario card */}
      <div style={{
        background: "white",
        border: "2px solid #e5e7eb",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "1.25rem",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}>
        <h2 style={{
          margin: "0 0 1.5rem",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.5,
        }}>
          {currentScenario?.prompt ?? currentContent.prompt}
        </h2>

        {/* Descriptor options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {currentContent.descriptors.map((descriptor, idx) => {
            const isSelected = selected.has(idx);
            const isCorrectIdx = currentContent.correctIndices.includes(idx);
            const isWrongSelected = submitted && isSelected && !isCorrectIdx;
            const isCorrectHighlight = submitted && isCorrectIdx;

            let borderColor = "#e5e7eb";
            let bgColor = "#f9fafb";
            let checkboxBg = "#e5e7eb";
            let checkboxColor = "#9ca3af";

            if (!submitted && isSelected) {
              borderColor = "#1d4ed8";
              bgColor = "#eff6ff";
              checkboxBg = "#1d4ed8";
              checkboxColor = "white";
            } else if (isCorrectHighlight) {
              borderColor = "#16a34a";
              bgColor = "#f0fdf4";
              checkboxBg = "#16a34a";
              checkboxColor = "white";
            } else if (isWrongSelected) {
              borderColor = "#dc2626";
              bgColor = "#fff1f2";
              checkboxBg = "#dc2626";
              checkboxColor = "white";
            }

            return (
              <button
                key={idx}
                onClick={() => toggleDescriptor(idx)}
                disabled={submitted}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 18px",
                  borderRadius: "10px",
                  border: `2px solid ${borderColor}`,
                  background: bgColor,
                  cursor: submitted ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  width: "100%",
                }}
              >
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: checkboxBg,
                  color: checkboxColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  transition: "all 0.15s ease",
                }}>
                  {(isSelected || isCorrectHighlight) ? "✓" : ""}
                </span>
                <span style={{
                  fontSize: "0.9375rem",
                  fontWeight: isSelected || isCorrectHighlight ? 600 : 400,
                  color: "#111827",
                  lineHeight: 1.45,
                }}>
                  {descriptor}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {submitted && currentContent.explanation && (
          <div style={{
            marginTop: "1.25rem",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            background: wasCorrect ? "#f0fdf4" : "#fff1f2",
            border: `1.5px solid ${wasCorrect ? "#86efac" : "#fca5a5"}`,
          }}>
            <p style={{
              margin: 0,
              fontSize: "0.9rem",
              color: wasCorrect ? "#15803d" : "#b91c1c",
              fontWeight: 500,
              lineHeight: 1.5,
            }}>
              {wasCorrect ? "✓ Correct — " : "✗ Incorrect — "}{currentContent.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={selected.size !== selectCount}
            style={{
              padding: "12px 28px",
              background: selected.size === selectCount ? "#1d4ed8" : "#e5e7eb",
              color: selected.size === selectCount ? "white" : "#9ca3af",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9375rem",
              cursor: selected.size === selectCount ? "pointer" : "default",
              transition: "all 0.15s ease",
            }}
          >
            {selected.size === selectCount
              ? `Submit ${selectCount} selected →`
              : `Select ${selectCount - selected.size} more`}
          </button>
        )}

        {submitted && !completed && !failed && (
          <button
            onClick={nextQuestion}
            style={{
              padding: "12px 28px",
              background: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9375rem",
              cursor: "pointer",
            }}
          >
            Next → <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>(or Enter)</span>
          </button>
        )}

        {submitted && completed && (
          <button
            onClick={() => onComplete(correctCount)}
            style={{
              padding: "12px 28px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9375rem",
              cursor: "pointer",
            }}
          >
            Stage Complete! →
          </button>
        )}

        {submitted && failed && (
          <button
            disabled
            style={{
              padding: "12px 28px",
              background: "#fee2e2",
              color: "#b91c1c",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9375rem",
              cursor: "default",
            }}
          >
            Stage Failed
          </button>
        )}
      </div>

      {/* Completion banner */}
      {completed && (
        <div style={{
          marginTop: "1.25rem",
          padding: "1rem 1.25rem",
          background: "#f0fdf4",
          border: "1.5px solid #86efac",
          borderRadius: "12px",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#15803d", fontSize: "1rem" }}>
            Stage {level} complete! You got {correctCount}/{requiredCorrect} correct.
          </p>
        </div>
      )}

      {/* Failure banner */}
      {failed && (
        <div style={{
          marginTop: "1.25rem",
          padding: "1rem 1.25rem",
          background: "#fff1f2",
          border: "1.5px solid #fca5a5",
          borderRadius: "12px",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#b91c1c", fontSize: "1rem" }}>
            You needed {requiredCorrect} correct to pass. Try again!
          </p>
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
