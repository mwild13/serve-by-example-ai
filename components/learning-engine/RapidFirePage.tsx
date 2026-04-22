"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import StageLearning from "@/components/learning-engine/StageLearning";

type StageLevel = 1 | 2 | 3 | 4;
type ModuleKey = "bartending" | "sales" | "management";

type LevelProgress = {
  level1_completed: boolean;
  level2_completed: boolean;
  level3_completed: boolean;
  level4_unlocked: boolean;
  level1_score: number;
  level2_score: number;
  level3_score: number;
};

type ProgressData = {
  sessions: Record<ModuleKey, number>;
  scores: Record<ModuleKey, number>;
  levelProgress: Record<ModuleKey, LevelProgress>;
};

const EMPTY: ProgressData = {
  sessions: { bartending: 0, sales: 0, management: 0 },
  scores: { bartending: 0, sales: 0, management: 0 },
  levelProgress: {
    bartending: { level1_completed: false, level2_completed: false, level3_completed: false, level4_unlocked: false, level1_score: 0, level2_score: 0, level3_score: 0 },
    sales: { level1_completed: false, level2_completed: false, level3_completed: false, level4_unlocked: false, level1_score: 0, level2_score: 0, level3_score: 0 },
    management: { level1_completed: false, level2_completed: false, level3_completed: false, level4_unlocked: false, level1_score: 0, level2_score: 0, level3_score: 0 },
  },
};

// Legacy module IDs for the 3 classic modules (map to bartending/sales/management string keys)
const MODULE_CONFIG: Record<ModuleKey, { id: number; label: string; short: string; icon: string; description: string }> = {
  bartending: {
    id: 1,
    label: "Bartending Fundamentals",
    short: "Bartending",
    icon: "🍸",
    description: "Beer pouring, cocktail technique, spirit knowledge, and bar service excellence.",
  },
  sales: {
    id: 2,
    label: "Sales & Upselling",
    short: "Sales",
    icon: "💬",
    description: "Premium recommendations, upselling techniques, and turning every order into an experience.",
  },
  management: {
    id: 3,
    label: "Shift Leadership",
    short: "Leadership",
    icon: "📋",
    description: "Team coordination, feedback delivery, pre-shift briefing, and managing service flow.",
  },
};

function getNextStage(lp: LevelProgress, sessions: number, score: number): StageLevel {
  if (!lp.level1_completed) return 1;
  if (!lp.level2_completed) return 2;
  if (!lp.level3_completed) return 3;
  return 4;
}

function getNextStageLabel(stage: StageLevel): string {
  const labels: Record<StageLevel, string> = {
    1: "Stage 1 Recall",
    2: "Stage 2 Application",
    3: "Stage 3 Advanced",
    4: "Stage 4 Scenarios",
  };
  return labels[stage];
}

type Selection = { module: ModuleKey; stage: StageLevel } | null;

export default function RapidFirePage({ managementUnlocked }: { managementUnlocked: boolean }) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Selection>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch("/api/training/progress", {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        const res = await r.json();
        if (res.levelProgress) {
          setData({
            sessions: res.sessions ?? EMPTY.sessions,
            scores: res.scores ?? EMPTY.scores,
            levelProgress: {
              bartending: res.levelProgress?.bartending ?? EMPTY.levelProgress.bartending,
              sales: res.levelProgress?.sales ?? EMPTY.levelProgress.sales,
              management: res.levelProgress?.management ?? EMPTY.levelProgress.management,
            },
          });
        }
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Show StageLearning when a module+stage is selected
  if (selected) {
    const config = MODULE_CONFIG[selected.module];
    return (
      <div>
        <div className="sbe-command-bar sbe-command-bar-active" style={{ color: "white", marginBottom: "1.75rem" }}>
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">Quick Drills</span>
            <strong>{config.label}</strong>
            <span className="sbe-command-meta">Stage {selected.stage} of 4</span>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="sbe-command-btn btn"
            style={{ flexShrink: 0 }}
          >
            ← Back
          </button>
        </div>
        <StageLearning
          key={`rf-${selected.module}-${selected.stage}`}
          moduleId={config.id}
          managementUnlocked={managementUnlocked}
          initialStage={selected.stage}
          overrideModuleName={config.label}
          scaffoldedModuleKey={selected.module}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Command bar */}
      <div className="sbe-command-bar sbe-command-bar-active" style={{ color: "white", marginBottom: "1.75rem" }}>
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Quick Drills</span>
          <strong>Choose a module</strong>
          <span className="sbe-command-meta">4 stages per module · work through Stage 1 → 4 to reach mastery</span>
        </div>
      </div>

      {/* Module cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #e5e7eb", borderTopColor: "#2d6a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#6b7280" }}>Loading your progress…</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {(Object.keys(MODULE_CONFIG) as ModuleKey[]).map((mod) => {
            const config = MODULE_CONFIG[mod];
            const lp = data.levelProgress[mod];
            const nextStage = getNextStage(lp, data.sessions[mod], data.scores[mod]);
            const s4Done = data.sessions[mod] >= 1 && data.scores[mod] >= 21;
            const allDone = lp.level1_completed && lp.level2_completed && lp.level3_completed && s4Done;
            const stagesComplete = [lp.level1_completed, lp.level2_completed, lp.level3_completed, s4Done].filter(Boolean).length;
            const progressPct = Math.round((stagesComplete / 4) * 100);

            const nextLabel: Record<number, string> = { 1: "Recall", 2: "Application", 3: "Advanced", 4: "Scenarios" };

            return (
              <div
                key={mod}
                onClick={() => setSelected({ module: mod, stage: nextStage })}
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
                  e.currentTarget.style.borderColor = "#40916c";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,106,79,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Title */}
                <strong style={{ display: "block", fontSize: "1rem", fontWeight: 800, color: "#1b4332", marginBottom: "12px", lineHeight: 1.3 }}>
                  {config.icon} {config.label}
                </strong>

                {/* Progress bar */}
                <div style={{ height: "4px", background: "#f3f4f6", borderRadius: "2px", overflow: "hidden", marginBottom: "5px" }}>
                  <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, #40916c, #2d6a4f)", borderRadius: "2px", transition: "width 0.4s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {allDone ? "All stages complete" : `Next: ${nextLabel[nextStage]}`}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1b4332" }}>{progressPct}%</span>
                </div>

                {/* Status badge */}
                {allDone ? (
                  <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 800, color: "#1b4332", background: "#d1fae5", borderRadius: "999px", padding: "3px 12px", letterSpacing: "0.05em" }}>
                    ✓ MASTERED
                  </span>
                ) : stagesComplete === 0 ? (
                  <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 800, color: "#92400e", background: "#fef3c7", borderRadius: "999px", padding: "3px 12px", letterSpacing: "0.05em" }}>
                    START
                  </span>
                ) : (
                  <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 800, color: "#1b4332", background: "#d1fae5", borderRadius: "999px", padding: "3px 12px", letterSpacing: "0.05em" }}>
                    ACTIVE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stage legend */}
      {!loading && (
        <div style={{ display: "flex", gap: "0.625rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          {[
            { n: 1, label: "Recall", desc: "True / false" },
            { n: 2, label: "Application", desc: "Pick descriptors" },
            { n: 3, label: "Advanced", desc: "Harder challenges" },
            { n: 4, label: "Scenarios", desc: "AI roleplay" },
          ].map(({ n, label, desc }) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.7rem", color: "#1b4332", flexShrink: 0 }}>S{n}</span>
              <div>
                <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#111827" }}>{label}</p>
                <p style={{ margin: 0, fontSize: "0.68rem", color: "#9ca3af" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
