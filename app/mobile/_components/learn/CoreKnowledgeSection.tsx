"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottleWine, Users, ShieldCheck, BadgeCheck, LockKeyhole } from "lucide-react";
import type { TrainingProgress } from "../../_lib/use-training-progress";

// 3-tab consolidation (2026-08-21) — this is LearnHubScreen's original,
// unmodified module-grid content (Phase C file 02, Mastery Engine Harvest),
// now relabeled as the "Core Knowledge" section rather than the whole page.
// Category pills map to the real `modules.category` values
// (technical/service/compliance) — a completely separate taxonomy from
// PracticeScenariosSection's legacy bartending/sales/management split, not
// interchangeable with it. Module locking stays cosmetic-only per
// v4-migration-plan/00 Locked Decision #3: V3 has a single global free/paid
// gate, no per-module rules.
//
// A module card is a Quiz gate (→ /mobile/quiz), not an Arena entry point —
// /mobile/quiz offers its own "Try it in Live Arena" CTA once mastered.
//
// Phase 2 (mobile bug-fix plan, 2026-08-24): the Knowledge Base link tile
// that used to live at the bottom of this section moved into
// ReferenceLibrarySection.tsx (above Cocktail Library) — see that file's
// header comment.

const CATEGORIES = ["All", "Technical", "Service", "Compliance"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_KEY: Record<Exclude<Category, "All">, "technical" | "service" | "compliance"> = {
  Technical: "technical",
  Service: "service",
  Compliance: "compliance",
};

const CATEGORY_ICON: Record<"technical" | "service" | "compliance", typeof BottleWine> = {
  technical: BottleWine,
  service: Users,
  compliance: ShieldCheck,
};

export default function CoreKnowledgeSection({ data, search = "" }: { data: TrainingProgress; search?: string }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const modules = useMemo(() => {
    const byCategory =
      activeCategory === "All"
        ? data.allModules
        : data.allModules.filter((mod) => mod.category === CATEGORY_KEY[activeCategory]);

    // Phase 1d fix: LearnHubScreen's top search bar filters this grid — the
    // input is literally labeled "Search training modules...".
    const q = search.trim().toLowerCase();
    const filtered = q ? byCategory.filter((mod) => mod.title.toLowerCase().includes(q)) : byCategory;

    return filtered.map((mod) => {
      const progress = data.moduleProgress[mod.id];
      const scenarioTotal = data.scenarioCounts[`module_${mod.id}`] ?? 10;
      const pct = progress?.mastery ?? 0;
      const attempted = progress?.scenariosAttempted ?? 0;
      const locked = !data.access.allowedModules.includes(mod.id);

      return {
        id: mod.id,
        title: mod.title,
        subtitle: `${attempted}/${scenarioTotal} scenarios`,
        pct,
        icon: CATEGORY_ICON[mod.category],
        badge: pct >= 80 ? ("mastered" as const) : locked ? ("locked" as const) : undefined,
        locked,
      };
    });
  }, [data, activeCategory, search]);

  function handleModuleClick(mod: { id: number; title: string; locked: boolean }) {
    if (mod.locked) {
      router.push("/pricing");
      return;
    }
    router.push(`/mobile/quiz?moduleId=${mod.id}&moduleTitle=${encodeURIComponent(mod.title)}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)", padding: "0 20px 12px" }}>
        Core Knowledge
      </p>

      {/* category-scroller */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "0 20px 20px",
          overflowX: "auto",
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: isActive ? "1px solid var(--gold-mobile)" : "1px solid var(--border-mobile)",
                background: isActive ? "var(--gold-mobile)" : "var(--surface-mobile)",
                color: isActive ? "var(--bg-mobile-dark)" : "var(--text-mobile)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* modules-grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 20px 20px" }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>
          {search.trim()
            ? `${modules.length} result${modules.length !== 1 ? "s" : ""} for “${search.trim()}”`
            : activeCategory === "All"
              ? "All Modules"
              : `${activeCategory} Modules`}
        </p>
        {modules.length === 0 && (
          <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--text-mobile-muted)" }}>
            No modules found for &ldquo;{search.trim()}&rdquo;.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleModuleClick(mod)}
                aria-label={mod.locked ? `${mod.title} (locked — upgrade to unlock)` : `Start ${mod.title} scenario`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 14,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                  textAlign: "left",
                  cursor: "pointer",
                  font: "inherit",
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
                  {mod.badge === "mastered" && (
                    <BadgeCheck size={18} strokeWidth={2} color="var(--green-mobile)" aria-hidden="true" />
                  )}
                  {mod.badge === "locked" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 8px",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--gold-mobile-bg)",
                      }}
                    >
                      <LockKeyhole size={12} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>{mod.subtitle}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 100, height: 6, borderRadius: 3, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
                    <div style={{ width: `${mod.pct}%`, height: "100%", background: "var(--gold-mobile)" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)" }}>{mod.pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
