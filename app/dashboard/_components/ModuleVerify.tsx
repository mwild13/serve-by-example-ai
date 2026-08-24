"use client";

import { useState } from "react";
import RapidFireQuiz from "@/app/dashboard/_components/RapidFireQuiz";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { VERIFY_QUESTIONS } from "@/lib/verify-questions";

const PASS_THRESHOLD = 4; // out of 5 consecutive correct
const MIN_QUIZ_SCENARIOS = 5;

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

type Scenario = {
  id: string;
  module_id: number;
  scenario_index: number;
  scenario_type: string;
  prompt: string;
  content: Record<string, unknown>;
  difficulty: number;
};

type Status = "loading" | "ready" | "error" | "mastered" | "retry" | "saving";

type Props = {
  moduleId: number;
  userId: string;
  onArena?: () => void;
  onComplete?: () => void;
  nextModuleId?: number;
};

// Pure derivation from moduleId — both call sites key ModuleVerify by
// moduleId, so a fresh instance (and fresh initial state below) is mounted
// whenever it changes; no effect is needed to "reset" on prop change.
function buildInitialVerifyState(moduleId: number): { scenarios: Scenario[]; status: Status; error: string | null } {
  const questions = VERIFY_QUESTIONS[moduleId] ?? [];

  if (questions.length < MIN_QUIZ_SCENARIOS) {
    return {
      scenarios: [],
      status: "error",
      error: "This module does not yet have enough verification questions. Please check back soon.",
    };
  }

  const mapped: Scenario[] = questions.map((q, i) => ({
    id: `${moduleId}-${i}`,
    module_id: moduleId,
    scenario_index: i,
    scenario_type: "quiz",
    prompt: q.prompt,
    content: {
      question: q.prompt,
      answer: q.answer,
      explanation: q.explanation,
      option_type: "truefalse",
    },
    difficulty: 2,
  }));

  return { scenarios: mapped, status: "ready", error: null };
}

export default function ModuleVerify({ moduleId, userId, onArena, onComplete, nextModuleId }: Props) {
  const [initialState] = useState(() => buildInitialVerifyState(moduleId));
  const [scenarios] = useState<Scenario[]>(initialState.scenarios);
  const [moduleTitle] = useState<string>(() => MODULE_TITLES[moduleId] ?? `Module ${moduleId}`);
  const [status, setStatus] = useState<Status>(initialState.status);
  const [error, setError] = useState<string | null>(initialState.error);
  const [attemptKey, setAttemptKey] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  async function handleQuizComplete(score: number, answers: Array<{id: string; answer: string}>) {
    if (score < PASS_THRESHOLD) {
      setStatus("retry");
      return;
    }

    setFinalScore(score);
    setStatus("saving");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Session expired. Please sign in again.");
        setStatus("error");
        return;
      }

      const res = await fetch("/api/training/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          moduleId,
          userId,
          verifyPassed: true,
          consecutiveCorrect: score,
          answers,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? `Save failed (${res.status}).`);
      }

      setStatus("mastered");
    } catch (err) {
      console.error("Mastery save failed:", err);
      setError(err instanceof Error ? err.message : "Failed to record mastery.");
      setStatus("error");
    }
  }

  function handleRetry() {
    setAttemptKey((k) => k + 1);
    setStatus("ready");
  }

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
          <p>{error ?? "Something went wrong."}</p>
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
          <span className="module-mastered-score">{finalScore} / 5 correct</span>

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
          <button className="btn btn-primary" onClick={handleRetry}>
            Retry verification
          </button>
        </div>
      </div>
    );
  }

  if (status === "saving") {
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <div className="spinner" style={{ marginBottom: "16px" }} />
          <p>Recording your mastery…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2 style={{ marginBottom: 8 }}>{moduleTitle}</h2>
        <p className="stage-subtitle">
          Get {PASS_THRESHOLD} of 5 consecutive correct to master this module.
        </p>
      </div>

      <RapidFireQuiz
        key={`verify-${moduleId}-${attemptKey}`}
        scenarios={scenarios}
        moduleId={moduleId}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
