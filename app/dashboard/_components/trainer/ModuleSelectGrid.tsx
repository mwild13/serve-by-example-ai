"use client";

import type { Module } from "./trainer-data";
import { MODULE_META } from "./trainer-data";
import SharedTrainingCard from "../common/SharedTrainingCard";

export default function ModuleSelectGrid({
  activeModule,
  mgmtUnlocked,
  moduleProgress,
  moduleMastery,
  onSelectModule,
}: {
  activeModule: Module | null;
  mgmtUnlocked: boolean;
  moduleProgress: Record<Module, number>;
  moduleMastery: Record<Module, number>;
  onSelectModule: (mod: Module) => void;
}) {
  return (
    <div className="dash-cards">
      {(Object.keys(MODULE_META) as Module[]).filter((mod) => mgmtUnlocked || mod !== "management").map((mod) => (
        <SharedTrainingCard
          key={mod}
          title={MODULE_META[mod].label}
          description={`Next: ${MODULE_META[mod].nextUp}`}
          progressValue={moduleProgress[mod]}
          progressLabel={`${moduleProgress[mod]}%`}
          onClick={() => onSelectModule(mod)}
          selected={activeModule === mod}
          footerAction={
            moduleMastery[mod] > 0 ? (
              <div className="stc-progress-row">
                <div className="stc-progress-track">
                  <div
                    className="stc-progress-fill"
                    style={{ width: `${moduleMastery[mod]}%`, background: "var(--gold)" }}
                  />
                </div>
                <span className="stc-progress-label" style={{ color: "var(--gold)" }}>
                  {moduleMastery[mod]}% mastered
                </span>
              </div>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
