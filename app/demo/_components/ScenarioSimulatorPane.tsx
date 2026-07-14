"use client";

import { useDemoViewport } from "./useDemoViewport";
import EvaluationTabs, { type EvalTab, type EvaluationResult, type ScoreDimension } from "./EvaluationTabs";
import { CtaGuaranteeBlock } from "./LeadCapturePane";

export type ModuleId = "bartending" | "sales" | "management";

export type PillOption = {
  intent: string;
  text: string;
  positive: boolean;
};

export type DemoScenario = {
  id: ModuleId;
  category: string;
  title: string;
  prompt: string;
  pills: PillOption[];
};

type ScenarioSimulatorPaneProps = {
  scenarios: DemoScenario[];
  activeModuleId: ModuleId;
  activeScenario: DemoScenario;
  response: string;
  loading: boolean;
  result: EvaluationResult | null;
  error: string;
  activeEvalTab: EvalTab;
  dimensions: readonly ScoreDimension[];
  onSelectModule: (id: ModuleId) => void;
  onApplyPill: (text: string) => void;
  onResponseChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onRetry: () => void;
  onTabChange: (tab: EvalTab) => void;
};

export default function ScenarioSimulatorPane({
  scenarios,
  activeModuleId,
  activeScenario,
  response,
  loading,
  result,
  error,
  activeEvalTab,
  dimensions,
  onSelectModule,
  onApplyPill,
  onResponseChange,
  onSubmit,
  onSkip,
  onRetry,
  onTabChange,
}: ScenarioSimulatorPaneProps) {
  const isMobile = useDemoViewport();

  return (
    <div className="demo-left-pane">
      <div className="demo-scenario-picker">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={`demo-scenario-chip${activeModuleId === scenario.id ? " active" : ""}`}
            onClick={() => onSelectModule(scenario.id)}
          >
            <span className="demo-scenario-chip-category">{scenario.category}</span>
            <span>{scenario.title}</span>
          </button>
        ))}
      </div>

      {!result && (
        <div className="trainer-panel" key={activeModuleId}>
          <div className="trainer-scenario">
            <span className="trainer-label">{activeScenario.category} scenario</span>
            <p>{activeScenario.prompt}</p>
          </div>

          <div className="trainer-pills">
            <span className="trainer-hint">Choose an approach, or write your own response below</span>
            <div className="chat-actions sbe-intent-pills">
              {activeScenario.pills.map((pill) => (
                <button
                  key={pill.intent}
                  type="button"
                  className={`sbe-intent-pill${response === pill.text ? " sbe-intent-pill-active" : ""}${!pill.positive ? " sbe-intent-pill-negative" : ""}`}
                  onClick={() => onApplyPill(pill.text)}
                >
                  <span className="sbe-intent-icon">{pill.positive ? "+" : "–"}</span>
                  {pill.intent}
                </button>
              ))}
            </div>
          </div>

          <div className="trainer-input-row">
            <textarea
              className="trainer-textarea"
              placeholder="Write your full response here…"
              value={response}
              onChange={(e) => onResponseChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();
              }}
              rows={4}
            />
            <div className="trainer-actions">
              <button
                className="btn btn-primary"
                onClick={onSubmit}
                disabled={loading || !response.trim()}
                type="button"
              >
                {loading ? "Evaluating…" : "Check my response"}
              </button>
              <button className="btn btn-secondary" onClick={onSkip} type="button">
                Skip →
              </button>
            </div>
          </div>

          {error && <div className="trainer-error">{error}</div>}
        </div>
      )}

      {result && (
        <div className="trainer-result">
          <div className="sbe-score-hero">
            <div className="sbe-score-number">
              <span className="sbe-score-val">{result.overallScore}</span>
              <span className="sbe-score-denom">/25</span>
            </div>
            <span className="sbe-score-delta sbe-delta-first">Demo evaluation</span>
          </div>

          {isMobile && (
            <div className="demo-cta-inline-mount">
              <CtaGuaranteeBlock variant="light" />
            </div>
          )}

          <EvaluationTabs
            result={result}
            dimensions={dimensions}
            activeTab={activeEvalTab}
            onTabChange={onTabChange}
          />

          <div className="trainer-after">
            <button className="btn btn-secondary" onClick={onSkip} type="button">
              Try another module →
            </button>
            <button className="btn btn-secondary" onClick={onRetry} type="button">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
