type ProgressOverviewProps = {
  displayName: string;
  plan: string;
};

const METRICS = [
  { label: "Sessions completed", value: "18", note: "Across bartending, sales and management" },
  { label: "Average evaluation", value: "21/25", note: "Strong communication and hospitality baseline" },
  { label: "Current streak", value: "6 days", note: "Consistent repetition drives faster retention" },
];

const MODULE_PROGRESS = [
  { label: "Bartending fundamentals", progress: 72, status: "On track", detail: "Cocktail specs, service rhythm and guest acknowledgment" },
  { label: "Sales conversations", progress: 48, status: "Improving", detail: "Recommendation confidence and objection handling" },
  { label: "Shift leadership", progress: 31, status: "Building", detail: "Delegation, coaching and short-notice problem solving" },
];

const FOCUS_AREAS = [
  "Premium recommendation language is getting stronger.",
  "Management scenarios improve when responses include clearer delegation.",
  "Fastest gains are coming from repeating the same module twice in one week.",
];

const RECENT_WINS = [
  "Negroni build response scored 23/25 after better explanation of balance and garnish.",
  "Steak pairing scenario improved after using flavour-led recommendation language.",
  "Late sick-call scenario showed stronger leadership once tasks were reassigned explicitly.",
];

export default function ProgressOverview({ displayName, plan }: ProgressOverviewProps) {
  return (
    <div className="progress-overview">
      <div className="progress-hero">
        <div>
          <span className="eyebrow">Progress</span>
          <h1>{displayName}&rsquo;s training snapshot</h1>
          <p>
            A quick view of momentum, coaching signals and what to work on next.
            {plan === "free"
              ? " Free access keeps the basics visible so members can see the value before upgrading."
              : " Your paid plan is set up to reinforce the highest-impact scenarios first."}
          </p>
        </div>
        <div className="progress-next-card">
          <span className="progress-next-label">Recommended next session</span>
          <strong>Run one sales scenario and one management scenario back-to-back.</strong>
          <p>
            This will tighten recommendation language while building better operational decision-making under pressure.
          </p>
        </div>
      </div>

      <div className="progress-metric-grid">
        {METRICS.map((metric) => (
          <article key={metric.label} className="progress-metric-card">
            <span className="progress-metric-label">{metric.label}</span>
            <strong className="progress-metric-value">{metric.value}</strong>
            <p>{metric.note}</p>
          </article>
        ))}
      </div>

      <div className="progress-layout">
        <section className="progress-panel">
          <div className="progress-panel-header">
            <h2>Module completion</h2>
            <span>Updated after each scored session</span>
          </div>

          <div className="progress-module-list">
            {MODULE_PROGRESS.map((module) => (
              <div key={module.label} className="progress-module-item">
                <div className="progress-module-top">
                  <div>
                    <strong>{module.label}</strong>
                    <p>{module.detail}</p>
                  </div>
                  <span className="progress-status-chip">{module.status}</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${module.progress}%` }} />
                </div>
                <div className="progress-module-foot">
                  <span>{module.progress}% complete</span>
                  <span>Next unlock: advanced guest handling</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="progress-panel progress-panel-stack">
          <div className="progress-panel-block">
            <div className="progress-panel-header">
              <h2>Coach notes</h2>
              <span>What the AI is seeing</span>
            </div>
            <ul className="progress-list">
              {FOCUS_AREAS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="progress-panel-block">
            <div className="progress-panel-header">
              <h2>Recent wins</h2>
              <span>Useful proof of momentum</span>
            </div>
            <ul className="progress-list">
              {RECENT_WINS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}