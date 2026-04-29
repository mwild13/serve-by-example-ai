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

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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

  // Shuffle order computed once at mount — lazy useState ensures the shuffle
  // is synchronous and never causes a second render that could swap the question
  // out from under an in-progress interaction.
  // DescriptorSelector is keyed by stage in StageLearning, so it remounts
  // (and reshuffles) whenever the stage changes.
  const [orderedScenarios] = useState<Scenario[]>(() => shuffleArray([...scenarios]));

  const currentScenario = orderedScenarios[questionIndex % orderedScenarios.length];
  const rawContent = currentScenario?.content as DescriptorContent | undefined;

  // For Level 3: shuffle the DISPLAY order of descriptors per question so users
  // cannot memorise positions between attempts. Recomputed only when the scenario
  // changes (identified by id). correctIndices are remapped to match the new order.
  const perQuestionDisplay = useMemo(() => {
    if (!rawContent) return null;
    if (level !== 3) return null;

    const permutation = shuffleArray([0, 1, 2, 3, 4].slice(0, rawContent.descriptors.length));
    const descriptors = permutation.map((i) => rawContent.descriptors[i]);
    // Map original correctIndices → new visual positions
    const correctIndices = rawContent.correctIndices.map((ci) => permutation.indexOf(ci));
    return { descriptors, correctIndices };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScenario?.id, level]);

  // What the user actually sees and interacts with
  const displayDescriptors = perQuestionDisplay?.descriptors ?? rawContent?.descriptors ?? [];
  const displayCorrectIndices = perQuestionDisplay?.correctIndices ?? rawContent?.correctIndices ?? [];

  const toggleDescriptor = useCallback(
    (index: number) => {
      if (submitted) return;
      setSelected((prev) => {
        if (prev.has(index)) {
          const next = new Set(prev);
          next.delete(index);
          return next;
        }
        if (prev.size < selectCount) {
          const next = new Set(prev);
          next.add(index);
          return next;
        }
        return prev; // already at limit — return same ref to skip re-render
      });
    },
    [submitted, selectCount],
  );

  const handleSubmit = useCallback(() => {
    if (submitted || selected.size !== selectCount || displayCorrectIndices.length === 0) return;
    setSubmitted(true);

    const isCorrect =
      displayCorrectIndices.length === selected.size &&
      displayCorrectIndices.every((ci) => selected.has(ci));

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
  }, [submitted, selected.size, selectCount, displayCorrectIndices, questionsAnswered, correctCount, requiredCorrect, totalQuestionsValue]);

  const nextQuestion = useCallback(() => {
    if (completed) {
      onComplete(correctCount);
      return;
    }
    if (!failed) {
      setQuestionIndex((i) => (i + 1) % orderedScenarios.length);
      setSelected(new Set());
      setSubmitted(false);
      setWasCorrect(null);
    }
  }, [completed, failed, onComplete, correctCount, orderedScenarios.length]);

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

  if (scenarios.length === 0 || !rawContent) {
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
          Stage {level} — Select {selectCount} descriptor{selectCount !== 1 ? "s" : ""} that best describe the scenario
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
          {currentScenario?.prompt ?? rawContent.prompt}
        </h2>

        {/* Descriptor options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayDescriptors.map((descriptor, idx) => {
            const isSelected = selected.has(idx);
            const isCorrectIdx = displayCorrectIndices.includes(idx);
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
        {submitted && rawContent.explanation && (
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
              {wasCorrect ? "✓ Correct — " : "✗ Incorrect — "}{rawContent.explanation}
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
              background: selected.size === selectCount ? "#0B2B1E" : "#e5e7eb",
              color: selected.size === selectCount ? "white" : "#9ca3af",
              border: "none",
              borderRadius: "10px",
              fontWeight: 600,
              fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: "0.9375rem",
              cursor: selected.size === selectCount ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
          >
            {selected.size === selectCount ? "Check answer" : `Identify ${selectCount - selected.size} more`}
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
