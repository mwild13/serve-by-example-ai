"use client";

import type { Module } from "./trainer-data";
import { MODULE_META } from "./trainer-data";

export default function TrainerCommandBar({
  activeModule,
  hasResult,
  scenarioIndex,
  scenarioCount,
  moduleProgress,
  moduleMastery,
  onBack,
}: {
  activeModule: Module | null;
  hasResult: boolean;
  scenarioIndex: number;
  scenarioCount: number;
  moduleProgress: number;
  moduleMastery: number;
  onBack: () => void;
}) {
  if (!activeModule) {
    return (
      <div className="sbe-command-bar">
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Scenario Training</span>
          <strong>Practice real hospitality situations</strong>
          <span className="sbe-command-meta">Scored roleplay across Bartending, Service &amp; Management</span>
        </div>
      </div>
    );
  }

  if (hasResult) return null;

  return (
    <div key={`cmd-${activeModule}`} className="sbe-command-bar sbe-command-bar-active">
      <div className="sbe-command-text">
        <span className="sbe-command-eyebrow">{MODULE_META[activeModule].label}</span>
        <strong>Scenario {scenarioIndex + 1} of {scenarioCount}</strong>
        <span className="sbe-command-meta">
          {moduleProgress}% complete · {moduleMastery}% mastered
        </span>
      </div>
      <button className="btn btn-secondary sbe-back-btn" onClick={onBack}>
        ← Back
      </button>
    </div>
  );
}
