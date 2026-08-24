"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import BottomNav from "./BottomNav";
import { KB_CATEGORIES, KB_ENTRIES, type KBCategory, type KBEntry } from "@/lib/knowledge-base";

// Phase C file 06 — real data + search/filter, ported from the desktop
// KnowledgeBase.tsx `useMemo` pattern (app/dashboard/_components/
// knowledge-base/KnowledgeBase.tsx). The Phase B mock's hardcoded
// SPIRITS_101 sample cards are gone entirely — this now reads live from
// lib/knowledge-base.ts (31 real entries), same as desktop.
//
// Naming resolved 2026-08-18: the "101 Knowledge Base" title (31 real
// entries, not 101) flagged in v4-migration-plan/06 is renamed to plain
// "Knowledge Base" here and across every dashboard reference — user's call,
// not a mobile-only divergence.

const CATEGORY_KEYS = Object.keys(KB_CATEGORIES) as KBCategory[];

function DetailSheet({ entry, onClose }: { entry: KBEntry; onClose: () => void }) {
  const catMeta = KB_CATEGORIES[entry.category];
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
      <div
        style={{
          position: "relative",
          background: "var(--bg-mobile-dark)",
          borderRadius: "16px 16px 0 0",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border-mobile)",
          borderBottom: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 38, height: 4, background: "var(--border-mobile)", borderRadius: 2 }} />
        </div>

        <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--border-mobile)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: catMeta.color, textTransform: "uppercase" }}>
                {catMeta.label}
              </span>
              <p style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 700, color: "var(--text-mobile)" }}>{entry.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
                borderRadius: 20,
                width: 30,
                height: 30,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "var(--text-mobile-muted)",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" as const, flex: 1, padding: "16px 20px" }}>
          <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.55, color: "var(--text-mobile)" }}>{entry.content}</p>

          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>
              Key Facts
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {entry.keyFacts.map((fact, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.4, color: "var(--text-mobile)" }}>
                  <span style={{ color: "var(--green-mobile)", flexShrink: 0 }}>&#10003;</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            {entry.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "var(--surface-mobile-alt)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--gold-mobile)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBaseScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<KBCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<KBEntry | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return KB_ENTRIES.filter((entry) => {
      const matchesCat = activeCategory === "all" || entry.category === activeCategory;
      const matchesSearch =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.includes(q));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, search]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<KBCategory, KBEntry[]>> = {};
    for (const entry of filtered) {
      (groups[entry.category] ??= []).push(entry);
    }
    return groups;
  }, [filtered]);

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
        {/* header-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>
              Knowledge Base
            </span>
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Knowledge Base</p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: "var(--text-mobile-muted)" }}>
              {activeCategory === "all"
                ? `${KB_ENTRIES.length} quick-reference cards across ${CATEGORY_KEYS.length} categories.`
                : KB_CATEGORIES[activeCategory].description}
            </p>
          </div>
        </div>

        {/* search-section */}
        <div style={{ padding: "0 20px 16px" }}>
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
              placeholder="Search knowledge base..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-mobile)",
              }}
            />
          </div>
        </div>

        {/* category-scroller */}
        <div style={{ display: "flex", gap: 8, padding: "0 0 12px 20px", overflowX: "auto" }}>
          {(["all", ...CATEGORY_KEYS] as const).map((key) => {
            const isActive = key === activeCategory;
            const label = key === "all" ? "All" : KB_CATEGORIES[key].label;
            const count = key === "all" ? KB_ENTRIES.length : KB_ENTRIES.filter((e) => e.category === key).length;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(key)}
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
                {label} ({count})
              </button>
            );
          })}
        </div>

        {search && (
          <p style={{ margin: "0 20px 12px", fontSize: 13, color: "var(--text-mobile-muted)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </p>
        )}

        {/* cards-section, grouped by category */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 20px 24px" }}>
          {filtered.length > 0 ? (
            (Object.entries(grouped) as [KBCategory, KBEntry[]][]).map(([catKey, entries]) => {
              const catMeta = KB_CATEGORIES[catKey];
              return (
                <div key={catKey} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: catMeta.color, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {catMeta.label}
                    </p>
                    <div style={{ flex: 1, height: 1, background: "var(--border-mobile)" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                    {entries.map((entry) => (
                      <button
                        key={`${entry.category}-${entry.subCategory}-${entry.title}`}
                        type="button"
                        onClick={() => setSelected(entry)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          padding: 16,
                          borderRadius: "var(--radius-lg)",
                          background: "var(--surface-mobile)",
                          border: "1px solid var(--border-mobile)",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{entry.title}</p>
                          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: "var(--text-mobile-muted)" }}>
                            {entry.content.slice(0, 90)}
                            {entry.content.length > 90 ? "…" : ""}
                          </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: "var(--surface-mobile-alt)",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--gold-mobile)",
                              textTransform: "uppercase",
                            }}
                          >
                            {entry.subCategory}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--text-mobile-muted)" }}>
              No matching articles found.
            </div>
          )}
        </div>
      </div>

      <BottomNav active="learn" />

      {selected && <DetailSheet entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
