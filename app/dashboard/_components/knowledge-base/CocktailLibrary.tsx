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
          background: "var(--bg-cream-warm)",
          borderRadius: "14px 14px 0 0",
          maxHeight: "82vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle */}
        <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 38, height: 4, background: "var(--border-cocktail)", borderRadius: 2 }} />
        </div>

        {/* header */}
        <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--border-warm-soft)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "var(--color-ink-warm)", letterSpacing: "-0.01em", marginBottom: 4 }}>
                {cocktail.name}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
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
                {cocktail.featured && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-amber-gold)", background: "var(--status-amber-bg)", border: "1px solid var(--gold-light)", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                    Most Common
                  </span>
                )}
                {cocktail.origin && (
                  <span style={{ fontSize: 10, color: "var(--color-warm-gray)" }}>{cocktail.origin}</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "var(--bg-cocktail-card)", border: "none", borderRadius: 20,
                width: 30, height: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "var(--color-warm-gray)", flexShrink: 0,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* scrollable body */}
        <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" as const, flex: 1, padding: "16px 20px" }}>

          {/* Ingredients + Method side by side on wider, stacked on narrow */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-warm-tan)", textTransform: "uppercase", marginBottom: 7 }}>
                Ingredients
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                {cocktail.ingredients.map((ing) => (
                  <li key={ing} style={{ fontSize: 13, color: "var(--color-warm-dark)", lineHeight: 1.35, display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ color: "var(--color-warm-tan)", flexShrink: 0, marginTop: 1 }}>·</span>
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
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-warm-mid)", textTransform: "uppercase", marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-warm-dark)", lineHeight: 1.4 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Training tip */}
          <div style={{
            background: "var(--bg-green-subtle)",
            border: "1px solid var(--border-green-light)",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green-gradient-mid)", textTransform: "uppercase", marginBottom: 5 }}>
              Training Tip
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--roi-forest)", lineHeight: 1.5 }}>{cocktail.tip}</p>
          </div>

          {/* CTA row */}
          <div style={{ display: "flex", gap: 10, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <button
              style={{
                flex: 1, padding: "12px 0",
                background: inPractice ? "var(--ip-green)" : "var(--ip-green)",
                color: "var(--surface-raised)", border: "none", borderRadius: 6,
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
                color: "var(--color-warm-dark)",
                border: "1.5px solid var(--border-cocktail)",
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
  const [purposeFilter] = useState<PurposeFilter>("all");
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

    results = [...results].sort((a, b) => {
      if (purposeFilter === "practice") {
        const aBook = practiceAdded.has(a.name) ? 0 : 1;
        const bBook = practiceAdded.has(b.name) ? 0 : 1;
        if (aBook !== bBook) return aBook - bBook;
      }
      if (a.featured && b.featured) return a.featuredOrder - b.featuredOrder;
      if (a.featured) return -1;
      if (b.featured) return 1;
      return a.name.localeCompare(b.name);
    });

    return results;
  }, [activeCategory, search, purposeFilter, practiceAdded]);

  function addToPractice(name: string) {
    setPracticeAdded((prev) => { const next = new Set(prev); next.add(name); return next; });
  }

  void PURPOSE_LABELS;

  return (
    <div>
      <div className="sbe-command-bar sbe-command-bar-active" style={{ color: "white", marginBottom: "1.75rem" }}>
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Beverage Guide</span>
          <strong>Cocktail Library</strong>
          <span className="sbe-command-meta">38 classic cocktails across 10 styles</span>
        </div>
      </div>

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
        {CATEGORY_KEYS.filter((key) => COCKTAILS.some((c) => c.category === key)).map((key) => {
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
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {cocktail.featured && (
                    <div style={{ fontSize: 10, color: "var(--color-amber-gold)", fontWeight: 700, background: "var(--status-amber-bg)", border: "1px solid var(--gold-light)", display: "inline-block", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>Most Common</div>
                  )}
                  {inPractice && (
                    <div style={{ fontSize: 10, color: "var(--ip-green)", fontWeight: 700, background: "var(--bg-green-subtle)", border: "1px solid var(--border-green-light)", display: "inline-block", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>Bookmarked</div>
                  )}
                </div>
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
