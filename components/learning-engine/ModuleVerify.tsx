"use client";

import { useEffect, useState } from "react";
import RapidFireQuiz from "@/components/learning-engine/RapidFireQuiz";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { VERIFY_QUESTIONS } from "@/lib/verify-questions";

const PASS_THRESHOLD = 4; // out of 5 consecutive correct
const MIN_QUIZ_SCENARIOS = 5;

const MODULE_TITLES: Record<number, string> = {
  1: "Pouring the Perfect Beer",
  2: "Wine Knowledge & Service",
  3: "Cocktail Fundamentals",
  4: "Coffee/Barista Basics",
  5: "Carrying Glassware & Trays",
  6: "Cleaning & Sanitation",
  7: "Bar Back Efficiency",
  8: "The Art of the Greeting",
  9: "Managing Table Dynamics",
  10: "Anticipatory Service",
  11: "Handling Guest Complaints",
  12: "Up-selling & Suggestive Sales",
  13: "VIP/Table Management",
  14: "Phone Etiquette & Reservations",
  15: "RSA (Responsible Service of Alcohol)",
  16: "Food Safety & Hygiene",
  17: "Conflict De-escalation",
  18: "Emergency Evacuation Protocols",
  19: "Opening & Closing Procedures",
  20: "Inventory & Waste Control",
  21: 'The "Behind!" Rule: Spatial Awareness & Safety',
  22: 'The "Glass in Well" Emergency: The Burn Protocol',
  23: "The Swivel Head: Identifying Needs from 10 Meters",
  24: "Ice is Food: The Sacred Rules of the Scoop",
  25: "The Allergy Shield: Communicating Dietary Danger",
  26: "The Soda Gun: Muscle Memory & Troubleshooting",
  27: "Economy of Motion: Two Hands, One Flow",
  28: "The Mid-Shift Reload: Mise en Place Maintenance",
  29: "Deciphering the Docket: From Printer to Plate",
  30: 'Taming "The Weed": Mental Fortitude Under Pressure',
  31: "The 30ml Truth: Precision vs. Profit",
  32: "The Waiter's Friend: Mechanical Wine Mastery",
  33: "The Cellar Sprint: Kegs, Gas, and Gurgles",
  34: "Glassware Geometry: Weight, Balance, and Grip",
  35: "The Golden Standard Close: Cleaning for Tomorrow",
  36: "The Two-Minute Check: The Critical Window",
  37: 'The Pivot: Dealing with "No" and "Out of Stock"',
  38: "The Dead Soldier: Clearing & Resetting the Battlefield",
  39: "Bar-Back Synergy: The Lifeblood of the Front",
  40: "The Natural Upsell: Suggesting, Not Pushing",
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

export default function ModuleVerify({ moduleId, userId, onArena, onComplete, nextModuleId }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attemptKey, setAttemptKey] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const questions = VERIFY_QUESTIONS[moduleId] ?? [];

    if (questions.length < MIN_QUIZ_SCENARIOS) {
      setError(
        "This module does not yet have enough verification questions. Please check back soon.",
      );
      setStatus("error");
      return;
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

    setModuleTitle(MODULE_TITLES[moduleId] ?? `Module ${moduleId}`);
    setScenarios(mapped);
    setStatus("ready");
  }, [moduleId]);

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
              <button onClick={onArena}>Enter the Arena</button>
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
            Not quite — let&apos;s run the verification quiz again.
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
        <h1 className="stage-title">Verify</h1>
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
