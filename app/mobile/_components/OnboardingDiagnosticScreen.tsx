"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Screen from "./ui/Screen";
import { ProgressBar } from "./ui/parts";
import { useMobileSession } from "../_lib/mobile-session-context";

// Phase C file 08, Half A — the real placement-check diagnostic, replacing the
// self-report 3-level picker. Confirmed (docs/zHistorical/v4-migration-plan/08, step 1)
// app/api/training/diagnostic/start + .../submit already implement
// lib/diagnostic-engine.ts's real scoring logic end to end —
// this screen is a straight port of DiagnosticFlow.tsx's (desktop) fetch/
// answer/submit flow into the mobile shell, not new backend work.
//
// Known pre-existing gap, not introduced or fixed here: /diagnostic/start's
// response includes `isCorrect` on every option, same as desktop's
// DiagnosticFlow.tsx does today — inspectable via devtools. Diagnostic
// scoring only orders module recommendations (not a compliance/certification
// gate), so this wasn't treated as a blocking fix for this migration; noted
// for whoever eventually hardens the diagnostic endpoints.
//
// Redesign phase 4: on the mobile frame (ui/Screen), styles in the sm-check
// rules of app/styles/staff.css.

type DiagnosticOption = { text: string; isCorrect: boolean };
// answer_key ("q1".."q10") is what lib/diagnostic-engine.ts's scoring maps
// are actually keyed by — `id` is a real DB UUID, used here only for local
// answers-state keys/React keys. See start/route.ts.
type DiagnosticQuestion = { id: string; answer_key: string; question_text: string; options: DiagnosticOption[] };

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

  const back = { href: "/mobile/learn", label: "Learn" };

  if (loadError) {
    return (
      <Screen title="Skill check" back={back}>
        <div className="sm-quiz">
          <div className="sm-card sm-quiz-end">
            <h2 className="sm-quiz-end-title">Not loading</h2>
            <p className="sm-quiz-end-text">{loadError}</p>
            <Link href="/mobile/learn" className="sm-btn sm-btn--primary sm-btn--block">
              Back to Learn
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  if (!questions) {
    return (
      <Screen title="Skill check" back={back}>
        <div className="sm-quiz">
          <div className="sm-skel" style={{ height: 380, borderRadius: 22 }} aria-label="Loading your skill check" />
        </div>
      </Screen>
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
      // Translate from local (q.id-keyed) answers state to the answer_key
      // ("q1".."q10") the scoring engine understands — sending raw `answers`
      // here silently scored every submission as blank (all answers keyed
      // by a UUID that never matched anything server-side).
      const answersPayload: Record<string, string> = {};
      questions!.forEach((q) => {
        if (answers[q.id]) answersPayload[q.answer_key] = answers[q.id];
      });
      const res = await fetch("/api/training/diagnostic/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ answers: answersPayload }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to submit diagnostic assessment");
      session.markSkillCheckDone();
      router.push("/mobile/learn");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Skill check" back={back}>
      <div className="sm-quiz sm-check">
        <div className="sm-check-head">
          <p className="sm-kicker">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <ProgressBar value={progressPct} max={100} label={`Question ${currentIndex + 1} of ${questions.length}`} />
        </div>

        {/* Keyed on the question, so each one mounts fresh. */}
        <div key={currentQuestion.id} className="sm-check-question">
          <h2 className="sm-check-prompt">{currentQuestion.question_text}</h2>
          <p className="sm-quiz-sub">No pass mark. Your answers decide which modules we suggest first.</p>
          <div className="sm-check-options" role="radiogroup" aria-label="Your answer">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option.text;
              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className="sm-check-option"
                  onClick={() => selectOption(option.text)}
                >
                  <span className="sm-check-radio" aria-hidden="true" />
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {submitError && (
          <p className="sm-check-error" role="alert">
            {submitError}
          </p>
        )}

        <div className="sm-check-actions">
          {currentIndex > 0 && (
            <button type="button" className="sm-btn sm-btn--secondary" onClick={goPrevious}>
              Back
            </button>
          )}
          {isLastQuestion ? (
            <button type="button" className="sm-btn sm-btn--primary" onClick={handleSubmit} disabled={!allAnswered || submitting}>
              {submitting ? "Saving…" : "See my modules"}
            </button>
          ) : (
            <button type="button" className="sm-btn sm-btn--primary" onClick={goNext} disabled={!isAnswered}>
              Next
            </button>
          )}
        </div>
        <Link href="/mobile/learn" className="sm-btn sm-btn--text sm-btn--block">
          Skip for now
        </Link>
      </div>
    </Screen>
  );
}
