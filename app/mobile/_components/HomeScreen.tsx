"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Flame, Swords, BrainCircuit, Martini, Award } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { COCKTAILS } from "@/lib/cocktails";

// Phase B.5 — dumb UI plus real navigation. Matches the Figma "home" frame
// 1:1 visually. Pre-Shift Warmup stays inert (no detail screen exists yet).
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

const HOT_PICKS = [...COCKTAILS].filter((c) => c.featured).sort((a, b) => a.featuredOrder - b.featuredOrder).slice(0, 2);
// Same real-photo mapping as CocktailLibraryScreen.tsx — only 4 of 38
// cocktails have dedicated photography in /public/mobile.
const HOT_PICK_IMAGES: Record<string, string> = {
  "Espresso Martini": "/mobile/cocktail-espresso-martini.png",
  "Aperol Spritz": "/mobile/cocktail-aperol-spritz.png",
  Negroni: "/mobile/cocktail-negroni.png",
  Sazerac: "/mobile/cocktail-smoked-sazerac.png",
};

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
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile)" }}>
                Tonight&apos;s Specials: Bordeaux &amp; Ribeye Pairings quiz ready.
              </p>
            </div>
          </div>
        </div>

        {/* todays-picks-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Today&apos;s Hot Picks</p>
            {/* Real brand mark — same asset/pattern as components/Navbar.tsx's
                <Image src="/logo.webp" ... />, replacing the fake S/B/E wordmark. */}
            <Image
              src="/logo.webp"
              alt="Serve By Example"
              width={32}
              height={32}
              quality={50}
              style={{ flexShrink: 0, width: 32, height: 32, objectFit: "contain" }}
            />
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
            {HOT_PICKS.map((cocktail) => (
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
                    src={HOT_PICK_IMAGES[cocktail.name] ?? "/mobile/thumb-cocktail.png"}
                    alt=""
                    width={188}
                    height={100}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--gold-mobile)" }}>
                    Most Common
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
                    {continueModule.mod.category} &middot; {continueModule.progress?.scenariosAttempted ?? 0}/
                    {data.scenarioCounts[`module_${continueModule.mod.id}`] ?? 10} scenarios
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
          <div style={{ display: "flex", gap: 10 }}>
            {QUICK_ACCESS.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 12,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                  textDecoration: "none",
                }}
              >
                <Icon size={24} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mobile)", textAlign: "center" }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
