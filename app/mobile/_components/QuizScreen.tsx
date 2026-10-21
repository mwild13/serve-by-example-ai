"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Screen from "./ui/Screen";
import { ButtonLink } from "./ui/parts";
import { moduleHref } from "@/lib/home-feed";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import LearnCards from "@/components/quiz/LearnCards";
import QuizRun from "@/components/quiz/QuizRun";
import { loadLearnCards, type LearnCard } from "@/lib/learn-cards";
import {
  quizGoalText,
  startVerifyQuiz,
  submitVerifyAnswer,
  type QuizAnswer,
  type VerifyQuizStart,
} from "@/lib/verify-quiz-client";

// Phase 3 (docs/zHistorical/v4-migration-plan/00-bug-batch-plan.md, item 6) — Quiz screen.
// LearnHubScreen's module cards land here first, matching desktop's order
// (Quiz gates a module, Arena is a separate later system).
//
// Same run as desktop's ModuleVerify, through the shared QuizRun component:
// the server sends one question at a time, grades every answer and decides
// when the run passes (lib/verify-quiz.ts). Mastery is recorded by the answer
// that passes the run; there's no separate save call. The module's Learn
// cards, if it has any, come first.

type Status = "loading" | "playing" | "mastered" | "exhausted" | "error";

export default function QuizScreen() {
  const session = useMobileSession();
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
  // Kept with their module id: "Next Module" changes moduleId without
  // remounting this screen, so cards for the old module must not count.
  const [cardSet, setCardSet] = useState<{ moduleId: number; cards: LearnCard[] } | null>(null);
  const [cardsDoneFor, setCardsDoneFor] = useState<number | null>(null);
  // A test-out: a short, hard run that masters the module straight away.
  const [testOut, setTestOut] = useState(false);
  const cards = cardSet?.moduleId === moduleId ? cardSet.cards : null;
  const showCards = cards !== null && cards.length > 0 && cardsDoneFor !== moduleId;
  // The run only starts once the cards are done, so it can't expire while they're read.
  const quizReady = cards !== null && !showCards;

  useEffect(() => {
    let cancelled = false;
    loadLearnCards(moduleId)
      .catch(() => [])
      .then((list) => {
        if (!cancelled) setCardSet({ moduleId, cards: list });
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  useEffect(() => {
    if (!quizReady) return;
    let cancelled = false;
    async function begin() {
      try {
        const started = await startVerifyQuiz(session.token, moduleId, testOut);
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
  }, [session.token, moduleId, runKey, quizReady, testOut]);

  function restart() {
    setStatus("loading");
    setError(null);
    setTestOut(false);
    setRunKey((k) => k + 1);
  }

  function finishCards() {
    setStatus("loading");
    setTestOut(false);
    setCardsDoneFor(moduleId);
  }

  function startTestOut() {
    setStatus("loading");
    setTestOut(true);
    setCardsDoneFor(moduleId);
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

  const back = { href: "/mobile/learn", label: "Learn" };

  if (showCards) {
    return (
      <Screen title={moduleTitle} back={back} tab="learn">
        <div className="sm-quiz">
          <p className="sm-quiz-sub">Read these first. The quiz is on the same rules.</p>
          <LearnCards cards={cards} onDone={finishCards} onTestOut={startTestOut} theme="dark" />
        </div>
      </Screen>
    );
  }

  if (status === "loading" || !quizReady) {
    return (
      <Screen title={moduleTitle} back={back} tab="learn">
        <div className="sm-quiz">
          <div className="sm-skel" style={{ height: 320, borderRadius: 22 }} aria-label="Loading the quiz" />
        </div>
      </Screen>
    );
  }

  if (status === "error" || status === "exhausted") {
    return (
      <Screen title={moduleTitle} back={back} tab="learn">
        <div className="sm-quiz">
          <div className="sm-card sm-quiz-end">
            <h2 className="sm-quiz-end-title">{status === "exhausted" ? "Not this time" : "Something went wrong"}</h2>
            <p className="sm-quiz-end-text">
              {status === "exhausted"
                ? testOut
                  ? "Take the full quiz instead: it's a little longer and gives you more room."
                  : "Each run asks different questions, so have another go."
                : (error ?? "Something went wrong.")}
            </p>
            <button type="button" className="sm-btn sm-btn--primary sm-btn--block" onClick={restart}>
              {status === "exhausted" && testOut ? "Take the full quiz" : "Try again"}
            </button>
            {status === "exhausted" && cards && cards.length > 0 && (
              <button
                type="button"
                className="sm-btn sm-btn--text sm-btn--block"
                onClick={() => {
                  setTestOut(false);
                  setCardsDoneFor(null);
                }}
              >
                Read the cards again
              </button>
            )}
          </div>
        </div>
      </Screen>
    );
  }

  if (status === "mastered") {
    return (
      <Screen title={moduleTitle} back={back} tab="learn">
        <div className="sm-quiz">
          <div className="sm-card sm-quiz-end sm-quiz-end--done">
            <span className="sm-quiz-badge" aria-hidden="true">
              <ShieldCheck size={30} strokeWidth={2.2} />
            </span>
            <p className="sm-kicker">Module mastered</p>
            <h2 className="sm-quiz-end-title">{moduleTitle}</h2>
            {isFinalModule ? (
              <>
                <p className="sm-quiz-end-text">That&apos;s every module. Start again from the first to keep it sharp.</p>
                <ButtonLink href={moduleHref({ id: 1, title: firstModule?.title ?? "Module 1" })} variant="primary">
                  Start again
                  <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
                </ButtonLink>
              </>
            ) : nextModule ? (
              <>
                <p className="sm-quiz-end-text">Next up: {nextModule.title}.</p>
                <ButtonLink href={moduleHref(nextModule)} variant="primary">
                  Next module
                  <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
                </ButtonLink>
              </>
            ) : (
              <p className="sm-quiz-end-text">Nice work. Check back soon for more.</p>
            )}
            <Link href="/mobile/learn" className="sm-btn sm-btn--text sm-btn--block">
              Back to Learn
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title={moduleTitle} back={back} tab="learn">
      <div className="sm-quiz">
        {quiz && <p className="sm-quiz-sub">{quizGoalText(quiz.goal)}</p>}
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
    </Screen>
  );
}
