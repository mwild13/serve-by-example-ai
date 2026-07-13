"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import TrainerCommandBar from "./trainer/TrainerCommandBar";
import HelpModal from "./trainer/HelpModal";
import ModuleSelectGrid from "./trainer/ModuleSelectGrid";
import ScenarioPractice from "./trainer/ScenarioPractice";
import EvaluationResult from "./trainer/EvaluationResult";
import type { Module, ReviewItem, TrainerProgressPreload, EvalResult } from "./trainer/trainer-data";
import { SCENARIOS, SCENARIO_INSIGHTS } from "./trainer/trainer-data";

export type { TrainerProgressPreload };

export default function DashboardTrainer({
  displayName,
  managementUnlocked = false,
  userToken,
  initialProgress,
}: {
  displayName: string;
  managementUnlocked?: boolean;
  userToken?: string;
  initialProgress?: TrainerProgressPreload;
}) {
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  // ── Mastery engine state ───────────────────────────────────
  const [masteryFeedback, setMasteryFeedback] = useState<{
    level: number; previousLevel: number; levelChanged: boolean;
    spamGuarded: boolean; eloRating: number; eloDelta: number;
    isBridge: boolean; consecutiveFails: number;
    confidenceAccuracy: string;
  } | null>(null);

  // Mastery-based progress (completion = unique scenarios passed / total)
  const [moduleProgress, setModuleProgress] = useState<Record<Module, number>>(
    (initialProgress?.modules as Record<Module, number>) ?? { bartending: 0, sales: 0, management: 0 }
  );
  // Mastery % (scenarios at level 3 / total)
  const [moduleMastery, setModuleMastery] = useState<Record<Module, number>>(
    (initialProgress?.mastery as Record<Module, number>) ?? { bartending: 0, sales: 0, management: 0 }
  );
  // Spaced repetition review queue
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>(initialProgress?.reviewQueue ?? []);
  // Per-scenario mastery levels for the active module
  const [scenarioMastery, setScenarioMastery] = useState<Record<number, number>>({});

  const [mgmtUnlocked, setMgmtUnlocked] = useState(managementUnlocked || !!initialProgress?.autoUnlockManagement);

  const currentScenario = activeModule ? SCENARIOS[activeModule][scenarioIndex] : null;
  const currentInsight = activeModule ? SCENARIO_INSIGHTS[activeModule][scenarioIndex] : null;
  const currentMasteryLevel = activeModule ? (scenarioMastery[scenarioIndex] ?? 0) : 0;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.key === "?" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        setShowHelp((v) => !v);
      }
      if (event.key === "Escape") {
        setShowHelp(false);
        if (result) { setResult(null); setResponse(""); }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result]);

  useEffect(() => {
    if (managementUnlocked) setMgmtUnlocked(true);
  }, [managementUnlocked]);

  // Load mastery-based progress – skipped when parent prefetched initial data
  useEffect(() => {
    if (initialProgress) return;
    async function fetchProgress() {
      try {
        let token = userToken;
        if (!token) {
          const supabase = createSupabaseBrowserClient();
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token;
        }
        const res = await fetch("/api/training/progress", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.modules) setModuleProgress(data.modules);
        if (data.mastery) setModuleMastery(data.mastery);
        if (data.reviewQueue) setReviewQueue(data.reviewQueue);
        if (data.autoUnlockManagement) setMgmtUnlocked(true);
      } catch {
        // non-critical
      }
    }
    void fetchProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load per-scenario mastery when active module changes
  useEffect(() => {
    if (!activeModule) return;
    async function fetchScenarioDetails() {
      try {
        let token = userToken;
        if (!token) {
          const supabase = createSupabaseBrowserClient();
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token;
        }
        const res = await fetch(`/api/training/progress?detail=${activeModule}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.scenarioDetails) {
          const map: Record<number, number> = {};
          for (const row of data.scenarioDetails) {
            map[row.scenario_index] = row.mastery_level;
          }
          setScenarioMastery(map);
        }
      } catch {
        // non-critical
      }
    }
    void fetchScenarioDetails();
  }, [activeModule]);

  function selectModule(mod: Module) {
    // Go directly to scenarios (level gating handled by ModuleVerify in V3)
    const dueReview = reviewQueue.find((r) => r.module === mod);
    // Guard against stale review queue indices that exceed the current scenario count
    const validIndex =
      dueReview && dueReview.scenarioIndex < SCENARIOS[mod].length
        ? dueReview.scenarioIndex
        : 0;
    setActiveModule(mod);
    setScenarioIndex(validIndex);
    setResponse("");
    setBubbleText("");
    setResult(null);
    setLastScore(null);
    setError("");
    setMasteryFeedback(null);
  }

  function nextScenario() {
    if (!activeModule) return;
    const prev = result?.overallScore ?? null;
    setLastScore(prev);

    const scenarioCount = SCENARIOS[activeModule].length;
    // Only use spaced repetition for scenarios ahead of current position – never go backward
    const dueAhead = reviewQueue.filter(
      (r) => r.module === activeModule && r.scenarioIndex > scenarioIndex && r.scenarioIndex < scenarioCount,
    );
    let next: number;
    if (dueAhead.length > 0) {
      next = dueAhead[0].scenarioIndex;
    } else {
      next = (scenarioIndex + 1) % scenarioCount;
    }

    setScenarioIndex(next);
    setResponse("");
    setResult(null);
    setError("");
    setMasteryFeedback(null);
  }

  function applyPill(text: string) {
    setResponse(text);
    setBubbleText("");
    setResult(null);
    setError("");
  }

  async function handleSubmit() {
    const fullResponse = response || bubbleText;
    if (!currentScenario || !fullResponse.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setMasteryFeedback(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: currentScenario.text, userResponse: fullResponse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed.");
      setResult(data);

      // Fire-and-forget: persist via mastery engine
      if (activeModule) {
        const mod = activeModule;
        const score = data.overallScore as number;
        const idx = scenarioIndex;
        void (async () => {
          try {
            const supabase = createSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();
            const saveRes = await fetch("/api/training/save", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
              },
              body: JSON.stringify({ module: mod, overallScore: score, scenarioIndex: idx, confidence: "medium" }),
            });
            const saveData = await saveRes.json();
            if (saveData.mastery) {
              setMasteryFeedback(saveData.mastery);
              // Optimistic: update scenario mastery level locally
              setScenarioMastery((prev) => ({ ...prev, [idx]: saveData.mastery.level }));
              // If this scenario was newly passed (level went from 0 to >=1), update progress
              if (saveData.mastery.levelChanged && saveData.mastery.level >= 1 && saveData.mastery.previousLevel === 0) {
                const scenarioCount = SCENARIOS[mod].length;
                setModuleProgress((prev) => ({
                  ...prev,
                  [mod]: Math.min(prev[mod] + Math.round(100 / scenarioCount), 100),
                }));
              }
              // Update mastery %
              if (saveData.mastery.level === 3 && saveData.mastery.previousLevel < 3) {
                const scenarioCount = SCENARIOS[mod].length;
                setModuleMastery((prev) => ({
                  ...prev,
                  [mod]: Math.min(prev[mod] + Math.round(100 / scenarioCount), 100),
                }));
              }
            }
          } catch {
            // Non-critical
          }
        })();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TrainerCommandBar
        activeModule={activeModule}
        hasResult={!!result}
        scenarioIndex={scenarioIndex}
        scenarioCount={activeModule ? SCENARIOS[activeModule].length : 0}
        moduleProgress={activeModule ? moduleProgress[activeModule] : 0}
        moduleMastery={activeModule ? moduleMastery[activeModule] : 0}
        onBack={() => { setActiveModule(null); setResult(null); setResponse(""); }}
      />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {!result && (
        <ModuleSelectGrid
          displayName={displayName}
          activeModule={activeModule}
          mgmtUnlocked={mgmtUnlocked}
          moduleProgress={moduleProgress}
          moduleMastery={moduleMastery}
          onSelectModule={selectModule}
        />
      )}

      {/* Training session */}
      {activeModule && currentScenario && (
        <div className="trainer-panel" key={`${activeModule}-${scenarioIndex}`}>
          <div className="trainer-scenario">
            <span className="trainer-label">
              Scenario {scenarioIndex + 1} of {SCENARIOS[activeModule].length}
              {currentMasteryLevel > 0 && (
                <span className="sbe-mastery-badge" data-level={currentMasteryLevel}>
                  {currentMasteryLevel === 3 ? '★ Mastered' : currentMasteryLevel === 2 ? '◆ Proficient' : '● Learning'}
                </span>
              )}
            </span>
            <p>{currentScenario.text}</p>
          </div>

          {!result && (
            <ScenarioPractice
              scenario={currentScenario}
              response={response}
              bubbleText={bubbleText}
              loading={loading}
              isBridgeHint={!!masteryFeedback?.isBridge}
              onApplyPill={applyPill}
              onBubbleTextChange={setBubbleText}
              onResponseChange={setResponse}
              onSubmit={handleSubmit}
              onSkip={nextScenario}
            />
          )}

          {error && <div className="trainer-error">{error}</div>}

          {result && (
            <EvaluationResult
              result={result}
              lastScore={lastScore}
              currentInsight={currentInsight}
              masteryFeedback={masteryFeedback}
              activeModule={activeModule}
              currentScenario={currentScenario}
              onNext={nextScenario}
              onTryAgain={() => { setResult(null); setResponse(""); }}
            />
          )}
        </div>
      )}
    </>
  );
}
