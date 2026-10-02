"use client";

import { useCallback, useEffect, useState } from "react";
import RapidFireQuiz from "@/app/dashboard/_components/RapidFireQuiz";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  startVerifyQuiz,
  submitVerifyAnswer,
  type VerifyQuizStart,
} from "@/lib/verify-quiz-client";

// Shortened 2026-08-24 (docs/Module-Title-Renames-Proposal.md) — 2-3 word
// titles so the Learn Hub's 2-column module grid and the Practice &
// Scenarios single-line tiles both fit without truncation.
const MODULE_TITLES: Record<number, string> = {
  1: "Beer Pouring",
  2: "Wine Service",
  3: "Cocktail Fundamentals",
  4: "Barista Basics",
  5: "Tray Carrying",
  6: "Sanitation Basics",
  7: "Bar-Back Efficiency",
  8: "The Greeting",
  9: "Table Dynamics",
  10: "Anticipatory Service",
  11: "Guest Complaints",
  12: "Suggestive Selling",
  13: "VIP Management",
  14: "Phone Etiquette",
  15: "RSA Compliance",
  16: "Food Safety",
  17: "Conflict De-escalation",
  18: "Evacuation Protocols",
  19: "Opening & Closing",
  20: "Inventory Control",
  21: "Call Behind",
  22: "Ice Well Burn",
  23: "The Swivel Head",
  24: "Ice Is Food",
  25: "Allergy Shield",
  26: "Soda Gun Speed",
  27: "Two-Handed Flow",
  28: "Mid-Shift Reset",
  29: "Docket Reading",
  30: "Beating the Weed",
  31: "Jigger Precision",
  32: "Wine Opener Mastery",
  33: "Cellar & Kegs",
  34: "Tray & Glass Grip",
  35: "The Clean Close",
  36: "Two-Minute Check",
  37: "The Out-of-Stock Pivot",
  38: "Clearing Dead Soldiers",
  39: "Bar-Back Synergy",
  40: "Natural Upselling",
};

type Status = "loading" | "ready" | "error" | "mastered" | "retry";

type Props = {
  moduleId: number;
  onArena?: () => void;
  onComplete?: () => void;
  nextModuleId?: number;
};

async function accessToken(): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Session expired. Please sign in again.");
  return session.access_token;
}

// The quiz is graded on the server (lib/verify-quiz.ts): this starts a run,
// RapidFireQuiz sends each answer, and the server records mastery itself
// when the streak is reached — there is no separate "save" step.
export default function ModuleVerify({ moduleId, onArena, onComplete, nextModuleId }: Props) {
  const moduleTitle = MODULE_TITLES[moduleId] ?? `Module ${moduleId}`;
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<VerifyQuizStart | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  // Bumped by "Start again" to start a fresh run.
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function begin() {
      try {
        const started = await startVerifyQuiz(await accessToken(), moduleId);
        if (cancelled) return;
        setQuiz(started);
        setStatus("ready");
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
  }, [moduleId, runKey]);

  function restart() {
    setStatus("loading");
    setError(null);
    setRunKey((k) => k + 1);
  }

  const handleAnswer = useCallback(
    async (position: number, answer: "true" | "false") => {
      if (!quiz) throw new Error("The quiz hasn't started.");
      return submitVerifyAnswer(await accessToken(), quiz.attemptId, position, answer);
    },
    [quiz],
  );

  const handleQuizComplete = useCallback((passed: boolean, streak: number) => {
    setFinalScore(streak);
    setStatus(passed ? "mastered" : "retry");
  }, []);

  const handleQuizError = useCallback((message: string) => {
    setError(message);
    setStatus("error");
  }, []);

  if (status === "loading") {
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <div className="spinner" style={{ marginBottom: "16px" }} />
          <p>Loading module…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="stage-container">
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--text-soft)",
          }}
        >
          <p style={{ marginBottom: 16 }}>{error ?? "Something went wrong."}</p>
          <button className="btn btn-primary" onClick={restart}>
            Start again
          </button>
        </div>
      </div>
    );
  }

  if (status === "mastered") {
    const nextTitle = nextModuleId ? (MODULE_TITLES[nextModuleId] ?? `Module ${nextModuleId}`) : null;
    return (
      <div className="stage-container">
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <span className="module-mastered-check">✓</span>
          <h2 style={{ marginBottom: 4 }}>
            {nextTitle ? "Module Mastered" : "All Modules Complete!"}
          </h2>
          <p style={{ color: "var(--text-soft)", marginBottom: 0, fontSize: "0.9rem" }}>{moduleTitle}</p>
          <span className="module-mastered-score">{finalScore} in a row</span>

          {nextTitle && onComplete && (
            <div className="module-mastered-next-card">
              <span className="module-mastered-next-label">Next up</span>
              <span className="module-mastered-next-title">{nextTitle}</span>
              <button
                className="btn btn-primary"
                onClick={onComplete}
                style={{ width: "100%", fontSize: "0.95rem", padding: "11px 20px" }}
              >
                Start Next Module →
              </button>
            </div>
          )}

          <div className="module-mastered-links">
            {onArena && (
              <button onClick={onArena}>Enter AI Scenarios</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === "retry") {
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: 8 }}>{moduleTitle}</h2>
          <p style={{ marginBottom: 16 }}>
            Not quite. Let&apos;s run the verification quiz again.
          </p>
          <button className="btn btn-primary" onClick={restart}>
            Retry verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2 style={{ marginBottom: 8 }}>{moduleTitle}</h2>
        <p className="stage-subtitle">
          Get {quiz?.required ?? 5} correct in a row to master this module.
        </p>
      </div>

      {quiz && (
        <RapidFireQuiz
          key={quiz.attemptId}
          questions={quiz.questions}
          required={quiz.required}
          onAnswer={handleAnswer}
          onComplete={handleQuizComplete}
          onError={handleQuizError}
        />
      )}
    </div>
  );
}
