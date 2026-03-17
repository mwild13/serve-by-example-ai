type ProgressOverviewProps = {
  displayName: string;
  plan: string;
};

const MOMENTUM_METRICS = [
  { icon: "✅", headline: "Trained 4 days in a row", sub: "Keep it up — consistency is the fastest path to retention." },
  { icon: "📈", headline: "Up +2 points this week", sub: "Average evaluation improving. You're at 21/25 — top 30%." },
  { icon: "⚡", headline: "18 sessions completed", sub: "You've put in the reps. Growth compounds from here." },
];

const MODULE_PROGRESS = [
  { label: "Bartending fundamentals", progress: 72, status: "On track", detail: "Cocktail specs, service rhythm and guest acknowledgment" },
  { label: "Sales conversations", progress: 48, status: "Improving", detail: "Recommendation confidence and objection handling" },
  { label: "Shift leadership", progress: 31, status: "Building", detail: "Delegation, coaching and short-notice problem solving" },
];

const COACH_COMMANDS = [
  "Acknowledge guests within 3 seconds of them reaching the bar.",
  "Offer one premium alternative per order — even when not asked.",
  "When reassigning tasks, name the person and the specific job out loud.",
];

const RECENT_WINS = [
  "Negroni build scored 23/25 after better balance and garnish explanation.",
  "Steak pairing improved using flavour-led recommendation language.",
  "Late sick-call scenario: stronger once tasks were reassigned explicitly.",
];

const BADGE_STAGES = [
  {
    stage: "Stage 1",
    title: "Bartending Fundamentals",
    badges: [
      { id: "bartending-pass", label: "Pass", icon: "🏅", earned: true, earnedNote: "21+ score" },
      { id: "bartending-perfect", label: "Perfect Score", icon: "⭐", earned: true, earnedNote: "25/25" },
      { id: "bartending-mastery", label: "Mastery", icon: "👑", earned: true, earnedNote: "All modules" },
    ],
  },
  {
    stage: "Stage 2",
    title: "Sales & Upselling",
    badges: [
      { id: "sales-pass", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
      { id: "sales-perfect", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
      { id: "sales-mastery", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
    ],
  },
  {
    stage: "Stage 3",
    title: "Leadership & Coaching",
    badges: [
      { id: "leadership-pass", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
      { id: "leadership-perfect", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
      { id: "leadership-mastery", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
    ],
  },
  {
    stage: "Stage 4",
    title: "Management & Operations",
    badges: [
      { id: "management-pass", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
      { id: "management-perfect", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
      { id: "management-mastery", label: "TBA", icon: "🛡️", earned: false, earnedNote: undefined },
    ],
  },
];

export default function ProgressOverview({ displayName, plan }: ProgressOverviewProps) {
  return (
    <div className="progress-overview">
      <div className="progress-hero">
        <div>
          <span className="eyebrow">How I&rsquo;m improving</span>
          <h1>{displayName}&rsquo;s training momentum</h1>
          <p>
            Real movement, not just numbers.
            {plan === "free"
              ? " Free access shows your baseline — upgrade to unlock deeper coaching."
              : " Your paid plan prioritises the highest-impact scenarios first."}
          </p>
        </div>
        <div className="progress-next-card">
          <span className="progress-next-label">Recommended next session</span>
          <strong>Run one sales scenario and one management scenario back-to-back.</strong>
          <p>
            This tightens recommendation language while building better operational decision-making under pressure.
          </p>
        </div>
      </div>

      {/* Momentum metrics — movement, not totals */}
      <div className="progress-metric-grid">
        {MOMENTUM_METRICS.map((metric) => (
          <article key={metric.headline} className="progress-metric-card sbe-momentum-card">
            <span className="sbe-momentum-icon">{metric.icon}</span>
            <strong className="progress-metric-value">{metric.headline}</strong>
            <p>{metric.sub}</p>
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

        <section className="progress-panel">
          <div className="progress-panel-header">
            <h2>Badges & Achievements</h2>
            <span>Unlock badges by mastering each module</span>
          </div>

          <div className="progress-badges-container">
            {BADGE_STAGES.map((stageData) => (
              <div key={stageData.stage} className="badge-stage">
                <div className="badge-stage-header">
                  <h3>{stageData.stage}</h3>
                  <p>{stageData.title}</p>
                </div>
                <div className="badge-row">
                  {stageData.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`badge-item ${badge.earned ? "earned" : "tba"}`}
                      title={badge.earnedNote || ""}
                    >
                      <div className="badge-shield">
                        <span className="badge-icon">{badge.icon}</span>
                      </div>
                      <div className="badge-label">
                        <strong>{badge.label}</strong>
                        {badge.earned && badge?.earnedNote && (
                          <span className="badge-note">{badge.earnedNote}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="progress-panel progress-panel-stack">
          <div className="progress-panel-block">
            <div className="progress-panel-header">
              <h2>Coach focus for your next shift</h2>
              <span>Act on these — they move the needle</span>
            </div>
            <ul className="sbe-command-list">
              {COACH_COMMANDS.map((cmd) => (
                <li key={cmd}>
                  <span className="sbe-command-arrow">→</span>
                  {cmd}
                </li>
              ))}
            </ul>
          </div>

          <div className="progress-panel-block">
            <div className="progress-panel-header">
              <h2>Recent wins</h2>
              <span>Proof of momentum</span>
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


