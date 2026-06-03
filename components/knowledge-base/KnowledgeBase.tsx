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

  // Group by category key for sectioned list display
  const grouped = useMemo(() => {
    const groups: Partial<Record<KBCategory, typeof filtered>> = {};
    for (const entry of filtered) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category]!.push(entry);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="kb-container">
      {/* Header band */}
      <div className="kb-header">
        <div className="kb-header-text">
          <span className="kb-header-eyebrow">Knowledge Base</span>
          <strong className="kb-header-title">101 Knowledge Base</strong>
          <span className="kb-header-sub">
            {activeCategory === "all"
              ? `${KB_ENTRIES.length} quick-reference cards across ${CATEGORY_KEYS.length} categories — the 101 Series.`
              : KB_CATEGORIES[activeCategory].description}
          </span>
        </div>
        <div className="kb-header-stat" aria-hidden="true">
          <span className="kb-header-stat-num">{filtered.length}</span>
          <span className="kb-header-stat-label">{filtered.length === KB_ENTRIES.length ? "articles" : "results"}</span>
        </div>
      </div>

      {/* Search */}
      <div className="kb-search-row">
        <div className="kb-search-wrap">
          <svg className="kb-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="kb-search"
            type="text"
            placeholder="Search knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
          {(Object.entries(grouped) as [KBCategory, typeof filtered][]).map(([catKey, entries]) => {
            const catMeta = KB_CATEGORIES[catKey];
            return (
              <div key={catKey} className="kb-list-section">
                <h3
                  className="kb-list-section-title"
                  style={{ borderLeftColor: catMeta.color }}
                >
                  {catMeta.label}
                </h3>
                <div className="kb-list">
                  {entries.map((entry) => (
                    <button
                      key={`${entry.category}-${entry.subCategory}-${entry.title}`}
                      className="kb-list-item"
                      onClick={() => setSlideEntry(entry)}
                    >
                      <span
                        className="kb-list-item-accent"
                        style={{ background: catMeta.color }}
                        aria-hidden="true"
                      />
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
                  ))}
                </div>
              </div>
            );
          })}
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
              <div className="kb-slide-header-left">
                <span className="kb-slide-header-eyebrow">
                  {KB_CATEGORIES[slideEntry.category].label}
                </span>
                <span className="kb-slide-header-sub">{slideEntry.subCategory}</span>
              </div>
              <button className="kb-slide-close" onClick={() => setSlideEntry(null)} aria-label="Close article">
                &times;
              </button>
            </div>
            <div className="kb-slide-body">
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
          </div>
        </>
      )}
    </div>
  );
}
