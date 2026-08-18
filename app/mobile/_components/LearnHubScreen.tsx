"use client";

import { useMemo, useState } from "react";
import {
  Search,
  BottleWine,
  Users,
  ShieldCheck,
  BadgeCheck,
  LockKeyhole,
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useTrainingProgress } from "../_lib/use-training-progress";

// Phase C file 02 — Mastery Engine Harvest. Module cards now read from the
// real 40-module catalog + moduleProgress map returned by
// GET /api/training/progress, via useTrainingProgress(). Category pills map
// to the real `modules.category` values (technical/service/compliance) —
// not the arbitrary Phase B placeholder categories. Module locking stays
// cosmetic-only per v4-migration-plan/00 Locked Decision #3: V3 has a single
// global free/paid gate, no per-module rules.

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

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60dvh",
        padding: 20,
        color: "var(--text-mobile-muted)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

export default function LearnHubScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const { status, data, error, refetch } = useTrainingProgress();

  const shellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 390,
    margin: "0 auto",
    minHeight: "100dvh",
    background: "var(--bg-mobile-dark)",
    fontFamily: "var(--font-body)",
  };

  const modules = useMemo(() => {
    if (!data) return [];
    const filtered =
      activeCategory === "All"
        ? data.allModules
        : data.allModules.filter((mod) => mod.category === CATEGORY_KEY[activeCategory]);

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
      };
    });
  }, [data, activeCategory]);

  if (status === "loading") {
    return (
      <div style={shellStyle}>
        <StatusMessage>Loading modules…</StatusMessage>
        <BottomNav active="learn" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={shellStyle}>
        <StatusMessage>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <span>{error}</span>
            <button
              type="button"
              onClick={refetch}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-mobile)",
                background: "var(--surface-mobile)",
                color: "var(--text-mobile)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </StatusMessage>
        <BottomNav active="learn" />
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* header-search-group */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>Learn Hub</p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: "var(--radius-pill)",
                background: "var(--surface-mobile-inverse)",
                fontSize: 12,
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              <span style={{ color: "var(--green-mobile)" }}>S</span>
              <span style={{ color: "var(--gold-mobile)" }}>B</span>
              <span style={{ color: "var(--green-mobile)" }}>E</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <Search size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search training modules..."
              readOnly
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-mobile-muted)",
              }}
            />
          </div>
        </div>

        {/* category-scroller */}
        <div style={{ display: "flex", gap: 8, padding: "0 20px 20px", overflowX: "auto" }}>
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

        {/* modules-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>
            {activeCategory === "All" ? "All Modules" : `${activeCategory} Modules`}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: 14,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--surface-mobile)",
                    border: "1px solid var(--border-mobile)",
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
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav active="learn" />
    </div>
  );
}
