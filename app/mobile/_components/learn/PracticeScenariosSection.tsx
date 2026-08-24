"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, LockKeyhole, BottleWine, ShieldCheck, type LucideIcon } from "lucide-react";
import type { TrainingProgress } from "../../_lib/use-training-progress";
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
// Phase 2 (mobile bug-fix plan, 2026-08-24): the "Category Simulations"
// block that used to live at the bottom of this section moved out into its
// own CategorySimulationsSection.tsx, now a separate Learn Hub section — see
// that file's header comment for why. This section is now the Live Arena
// picker only.

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

export default function PracticeScenariosSection({ data }: { data: TrainingProgress }) {
  const router = useRouter();

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
                // 169 = (390 frame - 40px side padding - 12px gap) / 2 — the
                // same math CoreKnowledgeSection.tsx's 2-col module grid uses.
                // At the old 180px, 2 cards + gap + padding summed to 392px,
                // 2px past the frame, so the 2nd card never sat flush and its
                // right edge didn't line up with the grid cards above/below —
                // this was the visible misalignment.
                width: 169,
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
    </div>
  );
}
