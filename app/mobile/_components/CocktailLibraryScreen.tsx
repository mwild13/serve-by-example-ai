"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, Bookmark, LockKeyhole } from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B.5 — category tabs hold local selection state. Search, the filter
// button, and cocktail cards stay inert (no detail screen exists yet) —
// data wiring is Phase C.

const CATEGORIES = ["All", "Classic", "Modern", "Shots", "Mocktails"];

type CocktailCard = {
  title: string;
  base: string;
  difficulty: string;
  image: string;
  locked?: boolean;
};

const COCKTAILS: CocktailCard[] = [
  { title: "Espresso Martini", base: "Vodka", difficulty: "Medium", image: "/mobile/cocktail-espresso-martini.png" },
  { title: "Negroni Classico", base: "Gin", difficulty: "Easy", image: "/mobile/cocktail-negroni.png" },
  { title: "Aperol Spritz", base: "Prosecco", difficulty: "Easy", image: "/mobile/cocktail-aperol-spritz.png" },
  { title: "Smoked Sazerac", base: "Cognac", difficulty: "Hard", image: "/mobile/cocktail-smoked-sazerac.png", locked: true },
];

export default function CocktailLibraryScreen() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

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
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>38 recipes</p>
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
              readOnly
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-mobile-muted)",
              }}
            />
          </div>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              flexShrink: 0,
              cursor: "pointer",
            }}
            aria-label="Filter"
          >
            <SlidersHorizontal size={20} strokeWidth={2} color="var(--text-mobile)" aria-hidden="true" />
          </button>
        </div>

        {/* category-tabs */}
        <div style={{ display: "flex", gap: 8, padding: "0 0 16px 20px", overflowX: "auto" }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(cat)}
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
                {cat}
              </button>
            );
          })}
        </div>

        {/* library-list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          {COCKTAILS.map((cocktail) => (
            <div
              key={cocktail.title}
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
                <Image src={cocktail.image} alt="" fill style={{ objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{cocktail.title}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                    {cocktail.base}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-mobile-muted)" }}>{cocktail.difficulty}</span>
                </div>
              </div>
              {cocktail.locked ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: "var(--radius-pill)",
                    background: "var(--gold-mobile-bg)",
                    flexShrink: 0,
                  }}
                >
                  <LockKeyhole size={14} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                </div>
              ) : (
                <Bookmark size={20} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" style={{ flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="learn" />
    </div>
  );
}
