"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { computeBadges, countEarned, type ModuleSummaryForBadges, type CategoryScores } from "@/lib/badges";
import { Zap, GlassWater, Shield, Award, ChevronDown, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

type ProgressOverviewProps = {
  displayName: string;
  plan: string;
  onSelectModule?: (moduleId: number) => void;
  onNavigate?: (nav: string) => void;
};

type ModuleSummary = {
  id: number;
  title: string;
  category: "technical" | "service" | "compliance";
  mastered: boolean;
  attempted: boolean;
};

type TrainingData = {
  modules: ModuleSummary[];
  reviewDue: number;
  totalSessions: number;
  badgesEarned: number;
  scores: { bartending: number; sales: number; management: number };
  skillLevel: number;
  scenarioStats: {
    sessions: { bartending: number; sales: number; management: number };
    scores: { bartending: number; sales: number; management: number };
  };
  arenaProgress: Record<number, { attempts: number; bestScore: number; passed: boolean }>;
  challengesCompleted: number[];
};

const EMPTY: TrainingData = {
  modules: [],
  reviewDue: 0,
  totalSessions: 0,
  badgesEarned: 0,
  scores: { bartending: 0, sales: 0, management: 0 },
  skillLevel: 1,
  scenarioStats: {
    sessions: { bartending: 0, sales: 0, management: 0 },
    scores: { bartending: 0, sales: 0, management: 0 },
  },
  arenaProgress: {},
  challengesCompleted: [],
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  service: "Service",
  compliance: "Compliance",
};

const CATEGORY_CERT_LABELS: Record<string, string> = {
  technical: "Technical Specialist",
  service: "Service Expert",
  compliance: "Compliance Ready",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  technical: Zap,
  service: GlassWater,
  compliance: Shield,
};

const CHALLENGE_LABELS = ["Sequence Sort", "Fill the Blank", "Match Pair", "Spot the Error", "Multiple Choice"];

// ── Ghost chart for zero-data state ──────────────────────────────────────────

function GhostChart({ onNavigate, label }: { onNavigate?: (nav: string) => void; label: string }) {
  return (
    <div
      style={{
        height: 180,
        position: "relative",
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--line)",
        background: "var(--bg-alt)",
        overflow: "hidden",
      }}
    >
      {/* Faint gridlines */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 40,
            right: 16,
            top: `${20 + i * 18}%`,
            height: 1,
            background: "var(--line)",
            opacity: 0.5,
          }}
        />
      ))}
      {/* Faint ghost bars */}
      <div style={{ position: "absolute", bottom: 32, left: 60, right: 16, display: "flex", gap: "16px", alignItems: "flex-end" }}>
        {[40, 60, 45].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: "var(--line)", borderRadius: "4px 4px 0 0", opacity: 0.4 }} />
        ))}
      </div>
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          background: "rgba(245, 242, 233, 0.7)",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600, textAlign: "center", maxWidth: 220 }}>
          {label}
        </span>
        {onNavigate && (
          <button
            onClick={() => onNavigate("challenges")}
            style={{
              color: "var(--green)",
              fontSize: "0.82rem",
              fontWeight: 700,
              background: "none",
              border: "1px solid var(--green)",
              borderRadius: "var(--radius-sm)",
              padding: "5px 14px",
              cursor: "pointer",
            }}
          >
            Start a Challenge
          </button>
        )}
      </div>
    </div>
  );
}

// ── Skill meter (10 segments) ────────────────────────────────────────────────

function SkillMeter({ skillLevel }: { skillLevel: number }) {
  return (
    <div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {Array.from({ length: 10 }, (_, i) => {
          const filled = i < skillLevel;
          const isCurrent = i === skillLevel - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: "10px",
                borderRadius: "5px",
                background: filled ? "var(--green)" : "var(--line)",
                boxShadow: isCurrent ? "0 0 0 3px var(--gold-light)" : "none",
                transition: `background 120ms ${i * 40}ms ease`,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
          Skill Level {skillLevel} / 10
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          {skillLevel <= 3 ? "Apprentice" : skillLevel <= 6 ? "Specialist" : skillLevel <= 9 ? "Expert" : "Master"}
        </span>
      </div>
    </div>
  );
}

// ── Challenge progress cluster ───────────────────────────────────────────────

function ChallengeCluster({ completed, onNavigate }: { completed: number[]; onNavigate?: (nav: string) => void }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
        {CHALLENGE_LABELS.map((label, i) => {
          const done = completed.includes(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                border: done ? "none" : "1.5px solid var(--line)",
                background: done ? "var(--green-light)" : "transparent",
                color: done ? "var(--green)" : "var(--text-muted)",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              {done ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
              {label}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
          {completed.length} of 5 complete
        </p>
        {completed.length < 5 && onNavigate && (
          <button
            onClick={() => onNavigate("challenges")}
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--green)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Go to Challenges
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tab bar ──────────────────────────────────────────────────────────────────

type TabId = "overview" | "modules" | "activity";

function TabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "modules", label: "Modules" },
    { id: "activity", label: "Activity" },
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        background: "var(--bg-alt)",
        borderRadius: "var(--radius-md)",
        padding: "4px",
        marginBottom: "1.75rem",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            padding: "0.55rem 0.5rem",
            borderRadius: "calc(var(--radius-md) - 4px)",
            border: "none",
            background: active === t.id ? "var(--green)" : "transparent",
            color: active === t.id ? "white" : "var(--text-soft)",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 150ms ease, color 150ms ease",
          }}
          aria-selected={active === t.id}
          role="tab"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ProgressOverview({
  displayName,
  plan,
  onSelectModule,
  onNavigate,
}: ProgressOverviewProps) {
  const [data, setData] = useState<TrainingData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedArenaCats, setExpandedArenaCats] = useState<Set<string>>(new Set());
  const [expandedScenarioAreas, setExpandedScenarioAreas] = useState<Set<string>>(new Set());

  function toggleCategory(key: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleArenaCategory(key: string) {
    setExpandedArenaCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleScenarioArea(key: string) {
    setExpandedScenarioAreas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch("/api/training/progress", {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });
      const res = await r.json();

      if (res.allModules && res.moduleProgress) {
        const modules: ModuleSummary[] = (
          res.allModules as { id: number; title: string; category: string }[]
        ).map((m) => {
          const p = res.moduleProgress[m.id] ?? { scenariosAttempted: 0, scenariosMastered: 0 };
          return {
            id: m.id,
            title: m.title,
            category: m.category as "technical" | "service" | "compliance",
            mastered: (p.mastery ?? 0) >= 80,
            attempted: (p.scenariosAttempted ?? 0) > 0,
          };
        });
        const totalSessions =
          (res.sessions?.bartending ?? 0) +
          (res.sessions?.sales ?? 0) +
          (res.sessions?.management ?? 0);
        const allMods = res.allModules as { id: number; category: string }[] ?? [];
        const badgeModules: ModuleSummaryForBadges[] = allMods.map((m) => {
          const p = (res.moduleProgress as Record<number, { mastery?: number; scenariosAttempted?: number }>)?.[m.id] ?? {};
          return {
            category: m.category as "technical" | "service" | "compliance",
            mastered: (p.mastery ?? 0) >= 80,
            attempted: (p.scenariosAttempted ?? 0) > 0,
          };
        });
        const catAvg = (cat: string) => {
          const mods = allMods.filter((m) => m.category === cat);
          if (mods.length === 0) return 0;
          return Math.round(
            mods.reduce((sum, m) => sum + ((res.moduleProgress as Record<number, { mastery?: number }>)?.[m.id]?.mastery ?? 0), 0) / mods.length
          );
        };
        const badgeCategoryScores: CategoryScores = {
          bartending: catAvg("technical"),
          sales: catAvg("service"),
          management: catAvg("compliance"),
        };
        const allBadgesComputed = computeBadges(
          badgeModules,
          badgeCategoryScores,
          0,
          (res.bestCorrectStreak as number) ?? 0,
          (res.sbeEliteNumber as number) ?? 0,
        );
        const badgesEarned = countEarned(allBadgesComputed);
        let challengesCompleted: number[] = [];
        try {
          const stored = localStorage.getItem("sbe_challenges_completed");
          if (stored) challengesCompleted = JSON.parse(stored) as number[];
        } catch { /* ignore */ }

        setData({
          modules,
          reviewDue: Array.isArray(res.reviewQueue) ? res.reviewQueue.length : 0,
          totalSessions,
          badgesEarned,
          scores: {
            bartending: res.scores?.bartending ?? 0,
            sales: res.scores?.sales ?? 0,
            management: res.scores?.management ?? 0,
          },
          skillLevel: typeof res.skillLevel === "number" ? res.skillLevel : 1,
          scenarioStats: {
            sessions: {
              bartending: res.sessions?.bartending ?? 0,
              sales: res.sessions?.sales ?? 0,
              management: res.sessions?.management ?? 0,
            },
            scores: {
              bartending: res.scores?.bartending ?? 0,
              sales: res.scores?.sales ?? 0,
              management: res.scores?.management ?? 0,
            },
          },
          arenaProgress: (res.arenaProgress as TrainingData["arenaProgress"]) ?? {},
          challengesCompleted,
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const masteredCount = data.modules.filter((m) => m.mastered).length;
  const totalCount = data.modules.length || 20;
  const skillLevel = data.skillLevel;
  const highScore = Math.round(Math.max(data.scores.bartending, data.scores.sales, data.scores.management));

  const categoryGroups: Record<string, ModuleSummary[]> = {
    technical: data.modules.filter((m) => m.category === "technical"),
    service: data.modules.filter((m) => m.category === "service"),
    compliance: data.modules.filter((m) => m.category === "compliance"),
  };

  const categoryCerts = (["technical", "service", "compliance"] as const).map((cat) => ({
    category: cat,
    label: CATEGORY_CERT_LABELS[cat],
    mastered: categoryGroups[cat].filter((m) => m.mastered).length,
    total: categoryGroups[cat].length,
    certified: categoryGroups[cat].length > 0 && categoryGroups[cat].every((m) => m.mastered),
    nextModule: categoryGroups[cat].find((m) => !m.mastered) ?? null,
  }));

  const weakestCategory = (["technical", "service", "compliance"] as const).reduce(
    (weakest, cat) => {
      const wLen = categoryGroups[weakest].length;
      const cLen = categoryGroups[cat].length;
      const wPct = wLen > 0 ? categoryGroups[weakest].filter((m) => m.mastered).length / wLen : 1;
      const cPct = cLen > 0 ? categoryGroups[cat].filter((m) => m.mastered).length / cLen : 1;
      return cPct < wPct ? cat : weakest;
    },
    "technical" as "technical" | "service" | "compliance",
  );

  const firstUnmastered = data.modules.find((m) => !m.mastered) ?? null;

  const hasChartData = data.totalSessions > 0;

  const barChartData = [
    { name: "Bartending", score: Math.round(data.scores.bartending) },
    { name: "Sales", score: Math.round(data.scores.sales) },
    { name: "Management", score: Math.round(data.scores.management) },
  ];

  const technicalMastery = categoryGroups.technical.length > 0
    ? Math.round((categoryGroups.technical.filter((m) => m.mastered).length / categoryGroups.technical.length) * 100)
    : 0;
  const serviceMastery = categoryGroups.service.length > 0
    ? Math.round((categoryGroups.service.filter((m) => m.mastered).length / categoryGroups.service.length) * 100)
    : 0;
  const complianceMastery = categoryGroups.compliance.length > 0
    ? Math.round((categoryGroups.compliance.filter((m) => m.mastered).length / categoryGroups.compliance.length) * 100)
    : 0;

  const radarData = [
    { subject: "Technical", score: technicalMastery },
    { subject: "Service", score: serviceMastery },
    { subject: "Compliance", score: complianceMastery },
    { subject: "Bartending", score: Math.round(data.scores.bartending) },
    { subject: "Sales", score: Math.round(data.scores.sales) },
  ];

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="progress-overview">
        <div className="sbe-command-bar sbe-command-bar-active" style={{ marginBottom: "1.75rem" }}>
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">Me</span>
            <strong>Your Training Progress</strong>
            <span className="sbe-command-meta">Loading your progress...</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[200, 120, 160, 100].map((h, i) => (
            <div
              key={i}
              style={{
                height: h,
                borderRadius: "var(--radius-md)",
                background: "var(--line)",
                animation: "shimmer 1.4s ease infinite",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="progress-overview">
        <div className="sbe-command-bar sbe-command-bar-active" style={{ marginBottom: "1.75rem" }}>
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">Me</span>
            <strong>Your Training Progress</strong>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "3rem 1.5rem",
            textAlign: "center",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="var(--gold)" strokeWidth="1.5"/>
            <path d="M12 8v5M12 16h.01" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p style={{ color: "var(--text-soft)", fontSize: "0.95rem", margin: 0 }}>
            Could not load your progress.
          </p>
          <button
            onClick={() => void load()}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--green)",
              color: "white",
              border: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Tab content renderers ─────────────────────────────────────────────────

  function renderOverview() {
    return (
      <div className="progress-tab-panel" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Skill meter */}
        <div className="progress-hub-header">
          <span className="eyebrow">How I&rsquo;m improving</span>
          <h1>{displayName}&rsquo;s Progress Hub</h1>
          <SkillMeter skillLevel={skillLevel} />
        </div>

        {/* Stats + recommended */}
        <div className="progress-hub-hero-grid">
          <div className="progress-hub-stats-grid">
            <div className="progress-hub-stat-card">
              <span className="progress-hub-stat-label">Modules Mastered</span>
              <span className="progress-hub-stat-value">{masteredCount}/{totalCount}</span>
              <div className="progress-hub-stat-mini-track">
                <div className="progress-hub-stat-mini-fill" style={{ width: `${Math.round((masteredCount / Math.max(totalCount, 1)) * 100)}%` }} />
              </div>
              <p className="progress-hub-stat-sub">verified across all categories</p>
            </div>
            <div className="progress-hub-stat-card">
              <span className="progress-hub-stat-label">High Scenario Score</span>
              <span className="progress-hub-stat-value">{highScore}/100</span>
              <p className="progress-hub-stat-sub">best single module average</p>
            </div>
            <div className="progress-hub-stat-card">
              <span className="progress-hub-stat-label">Focus Area</span>
              <span className="progress-hub-stat-value" style={{ fontSize: "1.05rem" }}>{CATEGORY_LABELS[weakestCategory]}</span>
              <p className="progress-hub-stat-sub">weakest category · priority training</p>
            </div>
            <div className="progress-hub-stat-card">
              <span className="progress-hub-stat-label">Sessions Completed</span>
              <span className="progress-hub-stat-value">{data.totalSessions}</span>
              <p className="progress-hub-stat-sub">total training sessions</p>
            </div>
            <div className="progress-hub-stat-card">
              <span className="progress-hub-stat-label">Badge Collection</span>
              <div className="progress-hub-badge-row">
                {[0, 1, 2].map((i) => (
                  <Award key={i} size={22} className={i < data.badgesEarned ? "progress-hub-badge-icon" : "progress-hub-badge-icon--empty"} />
                ))}
              </div>
              <p className="progress-hub-stat-sub">{data.badgesEarned}/3 earned</p>
            </div>
            <div className="progress-hub-stat-card">
              <span className="progress-hub-stat-label">Current Standing</span>
              <span className="progress-hub-stat-value">Level {skillLevel}</span>
              <p className="progress-hub-stat-sub">of 10 · {skillLevel <= 3 ? "Apprentice" : skillLevel <= 6 ? "Specialist" : skillLevel <= 9 ? "Expert" : "Master"}</p>
            </div>
          </div>

          <div className="progress-hub-recommended">
            <span className="progress-hub-rec-eyebrow">Recommended next session</span>
            {firstUnmastered ? (
              <>
                <span className="progress-hub-rec-title">{firstUnmastered.title}</span>
                <p className="progress-hub-rec-sub">
                  {plan === "free"
                    ? "Free access active — upgrade to unlock deeper coaching."
                    : `${masteredCount} of ${totalCount} modules mastered. Keep going.`}
                </p>
                {onSelectModule && (
                  <button className="progress-hub-rec-btn" onClick={() => onSelectModule(firstUnmastered.id)}>
                    Start Module &rarr;
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="progress-hub-rec-title">All modules complete. Run AI Scenario sessions to stay sharp.</span>
                {onNavigate && (
                  <button className="progress-hub-rec-btn" onClick={() => onNavigate("scenarios")}>
                    Enter AI Scenarios &rarr;
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Challenges cluster */}
        <div className="progress-mastery-list-v2">
          <h2 className="progress-mastery-list-v2-title">Challenges</h2>
          <p className="progress-mastery-list-v2-sub">
            5 interactive question types. Completion is tracked on this device.
          </p>
          <div style={{ marginTop: 12 }}>
            <ChallengeCluster completed={data.challengesCompleted} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Performance analytics */}
        <div className="progress-analytics">
          <h2 className="progress-analytics-title">Performance Analytics</h2>
          <p className="progress-analytics-sub">
            Visual breakdown of your training scores and mastery dimensions.
          </p>
          <div className="progress-analytics-grid">
            <div className="progress-chart-card">
              <div className="progress-chart-title">Scenario Score History</div>
              <p className="progress-chart-sub">Average scenario scores across your three training areas</p>
              {hasChartData ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barChartData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a9185" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#7a9185" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #e5e1d8", borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v ?? 0}/100`, "Score"]}
                    />
                    <Bar dataKey="score" fill="#1f4e37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <GhostChart onNavigate={onNavigate} label="Your score history will appear here after your first challenge." />
              )}
            </div>

            <div className="progress-chart-card">
              <div className="progress-chart-title">Scenario Evaluation Dimensions</div>
              <p className="progress-chart-sub">Mastery and score spread across all training dimensions</p>
              {hasChartData ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e1d8" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#7a9185" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#b5b0a8" }} axisLine={false} />
                    <Radar dataKey="score" stroke="#1f4e37" fill="#1f4e37" fillOpacity={0.22} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <GhostChart label="Your mastery dimensions will appear here once you complete scenarios." />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderModules() {
    return (
      <div className="progress-tab-panel" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Certification & Focus Hub */}
        <div className="progress-cert-hub">
          <h2 className="progress-cert-hub-title">Certification &amp; Focus Hub</h2>
          <p className="progress-cert-hub-sub">
            Master all modules in a category to earn certification. Each card shows your next step.
          </p>
          <div className="progress-cert-hub-grid">
            {categoryCerts.map((cert) => (
              <div key={cert.category} className={`progress-cert-card${cert.certified ? " progress-cert-card--done" : ""}`}>
                {cert.certified ? (
                  <>
                    <div>
                      <div className="progress-cert-done-badge">★</div>
                      <div className="progress-cert-card-title">{cert.label}</div>
                    </div>
                    <div className="progress-cert-bar-track">
                      <div className="progress-cert-bar-fill" style={{ width: "100%" }} />
                    </div>
                    <p className="progress-cert-progress-text">{cert.mastered}/{cert.total} mastered</p>
                    <div className="progress-cert-weakness">
                      <span className="progress-cert-done-text">Certified — all modules mastered.</span>
                      {onNavigate && (
                        <button className="progress-cert-btn" onClick={() => onNavigate("scenarios")}>
                          Practice in AI Scenarios &rarr;
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="progress-cert-card-title">{cert.label}</div>
                    <div className="progress-cert-bar-track">
                      <div
                        className="progress-cert-bar-fill"
                        style={{ width: cert.total > 0 ? `${Math.round((cert.mastered / cert.total) * 100)}%` : "0%" }}
                      />
                    </div>
                    <p className="progress-cert-progress-text">{cert.mastered}/{cert.total} mastered</p>
                    {cert.nextModule && (
                      <div className="progress-cert-weakness">
                        <span className="progress-cert-weakness-label">Strengthen your weakness</span>
                        <span className="progress-cert-module-name">{cert.nextModule.title}</span>
                        {onSelectModule && (
                          <button className="progress-cert-btn" onClick={() => onSelectModule(cert.nextModule!.id)}>
                            Strengthen Now &rarr;
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Full Module Mastery List */}
        <div className="progress-mastery-list-v2">
          <h2 className="progress-mastery-list-v2-title">Full Module Mastery List</h2>
          <p className="progress-mastery-list-v2-sub">
            Pass each module verify to mark as mastered. Every module links directly to training or AI Scenarios.
          </p>

          {data.modules.length === 0 ? (
            <div
              style={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                border: "1px dashed var(--line)",
                borderRadius: "var(--radius-md)",
                marginTop: "1rem",
              }}
            >
              <p style={{ color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.75rem" }}>
                0 / 40 — Begin your first module
              </p>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("module")}
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--green)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  Browse Modules
                </button>
              )}
            </div>
          ) : (
            (["technical", "service", "compliance"] as const).map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const isOpen = expandedCategories.has(cat);
              const masteredInCat = categoryGroups[cat].filter((m) => m.mastered).length;
              return (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <button className="progress-accordion-header" onClick={() => toggleCategory(cat)} aria-expanded={isOpen}>
                    <span className="progress-accordion-icon"><Icon size={13} /></span>
                    <span className="progress-accordion-label">{CATEGORY_LABELS[cat]}</span>
                    <span className="progress-accordion-meta">{masteredInCat}/{categoryGroups[cat].length} mastered</span>
                    {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                  {isOpen && (
                    <div className="progress-accordion-body">
                      {categoryGroups[cat].map((module) => (
                        <div key={module.id} className="progress-mastery-row-v2">
                          <span className="progress-mastery-row-title">{module.title}</span>
                          <span className={`progress-mastery-row-chip${module.mastered ? " progress-mastery-row-chip--mastered" : ""}`}>
                            {module.mastered ? "Mastered" : module.attempted ? "In progress" : "Not started"}
                          </span>
                          {module.mastered ? (
                            <button className="progress-mastery-action" onClick={() => onNavigate?.("scenarios")}>
                              Practice in AI Scenarios
                            </button>
                          ) : module.attempted ? (
                            <button className="progress-mastery-action progress-mastery-action--primary" onClick={() => onSelectModule?.(module.id)}>
                              Continue
                            </button>
                          ) : (
                            <button className="progress-mastery-action progress-mastery-action--primary" onClick={() => onSelectModule?.(module.id)}>
                              Verify Now
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  function renderActivity() {
    const totalArenaPasses = Object.values(data.arenaProgress).filter((p) => p.passed).length;
    const hasArenaData = Object.keys(data.arenaProgress).length > 0;

    return (
      <div className="progress-tab-panel" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Scenario Training */}
        <div className="progress-mastery-list-v2">
          <h2 className="progress-mastery-list-v2-title">Scenario Training</h2>
          <p className="progress-mastery-list-v2-sub">
            Your written scenario practice history across all three training areas.
          </p>
          {(["bartending", "sales", "management"] as const).map((area) => {
            const areaLabel: Record<string, string> = { bartending: "Bartending", sales: "Sales", management: "Leadership" };
            const isOpen = expandedScenarioAreas.has(area);
            const sessions = data.scenarioStats.sessions[area];
            const score = Math.round(data.scenarioStats.scores[area]);
            return (
              <div key={area} style={{ marginBottom: 8 }}>
                <button className="progress-accordion-header" onClick={() => toggleScenarioArea(area)} aria-expanded={isOpen}>
                  <span className="progress-accordion-label">{areaLabel[area]}</span>
                  <span className="progress-accordion-meta">{sessions} session{sessions !== 1 ? "s" : ""}</span>
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {isOpen && (
                  <div className="progress-accordion-body">
                    {sessions === 0 ? (
                      <div style={{ padding: "1rem", textAlign: "center" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
                          Not yet started — try your first {areaLabel[area]} scenario.
                        </p>
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate("stage4")}
                            style={{ color: "var(--green)", fontSize: "0.82rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                          >
                            Start Scenario Training
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="progress-accordion-stat-row">
                          <span>Sessions completed</span><strong>{sessions}</strong>
                        </div>
                        <div className="progress-accordion-stat-row">
                          <span>Average score</span><strong>{score > 0 ? `${score}/25` : "No data yet"}</strong>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Scenario */}
        <div className="progress-mastery-list-v2">
          <h2 className="progress-mastery-list-v2-title">AI Scenario</h2>
          <p className="progress-mastery-list-v2-sub">
            Live assessment results across all 20 scenarios. Pass threshold: 75/100.
          </p>

          {!hasArenaData ? (
            <div
              style={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                border: "1px dashed var(--line)",
                borderRadius: "var(--radius-md)",
                marginTop: "1rem",
              }}
            >
              <p style={{ color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.75rem" }}>
                {totalArenaPasses}/10 passed — try your first AI Scenario
              </p>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("scenarios")}
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--green)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  Enter AI Scenarios
                </button>
              )}
            </div>
          ) : (
            (["technical", "service", "compliance"] as const).map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const modulesInCat = data.modules.filter((m) => m.category === cat && m.id <= 20);
              const passedInCat = modulesInCat.filter((m) => data.arenaProgress[m.id]?.passed).length;
              const isOpen = expandedArenaCats.has(cat);
              return (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <button className="progress-accordion-header" onClick={() => toggleArenaCategory(cat)} aria-expanded={isOpen}>
                    <span className="progress-accordion-icon"><Icon size={13} /></span>
                    <span className="progress-accordion-label">{CATEGORY_CERT_LABELS[cat]}</span>
                    <span className="progress-accordion-meta">{passedInCat}/{modulesInCat.length} passed</span>
                    {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                  {isOpen && (
                    <div className="progress-accordion-body">
                      {modulesInCat.map((module) => {
                        const arena = data.arenaProgress[module.id];
                        return (
                          <div key={module.id} className="progress-mastery-row-v2" style={{ paddingLeft: 12 }}>
                            <span className="progress-mastery-row-title">{module.title}</span>
                            <span className={`progress-mastery-row-chip${arena?.passed ? " progress-mastery-row-chip--mastered" : ""}`}>
                              {arena?.passed ? "Passed" : arena?.attempts ? `Attempted (${arena.bestScore}/100)` : "Not started"}
                            </span>
                            {!arena?.passed && (
                              <button
                                className="progress-mastery-action progress-mastery-action--primary"
                                onClick={() => onNavigate?.("scenarios")}
                              >
                                {arena?.attempts ? "Retry" : "Start"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="progress-overview">
      {/* ── Page banner ──────────────────────────────────────── */}
      <div className="sbe-command-bar sbe-command-bar-active" style={{ marginBottom: "1.75rem" }}>
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Me</span>
          <strong>Your Training Progress</strong>
          <span className="sbe-command-meta">Track mastery, scores and certifications across all 40 modules</span>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────── */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* ── Tab panels ───────────────────────────────────────── */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "modules" && renderModules()}
      {activeTab === "activity" && renderActivity()}
    </div>
  );
}
