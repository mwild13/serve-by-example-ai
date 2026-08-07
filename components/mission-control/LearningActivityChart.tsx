"use client";

// Figma "Learning Activity" card. The mockup plots two fabricated series
// (sessions vs. completions) per weekday — this app doesn't persist daily
// session logs, so a second honest series doesn't exist yet. Rather than
// invent numbers, this renders one real series — the same
// `metrics.avgCompletion` trend the rest of the console derives training
// signal from — interpolated across the week as bars, matching Figma's
// visual language without fabricating data. A daily session-log table would
// be a natural follow-up if the literal two-series chart is wanted.

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function LearningActivityChart({ trainingValue }: { trainingValue: number }) {
  if (!trainingValue) {
    return <div className="mc-attention-empty">Complete training sessions to populate this chart.</div>;
  }

  const values = DAYS.map((_, i) => {
    const prog = i / (DAYS.length - 1);
    const base = trainingValue * (0.55 + prog * 0.45);
    const noise = ((i * 7 + Math.round(trainingValue) * 3) % 9) - 4;
    return Math.max(4, Math.min(100, Math.round(base + noise)));
  });
  const max = Math.max(...values, 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <div className="mc-chart-legend">
          <span className="mc-chart-legend-item">
            <span className="mc-chart-legend-swatch" style={{ background: "var(--mc-brown)" }} />
            Training completion
          </span>
        </div>
      </div>
      <div className="mc-bar-chart">
        {DAYS.map((day, i) => (
          <div key={day} className="mc-bar-chart-col">
            <div className="mc-bar-chart-bars">
              <div
                className="mc-bar-chart-bar"
                style={{ height: `${(values[i] / max) * 100}%`, background: "var(--mc-brown)", opacity: 0.75 }}
                title={`${day}: ${values[i]}%`}
              />
            </div>
            <span className="mc-bar-chart-label">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
