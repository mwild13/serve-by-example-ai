"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMobileSession } from "../_lib/mobile-session-context";

// Phase C file 08, Half A — the real 10-question diagnostic, replacing the
// self-report 3-level picker. Confirmed (v4-migration-plan/08, step 1)
// app/api/training/diagnostic/start + .../submit already implement
// lib/diagnostic-engine.ts's real scoring/Elo-seeding logic end to end —
// this screen is a straight port of DiagnosticFlow.tsx's (desktop) fetch/
// answer/submit flow into the mobile shell, not new backend work.
//
// Known pre-existing gap, not introduced or fixed here: /diagnostic/start's
// response includes `isCorrect` on every option, same as desktop's
// DiagnosticFlow.tsx does today — inspectable via devtools. Diagnostic
// scoring only seeds an initial Elo baseline (not a compliance/certification
// gate), so this wasn't treated as a blocking fix for this migration; noted
// for whoever eventually hardens the diagnostic endpoints.

type DiagnosticOption = { text: string; isCorrect: boolean };
type DiagnosticQuestion = { id: string; question_text: string; options: DiagnosticOption[] };

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60dvh",
        padding: 20,
        color: "var(--text-mobile-muted)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

export default function OnboardingDiagnosticScreen() {
  const router = useRouter();
  const session = useMobileSession();
  const [questions, setQuestions] = useState<DiagnosticQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Cache-busting query param + no-store, mirroring DiagnosticFlow.tsx
        // (desktop) exactly — this response is per-user and must never be
        // replayed to a different caller by an edge cache rule.
        const res = await fetch(`/api/training/diagnostic/start?_=${Date.now()}`, {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load diagnostic questions");
        if (!cancelled) setQuestions(data.questions);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load diagnostic questions");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session.token]);

  const shellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 390,
    margin: "0 auto",
    minHeight: "100dvh",
    background: "var(--bg-mobile-dark)",
    fontFamily: "var(--font-body)",
  };

  if (loadError) {
    return (
      <div style={shellStyle}>
        <StatusMessage>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <span>{loadError}</span>
            <Link
              href="/mobile/home"
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--gold-mobile)",
                color: "var(--gold-mobile)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Skip Assessment
            </Link>
          </div>
        </StatusMessage>
      </div>
    );
  }

  if (!questions) {
    return (
      <div style={shellStyle}>
        <StatusMessage>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <Loader2 size={24} className="mobile-spin" color="var(--gold-mobile)" aria-hidden="true" />
            <span>Loading your assessment…</span>
          </div>
        </StatusMessage>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  function selectOption(text: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  }

  function goNext() {
    if (currentIndex < questions!.length - 1) setCurrentIndex((i) => i + 1);
  }

  function goPrevious() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/training/diagnostic/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to submit diagnostic assessment");
      router.push("/mobile/home");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* step-header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <div style={{ width: "100%", height: 4, borderRadius: 2, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--gold-mobile)", transition: "width 0.2s ease" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Placement Assessment</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--gold-mobile)" }}>
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* question-prompt */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-mobile)", lineHeight: 1.35 }}>
            {currentQuestion.question_text}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
            We&apos;ll use your answers to set up your personal training path.
          </p>
        </div>

        {/* option-grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 24px" }}>
          {currentQuestion.options.map((option, idx) => {
            const isSelected = answers[currentQuestion.id] === option.text;
            return (
              <button
                key={idx}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectOption(option.text)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 16,
                  borderRadius: "var(--radius-lg)",
                  background: isSelected ? "var(--gold-mobile-bg)" : "var(--surface-mobile)",
                  border: isSelected ? "1.5px solid var(--gold-mobile)" : "1.5px solid var(--border-mobile)",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? "var(--gold-mobile)" : "var(--border-mobile)"}`,
                    background: isSelected ? "var(--gold-mobile)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--bg-mobile-dark)" }} />}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-mobile)", lineHeight: 1.4 }}>{option.text}</span>
              </button>
            );
          })}
        </div>

        {submitError && (
          <p style={{ margin: "0 20px 12px", fontSize: 12, color: "var(--red-mobile)", textAlign: "center" }}>{submitError}</p>
        )}
      </div>

      {/* footer */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 20 }}>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={goPrevious}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                borderRadius: "var(--radius-pill)",
                background: "none",
                border: "1px solid var(--border-mobile)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-mobile)" }}>Previous</span>
            </button>
          )}
          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{
                flex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "none",
                opacity: allAnswered && !submitting ? 1 : 0.5,
                cursor: allAnswered && !submitting ? "pointer" : "default",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>
                {submitting ? "Submitting…" : "Complete Assessment"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!isAnswered}
              style={{
                flex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile)",
                border: "none",
                opacity: isAnswered ? 1 : 0.5,
                cursor: isAnswered ? "pointer" : "default",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>Next Question</span>
            </button>
          )}
        </div>
        <Link
          href="/mobile/home"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-mobile-muted)",
            textDecoration: "underline",
          }}
        >
          Skip Assessment
        </Link>
      </div>
    </div>
  );
}
