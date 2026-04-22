"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import RapidFireQuiz from "@/components/learning-engine/RapidFireQuiz";
import DescriptorSelector from "@/components/learning-engine/DescriptorSelector";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  LEVEL1_QUESTIONS,
  LEVEL2_DESCRIPTORS,
  LEVEL3_DESCRIPTORS,
  type Module,
} from "@/lib/scaffolded-questions";

type StageLevel = 1 | 2 | 3 | 4;

type Props = {
  moduleId: number;
  managementUnlocked: boolean;
  initialStage?: StageLevel;
  overrideModuleName?: string;
  /** When set, forces this module key for content lookup instead of inferring from moduleId */
  scaffoldedModuleKey?: Module;
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

// Map module IDs 1-3 to their correct topic question banks.
// DB module ID 1 = "Pouring the Perfect Beer"
// DB module ID 2 = "Wine Knowledge & Service"
// DB module ID 3 = "Cocktail Fundamentals"
const SCAFFOLDED_MODULE_KEY: Record<number, Module> = {
  1: "beer",
  2: "wine",
  3: "cocktails",
};

// Build rich fallback scenarios from scaffolded-questions.ts for modules 1-3
// For modules 4-20, use generic content so training is always functional
function getFallbackScenarios(moduleId: number, overrideKey?: Module): Scenario[] {
  const moduleKey = overrideKey ?? SCAFFOLDED_MODULE_KEY[moduleId];

  if (moduleKey) {
    const l1 = LEVEL1_QUESTIONS[moduleKey];
    const l2 = LEVEL2_DESCRIPTORS[moduleKey];
    const l3 = LEVEL3_DESCRIPTORS[moduleKey];

    const quizScenarios: Scenario[] = l1.map((q, i) => ({
      id: `scaffolded-${moduleId}-l1-${i}`,
      module_id: moduleId,
      scenario_index: i,
      scenario_type: "quiz",
      prompt: q.question,
      content: { answer: String(q.answer), explanation: q.explanation },
      difficulty: 1,
    }));

    const l2Scenarios: Scenario[] = l2.map((q, i) => ({
      id: `scaffolded-${moduleId}-l2-${i}`,
      module_id: moduleId,
      scenario_index: 20 + i,
      scenario_type: "descriptor_l2",
      prompt: q.prompt,
      content: {
        descriptors: q.descriptors,
        correctIndices: q.correctIndices,
        explanation: q.explanation,
      },
      difficulty: 2,
    }));

    const l3Scenarios: Scenario[] = l3.map((q, i) => ({
      id: `scaffolded-${moduleId}-l3-${i}`,
      module_id: moduleId,
      scenario_index: 30 + i,
      scenario_type: "descriptor_l3",
      prompt: q.prompt,
      content: {
        descriptors: q.descriptors,
        correctIndices: q.correctIndices,
        explanation: q.explanation,
      },
      difficulty: 3,
    }));

    return [...quizScenarios, ...l2Scenarios, ...l3Scenarios, {
      id: `scaffolded-${moduleId}-l4-0`,
      module_id: moduleId,
      scenario_index: 40,
      scenario_type: "roleplay",
      prompt: `You are on shift and a guest needs your help. Demonstrate your ${moduleKey} knowledge by walking through your approach step by step.`,
      content: { context: `Real-world scenario for ${moduleKey}.`, evaluation_criteria: ["Empathy", "Knowledge", "Problem-solving", "Communication"] },
      difficulty: 4,
    }];
  }

  // Generic fallback for modules 4-20
  const moduleTopics: Record<number, { topic: string; keyword: string }> = {
    4: { topic: "coffee preparation", keyword: "coffee and espresso" },
    5: { topic: "carrying glassware", keyword: "carrying trays safely" },
    6: { topic: "cleaning procedures", keyword: "cleaning and sanitation" },
    7: { topic: "bar back duties", keyword: "bar operations" },
    8: { topic: "greeting guests", keyword: "welcoming customers" },
    9: { topic: "table management", keyword: "managing tables" },
    10: { topic: "anticipatory service", keyword: "anticipating guest needs" },
    11: { topic: "complaint handling", keyword: "handling complaints" },
    12: { topic: "upselling", keyword: "suggesting and upselling" },
    13: { topic: "VIP service", keyword: "VIP and table management" },
    14: { topic: "phone etiquette", keyword: "phone and reservations" },
    15: { topic: "responsible service of alcohol", keyword: "RSA compliance" },
    16: { topic: "food safety", keyword: "food hygiene" },
    17: { topic: "conflict de-escalation", keyword: "managing conflict" },
    18: { topic: "emergency protocols", keyword: "emergency procedures" },
    19: { topic: "opening and closing", keyword: "venue procedures" },
    20: { topic: "inventory control", keyword: "stock management" },
  };

  const info = moduleTopics[moduleId] || { topic: "hospitality", keyword: "service" };

  return [
    { id: `fallback-${moduleId}-1`, module_id: moduleId, scenario_index: 0, scenario_type: "quiz", prompt: `Proper technique is essential when ${info.keyword}.`, content: { answer: "true", explanation: `Good technique in ${info.topic} is fundamental to quality service.` }, difficulty: 1 },
    { id: `fallback-${moduleId}-2`, module_id: moduleId, scenario_index: 1, scenario_type: "quiz", prompt: `You can skip ${info.topic} training if you have prior experience.`, content: { answer: "false", explanation: `Every venue has specific standards. Even experienced staff need to learn house procedures.` }, difficulty: 1 },
    { id: `fallback-${moduleId}-3`, module_id: moduleId, scenario_index: 2, scenario_type: "quiz", prompt: `Guest satisfaction improves when staff are skilled in ${info.topic}.`, content: { answer: "true", explanation: `Proficiency in ${info.topic} directly contributes to a positive guest experience.` }, difficulty: 1 },
    { id: `fallback-${moduleId}-4`, module_id: moduleId, scenario_index: 3, scenario_type: "quiz", prompt: `Speed is more important than quality when ${info.keyword}.`, content: { answer: "false", explanation: `Quality should never be compromised. Rushed ${info.topic} leads to errors and dissatisfaction.` }, difficulty: 2 },
    { id: `fallback-${moduleId}-5`, module_id: moduleId, scenario_index: 4, scenario_type: "quiz", prompt: `Understanding ${info.topic} helps you handle difficult situations at work.`, content: { answer: "true", explanation: `Strong ${info.topic} knowledge gives you confidence to adapt when things don't go to plan.` }, difficulty: 2 },
    {
      id: `fallback-${moduleId}-6`, module_id: moduleId, scenario_index: 5, scenario_type: "descriptor_l2",
      prompt: `A guest asks for help with ${info.keyword}. Which TWO actions best reflect professional service?`,
      content: { descriptors: [`Respond promptly and with a smile`, `Ignore the request`, `Apply proper ${info.topic} technique`, `Guess without checking`, `Tell the guest to wait indefinitely`], correctIndices: [0, 2], explanation: `Promptness and applying correct technique are the cornerstones of professional service.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-7`, module_id: moduleId, scenario_index: 6, scenario_type: "descriptor_l2",
      prompt: `You notice a problem during ${info.keyword}. Which TWO steps should you take?`,
      content: { descriptors: [`Address it immediately before it escalates`, `Ignore it and hope it resolves`, `Inform your supervisor if needed`, `Blame a colleague`, `Walk away from the situation`], correctIndices: [0, 2], explanation: `Acting quickly and involving your supervisor when appropriate are hallmarks of responsible service.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-8`, module_id: moduleId, scenario_index: 7, scenario_type: "descriptor_l3",
      prompt: `During a busy shift involving ${info.keyword}, which THREE behaviours demonstrate excellence?`,
      content: { descriptors: [`Maintain composure under pressure`, `Prioritise tasks by urgency`, `Cut corners to save time`, `Communicate clearly with your team`, `Dismiss guest feedback`], correctIndices: [0, 1, 3], explanation: `Composure, prioritisation, and clear communication are the key pillars of excellence.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-9`, module_id: moduleId, scenario_index: 8, scenario_type: "descriptor_l3",
      prompt: `A guest gives feedback about ${info.keyword}. Which THREE responses show professionalism?`,
      content: { descriptors: [`Thank them for the feedback`, `Dismiss what they said`, `Take note of what can be improved`, `Argue with the guest`, `Follow up to ensure satisfaction`], correctIndices: [0, 2, 4], explanation: `Thanking guests, noting improvements, and following up are signs of professional service recovery.` },
      difficulty: 3,
    },
    { id: `fallback-${moduleId}-10`, module_id: moduleId, scenario_index: 9, scenario_type: "roleplay", prompt: `A guest approaches you with a concern about ${info.topic}. How do you handle this situation?`, content: { context: `Testing ${info.topic} knowledge under pressure.`, evaluation_criteria: [`Empathy`, `Knowledge`, `Problem-solving`, `Communication`] }, difficulty: 4 },
  ];
}

export default function StageLearning({ moduleId, managementUnlocked, initialStage, overrideModuleName, scaffoldedModuleKey }: Props) {
  const [currentStage, setCurrentStage] = useState<StageLevel>(initialStage ?? 1);
  const [moduleName, setModuleName] = useState<string>(overrideModuleName ?? "Training Module");
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

        // Fetch module details (skip if name is already provided via prop)
        if (!overrideModuleName) {
          const moduleRes = await fetch(`/api/training/modules/${moduleId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (moduleRes.ok) {
            const moduleData = await moduleRes.json();
            setModuleName(moduleData.title || "Training Module");
          }
        }

        // Fetch scenarios for this module
        const scenariosRes = await fetch(`/api/training/modules/${moduleId}/scenarios`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (scenariosRes.ok) {
          const scenariosData = await scenariosRes.json();
          const dbScenarios: Scenario[] = scenariosData.scenarios || [];

          if (dbScenarios.length > 0) {
            // Validate quiz scenarios: must have content.answer of exactly "true" or "false"
            // Badly formatted questions (e.g. "What is the drinking age?", answer: "18")
            // appear in the T/F UI but both buttons always score wrong — silent UX breakage.
            const validScenarios = dbScenarios.filter((s: Scenario) => {
              if (s.scenario_type !== "quiz") return true;
              const answer = String(
                (s.content as { answer?: unknown })?.answer ?? ""
              )
                .toLowerCase()
                .trim();
              return answer === "true" || answer === "false";
            });

            const dbQuizCount = validScenarios.filter(
              (s: Scenario) => s.scenario_type === "quiz"
            ).length;

            // Stage 1 requires 5 consecutive correct — need at least 5 unique questions.
            const MIN_QUIZ_QUESTIONS = 5;
            const hasDescriptors = validScenarios.some(
              (s: Scenario) =>
                s.scenario_type === "descriptor_l2" ||
                s.scenario_type === "descriptor_l3"
            );

            if (dbQuizCount < MIN_QUIZ_QUESTIONS) {
              // Not enough valid T/F questions in DB.
              // Supplement Stage 1 with fallback quiz questions while keeping DB
              // descriptor/roleplay content if it exists and is sufficient.
              const fallback = getFallbackScenarios(moduleId, scaffoldedModuleKey);
              const fallbackQuiz = fallback.filter(
                (s: Scenario) => s.scenario_type === "quiz"
              );
              const dbNonQuiz = validScenarios.filter(
                (s: Scenario) => s.scenario_type !== "quiz"
              );

              if (hasDescriptors && dbNonQuiz.length >= 4) {
                // Good descriptor/roleplay data in DB — just replace quiz layer
                setScenarios([...fallbackQuiz, ...dbNonQuiz]);
              } else {
                // Full fallback (DB data too sparse overall)
                setScenarios(fallback);
              }
            } else if (!hasDescriptors && (scaffoldedModuleKey ?? SCAFFOLDED_MODULE_KEY[moduleId])) {
              // DB has quiz but no descriptors — use full scaffolded set
              setScenarios(getFallbackScenarios(moduleId, scaffoldedModuleKey));
            } else {
              setScenarios(validScenarios);
            }
          } else {
            // DB scenarios not yet seeded — use fallback so training works
            setScenarios(getFallbackScenarios(moduleId, scaffoldedModuleKey));
          }
        } else {
          // API error — use fallback scenarios
          setScenarios(getFallbackScenarios(moduleId, scaffoldedModuleKey));
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
  }, [moduleId, overrideModuleName, scaffoldedModuleKey]);

  // Get scenarios for current stage — memoized so the array reference is stable.
  // A new array reference on every render would trigger RapidFireQuiz's useEffect,
  // reshuffling and resetting questionIndex mid-quiz.
  const stageScenarios = useMemo((): Scenario[] => {
    const stageTypeMap: Record<StageLevel, string> = {
      1: "quiz",
      2: "descriptor_l2",
      3: "descriptor_l3",
      4: "roleplay",
    };
    return scenarios.filter((s) => s.scenario_type === stageTypeMap[currentStage]);
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
            overallScore: score,   // field name the save route expects
            completed: true,
          }),
        });
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    },
    [currentStage, moduleId]
  );

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

      {/* Session summary with forward navigation */}
      {showSummary && sessionProgress.length > 0 && (
        <div className="stage-summary-card">
          <div className="stage-summary-header">
            <span className="stage-summary-icon">🎯</span>
            <strong>Stage {currentStage} complete!</strong>
          </div>
          <div className="stage-summary-stats">
            <div className="stage-summary-stat">
              <span className="stage-summary-num">{sessionProgress.length}</span>
              <span className="stage-summary-label">stage{sessionProgress.length !== 1 ? "s" : ""} completed</span>
            </div>
          </div>
          {currentStage < 4 && (
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "12px" }}
              onClick={() => {
                setCurrentStage((currentStage + 1) as StageLevel);
                setShowSummary(false);
              }}
            >
              Continue to Stage {currentStage + 1} →
            </button>
          )}
          <button className="stage-summary-dismiss" onClick={() => setShowSummary(false)}>
            {currentStage < 4 ? "Stay on this stage" : "Dismiss"}
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
          key={`quiz-${moduleId}-stage-${currentStage}`}
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
