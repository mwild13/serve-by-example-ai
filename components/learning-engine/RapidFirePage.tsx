"use client";

/**
 * RapidFirePage — V3 Quick Drills.
 *
 * Lists every module the user can access (from /api/training/modules)
 * and routes to ModuleVerify on click. No legacy ModuleKey strings.
 *
 * See docs/v3-architecture.md for the V3 pipeline.
 */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import ModuleVerify from "@/components/learning-engine/ModuleVerify";

type ModuleListItem = {
  id: number;
  title: string;
  description: string;
  category: "technical" | "service" | "compliance";
  difficulty_level: number;
  mastery_pct: number;
  current_elo: number;
  recommended: boolean;
};

type Props = {
  userId: string;
};

const CATEGORY_LABEL: Record<ModuleListItem["category"], string> = {
  technical: "Technical",
  service: "Service",
  compliance: "Compliance",
};

const CATEGORY_ACCENT: Record<ModuleListItem["category"], string> = {
  technical: "#1E5A3C",
  service: "#B98220",
  compliance: "#7A4F2C",
};

export default function RapidFirePage({ userId }: Props) {
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const headers = session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined;

        const res = await fetch("/api/training/modules?sort=recommended", { headers });
        if (!res.ok) throw new Error(`Failed to load modules (${res.status}).`);
        const json = await res.json();
        if (cancelled) return;
        setModules((json.modules ?? []) as ModuleListItem[]);
      } catch (err) {
        if (cancelled) return;
        console.error("RapidFirePage load failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load modules.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (selectedId != null) {
    const selected = modules.find((m) => m.id === selectedId);
    return (
      <div>
        <div
          className="sbe-command-bar sbe-command-bar-active"
          style={{ color: "white", marginBottom: "1.75rem" }}
        >
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">Quick Drills</span>
            <strong>{selected?.title ?? "Module"}</strong>
            <span className="sbe-command-meta">Verify to master</span>
          </div>
          <button
            onClick={() => setSelectedId(null)}
            className="sbe-command-btn btn"
            style={{ flexShrink: 0 }}
          >
            ← Back
          </button>
        </div>
        <ModuleVerify
          key={`verify-${selectedId}`}
          moduleId={selectedId}
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className="sbe-command-bar sbe-command-bar-active"
        style={{ color: "white", marginBottom: "1.75rem" }}
      >
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Quick Drills</span>
          <strong>Choose a module</strong>
          <span className="sbe-command-meta">
            Pass the verification quiz to master each module
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#2d6a4f",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#6b7280" }}>Loading modules…</p>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 0",
            color: "#7a1d1d",
          }}
        >
          <p>{error}</p>
        </div>
      ) : modules.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#6b7280" }}>
          <p>No modules available for your plan yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {modules.map((mod) => {
            const mastered = mod.mastery_pct >= 100;
            const inProgress = mod.mastery_pct > 0 && !mastered;
            const accent = CATEGORY_ACCENT[mod.category] ?? "#1E5A3C";

            return (
              <div
                key={mod.id}
                onClick={() => setSelectedId(mod.id)}
                style={{
                  background: "white",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "1.25rem 1.4rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,106,79,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: accent,
                      textTransform: "uppercase",
                    }}
                  >
                    {CATEGORY_LABEL[mod.category]}
                  </span>
                  {mod.recommended && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "#B98220",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Recommended
                    </span>
                  )}
                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#1b4332",
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {mod.title}
                </strong>

                <div
                  style={{
                    height: "4px",
                    background: "#f3f4f6",
                    borderRadius: "2px",
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, mod.mastery_pct)}%`,
                      height: "100%",
                      background: mastered
                        ? "linear-gradient(90deg, #40916c, #2d6a4f)"
                        : accent,
                      borderRadius: "2px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                {mastered ? (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "#1b4332",
                      background: "#d1fae5",
                      borderRadius: "999px",
                      padding: "3px 12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    MASTERED
                  </span>
                ) : inProgress ? (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "#1b4332",
                      background: "#d1fae5",
                      borderRadius: "999px",
                      padding: "3px 12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    IN PROGRESS
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "#92400e",
                      background: "#fef3c7",
                      borderRadius: "999px",
                      padding: "3px 12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    START
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
