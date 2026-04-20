"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type NavItem = "home" | "stage1" | "stage2" | "stage3" | "stage4" | "scenarios" | "cocktails" | "knowledge" | "progress" | "settings";
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
};

const MODULE_LABELS: Record<ModuleKey, { label: string; short: string; icon: string }> = {
  bartending: { label: "Bartending Fundamentals", short: "Bartending", icon: "🍸" },
  sales: { label: "Sales & Upselling", short: "Sales", icon: "💬" },
  management: { label: "Shift Leadership", short: "Leadership", icon: "📋" },
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

function getSkillLevel(avgCompletion: number, avgMastery: number): number {
  const combined = avgCompletion * 0.6 + avgMastery * 0.4;
  return Math.min(10, Math.max(1, Math.ceil(combined / 10)));
}

function getWeakestModule(data: ProgressData): ModuleKey {
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  return keys.reduce((w, k) => (data.modules[k] < data.modules[w] ? k : w));
}

function getNextStage(lp: LevelProgress): { stage: number; label: string } {
  if (!lp.level1_completed) return { stage: 1, label: "Stage 1 Recall" };
  if (!lp.level2_completed) return { stage: 2, label: "Stage 2 Application" };
  if (!lp.level3_completed) return { stage: 3, label: "Stage 3 Advanced" };
  return { stage: 4, label: "Stage 4 Scenario" };
}

function getStageNav(stage: number): NavItem {
  if (stage === 1) return "stage1";
  if (stage === 2) return "stage2";
  if (stage === 3) return "stage3";
  return "stage4";
}

export default function PreShiftHome({
  displayName,
  setActiveNav,
}: {
  displayName: string;
  setActiveNav: (nav: NavItem) => void;
}) {
  const [data, setData] = useState<ProgressData>(EMPTY);

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

  // Badge count
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
        </div>
        <div className="psh-mastery-right">
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
        </div>

        <div className="psh-action-card" onClick={() => setActiveNav(getStageNav(weakestNext.stage))} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setActiveNav(getStageNav(weakestNext.stage)); }}>
          <span className="psh-action-eyebrow">STRENGTHEN YOUR WEAKNESS</span>
          <div className="psh-action-body">
            <span className="psh-action-icon">{MODULE_LABELS[weakest].icon}</span>
            <div>
              <strong>{MODULE_LABELS[weakest].label}</strong>
              <p>
                {`${Math.round(data.modules[weakest])}% complete · Next: ${weakestNext.label}`}
              </p>
            </div>
          </div>
          <span className="psh-action-cta">Start {weakestNext.label} →</span>
        </div>
      </div>

      {/* ── Quick Actions Grid ── */}
      <div className="psh-grid">
        <button
          className="psh-tile"
          onClick={() => setActiveNav("stage1")}
          type="button"
        >
          <span className="psh-tile-icon">⚡</span>
          <strong>Quick Warm-Up</strong>
          <p>60-second Stage 1 Recall quiz to get your brain shift-ready</p>
        </button>

        <button
          className="psh-tile"
          onClick={() => setActiveNav("cocktails")}
          type="button"
        >
          <span className="psh-tile-icon">🍹</span>
          <strong>Cocktail Specs</strong>
          <p>Check a recipe or review specs before the rush</p>
        </button>

        <button
          className="psh-tile"
          onClick={() => setActiveNav("knowledge")}
          type="button"
        >
          <span className="psh-tile-icon">📖</span>
          <strong>Knowledge Base</strong>
          <p>Quick-access 101 guides for wine, spirits, and service</p>
        </button>

        <button
          className="psh-tile"
          onClick={() => setActiveNav("progress")}
          type="button"
        >
          <span className="psh-tile-icon">📈</span>
          <strong>My Progress</strong>
          <p>View badges, scores, and training history</p>
        </button>
      </div>

      {/* ── Coach Focus ── */}
      <div className="psh-coach">
        <div className="psh-coach-header">
          <h2>Focus for today</h2>
          <span>Based on your weakest area: {MODULE_LABELS[weakest].short}</span>
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

      {/* ── Module Progress Summary ── */}
      <div className="psh-modules">
        <h2>Your modules</h2>
        <div className="psh-module-row">
          {(["bartending", "sales", "management"] as ModuleKey[]).map((mod) => {
            const lp = data.levelProgress[mod];
            const stagesComplete = (lp.level1_completed ? 1 : 0) + (lp.level2_completed ? 1 : 0) + (lp.level3_completed ? 1 : 0);
            const nextStage = getNextStage(lp);
            return (
              <button
                key={mod}
                className="psh-module-card"
                type="button"
                onClick={() => setActiveNav(getStageNav(nextStage.stage))}
              >
                <span className="psh-module-icon">{MODULE_LABELS[mod].icon}</span>
                <strong>{MODULE_LABELS[mod].short}</strong>
                <div className="psh-module-stages">
                  <span className={lp.level1_completed ? "done" : ""}>S1</span>
                  <span className={lp.level2_completed ? "done" : ""}>S2</span>
                  <span className={lp.level3_completed ? "done" : ""}>S3</span>
                  <span className={data.sessions[mod] >= 1 && data.scores[mod] >= 21 ? "done" : ""}>S4</span>
                </div>
                <p className="psh-module-next">
                  {stagesComplete === 4 && data.scores[mod] >= 21
                    ? "Mastered"
                    : `Next: ${nextStage.label}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
