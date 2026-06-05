"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Zap, Flame } from "lucide-react";
import { computeBadges, countEarned, recentEarned, type ModuleSummaryForBadges, type CategoryScores } from "@/lib/badges";
import { getDailyFocus } from "@/lib/daily-focus";
import Link from "next/link";
import { KB_ENTRIES, KB_CATEGORIES } from "@/lib/knowledge-base";
import { COCKTAILS } from "@/lib/cocktails";

type NavItem = "home" | "module" | "rapid-fire" | "stage4" | "scenarios" | "cocktails" | "knowledge" | "progress" | "settings";
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
};

type ModuleCategory = "all" | "technical" | "service" | "compliance";

const MODULE_CATEGORY: Record<ModuleKey, Exclude<ModuleCategory, "all">> = {
  bartending: "technical",
  sales: "service",
  management: "compliance",
};

const MODULE_META: Record<ModuleKey, { label: string; short: string }> = {
  bartending: { label: "Bartending Fundamentals", short: "Bartending" },
  sales: { label: "Sales & Upselling", short: "Sales" },
  management: { label: "Shift Leadership", short: "Leadership" },
};


function computeStreak(userId: string): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastKey = `sbe-streak-last-${userId}`;
    const countKey = `sbe-streak-count-${userId}`;
    const lastDate = localStorage.getItem(lastKey);
    const streakCount = parseInt(localStorage.getItem(countKey) ?? "0", 10);
    if (!lastDate) {
      localStorage.setItem(lastKey, today);
      localStorage.setItem(countKey, "1");
      return 1;
    }
    if (lastDate === today) return streakCount || 1;
    const daysDiff = Math.round((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
    if (daysDiff === 1) {
      const next = streakCount + 1;
      localStorage.setItem(lastKey, today);
      localStorage.setItem(countKey, String(next));
      return next;
    }
    localStorage.setItem(lastKey, today);
    localStorage.setItem(countKey, "1");
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

export default function PreShiftHome({
  displayName,
  setActiveNav,
  managementUnlocked = false,
}: {
  displayName: string;
  setActiveNav: (nav: NavItem, moduleCategory?: ModuleCategory) => void;
  managementUnlocked?: boolean;
}) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [kbIndex, setKbIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setKbIndex((i) => (i + 1) % KB_ENTRIES.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) setStreak(computeStreak(session.user.id));
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

  const totalSessions = data.sessions.bartending + data.sessions.sales + data.sessions.management;
  const masteredModuleCount = data.allModules.filter(
    (m) => (data.moduleProgress[m.id]?.scenariosMastered ?? 0) >= 1,
  ).length;
  const skillLevel = Math.min(
    10,
    Math.max(1, Math.round((masteredModuleCount / Math.max(data.allModules.length, 1)) * 10)),
  );
  const dailyFocus = getDailyFocus(managementUnlocked);
  const lastTrainedLabel = formatLastTrained(data.lastAttemptAt);

  const kbEntry = KB_ENTRIES[kbIndex];
  const kbCatColor = KB_CATEGORIES[kbEntry.category].color;
  const kbCatLabel = KB_CATEGORIES[kbEntry.category].label;

  const dayIdx = Math.floor(Date.now() / 86400000);
  const dailyCocktail1 = COCKTAILS[(dayIdx * 2) % COCKTAILS.length];
  const dailyCocktail2 = COCKTAILS[(dayIdx * 2 + 1) % COCKTAILS.length];

  return (
    <div className="psh">
      {/* ── Mastery Header ── */}
      <div className="psh-mastery-bar">
        <div className="psh-mastery-left">
          <span className="psh-mastery-label">SKILL LEVEL</span>
          <span className="psh-mastery-level">{skillLevel}</span>
          <div className="psh-mastery-track">
            <div className="psh-mastery-fill" style={{ width: `${skillLevel * 10}%` }} />
          </div>
          <span className="psh-mastery-of">/10</span>
          {streak > 0 && (
            <div className="psh-streak-pill">
              <Flame size={13} />
              <span>{streak} day streak</span>
            </div>
          )}
        </div>
        <div className="psh-mastery-right">
          {lastTrainedLabel && (
            <span className="psh-last-trained">Last trained: {lastTrainedLabel}</span>
          )}
        </div>
      </div>

      {/* ── Hero Grid: Pre-Shift Brief (left) + Daily Challenge (right) ── */}
      <div className="psh-hero-grid">
        <div className="psh-brief-col">
          <div className="psh-welcome">
            <div>
              <span className="eyebrow">Pre-shift brief</span>
              <h1>Welcome back, {displayName}</h1>
              <p>
                {!loaded
                  ? "Preparing your training brief..."
                  : totalSessions === 0
                  ? "Start your first training session to build your service skills."
                  : `You've completed ${totalSessions} session${totalSessions !== 1 ? "s" : ""}. ${
                      data.reviewDue > 0
                        ? `${data.reviewDue} review${data.reviewDue !== 1 ? "s" : ""} due for spaced repetition.`
                        : "Keep pushing your weakest area."
                    }`}
              </p>
            </div>
          </div>
          <div className="psh-coach psh-coach-brief">
            <div className="psh-coach-header">
              <h2>Focus for today</h2>
              <span>Day {dailyFocus.dayIndex} of 30 — {dailyFocus.theme}</span>
            </div>
            <ul className="psh-coach-list">
              {dailyFocus.tips.map((tip: string) => (
                <li key={tip}>
                  <span className="psh-coach-arrow">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="psh-challenge-col" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

          {/* ── 101 Knowledge Carousel ── */}
          <div style={{
            background: "var(--green)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem 1.5rem",
            color: "#fff",
            flex: "0 0 auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.625rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.65)",
                }}>
                  101 KNOWLEDGE
                </span>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: kbCatColor + "33",
                  color: kbCatColor,
                  border: `1px solid ${kbCatColor}55`,
                  padding: "1px 7px", borderRadius: 99,
                }}>
                  {kbCatLabel}
                </span>
              </div>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>
                {kbIndex + 1} / {KB_ENTRIES.length}
              </span>
            </div>

            <strong style={{
              display: "block",
              fontSize: "0.975rem", fontWeight: 800, lineHeight: 1.3,
              marginBottom: "0.5rem", letterSpacing: "-0.01em",
            }}>
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
              <div style={{
                height: "100%", borderRadius: 99,
                background: "var(--gold-warm)",
                width: `${((kbIndex + 1) / KB_ENTRIES.length) * 100}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* ── Daily Cocktail Highlights ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", flex: 1 }}>
            {[dailyCocktail1, dailyCocktail2].map((cocktail) => (
              <div
                key={cocktail.name}
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.1rem",
                  border: "1.5px solid var(--line)",
                  display: "flex", flexDirection: "column",
                }}
              >
                <span style={{
                  fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--text-muted)",
                  marginBottom: "0.375rem", display: "block",
                }}>
                  TODAY&rsquo;S COCKTAIL
                </span>
                <strong style={{
                  fontSize: "0.9rem", fontWeight: 800,
                  color: "var(--text)", lineHeight: 1.25,
                  marginBottom: "0.25rem", letterSpacing: "-0.01em",
                }}>
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

      {/* ── Training Progress ── */}
      <div className="psh-modules">
        <h2>Training Progress</h2>
        <div className="psh-module-row">
          {(["bartending", "sales", "management"] as ModuleKey[]).filter((m) => managementUnlocked || m !== "management").map((mod) => {
            const mastery = Math.round(data.mastery[mod] ?? 0);
            const { short } = MODULE_META[mod];
            return (
              <button
                key={mod}
                className="psh-module-card"
                type="button"
                onClick={() => setActiveNav("module", MODULE_CATEGORY[mod])}
              >
                <span className="psh-module-icon"><Zap size={18} style={{ color: "var(--green-mid)" }} /></span>
                <strong>{short}</strong>
                <div style={{ display: "flex", gap: 4, margin: "4px 0" }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < Math.ceil(mastery / 20) ? "var(--green)" : "#e5e7eb", display: "inline-block" }} />
                  ))}
                </div>
                <p className="psh-module-next">
                  {mastery >= 80 ? "Mastered" : mastery > 0 ? `${mastery}% mastered` : "Start training"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Badge Collection Row ── */}
      {loaded && (() => {
        const badgeModules: ModuleSummaryForBadges[] = data.allModules.map((m) => {
          const prog = data.moduleProgress[m.id];
          return {
            category: m.category as "technical" | "service" | "compliance",
            mastered: (prog?.scenariosMastered ?? 0) >= 1,
            attempted: (prog?.scenariosAttempted ?? 0) > 0,
          };
        });
        const badgeScores: CategoryScores = {
          bartending: Math.round(data.mastery.bartending ?? 0),
          sales: Math.round(data.mastery.sales ?? 0),
          management: Math.round(data.mastery.management ?? 0),
        };
        const badges = computeBadges(badgeModules, badgeScores, streak, 0, 0);
        const earned = countEarned(badges);
        const recent = recentEarned(badges, 3);
        return (
          <Link href="/dashboard/badges" className="psh-badges-row">
            <div className="psh-badges-row-left">
              <span className="psh-badges-eyebrow">BADGE COLLECTION</span>
              <span className="psh-badges-count">{earned} earned</span>
              {recent.length > 0 && (
                <div className="psh-badges-chips">
                  {recent.map((b) => (
                    <span key={b.id} className="psh-badge-chip">{b.label}</span>
                  ))}
                  {earned > 3 && (
                    <span className="psh-badge-chip psh-badge-chip--more">+{earned - 3} more</span>
                  )}
                </div>
              )}
            </div>
            <span className="psh-badges-cta">View all &rarr;</span>
          </Link>
        );
      })()}

    </div>
  );
}
