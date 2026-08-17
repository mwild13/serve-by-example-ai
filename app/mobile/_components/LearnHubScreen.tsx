"use client";

import { useState } from "react";
import {
  Search,
  BottleWine,
  BrainCircuit,
  ShieldCheck,
  ClipboardCheck,
  LockKeyhole,
  WineOff,
  TrendingUp,
  FileLock2,
} from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B.5 — category pills hold local selection state. Search stays
// read-only and module cards stay inert (no per-module detail screen exists
// yet, ditto for cards' onward routing) — data wiring is Phase C.

const CATEGORIES = ["All", "Modules", "Scenarios", "Live Scenarios"];

type ModuleCard = {
  title: string;
  lessons: string;
  pct: number;
  icon: typeof BottleWine;
  badge?: "mastered" | "locked";
};

const MODULES: ModuleCard[] = [
  { title: "Spirits Knowledge", lessons: "8/12 lessons", pct: 65, icon: BottleWine },
  { title: "Guest Psychology", lessons: "10/10 lessons", pct: 100, icon: BrainCircuit, badge: "mastered" },
  { title: "Inventory Master", lessons: "1/8 lessons", pct: 12, icon: ClipboardCheck, badge: "locked" },
  { title: "Cocktail Shaking", lessons: "0/5 lessons", pct: 0, icon: WineOff },
  { title: "Upselling Science", lessons: "4/8 lessons", pct: 50, icon: TrendingUp },
  { title: "Compliance & Safety", lessons: "2/10 lessons", pct: 20, icon: FileLock2, badge: "locked" },
];

export default function LearnHubScreen() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

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
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>All Modules</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
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
                      <ShieldCheck size={18} strokeWidth={2} color="var(--green-mobile)" aria-hidden="true" />
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
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>{mod.lessons}</p>
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
