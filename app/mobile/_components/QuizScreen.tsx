"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import BottomNav from "./BottomNav";
import MobileScreenShell from "./MobileScreenShell";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import {
  startVerifyQuiz,
  submitVerifyAnswer,
  type VerifyAnswerResult,
  type VerifyQuizStart,
} from "@/lib/verify-quiz-client";

// Phase 3 (v4-migration-plan/00-bug-batch-plan.md, item 6) — Quiz screen.
// LearnHubScreen's module cards land here first, matching desktop's order
// (Quiz gates a module, Arena is a separate later system).
//
// Same mechanic as desktop's ModuleVerify + RapidFireQuiz: keep answering
// True/False until you get `required` (5) correct in a row; a wrong answer
// resets the streak but doesn't end the quiz. Since audit 2026-09-30 (C4) the
// server grades every answer and keeps the streak (lib/verify-quiz.ts): this
// screen gets prompts only, and mastery is recorded by the answer that
// completes the streak — there's no separate save call.

type Status = "loading" | "playing" | "mastered" | "exhausted" | "error";

export default function QuizScreen() {
  const session = useMobileSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, refetch } = useTrainingProgress();

  const moduleId = Number(searchParams.get("moduleId") ?? 1) || 1;
  const moduleTitle = searchParams.get("moduleTitle") ?? `Module ${moduleId}`;

  // Mobile cleanup pass (2026-08-25): the mastered screen used to always
  // offer "Try it in Live Arena" here. Replaced with "Next Module" so
  // mastering a module continues the learning path.
  //
  // Round 2 (2026-08-25): changed from "next accessible module in catalog
  // order" to a strict numeric moduleId+1 walk through 1-40. This screen is
  // only reachable once a user already has module access at all (module/
  // stage4 nav items are premium-gated at the DashboardShell/mobile-shell
  // level before a user ever lands on /mobile/quiz), and access is
  // effectively all-40-or-nothing for any tier that reaches this screen —
  // so id+1 and "next accessible module" are the same module in practice,
  // and id+1 is simpler and matches "map 1-40" exactly as asked. Module 40
  // is the deliberate end of the line: no "next", the mastered screen shows
  // a distinct completed state instead (isFinalModule below) with a
  // "Start Again" action back to module 1, rather than a dead end.
  const isFinalModule = moduleId >= 40;
  const nextModule = useMemo(() => {
    if (!data || isFinalModule) return null;
    return data.allModules.find((mod) => mod.id === moduleId + 1) ?? null;
  }, [data, moduleId, isFinalModule]);
  const firstModule = useMemo(() => data?.allModules.find((mod) => mod.id === 1) ?? null, [data]);

  const [quiz, setQuiz] = useState<VerifyQuizStart | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [answered, setAnswered] = useState<"true" | "false" | null>(null);
  const [graded, setGraded] = useState<VerifyAnswerResult | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  // A ref, not state: blocks a second answer while one is in flight.
  const checkingRef = useRef(false);
  // Bumped by "Try again" to start a fresh run.
  const [runKey, setRunKey] = useState(0);

  const required = quiz?.required ?? 5;
  const questions = quiz?.questions ?? [];
  const currentQuestion = questions[questionIndex] ?? questions[questions.length - 1];
  const wasCorrect = graded ? graded.correct : null;

  useEffect(() => {
    let cancelled = false;
    async function begin() {
      try {
        const started = await startVerifyQuiz(session.token, moduleId);
        if (cancelled) return;
        setQuiz(started);
        setQuestionIndex(0);
        setConsecutiveCorrect(0);
        setAnswered(null);
        setGraded(null);
        setStatus("playing");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not start the quiz.");
        setStatus("error");
      }
    }
    void begin();
    return () => {
      cancelled = true;
    };
  }, [session.token, moduleId, runKey]);

  function restart() {
    setStatus("loading");
    setError(null);
    setRunKey((k) => k + 1);
  }

  async function handleAnswer(choice: "true" | "false") {
    if (answered !== null || checkingRef.current || !currentQuestion || !quiz) return;
    checkingRef.current = true;
    setAnswered(choice);
    try {
      const result = await submitVerifyAnswer(session.token, quiz.attemptId, currentQuestion.position, choice);
      setGraded(result);
      setConsecutiveCorrect(result.streak);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check that answer.");
      setStatus("error");
    } finally {
      checkingRef.current = false;
    }
  }

  function handleNext() {
    if (!graded) return;
    if (graded.status === "passed") {
      setStatus("mastered");
      // Perf fix (Phase 1a): shared TrainingProgressProvider no longer
      // refetches on every screen mount, so a new mastery must explicitly
      // refresh it — otherwise Home/Learn/Me would keep showing pre-quiz
      // progress until a full page reload.
      refetch();
      return;
    }
    if (graded.status === "exhausted") {
      setStatus("exhausted");
      return;
    }
    setQuestionIndex((i) => i + 1);
    setAnswered(null);
    setGraded(null);
  }

  const shellStyle: React.CSSProperties = { justifyContent: "space-between" };

  if (status === "loading") {
    return (
      <MobileScreenShell style={shellStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60dvh" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>Loading quiz…</p>
        </div>
        <BottomNav active="learn" />
      </MobileScreenShell>
    );
  }

  if (status === "error" || status === "exhausted") {
    return (
      <MobileScreenShell style={shellStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", minHeight: "60dvh", padding: 20, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>{status === "exhausted"
              ? "Not quite. Let's run the verification quiz again."
              : (error ?? "Something went wrong.")}
          </p>
          <button
            type="button"
            onClick={restart}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-mobile)",
              background: "var(--surface-mobile)",
              color: "var(--text-mobile)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
        <BottomNav active="learn" />
      </MobileScreenShell>
    );
  }

  if (status === "mastered") {
    return (
      <MobileScreenShell style={shellStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "48px 24px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "var(--radius-pill)",
              background: "var(--green-mobile-bg)",
            }}
          >
            <ShieldCheck size={32} strokeWidth={2} color="var(--green-mobile)" aria-hidden="true" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-mobile)" }}>Module Mastered</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-mobile-muted)" }}>{moduleTitle}</p>
          </div>
          {isFinalModule ? (
            <>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--gold-mobile)" }}>
                All modules completed — start again
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(`/mobile/quiz?moduleId=1&moduleTitle=${encodeURIComponent(firstModule?.title ?? "Module 1")}`)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: "var(--gold-mobile)",
                  color: "var(--bg-mobile-dark)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Start Again
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </>
          ) : nextModule ? (
            <button
              type="button"
              onClick={() => router.push(`/mobile/quiz?moduleId=${nextModule.id}&moduleTitle=${encodeURIComponent(nextModule.title)}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: "var(--radius-pill)",
                border: "none",
                background: "var(--gold-mobile)",
                color: "var(--bg-mobile-dark)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Next Module
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Nice work — check back soon for more.</p>
          )}
          <button
            type="button"
            onClick={() => router.push("/mobile/learn")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-mobile-muted)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Back to Learn Hub
          </button>
        </div>
        <BottomNav active="learn" />
      </MobileScreenShell>
    );
  }

  const completedByThisAnswer = graded !== null && graded.status !== "active";

  return (
    <MobileScreenShell style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>{moduleTitle}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min((consecutiveCorrect / required) * 100, 100)}%`,
                  height: "100%",
                  background: "var(--gold-mobile)",
                  transition: "width 200ms ease",
                }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)", whiteSpace: "nowrap" }}>
              {consecutiveCorrect}/{required} in a row
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
            Get {required} correct in a row to master this module.
          </p>
        </div>

        {/* question card */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            key={questionIndex}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: 20,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <p style={{ margin: 0, fontSize: 16, lineHeight: "22px", fontWeight: 600, color: "var(--text-mobile)" }}>
              {currentQuestion?.prompt}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              {(["true", "false"] as const).map((choice) => {
                const isChosen = answered === choice;
                const revealCorrect = graded !== null && !isChosen && graded.correctAnswer === choice;
                const isCorrectChoice = isChosen && wasCorrect;
                const isWrongChoice = isChosen && wasCorrect === false;
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={answered !== null}
                    onClick={() => void handleAnswer(choice)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "16px 12px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${
                        isCorrectChoice || revealCorrect
                          ? "var(--green-mobile)"
                          : isWrongChoice
                            ? "var(--red-mobile)"
                            : "var(--border-mobile)"
                      }`,
                      background:
                        isCorrectChoice || revealCorrect
                          ? "var(--green-mobile-bg)"
                          : isWrongChoice
                            ? "var(--red-mobile)"
                            : "var(--surface-mobile-alt)",
                      color: isWrongChoice ? "var(--text-mobile)" : "var(--text-mobile)",
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      cursor: answered !== null ? "default" : "pointer",
                      opacity: answered !== null && !isChosen && !revealCorrect ? 0.5 : 1,
                    }}
                  >
                    {(isCorrectChoice || revealCorrect) && <CheckCircle2 size={18} strokeWidth={2} color="var(--green-mobile)" aria-hidden="true" />}
                    {isWrongChoice && <XCircle size={18} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />}
                    {choice}
                  </button>
                );
              })}
            </div>

            {answered !== null && !graded && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Checking…</p>
            )}

            {graded && (
              <div
                style={{
                  padding: 12,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-mobile-alt)",
                }}
              >
                <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--text-mobile-muted)" }}>
                  {graded.explanation}
                </p>
              </div>
            )}

            {graded && (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 20px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: "var(--gold-mobile)",
                  color: "var(--bg-mobile-dark)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {completedByThisAnswer ? (graded.status === "passed" ? "Finish quiz →" : "See result →") : "Next question →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <BottomNav active="learn" />
    </MobileScreenShell>
  );
}
