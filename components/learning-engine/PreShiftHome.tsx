"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Zap, GlassWater, TrendingUp, Users, Flame } from "lucide-react";
import { computeBadges, countEarned, recentEarned, type ModuleSummaryForBadges, type CategoryScores } from "@/lib/badges";
import Link from "next/link";

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

type DailyChallenge = { title: string; desc: string; nav: NavItem };

const DAILY_CHALLENGES: DailyChallenge[] = [
  { title: "Perfect the Martini", desc: "Describe the classic variants and how to read a guest's preference.", nav: "rapid-fire" },
  { title: "Upsell without pressure", desc: "Practise guiding a guest from the house wine to a premium option.", nav: "rapid-fire" },
  { title: "Survive a rush", desc: "Handle three simultaneous orders while keeping guests happy.", nav: "scenarios" },
  { title: "Difficult guest recovery", desc: "Turn a frustrated guest into a loyal advocate in under 2 minutes.", nav: "scenarios" },
  { title: "Menu knowledge drill", desc: "Describe today's specials confidently and pair them with drinks.", nav: "rapid-fire" },
  { title: "Management mindset", desc: "Walk through how to brief a new hire on service standards.", nav: "rapid-fire" },
  { title: "Sales target scenario", desc: "Your venue needs to hit a cover target — walk through your plan.", nav: "rapid-fire" },
];

function getDailyChallenge(): DailyChallenge {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

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

function getWeakestModule(data: ProgressData): ModuleKey {
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  return keys.reduce((w, k) => ((data.mastery[k] ?? 0) < (data.mastery[w] ?? 0) ? k : w));
}

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
  setActiveNav: (nav: NavItem) => void;
  managementUnlocked?: boolean;
}) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

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
  const weakest = getWeakestModule(data);
  const weakestMastery = Math.min(100, Math.round(data.mastery[weakest] ?? 0));
  const coachTips = COACH_FOCUS[weakest];
  const lastTrainedLabel = formatLastTrained(data.lastAttemptAt);
  const WeakestIcon = MODULE_META[weakest].Icon;
  const challenge = getDailyChallenge();

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
              <span>Based on your weakest area: {MODULE_META[weakest].short}</span>
            </div>
            <ul className="psh-coach-list">
              {coachTips.map((tip) => (
                <li key={tip}>
                  <span className="psh-coach-arrow">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="psh-challenge-col">
          <div
            className="psh-action-card psh-action-card-hero psh-challenge-card"
            onClick={() => setActiveNav(challenge.nav)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveNav(challenge.nav); }}
          >
            <div className="psh-action-header-row">
              <span className="psh-action-eyebrow">STRENGTHEN YOUR WEAKNESS</span>
              <span className="psh-daily-badge">DAILY CHALLENGE</span>
            </div>
            <strong className="psh-challenge-title">{challenge.title}</strong>
            <p className="psh-challenge-desc">{challenge.desc}</p>
            <span className="psh-action-cta">Start Daily Challenge →</span>
            <div className="psh-action-body">
              <WeakestIcon size={18} style={{ flexShrink: 0, color: "var(--gold-warm, #d4a853)" }} />
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{MODULE_META[weakest].label}</span>
                <p style={{ margin: 0, fontSize: "0.78rem" }}>{weakestMastery >= 80 ? "Mastered" : weakestMastery > 0 ? `${weakestMastery}% mastered · keep going` : "Not started yet"}</p>
              </div>
            </div>
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
                onClick={() => setActiveNav("module")}
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
