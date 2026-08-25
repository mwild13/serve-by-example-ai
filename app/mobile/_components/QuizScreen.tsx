"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { VERIFY_QUESTIONS } from "@/lib/verify-questions";

// Phase 3 (v4-migration-plan/00-bug-batch-plan.md, item 6) — net-new Quiz
// screen. LearnHubScreen's module cards used to route straight into Arena;
// they now land here first, matching desktop's real order (Quiz gates a
// module, Arena is a separate later system).
//
// Mirrors desktop's ModuleVerify.tsx + RapidFireQuiz.tsx exactly rather than
// the v4 plan doc's own summary of them ("5 questions, 4/5 threshold") —
// that summary doesn't match the live component: RapidFireQuiz shuffles the
// module's *entire* VERIFY_QUESTIONS bank (currently 8 True/False questions
// per module, not 5) into 3 non-repeating rounds and keeps asking until the
// user lands CONSECUTIVE_REQUIRED (5) correct answers *in a row* — a wrong
// answer resets the streak to 0 but does not end the quiz. Porting the real
// mechanic (not the doc's simplification) keeps the `answers` payload this
// screen submits identical in shape and meaning to what ModuleVerify already
// sends, since app/api/training/save's verifyPassed branch re-validates
// every answer id/value against VERIFY_QUESTIONS itself — it doesn't trust
// the client's streak count, so the two clients must agree on what an
// "answer" is.

const CONSECUTIVE_REQUIRED = 5;
const PASS_THRESHOLD = 4; // matches VERIFY_PASS_THRESHOLD in app/api/training/save/route.ts

type AnswerEntry = { id: string; answer: "true" | "false" };
type PoolQuestion = { prompt: string; answer: "true" | "false"; explanation: string; index: number };
type Status = "playing" | "saving" | "mastered" | "error";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildPool(moduleId: number): PoolQuestion[] {
  const questions = VERIFY_QUESTIONS[moduleId] ?? [];
  if (questions.length === 0) return [];
  const indexed = questions.map((q, i) => ({ ...q, index: i }));
  // 3 shuffled rounds so the pool never runs out mid-session — same
  // approach as RapidFireQuiz's questionPool, minus its round-boundary
  // same-question swap (a cosmetic nicety, not load-bearing for scoring).
  return [...shuffle(indexed), ...shuffle(indexed), ...shuffle(indexed)];
}

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

  const [attemptKey, setAttemptKey] = useState(0);
  // attemptKey isn't read inside buildPool — it's a deliberate cache-buster
  // so handleRetry's setAttemptKey forces a fresh shuffle (buildPool is
  // otherwise pure over moduleId alone, so eslint can't see why it's a dep).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pool = useMemo(() => buildPool(moduleId), [moduleId, attemptKey]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [answered, setAnswered] = useState<"true" | "false" | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status>("playing");
  const [error, setError] = useState<string | null>(null);
  // Ref (not state) — mirrors RapidFireQuiz's streakAnswersRef, avoiding a
  // stale closure inside handleAnswer/finishQuiz. Only the last 5 correct
  // answers ever need to be sent — that's exactly what a passing streak is.
  const streakAnswers = useRef<AnswerEntry[]>([]);

  const currentQuestion = pool[questionIndex] ?? pool[pool.length - 1];

  function handleAnswer(choice: "true" | "false") {
    if (answered !== null || !currentQuestion) return;
    const correct = choice === currentQuestion.answer;
    setAnswered(choice);
    setWasCorrect(correct);

    if (correct) {
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      streakAnswers.current = [
        ...streakAnswers.current,
        { id: `${moduleId}-${currentQuestion.index}`, answer: choice },
      ].slice(-CONSECUTIVE_REQUIRED);
    } else {
      setConsecutiveCorrect(0);
      streakAnswers.current = [];
    }
  }

  async function finishQuiz() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/training/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          moduleId,
          verifyPassed: true,
          answers: streakAnswers.current,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        // Defensive parity with ModuleVerify's own dead "score < threshold"
        // branch — can't happen honestly (completion requires a streak of 5,
        // above the server's 4-correct threshold) but the server re-checks
        // every answer itself, so a stale/tampered payload still fails here.
        throw new Error(body?.error ?? `Save failed (${res.status})`);
      }

      setStatus("mastered");
      // Perf fix (Phase 1a): shared TrainingProgressProvider no longer
      // refetches on every screen mount, so a successful save must
      // explicitly refresh it — otherwise Home/Learn/Me would keep showing
      // pre-quiz progress until a full page reload.
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record mastery.");
      setStatus("error");
    }
  }

  function handleNext() {
    if (consecutiveCorrect >= CONSECUTIVE_REQUIRED) {
      void finishQuiz();
      return;
    }
    setQuestionIndex((i) => i + 1);
    setAnswered(null);
    setWasCorrect(null);
  }

  function handleRetry() {
    setAttemptKey((k) => k + 1);
    setQuestionIndex(0);
    setConsecutiveCorrect(0);
    setAnswered(null);
    setWasCorrect(null);
    setError(null);
    streakAnswers.current = [];
    setStatus("playing");
  }

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

  if (pool.length === 0) {
    return (
      <div style={shellStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60dvh", padding: 20, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
            This module doesn&apos;t have verification questions yet. Please check back soon.
          </p>
        </div>
        <BottomNav active="learn" />
      </div>
    );
  }

  if (status === "saving") {
    return (
      <div style={shellStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60dvh" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>Recording your mastery…</p>
        </div>
        <BottomNav active="learn" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={shellStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", minHeight: "60dvh", padding: 20, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>{error ?? "Something went wrong."}</p>
          <button
            type="button"
            onClick={handleRetry}
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
      </div>
    );
  }

  if (status === "mastered") {
    return (
      <div style={shellStyle}>
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
      </div>
    );
  }

  const completedByThisAnswer = wasCorrect === true && consecutiveCorrect >= CONSECUTIVE_REQUIRED;

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>{moduleTitle}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min((consecutiveCorrect / CONSECUTIVE_REQUIRED) * 100, 100)}%`,
                  height: "100%",
                  background: "var(--gold-mobile)",
                  transition: "width 200ms ease",
                }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)", whiteSpace: "nowrap" }}>
              {consecutiveCorrect}/{CONSECUTIVE_REQUIRED} in a row
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
            Get {PASS_THRESHOLD}+ correct in a row to master this module.
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
                const revealCorrect = answered !== null && !isChosen && currentQuestion?.answer === choice;
                const isCorrectChoice = isChosen && wasCorrect;
                const isWrongChoice = isChosen && wasCorrect === false;
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={answered !== null}
                    onClick={() => handleAnswer(choice)}
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

            {answered !== null && (
              <div
                style={{
                  padding: 12,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-mobile-alt)",
                }}
              >
                <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--text-mobile-muted)" }}>
                  {currentQuestion?.explanation}
                </p>
              </div>
            )}

            {answered !== null && (
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
                {completedByThisAnswer ? "Finish quiz →" : "Next question →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <BottomNav active="learn" />
    </div>
  );
}
