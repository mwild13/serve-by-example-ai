"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { computeBadges, countEarned, type ModuleSummaryForBadges, type CategoryScores } from "@/lib/badges";
import ProgressSummary from "./progress/ProgressSummary";
import ProgressChart from "./progress/ProgressChart";
import MasteryGrid from "./progress/MasteryGrid";
import ActivityLog from "./progress/ActivityLog";
import { EMPTY, CATEGORY_CERT_LABELS, type ModuleSummary, type TrainingData, type CategoryCert } from "./progress/progress-types";

type ProgressOverviewProps = {
  displayName: string;
  plan: string;
  onSelectModule?: (moduleId: number) => void;
  onNavigate?: (nav: string) => void;
  initialProgressData?: Record<string, unknown> | null;
};

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
  initialProgressData,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyResponse(res: any) {
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
        const nonStreakBadges = allBadgesComputed.filter((b) => b.category !== "streak");
        const badgesEarned = countEarned(nonStreakBadges);
        const totalBadgeCount = nonStreakBadges.length;
        const bestModuleMastery = Math.max(
          0,
          ...allMods.map((m) => (res.moduleProgress as Record<number, { mastery?: number }>)?.[m.id]?.mastery ?? 0),
        );
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
          totalBadgeCount,
          bestModuleMastery,
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
      applyResponse(await r.json() as Record<string, unknown>);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialProgressData) {
      applyResponse(initialProgressData);
      setLoading(false);
    } else {
      void load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const masteredCount = data.modules.filter((m) => m.mastered).length;
  const totalCount = data.modules.length || 20;
  const skillLevel = data.skillLevel;

  const categoryGroups: Record<"technical" | "service" | "compliance", ModuleSummary[]> = {
    technical: data.modules.filter((m) => m.category === "technical"),
    service: data.modules.filter((m) => m.category === "service"),
    compliance: data.modules.filter((m) => m.category === "compliance"),
  };

  const categoryCerts: CategoryCert[] = (["technical", "service", "compliance"] as const).map((cat) => ({
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
        <div style={{ background: "var(--green)", padding: "20px 16px 16px", borderRadius: "0 0 var(--radius-xl) var(--radius-xl)", boxShadow: "0 4px 20px rgba(15,45,29,0.18)", margin: "0 -1rem 1.75rem" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "block" }}>Me</span>
          <h1 style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 22, fontWeight: 600, color: "var(--surface-raised)", margin: "2px 0 0" }}>Your Training Progress</h1>
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
        <div style={{ background: "var(--green)", padding: "20px 16px 16px", borderRadius: "0 0 var(--radius-xl) var(--radius-xl)", boxShadow: "0 4px 20px rgba(15,45,29,0.18)", margin: "0 -1rem 1.75rem" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "block" }}>Me</span>
          <h1 style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 22, fontWeight: 600, color: "var(--surface-raised)", margin: "2px 0 0" }}>Your Training Progress</h1>
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

  return (
    <div className="progress-overview">
      {/* ── Page banner ──────────────────────────────────────── */}
      <div style={{ background: "var(--green)", padding: "20px 16px 16px", borderRadius: "0 0 var(--radius-xl) var(--radius-xl)", boxShadow: "0 4px 20px rgba(15,45,29,0.18)", margin: "0 -1rem 1.75rem" }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "block" }}>Me</span>
        <h1 style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 22, fontWeight: 600, color: "var(--surface-raised)", margin: "2px 0 0" }}>Your Training Progress</h1>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────── */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* ── Tab panels ───────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="progress-tab-panel" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <ProgressSummary
            displayName={displayName}
            plan={plan}
            skillLevel={skillLevel}
            masteredCount={masteredCount}
            totalCount={totalCount}
            bestModuleMastery={data.bestModuleMastery}
            weakestCategory={weakestCategory}
            totalSessions={data.totalSessions}
            badgesEarned={data.badgesEarned}
            totalBadgeCount={data.totalBadgeCount}
            firstUnmastered={firstUnmastered}
            challengesCompleted={data.challengesCompleted}
            onSelectModule={onSelectModule}
            onNavigate={onNavigate}
          />
          <ProgressChart
            hasChartData={hasChartData}
            barChartData={barChartData}
            radarData={radarData}
            onNavigate={onNavigate}
          />
        </div>
      )}
      {activeTab === "modules" && (
        <MasteryGrid
          categoryCerts={categoryCerts}
          categoryGroups={categoryGroups}
          modulesLength={data.modules.length}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
          onSelectModule={onSelectModule}
          onNavigate={onNavigate}
        />
      )}
      {activeTab === "activity" && (
        <ActivityLog
          scenarioStats={data.scenarioStats}
          arenaProgress={data.arenaProgress}
          modules={data.modules}
          expandedScenarioAreas={expandedScenarioAreas}
          onToggleScenarioArea={toggleScenarioArea}
          expandedArenaCats={expandedArenaCats}
          onToggleArenaCategory={toggleArenaCategory}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
