"use client";

import { Martini } from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B skeleton — dumb UI only. Matches the Figma "match-pairs-game" frame
// 1:1 visually; local layout state only (no click handlers, no game logic).

type CardState = "closed" | "selected" | "matched";

type PairCard = {
  state: CardState;
  label?: string; // only set for "selected" and "matched" cards
};

const CARDS: PairCard[] = [
  { state: "selected", label: "Angostura Bitters" },
  { state: "closed" },
  { state: "closed" },
  { state: "closed" },
  { state: "selected", label: "Old Fashioned" },
  { state: "closed" },
  { state: "matched", label: "Bourbon Whiskey" },
  { state: "closed" },
  { state: "matched", label: "Whiskey Sour" },
  { state: "closed" },
  { state: "closed" },
  { state: "closed" },
];

const CARD_STYLES: Record<CardState, { background: string; border: string; color?: string }> = {
  closed: { background: "var(--surface-mobile)", border: "1px solid var(--border-mobile)" },
  selected: { background: "var(--gold-mobile-bg)", border: "2px solid var(--gold-mobile)", color: "var(--gold-mobile)" },
  matched: { background: "var(--green-mobile-bg)", border: "1px solid var(--green-mobile)", color: "var(--green-mobile)" },
};

export default function MatchPairsScreen() {
  const pairsFound = CARDS.filter((c) => c.state === "matched").length / 2;

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
        {/* game-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Ingredient Match</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Classic Cocktails Mastery</p>
          </div>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--gold-mobile-bg)",
              border: "1px solid var(--gold-mobile)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-mobile)" }}>1:14 Min</span>
          </div>
        </div>

        {/* game-stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 16px" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-mobile-muted)" }}>
            Pairs Found: <span style={{ fontWeight: 700, color: "var(--gold-mobile)" }}>{pairsFound}/6</span>
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-mobile-muted)" }}>
            Moves: <span style={{ fontWeight: 700, color: "var(--text-mobile)" }}>8</span>
          </p>
        </div>

        {/* grid-container — 3 cols x 4 rows */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            padding: "0 20px 20px",
          }}
        >
          {CARDS.map((card, i) => {
            const style = CARD_STYLES[card.state];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 88,
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  background: style.background,
                  border: style.border,
                  textAlign: "center",
                }}
              >
                {card.label ? (
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: style.color }}>{card.label}</p>
                ) : (
                  <Martini size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
