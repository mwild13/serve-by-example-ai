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
};

export default function ModuleVerify({ moduleId, userId, onArena }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attemptKey, setAttemptKey] = useState(0);

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

  async function handleQuizComplete(score: number) {
    if (score < PASS_THRESHOLD) {
      setStatus("retry");
      return;
    }

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
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: 8 }}>{moduleTitle}</h2>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--brand-green)" }}>
            ◆ Module Mastered
          </p>
          <p style={{ marginTop: 12, marginBottom: 24, color: "var(--text-soft)" }}>
            You can now enter the Arena to put this knowledge into practice.
          </p>
          {onArena && (
            <button
              className="btn btn-primary"
              onClick={onArena}
              style={{ fontSize: "1rem", padding: "12px 28px" }}
            >
              Enter the Arena →
            </button>
          )}
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
