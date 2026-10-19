"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { CATEGORY_CERT_LABELS, CATEGORY_ICONS, type ModuleSummary, type TrainingData } from "./progress-types";

type ActivityLogProps = {
  arenaProgress: TrainingData["arenaProgress"];
  modules: ModuleSummary[];
  expandedArenaCats: Set<string>;
  onToggleArenaCategory: (key: string) => void;
  onNavigate?: (nav: string) => void;
};

// Live Guest results, one row per module (the roleplay row the retired AI
// Arena also used). Scenario Training's history stays in the database but is
// no longer shown here: the screen was retired in the Rich update, Phase 8.
export default function ActivityLog({
  arenaProgress,
  modules,
  expandedArenaCats,
  onToggleArenaCategory,
  onNavigate,
}: ActivityLogProps) {
  const hasArenaData = Object.keys(arenaProgress).length > 0;

  return (
    <div className="progress-tab-panel" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">Live Guest</h2>
        <p className="progress-mastery-list-v2-sub">
          Your conversations with guests, one result per module. A conversation passes at 75 out of 100.
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
              No conversations yet. Try your first Live Guest.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate("live-guest")}
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--green)",
                  color: "var(--surface)",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Talk to a Live Guest
              </button>
            )}
          </div>
        ) : (
          (["technical", "service", "compliance"] as const).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const modulesInCat = modules.filter((m) => m.category === cat);
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
                              onClick={() => onNavigate?.("live-guest")}
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
