"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Wine, Users, LockKeyhole, ShieldAlert, type LucideIcon } from "lucide-react";
import type { TrainingProgress } from "../../_lib/use-training-progress";
import type { Module } from "@/app/dashboard/_components/trainer/trainer-data";

// Phase 2 (mobile bug-fix plan, 2026-08-24) — extracted out of
// PracticeScenariosSection.tsx, which used to bundle the Live Arena picker
// ("Practice & Scenarios") and this category-level simulation picker into
// one section. Splitting them into their own Learn Hub sections lets the
// page read as an easy -> medium -> hard progression: Modules (quiz gate) ->
// Practice & Scenarios (Live Arena, one scenario at a time) -> Category
// Simulations (a full run through a legacy 10/10/20-scenario category bank,
// the deepest/hardest practice mode) -> Interactive Mini-Games. Content and
// gating logic below is unchanged from the original — only its section
// boundary moved.
//
// Phase 3 (v4-migration-plan/00, item 9): these 3 cards route into
// /mobile/scenario-practice, one per legacy module (trainer-data.ts::
// SCENARIOS — bartending ×10, sales ×10, management ×20), gated the same
// way desktop gates them: a binary free/paid tier gate (lib/session.ts),
// plus — for Management only — the Manager/Supervisor role check the API
// already resolves server-side (`autoUnlockManagement`).

const CATEGORY_CARDS: { module: Module; label: string; count: number; icon: LucideIcon }[] = [
  { module: "bartending", label: "Bartending", count: 10, icon: Wine },
  { module: "sales", label: "Sales", count: 10, icon: TrendingUp },
  { module: "management", label: "Management", count: 20, icon: Users },
];

// Wrapped in React.memo — this section doesn't depend on Learn Hub's search
// state, so there's no reason for it to re-render on every keystroke.
function CategorySimulationsSection({ data }: { data: TrainingProgress }) {
  const router = useRouter();
  const isFreeTier = data.access.tier === "free";

  return (
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
  );
}

export default memo(CategorySimulationsSection);
