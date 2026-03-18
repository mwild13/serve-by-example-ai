"use client";

import { useEffect, useState } from "react";

type ProgressOverviewProps = {
  displayName: string;
  plan: string;
};

type ModuleKey = "bartending" | "sales" | "management";

type TrainingData = {
  modules: Record<ModuleKey, number>;   // completion 0–100%
  scores: Record<ModuleKey, number>;    // avg score 0–25
  sessions: Record<ModuleKey, number>;  // total sessions completed
};

const EMPTY: TrainingData = {
  modules: { bartending: 0, sales: 0, management: 0 },
  scores: { bartending: 0, sales: 0, management: 0 },
  sessions: { bartending: 0, sales: 0, management: 0 },
};

const MODULE_LABELS: Record<ModuleKey, { label: string; detail: string; short: string }> = {
  bartending: { label: "Bartending fundamentals", detail: "Cocktail specs, service rhythm and guest acknowledgment", short: "Bartending" },
  sales: { label: "Sales conversations", detail: "Recommendation confidence and objection handling", short: "Sales" },
  management: { label: "Shift leadership", detail: "Delegation, coaching and short-notice problem solving", short: "Leadership" },
};

const BADGE_LEGEND = [
  { label: "Pass", icon: "🏅", note: "Score ≥ 21/25" },
  { label: "Perfect Score", icon: "⭐", note: "Score = 25/25" },
  { label: "Mastery", icon: "👑", note: "All modules complete" },
];

// Coach focus commands keyed by weakest module
const COACH_FOCUS: Record<ModuleKey, string[]> = {
  bartending: [
    "Acknowledge guests within 3 seconds of them reaching the bar.",
    "Name the spirit, the modifier, and the garnish when describing a cocktail.",
    "Recover a missed order gracefully — acknowledge, apologise, deliver.",
  ],
  sales: [
    "Offer one premium alternative per order — even when not asked.",
    "Lead with flavour language, not price, when recommending upgrades.",
    "Close every recommendation with a confident 'Would you like to try that?'",
  ],
  management: [
    "When reassigning tasks, name the person and the specific job out loud.",
    "Give one piece of specific, observable feedback after every shift.",
    "Pre-brief your team on the top 2 risks before a busy service starts.",
  ],
};

function badgeEarned(sessions: number, avgScore: number, threshold: number): boolean {
  return sessions >= threshold && avgScore >= 21;
}

function buildBadgeStages(data: TrainingData) {
  const modules: ModuleKey[] = ["bartending", "sales", "management"];
  const badgeLabels = ["Bartending Fundamentals", "Sales & Upselling", "Leadership & Coaching"];

  // Stage thresholds: [minSessions required to unlock]
  const stageThresholds = [1, 3, 6, 10];
  const stageIcons = ["🏅", "🏅", "🥇", "⭐"];

  return stageThresholds.map((threshold, stageIdx) => {
    const badges = modules.map((mod, i) => {
      const s = data.sessions[mod];
      const avg = data.scores[mod];
      const earned = badgeEarned(s, avg, threshold);
      const isPerfect = stageIdx === 3 && s >= 10 && data.modules[mod] >= 100;
      return {
        id: `stage${stageIdx + 1}-${mod}`,
        label: badgeLabels[i],
        icon: earned ? stageIcons[stageIdx] : "🛡️",
        earned,
        earnedNote: earned
          ? isPerfect
            ? "Module mastered!"
            : `Avg ${avg}/25 over ${s} session${s !== 1 ? "s" : ""}`
          : undefined,
      };
    });
    const masteryComplete = badges.every((b) => b.earned);
    return { stage: `Stage ${stageIdx + 1}`, masteryComplete, badges };
  });
}

function getWeakestModule(data: TrainingData): ModuleKey {
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  return keys.reduce((weakest, k) =>
    data.modules[k] < data.modules[weakest] ? k : weakest
  );
}

function getStrongestModule(data: TrainingData): ModuleKey {
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  return keys.reduce((strongest, k) =>
    data.modules[k] > data.modules[strongest] ? k : strongest
  );
}

function buildRecentWins(data: TrainingData): string[] {
  const wins: string[] = [];
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  for (const mod of keys) {
    const s = data.sessions[mod];
    const avg = data.scores[mod];
    const pct = data.modules[mod];
    if (s === 0) continue;
    if (avg >= 21) {
      wins.push(`${MODULE_LABELS[mod].short} averaging ${avg}/25 — above the pass threshold.`);
    } else if (pct > 0) {
      wins.push(`${MODULE_LABELS[mod].short} underway — ${s} session${s !== 1 ? "s" : ""} completed, avg score ${avg}/25.`);
    }
  }
  if (wins.length === 0) {
    wins.push("Complete your first scored session to start tracking wins here.");
  }
  return wins.slice(0, 3);
}

export default function ProgressOverview({ displayName, plan }: ProgressOverviewProps) {
  const [data, setData] = useState<TrainingData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/training/progress")
      .then((r) => r.json())
      .then((res) => {
        if (res.modules) {
          setData({
            modules: res.modules,
            scores: res.scores ?? { bartending: 0, sales: 0, management: 0 },
            sessions: res.sessions ?? { bartending: 0, sales: 0, management: 0 },
          });
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const totalSessions = data.sessions.bartending + data.sessions.sales + data.sessions.management;
  const avgProgress = Math.round((data.modules.bartending + data.modules.sales + data.modules.management) / 3);
  const weakest = getWeakestModule(data);
  const strongest = getStrongestModule(data);

  const BADGE_STAGES = buildBadgeStages(data);
  const COACH_COMMANDS = COACH_FOCUS[weakest];
  const RECENT_WINS = buildRecentWins(data);

  const MODULE_PROGRESS = (["bartending", "sales", "management"] as ModuleKey[]).map((mod) => ({
    mod,
    label: MODULE_LABELS[mod].label,
    detail: MODULE_LABELS[mod].detail,
    progress: data.modules[mod],
    avgScore: data.scores[mod],
    sessions: data.sessions[mod],
    status: data.modules[mod] > 60 ? "On track" : data.modules[mod] > 30 ? "Improving" : data.modules[mod] > 0 ? "Building" : "Not started",
  }));

  const MOMENTUM_METRICS = [
    { icon: "📊", headline: loaded ? `${avgProgress}% overall progress` : "Loading…", sub: "Across all three training modules." },
    { icon: "⚡", headline: loaded ? `${totalSessions} session${totalSessions !== 1 ? "s" : ""} completed` : "Loading…", sub: "Every session builds towards mastery." },
    {
      icon: "🎯",
      headline: totalSessions === 0 ? "Start training below" : `Strongest: ${MODULE_LABELS[strongest].short}`,
      sub: totalSessions === 0 ? "Complete a scenario to track your momentum." : "Keep pushing your weakest module to round out your skills.",
    },
  ];

  const recommendedNext = totalSessions === 0
    ? "Start with the Bartending module — it's the fastest way to build your foundation."
    : `Focus on ${MODULE_LABELS[weakest].label.toLowerCase()} — it's your most underdeveloped area right now.`;

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
          <strong>{recommendedNext}</strong>
          <p>
            {totalSessions === 0
              ? "Complete a scenario to unlock personalised training recommendations."
              : `Your ${MODULE_LABELS[weakest].short.toLowerCase()} score is ${data.scores[weakest]}/25 — run a session to push it above 21.`}
          </p>
        </div>
      </div>

      <div className="progress-metric-grid">
        {MOMENTUM_METRICS.map((metric) => (
          <article key={metric.icon} className="progress-metric-card sbe-momentum-card">
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
              <div key={module.mod} className="progress-module-item">
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
                  <span>{module.progress}% complete ({module.sessions}/{10} sessions)</span>
                  <span>{module.sessions > 0 ? `Avg score: ${module.avgScore}/25` : "No sessions yet"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="progress-panel">
          <div className="progress-panel-header">
            <h2>Badges &amp; Achievements</h2>
            <span>Earn badges by completing sessions with a score ≥ 21/25</span>
          </div>

          <div className="badge-legend">
            <span className="badge-legend-label">Badge progression:</span>
            <div className="badge-legend-items">
              {BADGE_LEGEND.map((item) => (
                <div key={item.label} className="badge-legend-item">
                  <span className="badge-legend-icon">{item.icon}</span>
                  <strong>{item.label}</strong>
                  <span className="badge-legend-note">{item.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="progress-badges-container">
            {BADGE_STAGES.map((stageData) => (
              <div key={stageData.stage} className="badge-stage">
                <div className="badge-stage-header">
                  <div className="badge-stage-title">
                    <h3>{stageData.stage}</h3>
                    {stageData.masteryComplete && (
                      <span className="badge-mastery-note">✓ All modules complete</span>
                    )}
                  </div>
                </div>
                <div className={`badge-row badge-row-${stageData.badges.length}`}>
                  {stageData.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`badge-item ${badge.earned ? "earned" : "tba"}`}
                      title={badge.earnedNote || "Not yet earned"}
                    >
                      <div className="badge-shield">
                        <span className="badge-icon">{badge.icon}</span>
                      </div>
                      <div className="badge-label">
                        <strong>{badge.label}</strong>
                        {badge.earned && badge.earnedNote && (
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
              <span>Based on your weakest module: {MODULE_LABELS[weakest].short}</span>
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
              <h2>Progress highlights</h2>
              <span>Based on your training so far</span>
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

