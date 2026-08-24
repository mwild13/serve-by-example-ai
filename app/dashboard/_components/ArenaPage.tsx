"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import SharedTrainingCard from "@/app/dashboard/_components/common/SharedTrainingCard";
import { ARENA_SEED_SCENARIOS, formatArenaScenario } from "@/lib/arena-scenarios";

type AssessmentResult = {
  score: number;
  what_you_did_well: string;
  room_for_improvement: string;
  passed: boolean;
};

type ArenaProgressEntry = { attempts: number; bestScore: number; passed: boolean };

type Props = { userId: string };

// Shortened 2026-08-24 (docs/Module-Title-Renames-Proposal.md) — 2-3 word
// titles so the Learn Hub's 2-column module grid and the Practice &
// Scenarios single-line tiles both fit without truncation.
const MODULE_META: Record<number, { title: string; category: "technical" | "service" | "compliance" }> = {
  1:  { title: "Beer Pouring",       category: "technical"   },
  2:  { title: "Wine Service",       category: "technical"   },
  3:  { title: "Cocktail Fundamentals", category: "technical"   },
  4:  { title: "Barista Basics",     category: "technical"   },
  5:  { title: "Tray Carrying",      category: "technical"   },
  6:  { title: "Sanitation Basics",  category: "technical"   },
  7:  { title: "Bar-Back Efficiency", category: "technical"   },
  8:  { title: "The Greeting",       category: "service"     },
  9:  { title: "Table Dynamics",     category: "service"     },
  10: { title: "Anticipatory Service", category: "service"     },
  11: { title: "Guest Complaints",   category: "service"     },
  12: { title: "Suggestive Selling", category: "service"     },
  13: { title: "VIP Management",     category: "service"     },
  14: { title: "Phone Etiquette",    category: "service"     },
  15: { title: "RSA Compliance",     category: "compliance"  },
  16: { title: "Food Safety",        category: "compliance"  },
  17: { title: "Conflict De-escalation", category: "compliance"  },
  18: { title: "Evacuation Protocols", category: "compliance"  },
  19: { title: "Opening & Closing",  category: "compliance"  },
  20: { title: "Inventory Control",  category: "compliance"  },
};

const CATEGORY_ACCENT: Record<"technical" | "service" | "compliance", string> = {
  technical:  "var(--color-mastery-technical)",
  service:    "var(--color-mastery-service)",
  compliance: "var(--color-mastery-compliance)",
};

export default function ArenaPage({ userId: _userId }: Props) {
  const [phase, setPhase] = useState<"select" | "writing" | "result">("select");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [arenaProgress, setArenaProgress] = useState<Record<number, ArenaProgressEntry>>({});

  useEffect(() => {
    async function loadProgress() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch("/api/training/progress", {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        const d = await r.json() as Record<string, unknown>;
        if (d.arenaProgress) setArenaProgress(d.arenaProgress as Record<number, ArenaProgressEntry>);
      } catch { /* non-critical */ }
    }
    void loadProgress();
  }, []);

  async function authHeaders(): Promise<Record<string, string>> {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    return headers;
  }

  function selectModule(moduleId: number) {
    setSelectedId(moduleId);
    setResponse("");
    setError(null);
    setResult(null);
    setPhase("writing");
  }

  async function submitResponse() {
    if (!response.trim() || !selectedId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Boundary guard (2026-08-19): this was a non-null assertion, so a
      // module id with no seed content reached formatArenaScenario() as
      // undefined and threw a raw TypeError. Every other call site in the
      // app (mobile's LearnHubScreen/ScenarioTrainingScreen, and the writing
      // phase's own `{seed && ...}` render below) already treats this lookup
      // as one that can miss — this one didn't.
      const seed = ARENA_SEED_SCENARIOS[selectedId];
      if (!seed) {
        setError("No scenario is available for this module yet.");
        return;
      }
      const scenario = formatArenaScenario(seed);
      const headers = await authHeaders();
      const res = await fetch("/api/arena/evaluate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "evaluate",
          moduleId: selectedId,
          moduleTitle: MODULE_META[selectedId]?.title,
          scenario,
          response: response.trim(),
        }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) throw new Error((data.error as string | undefined) ?? `Request failed (${res.status})`);
      const assessment = data.assessment as AssessmentResult;
      setArenaProgress(prev => ({
        ...prev,
        [selectedId]: {
          attempts: (prev[selectedId]?.attempts ?? 0) + 1,
          bestScore: Math.max(prev[selectedId]?.bestScore ?? 0, assessment.score),
          passed: prev[selectedId]?.passed || assessment.passed,
        },
      }));
      setResult(assessment);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setPhase("select");
    setSelectedId(null);
    setResponse("");
    setResult(null);
    setError(null);
  }

  function getNextIncomplete(): number | null {
    const start = selectedId ?? 0;
    for (let i = start + 1; i <= 20; i++) {
      if (!arenaProgress[i]?.passed) return i;
    }
    for (let i = 1; i <= start; i++) {
      if (!arenaProgress[i]?.passed) return i;
    }
    return null;
  }

  const passedCount = Object.values(arenaProgress).filter((p) => p.passed).length;

  // ── Module selection ────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div>
        <div
          className="sbe-command-bar sbe-command-bar-active"
          style={{ color: "white", marginBottom: "0.5rem" }}
        >
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">Live Scenarios</span>
            <strong>Choose a scenario to assess</strong>
            <span className="sbe-command-meta">
              {passedCount > 0 ? `${passedCount} of 20 complete · ` : ""}Read the scenario, write your full response, receive a score out of 100
            </span>
          </div>
        </div>

        {error && <p style={{ color: "var(--status-red-deep)", marginBottom: 12 }}>{error}</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {Object.entries(MODULE_META).map(([idStr, meta]) => {
            const id = Number(idStr);
            const accent = CATEGORY_ACCENT[meta.category];
            const prog = arenaProgress[id];
            return (
              <SharedTrainingCard
                key={id}
                className={prog?.passed ? "arena-card--passed" : (prog?.attempts ?? 0) > 0 ? "arena-card--attempted" : undefined}
                topBadge={<span className="arena-card-category" style={{ color: accent }}>{meta.category}</span>}
                metaRight={
                  prog?.passed ? (
                    <span className="arena-card-badge arena-card-badge--passed">Passed</span>
                  ) : (prog?.attempts ?? 0) > 0 ? (
                    <span className="arena-card-badge arena-card-badge--attempted">Attempted</span>
                  ) : undefined
                }
                title={meta.title}
                progressValue={prog ? prog.bestScore : undefined}
                progressLabel={prog ? `Best: ${prog.bestScore}/100` : undefined}
                footerAction={
                  <div className="arena-card-footer">
                    <span className="arena-card-status">
                      {prog?.passed
                        ? "Complete"
                        : (prog?.attempts ?? 0) > 0
                        ? `${prog!.attempts} attempt${prog!.attempts !== 1 ? "s" : ""}`
                        : "Not started"}
                    </span>
                    <span className={`arena-card-cta${prog?.passed ? " arena-card-cta--muted" : ""}`}>
                      {prog?.passed ? "Retake →" : (prog?.attempts ?? 0) > 0 ? "Retry →" : "Start →"}
                    </span>
                  </div>
                }
                onClick={() => selectModule(id)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Result screen ───────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const scoreColor =
      result.score >= 75 ? "var(--color-mastery-technical)" : result.score >= 50 ? "var(--color-mastery-service)" : "var(--color-mastery-compliance)";
    const meta = MODULE_META[selectedId!];
    return (
      <div>
        <div
          className="sbe-command-bar sbe-command-bar-active"
          style={{ color: "white", marginBottom: "0.5rem" }}
        >
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">Live Scenarios</span>
            <strong>Assessment Complete</strong>
            <span className="sbe-command-meta">{meta?.title ?? "Scenario"}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setPhase("writing"); setResult(null); setResponse(""); setError(null); }}
              className="sbe-command-btn btn"
              style={{ flexShrink: 0 }}
            >
              Try Again
            </button>
            <button
              onClick={reset}
              className="sbe-command-btn btn"
              style={{ flexShrink: 0 }}
            >
              All Scenarios
            </button>
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1.5px solid var(--viz-neutral-light)",
            borderRadius: "14px",
            overflow: "hidden",
            maxWidth: 560,
          }}
        >
          {/* Pass/fail banner */}
          <div
            style={{
              background: result.passed ? "var(--green-light)" : "var(--gold-light)",
              borderBottom: `2px solid ${result.passed ? "var(--green)" : "var(--gold-warm)"}`,
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: result.passed ? "var(--green-deep)" : "var(--gold)",
                  fontFamily: "var(--font-fraunces)",
                }}
              >
                {result.passed ? "Passed" : "Not yet – keep practising"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-soft)", marginTop: 2 }}>
                {result.passed
                  ? "Score saved. This scenario is marked complete."
                  : "Score recorded. Retry when you're ready for full credit."}
              </div>
            </div>
            <div
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                color: scoreColor,
                lineHeight: 1,
                flexShrink: 0,
                textAlign: "center",
              }}
            >
              {result.score}
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                / 100
              </div>
            </div>
          </div>

          <div style={{ padding: "1.5rem" }}>

          <div style={{ marginBottom: 20 }}>
            <strong
              style={{
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-mastery-technical)",
              }}
            >
              What you did well
            </strong>
            <p style={{ marginTop: 6, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.55 }}>
              {result.what_you_did_well}
            </p>
          </div>

          <div>
            <strong
              style={{
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-mastery-service)",
              }}
            >
              Room for improvement
            </strong>
            <p style={{ marginTop: 6, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.55 }}>
              {result.room_for_improvement}
            </p>
          </div>
          </div>{/* end padding wrapper */}
        </div>

        {/* Next scenario / all-complete tile */}
        {passedCount >= 20 ? (
          <div style={{ marginTop: "1rem", maxWidth: 560, background: "var(--green-light)", border: "1.5px solid var(--green)", borderRadius: "12px", padding: "1rem 1.5rem" }}>
            <strong style={{ fontSize: "1rem", fontWeight: 800, color: "var(--green-deep)", fontFamily: "var(--font-fraunces)" }}>
              All 20 scenarios complete
            </strong>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-soft)" }}>
              Outstanding. You have passed every AI assessment.
            </p>
          </div>
        ) : (() => {
          const nextId = getNextIncomplete();
          if (!nextId) return null;
          const nextMeta = MODULE_META[nextId];
          const nextAccent = CATEGORY_ACCENT[nextMeta.category];
          const nextProg = arenaProgress[nextId];
          return (
            <div style={{ marginTop: "1rem", maxWidth: 560 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                Up next
              </div>
              <SharedTrainingCard
                className={nextProg?.passed ? "arena-card--passed" : (nextProg?.attempts ?? 0) > 0 ? "arena-card--attempted" : undefined}
                topBadge={<span className="arena-card-category" style={{ color: nextAccent }}>{nextMeta.category}</span>}
                metaRight={
                  nextProg?.passed ? (
                    <span className="arena-card-badge arena-card-badge--passed">Passed</span>
                  ) : (nextProg?.attempts ?? 0) > 0 ? (
                    <span className="arena-card-badge arena-card-badge--attempted">Attempted</span>
                  ) : undefined
                }
                title={nextMeta.title}
                footerAction={
                  <div className="arena-card-footer">
                    <span className="arena-card-status">
                      {nextProg?.passed ? "Complete" : (nextProg?.attempts ?? 0) > 0 ? "Previously attempted" : "Not started"}
                    </span>
                    <span className="arena-card-cta">
                      {nextProg?.passed ? "Retake →" : (nextProg?.attempts ?? 0) > 0 ? "Retry →" : "Start →"}
                    </span>
                  </div>
                }
                onClick={() => selectModule(nextId)}
              />
            </div>
          );
        })()}
      </div>
    );
  }

  // ── Writing phase ───────────────────────────────────────────────────────────
  const seed = ARENA_SEED_SCENARIOS[selectedId!];
  const meta = MODULE_META[selectedId!];
  const accent = meta ? CATEGORY_ACCENT[meta.category] : "var(--color-mastery-technical)";

  return (
    <div>
      <div
        className="sbe-command-bar sbe-command-bar-active"
        style={{ color: "white", marginBottom: "1.75rem" }}
      >
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Live Scenarios</span>
          <strong>{meta?.title ?? "Scenario"}</strong>
          <span className="sbe-command-meta">Read the scenario, then write your full response below</span>
        </div>
        <button onClick={reset} className="sbe-command-btn btn" style={{ flexShrink: 0 }}>
          Exit
        </button>
      </div>

      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {seed && (
          <div
            style={{
              background: "white",
              border: `1.5px solid ${accent}22`,
              borderLeft: `4px solid ${accent}`,
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: accent,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {meta?.category} – Scenario
            </div>
            <p style={{ fontWeight: 700, color: "var(--green-gradient-stop)", fontSize: "0.95rem", lineHeight: 1.55, marginBottom: 10 }}>
              {seed.situation}
            </p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 10 }}>
              <strong style={{ color: "var(--text-secondary)" }}>Context:</strong> {seed.context}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
              <strong>Your task:</strong> {seed.task}
            </p>
          </div>
        )}

        <div
          style={{
            background: "white",
            border: "1.5px solid var(--viz-neutral-light)",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <label
            htmlFor="arena-response"
            style={{
              display: "block",
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-text-muted)",
              marginBottom: 10,
            }}
          >
            Your response
          </label>
          <textarea
            id="arena-response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write exactly what you would say and do in this situation. Be specific. The system evaluates based on Australian hospitality standards."
            disabled={submitting}
            rows={8}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1.5px solid var(--viz-neutral-light)",
              fontSize: "0.9rem",
              lineHeight: 1.55,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              color: "var(--color-ink-soft)",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ color: "var(--status-red-deep)", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>
          )}

          <button
            onClick={() => { void submitResponse(); }}
            disabled={submitting || !response.trim()}
            className="btn btn-primary"
            style={{ marginTop: 14, width: "100%", padding: "12px", fontSize: "0.95rem", fontWeight: 700 }}
          >
            {submitting ? "Evaluating..." : "Submit for Evaluation"}
          </button>
        </div>
      </div>
    </div>
  );
}
