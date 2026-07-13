"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { CATEGORY_CERT_LABELS, CATEGORY_ICONS, type ModuleSummary, type TrainingData } from "./progress-types";

type ActivityLogProps = {
  scenarioStats: TrainingData["scenarioStats"];
  arenaProgress: TrainingData["arenaProgress"];
  modules: ModuleSummary[];
  expandedScenarioAreas: Set<string>;
  onToggleScenarioArea: (key: string) => void;
  expandedArenaCats: Set<string>;
  onToggleArenaCategory: (key: string) => void;
  onNavigate?: (nav: string) => void;
};

export default function ActivityLog({
  scenarioStats,
  arenaProgress,
  modules,
  expandedScenarioAreas,
  onToggleScenarioArea,
  expandedArenaCats,
  onToggleArenaCategory,
  onNavigate,
}: ActivityLogProps) {
  const totalArenaPasses = Object.values(arenaProgress).filter((p) => p.passed).length;
  const hasArenaData = Object.keys(arenaProgress).length > 0;

  return (
    <div className="progress-tab-panel" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Scenario Training */}
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">Scenario Training</h2>
        <p className="progress-mastery-list-v2-sub">
          Your written scenario practice history across all three training areas.
        </p>
        {(["bartending", "sales", "management"] as const).map((area) => {
          const areaLabel: Record<string, string> = { bartending: "Bartending", sales: "Sales", management: "Leadership" };
          const isOpen = expandedScenarioAreas.has(area);
          const sessions = scenarioStats.sessions[area];
          const score = Math.round(scenarioStats.scores[area]);
          return (
            <div key={area} style={{ marginBottom: 8 }}>
              <button className="progress-accordion-header" onClick={() => onToggleScenarioArea(area)} aria-expanded={isOpen}>
                <span className="progress-accordion-label">{areaLabel[area]}</span>
                <span className="progress-accordion-meta">{sessions} session{sessions !== 1 ? "s" : ""}</span>
                {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              {isOpen && (
                <div className="progress-accordion-body">
                  {sessions === 0 ? (
                    <div style={{ padding: "1rem", textAlign: "center" }}>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
                        Not yet started. Try your first {areaLabel[area]} scenario.
                      </p>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate("stage4")}
                          style={{ color: "var(--green)", fontSize: "0.82rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                        >
                          Start Scenario Training
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="progress-accordion-stat-row">
                        <span>Sessions completed</span><strong>{sessions}</strong>
                      </div>
                      <div className="progress-accordion-stat-row">
                        <span>Average score</span><strong>{score > 0 ? `${score}/25` : "No data yet"}</strong>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Scenario */}
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">AI Scenario</h2>
        <p className="progress-mastery-list-v2-sub">
          Live assessment results across all 20 scenarios. Pass threshold: 75/100.
        </p>

        {!hasArenaData ? (
          <div
            style={{
              padding: "2rem 1.5rem",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: "var(--radius-md)",
              marginTop: "1rem",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.75rem" }}>
              {totalArenaPasses}/10 passed – try your first AI Scenario
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate("scenarios")}
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--green)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Enter AI Scenarios
              </button>
            )}
          </div>
        ) : (
          (["technical", "service", "compliance"] as const).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const modulesInCat = modules.filter((m) => m.category === cat && m.id <= 20);
            const passedInCat = modulesInCat.filter((m) => arenaProgress[m.id]?.passed).length;
            const isOpen = expandedArenaCats.has(cat);
            return (
              <div key={cat} style={{ marginBottom: 8 }}>
                <button className="progress-accordion-header" onClick={() => onToggleArenaCategory(cat)} aria-expanded={isOpen}>
                  <span className="progress-accordion-icon"><Icon size={13} /></span>
                  <span className="progress-accordion-label">{CATEGORY_CERT_LABELS[cat]}</span>
                  <span className="progress-accordion-meta">{passedInCat}/{modulesInCat.length} passed</span>
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {isOpen && (
                  <div className="progress-accordion-body">
                    {modulesInCat.map((module) => {
                      const arena = arenaProgress[module.id];
                      return (
                        <div key={module.id} className="progress-mastery-row-v2" style={{ paddingLeft: 12 }}>
                          <span className="progress-mastery-row-title">{module.title}</span>
                          <span className={`progress-mastery-row-chip${arena?.passed ? " progress-mastery-row-chip--mastered" : ""}`}>
                            {arena?.passed ? "Passed" : arena?.attempts ? `Attempted (${arena.bestScore}/100)` : "Not started"}
                          </span>
                          {!arena?.passed && (
                            <button
                              className="progress-mastery-action progress-mastery-action--primary"
                              onClick={() => onNavigate?.("scenarios")}
                            >
                              {arena?.attempts ? "Retry" : "Start"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
