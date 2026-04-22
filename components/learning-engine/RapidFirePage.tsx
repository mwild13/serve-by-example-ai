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
        <button
          onClick={() => setSelected(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "20px",
            padding: "8px 16px",
            background: "transparent",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          ← Rapid Fire Modules
        </button>
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
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#111827", marginBottom: "0.375rem", letterSpacing: "-0.025em" }}>
          Quick Drills
        </h2>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Your 3 core modules — 4 stages each. Work through S1 → S4 to reach mastery.
        </p>
      </div>

      {/* Stage legend */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {[
          { stage: 1, label: "S1 — Recall", desc: "True / false knowledge checks" },
          { stage: 2, label: "S2 — Application", desc: "Pick correct descriptors" },
          { stage: 3, label: "S3 — Advanced", desc: "Harder descriptor challenges" },
          { stage: 4, label: "S4 — Scenarios", desc: "AI roleplay scenarios" },
        ].map(({ stage, label, desc }) => (
          <div key={stage} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <span style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", color: "#374151" }}>S{stage}</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#111827" }}>{label}</p>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#9ca3af" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Module cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #e5e7eb", borderTopColor: "#1d4ed8", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#6b7280" }}>Loading your progress...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {(Object.keys(MODULE_CONFIG) as ModuleKey[]).map((mod) => {
            const config = MODULE_CONFIG[mod];
            const lp = data.levelProgress[mod];
            const nextStage = getNextStage(lp, data.sessions[mod], data.scores[mod]);
            const s4Done = data.sessions[mod] >= 1 && data.scores[mod] >= 21;
            const allDone = lp.level1_completed && lp.level2_completed && lp.level3_completed && s4Done;

            const stageStatus: Record<StageLevel, "done" | "active" | "locked"> = {
              1: lp.level1_completed ? "done" : nextStage === 1 ? "active" : "locked",
              2: lp.level2_completed ? "done" : nextStage === 2 ? "active" : "locked",
              3: lp.level3_completed ? "done" : nextStage === 3 ? "active" : "locked",
              4: s4Done ? "done" : nextStage === 4 ? "active" : "locked",
            };

            return (
              <div
                key={mod}
                style={{
                  background: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* Module header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "2rem" }}>{config.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{config.short}</h3>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{config.label}</p>
                  </div>
                </div>

                {/* Description */}
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.5 }}>
                  {config.description}
                </p>

                {/* Stage badges */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {([1, 2, 3, 4] as StageLevel[]).map((stage) => {
                    const status = stageStatus[stage];
                    const bgColor = status === "done" ? "#16a34a" : status === "active" ? "#1d4ed8" : "#f3f4f6";
                    const textColor = status === "done" || status === "active" ? "white" : "#9ca3af";
                    return (
                      <button
                        key={stage}
                        onClick={() => setSelected({ module: mod, stage })}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          border: "none",
                          background: bgColor,
                          color: textColor,
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                        title={getNextStageLabel(stage)}
                      >
                        S{stage}
                      </button>
                    );
                  })}
                </div>

                {/* Next stage CTA */}
                <button
                  onClick={() => setSelected({ module: mod, stage: nextStage })}
                  style={{
                    padding: "10px 16px",
                    background: allDone ? "#f0fdf4" : "#1d4ed8",
                    color: allDone ? "#16a34a" : "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                  }}
                >
                  {allDone ? "✓ Mastered — Replay any stage" : `Start: ${getNextStageLabel(nextStage)} →`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
