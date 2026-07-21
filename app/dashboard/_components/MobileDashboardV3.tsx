"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { computeBadges, type Badge, type ModuleSummaryForBadges, type CategoryScores } from "@/lib/badges";

// ── Types ─────────────────────────────────────────────────────
type NavItem =
  | "home" | "mobile-learn" | "module" | "rapid-fire" | "stage4"
  | "scenarios" | "challenges" | "cocktails" | "knowledge"
  | "progress" | "badges" | "settings";

type ModuleKey = "bartending" | "sales" | "management";

type LevelProgress = {
  level1_completed: boolean; level2_completed: boolean;
  level3_completed: boolean; level4_unlocked: boolean;
  level1_score: number; level2_score: number; level3_score: number;
};

type DbModule = {
  id: number;
  title: string;
  category: string;
  description: string;
  difficulty_level: string | number;
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
  scenarioCounts: Record<string, number>;
  bestCorrectStreak: number;
  sbeEliteNumber: number;
};

const EMPTY_LP: LevelProgress = {
  level1_completed: false, level2_completed: false,
  level3_completed: false, level4_unlocked: false,
  level1_score: 0, level2_score: 0, level3_score: 0,
};

const EMPTY: ProgressData = {
  modules: { bartending: 0, sales: 0, management: 0 },
  mastery: { bartending: 0, sales: 0, management: 0 },
  scores: { bartending: 0, sales: 0, management: 0 },
  sessions: { bartending: 0, sales: 0, management: 0 },
  reviewDue: 0,
  levelProgress: { bartending: EMPTY_LP, sales: EMPTY_LP, management: EMPTY_LP },
  lastAttemptAt: null,
  allModules: [],
  moduleProgress: {},
  scenarioCounts: {},
  bestCorrectStreak: 0,
  sbeEliteNumber: 0,
};

// ── Level titles ───────────────────────────────────────────────
const LEVEL_TITLES: Record<number, string> = {
  1: "Barback", 2: "Glass Runner", 3: "Prep Bartender", 4: "Bartender",
  5: "Senior Bartender", 6: "Shift Lead", 7: "Bar Supervisor",
  8: "Head Bartender", 9: "Assistant Manager", 10: "Mixologist",
};

// ── Helpers ────────────────────────────────────────────────────
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
    const daysDiff = Math.round(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000,
    );
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

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getNextModule(
  allModules: DbModule[],
  moduleProgress: Record<number, DbModuleProgress>,
): DbModule | null {
  if (!allModules.length) return null;
  const inProgress = allModules
    .filter((m) => { const p = moduleProgress[m.id]; return p && p.completion > 0 && p.mastery < 80; })
    .sort((a, b) => (moduleProgress[b.id]?.completion ?? 0) - (moduleProgress[a.id]?.completion ?? 0));
  if (inProgress.length > 0) return inProgress[0];
  const unstarted = allModules
    .filter((m) => !moduleProgress[m.id] || moduleProgress[m.id].completion === 0)
    .sort((a, b) => a.id - b.id);
  if (unstarted.length > 0) return unstarted[0];
  return [...allModules].sort(
    (a, b) => (moduleProgress[a.id]?.mastery ?? 0) - (moduleProgress[b.id]?.mastery ?? 0),
  )[0] ?? null;
}

function getWeeklyFocus(
  allModules: DbModule[],
  moduleProgress: Record<number, DbModuleProgress>,
): DbModule[] {
  if (!allModules.length) return [];
  const inProgress = allModules
    .filter((m) => { const p = moduleProgress[m.id]; return p && p.completion > 0 && p.mastery < 80; })
    .sort((a, b) => (moduleProgress[b.id]?.completion ?? 0) - (moduleProgress[a.id]?.completion ?? 0));
  const unstarted = allModules
    .filter((m) => !moduleProgress[m.id] || moduleProgress[m.id].completion === 0)
    .sort((a, b) => a.id - b.id);
  const combined = [...inProgress, ...unstarted];
  if (combined.length > 0) return combined.slice(0, 4);
  return [...allModules].sort((a, b) => a.id - b.id).slice(0, 4);
}

function moduleMinutes(difficulty: string | number): string {
  const d = typeof difficulty === "string" ? parseInt(difficulty, 10) : difficulty;
  const map: Record<number, string> = { 1: "2 min", 2: "3 min", 3: "4 min", 4: "5 min", 5: "7 min" };
  return map[d] ?? "3 min";
}

// ── Inline SVG icons (no external dependencies) ───────────────
const ICON_STROKE = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IcFlame({ s = 17 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="2" aria-hidden="true">
      <path d="M12 3c.5 3-2 4-2 7a2 2 0 0 0 4 0c0-.8-.3-1.4-.3-1.4 2 1 3.3 3 3.3 5.4a5 5 0 1 1-10 0C7 11 11 9.5 12 3Z" />
    </svg>
  );
}

function IcArrow({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function IcX({ s = 20 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="2" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IcGlass({ s = 28 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <path d="M6 4h12l-5 7v6M6 4l6 7M18 4l-6 7M9 20h6" />
    </svg>
  );
}

function IcTarget({ s = 28 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="currentColor" />
    </svg>
  );
}

function IcLayers({ s = 28 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
    </svg>
  );
}

function IcClock({ s = 28 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function IcStar({ s = 22 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
    </svg>
  );
}

function IcMedal({ s = 22 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="14" r="5" /><path d="M9 9 6.5 3M15 9 17.5 3" />
    </svg>
  );
}

function IcSparkle({ s = 26 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L13.6 10.4 22 12 13.6 13.6 12 22 10.4 13.6 2 12 10.4 10.4Z" />
      <path d="M19.5 3L20.3 5.7 23 6.5 20.3 7.3 19.5 10 18.7 7.3 16 6.5 18.7 5.7Z" opacity="0.65" />
    </svg>
  );
}

function categoryIcon(category: string, size = 28) {
  if (category === "technical") return <IcGlass s={size} />;
  if (category === "service") return <IcTarget s={size} />;
  if (category === "compliance") return <IcLayers s={size} />;
  return <IcClock s={size} />;
}

function categoryTint(category: string, idx: number) {
  if (category === "technical") return "var(--gold-light)";
  if (category === "service") return "var(--green-light)";
  if (category === "compliance") return "var(--green-light)";
  const fallback = ["var(--gold-light)", "var(--green-light)", "var(--green-light)", "var(--gold-light)"];
  return fallback[idx % 4];
}

function categoryIconColor(category: string, idx: number) {
  if (category === "technical") return "var(--gold)";
  if (category === "service") return "var(--green)";
  if (category === "compliance") return "var(--green)";
  const fallback = ["var(--gold)", "var(--green)", "var(--green)", "var(--gold)"];
  return fallback[idx % 4];
}

function badgeIcon(b: Badge) {
  if (b.id.startsWith("streak")) return <IcFlame s={26} />;
  if (b.category === "technical") return <IcGlass s={26} />;
  if (b.category === "service") return <IcTarget s={26} />;
  if (b.category === "compliance") return <IcLayers s={26} />;
  if (b.id === "sbe-elite") return <IcStar s={26} />;
  if (b.id === "pro") return <IcMedal s={26} />;
  return <IcMedal s={26} />;
}

// ── Daily goal ring ────────────────────────────────────────────
const RING_R = 20;
const RING_C = 2 * Math.PI * RING_R;

function getDailyGoalCount(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    return parseInt(localStorage.getItem(`sbe-daily-goal-${today}`) ?? "0", 10);
  } catch { return 0; }
}

function incrementDailyGoalCount(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `sbe-daily-goal-${today}`;
    const next = Math.min(3, parseInt(localStorage.getItem(key) ?? "0", 10) + 1);
    localStorage.setItem(key, String(next));
    return next;
  } catch { return 0; }
}

// ── Glowing progress bar ───────────────────────────────────────
function GlowBar({ pct, height = 8 }: { pct: number; height?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 350);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{ width: "100%", height, borderRadius: 99, overflow: "hidden", background: "rgba(31,78,55,0.10)" }}>
      <div style={{
        height: "100%", width: `${w}%`, borderRadius: 99,
        background: "linear-gradient(90deg, var(--gold-warm), var(--gold))",
        boxShadow: "0 0 10px rgba(196,154,47,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
        transition: "width 1.1s cubic-bezier(.22,.9,.3,1)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
          animation: "sbe-shimmer 2.6s ease-in-out infinite",
        }} />
      </div>
    </div>
  );
}

// ── AI Coach sheet ─────────────────────────────────────────────
type ChatMessage = { role: "user" | "assistant"; text: string };

const PRESET_QUESTIONS = [
  "Quiz me on tonight's specials",
  "Roleplay: angry guest, missing entrée",
  "What's the spec for an Old Fashioned?",
];

function AICoachSheet({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  async function askCoach(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    setError("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, language: "en-AU" }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) throw new Error(data.error || "Could not get a response.");
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Coach is unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const q = input;
    setInput("");
    askCoach(q);
  }

  const hasConversation = messages.length > 0 || isLoading;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1000 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,45,29,0.4)", backdropFilter: "blur(2px)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          background: "var(--surface)", color: "var(--text)",
          padding: "14px 18px 0",
          borderRadius: "24px 24px 0 0", maxHeight: "78%",
          display: "flex", flexDirection: "column",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          boxShadow: "0 -12px 40px rgba(15,45,29,0.2)",
          animation: "sbe-slide-up .32s cubic-bezier(.22,.9,.3,1)",
        }}
      >
        <div style={{ width: 40, height: 4, background: "var(--line)", borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(145deg, var(--gold-warm), var(--gold))", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcSparkle s={21} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 18, fontWeight: 600 }}>AI Coach</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Ask anything · instant answers</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close">
            <IcX s={20} />
          </button>
        </div>

        {hasConversation ? (
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: msg.role === "user" ? "var(--green)" : "var(--bg-alt)",
                color: msg.role === "user" ? "var(--bg)" : "var(--text)",
                border: msg.role === "assistant" ? "1px solid var(--line-light)" : "none",
                borderRadius: 12, padding: "10px 13px", fontSize: 13, lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}>{msg.text}</div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: "flex-start", background: "var(--bg-alt)", border: "1px solid var(--line-light)", borderRadius: 12, padding: "10px 13px", fontSize: 13, color: "var(--text-muted)" }}>
                Thinking…
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: "var(--bg-alt)", borderRadius: "var(--radius-md)", padding: "13px 15px", fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.5, marginBottom: 14 }}>
              What can I help with before service? Tap a prompt or type your own.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_QUESTIONS.map((q) => (
                <button key={q} onClick={() => askCoach(q)} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--green)", background: "var(--green-light)", padding: "8px 13px", borderRadius: 99, border: "none", cursor: "pointer", minHeight: 0 }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div style={{ fontSize: 12, color: "var(--status-critical-dark)", marginBottom: 10 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 9, alignItems: "center", border: "1.5px solid var(--line)", borderRadius: 99, padding: "6px 6px 6px 16px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the coach…"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text)", fontFamily: "inherit" }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send"
            style={{ width: 38, height: 38, minWidth: 38, borderRadius: "50%", border: "none", background: input.trim() ? "var(--green)" : "var(--line-light)", color: input.trim() ? "var(--bg)" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default" }}
          >
            <IcArrow s={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function MobileDashboardV3({
  displayName,
  setActiveNav,
  plan: _plan,
  onSelectModule,
  progressData,
  onSyncProgress,
}: {
  displayName: string;
  setActiveNav: (nav: NavItem) => void;
  plan: string;
  onSelectModule?: (moduleId: number) => void;
  progressData?: Record<string, unknown> | null;
  onSyncProgress?: () => void;
}) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [streak, setStreak] = useState(0);
  const [coach, setCoach] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [goalCount, setGoalCount] = useState(0);
  const [reviewDismissed, setReviewDismissed] = useState(false);

  // Initialize streak and daily goal count on mount
  useEffect(() => {
    setGoalCount(getDailyGoalCount());
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) setStreak(computeStreak(session.user.id));
      });
    } catch {
      // non-critical
    }
  }, []);

  // Single effect: consume parent progressData prop (DashboardShell fetches once on mount, passes via prop)
  useEffect(() => {
    if (!progressData) {
      setLoaded(false);
      return;
    }
    const res = progressData;
    if (res.modules) {
      const lp = res.levelProgress as Record<string, LevelProgress> | undefined;
      setData({
        modules: res.modules as ProgressData["modules"],
        mastery: (res.mastery as ProgressData["mastery"]) ?? EMPTY.mastery,
        scores: (res.scores as ProgressData["scores"]) ?? EMPTY.scores,
        sessions: (res.sessions as ProgressData["sessions"]) ?? EMPTY.sessions,
        reviewDue: Array.isArray(res.reviewQueue) ? (res.reviewQueue as unknown[]).length : 0,
        levelProgress: {
          bartending: (lp?.bartending as LevelProgress) ?? EMPTY_LP,
          sales: (lp?.sales as LevelProgress) ?? EMPTY_LP,
          management: (lp?.management as LevelProgress) ?? EMPTY_LP,
        },
        lastAttemptAt: (res.lastAttemptAt as string | null) ?? null,
        allModules: Array.isArray(res.allModules) ? res.allModules as ProgressData["allModules"] : [],
        moduleProgress: (res.moduleProgress as ProgressData["moduleProgress"]) ?? {},
        scenarioCounts: (res.scenarioCounts as ProgressData["scenarioCounts"]) ?? {},
        bestCorrectStreak: typeof res.bestCorrectStreak === "number" ? res.bestCorrectStreak : 0,
        sbeEliteNumber: typeof res.sbeEliteNumber === "number" ? res.sbeEliteNumber : 0,
      });
      setLoaded(true);
    }
  }, [progressData]);

  // Derived values
  const totalSessions = data.sessions.bartending + data.sessions.sales + data.sessions.management;
  const firstName = displayName.split(" ")[0] || displayName;
  const initial = (firstName[0] ?? "?").toUpperCase();
  const masteredModules = data.allModules.filter(
    (m) => (data.moduleProgress[m.id]?.scenariosMastered ?? 0) >= 1,
  ).length;
  const totalModules = data.allModules.length;
  const skillLevel = Math.min(
    10,
    Math.max(1, Math.round((masteredModules / Math.max(totalModules, 1)) * 10)),
  );
  const levelTitle = LEVEL_TITLES[skillLevel] ?? "Barback";
  const rawLevel = (masteredModules / Math.max(totalModules, 1)) * 10;
  const levelPct = skillLevel >= 10 ? 100 : Math.min(100, Math.max(0, Math.round(((rawLevel - Math.max(0, skillLevel - 0.5)) / 1.0) * 100)));
  const modulesToNextLevel = skillLevel < 10
    ? Math.max(0, Math.ceil((skillLevel + 0.5) * Math.max(totalModules, 1) / 10) - masteredModules)
    : 0;

  const nextModule = getNextModule(data.allModules, data.moduleProgress);
  const focusModules = getWeeklyFocus(data.allModules, data.moduleProgress);

  const nextProg = nextModule ? (data.moduleProgress[nextModule.id] ?? null) : null;
  const nextTotal = nextModule ? (data.scenarioCounts[`module_${nextModule.id}`] ?? 10) : 10;
  const nextMastered = nextProg?.scenariosMastered ?? 0;
  const nextPct = nextTotal > 0 ? Math.round((nextMastered / nextTotal) * 100) : 0;
  const isLoopMode =
    nextModule != null &&
    data.allModules.length > 0 &&
    !data.allModules.some((m) => {
      const p = data.moduleProgress[m.id];
      return !p || (p.scenariosMastered ?? 0) < 1;
    });

  // Badges
  const moduleSummaries: ModuleSummaryForBadges[] = data.allModules.map((m) => ({
    category: m.category as "technical" | "service" | "compliance",
    mastered: (data.moduleProgress[m.id]?.scenariosMastered ?? 0) >= 1,
    attempted: (data.moduleProgress[m.id]?.scenariosAttempted ?? 0) > 0,
  }));
  const badges = computeBadges(
    moduleSummaries,
    data.mastery as CategoryScores,
    streak,
    data.bestCorrectStreak,
    data.sbeEliteNumber,
  );
  const earnedBadges = badges.filter((b) => b.earned);
  const nextTargetBadge = badges.find((b) => !b.earned) ?? null;
  const displayBadges = nextTargetBadge ? [...earnedBadges, nextTargetBadge] : earnedBadges;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--bg)", color: "var(--text)",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-manrope, system-ui, sans-serif)",
      overflow: "hidden", position: "relative",
    }}>
      <style>{`
        @keyframes sbe-shimmer { 0%{transform:translateX(-100%)} 60%,100%{transform:translateX(220%)} }
        @keyframes sbe-slide-up { from{transform:translateY(110%)} to{transform:translateY(0)} }
        .sbe-tap { transition: transform .12s ease; cursor: pointer; }
        .sbe-tap:active { transform: scale(0.975); }
      `}</style>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 140, WebkitOverflowScrolling: "touch" }}>

        {/* Hero header */}
        <div style={{
          background: "linear-gradient(160deg, var(--green) 0%, var(--green-deep) 100%)",
          borderRadius: "0 0 32px 32px", padding: "36px 22px 18px",
          color: "var(--bg)", boxShadow: "0 12px 32px rgba(15,45,29,0.22)",
        }}>
          {/* Mini-bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Image src="/logo.png" alt="SBE" width={28} height={28} style={{ borderRadius: 6 }} />
              <span style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 20, fontWeight: 600, letterSpacing: 0.3, lineHeight: 1 }}>
                Serve<span style={{ color: "var(--gold-warm)" }}>·</span>SBE
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {streak > 0 && (
                <div style={{ height: 34, display: "flex", alignItems: "center", gap: 5, padding: "0 11px 0 8px", borderRadius: 99, border: "1.5px solid var(--gold-warm)", background: "rgba(196,154,47,0.16)", color: "var(--gold-warm)", fontWeight: 800, fontSize: 14 }}>
                  <IcFlame s={17} />{streak}
                </div>
              )}
              <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
                <svg
                  style={{ position: "absolute", top: -4, left: -4, width: 44, height: 44, pointerEvents: "none" }}
                  viewBox="0 0 44 44"
                >
                  <circle cx="22" cy="22" r={RING_R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
                  <circle
                    cx="22" cy="22" r={RING_R}
                    fill="none"
                    stroke="var(--gold-warm)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - Math.min(goalCount / 3, 1))}
                    transform="rotate(-90 22 22)"
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.22,.9,.3,1)" }}
                  />
                </svg>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(145deg, var(--green-mid), var(--green))", border: "2px solid var(--gold-warm)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                  {initial}
                </div>
              </div>
            </div>
          </div>

          {/* Greeting */}
          <div suppressHydrationWarning style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 25, fontWeight: 600, letterSpacing: -0.2, marginBottom: 3 }}>
            {timeGreeting()}, {firstName}
          </div>

          {/* Momentum subline */}
          <div suppressHydrationWarning style={{ fontSize: 12.5, color: "rgba(245,242,233,0.62)", marginBottom: 12, fontWeight: 500 }}>
            {streak > 2
              ? `Day ${streak} streak — keep it going`
              : loaded && data.reviewDue > 0
              ? `${data.reviewDue} module${data.reviewDue !== 1 ? "s" : ""} ready for review`
              : loaded && masteredModules > 0
              ? `${masteredModules} of ${Math.max(totalModules, 1)} modules mastered`
              : "What will you learn today?"}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex" }}>
            {([
              [loaded ? String(totalSessions) : "--", "Sessions", 0.7],
              [loaded ? `${masteredModules}/${Math.max(totalModules, 1)}` : "--", "Modules", 0.7],
              [loaded ? levelTitle : "...", "Your level", 1.6],
            ] as [string, string, number][]).map(([val, lbl, flexVal], i) => (
              <div key={lbl} style={{ flex: flexVal, minWidth: 0, paddingLeft: i ? 10 : 0, borderLeft: i ? "1px solid rgba(245,242,233,0.16)" : "none" }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {loaded ? val : <div className="skeleton-line" style={{ width: 36, height: 20, marginBottom: 0, opacity: 0.35 }} />}
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(245,242,233,0.55)", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Level progression bar */}
          {loaded && (
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(245,242,233,0.12)", paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(245,242,233,0.65)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Level {skillLevel} — {levelTitle}
                </span>
                {skillLevel < 10 && modulesToNextLevel > 0 && (
                  <span style={{ fontSize: 10.5, color: "rgba(245,242,233,0.45)", fontWeight: 600 }}>
                    {modulesToNextLevel} module{modulesToNextLevel !== 1 ? "s" : ""} to Level {skillLevel + 1}
                  </span>
                )}
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${skillLevel >= 10 ? 100 : levelPct}%`,
                  background: "var(--gold-warm)",
                  borderRadius: 99,
                  transition: "width 1.1s cubic-bezier(.22,.9,.3,1)",
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Review due alert */}
        {loaded && data.reviewDue > 0 && !reviewDismissed && (
          <div style={{ padding: "12px 16px 0" }}>
            <div style={{
              background: "var(--gold-light)", border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)", padding: "11px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ color: "var(--gold)", flexShrink: 0 }}><IcClock s={17} /></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {data.reviewDue} module{data.reviewDue !== 1 ? "s" : ""} due for review
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <button
                  onClick={() => setActiveNav("module")}
                  style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", background: "var(--green-light)", border: "none", padding: "5px 10px", borderRadius: 99, cursor: "pointer" }}
                >
                  Review
                </button>
                <button
                  onClick={() => setReviewDismissed(true)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center" }}
                  aria-label="Dismiss"
                >
                  <IcX s={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue Learning */}
        <div style={{ padding: "12px 16px 0" }}>
          {nextModule ? (
            <button
              className="sbe-tap"
              onClick={() => { setGoalCount(incrementDailyGoalCount()); if (onSelectModule && nextModule) onSelectModule(nextModule.id); else setActiveNav("module"); }}
              style={{ width: "100%", background: "var(--surface)", borderRadius: "var(--radius-xl)", boxShadow: "0 8px 32px rgba(15,45,29,0.10)", overflow: "hidden", border: "1px solid var(--line-light)", textAlign: "left", cursor: "pointer" }}
            >
              <div style={{ height: 76, background: "var(--green-deep)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ opacity: 0.16, color: "var(--bg)" }}>{categoryIcon(nextModule.category, 58)}</div>
                <span style={{ position: "absolute", top: 14, left: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.4, color: "var(--gold-warm)" }}>
                  {isLoopMode ? "Review mode" : "Continue learning"}
                </span>
              </div>
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: 19, fontWeight: 600, color: "var(--text)" }}>{nextModule.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600, margin: "4px 0 14px" }}>
                  {`${masteredModules} of 40 modules mastered`}
                </div>
                <GlowBar pct={isLoopMode ? 100 : nextPct} height={8} />
              </div>
            </button>
          ) : (
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--line-light)", opacity: 0.5 }}>
              <div style={{ height: 76, background: "var(--bg-alt)" }} />
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ height: 18, background: "var(--bg-alt)", borderRadius: 6, width: "55%", marginBottom: 8 }} />
                <div style={{ height: 8, background: "var(--bg-alt)", borderRadius: 99 }} />
              </div>
            </div>
          )}
        </div>

        {/* This Week's Focus */}
        {focusModules.length > 0 && (
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.4, color: "var(--text-muted)", marginBottom: 10, marginLeft: 2 }}>
              This Week&apos;s Focus
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {focusModules.map((m, i) => (
                <button
                  key={m.id}
                  className="sbe-tap"
                  onClick={() => { setGoalCount(incrementDailyGoalCount()); if (onSelectModule) onSelectModule(m.id); else setActiveNav("module"); }}
                  style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--line-light)", boxShadow: "0 4px 20px rgba(15,45,29,0.05)", textAlign: "left", cursor: "pointer" }}
                >
                  <div style={{ height: 52, background: categoryTint(m.category, i), display: "flex", alignItems: "center", justifyContent: "center", color: categoryIconColor(m.category, i) }}>
                    {categoryIcon(m.category, 28)}
                  </div>
                  <div style={{ padding: "12px 13px 14px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.25, marginBottom: 8, minHeight: 34 }}>{m.title}</div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--green)", background: "var(--green-light)", padding: "4px 9px", borderRadius: 99 }}>
                      {moduleMinutes(m.difficulty_level)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {displayBadges.length > 0 && (
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.4, color: "var(--text-muted)", marginBottom: 10, marginLeft: 2 }}>
              Achievements
            </div>
            <div style={{ maskImage: "linear-gradient(to right, black 82%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 82%, transparent 100%)" }}>
              <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, paddingRight: 32 }}>
              {displayBadges.map((b) => (
                <button
                  key={b.id}
                  className="sbe-tap"
                  onClick={() => { window.location.href = "/dashboard/badges"; }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0, width: 64, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  aria-label={b.label}
                >
                  <div style={{
                    width: 58, height: 58, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${b.earned ? "var(--gold-warm)" : "var(--line)"}`,
                    background: b.earned ? "var(--gold-light)" : "var(--bg-alt)",
                    color: b.earned ? "var(--gold)" : "var(--text-muted)",
                    boxShadow: b.earned ? "0 4px 14px rgba(196,154,47,0.25)" : "none",
                    position: "relative",
                  }}>
                    {badgeIcon(b)}
                    {!b.earned && nextTargetBadge && b.id === nextTargetBadge.id && (
                      <span style={{
                        position: "absolute", bottom: -2, right: -2,
                        background: "var(--green)", color: "white",
                        fontSize: 8, fontWeight: 800, lineHeight: 1,
                        padding: "2px 4px", borderRadius: 99, letterSpacing: 0.3,
                      }}>NEXT</span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: b.earned ? "var(--text-soft)" : "var(--text-muted)", textAlign: "center", lineHeight: 1.2 }}>
                    {b.label}
                  </span>
                </button>
              ))}
              </div>
            </div>
          </div>
        )}

        {onSyncProgress && (
          <div style={{ padding: "18px 16px 0", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onSyncProgress}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", gap: 5,
                color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600,
                fontFamily: "var(--font-manrope, system-ui, sans-serif)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Sync progress
            </button>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>

      {/* AI Coach FAB */}
      <button
        onClick={() => setCoach(true)}
        aria-label="Open AI Coach"
        style={{
          position: "fixed", right: 20, bottom: "calc(100px + env(safe-area-inset-bottom))",
          width: 56, height: 56, borderRadius: "50%", zIndex: 48,
          border: "none", background: "var(--gold-warm)", color: "var(--surface-raised)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(169,129,42,0.4)", cursor: "pointer",
        }}
      >
        <IcSparkle s={26} />
      </button>

      {/* AI Coach sheet overlay */}
      {coach && <AICoachSheet onClose={() => setCoach(false)} />}
    </div>
  );
}