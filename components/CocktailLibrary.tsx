"use client";

import { useState, useMemo } from "react";
import { COCKTAILS, CATEGORIES, type Category } from "@/lib/cocktails";

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export default function CocktailLibrary() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COCKTAILS.filter((c) => {
      const matchesCat = activeCategory === "all" || c.category === activeCategory;
      const matchesSearch = c.name.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, search]);

  const selectedCocktail = selected ? COCKTAILS.find((c) => c.name === selected) : null;

  function toggleCard(name: string) {
    setSelected((prev) => (prev === name ? null : name));
  }

  return (
    <div>
      <h1 className="dash-welcome">Cocktail Library</h1>
      <p className="dash-copy">
        {activeCategory === "all"
          ? `${COCKTAILS.length} cocktails across 10 classic styles. Click any card to see the full recipe and training notes.`
          : CATEGORIES[activeCategory].description}
      </p>

      {/* Search */}
      <div className="cocktail-search-row">
        <input
          className="cocktail-search"
          type="text"
          placeholder="Search cocktails…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelected(null);
          }}
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

      {/* Category filter pills */}
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

      {/* Results count */}
      {search && (
        <p style={{ color: "var(--text-soft)", fontSize: ".9rem", margin: "8px 0 16px" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Cocktail grid */}
      {filtered.length > 0 ? (
        <div className="cocktail-grid">
          {filtered.map((cocktail) => {
            const isOpen = selected === cocktail.name;
            const catMeta = CATEGORIES[cocktail.category];
            return (
              <div
                key={cocktail.name}
                className={`cocktail-card${isOpen ? " cocktail-card-open" : ""}`}
                onClick={() => toggleCard(cocktail.name)}
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

                {isOpen && (
                  <div className="cocktail-detail" onClick={(e) => e.stopPropagation()}>
                    <div className="cocktail-section">
                      <div className="trainer-label" style={{ marginBottom: 8 }}>Ingredients</div>
                      <ul className="cocktail-ingredients">
                        {cocktail.ingredients.map((ingredient) => (
                          <li key={ingredient}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="cocktail-meta">
                      <div className="cocktail-meta-item">
                        <strong>Method</strong>
                        <span>{cocktail.method}</span>
                      </div>
                      <div className="cocktail-meta-item">
                        <strong>Glass</strong>
                        <span>{cocktail.glass}</span>
                      </div>
                      <div className="cocktail-meta-item">
                        <strong>Garnish</strong>
                        <span>{cocktail.garnish}</span>
                      </div>
                    </div>

                    <div className="cocktail-tip">
                      <strong>Training Tip</strong>
                      <p>{cocktail.tip}</p>
                    </div>

                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: 16, fontSize: ".9rem", padding: "8px 16px" }}
                      onClick={() => setSelected(null)}
                    >
                      Close
                    </button>
                  </div>
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
    </div>
  );
}
