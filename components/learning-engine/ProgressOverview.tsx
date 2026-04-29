"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type ProgressOverviewProps = {
  displayName: string;
  plan: string;
};

type ModuleKey = "bartending" | "sales" | "management";

type LevelProgress = {
  level1_completed: boolean;
  level2_completed: boolean;
  level3_completed: boolean;
  level4_unlocked: boolean;
  level1_score: number;
  level2_score: number;
  level3_score: number;
};

type TrainingData = {
  modules: Record<ModuleKey, number>;   // completion 0–100%
  mastery: Record<ModuleKey, number>;   // mastery 0–100% (scenarios at level 3)
  scores: Record<ModuleKey, number>;    // avg score 0–25
  sessions: Record<ModuleKey, number>;  // total sessions completed
  elo: Record<ModuleKey, number>;       // Elo rating per module
  reviewDue: number;                    // spaced repetition items due now
  levelProgress: Record<ModuleKey, LevelProgress>;
};

const DEFAULT_LEVEL: LevelProgress = {
  level1_completed: false,
  level2_completed: false,
  level3_completed: false,
  level4_unlocked: false,
  level1_score: 0,
  level2_score: 0,
  level3_score: 0,
};

const EMPTY: TrainingData = {
  modules: { bartending: 0, sales: 0, management: 0 },
  mastery: { bartending: 0, sales: 0, management: 0 },
  scores: { bartending: 0, sales: 0, management: 0 },
  sessions: { bartending: 0, sales: 0, management: 0 },
  elo: { bartending: 1200, sales: 1200, management: 1200 },
  reviewDue: 0,
  levelProgress: {
    bartending: { ...DEFAULT_LEVEL },
    sales: { ...DEFAULT_LEVEL },
    management: { ...DEFAULT_LEVEL },
  },
};

const MODULE_LABELS: Record<ModuleKey, { label: string; detail: string; short: string }> = {
  bartending: { label: "Bartending fundamentals", detail: "Cocktail specs, service rhythm and guest acknowledgment", short: "Bartending" },
  sales: { label: "Sales conversations", detail: "Recommendation confidence and objection handling", short: "Sales" },
  management: { label: "Shift leadership", detail: "Delegation, coaching and short-notice problem solving", short: "Leadership" },
};

const BADGE_LEGEND = [
  { label: "Stage Complete", icon: "◆", note: "Stage 1 or 2 passed" },
  { label: "Advanced", icon: "◈", note: "Stage 3 passed" },
  { label: "Scenario Master", icon: "▲", note: "Stage 4 avg ≥ 21/25" },
  { label: "Perfect", icon: "★", note: "100% module mastery" },
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

function buildBadgeStages(data: TrainingData) {
  const modules: ModuleKey[] = ["bartending", "sales", "management"];
  const badgeLabels = ["Bartending", "Sales & Upselling", "Leadership"];

  const stages = [
    {
      stage: "Stage 1 — Recall",
      desc: "Complete the rapid-fire quiz for each module",
      badges: modules.map((mod, i) => {
        const lp = data.levelProgress[mod];
        const earned = lp.level1_completed;
        return {
          id: `stage1-${mod}`,
          label: badgeLabels[i],
          icon: earned ? "◆" : "–",
          earned,
          earnedNote: earned ? `Quiz passed (${lp.level1_score} streak)` : undefined,
        };
      }),
    },
    {
      stage: "Stage 2 — Application",
      desc: "Pass the descriptor selection challenge for each module",
      badges: modules.map((mod, i) => {
        const lp = data.levelProgress[mod];
        const earned = lp.level2_completed;
        return {
          id: `stage2-${mod}`,
          label: badgeLabels[i],
          icon: earned ? "◆" : "–",
          earned,
          earnedNote: earned ? `Descriptors mastered (${lp.level2_score} correct)` : undefined,
        };
      }),
    },
    {
      stage: "Stage 3 — Advanced",
      desc: "Complete the advanced descriptor challenge for each module",
      badges: modules.map((mod, i) => {
        const lp = data.levelProgress[mod];
        const earned = lp.level3_completed;
        return {
          id: `stage3-${mod}`,
          label: badgeLabels[i],
          icon: earned ? "◈" : "–",
          earned,
          earnedNote: earned ? `Advanced complete (${lp.level3_score} correct)` : undefined,
        };
      }),
    },
    {
      stage: "Stage 4 — Scenario Mastery",
      desc: "Score ≥ 21/25 in a live scenario session for each module",
      badges: modules.map((mod, i) => {
        const s = data.sessions[mod];
        const avg = data.scores[mod];
        const earned = s >= 1 && avg >= 21;
        const isPerfect = data.modules[mod] >= 100;
        return {
          id: `stage4-${mod}`,
          label: badgeLabels[i],
          icon: earned ? (isPerfect ? "★" : "▲") : "–",
          earned,
          earnedNote: earned
            ? isPerfect
              ? "Module mastered!"
              : `Avg ${avg}/25 over ${s} session${s !== 1 ? "s" : ""}`
            : undefined,
        };
      }),
    },
  ];

  return stages.map((s) => ({
    ...s,
    masteryComplete: s.badges.every((b) => b.earned),
  }));
}

function buildModuleCertifications(data: TrainingData) {
  const certs = [
    { mod: "bartending" as ModuleKey, label: "Certified Bartender", sub: "All 4 stages complete" },
    { mod: "sales" as ModuleKey, label: "Sales Specialist", sub: "All 4 stages complete" },
    { mod: "management" as ModuleKey, label: "Lead Communicator", sub: "All 4 stages complete" },
  ];
  return certs.map(({ mod, label, sub }) => {
    const lp = data.levelProgress[mod];
    const s = data.sessions[mod];
    const avg = data.scores[mod];
    const certified = lp.level1_completed && lp.level2_completed && lp.level3_completed && s >= 1 && avg >= 21;
    return { mod, label, sub, certified };
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

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch("/api/training/progress", {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        const res = await r.json();
        if (res.modules) {
          setData({
            modules: res.modules,
            mastery: res.mastery ?? { bartending: 0, sales: 0, management: 0 },
            scores: res.scores ?? { bartending: 0, sales: 0, management: 0 },
            sessions: res.sessions ?? { bartending: 0, sales: 0, management: 0 },
            elo: res.elo ?? { bartending: 1200, sales: 1200, management: 1200 },
            reviewDue: Array.isArray(res.reviewQueue) ? res.reviewQueue.length : 0,
            levelProgress: {
              bartending: res.levelProgress?.bartending ?? { ...DEFAULT_LEVEL },
              sales: res.levelProgress?.sales ?? { ...DEFAULT_LEVEL },
              management: res.levelProgress?.management ?? { ...DEFAULT_LEVEL },
            },
          });
        }
      } catch {
        // non-critical
      }
    }
    void load();
  }, []);

  const totalSessions = data.sessions.bartending + data.sessions.sales + data.sessions.management;
  const avgProgress = Math.round((data.modules.bartending + data.modules.sales + data.modules.management) / 3);
  const weakest = getWeakestModule(data);
  const strongest = getStrongestModule(data);

  const BADGE_STAGES = buildBadgeStages(data);
  const MODULE_CERTS = buildModuleCertifications(data);
  const certifiedCount = MODULE_CERTS.filter((c) => c.certified).length;
  const isVeteran = totalSessions >= 25;
  const isPrecisionExpert = (["bartending", "sales", "management"] as ModuleKey[]).some((mod) => data.scores[mod] >= 25);
  const COACH_COMMANDS = COACH_FOCUS[weakest];
  const RECENT_WINS = buildRecentWins(data);

  const avgMastery = Math.round((data.mastery.bartending + data.mastery.sales + data.mastery.management) / 3);

  const MODULE_PROGRESS = (["bartending", "sales", "management"] as ModuleKey[]).map((mod) => ({
    mod,
    label: MODULE_LABELS[mod].label,
    detail: MODULE_LABELS[mod].detail,
    progress: data.modules[mod],
    mastery: data.mastery[mod],
    avgScore: data.scores[mod],
    sessions: data.sessions[mod],
    status: data.mastery[mod] >= 80 ? "Mastered" : data.modules[mod] > 60 ? "On track" : data.modules[mod] > 30 ? "Improving" : data.modules[mod] > 0 ? "Building" : "Not started",
  }));

  const MOMENTUM_METRICS = [
    { icon: "◈", headline: `${avgProgress}% complete · ${avgMastery}% mastered`, sub: "Completion = scenarios passed. Mastery = repeated excellence." },
    { icon: "↑", headline: `${totalSessions} session${totalSessions !== 1 ? "s" : ""}`, sub: "Total training sessions completed." },
    {
      icon: "→",
      headline: totalSessions === 0 ? "Start training below" : data.reviewDue > 0 ? `${data.reviewDue} review${data.reviewDue !== 1 ? "s" : ""} due` : `Strongest: ${MODULE_LABELS[strongest].short}`,
      sub: totalSessions === 0 ? "Complete a scenario to track your momentum." : data.reviewDue > 0 ? "Spaced repetition items ready for review." : "Keep pushing your weakest module to round out your skills.",
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

      <div style={{
        background: "#f5f3ee",
        borderRadius: 12,
        padding: "18px 24px",
        marginBottom: 24,
        border: "1.5px solid #e5e1d8",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <strong style={{
            fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#0B2B1E",
          }}>
            Total Mastery
          </strong>
          <span style={{
            fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
            fontSize: "0.8rem",
            color: "#6b6860",
          }}>
            {certifiedCount}/3 modules certified
          </span>
        </div>
        <div style={{ background: "#e5e1d8", borderRadius: 6, height: 8, overflow: "hidden" }}>
          <div style={{
            background: "#0B2B1E",
            height: "100%",
            width: `${Math.round((certifiedCount / 3) * 100)}%`,
            borderRadius: 6,
            transition: "width 0.4s ease",
          }} />
        </div>
        <p style={{
          margin: "8px 0 0",
          fontSize: "0.75rem",
          color: "#a39e95",
          fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}>
          {certifiedCount === 0
            ? "Complete all 4 stages in a module to earn your first certification."
            : certifiedCount === 3
            ? "All modules certified — full mastery achieved."
            : `${3 - certifiedCount} module${3 - certifiedCount !== 1 ? "s" : ""} remaining to reach full mastery.`}
        </p>
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
                {module.mastery > 0 && (
                  <div className="progress-bar-track" style={{ marginTop: 4, opacity: 0.8 }}>
                    <div className="progress-bar-fill" style={{ width: `${module.mastery}%`, background: '#a855f7' }} />
                  </div>
                )}
                <div className="progress-module-foot">
                  <span>{parseFloat(module.progress.toFixed(2))}% complete · {parseFloat(module.mastery.toFixed(2))}% mastered</span>
                  <span>{module.sessions > 0 ? `Avg score: ${parseFloat(module.avgScore.toFixed(2))}/25` : "No sessions yet"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="progress-panel">
          <div className="progress-panel-header">
            <h2>Badges &amp; Achievements</h2>
            <span>Certifications · Milestones · Skill Drills</span>
          </div>

          {/* Tier 1 — Module Certifications */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b6860", fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif", fontWeight: 600 }}>Module Certifications</h3>
              <span style={{ fontSize: "0.73rem", color: "#a39e95" }}>All 4 stages required</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 10 }}>
              {MODULE_CERTS.map((cert) => (
                <div
                  key={cert.mod}
                  style={{
                    background: cert.certified ? "#0B2B1E" : "#f5f3ee",
                    borderRadius: 10,
                    padding: "18px 12px",
                    textAlign: "center",
                    border: cert.certified ? "none" : "1.5px solid #e5e1d8",
                  }}
                >
                  <div style={{
                    fontSize: 26,
                    lineHeight: 1,
                    marginBottom: 8,
                    color: cert.certified ? "#a3e635" : "#c9c4bb",
                    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}>
                    {cert.certified ? "★" : "–"}
                  </div>
                  <strong style={{
                    display: "block",
                    fontSize: "0.76rem",
                    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                    fontWeight: 600,
                    color: cert.certified ? "#fff" : "#5a5650",
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}>
                    {cert.label}
                  </strong>
                  <span style={{
                    fontSize: "0.68rem",
                    color: cert.certified ? "rgba(255,255,255,0.6)" : "#a39e95",
                    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}>
                    {cert.certified ? "Certified" : cert.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2 — Tactical Experience */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b6860", fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif", fontWeight: 600 }}>Tactical Experience</h3>
              <span style={{ fontSize: "0.73rem", color: "#a39e95" }}>Performance milestones</span>
            </div>
            <div className="badge-row">
              <div
                className={`badge-item ${isVeteran ? "earned" : "tba"}`}
                title={isVeteran ? `${totalSessions} sessions completed` : "Complete 25 training sessions to unlock"}
              >
                <div className="badge-shield">
                  <span className="badge-icon">{isVeteran ? "▲" : "–"}</span>
                </div>
                <div className="badge-label">
                  <strong>Veteran</strong>
                  <span className="badge-note">{isVeteran ? `${totalSessions} sessions done` : `${totalSessions}/25 sessions`}</span>
                </div>
              </div>
              <div
                className={`badge-item ${isPrecisionExpert ? "earned" : "tba"}`}
                title={isPrecisionExpert ? "Perfect 25/25 achieved" : "Achieve a 25/25 avg score in any module"}
              >
                <div className="badge-shield">
                  <span className="badge-icon">{isPrecisionExpert ? "★" : "–"}</span>
                </div>
                <div className="badge-label">
                  <strong>Precision Expert</strong>
                  <span className="badge-note">{isPrecisionExpert ? "Perfect score achieved" : "25/25 avg to unlock"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 3 — Skill Drills */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b6860", fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif", fontWeight: 600 }}>Skill Drills</h3>
              <span style={{ fontSize: "0.73rem", color: "#a39e95" }}>Stage-by-stage progress</span>
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
                        <span className="badge-mastery-note">All modules complete</span>
                      )}
                    </div>
                    {"desc" in stageData && stageData.desc && (
                      <span className="badge-stage-desc">{stageData.desc}</span>
                    )}
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

