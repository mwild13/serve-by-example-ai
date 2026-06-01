"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
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

export default function ProgressOverview({
  displayName,
  plan,
  onSelectModule,
  onNavigate,
}: ProgressOverviewProps) {
  const [data, setData] = useState<TrainingData>(EMPTY);
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

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const r = await fetch("/api/training/progress", {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        });
        const res = await r.json();

        if (res.allModules && res.moduleProgress) {
          const modules: ModuleSummary[] = (
            res.allModules as {
              id: number;
              title: string;
              category: string;
            }[]
          ).map((m) => {
            const p = res.moduleProgress[m.id] ?? {
              scenariosAttempted: 0,
              scenariosMastered: 0,
            };
            return {
              id: m.id,
              title: m.title,
              category: m.category as "technical" | "service" | "compliance",
              mastered: (p.scenariosMastered ?? 0) >= 1,
              attempted: (p.scenariosAttempted ?? 0) > 0,
            };
          });
          const totalSessions =
            (res.sessions?.bartending ?? 0) +
            (res.sessions?.sales ?? 0) +
            (res.sessions?.management ?? 0);
          const badgesEarned = (
            ["bartending", "sales", "management"] as const
          ).reduce(
            (n, mod) => n + ((res.mastery?.[mod] ?? 0) >= 80 ? 1 : 0),
            0,
          );
          let challengesCompleted: number[] = [];
          try {
            const stored = localStorage.getItem("sbe_challenges_completed");
            if (stored) challengesCompleted = JSON.parse(stored) as number[];
          } catch { /* ignore */ }

          setData({
            modules,
            reviewDue: Array.isArray(res.reviewQueue)
              ? res.reviewQueue.length
              : 0,
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
        // non-critical
      }
    }
    void load();
  }, []);

  // ── Derived values ──────────────────────────────────────────

  const masteredCount = data.modules.filter((m) => m.mastered).length;
  const totalCount = data.modules.length || 20;
  const skillLevel = data.skillLevel;
  const highScore = Math.round(
    Math.max(
      data.scores.bartending,
      data.scores.sales,
      data.scores.management,
    ),
  );

  const categoryGroups: Record<string, ModuleSummary[]> = {
    technical: data.modules.filter((m) => m.category === "technical"),
    service: data.modules.filter((m) => m.category === "service"),
    compliance: data.modules.filter((m) => m.category === "compliance"),
  };

  const categoryCerts = (["technical", "service", "compliance"] as const).map(
    (cat) => ({
      category: cat,
      label: CATEGORY_CERT_LABELS[cat],
      mastered: categoryGroups[cat].filter((m) => m.mastered).length,
      total: categoryGroups[cat].length,
      certified:
        categoryGroups[cat].length > 0 &&
        categoryGroups[cat].every((m) => m.mastered),
      nextModule: categoryGroups[cat].find((m) => !m.mastered) ?? null,
    }),
  );

  const weakestCategory = (["technical", "service", "compliance"] as const).reduce(
    (weakest, cat) => {
      const wLen = categoryGroups[weakest].length;
      const cLen = categoryGroups[cat].length;
      const wPct =
        wLen > 0
          ? categoryGroups[weakest].filter((m) => m.mastered).length / wLen
          : 1;
      const cPct =
        cLen > 0
          ? categoryGroups[cat].filter((m) => m.mastered).length / cLen
          : 1;
      return cPct < wPct ? cat : weakest;
    },
    "technical" as "technical" | "service" | "compliance",
  );

  const firstUnmastered = data.modules.find((m) => !m.mastered) ?? null;

  // Analytics chart data
  const barChartData = [
    { name: "Bartending", score: Math.round(data.scores.bartending) },
    { name: "Sales", score: Math.round(data.scores.sales) },
    { name: "Management", score: Math.round(data.scores.management) },
  ];

  const technicalMastery =
    categoryGroups.technical.length > 0
      ? Math.round(
          (categoryGroups.technical.filter((m) => m.mastered).length /
            categoryGroups.technical.length) *
            100,
        )
      : 0;
  const serviceMastery =
    categoryGroups.service.length > 0
      ? Math.round(
          (categoryGroups.service.filter((m) => m.mastered).length /
            categoryGroups.service.length) *
            100,
        )
      : 0;
  const complianceMastery =
    categoryGroups.compliance.length > 0
      ? Math.round(
          (categoryGroups.compliance.filter((m) => m.mastered).length /
            categoryGroups.compliance.length) *
            100,
        )
      : 0;

  const radarData = [
    { subject: "Technical", score: technicalMastery },
    { subject: "Service", score: serviceMastery },
    { subject: "Compliance", score: complianceMastery },
    { subject: "Bartending", score: Math.round(data.scores.bartending) },
    { subject: "Sales", score: Math.round(data.scores.sales) },
  ];

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

      {/* ── Band 1: Hero & Performance Grid ─────────────────── */}
      <div className="progress-hub-header">
        <span className="eyebrow">How I&rsquo;m improving</span>
        <h1>{displayName}&rsquo;s Progress Hub</h1>
        <div className="progress-hub-skill-row">
          <span className="progress-hub-skill-label">Skill Level</span>
          <span className="progress-hub-skill-level">{skillLevel}</span>
          <div className="progress-hub-skill-track">
            <div
              className="progress-hub-skill-fill"
              style={{ width: `${skillLevel * 10}%` }}
            />
          </div>
          <span className="progress-hub-skill-of">/10</span>
        </div>
      </div>

      <div className="progress-hub-hero-grid">
        {/* Left: 2×3 stats grid */}
        <div className="progress-hub-stats-grid">
          {/* 1. Modules Mastered */}
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Modules Mastered</span>
            <span className="progress-hub-stat-value">
              {masteredCount}/{totalCount}
            </span>
            <div className="progress-hub-stat-mini-track">
              <div
                className="progress-hub-stat-mini-fill"
                style={{
                  width: `${Math.round((masteredCount / Math.max(totalCount, 1)) * 100)}%`,
                }}
              />
            </div>
            <p className="progress-hub-stat-sub">verified across all categories</p>
          </div>

          {/* 2. High Scenario Score */}
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">High Scenario Score</span>
            <span className="progress-hub-stat-value">{highScore}/100</span>
            <p className="progress-hub-stat-sub">best single module average</p>
          </div>

          {/* 3. Focus Area */}
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Focus Area</span>
            <span
              className="progress-hub-stat-value"
              style={{ fontSize: "1.05rem" }}
            >
              {CATEGORY_LABELS[weakestCategory]}
            </span>
            <p className="progress-hub-stat-sub">weakest category · priority training</p>
          </div>

          {/* 4. Sessions Completed */}
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Sessions Completed</span>
            <span className="progress-hub-stat-value">{data.totalSessions}</span>
            <p className="progress-hub-stat-sub">total training sessions</p>
          </div>

          {/* 5. Badge Collection */}
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Badge Collection</span>
            <div className="progress-hub-badge-row">
              {[0, 1, 2].map((i) => (
                <Award
                  key={i}
                  size={22}
                  className={
                    i < data.badgesEarned
                      ? "progress-hub-badge-icon"
                      : "progress-hub-badge-icon--empty"
                  }
                />
              ))}
            </div>
            <p className="progress-hub-stat-sub">{data.badgesEarned}/3 earned</p>
          </div>

          {/* 6. Current Standing */}
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Current Standing</span>
            <span className="progress-hub-stat-value">
              Level {skillLevel}
            </span>
            <p className="progress-hub-stat-sub">of 10 · {skillLevel <= 3 ? "Apprentice" : skillLevel <= 6 ? "Specialist" : skillLevel <= 9 ? "Expert" : "Master"}</p>
          </div>
        </div>

        {/* Right: Recommended next session */}
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
                <button
                  className="progress-hub-rec-btn"
                  onClick={() => onSelectModule(firstUnmastered.id)}
                >
                  Start Module &rarr;
                </button>
              )}
            </>
          ) : (
            <>
              <span className="progress-hub-rec-title">
                All modules complete. Run AI Scenario sessions to stay sharp.
              </span>
              {onNavigate && (
                <button
                  className="progress-hub-rec-btn"
                  onClick={() => onNavigate("scenarios")}
                >
                  Enter AI Scenarios &rarr;
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Band 2: Certification & Focus Hub ───────────────── */}
      <div className="progress-cert-hub">
        <h2 className="progress-cert-hub-title">Certification &amp; Focus Hub</h2>
        <p className="progress-cert-hub-sub">
          Master all modules in a category to earn certification. Each card shows your next step.
        </p>
        <div className="progress-cert-hub-grid">
          {categoryCerts.map((cert) => (
            <div
              key={cert.category}
              className={`progress-cert-card${cert.certified ? " progress-cert-card--done" : ""}`}
            >
              {cert.certified ? (
                <>
                  <div>
                    <div className="progress-cert-done-badge">★</div>
                    <div className="progress-cert-card-title">{cert.label}</div>
                  </div>
                  <div className="progress-cert-bar-track">
                    <div
                      className="progress-cert-bar-fill"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <p className="progress-cert-progress-text">
                    {cert.mastered}/{cert.total} mastered
                  </p>
                  <div className="progress-cert-weakness">
                    <span className="progress-cert-done-text">
                      Certified — all modules mastered.
                    </span>
                    {onNavigate && (
                      <button
                        className="progress-cert-btn"
                        onClick={() => onNavigate("scenarios")}
                      >
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
                      style={{
                        width:
                          cert.total > 0
                            ? `${Math.round((cert.mastered / cert.total) * 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <p className="progress-cert-progress-text">
                    {cert.mastered}/{cert.total} mastered
                  </p>
                  {cert.nextModule && (
                    <div className="progress-cert-weakness">
                      <span className="progress-cert-weakness-label">
                        Strengthen your weakness
                      </span>
                      <span className="progress-cert-module-name">
                        {cert.nextModule.title}
                      </span>
                      {onSelectModule && (
                        <button
                          className="progress-cert-btn"
                          onClick={() =>
                            onSelectModule(cert.nextModule!.id)
                          }
                        >
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

      {/* ── Band 3: Scenario Training ────────────────────────── */}
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
              <button
                className="progress-accordion-header"
                onClick={() => toggleScenarioArea(area)}
                aria-expanded={isOpen}
              >
                <span className="progress-accordion-label">{areaLabel[area]}</span>
                <span className="progress-accordion-meta">{sessions} session{sessions !== 1 ? "s" : ""}</span>
                {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              {isOpen && (
                <div className="progress-accordion-body">
                  <div className="progress-accordion-stat-row">
                    <span>Sessions completed</span><strong>{sessions}</strong>
                  </div>
                  <div className="progress-accordion-stat-row">
                    <span>Average score</span><strong>{score > 0 ? `${score}/25` : "No data yet"}</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Band 4: AI Scenario ─────────────────────────────────── */}
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">AI Scenario</h2>
        <p className="progress-mastery-list-v2-sub">
          Live assessment results across all 20 scenarios. Pass threshold: 75/100.
        </p>
        {(["technical", "service", "compliance"] as const).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const modulesInCat = data.modules.filter((m) => m.category === cat && m.id <= 20);
          const passedInCat = modulesInCat.filter((m) => data.arenaProgress[m.id]?.passed).length;
          const isOpen = expandedArenaCats.has(cat);
          return (
            <div key={cat} style={{ marginBottom: 8 }}>
              <button
                className="progress-accordion-header"
                onClick={() => toggleArenaCategory(cat)}
                aria-expanded={isOpen}
              >
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
        })}
      </div>

      {/* ── Band 5: Challenges ───────────────────────────────── */}
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">Challenges</h2>
        <p className="progress-mastery-list-v2-sub">
          5 interactive question types. Completion is tracked on this device.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {[
            "Sequence Sort",
            "Fill the Blank",
            "Match Pair",
            "Spot the Error",
            "Multiple Choice",
          ].map((label, i) => {
            const done = data.challengesCompleted.includes(i);
            return (
              <span
                key={i}
                className={`progress-mastery-row-chip${done ? " progress-mastery-row-chip--mastered" : ""}`}
                style={{ fontSize: "0.8rem", padding: "5px 12px" }}
              >
                {label}
              </span>
            );
          })}
        </div>
        {data.challengesCompleted.length < 5 && (
          <button
            className="progress-mastery-action progress-mastery-action--primary"
            style={{ marginTop: 14 }}
            onClick={() => onNavigate?.("challenges")}
          >
            Go to Challenges
          </button>
        )}
        {data.challengesCompleted.length === 5 && (
          <p style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--green)", fontWeight: 700 }}>
            All 5 questions complete.
          </p>
        )}
      </div>

      {/* ── Band 6: Full Module Mastery List ─────────────────── */}
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">Full Module Mastery List</h2>
        <p className="progress-mastery-list-v2-sub">
          Pass each module verify to mark as mastered. Every module links directly to training or AI Scenarios.
        </p>

        {(["technical", "service", "compliance"] as const).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const isOpen = expandedCategories.has(cat);
          const masteredInCat = categoryGroups[cat].filter((m) => m.mastered).length;
          return (
            <div key={cat} style={{ marginBottom: 8 }}>
              <button
                className="progress-accordion-header"
                onClick={() => toggleCategory(cat)}
                aria-expanded={isOpen}
              >
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
        })}
      </div>

      {/* ── Band 4: Performance Analytics ───────────────────── */}
      <div className="progress-analytics">
        <h2 className="progress-analytics-title">Performance Analytics</h2>
        <p className="progress-analytics-sub">
          Visual breakdown of your training scores and mastery dimensions.
        </p>
        <div className="progress-analytics-grid">
          {/* Chart 1: Bar chart — scores by training area */}
          <div className="progress-chart-card">
            <div className="progress-chart-title">Scenario Score History</div>
            <p className="progress-chart-sub">
              Average scenario scores across your three training areas
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barChartData} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#7a9185" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#7a9185" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e1d8",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v ?? 0}/100`, "Score"]}
                />
                <Bar dataKey="score" fill="#1f4e37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Radar — mastery dimensions */}
          <div className="progress-chart-card">
            <div className="progress-chart-title">Scenario Evaluation Dimensions</div>
            <p className="progress-chart-sub">
              Mastery and score spread across all training dimensions
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e1d8" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: "#7a9185" }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "#b5b0a8" }}
                  axisLine={false}
                />
                <Radar
                  dataKey="score"
                  stroke="#1f4e37"
                  fill="#1f4e37"
                  fillOpacity={0.22}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
