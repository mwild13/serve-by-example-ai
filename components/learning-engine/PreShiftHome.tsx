"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { GlassWater, TrendingUp, Users, Flame } from "lucide-react";
import { computeBadges, countEarned, recentEarned, type ModuleSummaryForBadges, type CategoryScores } from "@/lib/badges";
import Link from "next/link";
import { KB_ENTRIES, KB_CATEGORIES } from "@/lib/knowledge-base";
import { COCKTAILS } from "@/lib/cocktails";

type NavItem = "home" | "module" | "rapid-fire" | "stage4" | "scenarios" | "challenges" | "cocktails" | "knowledge" | "progress" | "settings";
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

type DbModule = {
  id: number;
  title: string;
  category: string;
  description?: string | null;
  difficulty_level?: number | null;
};

type DbModuleProgress = {
  scenariosAttempted: number;
  scenariosMastered: number;
  avgElo: number;
  completion: number;
  mastery: number;
};

type ProgressData = {
  modules: Record<ModuleKey, number>;
  mastery: Record<ModuleKey, number>;
  scores: Record<ModuleKey, number>;
  sessions: Record<ModuleKey, number>;
  reviewDue: number;
  levelProgress: Record<ModuleKey, LevelProgress>;
  lastAttemptAt: string | null;
  allModules: DbModule[];
  moduleProgress: Record<number, DbModuleProgress>;
  skillLevel: number;
  bestCorrectStreak: number;
  sbeEliteNumber: number;
};

const EMPTY: ProgressData = {
  modules: { bartending: 0, sales: 0, management: 0 },
  mastery: { bartending: 0, sales: 0, management: 0 },
  scores: { bartending: 0, sales: 0, management: 0 },
  sessions: { bartending: 0, sales: 0, management: 0 },
  reviewDue: 0,
  levelProgress: {
    bartending: { level1_completed: false, level2_completed: false, level3_completed: false, level4_unlocked: false, level1_score: 0, level2_score: 0, level3_score: 0 },
    sales: { level1_completed: false, level2_completed: false, level3_completed: false, level4_unlocked: false, level1_score: 0, level2_score: 0, level3_score: 0 },
    management: { level1_completed: false, level2_completed: false, level3_completed: false, level4_unlocked: false, level1_score: 0, level2_score: 0, level3_score: 0 },
  },
  lastAttemptAt: null,
  allModules: [],
  moduleProgress: {},
  skillLevel: 1,
  bestCorrectStreak: 0,
  sbeEliteNumber: 0,
};


const MODULE_META: Record<ModuleKey, { label: string; short: string; Icon: React.ElementType }> = {
  bartending: { label: "Bartending Fundamentals", short: "Bartending", Icon: GlassWater },
  sales: { label: "Sales & Upselling", short: "Sales", Icon: TrendingUp },
  management: { label: "Shift Leadership", short: "Leadership", Icon: Users },
};

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

function getCategoryMastery(
  allModules: DbModule[],
  moduleProgress: Record<number, DbModuleProgress>,
  category: string,
): number {
  const mods = allModules.filter((m) => m.category === category);
  if (mods.length === 0) return 0;
  const avg = mods.reduce((sum, m) => sum + (moduleProgress[m.id]?.mastery ?? 0), 0) / mods.length;
  return Math.round(avg);
}

function getWeakestModule(mastery: Record<ModuleKey, number>): ModuleKey {
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  return keys.reduce((w, k) => (mastery[k] < mastery[w] ? k : w));
}

function computeStreak(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem("sbe-streak-last");
    const streakCount = parseInt(localStorage.getItem("sbe-streak-count") ?? "0", 10);
    if (!lastDate) {
      localStorage.setItem("sbe-streak-last", today);
      localStorage.setItem("sbe-streak-count", "1");
      return 1;
    }
    if (lastDate === today) return streakCount || 1;
    const daysDiff = Math.round((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
    if (daysDiff === 1) {
      const next = streakCount + 1;
      localStorage.setItem("sbe-streak-last", today);
      localStorage.setItem("sbe-streak-count", String(next));
      return next;
    }
    localStorage.setItem("sbe-streak-last", today);
    localStorage.setItem("sbe-streak-count", "1");
    return 1;
  } catch {
    return 0;
  }
}

function formatLastTrained(iso: string | null): string | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (h < 1) return "less than an hour ago";
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`;
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  return `${Math.floor(d / 7)} week${Math.floor(d / 7) !== 1 ? "s" : ""} ago`;
}

const AWARD_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

export default function PreShiftHome({
  displayName,
  setActiveNav,
  managementUnlocked = false,
  onNavigateToCategory,
  isPremium,
  onBadgesNav,
}: {
  displayName: string;
  setActiveNav: (nav: NavItem) => void;
  managementUnlocked?: boolean;
  onNavigateToCategory?: (category: string) => void;
  isPremium?: boolean;
  onBadgesNav?: () => void;
}) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [kbIndex, setKbIndex] = useState(0);

  // A1: trigger segment bar animation on mount
  useEffect(() => {
    setMounted(true);
    setStreak(computeStreak());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setKbIndex((i) => (i + 1) % KB_ENTRIES.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // A5: stagger entrance animation
  const animRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const delays = [0, 100, 220, 360];
    animRefs.current.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => el.classList.add("visible"), delays[i]);
    });
  }, []);

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
            mastery: res.mastery ?? EMPTY.mastery,
            scores: res.scores ?? EMPTY.scores,
            sessions: res.sessions ?? EMPTY.sessions,
            reviewDue: Array.isArray(res.reviewQueue) ? res.reviewQueue.length : 0,
            levelProgress: {
              bartending: res.levelProgress?.bartending ?? EMPTY.levelProgress.bartending,
              sales: res.levelProgress?.sales ?? EMPTY.levelProgress.sales,
              management: res.levelProgress?.management ?? EMPTY.levelProgress.management,
            },
            lastAttemptAt: res.lastAttemptAt ?? null,
            allModules: Array.isArray(res.allModules) ? res.allModules : [],
            moduleProgress: res.moduleProgress ?? {},
            skillLevel: typeof res.skillLevel === "number" ? res.skillLevel : 1,
            bestCorrectStreak: typeof res.bestCorrectStreak === "number" ? res.bestCorrectStreak : 0,
            sbeEliteNumber: typeof res.sbeEliteNumber === "number" ? res.sbeEliteNumber : 0,
          });
        }
      } catch {
        // non-critical
      } finally {
        setLoaded(true);
      }
    }
    void load();
  }, []);

  const categoryMastery: Record<ModuleKey, number> = {
    bartending: getCategoryMastery(data.allModules, data.moduleProgress, "technical"),
    sales: getCategoryMastery(data.allModules, data.moduleProgress, "service"),
    management: getCategoryMastery(data.allModules, data.moduleProgress, "compliance"),
  };

  const CATEGORY_NAV_KEY: Record<ModuleKey, "technical" | "service" | "compliance"> = {
    bartending: "technical",
    sales: "service",
    management: "compliance",
  };

  const CATEGORY_MODULE_TOTALS: Record<ModuleKey, number> = {
    bartending: data.allModules.filter((m) => m.category === "technical").length || 14,
    sales: data.allModules.filter((m) => m.category === "service").length || 14,
    management: data.allModules.filter((m) => m.category === "compliance").length || 12,
  };

  const totalSessions = data.sessions.bartending + data.sessions.sales + data.sessions.management;
  const skillLevel = data.skillLevel;
  const weakest = getWeakestModule(categoryMastery);
  const coachTips = COACH_FOCUS[weakest];
  const lastTrainedLabel = formatLastTrained(data.lastAttemptAt);
  const isNewUser = totalSessions === 0;

  const kbEntry = KB_ENTRIES[kbIndex];
  const kbCatColor = KB_CATEGORIES[kbEntry.category].color;
  const kbCatLabel = KB_CATEGORIES[kbEntry.category].label;
  const dayIdx = Math.floor(Date.now() / 86400000);
  const dailyCocktail1 = COCKTAILS[(dayIdx * 2) % COCKTAILS.length];
  const dailyCocktail2 = COCKTAILS[(dayIdx * 2 + 1) % COCKTAILS.length];

  // Hoist badge computation so it's available in Quick Nav and Achievements
  const badgeModules: ModuleSummaryForBadges[] = loaded
    ? data.allModules.map((m) => {
        const prog = data.moduleProgress[m.id];
        return {
          category: m.category as "technical" | "service" | "compliance",
          mastered: (prog?.mastery ?? 0) >= 80,
          attempted: (prog?.scenariosAttempted ?? 0) > 0,
        };
      })
    : [];
  const badgeScores: CategoryScores = {
    bartending: categoryMastery.bartending,
    sales: categoryMastery.sales,
    management: categoryMastery.management,
  };
  const allBadges = computeBadges(badgeModules, badgeScores, streak, data.bestCorrectStreak, data.sbeEliteNumber);
  const badgeEarned = countEarned(allBadges);
  const recentBadges = recentEarned(allBadges, 3);

  // Progress Snapshot stats
  const modulesComplete = data.allModules.filter(
    (m) => (data.moduleProgress[m.id]?.mastery ?? 0) >= 80
  ).length;
  const totalModules = data.allModules.length || 1;
  const avgScore = loaded
    ? Math.round(
        data.allModules.reduce((sum, m) => sum + (data.moduleProgress[m.id]?.mastery ?? 0), 0) / totalModules
      )
    : 0;
  const isProgressZeroState = loaded && avgScore === 0 && modulesComplete === 0;

  return (
    <div className="psh">

      {/* ── A1: Mastery Header ── */}
      <div
        className="psh-mastery-bar"
        data-animate
        ref={(el) => { animRefs.current[0] = el; }}
      >
        <div className="psh-mastery-left">
          <span className="psh-mastery-label">SKILL LEVEL</span>
          <span className="psh-mastery-level">{skillLevel}</span>

          {/* 10-segment stepping-stones bar */}
          <div className="psh-segment-bar">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`psh-segment${mounted && i < skillLevel ? (i === skillLevel - 1 ? " psh-segment--current" : " psh-segment--filled") : ""}`}
                style={{ transitionDelay: mounted ? `${i * 60}ms` : "0ms" }}
              />
            ))}
          </div>
          <span className="psh-mastery-of">/10</span>

          {streak > 0 && (
            <div className="psh-streak-pill">
              <Flame size={13} />
              <span>{streak} day streak</span>
            </div>
          )}
        </div>
        {lastTrainedLabel && (
          <span className="psh-last-trained">Last trained: {lastTrainedLabel}</span>
        )}
      </div>

      {/* ── Quick Nav ── */}
      {(() => {
        const quickNavTiles: Array<{
          id: string;
          label: string;
          subtitle: string;
          icon: React.ReactNode;
          action?: () => void;
          href?: string;
          isPremiumGated: boolean;
        }> = [
          {
            id: "stage4", label: "Scenarios",
            subtitle: totalSessions > 0 ? `${totalSessions} sessions done` : "Practice written scenarios",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
            action: () => setActiveNav("stage4"), isPremiumGated: true,
          },
          {
            id: "scenarios", label: "AI Arena",
            subtitle: "Live roleplay with AI",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
            action: () => setActiveNav("scenarios"), isPremiumGated: true,
          },
          {
            id: "challenges", label: "Challenges",
            subtitle: "Interactive mini-games",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
            action: () => setActiveNav("challenges"), isPremiumGated: false,
          },
          {
            id: "module", label: "Modules",
            subtitle: "40 modules to master",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
            action: () => setActiveNav("module"), isPremiumGated: true,
          },
          {
            id: "cocktails", label: "Cocktail Library",
            subtitle: "38 recipes",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3l2 6M12 9h6l-6 11M12 9H6l6 11"/></svg>,
            action: () => setActiveNav("cocktails"), isPremiumGated: true,
          },
          {
            id: "knowledge", label: "Knowledge Base",
            subtitle: "101 quick-reference cards",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
            action: () => setActiveNav("knowledge"), isPremiumGated: true,
          },
        ];
        return (
          <div className="psh-quick-nav">
            {quickNavTiles.map((tile) => {
              const isLocked = tile.isPremiumGated && isPremium === false;
              const isStartHere = isNewUser && tile.id === "stage4";
              const content = (
                <>
                  {tile.icon}
                  <span className="psh-quick-nav-label">{tile.label}</span>
                  <span className="psh-quick-nav-sub">{tile.subtitle}</span>
                  {isStartHere && (
                    <span style={{ fontSize: "0.68rem", color: "var(--gold)", fontWeight: 700, marginTop: 2 }}>
                      Start here
                    </span>
                  )}
                  {isLocked && (
                    <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: "var(--gold-dim)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  )}
                </>
              );
              const cls = `psh-quick-nav-item${isStartHere ? " psh-quick-nav-item--start-here" : ""}`;
              const style: React.CSSProperties = { opacity: isLocked ? 0.65 : 1, position: "relative" };
              return tile.href ? (
                <Link key={tile.id} href={tile.href} className={cls} style={style}>{content}</Link>
              ) : (
                <button key={tile.id} type="button" className={cls} onClick={tile.action} style={style}>{content}</button>
              );
            })}
          </div>
        );
      })()}

      {/* ── A2: Hero Grid: Pre-Shift Brief (left) + Daily Challenge (right) ── */}
      <div
        className="psh-hero-grid"
        data-animate
        ref={(el) => { animRefs.current[1] = el; }}
      >
        <div className="psh-brief-col">
          <div className="psh-welcome">
            <div>
              <span className="eyebrow">Pre-shift brief</span>
              <h1>Welcome back, {displayName}</h1>
              {!loaded ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                  {[80, 65, 72].map((width, i) => (
                    <div key={i} style={{
                      height: 16, width: `${width}%`, borderRadius: 8,
                      background: "var(--line-light)",
                      animation: "skeletonPulse 1.4s ease-in-out infinite",
                      animationDelay: `${i * 150}ms`,
                    }} />
                  ))}
                </div>
              ) : (
                <p>
                  {totalSessions === 0
                    ? "Start your first training session to build your service skills."
                    : `You've completed ${totalSessions} session${totalSessions !== 1 ? "s" : ""}. ${
                        data.reviewDue > 0
                          ? `${data.reviewDue} review${data.reviewDue !== 1 ? "s" : ""} due for spaced repetition.`
                          : "Keep pushing your weakest area."
                      }`}
                </p>
              )}
            </div>
          </div>
          <div className="psh-coach psh-coach-brief">
            <div className="psh-coach-header">
              <h2>Focus for today</h2>
              <span>Based on your weakest area: {MODULE_META[weakest].short}</span>
            </div>
            <ul className="psh-coach-list">
              {coachTips.map((tip, i) => (
                <li key={tip} style={{
                  borderLeft: i === 0 ? "3px solid var(--gold)" : "3px solid transparent",
                  paddingLeft: 10,
                  color: i === 0 ? "var(--text)" : "var(--text-soft)",
                  fontSize: i === 0 ? "0.92rem" : "0.87rem",
                  fontWeight: i === 0 ? 500 : 400,
                }}>
                  <span className="psh-coach-arrow">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="psh-challenge-col" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

          {/* ── 101 Knowledge Carousel ── */}
          <div style={{ background: "var(--green)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", color: "#fff", flex: "0 0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.625rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
                  101 KNOWLEDGE
                </span>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: kbCatColor + "33", color: kbCatColor, border: `1px solid ${kbCatColor}55`, padding: "1px 7px", borderRadius: 99 }}>
                  {kbCatLabel}
                </span>
              </div>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>
                {kbIndex + 1} / {KB_ENTRIES.length}
              </span>
            </div>
            <strong style={{ display: "block", fontSize: "0.975rem", fontWeight: 800, lineHeight: 1.3, marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
              {kbEntry.title}
            </strong>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {kbEntry.keyFacts.slice(0, 3).map((fact) => (
                <li key={fact} style={{ fontSize: "0.78rem", lineHeight: 1.5, color: "rgba(255,255,255,0.82)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--gold-warm)", flexShrink: 0, marginTop: 1, fontWeight: 700 }}>—</span>
                  {fact}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "0.875rem", height: 3, borderRadius: 99, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "var(--gold-warm)", width: `${((kbIndex + 1) / KB_ENTRIES.length) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* ── Daily Cocktail Highlights ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", flex: 1 }}>
            {[dailyCocktail1, dailyCocktail2].map((cocktail) => (
              <div key={cocktail.name} style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", padding: "1rem 1.1rem", border: "1.5px solid var(--line)", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.375rem", display: "block" }}>
                  TODAY&rsquo;S COCKTAIL
                </span>
                <strong style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.25, marginBottom: "0.25rem", letterSpacing: "-0.01em" }}>
                  {cocktail.name}
                </strong>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  {cocktail.glass}
                </span>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                  {cocktail.ingredients.slice(0, 5).map((ing) => (
                    <li key={ing} style={{ fontSize: "0.7rem", color: "var(--text-soft)", display: "flex", gap: 5, alignItems: "flex-start", lineHeight: 1.4 }}>
                      <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }}>·</span>
                      {ing}
                    </li>
                  ))}
                  {cocktail.ingredients.length > 5 && (
                    <li style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic", paddingLeft: 13 }}>
                      +{cocktail.ingredients.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── A3: Training Progress ── */}
      <div
        className="psh-modules"
        data-animate
        ref={(el) => { animRefs.current[2] = el; }}
      >
        <h2>Training Progress</h2>
        <div className="psh-module-row">
          {(["bartending", "sales", "management"] as ModuleKey[]).map((mod, index) => {
            const mastery = categoryMastery[mod];
            const { short, Icon } = MODULE_META[mod];
            const total = CATEGORY_MODULE_TOTALS[mod];
            const completed = data.allModules.filter(
              (m) => m.category === CATEGORY_NAV_KEY[mod] && (data.moduleProgress[m.id]?.mastery ?? 0) >= 80
            ).length;
            const started = data.allModules.filter(
              (m) => m.category === CATEGORY_NAV_KEY[mod] && (data.moduleProgress[m.id]?.scenariosAttempted ?? 0) > 0
            ).length;
            const isLocked = mod === "management" && !managementUnlocked;
            const navigate = () => {
              if (onNavigateToCategory) onNavigateToCategory(CATEGORY_NAV_KEY[mod]);
              else setActiveNav("module");
            };
            return (
              <div
                key={mod}
                className="psh-module-card"
                data-index={index}
                onClick={navigate}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(); }}
                style={{ position: "relative" }}
              >
                <span className="psh-module-icon">
                  <Icon size={28} style={{ color: "var(--green-mid)" }} />
                </span>
                <strong>{short}</strong>
                <div className="psh-module-progress-bar">
                  <div
                    className="psh-module-progress-fill"
                    style={{ width: loaded ? `${Math.max(4, mastery)}%` : "4px" }}
                  />
                </div>
                <p className="psh-module-next" style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  {started === 0
                    ? `0 of ${total} modules started`
                    : completed === total
                    ? `All ${total} modules mastered`
                    : completed > 0
                    ? `${completed} of ${total} mastered · ${started} started`
                    : `${started} of ${total} in progress`}
                </p>
                <button
                  className="psh-module-cta-pill"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigate(); }}
                >
                  {mastery >= 80 ? "Review" : mastery > 0 ? "Continue" : "Start training"}
                </button>
                {isLocked && (
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(245,242,233,0.88)", borderRadius: "var(--radius-lg)", gap: 8,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", margin: 0, padding: "0 12px" }}>
                      Available with venue access
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── S5: Progress Snapshot Strip ── */}
      {loaded && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line-light)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginTop: 16 }}>
          {isProgressZeroState ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Complete your first module to see your stats here.
              </p>
              <button onClick={() => setActiveNav("module")} style={{ padding: "7px 16px", borderRadius: "var(--radius-pill)", border: "1px solid var(--green)", background: "transparent", color: "var(--green)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                Start Module 1 →
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", margin: "0 0 2px" }}>Avg Mastery</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                  {avgScore > 0 ? `${avgScore}%` : "—"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", margin: "0 0 2px" }}>Modules Done</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                  {modulesComplete}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/{data.allModules.length}</span>
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", margin: "0 0 2px" }}>Day Streak</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{streak}</p>
              </div>
              <button onClick={() => setActiveNav("progress")} style={{ padding: "8px 16px", borderRadius: "var(--radius-pill)", border: "1px solid var(--green)", background: "transparent", color: "var(--green)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                Full progress →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── A4: Your Achievements ── */}
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>
            Your Achievements
          </h2>
        </div>
        {loaded && badgeEarned === 0 ? (
          <div style={{ background: "var(--green-light)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "20px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-soft)", margin: "0 0 12px" }}>
              Complete your first module to earn your first badge
            </p>
            <button onClick={() => setActiveNav("module")} style={{ padding: "8px 20px", borderRadius: "var(--radius-pill)", border: "1px solid var(--green)", background: "transparent", color: "var(--green)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
              Start earning →
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onBadgesNav?.()}
            onKeyDown={(e) => { if (e.key === "Enter") onBadgesNav?.(); }}
            className="psh-badges-row"
            data-animate
            ref={(el) => { animRefs.current[3] = el as HTMLElement | null; }}
          >
            <div className="psh-badges-row-left">
              <span className="psh-badges-count">{badgeEarned} earned</span>
              {recentBadges.length > 0 && (
                <div className="psh-badges-chips">
                  {recentBadges.map((b) => (
                    <span key={b.id} className="psh-badge-chip psh-badge-chip--earned">
                      {AWARD_ICON}
                      {b.label}
                    </span>
                  ))}
                  {badgeEarned > 3 && (
                    <span className="psh-badge-chip psh-badge-chip--more">+{badgeEarned - 3} more</span>
                  )}
                </div>
              )}
            </div>
            <span className="psh-badges-cta">View all &rarr;</span>
          </div>
        )}
      </div>

    </div>
  );
}
