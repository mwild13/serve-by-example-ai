"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";

interface DiagnosticOption {
  text: string;
  isCorrect: boolean;
}

interface DiagnosticQuestion {
  id: string;
  question_text: string;
  options: DiagnosticOption[];
}

interface DiagnosticFlowProps {
  userId: string;
  userToken: string;
  onComplete: (categoryScores: Record<string, number>) => void;
}

// Rebuilt from scratch (was written entirely in Tailwind utility classes,
// e.g. "fixed inset-0 bg-black/50" — this project has no Tailwind build
// pipeline, so every className here was a no-op. The component rendered as
// unstyled, unpositioned text dumped into the normal page flow instead of a
// centered modal overlay, which is why it appeared to "leak" onto every
// dashboard page (it's a single instance in DashboardShell that isn't tied
// to activeNav, so once showDiagnostic is true it renders regardless of
// which tab is open — with no fixed positioning, that's just visible
// wherever it sits in the DOM). Now uses the same inline style={{}} + CSS
// variable token pattern as the rest of the app, and matches the existing
// modal/backdrop convention from .ops-coaching-drawer-backdrop in
// globals.css (rgba(15, 45, 29, 0.3) backdrop, blur, fixed inset-0).

export default function DiagnosticFlow({
  userId: _userId,
  userToken,
  onComplete,
}: DiagnosticFlowProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch diagnostic questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // cache: "no-store" plus a unique query param defeats both the
        // browser's HTTP cache and any Cloudflare edge rule that caches by
        // URL regardless of method/headers — this endpoint's response is
        // per-user and must never be replayed to a different caller.
        const response = await fetch(
          `/api/training/diagnostic/start?_=${Date.now()}`,
          {
            method: "POST",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load diagnostic questions");
        }

        const data = await response.json();
        setQuestions(data.questions);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Error fetching diagnostic questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [userToken]);

  const handleSelectOption = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: option,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Prepare answers object with question IDs as keys
      const answersPayload: Record<string, string> = {};
      questions.forEach((q) => {
        if (answers[q.id]) {
          answersPayload[q.id] = answers[q.id];
        }
      });

      const response = await fetch("/api/training/diagnostic/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          answers: answersPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit diagnostic assessment");
      }

      const data = await response.json();

      if (data.success) {
        // Call parent callback with category scores
        onComplete(data.category_scores);

        // Redirect to main dashboard after assessment
        router.push("/dashboard");
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error submitting diagnostic:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const backdropStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(15, 45, 29, 0.3)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };

  const cardStyle: CSSProperties = {
    background: "var(--surface-raised)",
    borderRadius: "var(--radius-lg)",
    maxWidth: 560,
    width: "100%",
    boxShadow: "var(--shadow-xl)",
    fontFamily: "var(--font-manrope)",
  };

  if (loading) {
    return (
      <div style={backdropStyle}>
        <div style={{ ...cardStyle, maxWidth: 360, padding: "40px 32px", textAlign: "center" }}>
          <div
            aria-hidden="true"
            style={{
              width: 40, height: 40, margin: "0 auto 16px",
              borderRadius: "50%",
              border: "3px solid var(--line)",
              borderTopColor: "var(--green)",
              animation: "drill-spin 0.8s linear infinite",
            }}
          />
          <p style={{ margin: 0, color: "var(--text-soft)", fontSize: "0.95rem" }}>Loading assessment…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={backdropStyle}>
        <div style={{ ...cardStyle, maxWidth: 400, padding: "32px" }}>
          <h2 style={{ margin: "0 0 12px", fontFamily: "var(--font-fraunces)", fontSize: "1.3rem", color: "var(--status-critical-text)" }}>Something went wrong</h2>
          <p style={{ margin: "0 0 20px", color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.5 }}>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-block"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={backdropStyle}>
        <div style={{ ...cardStyle, maxWidth: 400, padding: "32px", textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--text-soft)" }}>No diagnostic questions available.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div style={backdropStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ background: "var(--green-deep)", color: "var(--surface-raised)", padding: "24px 28px", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}>
          <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-fraunces)", fontSize: "1.4rem", fontWeight: 600 }}>Diagnostic Assessment</h2>
          <p style={{ margin: 0, color: "var(--green-light)", fontSize: "0.9rem" }}>
            Answer 10 questions to personalise your learning path.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "20px 28px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-soft)" }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-soft)" }}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div style={{ width: "100%", height: 6, background: "var(--bg-alt)", borderRadius: 999 }}>
            <div style={{ height: "100%", width: `${progressPercentage}%`, background: "var(--green)", borderRadius: 999, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Question */}
        <div style={{ padding: "20px 28px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>
            {currentQuestion.question_text}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option.text;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(option.text)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "12px 16px", textAlign: "left",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${isSelected ? "var(--green)" : "var(--line)"}`,
                    background: isSelected ? "var(--green-light)" : "var(--bg-alt)",
                    cursor: "pointer",
                    transition: "border-color 0.15s ease, background 0.15s ease",
                    fontFamily: "inherit",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0, width: 18, height: 18, borderRadius: "50%",
                      border: `2px solid ${isSelected ? "var(--green)" : "var(--line)"}`,
                      background: isSelected ? "var(--green)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isSelected && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--surface-raised)" }} />}
                  </span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: "0 28px 20px", display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary"
            style={{ flex: 1, opacity: currentQuestionIndex === 0 ? 0.5 : 1, cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer" }}
          >
            ← Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isAnswered}
              className="btn btn-primary"
              style={{ flex: 1, opacity: isAnswered ? 1 : 0.5, cursor: isAnswered ? "pointer" : "not-allowed" }}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="btn btn-primary"
              style={{ flex: 1, opacity: allAnswered && !submitting ? 1 : 0.5, cursor: allAnswered && !submitting ? "pointer" : "not-allowed" }}
            >
              {submitting ? "Submitting…" : "Complete assessment"}
            </button>
          )}
        </div>

        {/* Question dots */}
        <div style={{ padding: "0 28px 24px", display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {questions.map((q, idx) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentQuestionIndex(idx)}
              title={`Question ${idx + 1}`}
              aria-label={`Go to question ${idx + 1}`}
              style={{
                width: 9, height: 9, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
                background: idx === currentQuestionIndex
                  ? "var(--green)"
                  : answers[q.id] !== undefined
                  ? "var(--status-success)"
                  : "var(--line)",
                transform: idx === currentQuestionIndex ? "scale(1.25)" : "scale(1)",
                transition: "transform 0.15s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
