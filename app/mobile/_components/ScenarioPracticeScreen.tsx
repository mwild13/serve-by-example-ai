"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileSession } from "../_lib/mobile-session-context";
import { SCENARIOS, SCORE_DIMENSIONS, type EvalResult, type Module } from "@/app/dashboard/_components/trainer/trainer-data";

// Phase 3 (v4-migration-plan/00-bug-batch-plan.md, item 7) — net-new
// Scenario Practice screen. Mirrors desktop's DashboardTrainer.tsx +
// ScenarioPractice.tsx + EvaluationResult.tsx: a free-text response to one
// of the legacy 3-module SCENARIOS bank (bartending/sales ×10, management
// ×20 — trainer-data.ts, not the 40-module Arena catalog), graded on the
// same 5-dimension rubric via the existing POST /api/evaluate route, then
// persisted via POST /api/training/save. Pills populate the textarea rather
// than a pick-2/pick-3 selector — same UX as desktop's applyPill(), just a
// single plain textarea instead of desktop's bubble/textarea toggle (that
// split is a desktop-only word-count nudge, not load-bearing UX).
//
// Confidence is hardcoded to "medium" — same as Arena's own save call
// (app/api/arena/evaluate/route.ts) — there is no confidence-picker UI here
// by design, matching the plan.

const MODULES: Module[] = ["bartending", "sales", "management"];

function isModule(value: string | null): value is Module {
  return value !== null && (MODULES as string[]).includes(value);
}

type Status = "answering" | "loading" | "result" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "failed";

export default function ScenarioPracticeScreen() {
  const session = useMobileSession();
  const searchParams = useSearchParams();

  // Named moduleName, not module — Next.js reserves the bare `module`
  // identifier (CommonJS interop) and eslint-plugin-next flags assigning it.
  const moduleName: Module = isModule(searchParams.get("module")) ? (searchParams.get("module") as Module) : "bartending";
  const scenarioCount = SCENARIOS[moduleName].length;
  const requestedIndex = Number(searchParams.get("index") ?? 0);
  const startIndex = Number.isFinite(requestedIndex)
    ? ((Math.trunc(requestedIndex) % scenarioCount) + scenarioCount) % scenarioCount
    : 0;

  const [index, setIndex] = useState(startIndex);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const scenario = SCENARIOS[moduleName][index];

  function applyPill(text: string) {
    setResponse(text);
  }

  // Persists one attempt via the mastery engine. Fire-and-forget in the
  // sense that it never blocks or changes the evaluation result already on
  // screen — but a failure (dropped network, timeout, non-2xx) is now
  // surfaced via saveStatus instead of swallowed in an empty .catch(), so a
  // user whose connection drops right after evaluating isn't silently
  // denied credit for the attempt with no way to know or retry.
  async function persistAttempt(overallScore: number, scenarioIndex: number) {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/training/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ module: moduleName, overallScore, scenarioIndex, confidence: "medium" }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("failed");
    }
  }

  async function handleSubmit() {
    const trimmed = response.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ scenario: scenario.text, userResponse: trimmed }),
      });

      if (res.status === 429) {
        setError("Too many requests. Try again in a minute.");
        setStatus("error");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Evaluation failed (${res.status})`);
      }

      const data = (await res.json()) as EvalResult;
      setResult(data);
      setStatus("result");

      // Same fire-and-forget shape as desktop's DashboardTrainer.handleSubmit
      // (the score is already on screen, this save doesn't block or change
      // what the user sees) — but persistAttempt tracks and surfaces failure
      // instead of discarding it.
      void persistAttempt(data.overallScore, index);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function goToScenario(nextIndex: number) {
    setIndex(((nextIndex % scenarioCount) + scenarioCount) % scenarioCount);
    setResponse("");
    setResult(null);
    setError(null);
    setStatus("answering");
    setSaveStatus("idle");
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

  const moduleLabel = moduleName === "bartending" ? "Bartending" : moduleName === "sales" ? "Sales" : "Management";

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>{moduleLabel} Practice</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-mobile-muted)" }}>
              Scenario {index + 1} of {scenarioCount}
            </p>
          </div>
        </div>

        {/* scenario card */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 16,
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: "var(--text-mobile)" }}>{scenario.text}</p>
          </div>
        </div>

        {/* key forces a full remount per scenario — same pattern desktop's
            DashboardTrainer.tsx uses (key={`${activeModule}-${scenarioIndex}`}
            on its trainer-panel). Without it, this subtree relies purely on
            goToScenario()'s manual state resets to reflect a new question;
            with it, React can't carry any stale DOM/state across an index
            change even if a future edit here adds child-local state. */}
        {status === "result" && result ? (
          <div key={`${moduleName}-${index}`} style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 20px 20px" }}>
            {/* save-failure notice — surfaces a dropped /api/training/save
                call instead of silently discarding it (persistAttempt above).
                Non-blocking: the score above is already final either way. */}
            {saveStatus === "failed" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--red-mobile)",
                }}
              >
                <AlertTriangle size={16} strokeWidth={2} color="var(--red-mobile)" aria-hidden="true" />
                <p style={{ flex: 1, margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                  This attempt didn&apos;t save to your progress. Check your connection.
                </p>
                <button
                  type="button"
                  onClick={() => void persistAttempt(result.overallScore, index)}
                  style={{
                    flexShrink: 0,
                    padding: "6px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--red-mobile)",
                    background: "none",
                    color: "var(--text-mobile)",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* score hero */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "4px 0" }}>
              <span style={{ fontFamily: "var(--font-heading, var(--font-body))", fontSize: 36, fontWeight: 700, color: "var(--gold-mobile)" }}>
                {result.overallScore}
              </span>
              <span style={{ fontSize: 14, color: "var(--text-mobile-muted)" }}>/25</span>
            </div>

            {/* dimension breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SCORE_DIMENSIONS.map(({ key, label }) => {
                const val = result[key] as number;
                const Icon = val >= 4 ? CheckCircle2 : val === 3 ? AlertTriangle : XCircle;
                const color = val >= 4 ? "var(--green-mobile)" : val === 3 ? "var(--gold-mobile)" : "var(--red-mobile)";
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-mobile)",
                      border: "1px solid var(--border-mobile)",
                    }}
                  >
                    <Icon size={16} strokeWidth={2} color={color} aria-hidden="true" />
                    <span style={{ flex: 1, fontSize: 13, color: "var(--text-mobile)" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}/5</span>
                  </div>
                );
              })}
            </div>

            {/* strengths / improvement */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 14,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                <strong style={{ color: "var(--text-mobile)" }}>What you did well: </strong>
                {result.strengths}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                <strong style={{ color: "var(--text-mobile)" }}>Room for improvement: </strong>
                {result.improvement}
              </p>
            </div>

            <button
              type="button"
              onClick={() => goToScenario(index + 1)}
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
              Next scenario
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div key={`${moduleName}-${index}`} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-mobile-muted)" }}>
              CHOOSE AN APPROACH, OR WRITE YOUR OWN
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {scenario.pills.map((pill) => (
                <button
                  key={pill.text}
                  type="button"
                  disabled={status === "loading"}
                  onClick={() => applyPill(pill.text)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-pill)",
                    background: response === pill.text ? "var(--gold-mobile)" : "var(--gold-mobile-bg)",
                    border: `1px solid ${pill.positive ? "var(--gold-mobile)" : "var(--red-mobile)"}`,
                    color: response === pill.text ? "var(--bg-mobile-dark)" : "var(--gold-mobile)",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: status === "loading" ? "default" : "pointer",
                    textAlign: "left",
                  }}
                >
                  {pill.intent}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Write your response…"
              value={response}
              disabled={status === "loading"}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
              style={{
                padding: 14,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
                color: "var(--text-mobile)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                lineHeight: "19px",
                resize: "vertical",
              }}
            />

            {error && <p style={{ margin: 0, fontSize: 12, color: "var(--red-mobile)" }}>{error}</p>}

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "loading" || !response.trim()}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: "var(--gold-mobile)",
                  color: "var(--bg-mobile-dark)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: status === "loading" || !response.trim() ? "default" : "pointer",
                  opacity: status === "loading" || !response.trim() ? 0.6 : 1,
                }}
              >
                {status === "loading" ? "Evaluating…" : "Check my response"}
              </button>
              <button
                type="button"
                onClick={() => goToScenario(index + 1)}
                disabled={status === "loading"}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-mobile-muted)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: status === "loading" ? "default" : "pointer",
                }}
              >
                Skip →
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav active="learn" />
    </div>
  );
}
