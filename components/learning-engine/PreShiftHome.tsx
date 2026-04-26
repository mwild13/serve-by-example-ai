"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Zap, BookOpen, BarChart2, GlassWater, TrendingUp, Users, Target, Cpu, Flame } from "lucide-react";

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

type ProgressData = {
  modules: Record<ModuleKey, number>;
  mastery: Record<ModuleKey, number>;
  scores: Record<ModuleKey, number>;
  sessions: Record<ModuleKey, number>;
  reviewDue: number;
  levelProgress: Record<ModuleKey, LevelProgress>;
  lastAttemptAt: string | null;
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

const QUICK_ACTIONS: { Icon: React.ElementType; title: string; desc: string; time: string; difficulty: string; nav: NavItem }[] = [
  { Icon: Zap, title: "Quick Warm-Up", desc: "60-second Stage 1 Recall quiz to get your brain shift-ready", time: "60s", difficulty: "Easy", nav: "rapid-fire" },
  { Icon: GlassWater, title: "Cocktail Specs", desc: "Check a recipe or review specs before the rush", time: "5m", difficulty: "Reference", nav: "cocktails" },
  { Icon: BookOpen, title: "Knowledge Base", desc: "101 guides for wine, spirits, and service", time: "5m", difficulty: "Reference", nav: "knowledge" },
  { Icon: BarChart2, title: "My Progress", desc: "View badges, scores, and training history", time: "—", difficulty: "Review", nav: "progress" },
];

function getSkillLevel(avgCompletion: number, avgMastery: number): number {
  const combined = avgCompletion * 0.6 + avgMastery * 0.4;
  return Math.min(10, Math.max(1, Math.ceil(combined / 10)));
}

function getWeakestModule(data: ProgressData): ModuleKey {
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  return keys.reduce((w, k) => (data.modules[k] < data.modules[w] ? k : w));
}

function isMastered(data: ProgressData, mod: ModuleKey): boolean {
  const lp = data.levelProgress[mod];
  return lp.level1_completed && lp.level2_completed && lp.level3_completed &&
    data.sessions[mod] >= 1 && data.scores[mod] >= 21;
}

function getNextStage(lp: LevelProgress): { stage: number; label: string } {
  if (!lp.level1_completed) return { stage: 1, label: "Stage 1 Recall" };
  if (!lp.level2_completed) return { stage: 2, label: "Stage 2 Application" };
  if (!lp.level3_completed) return { stage: 3, label: "Stage 3 Advanced" };
  return { stage: 4, label: "Stage 4 Scenario" };
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

export default function PreShiftHome({
  displayName,
  setActiveNav,
}: {
  displayName: string;
  setActiveNav: (nav: NavItem) => void;
}) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(computeStreak());
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
          });
        }
      } catch {
        // non-critical
      }
    }
    void load();
  }, []);

  const totalSessions = data.sessions.bartending + data.sessions.sales + data.sessions.management;
  const avgCompletion = (data.modules.bartending + data.modules.sales + data.modules.management) / 3;
  const avgMastery = (data.mastery.bartending + data.mastery.sales + data.mastery.management) / 3;
  const skillLevel = getSkillLevel(avgCompletion, avgMastery);
  const weakest = getWeakestModule(data);
  const weakestNext = getNextStage(data.levelProgress[weakest]);
  const coachTips = COACH_FOCUS[weakest];
  const lastTrainedLabel = formatLastTrained(data.lastAttemptAt);
  const WeakestIcon = MODULE_META[weakest].Icon;

  const sortedModules = (["bartending", "sales", "management"] as ModuleKey[]).slice().sort((a, b) => {
    const aM = isMastered(data, a);
    const bM = isMastered(data, b);
    if (aM === bM) return 0;
    return aM ? 1 : -1;
  });

  const badgesEarned = (["bartending", "sales", "management"] as ModuleKey[]).reduce((count, mod) => {
    const lp = data.levelProgress[mod];
    return count + (lp.level1_completed ? 1 : 0) + (lp.level2_completed ? 1 : 0) + (lp.level3_completed ? 1 : 0) + (data.sessions[mod] >= 1 && data.scores[mod] >= 21 ? 1 : 0);
  }, 0);

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
          <div className="psh-stat-pill">
            <span className="psh-stat-pill-val">{totalSessions}</span>
            <span className="psh-stat-pill-key">SESSIONS</span>
          </div>
          <div className="psh-stat-pill">
            <span className="psh-stat-pill-val">{badgesEarned}</span>
            <span className="psh-stat-pill-key">BADGES</span>
          </div>
        </div>
      </div>

      {/* ── Welcome + Recommendation ── */}
      <div className="psh-hero">
        <div className="psh-welcome">
          <span className="eyebrow">Pre-shift brief</span>
          <h1>Welcome back, {displayName}</h1>
          <p>
            {totalSessions === 0
              ? "Start your first training session to build your service skills."
              : `You've completed ${totalSessions} session${totalSessions !== 1 ? "s" : ""}. ${
                  data.reviewDue > 0
                    ? `${data.reviewDue} review${data.reviewDue !== 1 ? "s" : ""} due for spaced repetition.`
                    : "Keep pushing your weakest area."
                }`}
          </p>
          <button
            className="btn btn-primary psh-warmup-btn"
            onClick={() => setActiveNav("rapid-fire")}
            type="button"
          >
            <Zap size={15} />
            Start Pre-Shift Warm-Up
          </button>
        </div>

        <div
          className="psh-action-card"
          onClick={() => setActiveNav("rapid-fire")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") setActiveNav("rapid-fire"); }}
        >
          <span className="psh-action-eyebrow">STRENGTHEN YOUR WEAKNESS</span>
          <div className="psh-action-body">
            <WeakestIcon size={22} style={{ flexShrink: 0, color: "var(--green)" }} />
            <div>
              <strong>{MODULE_META[weakest].label}</strong>
              <p>{`${Math.round(data.modules[weakest])}% complete · Next: ${weakestNext.label}`}</p>
            </div>
          </div>
          <span className="psh-action-cta">Start {weakestNext.label} →</span>
        </div>
      </div>

      {/* ── Quick Actions Grid ── */}
      <div className="psh-grid">
        {QUICK_ACTIONS.map(({ Icon, title, desc, time, difficulty, nav }) => (
          <button
            key={nav}
            className="psh-tile"
            onClick={() => setActiveNav(nav)}
            type="button"
          >
            <span className="psh-tile-icon"><Icon size={18} /></span>
            <strong>{title}</strong>
            <p>{desc}</p>
            <div className="psh-tile-meta">
              <span className="psh-tile-badge">{time}</span>
              <span className="psh-tile-badge">{difficulty}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Coach Focus ── */}
      <div className="psh-coach">
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

      {/* ── Modules ── */}
      <div className="psh-modules">
        <h2>Modules</h2>
        <div className="psh-module-row">
          {sortedModules.map((mod) => {
            const mastered = isMastered(data, mod);
            const pct = Math.round(data.modules[mod]);
            const { short, Icon } = MODULE_META[mod];
            return (
              <button
                key={mod}
                className="psh-module-card psh-module-card--deep"
                type="button"
                onClick={() => setActiveNav("module")}
                style={mastered ? { borderColor: "#2d6a4f" } : undefined}
              >
                <span className="psh-module-icon"><Icon size={22} /></span>
                <strong>{short}</strong>
                {mastered ? (
                  <p className="psh-module-next" style={{ color: "#2d6a4f", fontWeight: 700 }}>Mastered</p>
                ) : pct === 0 ? (
                  <span className="psh-badge-new">START</span>
                ) : (
                  <>
                    <div style={{ width: "100%", height: "4px", background: "#e5e7eb", borderRadius: "999px", margin: "8px 0 4px" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#2d6a4f", borderRadius: "999px" }} />
                    </div>
                    <p className="psh-module-next">{pct}% complete</p>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quick Drills ── */}
      <div className="psh-modules">
        <h2>Quick Drills</h2>
        <div className="psh-module-row">
          {(["bartending", "sales", "management"] as ModuleKey[]).map((mod) => {
            const lp = data.levelProgress[mod];
            const nextStage = getNextStage(lp);
            const { short } = MODULE_META[mod];
            return (
              <button
                key={mod}
                className="psh-module-card"
                type="button"
                onClick={() => setActiveNav("rapid-fire")}
              >
                <span className="psh-module-icon"><Zap size={18} style={{ color: "var(--green-mid)" }} /></span>
                <strong>{short}</strong>
                <div className="psh-module-stages">
                  <span className={lp.level1_completed ? "done" : ""}>S1</span>
                  <span className={lp.level2_completed ? "done" : ""}>S2</span>
                  <span className={lp.level3_completed ? "done" : ""}>S3</span>
                  <span className={data.sessions[mod] >= 1 && data.scores[mod] >= 21 ? "done" : ""}>S4</span>
                </div>
                <p className="psh-module-next">
                  {isMastered(data, mod) ? "Mastered" : `Next: ${nextStage.label}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Training Shortcuts ── */}
      <div className="psh-modules">
        <h2>Training</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
          {([
            { Icon: Target, nav: "stage4" as NavItem, title: "Scenario Training", desc: "Practice real service situations with instant AI scoring and coaching." },
            { Icon: Cpu, nav: "scenarios" as NavItem, title: "AI Scenarios", desc: "Advanced AI-driven simulations for high-pressure hospitality moments." },
          ]).map(({ Icon, nav, title, desc }) => (
            <button
              key={nav}
              type="button"
              onClick={() => setActiveNav(nav)}
              style={{ background: "#1b4332", border: "none", borderRadius: "10px", padding: "20px", textAlign: "left", cursor: "pointer", width: "100%" }}
            >
              <Icon size={20} style={{ display: "block", marginBottom: "8px", color: "rgba(255,255,255,0.65)" }} />
              <strong style={{ display: "block", fontSize: "0.95rem", marginBottom: "6px", color: "white" }}>{title}</strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
