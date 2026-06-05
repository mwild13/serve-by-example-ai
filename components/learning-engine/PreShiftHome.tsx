"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Zap, GlassWater, TrendingUp, Users, Flame } from "lucide-react";
import { computeBadges, countEarned, recentEarned, type ModuleSummaryForBadges, type CategoryScores } from "@/lib/badges";
import { getDailyFocus } from "@/lib/daily-focus";
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

type ModuleCategory = "all" | "technical" | "service" | "compliance";
type DailyChallenge = { title: string; desc: string; nav: NavItem; ctaLabel: string };

const MODULE_CATEGORY: Record<ModuleKey, Exclude<ModuleCategory, "all">> = {
  bartending: "technical",
  sales: "service",
  management: "compliance",
};

const CHALLENGES_BY_MODULE: Record<ModuleKey, DailyChallenge[]> = {
  bartending: [
    { title: "Garnish knowledge drill", desc: "Name the correct garnish for 10 classic cocktails from memory, then practise describing why each one matters.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Classic cocktail variants", desc: "Walk through the Martini, Negroni, Old Fashioned, and Daiquiri — their base ratios and what makes each distinctive.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Non-alcoholic alternatives", desc: "Describe two mocktail options you could offer a non-drinking guest and the flavour profile of each.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Beer style identification", desc: "Distinguish between a lager, pale ale, IPA, and stout — and how you'd describe each to a guest in under 10 words.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Premium spirit descriptions", desc: "Pick your top-selling premium spirit and describe it with three words: region, flavour note, and finish.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Speed pouring under pressure", desc: "Practise your pour sequence: ice, spirit, modifier, garnish — in that order, every time, without hesitation.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Menu pairing drill", desc: "Match three current menu items to a drink recommendation and describe the pairing in one sentence each.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Glassware standards", desc: "Identify the correct glass for a Martini, a G&T, a Spritz, and a straight spirit — and why it matters.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Wine service sequence", desc: "Walk through the full wine service: presenting the bottle, pouring the taste, and serving the table in the right order.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
    { title: "Seasonal specials briefing", desc: "Describe tonight's special or seasonal offer as if explaining it to a guest — flavour first, price last.", nav: "rapid-fire", ctaLabel: "Open in Rapid Fire →" },
  ],
  sales: [
    { title: "Upsell without pressure", desc: "Practise guiding a guest from the house wine to a premium option using flavour language, not price.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Lead with flavour, not price", desc: "A guest asks 'what's the difference?' — practise answering with sensory description before you mention cost.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Close the recommendation", desc: "Practise ending every recommendation with a confident, specific question: 'Would you like to try that tonight?'", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Handle a price objection", desc: "A guest hesitates at the price — walk through three ways to acknowledge and reframe without backing down.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Read the table first", desc: "Before making a recommendation, identify two cues from the guests that should shape what you suggest and why.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Upsell the experience", desc: "Practise recommending something that enhances the moment — not just the product — for a couple celebrating an occasion.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "The two-option rule", desc: "Offer two specific alternatives, not a general 'we have lots of options' — practise narrowing it down for the guest.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Premium spirits pitch", desc: "A guest orders a standard spirit. Practise a one-sentence premium upgrade that leads with taste, not cost.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Build rapport before recommending", desc: "Ask one genuine question before suggesting anything — practise the moment of connection that makes the recommendation land.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Recovery upsell", desc: "After resolving a complaint, a guest has warmed up — practise the recovery upsell that turns the moment into a loyalty win.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
  ],
  management: [
    { title: "Pre-shift risk brief", desc: "Identify the two highest-risk service moments tonight and walk through how you'd brief the team before the doors open.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Delegation with clarity", desc: "Practise assigning a task with all three elements: the person's name, the specific job, and the expected outcome.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Post-shift feedback", desc: "Practise giving one piece of specific, observable feedback to a staff member after a challenging service.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Short-staff coverage plan", desc: "You're one team member down — walk through how you'd redistribute coverage without telling guests anything is different.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Floor walk and standards check", desc: "During a floor walk, you notice two service standards slipping — practise addressing them without disrupting service.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Coaching a missed upsell", desc: "A team member consistently skips upselling — practise the one-on-one coaching conversation that changes the behaviour.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Running the debrief", desc: "Walk through a 5-minute post-shift debrief: one thing that worked, one thing that didn't, one action for tomorrow.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Setting the cover target", desc: "Communicate tonight's cover or revenue goal to the team in a way that motivates without creating pressure.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Managing team conflict", desc: "Two staff members had friction during service — practise the private conversation that addresses it the same shift.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
    { title: "Leading the opening briefing", desc: "Practise a full opening briefing: roles, risks, targets, and one genuine motivational note — under 3 minutes.", nav: "stage4", ctaLabel: "Start Scenario Training →" },
  ],
};

function getDailyChallenge(weakest: ModuleKey): DailyChallenge {
  const pool = CHALLENGES_BY_MODULE[weakest];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return pool[dayOfYear % pool.length];
}

const MODULE_META: Record<ModuleKey, { label: string; short: string; Icon: React.ElementType }> = {
  bartending: { label: "Bartending Fundamentals", short: "Bartending", Icon: GlassWater },
  sales: { label: "Sales & Upselling", short: "Sales", Icon: TrendingUp },
  management: { label: "Shift Leadership", short: "Leadership", Icon: Users },
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
  setActiveNav: (nav: NavItem, moduleCategory?: ModuleCategory) => void;
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
  const dailyFocus = getDailyFocus(managementUnlocked);
  const lastTrainedLabel = formatLastTrained(data.lastAttemptAt);
  const WeakestIcon = MODULE_META[weakest].Icon;
  const challenge = getDailyChallenge(weakest);

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
            <span className="psh-action-cta">{challenge.ctaLabel}</span>
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

      {/* ── Spaced Repetition Review Strip ── */}
      {loaded && data.reviewDue > 0 && (
        <button
          className="psh-review-strip"
          onClick={() => setActiveNav("module")}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", textAlign: "left", cursor: "pointer",
            background: "var(--gold-light)", border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)", padding: "12px 16px",
            marginTop: 0,
          }}
        >
          <span style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "1.35rem", fontWeight: 700, color: "var(--gold)",
            minWidth: 28, lineHeight: 1,
          }}>
            {data.reviewDue}
          </span>
          <span style={{ flex: 1, fontSize: "0.83rem", color: "var(--text-soft)", lineHeight: 1.4 }}>
            {data.reviewDue === 1 ? "scenario" : "scenarios"} due for spaced repetition — keep your retention strong
          </span>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
            Go to Modules →
          </span>
        </button>
      )}

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
