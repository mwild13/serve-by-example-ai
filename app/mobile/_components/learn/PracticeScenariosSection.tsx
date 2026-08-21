"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Wine, Users, LockKeyhole, ShieldAlert, type LucideIcon } from "lucide-react";
import type { TrainingProgress } from "../../_lib/use-training-progress";
import type { Module } from "@/app/dashboard/_components/trainer/trainer-data";

// 3-tab consolidation (2026-08-21): ported from the deleted
// ScenarioTrainingScreen.tsx (formerly the whole /mobile/scenarios page) —
// this is now just the "Practice & Scenarios" section of /mobile/learn.
// Page-level chrome (shell div, "Scenario Training" header, own BottomNav)
// was stripped; LearnHubScreen.tsx owns all of that now and only renders
// this section once training progress is loaded (`data` is never null here).
//
// Phase C file 04 — "Start Simulation" carries the scenario payload
// (moduleId/moduleTitle/scenario) as query params into /mobile/arena, which
// reads them to build the real POST /api/arena/evaluate request. Module 11
// ("Handling Guest Complaints") is the closest real catalog match to the
// featured "Wine Cork Complaint" scenario copy below — see lib/module-navigator.ts.
//
// Phase 3 (v4-migration-plan/00, item 9): the 3 category cards route into
// /mobile/scenario-practice, one per legacy module (trainer-data.ts::SCENARIOS
// — bartending ×10, sales ×10, management ×20), gated the same way desktop
// gates them: a binary free/paid tier gate (lib/session.ts), plus — for
// Management only — the Manager/Supervisor role check the API already
// resolves server-side (`autoUnlockManagement`).

const arenaHref = (() => {
  const moduleId = 11;
  const moduleTitle = "Handling Guest Complaints";
  const scenario =
    "A guest sends back a bottle of wine, claiming it's corked, but you can tell from the cork and the smell that it is fine — it's just not to their taste. They are becoming insistent and slightly hostile about wanting a refund or a replacement bottle immediately.";
  return `/mobile/arena?moduleId=${moduleId}&moduleTitle=${encodeURIComponent(moduleTitle)}&scenario=${encodeURIComponent(scenario)}`;
})();

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
          <Image src="/mobile/scenario-banner.png" alt="" fill style={{ objectFit: "cover", zIndex: 0 }} />
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
            style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold-mobile)" }}>Start Simulation</span>
            <ArrowRight size={16} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
          </Link>
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
