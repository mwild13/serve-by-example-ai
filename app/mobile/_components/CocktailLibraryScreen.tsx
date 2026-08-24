"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import BottomNav from "./BottomNav";
import { COCKTAILS, CATEGORIES, type Category, type Cocktail } from "@/lib/cocktails";

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
//
// Phase 1b fix (mobile bug-fix plan, 2026-08-24): tapping a cocktail used to
// do nothing at all — no onClick, no detail view existed for this screen
// (desktop's CocktailLibrary.tsx and this screen's sibling
// KnowledgeBaseScreen.tsx both already had a working tap-to-open DetailSheet
// pattern; it was simply never ported here). CocktailDetailSheet below ports
// KnowledgeBaseScreen.tsx's bottom-sheet chrome with desktop
// CocktailLibrary.tsx's DetailSheet content (ingredients/method/glass/
// garnish/tip). The sheet's open/close state is bound to a ?cocktail_id=
// URL search param (not local useState) so the browser/Android back button
// and edge-swipe-back close it without leaving the Cocktail Library page —
// open pushes the param, close pushes the bare path, so a natural back
// navigation always lands one step behind exactly where the user expects.
//
// Bookmarking removed in the same pass: it was local session state only
// (a useState<Set> that reset on every navigation/refresh), never persisted
// to localStorage or Supabase — dead UI wired to nothing, per user request.

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

const COCKTAIL_IMAGES: Record<string, string> = {
  "Espresso Martini": "/mobile/cocktail-espresso-martini.png",
  "Aperol Spritz": "/mobile/cocktail-aperol-spritz.png",
  Negroni: "/mobile/cocktail-negroni.png",
  Sazerac: "/mobile/cocktail-smoked-sazerac.png",
};
const FALLBACK_IMAGE = "/mobile/thumb-cocktail.png";

/** Stable, URL-safe identifier for a cocktail — lib/cocktails.ts has no id
 * field, `name` is the unique key (same assumption CocktailLibraryScreen
 * already made via `key={cocktail.name}` and COCKTAIL_IMAGES above). */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CocktailDetailSheet({
  cocktail,
  imageSrc,
  onClose,
}: {
  cocktail: Cocktail;
  imageSrc: string;
  onClose: () => void;
}) {
  const catMeta = CATEGORIES[cocktail.category];
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
          maxHeight: "85vh",
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 48, height: 48, borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
                <Image src={imageSrc} alt="" fill style={{ objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--gold-mobile)",
                      background: "var(--surface-mobile-alt)",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {catMeta.label}
                  </span>
                  {cocktail.featured && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-mobile)" }}>Most Common</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "var(--text-mobile)" }}>{cocktail.name}</p>
              </div>
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
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>
              Ingredients
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {cocktail.ingredients.map((ing) => (
                <li key={ing} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.4, color: "var(--text-mobile)" }}>
                  <span style={{ color: "var(--gold-mobile)", flexShrink: 0 }}>·</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Method", value: cocktail.method },
              { label: "Glass", value: cocktail.glass },
              { label: "Garnish", value: cocktail.garnish },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>
                  {label}
                </p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: "var(--text-mobile)" }}>{value}</p>
              </div>
            ))}
          </div>

          {cocktail.tip && (
            <div
              style={{
                background: "var(--green-mobile-bg)",
                border: "1px solid var(--border-mobile)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 14px",
                marginBottom: 16,
              }}
            >
              <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--green-mobile)", textTransform: "uppercase" }}>
                Training Tip
              </p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-mobile)" }}>{cocktail.tip}</p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 0",
              background: "var(--surface-mobile-alt)",
              color: "var(--text-mobile)",
              border: "1px solid var(--border-mobile)",
              borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CocktailLibraryScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");

  const selectedSlug = searchParams.get("cocktail_id");
  const selected = useMemo(
    () => (selectedSlug ? COCKTAILS.find((c) => slugify(c.name) === selectedSlug) ?? null : null),
    [selectedSlug],
  );

  function openCocktail(cocktail: Cocktail) {
    router.push(`${pathname}?cocktail_id=${slugify(cocktail.name)}`, { scroll: false });
  }

  function closeCocktail() {
    router.push(pathname, { scroll: false });
  }

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
              return (
                <button
                  key={cocktail.name}
                  type="button"
                  onClick={() => openCocktail(cocktail)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--surface-mobile)",
                    border: "1px solid var(--border-mobile)",
                    textAlign: "left",
                    cursor: "pointer",
                    font: "inherit",
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
                </button>
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

      {selected && (
        <CocktailDetailSheet
          cocktail={selected}
          imageSrc={COCKTAIL_IMAGES[selected.name] ?? FALLBACK_IMAGE}
          onClose={closeCocktail}
        />
      )}
    </div>
  );
}
