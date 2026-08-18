"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookmarkPlus,
  TrendingUp,
  Wine,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { ARENA_SEED_SCENARIOS, formatArenaScenario } from "@/lib/arena-scenarios";

// Phase B.5 — "Start Simulation" routes into the Arena.
//
// Phase C file 04 — "Start Simulation" now carries the scenario payload
// (moduleId/moduleTitle/scenario) as query params into /mobile/arena, which
// reads them to build the real POST /api/arena/evaluate request. Module 11
// ("Handling Guest Complaints") is the closest real catalog match to the
// featured "Wine Cork Complaint" scenario copy below — see lib/module-navigator.ts.
//
// Live-QA fix (2026-08-19): the "Category Simulations" grid below was still
// 6 fully fabricated cards (invented "N attempts" counts, invented
// difficulty ratings, zero navigation) — reported as "Scenarios isn't
// mapped to actual dashboard modules." Replaced with real modules from
// useTrainingProgress()'s allModules/moduleProgress (same hook every other
// mobile screen already reads through). Real attempts count, real
// difficulty_level (1-5, already on TrainingModule — no invented field).
//
// Real per-module Arena entry point (2026-08-19, later same day): each card
// now links straight into a real Arena run — `lib/arena-scenarios.ts`
// (extracted from desktop's ArenaPage.tsx, which previously kept this
// content as a private inline const) has situation/context/task content for
// modules 1-20. Cards for those modules build the same
// moduleId/moduleTitle/scenario query-param payload the featured banner
// above already uses. Modules 21-40 have no Arena roleplay content in V3
// either (desktop's own picker only ever offered 1-20) — those cards still
// link to /mobile/learn rather than a dead-end, since there's genuinely no
// scenario to run yet, not because of a mobile-side gap.

const FEATURED_SCENARIO = {
  moduleId: 11,
  moduleTitle: "Handling Guest Complaints",
  scenario:
    "A guest sends back a bottle of wine, claiming it's corked, but you can tell from the cork and the smell that it is fine — it's just not to their taste. They are becoming insistent and slightly hostile about wanting a refund or a replacement bottle immediately.",
};

const arenaHref = `/mobile/arena?moduleId=${FEATURED_SCENARIO.moduleId}&moduleTitle=${encodeURIComponent(
  FEATURED_SCENARIO.moduleTitle,
)}&scenario=${encodeURIComponent(FEATURED_SCENARIO.scenario)}`;

// Category icon keyed by real module category — decorative only, not a
// fabricated data field like the old per-title icon map was.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  technical: Wine,
  service: TrendingUp,
  compliance: AlertTriangle,
};

function DifficultyRating({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }} aria-label={`Difficulty ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <BookmarkPlus
          key={i}
          size={12}
          strokeWidth={2}
          color={i < level ? "var(--gold-mobile)" : "var(--text-mobile-muted)"}
          opacity={i < level ? 1 : 0.35}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ScenarioTrainingScreen() {
  const { status, data } = useTrainingProgress();

  const moduleCards = (() => {
    if (status !== "ready") return [];
    const allowed = data.allModules.filter((mod) => data.access.allowedModules.includes(mod.id));
    // Show modules with a real Arena scenario first (playable, not a
    // /mobile/learn dead-end) — otherwise the first 6 by catalog order could
    // easily be all modules 21-40, which have no Arena content in V3 yet.
    const withArena = allowed.filter((mod) => ARENA_SEED_SCENARIOS[mod.id]);
    const withoutArena = allowed.filter((mod) => !ARENA_SEED_SCENARIOS[mod.id]);
    return [...withArena, ...withoutArena].slice(0, 6);
  })();

  function moduleHref(moduleId: number, moduleTitle: string): string {
    const seed = ARENA_SEED_SCENARIOS[moduleId];
    if (!seed) return "/mobile/learn";
    const scenario = formatArenaScenario(seed);
    return `/mobile/arena?moduleId=${moduleId}&moduleTitle=${encodeURIComponent(moduleTitle)}&scenario=${encodeURIComponent(scenario)}`;
  }

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
        {/* page-header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>Scenario Training</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile-bg)",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold-mobile)" }}>PRO</span>
          </div>
        </div>

        {/* featured-scenario-section */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 18,
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              minHeight: 190,
              justifyContent: "flex-end",
            }}
          >
            <Image
              src="/mobile/scenario-banner.png"
              alt=""
              fill
              style={{ objectFit: "cover", zIndex: 0 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1 }} />

            <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gold-mobile)",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>NEW RELEASE</span>
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-light-on-dark)",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-mobile)" }}>Advanced</span>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Wine Cork Complaint</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
                Learn the exact words to say to save a table and upsell a higher premium bottle.
              </p>
            </div>

            <Link
              href={arenaHref}
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold-mobile)" }}>Start Simulation</span>
              <ArrowRight size={16} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* grid-scenarios */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Your Modules</p>
          {status === "ready" && moduleCards.length === 0 ? (
            <div
              style={{
                padding: 16,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
                color: "var(--text-mobile-muted)",
                fontSize: 13,
              }}
            >
              No modules unlocked yet.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {moduleCards.map((mod) => {
                const Icon = CATEGORY_ICONS[mod.category] ?? Wine;
                const progress = data?.moduleProgress[mod.id];
                const attempts = progress?.scenariosAttempted ?? 0;
                return (
                  <Link
                    key={mod.id}
                    href={moduleHref(mod.id, mod.title)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      padding: 14,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--surface-mobile)",
                      border: "1px solid var(--border-mobile)",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius-sm)",
                          background: "var(--surface-mobile-alt)",
                        }}
                      >
                        <Icon size={18} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-mobile-muted)" }}>
                        {attempts} attempt{attempts === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text-mobile)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {mod.title}
                    </p>
                    <DifficultyRating level={mod.difficulty_level} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="scenarios" />
    </div>
  );
}
