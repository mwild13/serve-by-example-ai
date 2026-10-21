"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Bookmark, BookmarkCheck, Search } from "lucide-react";
import { COCKTAILS, CATEGORIES, COCKTAIL_IMAGES, type Category } from "@/lib/cocktails";

// The cocktail library on the staff desktop (docs/STAFF_APP.md section 8):
// the list on the left, the whole spec on the right, so a recipe is one click
// and nothing covers the list. Mobile has its own screen
// (app/mobile/_components/CocktailLibraryScreen.tsx). Styles: the sd-ref
// rules in app/styles/staff.css.

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

// Bookmarks are kept in this browser only. They used to live in component
// state and vanished on the next page, so a bookmark seemed to go nowhere.
const BOOKMARKS_KEY = "sbe-cocktail-bookmarks";
const bookmarkListeners = new Set<() => void>();
// Used when storage is blocked (private window): bookmarks last until the page closes.
let bookmarksFallback = "[]";

function subscribeBookmarks(onChange: () => void) {
  bookmarkListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    bookmarkListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function bookmarksSnapshot(): string {
  try {
    return window.localStorage.getItem(BOOKMARKS_KEY) ?? "[]";
  } catch {
    return bookmarksFallback;
  }
}

function parseBookmarks(raw: string): Set<string> {
  try {
    const names: unknown = JSON.parse(raw);
    return new Set(Array.isArray(names) ? names.filter((n): n is string => typeof n === "string") : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks(names: Set<string>) {
  const raw = JSON.stringify([...names]);
  bookmarksFallback = raw;
  try {
    window.localStorage.setItem(BOOKMARKS_KEY, raw);
  } catch {
    // Kept in bookmarksFallback instead.
  }
  bookmarkListeners.forEach((notify) => notify());
}

type Filter = Category | "all" | "bookmarked";

export default function CocktailLibrary() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  // The server render has no localStorage, so it starts with no bookmarks.
  const bookmarksRaw = useSyncExternalStore(subscribeBookmarks, bookmarksSnapshot, () => "[]");
  const bookmarks = useMemo(() => parseBookmarks(bookmarksRaw), [bookmarksRaw]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const results = COCKTAILS.filter((c) => {
      const inFilter = filter === "all" ? true : filter === "bookmarked" ? bookmarks.has(c.name) : c.category === filter;
      const inSearch = !q || c.name.toLowerCase().includes(q) || c.ingredients.some((i) => i.toLowerCase().includes(q));
      return inFilter && inSearch;
    });
    return [...results].sort((a, b) => {
      if (a.featured && b.featured) return a.featuredOrder - b.featuredOrder;
      if (a.featured) return -1;
      if (b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filter, search, bookmarks]);

  const selected = filtered.find((c) => c.name === selectedName) ?? filtered[0] ?? null;

  function toggleBookmark(name: string) {
    const next = new Set(bookmarks);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    saveBookmarks(next);
  }

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: COCKTAILS.length },
    { id: "bookmarked", label: "Bookmarked", count: bookmarks.size },
    ...CATEGORY_KEYS.map((k) => ({ id: k as Filter, label: CATEGORIES[k].label, count: COCKTAILS.filter((c) => c.category === k).length })).filter(
      (f) => f.count > 0,
    ),
  ];

  const photo = selected ? COCKTAIL_IMAGES[selected.name] : undefined;
  const marked = selected ? bookmarks.has(selected.name) : false;

  return (
    <div className="sd-page sd-ref">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">Cocktails</h1>
          <p className="sd-subtitle">{COCKTAILS.length} classics with the spec, the method, the glass and the garnish.</p>
        </div>
        <label className="sd-search">
          <Search size={16} strokeWidth={2} aria-hidden />
          <span className="sd-visually-hidden">Find a cocktail or ingredient</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cocktail or ingredient" />
        </label>
      </header>

      <div className="sd-tabs sd-ref-filters" role="tablist" aria-label="Style">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`sd-tab${filter === f.id ? " is-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="sd-tab-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="sd-ref-split">
        <section className="sd-panel sd-panel-flush sd-ref-list" aria-label="Cocktails">
          {filtered.length === 0 ? (
            <p className="sd-empty sd-ref-empty">
              {filter === "bookmarked" && !search ? "Nothing bookmarked yet. Open a cocktail and bookmark it." : "No cocktail matches that."}
            </p>
          ) : (
            <ul className="sd-list">
              {filtered.map((c) => {
                const thumb = COCKTAIL_IMAGES[c.name];
                const active = selected?.name === c.name;
                return (
                  <li key={c.name}>
                    <button
                      type="button"
                      className={`sd-list-row sd-ref-row${active ? " is-active" : ""}`}
                      aria-current={active ? "true" : undefined}
                      onClick={() => setSelectedName(c.name)}
                    >
                      <span className="sd-ref-thumb">
                        {thumb && <Image src={thumb} alt="" fill sizes="44px" />}
                      </span>
                      <span className="sd-list-main">
                        <span className="sd-list-title">{c.name}</span>
                        <span className="sd-list-meta">{CATEGORIES[c.category].label}, {c.glass.toLowerCase()}</span>
                      </span>
                      {bookmarks.has(c.name) && <BookmarkCheck size={16} strokeWidth={2} className="sd-ref-mark" aria-label="Bookmarked" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {selected && (
          <article className="sd-panel sd-ref-detail" aria-labelledby="sd-ref-title">
            <div className="sd-ref-detail-top">
              {photo && (
                <div className="sd-ref-photo">
                  <Image src={photo} alt={selected.name} fill sizes="(max-width: 900px) 100vw, 240px" />
                </div>
              )}
              <div className="sd-ref-heading">
                <p className="sd-label">
                  {CATEGORIES[selected.category].label}
                  {selected.featured ? " · Most common" : ""}
                </p>
                <h2 id="sd-ref-title" className="sd-ref-title">{selected.name}</h2>
                {selected.origin && <p className="sd-note">{selected.origin}</p>}
                <button
                  type="button"
                  className={`sd-btn ${marked ? "sd-btn-ghost" : "sd-btn-primary"}`}
                  aria-pressed={marked}
                  onClick={() => toggleBookmark(selected.name)}
                >
                  {marked ? <BookmarkCheck size={16} strokeWidth={2} aria-hidden /> : <Bookmark size={16} strokeWidth={2} aria-hidden />}
                  {marked ? "Bookmarked" : "Bookmark"}
                </button>
              </div>
            </div>

            <div className="sd-ref-cols">
              <section>
                <h3 className="sd-label">Spec</h3>
                <ul className="sd-ref-spec">
                  {selected.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </section>
              <dl className="sd-ref-facts">
                <div>
                  <dt className="sd-label">Method</dt>
                  <dd>{selected.method}</dd>
                </div>
                <div>
                  <dt className="sd-label">Glass</dt>
                  <dd>{selected.glass}</dd>
                </div>
                <div>
                  <dt className="sd-label">Garnish</dt>
                  <dd>{selected.garnish}</dd>
                </div>
              </dl>
            </div>

            <div className="sd-ref-tip">
              <p className="sd-label sd-label-accent">On shift</p>
              <p>{selected.tip}</p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
