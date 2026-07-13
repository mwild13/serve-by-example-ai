"use client";

import type { Scenario } from "./trainer-data";

export default function ScenarioPractice({
  scenario,
  response,
  bubbleText,
  loading,
  isBridgeHint,
  onApplyPill,
  onBubbleTextChange,
  onResponseChange,
  onSubmit,
  onSkip,
}: {
  scenario: Scenario;
  response: string;
  bubbleText: string;
  loading: boolean;
  isBridgeHint: boolean;
  onApplyPill: (text: string) => void;
  onBubbleTextChange: (text: string) => void;
  onResponseChange: (text: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      {isBridgeHint && (
        <div className="sbe-bridge-hint">
          <strong>Hint:</strong> Focus on the guest&apos;s emotional state first, then address their request. What would make them feel heard?
        </div>
      )}

      <div className="trainer-pills">
        <span className="trainer-hint">Choose an approach, or write your own response below</span>
        <div className="chat-actions sbe-intent-pills">
          {scenario.pills.map((pill) => (
            <button
              key={pill.text}
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
        {/* Speech bubble inputs */}
        {!response && (
          <div className="s4-bubble">
            <textarea
              className="s4-bubble-input"
              placeholder="Hey there! Welcome in... Product Knowledge... Upsell &amp; Close"
              value={bubbleText}
              onChange={(e) => onBubbleTextChange(e.target.value)}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit(); }}
              rows={6}
            />
            <span className={`s4-word-count${bubbleText.split(/\s+/).filter(Boolean).length >= 30 ? " s4-word-count-met" : ""}`}>
              {bubbleText.split(/\s+/).filter(Boolean).length} words · aim for 30+
            </span>
          </div>
        )}

        {/* Fallback: full free-text if they used a pill */}
        {response && (
          <textarea
            className="trainer-textarea"
            placeholder="Write your full response here…"
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit(); }}
            rows={4}
          />
        )}

        {/* Knowledge tip sidebar */}
        {!response && (
          <div className="s4-knowledge-tip">
            <strong>Knowledge tip</strong>
            <ul>
              {scenario.pills
                .filter((p) => p.positive)
                .slice(0, 2)
                .map((p) => (
                  <li key={p.intent}>{p.intent}</li>
                ))}
            </ul>
          </div>
        )}

        <div className="trainer-actions">
          <button
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={loading || (!response.trim() && !bubbleText.trim())}
          >
            {loading ? "Evaluating…" : "Check my response"}
          </button>
          <button className="btn btn-secondary" onClick={onSkip}>
            Skip →
          </button>
        </div>
      </div>
    </>
  );
}
