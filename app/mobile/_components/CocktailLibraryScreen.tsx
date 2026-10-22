"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Screen from "./ui/Screen";
import Sheet from "./ui/Sheet";
import { Section } from "./ui/parts";
import { CATEGORIES, COCKTAILS, COCKTAIL_IMAGES, cocktailSlug, type Category, type Cocktail } from "@/lib/cocktails";

// The cocktail library (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md, phase 7): every
// cocktail on a square photo, two to a row. The Most common ones first, then
// the rest by style; a search or a style chip shows one grid of results.
// Tapping one opens its spec in a bottom sheet. lib/cocktails.ts is static
// data, shared with the desktop library.
//
// The open cocktail lives in the URL (?cocktail_id=<slug>), so Home's
// cocktail cards open it directly, and the phone's back gesture closes the
// sheet rather than leaving the library. ?from=home sets the back button.
// Styles: the sm-lib rules in app/styles/staff.css.

const STYLES = (Object.keys(CATEGORIES) as Category[]).filter((key) => COCKTAILS.some((c) => c.category === key));

const FALLBACK_IMAGE = "/mobile/thumb-cocktail.webp";

function photo(c: Cocktail): string {
  return COCKTAIL_IMAGES[c.name] ?? FALLBACK_IMAGE;
}

const byName = (a: Cocktail, b: Cocktail) => a.name.localeCompare(b.name);

export default function CocktailLibraryScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [style, setStyle] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");

  const fromHome = searchParams.get("from") === "home";
  const selectedSlug = searchParams.get("cocktail_id");
  const selected = useMemo(() => (selectedSlug ? (COCKTAILS.find((c) => cocktailSlug(c.name) === selectedSlug) ?? null) : null), [selectedSlug]);

  /** The URL with the open cocktail changed, keeping ?from. */
  function urlWith(slug: string | null): string {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("cocktail_id", slug);
    else params.delete("cocktail_id");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || style !== "all";
  const results = useMemo(
    () =>
      COCKTAILS.filter(
        (c) =>
          (style === "all" || c.category === style) &&
          (!q || c.name.toLowerCase().includes(q) || c.ingredients.some((i) => i.toLowerCase().includes(q))),
      ).sort((a, b) => (a.featured && b.featured ? a.featuredOrder - b.featuredOrder : a.featured ? -1 : b.featured ? 1 : byName(a, b))),
    [style, q],
  );
  const featured = useMemo(() => COCKTAILS.filter((c) => c.featured).sort((a, b) => a.featuredOrder - b.featuredOrder), []);

  const tile = (c: Cocktail, eager = false) => (
    <button key={c.name} type="button" className="sm-photo sm-lib-tile" onClick={() => router.push(urlWith(cocktailSlug(c.name)), { scroll: false })}>
      <Image src={photo(c)} alt="" width={240} height={240} sizes="(max-width: 520px) 46vw, 240px" priority={eager} />
      <span className="sm-photo-caption">
        <span className="sm-photo-title">{c.name}</span>
        <span className="sm-photo-sub">{CATEGORIES[c.category].label}</span>
      </span>
    </button>
  );

  return (
    <Screen title="Cocktails" back={fromHome ? { href: "/mobile/home", label: "Home" } : { href: "/mobile/learn", label: "Learn" }} tab="learn">
      <div className="sm-lib-tools">
        <label className="sm-search">
          <Search size={18} strokeWidth={2.2} aria-hidden="true" />
          <span className="sr-only">Find a cocktail</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or ingredient" enterKeyHint="search" />
        </label>
        <div className="sm-chips" role="radiogroup" aria-label="Style">
          {(["all", ...STYLES] as const).map((key) => (
            <button key={key} type="button" role="radio" aria-checked={style === key} className="sm-chip" onClick={() => setStyle(key)}>
              {key === "all" ? "All" : CATEGORIES[key].label}
            </button>
          ))}
        </div>
      </div>

      {filtering ? (
        <Section title={style === "all" ? "Results" : CATEGORIES[style].label} note={`${results.length} ${results.length === 1 ? "cocktail" : "cocktails"}`}>
          {style !== "all" && !q && <p className="sm-lib-intro">{CATEGORIES[style].description}</p>}
          {results.length > 0 ? (
            <div className="sm-lib-grid">{results.map((c, i) => tile(c, i < 2))}</div>
          ) : (
            <p className="sm-lib-empty">No cocktail matches &ldquo;{query.trim()}&rdquo;. Try an ingredient, such as lime.</p>
          )}
        </Section>
      ) : (
        <>
          <Section title="Most common" note={`${featured.length} to know first`}>
            <div className="sm-lib-grid">{featured.map((c, i) => tile(c, i < 2))}</div>
          </Section>
          {STYLES.map((key) => {
            const rest = COCKTAILS.filter((c) => c.category === key && !c.featured).sort(byName);
            if (rest.length === 0) return null;
            return (
              <Section key={key} title={CATEGORIES[key].label}>
                <div className="sm-lib-grid">{rest.map((c) => tile(c))}</div>
              </Section>
            );
          })}
        </>
      )}

      {selected && <CocktailSheet cocktail={selected} onClose={() => router.push(urlWith(null), { scroll: false })} />}
    </Screen>
  );
}

function CocktailSheet({ cocktail: c, onClose }: { cocktail: Cocktail; onClose: () => void }) {
  return (
    <Sheet
      title={c.name}
      kicker={CATEGORIES[c.category].label}
      onClose={onClose}
      media={
        <div className="sm-lib-hero">
          <Image src={photo(c)} alt="" width={480} height={300} sizes="(max-width: 520px) 100vw, 480px" />
          {c.featured && <span className="sm-photo-tag">Most common</span>}
        </div>
      }
    >
      <div className="sm-lib-spec">
        <section className="sm-card sm-card--pad">
          <h3 className="sm-lib-label">Ingredients</h3>
          <ul className="sm-lib-ingredients">
            {c.ingredients.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
        </section>
        <dl className="sm-card sm-lib-facts">
          {[
            ["Method", c.method],
            ["Glass", c.glass],
            ["Garnish", c.garnish],
            ...(c.origin ? [["Origin", c.origin]] : []),
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="sm-lib-label">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {c.tip && (
          <section className="sm-card sm-card--pad sm-card--active">
            <h3 className="sm-lib-label">Tip</h3>
            <p className="sm-lib-tip">{c.tip}</p>
          </section>
        )}
      </div>
    </Sheet>
  );
}
