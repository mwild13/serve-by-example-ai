"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Flame, Swords, BrainCircuit, Martini, Award } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { COCKTAILS, COCKTAIL_IMAGES } from "@/lib/cocktails";

// Phase B.5 — dumb UI plus real navigation. Matches the Figma "home" frame
// 1:1 visually.
//
// Phase C file 02 — the streak badge and Continue Learning card are now
// sourced from useTrainingProgress() (GET /api/training/progress) instead of
// hardcoded mock values. Recommendation = the accessible module with the
// lowest avg Elo among in-progress modules, falling back to the lowest-Elo
// untouched module — "light composition" over getAvailableModules'
// lowest-Elo logic per v4-migration-plan/02, not new domain logic.
//
// Live-QA fix (2026-08-19): "Today's Hot Picks" was still the Phase B mock
// ("Upselling Bordeaux"/"Classic Refresher" — no such modules or cocktails
// exist). Replaced with the two real featured cocktails from lib/cocktails.ts
// (COCKTAILS.featured, sorted by featuredOrder), linking to /mobile/cocktails
// — same "don't fabricate a data source" call as every other file in this
// migration. Also split Continue Learning's "no module to show" case into
// its real two possibilities — "you have zero accessible modules" (free
// tier/no venue) vs. "you've mastered everything accessible" — the old
// two-branch ternary collapsed both into the same "mastered" message, which
// is actively misleading for a free/unlicensed account.
//
// Mobile cleanup pass (2026-08-25): Pre-Shift Warmup was still inert (no
// link, no detail screen) and Today's Hot Picks was frozen on the same two
// featured cocktails every day regardless of date. Both now rotate off the
// same day-index formula the desktop dashboard uses for "Today's Cocktail"
// (app/dashboard/_components/PreShiftHome.tsx) — Hot Picks always matches
// the dashboard, and Warmup always opens that day's module's quiz directly
// (mobile has no separate "study" step before the quiz, same route
// CoreKnowledgeSection.tsx uses to launch a module).

const QUICK_ACCESS = [
  { label: "Challenges", icon: Swords, href: "/mobile/challenges" },
  { label: "Knowledge Base", icon: BrainCircuit, href: "/mobile/knowledge" },
  { label: "Cocktail Library", icon: Martini, href: "/mobile/cocktails" },
  { label: "Achievements", icon: Award, href: "/mobile/badges" },
];

export default function HomeScreen() {
  const session = useMobileSession();
  const { status, data } = useTrainingProgress();

  const continueModule = useMemo(() => {
    if (!data) return null;
    const accessible = data.allModules.filter((mod) => data.access.allowedModules.includes(mod.id));

    const inProgress = accessible
      .map((mod) => ({ mod, progress: data.moduleProgress[mod.id] }))
      .filter(({ progress }) => progress && progress.scenariosAttempted > 0 && progress.mastery < 100)
      .sort((a, b) => a.progress!.avgElo - b.progress!.avgElo);
    if (inProgress.length > 0) return inProgress[0];

    const untouched = accessible
      .map((mod) => ({ mod, progress: data.moduleProgress[mod.id] }))
      .filter(({ progress }) => !progress || progress.scenariosAttempted === 0)
      .sort((a, b) => (a.progress?.avgElo ?? 1200) - (b.progress?.avgElo ?? 1200));
    return untouched[0] ?? null;
  }, [data]);

  // Same day-of-epoch index the desktop dashboard uses for "Today's
  // Cocktail" (PreShiftHome.tsx) — day-level precision only, so this is an
  // intentional, scoped exception to react-hooks/purity (no render-pure way
  // to seed a "current time" value).
  // eslint-disable-next-line react-hooks/purity
  const dayIdx = useMemo(() => Math.floor(Date.now() / 86400000), []);

  const hotPicks = useMemo(
    () => [COCKTAILS[(dayIdx * 2) % COCKTAILS.length], COCKTAILS[(dayIdx * 2 + 1) % COCKTAILS.length]],
    [dayIdx],
  );

  const warmupModule = useMemo(() => {
    if (!data) return null;
    const accessible = data.allModules.filter((mod) => data.access.allowedModules.includes(mod.id));
    if (accessible.length === 0) return null;
    return accessible[dayIdx % accessible.length];
  }, [data, dayIdx]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* hero-header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 20,
          }}
        >
          <Link href="/mobile/progress" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, overflow: "hidden", flexShrink: 0 }}>
              <Image
                src={session.profilePhotoUrl ?? "/mobile/avatar.png"}
                alt=""
                width={48}
                height={48}
                unoptimized={!!session.profilePhotoUrl}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Welcome back,</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>{session.displayName}</p>
            </div>
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--green-mobile-bg)",
            }}
          >
            <Flame size={16} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-mobile)" }}>
              {/* Phase 6 fix (v4-migration-plan/00-bug-batch-plan.md item 12):
                  this was reading TrainingProgress.bestCorrectStreak — the
                  server-tracked *quiz-answer-accuracy* streak, not a daily
                  login streak, and mislabeled "Streak" next to a flame icon.
                  session.streakCount is the real client-side daily-login
                  streak (lib/streak.ts), incremented once per mobile session
                  by MobileSessionProvider — same value BadgesGalleryScreen
                  shows as "Active Streak: N Days". */}
              {session.streakCount !== null ? `${session.streakCount} Streak` : "—"}
            </span>
          </div>
        </div>

        {/* pre-shift-brief */}
        <div style={{ padding: "0 20px 20px" }}>
          {warmupModule ? (
            <Link
              href={`/mobile/quiz?moduleId=${warmupModule.id}&moduleTitle=${encodeURIComponent(warmupModule.title)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderRadius: "var(--radius-lg)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gold-mobile-bg)",
                  flexShrink: 0,
                }}
              >
                <Bell size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--gold-mobile)" }}>
                  Pre-Shift Warmup
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile)" }}>{warmupModule.title}: Warm-up quiz ready.</p>
              </div>
            </Link>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderRadius: "var(--radius-lg)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gold-mobile-bg)",
                  flexShrink: 0,
                }}
              >
                <Bell size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--gold-mobile)" }}>
                  Pre-Shift Warmup
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Training modules will appear here soon.</p>
              </div>
            </div>
          )}
        </div>

        {/* todays-picks-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Today&apos;s Hot Picks</p>
            {/* Real brand mark — same asset/pattern as components/Navbar.tsx's
                <Image src="/logo.webp" ... />, replacing the fake S/B/E wordmark.
                Phase 1c fix: wrapped in a Link so the logo doubles as a home
                button everywhere it's shown (already on /mobile/home here,
                but the same tap target stays consistent app-wide). */}
            <Link href="/mobile/home" style={{ flexShrink: 0, display: "flex" }} aria-label="Go to Home">
              <Image
                src="/logo.webp"
                alt="Serve By Example"
                width={32}
                height={32}
                quality={50}
                style={{ flexShrink: 0, width: 32, height: 32, objectFit: "contain" }}
              />
            </Link>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
            {hotPicks.map((cocktail) => (
              <Link
                key={cocktail.name}
                href="/mobile/cocktails"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  width: 220,
                  flexShrink: 0,
                  padding: 16,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                  textDecoration: "none",
                }}
              >
                <div style={{ width: "100%", height: 100, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  <Image
                    src={COCKTAIL_IMAGES[cocktail.name] ?? "/mobile/thumb-cocktail.png"}
                    alt=""
                    width={188}
                    height={100}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--gold-mobile)" }}>
                    Today&apos;s Pick
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-mobile)" }}>{cocktail.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* continue-learning-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Continue Learning</p>
          <Link
            href="/mobile/learn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              textDecoration: "none",
            }}
          >
            <div style={{ width: 54, height: 54, borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
              <Image src="/mobile/module-cover.png" alt="" width={54} height={54} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
              {status === "ready" && continueModule ? (
                <>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-mobile)" }}>{continueModule.mod.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)", textTransform: "capitalize" }}>
                    {continueModule.mod.category} &middot;{" "}
                    {(continueModule.progress?.scenariosAttempted ?? 0) === 0
                      ? "No attempts yet"
                      : `${continueModule.progress?.scenariosAttempted} attempt${continueModule.progress?.scenariosAttempted === 1 ? "" : "s"}`}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 100, height: 6, borderRadius: 3, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
                      <div style={{ width: `${continueModule.progress?.mastery ?? 0}%`, height: "100%", background: "var(--gold-mobile)" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)" }}>{continueModule.progress?.mastery ?? 0}%</span>
                  </div>
                </>
              ) : status === "ready" && data.access.allowedModules.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
                  No modules unlocked yet — join a venue or upgrade to start training.
                </p>
              ) : status === "ready" ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>All accessible modules mastered — nice work.</p>
              ) : status === "error" ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Couldn&apos;t load your progress.</p>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Loading your next module…</p>
              )}
            </div>
          </Link>
        </div>

        {/* quick-access-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Quick Access Training</p>
          <div style={{ display: "flex", gap: 6 }}>
            {QUICK_ACCESS.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: "flex",
                  flex: 1,
                  minWidth: 0, // flex items default to min-width:auto — without
                  // this, "Achievements" (the longest unbreakable label) forces
                  // this tile wider than its equal 1/4 share, pushing the row
                  // past the 390px frame instead of all 4 shrinking to fit.
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 6px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                  textDecoration: "none",
                }}
              >
                <Icon size={24} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                <span
                  lang="en"
                  style={
                    {
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-mobile)",
                      textAlign: "center",
                      overflowWrap: "break-word",
                      // "Achievements" is the only single unbreakable word among
                      // these four labels — without hyphenation it force-breaks
                      // mid-letter in this narrow column. hyphens:auto breaks it
                      // at a real syllable boundary ("Achieve-ments") instead.
                      hyphens: "auto",
                      WebkitHyphens: "auto",
                      msHyphens: "auto",
                    } as React.CSSProperties
                  }
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
