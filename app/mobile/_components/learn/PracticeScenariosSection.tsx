"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Wine,
  Users,
  LockKeyhole,
  ShieldAlert,
  BottleWine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { TrainingProgress } from "../../_lib/use-training-progress";
import type { Module } from "@/app/dashboard/_components/trainer/trainer-data";
import { ARENA_SEED_SCENARIOS, formatArenaScenario } from "@/lib/arena-scenarios";

// 3-tab consolidation (2026-08-21): ported from the deleted
// ScenarioTrainingScreen.tsx (formerly the whole /mobile/scenarios page) —
// this is now just the "Practice & Scenarios" section of /mobile/learn.
// Page-level chrome (shell div, "Scenario Training" header, own BottomNav)
// was stripped; LearnHubScreen.tsx owns all of that now and only renders
// this section once training progress is loaded (`data` is never null here).
//
// Priority-2 fix (2026-08-21): the single static "Wine Cork Complaint" /
// Module 11 banner is replaced with a real Live Arena picker across all 40
// modules. Checked GET /api/training/modules/[moduleId]/scenarios first
// (live DB query) — it only ever returns scenario_type='quiz' rows (8 per
// module, all 40 modules; zero descriptor_l2/descriptor_l3/roleplay rows
// exist), so it can't back a real Arena/Practice picker today. Built instead
// from lib/arena-scenarios.ts::ARENA_SEED_SCENARIOS, which already has one
// real roleplay scenario per module id (1-40) — same source QuizScreen's
// "Try it in Live Arena" CTA already uses, so this doesn't introduce a
// second content system. Module title/difficulty/mastery come from `data`
// (already prop-drilled from LearnHubScreen's single useTrainingProgress()
// call). Tapping a card routes into /mobile/arena?moduleId=...&moduleTitle=
// ...&scenario=..., the exact param shape ArenaScreen already reads — no
// ArenaScreen changes needed.
//
// Phase 3 (v4-migration-plan/00, item 9): the 3 category cards below route
// into /mobile/scenario-practice, one per legacy module (trainer-data.ts::
// SCENARIOS — bartending ×10, sales ×10, management ×20), gated the same
// way desktop gates them: a binary free/paid tier gate (lib/session.ts),
// plus — for Management only — the Manager/Supervisor role check the API
// already resolves server-side (`autoUnlockManagement`). This part already
// browses real content (index-based Next/Skip in ScenarioPracticeScreen),
// so it's untouched by the Live Arena picker change above.

function getDifficultyLabel(level: number): string {
  // Matches app/dashboard/_components/DynamicModuleNav.tsx's convention —
  // duplicated here (not exported/imported) since it's a 4-line pure
  // function and that file isn't otherwise a dependency of the mobile tree.
  if (level <= 2) return "Beginner";
  if (level === 3) return "Intermediate";
  return "Advanced";
}

const ARENA_CATEGORY_ICON: Record<"technical" | "service" | "compliance", LucideIcon> = {
  technical: BottleWine,
  service: Users,
  compliance: ShieldCheck,
};

const CATEGORY_CARDS: { module: Module; label: string; count: number; icon: LucideIcon }[] = [
  { module: "bartending", label: "Bartending", count: 10, icon: Wine },
  { module: "sales", label: "Sales", count: 10, icon: TrendingUp },
  { module: "management", label: "Management", count: 20, icon: Users },
];

export default function PracticeScenariosSection({ data }: { data: TrainingProgress }) {
  const router = useRouter();
  const isFreeTier = data.access.tier === "free";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)", padding: "0 20px 12px" }}>
        Practice &amp; Scenarios
      </p>

      {/* live-arena-picker — replaces the old single hardcoded scenario */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 0 20px" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-mobile-muted)", padding: "0 20px" }}>
          LIVE ARENA — PICK A MODULE
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "0 20px",
            overflowX: "auto",
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {data.allModules
            .filter((mod) => ARENA_SEED_SCENARIOS[mod.id] !== undefined)
            .map((mod) => {
              const seed = ARENA_SEED_SCENARIOS[mod.id];
              const Icon = ARENA_CATEGORY_ICON[mod.category];
              const mastery = data.moduleProgress[mod.id]?.mastery ?? 0;
              const locked = !data.access.allowedModules.includes(mod.id);
              const scenarioText = formatArenaScenario(seed);
              const arenaHref = `/mobile/arena?moduleId=${mod.id}&moduleTitle=${encodeURIComponent(mod.title)}&scenario=${encodeURIComponent(scenarioText)}`;

              const cardContent = (
                <>
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
                    {locked && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--gold-mobile-bg)",
                        }}
                      >
                        <LockKeyhole size={12} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold-mobile)" }}>PRO</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                      {getDifficultyLabel(mod.difficulty_level)}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
                      <div style={{ width: `${mastery}%`, height: "100%", background: "var(--gold-mobile)" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)" }}>{mastery}%</span>
                  </div>
                </>
              );

              const cardStyle: React.CSSProperties = {
                flexShrink: 0,
                scrollSnapAlign: "start",
                width: 180,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: 14,
                borderRadius: "var(--radius-lg)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
                textAlign: "left",
                textDecoration: "none",
                font: "inherit",
                cursor: "pointer",
              };

              if (locked) {
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => router.push("/pricing")}
                    style={cardStyle}
                  >
                    {cardContent}
                  </button>
                );
              }

              return (
                <Link key={mod.id} href={arenaHref} style={cardStyle}>
                  {cardContent}
                </Link>
              );
            })}
        </div>
      </div>

      {/* category-cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Category Simulations</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon;
            const mastery = data.mastery[card.module] ?? 0;
            // Management additionally requires the Manager/Supervisor role
            // auto-unlock — a paid user without that role sees a role
            // message, not a pricing redirect.
            const needsRole = card.module === "management" && !isFreeTier && !data.autoUnlockManagement;
            const locked = isFreeTier || needsRole;

            const cardContent = (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-mobile-alt)",
                    }}
                  >
                    <Icon size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                  </div>
                  {isFreeTier && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--gold-mobile-bg)",
                      }}
                    >
                      <LockKeyhole size={12} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold-mobile)" }}>PRO</span>
                    </div>
                  )}
                  {needsRole && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--surface-mobile-alt)",
                      }}
                    >
                      <ShieldAlert size={12} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-mobile-muted)" }}>ROLE</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{card.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                    {needsRole ? "Manager/Supervisor role required" : `${card.count} scenarios`}
                  </p>
                </div>

                {!needsRole && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
                      <div style={{ width: `${mastery}%`, height: "100%", background: "var(--gold-mobile)" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)" }}>{mastery}%</span>
                  </div>
                )}
              </>
            );

            const cardStyle: React.CSSProperties = {
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              textAlign: "left",
              textDecoration: "none",
              font: "inherit",
              cursor: "pointer",
              opacity: needsRole ? 0.7 : 1,
            };

            if (locked) {
              return (
                <button
                  key={card.module}
                  type="button"
                  disabled={needsRole}
                  onClick={() => {
                    if (isFreeTier) router.push("/pricing");
                  }}
                  style={{ ...cardStyle, cursor: needsRole ? "default" : "pointer" }}
                >
                  {cardContent}
                </button>
              );
            }

            return (
              <Link key={card.module} href={`/mobile/scenario-practice?module=${card.module}&index=0`} style={cardStyle}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
