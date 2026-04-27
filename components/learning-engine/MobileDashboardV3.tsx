"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

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

const MODULE_LABELS: Record<ModuleKey, string> = {
  bartending: "Bartending Fundamentals",
  sales: "Sales & Upselling",
  management: "Shift Leadership",
};

// ── Design tokens ──────────────────────────────────────────────
const C = {
  green:        "#0B2B1E",
  greenDeep:    "#06170F",
  greenMute:    "#2C5C46",
  greenTint:    "#E6EDE8",
  parchment:    "#F2EEE5",
  parchmentDeep:"#E8E2D4",
  card:         "#FCFAF5",
  cardEdge:     "#E1DBCB",
  ink:          "#1A1814",
  inkSoft:      "#3F3A30",
  inkMute:      "#7A7264",
  inkFaint:     "#A89F8B",
  amber:        "#B8841F",
};

const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const SANS = '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif';

// ── Helpers ────────────────────────────────────────────────────
function getWeakest(data: ProgressData): ModuleKey {
  const keys: ModuleKey[] = ["bartending", "sales", "management"];
  return keys.reduce((w, k) => (data.modules[k] < data.modules[w] ? k : w));
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

// ── SVG Icons ──────────────────────────────────────────────────
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
const IconFlame = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c0 4-4 5-4 9a4 4 0 008 0c0-2-1-3-1-5 2 1 4 3 4 6a7 7 0 11-14 0c0-5 4-7 7-10z" />
  </svg>
);
const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4l14 8-14 8V4z" />
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const IconAI = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" opacity=".95" />
  </svg>
);
const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
);
const IconSpark = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
  </svg>
);
const IconMic = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0014 0M12 18v3" />
  </svg>
);
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-9z" />
  </svg>
);
const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" /><path d="M4 19h15" />
  </svg>
);
const IconBolt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
const IconFlask = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M9 3h6M10 3v6L4 19a2 2 0 002 2h12a2 2 0 002-2L14 9V3" />
  </svg>
);
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
const IconCpu = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </svg>
);

// ── AI Coach bottom sheet ──────────────────────────────────────
function AICoachSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{ position: "absolute", inset: 0, zIndex: 80 }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          background: C.parchment,
          color: C.ink,
          padding: "14px 18px 32px",
          borderRadius: "12px 12px 0 0",
          maxHeight: "70%",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ width: 36, height: 4, background: C.cardEdge, borderRadius: 2, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: C.green, color: C.parchment, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
              <IconAI />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>AI Coach</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMute, padding: 4 }}>
            <IconClose />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {[
            "Quiz me on tonight's specials",
            "Roleplay: angry guest, missing entrée",
            "What's the spec for an Old Fashioned?",
          ].map((q) => (
            <button
              key={q}
              style={{
                textAlign: "left",
                background: C.card,
                border: `1px solid ${C.cardEdge}`,
                padding: "12px 14px",
                fontFamily: SANS,
                fontSize: 13,
                cursor: "pointer",
                borderRadius: 4,
                display: "flex", alignItems: "center", gap: 10,
                color: C.ink,
              }}
            >
              <span style={{ color: C.green }}><IconSpark /></span>
              <span>{q}</span>
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex", gap: 8, alignItems: "center",
            background: C.card,
            border: `1px solid ${C.cardEdge}`,
            padding: "10px 14px", borderRadius: 4,
          }}
        >
          <input
            placeholder="Ask anything…"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: SANS, fontSize: 14, color: C.ink }}
          />
          <span style={{ color: C.inkMute }}><IconMic /></span>
        </div>
      </div>
    </div>
  );
}

// ── Bottom nav (dark) ──────────────────────────────────────────
const NAV_TABS = [
  { id: "home",       label: "Home",    Icon: IconHome  },
  { id: "module",     label: "Modules", Icon: IconBook  },
  { id: "rapid-fire", label: "Drills",  Icon: IconBolt  },
  { id: "cocktails",  label: "Library", Icon: IconFlask },
  { id: "progress",   label: "Me",      Icon: IconChart },
] as const;

function BottomNav({ onNavigate }: { onNavigate: (id: NavItem) => void }) {
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.1)",
      background: C.greenDeep,
      display: "flex", justifyContent: "space-around",
      padding: "8px 8px 0",
      paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
      flexShrink: 0,
    }}>
      {NAV_TABS.map(({ id, label, Icon }) => {
        const isHome = id === "home";
        return (
          <button
            key={id}
            onClick={() => onNavigate(id as NavItem)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "6px 4px 8px",
              color: isHome ? C.parchment : "rgba(255,255,255,0.45)",
              flex: 1, position: "relative",
            }}
          >
            {isHome && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 18, height: 2, background: C.amber,
              }} />
            )}
            <Icon />
            <div style={{
              fontFamily: MONO,
              fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>{label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function MobileDashboardV3({
  displayName,
  setActiveNav,
  plan,
}: {
  displayName: string;
  setActiveNav: (nav: NavItem) => void;
  plan: string;
}) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [streak, setStreak] = useState(0);
  const [coach, setCoach] = useState(false);

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
  const weakest = getWeakest(data);
  const weakestLabel = MODULE_LABELS[weakest];
  const weakestPct = Math.round(data.modules[weakest]);
  const weakestNext = getNextStage(data.levelProgress[weakest]);
  const isPremium = plan !== "free";

  function navigate(id: NavItem) {
    if (id === "home") return; // already here
    setActiveNav(id);
  }

  return (
    <div style={{
      width: "100%", height: "100%",
      background: C.green,
      color: C.parchment,
      display: "flex", flexDirection: "column",
      fontFamily: SANS,
      fontSize: 15,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* ── Top mini bar ── */}
      <div style={{
        padding: "14px 18px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
          <IconMenu />
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.16em" }}>
            SERVE BY EXAMPLE
          </span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", opacity: 0.7 }}>
          {displayName.toUpperCase()}
        </div>
        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.amber }}>
            <IconFlame />
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>{streak}D</span>
          </div>
        )}
      </div>

      {/* ── PRE-SHIFT BRIEF label ── */}
      <div style={{ padding: "20px 18px 12px", flexShrink: 0 }}>
        <div style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.5)", marginBottom: 0,
        }}>
          PRE-SHIFT BRIEF
        </div>
      </div>

      {/* ── Parchment card — scrollable V1 content ── */}
      <div style={{
        margin: "0 14px",
        flex: 1,
        background: C.parchment,
        color: C.ink,
        borderRadius: "6px 6px 0 0",
        overflowY: "auto",
        overflowX: "hidden",
        boxShadow: "0 -2px 0 rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.18)",
        WebkitOverflowScrolling: "touch",
      }}>

        {/* V1 Section 1: Welcome + Warm-Up CTA */}
        <div style={{ padding: "22px 18px 18px" }}>
          <div style={{
            display: "inline-block",
            fontFamily: MONO, fontSize: 9, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: C.inkMute,
            border: `1px solid ${C.cardEdge}`,
            padding: "2px 7px", borderRadius: 2,
            marginBottom: 12,
          }}>
            PRE-SHIFT BRIEF
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, lineHeight: 1.1,
            letterSpacing: "-0.02em", margin: "0 0 6px",
            color: C.ink,
          }}>
            Welcome back, {displayName}
          </h1>
          <p style={{ margin: "0 0 16px", color: C.inkMute, fontSize: 14, lineHeight: 1.45 }}>
            {totalSessions === 0
              ? "Start your first training session to build your service skills."
              : `${totalSessions} session${totalSessions !== 1 ? "s" : ""} completed.${data.reviewDue > 0 ? ` ${data.reviewDue} review${data.reviewDue !== 1 ? "s" : ""} due.` : " Keep pushing your weakest area."}`}
          </p>
          <button
            onClick={() => setActiveNav("rapid-fire")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", height: 44,
              background: C.green, color: C.parchment,
              border: "none", borderRadius: 3,
              fontFamily: SANS, fontSize: 14, fontWeight: 600,
              letterSpacing: "0.01em", cursor: "pointer",
            }}
          >
            <IconPlay />
            Start Pre-Shift Warm-Up
          </button>
        </div>

        {/* Hairline */}
        <div style={{ height: 1, background: C.cardEdge, margin: "0 18px" }} />

        {/* V1 Section 2: Strengthen Your Weakness */}
        <div style={{ padding: "16px 18px" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.inkMute, textTransform: "uppercase", marginBottom: 10 }}>
            STRENGTHEN YOUR WEAKNESS
          </div>
          <div style={{
            background: C.card,
            border: `1px solid ${C.cardEdge}`,
            borderRadius: 4,
            padding: "14px 16px",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3, color: C.ink }}>{weakestLabel}</div>
            <div style={{ fontSize: 11, color: C.inkMute, fontFamily: MONO, marginBottom: 10, letterSpacing: "0.06em" }}>
              {weakestPct}% COMPLETE · NEXT: {weakestNext.label.toUpperCase()}
            </div>
            <div style={{ height: 4, background: C.parchmentDeep, borderRadius: 1, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${Math.max(weakestPct, 2)}%`, background: C.green, borderRadius: 1 }} />
            </div>
            <button
              onClick={() => setActiveNav(weakestNext.stage <= 3 ? "module" : "stage4")}
              style={{
                background: "none", border: "none", padding: 0,
                color: C.green, fontFamily: SANS, fontSize: 13, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Start {weakestNext.label}
              <IconArrow />
            </button>
          </div>
        </div>

        {/* Hairline */}
        <div style={{ height: 1, background: C.cardEdge, margin: "0 18px" }} />

        {/* V1 Section 3: Quick Access 2×2 grid */}
        <div style={{ padding: "16px 18px" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.inkMute, textTransform: "uppercase", marginBottom: 12 }}>
            QUICK ACCESS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {([
              { label: "Modules",           sub: "Stage-based learning",         Icon: IconBook,   nav: "module"      as NavItem, locked: !isPremium },
              { label: "Quick Drills",      sub: "60-sec recall quizzes",         Icon: IconBolt,   nav: "rapid-fire"  as NavItem, locked: !isPremium },
              { label: "Scenario Training", sub: "AI-scored service situations",  Icon: IconTarget, nav: "stage4"      as NavItem, locked: !isPremium },
              { label: "AI Scenarios",      sub: "Adaptive simulations",          Icon: IconCpu,    nav: "scenarios"   as NavItem, locked: !isPremium },
            ] as { label: string; sub: string; Icon: React.FC; nav: NavItem; locked: boolean }[]).map(({ label, sub, Icon, nav, locked }) => (
              <button
                key={nav}
                onClick={() => setActiveNav(nav)}
                style={{
                  background: C.card,
                  border: `1px solid ${C.cardEdge}`,
                  borderRadius: 4,
                  padding: "14px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 6,
                  opacity: locked ? 0.55 : 1,
                }}
              >
                <span style={{ color: C.green }}><Icon /></span>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>
                  {label}
                  {locked && <span style={{ fontSize: 9, fontFamily: MONO, color: C.inkFaint, display: "block", marginTop: 1 }}>UPGRADE</span>}
                </div>
                <div style={{ fontSize: 11, color: C.inkMute, lineHeight: 1.35 }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hairline */}
        <div style={{ height: 1, background: C.cardEdge, margin: "0 18px" }} />

        {/* V1 Section 4: Training cards */}
        <div style={{ padding: "16px 18px 24px" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.inkMute, textTransform: "uppercase", marginBottom: 12 }}>
            TRAINING
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([
              { Icon: IconTarget, nav: "stage4"    as NavItem, title: "Scenario Training", body: "Practice real service situations with instant AI scoring and coaching." },
              { Icon: IconCpu,    nav: "scenarios"  as NavItem, title: "AI Scenarios",      body: "Advanced AI-driven simulations for high-pressure hospitality moments." },
            ] as { Icon: React.FC; nav: NavItem; title: string; body: string }[]).map(({ Icon, nav, title, body }) => (
              <button
                key={nav}
                onClick={() => setActiveNav(nav)}
                style={{
                  background: C.green,
                  border: "none",
                  borderRadius: 4,
                  padding: "18px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}><Icon /></span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.parchment }}>{title}</div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>{body}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <BottomNav onNavigate={navigate} />

      {/* ── AI Coach sheet overlay ── */}
      {coach && <AICoachSheet onClose={() => setCoach(false)} />}
    </div>
  );
}
