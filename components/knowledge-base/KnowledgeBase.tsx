"use client";

import { useState, useMemo, useEffect } from "react";
import { KB_CATEGORIES, KB_ENTRIES, type KBCategory } from "@/lib/knowledge-base";

const CATEGORY_KEYS = Object.keys(KB_CATEGORIES) as KBCategory[];

export default function KnowledgeBase() {
  const [activeCategory, setActiveCategory] = useState<KBCategory | "all">("all");
  const [activeSubCategory, setActiveSubCategory] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [slideEntry, setSlideEntry] = useState<(typeof KB_ENTRIES)[number] | null>(null);

  // Close slide-over on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSlideEntry(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const subCategories = useMemo(() => {
    if (activeCategory === "all") return [];
    return KB_CATEGORIES[activeCategory].subCategories;
  }, [activeCategory]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return KB_ENTRIES.filter((entry) => {
      const matchesCat = activeCategory === "all" || entry.category === activeCategory;
      const matchesSub = activeSubCategory === "all" || entry.subCategory === activeSubCategory;
      const matchesSearch = !q || entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.includes(q));
      return matchesCat && matchesSub && matchesSearch;
    });
  }, [activeCategory, activeSubCategory, search]);

  // Group by category for sectioned list display
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const entry of filtered) {
      const cat = KB_CATEGORIES[entry.category].label;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(entry);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="kb-container">
      <h1 className="kb-title">101 Knowledge Base</h1>
      <p className="kb-subtitle">
        {activeCategory === "all"
          ? `${KB_ENTRIES.length} reference articles across ${CATEGORY_KEYS.length} categories.`
          : KB_CATEGORIES[activeCategory].description}
      </p>

      {/* Search */}
      <div className="kb-search-row">
        <input
          className="kb-search"
          type="text"
          placeholder="Search knowledge base..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="btn btn-secondary kb-clear-btn"
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Category pill tabs — minimalist */}
      <div className="kb-filters">
        <button
          className={`kb-pill${activeCategory === "all" ? " kb-pill-active" : ""}`}
          onClick={() => { setActiveCategory("all"); setActiveSubCategory("all"); }}
        >
          All ({KB_ENTRIES.length})
        </button>
        {CATEGORY_KEYS.map((key) => {
          const cat = KB_CATEGORIES[key];
          const count = KB_ENTRIES.filter((e) => e.category === key).length;
          return (
            <button
              key={key}
              className={`kb-pill${activeCategory === key ? " kb-pill-active" : ""}`}
              onClick={() => { setActiveCategory(key); setActiveSubCategory("all"); }}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Sub-category filter */}
      {subCategories.length > 0 && (
        <div className="kb-filters kb-filters-sub">
          <button
            className={`kb-pill kb-pill-sm${activeSubCategory === "all" ? " kb-pill-active" : ""}`}
            onClick={() => setActiveSubCategory("all")}
          >
            All sub-topics
          </button>
          {subCategories.map((sub) => {
            const count = KB_ENTRIES.filter((e) => e.category === activeCategory && e.subCategory === sub.slug).length;
            if (count === 0) return null;
            return (
              <button
                key={sub.slug}
                className={`kb-pill kb-pill-sm${activeSubCategory === sub.slug ? " kb-pill-active" : ""}`}
                onClick={() => setActiveSubCategory(sub.slug)}
              >
                {sub.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Search results count */}
      {search && (
        <p className="kb-result-count">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Grouped list view */}
      {filtered.length > 0 ? (
        <div className="kb-list-container">
          {Object.entries(grouped).map(([catLabel, entries]) => (
            <div key={catLabel} className="kb-list-section">
              <h3 className="kb-list-section-title">{catLabel}</h3>
              <div className="kb-list">
                {entries.map((entry) => {
                  const catMeta = KB_CATEGORIES[entry.category];
                  return (
                    <button
                      key={`${entry.category}-${entry.subCategory}-${entry.title}`}
                      className="kb-list-item"
                      onClick={() => setSlideEntry(entry)}
                    >
                      <div className="kb-list-item-info">
                        <strong className="kb-list-item-title">{entry.title}</strong>
                        <span className="kb-list-item-tagline">
                          {entry.content.slice(0, 80)}{entry.content.length > 80 ? "..." : ""}
                        </span>
                      </div>
                      <span
                        className="kb-list-item-tag"
                        style={{ background: catMeta.color + "18", color: catMeta.color, borderColor: catMeta.color + "44" }}
                      >
                        {entry.subCategory}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="kb-empty">
          <p>No matching articles found.</p>
        </div>
      )}

      {/* Slide-over panel */}
      {slideEntry && (
        <>
          <div className="kb-slide-backdrop" onClick={() => setSlideEntry(null)} />
          <div className="kb-slide-panel">
            <div className="kb-slide-header">
              <button className="kb-slide-close" onClick={() => setSlideEntry(null)}>
                &times;
              </button>
              <span
                className="kb-list-item-tag"
                style={{
                  background: KB_CATEGORIES[slideEntry.category].color + "18",
                  color: KB_CATEGORIES[slideEntry.category].color,
                  borderColor: KB_CATEGORIES[slideEntry.category].color + "44",
                }}
              >
                {KB_CATEGORIES[slideEntry.category].label} / {slideEntry.subCategory}
              </span>
            </div>
            <h2 className="kb-slide-title">{slideEntry.title}</h2>
            <div className="kb-slide-content">
              <p>{slideEntry.content}</p>
            </div>
            <div className="kb-slide-facts">
              <h4>Key Facts</h4>
              <ul>
                {slideEntry.keyFacts.map((fact, i) => (
                  <li key={i}><span className="kb-fact-check">&#10003;</span> {fact}</li>
                ))}
              </ul>
            </div>
            <div className="kb-slide-tags">
              {slideEntry.tags.map((tag) => (
                <span key={tag} className="kb-tag">{tag}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
