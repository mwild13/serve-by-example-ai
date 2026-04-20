"use client";

import { useState, useEffect, useCallback } from "react";
import RapidFireQuiz from "@/components/learning-engine/RapidFireQuiz";
import DescriptorSelector from "@/components/learning-engine/DescriptorSelector";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Module = "bartending" | "sales" | "management";

type StageLevel = 1 | 2 | 3;

type Props = {
  stage: StageLevel;
  managementUnlocked: boolean;
};

const STAGE_META: Record<StageLevel, { name: string; subtitle: string }> = {
  1: { name: "Stage 1: Recall", subtitle: "True or false — quick knowledge checks across all modules" },
  2: { name: "Stage 2: Application", subtitle: "Select the correct descriptors for each scenario" },
  3: { name: "Stage 3: Advanced Application", subtitle: "Deeper descriptor challenges with shuffled options" },
};

const MODULE_META: Record<Module, { label: string; color: string; description: string }> = {
  bartending: { label: "Bartending Fundamentals", color: "#1f4e37", description: "Cocktails, spirits, technique & glassware" },
  sales:      { label: "Sales & Upselling",       color: "#a9812a", description: "Recommendation confidence & objection handling" },
  management: { label: "Leadership & Coaching",    color: "#2a6848", description: "Delegation, coaching & problem solving" },
};

type ModuleProgress = {
  completed: boolean;
  score: number;
};

export default function StageLearning({ stage, managementUnlocked }: Props) {
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<Record<Module, ModuleProgress>>({
    bartending: { completed: false, score: 0 },
    sales:      { completed: false, score: 0 },
    management: { completed: false, score: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionModules, setSessionModules] = useState<Module[]>([]);

  // Load progress for this stage from API
  useEffect(() => {
    async function fetchProgress() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { setLoading(false); return; }

        const modules: Module[] = ["bartending", "sales", "management"];
        const results: Record<Module, ModuleProgress> = {
          bartending: { completed: false, score: 0 },
          sales: { completed: false, score: 0 },
          management: { completed: false, score: 0 },
        };

        for (const mod of modules) {
          try {
            const res = await fetch(`/api/training/level-progress?module=${mod}`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
              const data = await res.json();
              const p = data.progress;
              if (stage === 1) {
                results[mod] = { completed: p?.level1_completed ?? false, score: p?.level1_score ?? 0 };
              } else if (stage === 2) {
                results[mod] = { completed: p?.level2_completed ?? false, score: p?.level2_score ?? 0 };
              } else {
                results[mod] = { completed: p?.level3_completed ?? false, score: p?.level3_score ?? 0 };
              }
            }
          } catch { /* non-critical */ }
        }
        setProgress(results);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    }
    void fetchProgress();
  }, [stage]);

  // Save progress when a module's stage is completed
  const handleModuleComplete = useCallback(async (mod: Module) => {
    setProgress((prev) => ({
      ...prev,
      [mod]: { completed: true, score: prev[mod].score },
    }));
    setSessionModules((prev) => prev.includes(mod) ? prev : [...prev, mod]);
    setActiveModule(null);

    // Persist to API
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // First fetch current progress so we don't overwrite other levels
      const res = await fetch(`/api/training/level-progress?module=${mod}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      let existing = { currentLevel: 1, level1Score: 0, level1Completed: false, level2Score: 0, level2Completed: false, level3Score: 0, level3Completed: false, level4Unlocked: false };
      if (res.ok) {
        const data = await res.json();
        const p = data.progress;
        existing = {
          currentLevel: p?.current_level ?? 1,
          level1Score: p?.level1_score ?? 0,
          level1Completed: p?.level1_completed ?? false,
          level2Score: p?.level2_score ?? 0,
          level2Completed: p?.level2_completed ?? false,
          level3Score: p?.level3_score ?? 0,
          level3Completed: p?.level3_completed ?? false,
          level4Unlocked: p?.level4_unlocked ?? false,
        };
      }

      // Update the specific level that was completed
      const update = { ...existing, module: mod };
      if (stage === 1) {
        update.level1Completed = true;
        update.currentLevel = Math.max(update.currentLevel, 2);
      } else if (stage === 2) {
        update.level2Completed = true;
        update.currentLevel = Math.max(update.currentLevel, 3);
      } else {
        update.level3Completed = true;
        update.level4Unlocked = true;
        update.currentLevel = 4;
      }

      await fetch("/api/training/level-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(update),
      });
    } catch { /* non-critical */ }
  }, [stage]);

  const meta = STAGE_META[stage];

  return (
    <div className="stage-container">
      {/* Stage header */}
      <div className="stage-header">
        <h1 className="stage-title">{meta.name}</h1>
        <p className="stage-subtitle">{meta.subtitle}</p>
      </div>

      {/* Session summary card */}
      {showSummary && sessionModules.length > 0 && !activeModule && (
        <div className="stage-summary-card">
          <div className="stage-summary-header">
            <span className="stage-summary-icon">🎯</span>
            <strong>Session recap</strong>
          </div>
          <div className="stage-summary-stats">
            <div className="stage-summary-stat">
              <span className="stage-summary-num">{sessionModules.length}</span>
              <span className="stage-summary-label">module{sessionModules.length !== 1 ? "s" : ""} completed</span>
            </div>
            <div className="stage-summary-modules">
              {sessionModules.map((mod) => (
                <span key={mod} className="stage-summary-module" style={{ borderColor: MODULE_META[mod].color }}>
                  {MODULE_META[mod].label}
                </span>
              ))}
            </div>
          </div>
          <button className="stage-summary-dismiss" onClick={() => setShowSummary(false)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Module selection cards */}
      {!activeModule && (
        <div className="stage-cards">
          {(["bartending", "sales", "management"] as Module[]).map((mod) => {
            const m = MODULE_META[mod];
            const p = progress[mod];
            const isLocked = mod === "management" && !managementUnlocked;
            return (
              <div
                key={mod}
                role="button"
                tabIndex={isLocked ? -1 : 0}
                aria-disabled={isLocked}
                className={`stage-card${p.completed ? " stage-card-done" : ""}${isLocked ? " stage-card-locked" : ""}`}
                onClick={() => !isLocked && !p.completed && setActiveModule(mod)}
                onKeyDown={(e) => {
                  if (!isLocked && !p.completed && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setActiveModule(mod);
                  }
                }}
                style={{ borderLeftColor: m.color }}
              >
                <div className="stage-card-status">
                  {isLocked ? (
                    <span className="stage-badge stage-badge-locked">🔒 Locked</span>
                  ) : p.completed ? (
                    <span className="stage-badge stage-badge-done">✓ Complete</span>
                  ) : (
                    <span className="stage-badge stage-badge-ready">Ready</span>
                  )}
                </div>
                <h3 className="stage-card-title">{m.label}{isLocked ? " 🔒" : ""}</h3>
                <p className="stage-card-desc">{m.description}</p>
                {!isLocked && !p.completed && (
                  <button className="btn btn-primary stage-card-btn">
                    Start Stage {stage}
                  </button>
                )}
                {p.completed && (
                  <button
                    className="btn btn-secondary stage-card-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProgress((prev) => ({ ...prev, [mod]: { ...prev[mod], completed: false } }));
                      setActiveModule(mod);
                    }}
                  >
                    Practice again
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {loading && !activeModule && (
        <div className="stage-loading">Loading progress...</div>
      )}

      {/* Active quiz/descriptor for the selected module */}
      {activeModule && (
        <div className="stage-active-panel">
          <div className="stage-active-header">
            <button
              className="btn btn-secondary stage-back-btn"
              onClick={() => {
                if (sessionModules.length > 0) {
                  setShowSummary(true);
                }
                setActiveModule(null);
              }}
            >
              ← Back to modules
            </button>
            <h2 className="stage-active-title">
              {MODULE_META[activeModule].label} — {meta.name}
            </h2>
          </div>

          {stage === 1 && (
            <RapidFireQuiz
              key={activeModule}
              module={activeModule}
              onComplete={() => handleModuleComplete(activeModule)}
              initialScore={progress[activeModule].score}
            />
          )}
          {stage === 2 && (
            <DescriptorSelector
              key={activeModule}
              module={activeModule}
              level={2}
              onComplete={() => handleModuleComplete(activeModule)}
              initialScore={progress[activeModule].score}
            />
          )}
          {stage === 3 && (
            <DescriptorSelector
              key={activeModule}
              module={activeModule}
              level={3}
              onComplete={() => handleModuleComplete(activeModule)}
              initialScore={progress[activeModule].score}
            />
          )}
        </div>
      )}
    </div>
  );
}
