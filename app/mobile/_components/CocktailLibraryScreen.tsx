"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Bookmark, BookmarkCheck } from "lucide-react";
import BottomNav from "./BottomNav";
import { COCKTAILS, CATEGORIES, type Category } from "@/lib/cocktails";

// Phase C file 06 — real data + search/filter, ported from the desktop
// CocktailLibrary.tsx `useMemo` pattern (app/dashboard/_components/
// knowledge-base/CocktailLibrary.tsx). No backend/DB involved — lib/cocktails.ts
// is pure static data, per v4-migration-plan/06.
//
// The Phase B mock's per-card "base"/"difficulty"/"locked" fields don't exist
// on the real `Cocktail` type and are dropped rather than faked. Only 4 of 38
// cocktails have dedicated photography in /public/mobile (Espresso Martini,
// Aperol Spritz, Negroni, Sazerac); every other card falls back to the shared
// /public/mobile/thumb-cocktail.png glass icon rather than a nonexistent path.
// Bookmarking mirrors desktop exactly: local session state only, not persisted
// — same as `practiceAdded` in CocktailLibrary.tsx today.

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

const COCKTAIL_IMAGES: Record<string, string> = {
  "Espresso Martini": "/mobile/cocktail-espresso-martini.png",
  "Aperol Spritz": "/mobile/cocktail-aperol-spritz.png",
  Negroni: "/mobile/cocktail-negroni.png",
  Sazerac: "/mobile/cocktail-smoked-sazerac.png",
};
const FALLBACK_IMAGE = "/mobile/thumb-cocktail.png";

export default function CocktailLibraryScreen() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const results = COCKTAILS.filter((c) => {
      const matchesCat = activeCategory === "all" || c.category === activeCategory;
      const matchesSearch = c.name.toLowerCase().includes(q) || c.ingredients.some((i) => i.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });

    return [...results].sort((a, b) => {
      if (a.featured && b.featured) return a.featuredOrder - b.featuredOrder;
      if (a.featured) return -1;
      if (b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [activeCategory, search]);

  function toggleBookmark(name: string) {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

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
        {/* title-section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>Drink Library</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>{COCKTAILS.length} recipes</p>
        </div>

        {/* search-container */}
        <div style={{ display: "flex", gap: 12, padding: "0 20px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: 1,
              minWidth: 0,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <Search size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name or ingredient..."
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

        {/* category-tabs */}
        <div style={{ display: "flex", gap: 8, padding: "0 0 16px 20px", overflowX: "auto" }}>
          {(["all", ...CATEGORY_KEYS.filter((key) => COCKTAILS.some((c) => c.category === key))] as const).map((key) => {
            const isActive = key === activeCategory;
            const label = key === "all" ? "All" : CATEGORIES[key].label;
            const count = key === "all" ? COCKTAILS.length : COCKTAILS.filter((c) => c.category === key).length;
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

        {/* library-list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          {filtered.length > 0 ? (
            filtered.map((cocktail) => {
              const catMeta = CATEGORIES[cocktail.category];
              const isBookmarked = bookmarked.has(cocktail.name);
              return (
                <div
                  key={cocktail.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--surface-mobile)",
                    border: "1px solid var(--border-mobile)",
                  }}
                >
                  <div style={{ position: "relative", width: 64, height: 64, borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
                    <Image src={COCKTAIL_IMAGES[cocktail.name] ?? FALLBACK_IMAGE} alt="" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{cocktail.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "var(--surface-mobile-alt)",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--gold-mobile)",
                        }}
                      >
                        {catMeta.label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-mobile-muted)" }}>{cocktail.glass}</span>
                      {cocktail.featured && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-mobile)" }}>Most Common</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(cocktail.name)}
                    aria-label={isBookmarked ? `Remove ${cocktail.name} bookmark` : `Bookmark ${cocktail.name}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                    ) : (
                      <Bookmark size={20} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--text-mobile-muted)" }}>
              No cocktails found for &ldquo;{search}&rdquo;.
            </div>
          )}
        </div>
      </div>

      <BottomNav active="learn" />
    </div>
  );
}
