"use client";

import { useState, useMemo } from "react";
import { COCKTAILS, CATEGORIES, type Category } from "@/lib/cocktails";

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

type PurposeFilter = "all" | "practice";

const PURPOSE_LABELS: Record<PurposeFilter, string> = {
  all: "Browse all",
  practice: "Bookmarked",
};

type Cocktail = (typeof COCKTAILS)[number];

function DetailSheet({
  cocktail,
  inPractice,
  onClose,
  onBookmark,
}: {
  cocktail: Cocktail;
  inPractice: boolean;
  onClose: () => void;
  onBookmark: () => void;
}) {
  const catMeta = CATEGORIES[cocktail.category];
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      {/* backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />

      {/* sheet */}
      <div
        style={{
          position: "relative",
          background: "#faf9f6",
          borderRadius: "14px 14px 0 0",
          maxHeight: "82vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle */}
        <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 38, height: 4, background: "#ddd9d0", borderRadius: 2 }} />
        </div>

        {/* header */}
        <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #e8e4db" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#1a1714", letterSpacing: "-0.01em", marginBottom: 4 }}>
                {cocktail.name}
              </div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11, fontWeight: 600,
                  background: catMeta.color + "22",
                  color: catMeta.color,
                  border: `1px solid ${catMeta.color}44`,
                  padding: "2px 8px", borderRadius: 4,
                  letterSpacing: "0.03em",
                }}
              >
                {catMeta.label}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#ede9e1", border: "none", borderRadius: 20,
                width: 30, height: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#6b6460", flexShrink: 0,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* scrollable body */}
        <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" as "touch", flex: 1, padding: "16px 20px" }}>

          {/* Ingredients + Method side by side on wider, stacked on narrow */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#b5a97a", textTransform: "uppercase", marginBottom: 7 }}>
                Ingredients
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                {cocktail.ingredients.map((ing) => (
                  <li key={ing} style={{ fontSize: 13, color: "#3d3a36", lineHeight: 1.35, display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ color: "#b5a97a", flexShrink: 0, marginTop: 1 }}>·</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Method",  value: cocktail.method  },
                { label: "Glass",   value: cocktail.glass   },
                { label: "Garnish", value: cocktail.garnish },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#8a8480", textTransform: "uppercase", marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: "#3d3a36", lineHeight: 1.4 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Training tip */}
          <div style={{
            background: "#eef6ef",
            border: "1px solid #c8e6cb",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#2d6a35", textTransform: "uppercase", marginBottom: 5 }}>
              Training Tip
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#2d4a30", lineHeight: 1.5 }}>{cocktail.tip}</p>
          </div>

          {/* CTA row */}
          <div style={{ display: "flex", gap: 10, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <button
              style={{
                flex: 1, padding: "12px 0",
                background: inPractice ? "#0B2B1E" : "#0B2B1E",
                color: "#fff", border: "none", borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: inPractice ? "default" : "pointer",
                opacity: inPractice ? 0.7 : 1,
              }}
              onClick={onBookmark}
              disabled={inPractice}
            >
              {inPractice ? "Bookmarked" : "Bookmark"}
            </button>
            <button
              style={{
                flex: 1, padding: "12px 0",
                background: "transparent",
                color: "#3d3a36",
                border: "1.5px solid #d8d3c9",
                borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CocktailLibrary() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [purposeFilter, setPurposeFilter] = useState<PurposeFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Cocktail | null>(null);
  const [practiceAdded, setPracticeAdded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let results = COCKTAILS.filter((c) => {
      const matchesCat = activeCategory === "all" || c.category === activeCategory;
      const matchesSearch = c.name.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
    if (purposeFilter === "practice") {
      results = [...results].sort((a) => (practiceAdded.has(a.name) ? -1 : 1));
    }
    return results;
  }, [activeCategory, search, purposeFilter, practiceAdded]);

  function addToPractice(name: string) {
    setPracticeAdded((prev) => { const next = new Set(prev); next.add(name); return next; });
  }

  void PURPOSE_LABELS;

  return (
    <div>
      <h1 className="dash-welcome">Cocktail Library</h1>
      <p className="dash-copy">
        {activeCategory === "all"
          ? `${COCKTAILS.length} cocktails across 10 classic styles. Tap any card to view the full recipe.`
          : CATEGORIES[activeCategory].description}
      </p>

      <div className="cocktail-search-row">
        <input
          className="cocktail-search"
          type="text"
          placeholder="Search cocktails…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
        />
        {search && (
          <button
            className="btn btn-secondary"
            style={{ marginLeft: 8, padding: "8px 14px", fontSize: ".9rem" }}
            onClick={() => { setSearch(""); setSelected(null); }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="cocktail-filter-row">
        <div
          className={`chat-pill${activeCategory === "all" ? " chat-pill-active" : ""}`}
          onClick={() => { setActiveCategory("all"); setSelected(null); }}
        >
          All ({COCKTAILS.length})
        </div>
        {CATEGORY_KEYS.map((key) => {
          const count = COCKTAILS.filter((c) => c.category === key).length;
          return (
            <div
              key={key}
              className={`chat-pill${activeCategory === key ? " chat-pill-active" : ""}`}
              onClick={() => { setActiveCategory(key); setSelected(null); }}
            >
              {CATEGORIES[key].label} ({count})
            </div>
          );
        })}
      </div>

      {search && (
        <p style={{ color: "var(--text-soft)", fontSize: ".9rem", margin: "8px 0 16px" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {filtered.length > 0 ? (
        <div className="cocktail-grid">
          {filtered.map((cocktail) => {
            const catMeta = CATEGORIES[cocktail.category];
            const inPractice = practiceAdded.has(cocktail.name);
            return (
              <div
                key={cocktail.name}
                className="cocktail-card"
                onClick={() => setSelected(cocktail)}
                style={{ cursor: "pointer" }}
              >
                <div className="cocktail-card-header">
                  <strong className="cocktail-name">{cocktail.name}</strong>
                  <span
                    className="cocktail-badge"
                    style={{ background: catMeta.color + "22", color: catMeta.color, borderColor: catMeta.color + "44" }}
                  >
                    {catMeta.label}
                  </span>
                </div>
                <div className="cocktail-glass-hint">{cocktail.glass}</div>
                {inPractice && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#0B2B1E", fontWeight: 600 }}>Bookmarked</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-soft)" }}>
          No cocktails found for &ldquo;{search}&rdquo;.
        </div>
      )}

      {selected && (
        <DetailSheet
          cocktail={selected}
          inPractice={practiceAdded.has(selected.name)}
          onClose={() => setSelected(null)}
          onBookmark={() => addToPractice(selected.name)}
        />
      )}
    </div>
  );
}
