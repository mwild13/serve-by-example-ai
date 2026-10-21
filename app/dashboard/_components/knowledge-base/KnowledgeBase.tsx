"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { KB_CATEGORIES, KB_ENTRIES, type KBCategory } from "@/lib/knowledge-base";

// The Knowledge Base on the staff desktop (docs/STAFF_APP.md section 8): the
// cards grouped by category on the left, the open card on the right. Mobile
// has its own screen (app/mobile/_components/KnowledgeBaseScreen.tsx).
// Styles: the sd-ref rules in app/styles/staff.css.

const CATEGORY_KEYS = Object.keys(KB_CATEGORIES) as KBCategory[];

type Entry = (typeof KB_ENTRIES)[number];

export default function KnowledgeBase() {
  const [category, setCategory] = useState<KBCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return KB_ENTRIES.filter(
      (e) =>
        (category === "all" || e.category === category) &&
        (!q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.includes(q))),
    );
  }, [category, search]);

  // All: one group per category. One category: one group per subcategory,
  // so 20-odd cards stay easy to scan.
  const groups = useMemo(() => {
    const raw =
      category === "all"
        ? CATEGORY_KEYS.map((key) => ({ key, label: KB_CATEGORIES[key].label, entries: filtered.filter((e) => e.category === key) }))
        : KB_CATEGORIES[category].subCategories.map((sub) => ({
            key: sub.slug,
            label: sub.label,
            entries: filtered.filter((e) => e.subCategory === sub.slug),
          }));
    return raw.filter((g) => g.entries.length > 0);
  }, [category, filtered]);

  const selected: Entry | null = filtered.find((e) => e.title === selectedTitle) ?? filtered[0] ?? null;

  return (
    <div className="sd-page sd-ref">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">Knowledge Base</h1>
          <p className="sd-subtitle">
            {category === "all"
              ? `${KB_ENTRIES.length} quick-reference cards on spirits, beer, wine, cocktails and no-alcohol drinks.`
              : KB_CATEGORIES[category].description}
          </p>
        </div>
        <label className="sd-search">
          <Search size={16} strokeWidth={2} aria-hidden />
          <span className="sd-visually-hidden">Search the Knowledge Base</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the cards" />
        </label>
      </header>

      <div className="sd-tabs sd-ref-filters" role="tablist" aria-label="Category">
        <button
          type="button"
          role="tab"
          aria-selected={category === "all"}
          className={`sd-tab${category === "all" ? " is-active" : ""}`}
          onClick={() => setCategory("all")}
        >
          All
          <span className="sd-tab-count">{KB_ENTRIES.length}</span>
        </button>
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={category === key}
            className={`sd-tab${category === key ? " is-active" : ""}`}
            onClick={() => setCategory(key)}
          >
            {KB_CATEGORIES[key].label}
            <span className="sd-tab-count">{KB_ENTRIES.filter((e) => e.category === key).length}</span>
          </button>
        ))}
      </div>

      <div className="sd-ref-split">
        <section className="sd-panel sd-panel-flush sd-ref-list" aria-label="Cards">
          {groups.length === 0 ? (
            <p className="sd-empty sd-ref-empty">No card matches that.</p>
          ) : (
            groups.map((g) => (
              <div key={g.key}>
                <div className="sd-rows-head">
                  <p className="sd-label">{g.label}</p>
                  <p className="sd-note">{g.entries.length}</p>
                </div>
                <ul className="sd-list">
                  {g.entries.map((e) => {
                    const active = selected?.title === e.title;
                    return (
                      <li key={e.title}>
                        <button
                          type="button"
                          className={`sd-list-row sd-ref-row${active ? " is-active" : ""}`}
                          aria-current={active ? "true" : undefined}
                          onClick={() => setSelectedTitle(e.title)}
                        >
                          <span className="sd-list-main">
                            <span className="sd-list-title">{e.title}</span>
                            <span className="sd-list-meta sd-ref-snippet">{e.content}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>

        {selected && (
          <article className="sd-panel sd-ref-detail" aria-labelledby="sd-kb-title">
            <p className="sd-label">{KB_CATEGORIES[selected.category].label}</p>
            <h2 id="sd-kb-title" className="sd-ref-title">{selected.title}</h2>
            <p className="sd-ref-body">{selected.content}</p>
            <h3 className="sd-label">Key facts</h3>
            <ul className="sd-ref-spec">
              {selected.keyFacts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </div>
  );
}
