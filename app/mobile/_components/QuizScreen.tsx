"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import BottomNav from "./BottomNav";
import MobileScreenShell from "./MobileScreenShell";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import QuizRun from "@/components/quiz/QuizRun";
import {
  quizGoalText,
  startVerifyQuiz,
  submitVerifyAnswer,
  type QuizAnswer,
  type VerifyQuizStart,
} from "@/lib/verify-quiz-client";

// Phase 3 (v4-migration-plan/00-bug-batch-plan.md, item 6) — Quiz screen.
// LearnHubScreen's module cards land here first, matching desktop's order
// (Quiz gates a module, Arena is a separate later system).
//
// Same run as desktop's ModuleVerify, through the shared QuizRun component:
// the server sends one question at a time, grades every answer and decides
// when the run passes (lib/verify-quiz.ts). Mastery is recorded by the answer
// that passes the run; there's no separate save call.

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
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  // Bumped by "Try again" to start a fresh run.
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function begin() {
      try {
        const started = await startVerifyQuiz(session.token, moduleId);
        if (cancelled) return;
        setQuiz(started);
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

  const handleAnswer = useCallback(
    (position: number, answer: QuizAnswer) => {
      if (!quiz) return Promise.reject(new Error("The quiz hasn't started."));
      return submitVerifyAnswer(session.token, quiz.attemptId, position, answer);
    },
    [quiz, session.token],
  );

  const handleFinish = useCallback(
    (passed: boolean) => {
      if (passed) {
        setStatus("mastered");
        // Perf fix (Phase 1a): shared TrainingProgressProvider no longer
        // refetches on every screen mount, so a new mastery must explicitly
        // refresh it — otherwise Home/Learn/Me would keep showing pre-quiz
        // progress until a full page reload.
        refetch();
      } else {
        setStatus("exhausted");
      }
    },
    [refetch],
  );

  const handleError = useCallback((message: string) => {
    setError(message);
    setStatus("error");
  }, []);

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
              ? "Not this time. Each run asks different questions, so have another go."
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
                All modules completed. Start again
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
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Nice work. Check back soon for more.</p>
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

  return (
    <MobileScreenShell style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "20px 20px 12px" }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>{moduleTitle}</p>
          {quiz && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>{quizGoalText(quiz.goal)}</p>
          )}
        </div>
        {quiz && (
          <QuizRun
            key={quiz.attemptId}
            start={quiz}
            submit={handleAnswer}
            onFinish={handleFinish}
            onError={handleError}
            theme="dark"
          />
        )}
      </div>

      <BottomNav active="learn" />
    </MobileScreenShell>
  );
}
