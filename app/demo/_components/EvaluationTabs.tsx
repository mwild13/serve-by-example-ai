"use client";

import { useEffect, useRef } from "react";

export type EvaluationResult = {
  communication: number;
  hospitalityBehaviour: number;
  problemSolving: number;
  professionalism: number;
  guestExperience: number;
  overallScore: number;
  strengths: string;
  improvement: string;
  improvedResponse: string;
};

export type ScoreDimension = {
  key: keyof EvaluationResult;
  label: string;
};

export type EvalTab = "metrics" | "coach";

type EvaluationTabsProps = {
  result: EvaluationResult;
  dimensions: readonly ScoreDimension[];
  activeTab: EvalTab;
  onTabChange: (tab: EvalTab) => void;
};

export default function EvaluationTabs({
  result,
  dimensions,
  activeTab,
  onTabChange,
}: EvaluationTabsProps) {
  const focusRef = useRef<HTMLDivElement>(null);

  // This component only ever mounts immediately after a fresh score arrives
  // (the parent unmounts it via `result === null` before every re-submit), so
  // focusing once on mount is exactly "focus on score reveal" — no extra prop needed.
  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  const weakest = [...dimensions].sort(
    (a, b) => (result[a.key] as number) - (result[b.key] as number),
  )[0];
  const strongest = [...dimensions].sort(
    (a, b) => (result[b.key] as number) - (result[a.key] as number),
  )[0];

  return (
    <div className="eval-tabs" ref={focusRef} tabIndex={-1}>
      <div className="eval-tabs-bar" role="tablist" aria-label="Evaluation results">
        <button
          type="button"
          role="tab"
          id="eval-tab-metrics"
          aria-selected={activeTab === "metrics"}
          aria-controls="eval-panel-metrics"
          className={`eval-tab-btn${activeTab === "metrics" ? " eval-tab-active" : ""}`}
          onClick={() => onTabChange("metrics")}
        >
          Metrics Breakdown
        </button>
        <button
          type="button"
          role="tab"
          id="eval-tab-coach"
          aria-selected={activeTab === "coach"}
          aria-controls="eval-panel-coach"
          className={`eval-tab-btn${activeTab === "coach" ? " eval-tab-active" : ""}`}
          onClick={() => onTabChange("coach")}
        >
          AI Coach Advice
        </button>
      </div>

      {activeTab === "metrics" ? (
        <div
          className="eval-tabs-panel"
          role="tabpanel"
          id="eval-panel-metrics"
          aria-labelledby="eval-tab-metrics"
        >
          <div className="sbe-dimension-list">
            {dimensions.map(({ key, label }) => {
              const val = result[key] as number;
              const icon = val >= 4 ? "✔" : val === 3 ? "⚠" : "✖";
              const cls =
                val >= 4 ? "sbe-dim-good" : val === 3 ? "sbe-dim-warn" : "sbe-dim-miss";
              return (
                <div key={key} className={`sbe-dimension-row ${cls}`}>
                  <span className="sbe-dim-icon">{icon}</span>
                  <span className="sbe-dim-label">{label}</span>
                  <span className="sbe-dim-score">{val}/5</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="eval-tabs-panel"
          role="tabpanel"
          id="eval-panel-coach"
          aria-labelledby="eval-tab-coach"
        >
          <div className="sbe-coach-tip">
            <strong>Coach focus for your next attempt</strong>
            <p>→ {result.improvement}</p>
          </div>
          <div className="trainer-feedback">
            <div className="trainer-feedback-block trainer-feedback-good">
              <strong>✔ {strongest.label} – strength</strong>
              <p>{result.strengths}</p>
            </div>
            <div className="trainer-feedback-block trainer-feedback-improve">
              <strong>✖ {weakest.label} – missed opportunity</strong>
              <p>{result.improvement}</p>
            </div>
            <div className="trainer-feedback-block trainer-feedback-example">
              <strong>Stronger response</strong>
              <p>{result.improvedResponse}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
