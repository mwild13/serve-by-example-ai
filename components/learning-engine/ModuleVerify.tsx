"use client";

/**
 * ModuleVerify — V3 binary mastery component.
 *
 * Replaces the legacy 4-stage StageLearning flow. One responsibility:
 * fetch quiz scenarios for `moduleId` from Supabase, render the
 * RapidFireQuiz, and on a passing run flip `is_mastered = true` for
 * the (userId, moduleId) pair via /api/training/save.
 *
 * See docs/v3-architecture.md for the V3 pipeline.
 */

import { useEffect, useState } from "react";
import RapidFireQuiz from "@/components/learning-engine/RapidFireQuiz";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const PASS_THRESHOLD = 4; // out of 5 consecutive correct
const MIN_QUIZ_SCENARIOS = 5;

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
};

export default function ModuleVerify({ moduleId, userId }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attemptKey, setAttemptKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          if (!cancelled) {
            setError("You must be signed in to start training.");
            setStatus("error");
          }
          return;
        }
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [moduleRes, scenariosRes] = await Promise.all([
          fetch(`/api/training/modules/${moduleId}`, { headers }),
          fetch(`/api/training/modules/${moduleId}/scenarios`, { headers }),
        ]);

        if (!moduleRes.ok) {
          throw new Error(`Failed to load module ${moduleId} (${moduleRes.status}).`);
        }
        if (!scenariosRes.ok) {
          throw new Error(`Failed to load scenarios for module ${moduleId} (${scenariosRes.status}).`);
        }

        const moduleData = await moduleRes.json();
        const scenariosData = await scenariosRes.json();
        const all: Scenario[] = scenariosData.scenarios ?? [];

        const quizOnly = all.filter((s) => {
          if (s.scenario_type !== "quiz") return false;
          const ans = String((s.content as { answer?: unknown })?.answer ?? "")
            .toLowerCase()
            .trim();
          return ans === "true" || ans === "false";
        });

        if (cancelled) return;

        if (quizOnly.length < MIN_QUIZ_SCENARIOS) {
          setError(
            "This module does not yet have enough verification questions. Please check back soon.",
          );
          setStatus("error");
          return;
        }

        setModuleTitle(moduleData.title ?? "Training Module");
        setScenarios(quizOnly);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("ModuleVerify load failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load module.");
        setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
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
          <p style={{ marginTop: 12, color: "var(--text-soft)" }}>
            You can now enter the Arena to put this knowledge into practice.
          </p>
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
