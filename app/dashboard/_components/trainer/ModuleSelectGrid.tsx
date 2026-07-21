"use client";

import type { Module } from "./trainer-data";
import { MODULE_META } from "./trainer-data";

export default function ModuleSelectGrid({
  displayName,
  activeModule,
  mgmtUnlocked,
  moduleProgress,
  moduleMastery,
  onSelectModule,
}: {
  displayName: string;
  activeModule: Module | null;
  mgmtUnlocked: boolean;
  moduleProgress: Record<Module, number>;
  moduleMastery: Record<Module, number>;
  onSelectModule: (mod: Module) => void;
}) {
  return (
    <>
      {!activeModule && (
        <>
          <h1 className="dash-welcome">Welcome back, {displayName}.</h1>
          <p className="dash-copy">Choose a module to pick up where you left off, or follow the recommendation above.</p>
        </>
      )}

      <div className="dash-cards">
        {(Object.keys(MODULE_META) as Module[]).filter((mod) => mgmtUnlocked || mod !== "management").map((mod) => (
          <div
            key={mod}
            role="button"
            tabIndex={0}
            aria-pressed={activeModule === mod}
            className={`dash-card${activeModule === mod ? " dash-card-active" : ""}`}
            onClick={() => onSelectModule(mod)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectModule(mod); } }}
            style={activeModule === mod ? { borderColor: MODULE_META[mod].color, boxShadow: `0 0 0 3px ${MODULE_META[mod].color}22` } : {}}
          >
            <h3>{MODULE_META[mod].label}</h3>
            <div className="dash-card-progress-row">
              <div className="dash-card-progress-bar">
                <div className="dash-card-progress-fill" style={{ width: `${moduleProgress[mod]}%`, background: MODULE_META[mod].color }} />
              </div>
              <span className="dash-card-progress-pct">{moduleProgress[mod]}%</span>
            </div>
            {moduleMastery[mod] > 0 && (
              <div className="dash-card-progress-row" style={{ marginTop: 4 }}>
                <div className="dash-card-progress-bar">
                  <div className="dash-card-progress-fill" style={{ width: `${moduleMastery[mod]}%`, background: 'var(--color-indigo-light)' }} />
                </div>
                <span className="dash-card-progress-pct" style={{ color: 'var(--color-indigo-light)' }}>{moduleMastery[mod]}% mastered</span>
              </div>
            )}
            <p className="dash-card-next">{`Next: ${MODULE_META[mod].nextUp}`}</p>
            {activeModule === mod && <span className="dash-card-badge">Active</span>}
          </div>
        ))}
      </div>

      {!activeModule && (
        <div className="chat-box">
          <div className="chat-prompt">
            AI Coach: Use the recommendation above, or pick a module to begin a scored scenario session.
          </div>
          <div className="chat-actions">
            <div role="button" tabIndex={0} className="chat-pill" onClick={() => onSelectModule("bartending")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectModule("bartending"); } }}>Start Bartending</div>
            <div role="button" tabIndex={0} className="chat-pill" onClick={() => onSelectModule("sales")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectModule("sales"); } }}>Start Sales</div>
            {mgmtUnlocked && (
              <div role="button" tabIndex={0} className="chat-pill" onClick={() => onSelectModule("management")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectModule("management"); } }}>Start Management</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
