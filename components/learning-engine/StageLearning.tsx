"use client";

import { useState, useEffect, useCallback } from "react";
import RapidFireQuiz from "@/components/learning-engine/RapidFireQuiz";
import DescriptorSelector from "@/components/learning-engine/DescriptorSelector";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type StageLevel = 1 | 2 | 3 | 4;

type Props = {
  moduleId: number;
  managementUnlocked: boolean;
};

const STAGE_META: Record<StageLevel, { name: string; subtitle: string }> = {
  1: { name: "Stage 1: Recall", subtitle: "True or false — quick knowledge checks" },
  2: { name: "Stage 2: Application", subtitle: "Select the correct descriptors for each scenario" },
  3: { name: "Stage 3: Advanced Application", subtitle: "Deeper descriptor challenges with shuffled options" },
  4: { name: "Stage 4: Real-World Scenarios", subtitle: "AI-evaluated roleplay scenarios" },
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

type ModuleProgress = {
  completed: boolean;
  score: number;
};

export default function StageLearning({ moduleId, managementUnlocked }: Props) {
  const [currentStage, setCurrentStage] = useState<StageLevel>(1);
  const [moduleName, setModuleName] = useState<string>("Training Module");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<StageLevel, ModuleProgress>>({
    1: { completed: false, score: 0 },
    2: { completed: false, score: 0 },
    3: { completed: false, score: 0 },
    4: { completed: false, score: 0 },
  });
  const [sessionProgress, setSessionProgress] = useState<StageLevel[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // Fetch module metadata and scenarios
  useEffect(() => {
    async function fetchModuleData() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setLoading(false);
          return;
        }

        // Fetch module details
        const moduleRes = await fetch(`/api/training/modules/${moduleId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (moduleRes.ok) {
          const moduleData = await moduleRes.json();
          setModuleName(moduleData.title || "Training Module");
        }

        // Fetch scenarios for this module
        const scenariosRes = await fetch(`/api/training/modules/${moduleId}/scenarios`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (scenariosRes.ok) {
          const scenariosData = await scenariosRes.json();
          setScenarios(scenariosData.scenarios || []);
        } else {
          setError("Failed to load training scenarios");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load module data");
        console.error("Error fetching module data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  // Get scenarios for current stage
  const getCurrentStageScenarios = useCallback((): Scenario[] => {
    const stageTypeMap: Record<StageLevel, string> = {
      1: "quiz",
      2: "descriptor_l2",
      3: "descriptor_l3",
      4: "roleplay",
    };
    const stageType = stageTypeMap[currentStage];
    return scenarios.filter((s) => s.scenario_type === stageType);
  }, [scenarios, currentStage]);

  // Handle stage completion
  const handleStageComplete = useCallback(
    async (score: number) => {
      setProgress((prev) => ({
        ...prev,
        [currentStage]: { completed: true, score },
      }));

      setSessionProgress((prev) => (prev.includes(currentStage) ? prev : [...prev, currentStage]));
      setShowSummary(true);

      // Persist to API
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        await fetch("/api/training/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            moduleId,
            stageLevel: currentStage,
            score,
            completed: true,
          }),
        });
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    },
    [currentStage, moduleId]
  );

  const stageScenarios = getCurrentStageScenarios();
  const meta = STAGE_META[currentStage];

  if (loading) {
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <div className="spinner" style={{ marginBottom: "16px" }}></div>
          <p>Loading module content...</p>
        </div>
      </div>
    );
  }

  if (error || stageScenarios.length === 0) {
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-soft)" }}>
          <p>{error || "No scenarios available for this stage"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-container">
      {/* Module header */}
      <div className="stage-header">
        <h2 style={{ marginBottom: "8px" }}>{moduleName}</h2>
        <h1 className="stage-title">{meta.name}</h1>
        <p className="stage-subtitle">{meta.subtitle}</p>
      </div>

      {/* Session summary */}
      {showSummary && sessionProgress.length > 0 && (
        <div className="stage-summary-card">
          <div className="stage-summary-header">
            <span className="stage-summary-icon">🎯</span>
            <strong>Session recap</strong>
          </div>
          <div className="stage-summary-stats">
            <div className="stage-summary-stat">
              <span className="stage-summary-num">{sessionProgress.length}</span>
              <span className="stage-summary-label">stage{sessionProgress.length !== 1 ? "s" : ""} completed</span>
            </div>
          </div>
          <button className="stage-summary-dismiss" onClick={() => setShowSummary(false)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Stage progression */}
      <div className="stage-progress">
        {(
          [1, 2, 3, 4] as StageLevel[]
        ).map((stage) => {
          const stageProgress = progress[stage];
          const isCompleted = stageProgress.completed;
          const isCurrent = stage === currentStage;

          return (
            <button
              key={stage}
              className={`stage-progress-item${isCurrent ? " stage-progress-item-active" : ""}${isCompleted ? " stage-progress-item-completed" : ""}`}
              onClick={() => setCurrentStage(stage)}
            >
              <span className="stage-progress-number">{stage}</span>
              <span className="stage-progress-label">Stage {stage}</span>
              {isCompleted && <span className="stage-progress-badge">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Stage content */}
      {currentStage === 1 && (
        <RapidFireQuiz
          scenarios={stageScenarios}
          moduleId={moduleId}
          onComplete={handleStageComplete}
        />
      )}

      {(currentStage === 2 || currentStage === 3) && (
        <DescriptorSelector
          scenarios={stageScenarios}
          moduleId={moduleId}
          level={currentStage}
          onComplete={handleStageComplete}
        />
      )}

      {currentStage === 4 && (
        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-soft)" }}>
          <p>Stage 4 advanced scenarios coming soon</p>
        </div>
      )}

      {/* Navigation */}
      <div className="stage-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentStage(Math.max(1, currentStage - 1) as StageLevel)}
          disabled={currentStage === 1}
        >
          ← Previous Stage
        </button>

        <button
          className="btn btn-primary"
          onClick={() => setCurrentStage(Math.min(4, currentStage + 1) as StageLevel)}
          disabled={currentStage === 4 || !progress[currentStage].completed}
        >
          Next Stage →
        </button>
      </div>
    </div>
  );
}
