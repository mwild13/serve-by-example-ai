"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  Flame, Play, ArrowRight, Sparkles, X, Home,
  BookOpen, Zap, GlassWater, BarChart2, Target, Cpu, Mic,
} from "lucide-react";

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

// ── Design tokens — reference CSS vars from globals.css :root ──
const C = {
  green:        "var(--ip-green)",
  greenDeep:    "var(--ip-green-deep)",
  greenMute:    "var(--ip-green-soft)",
  greenTint:    "var(--ip-green-tint)",
  parchment:    "var(--ip-parchment)",
  parchmentDeep:"var(--ip-parchment-deep)",
  card:         "var(--ip-card)",
  cardEdge:     "var(--ip-card-edge)",
  ink:          "var(--ip-ink)",
  inkSoft:      "var(--ip-ink-soft)",
  inkMute:      "var(--ip-ink-mute)",
  inkFaint:     "var(--ip-ink-faint)",
  amber:        "var(--ip-amber)",
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

// ── AI Coach bottom sheet ──────────────────────────────────────
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
          padding: "14px 18px 0",
          borderRadius: "12px 12px 0 0",
          maxHeight: "78%",
          display: "flex", flexDirection: "column",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        }}
      >
        {/* drag handle */}
        <div style={{ width: 36, height: 4, background: C.cardEdge, borderRadius: 2, margin: "0 auto 14px" }} />

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: C.green, color: C.parchment, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14 }}>
              <Sparkles size={14} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>AI Coach</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMute, padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* conversation or preset prompts */}
        {hasConversation ? (
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: msg.role === "user" ? C.green : C.card,
                  color: msg.role === "user" ? C.parchment : C.ink,
                  border: msg.role === "assistant" ? `1px solid ${C.cardEdge}` : "none",
                  borderRadius: 8,
                  padding: "10px 13px",
                  fontSize: 13,
                  lineHeight: 1.5,
                  fontFamily: SANS,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div style={{
                alignSelf: "flex-start", background: C.card, border: `1px solid ${C.cardEdge}`,
                borderRadius: 8, padding: "10px 13px", fontSize: 13, color: C.inkMute, fontFamily: SANS,
              }}>
                Thinking…
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {PRESET_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => askCoach(q)}
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
                <span style={{ color: C.green }}><Sparkles size={13} /></span>
                <span>{q}</span>
              </button>
            ))}
          </div>
        )}

        {/* error */}
        {error && (
          <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 10, fontFamily: SANS }}>{error}</div>
        )}

        {/* input */}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center", background: C.card, border: `1px solid ${C.cardEdge}`, padding: "10px 14px", borderRadius: 4 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: SANS, fontSize: 14, color: C.ink }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{ background: "none", border: "none", cursor: input.trim() ? "pointer" : "default", padding: 0, color: input.trim() ? C.green : C.inkMute, display: "flex" }}
            aria-label="Send"
          >
            <Mic size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Bottom nav (dark) ──────────────────────────────────────────
const NAV_TABS = [
  { id: "home",       label: "Home",    Icon: Home       },
  { id: "module",     label: "Modules", Icon: BookOpen   },
  { id: "rapid-fire", label: "Drills",  Icon: Zap        },
  { id: "cocktails",  label: "Library", Icon: GlassWater },
  { id: "progress",   label: "Me",      Icon: BarChart2  },
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
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setStreak(computeStreak(session.user.id));
        }
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
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Image src="/logo.png" alt="SBE" width={20} height={20} style={{ borderRadius: 4, display: "block" }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.16em" }}>
            SERVE BY EXAMPLE
          </span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", opacity: 0.7 }}>
          {displayName.toUpperCase()}
        </div>
        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.amber }}>
            <Flame size={13} />
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
            <Play size={13} />
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
              <ArrowRight size={13} />
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
              { label: "Modules",           sub: "Stage-based learning",         Icon: BookOpen, nav: "module"      as NavItem, locked: !isPremium },
              { label: "Quick Drills",      sub: "60-sec recall quizzes",         Icon: Zap,      nav: "rapid-fire"  as NavItem, locked: !isPremium },
              { label: "Scenario Training", sub: "AI-scored service situations",  Icon: Target,   nav: "stage4"      as NavItem, locked: !isPremium },
              { label: "AI Scenarios",      sub: "Adaptive simulations",          Icon: Cpu,      nav: "scenarios"   as NavItem, locked: !isPremium },
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
        <div style={{ padding: "16px 18px 0" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.inkMute, textTransform: "uppercase", marginBottom: 12 }}>
            TRAINING
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([
              { Icon: Target, nav: "stage4"    as NavItem, title: "Scenario Training", body: "Practice real service situations with instant AI scoring and coaching." },
              { Icon: Cpu,    nav: "scenarios"  as NavItem, title: "AI Scenarios",      body: "Advanced AI-driven simulations for high-pressure hospitality moments." },
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

        {/* AI Coach hero tile */}
        <div style={{ padding: "12px 18px 28px" }}>
          <button
            onClick={() => setCoach(true)}
            style={{
              width: "100%",
              background: "radial-gradient(ellipse at 30% 40%, #4a86ff 0%, #1f64ff 65%)",
              boxShadow: "0 0 28px rgba(31, 100, 255, 0.38), 0 4px 16px rgba(31, 100, 255, 0.22)",
              border: "none",
              borderRadius: 6,
              padding: "22px 20px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <div style={{
                width: 32, height: 32,
                background: "rgba(255,255,255,0.18)",
                borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                AI Coach
              </div>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.45, fontWeight: 400 }}>
              Get instant tactical support for your shift
            </div>
          </button>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <BottomNav onNavigate={navigate} />

      {/* ── AI Coach sheet overlay ── */}
      {coach && <AICoachSheet onClose={() => setCoach(false)} />}
    </div>
  );
}
