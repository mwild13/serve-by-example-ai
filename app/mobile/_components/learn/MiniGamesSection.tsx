"use client";

import Link from "next/link";
import { Swords, ChevronRight } from "lucide-react";
import { CHALLENGES } from "../ChallengesScreen";

// 3-tab consolidation (2026-08-21) — compact teaser only (icon + title,
// first 3 of 5 games), not a duplicate of ChallengesScreen's full card list.
// Duplicating full descriptions here would create two places to keep the
// 5-game list in sync; "See all" routes to the real hub at /mobile/challenges
// for the complete list. Reuses ChallengesScreen's exported CHALLENGES array
// as the single source of truth for game metadata.

export default function MiniGamesSection() {
  const preview = CHALLENGES.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Interactive Mini-Games</p>
        <Link
          href="/mobile/challenges"
          style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)", textDecoration: "none" }}
        >
          See all
          <ChevronRight size={14} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {preview.map((game) => {
          const Icon = game.icon;
          return (
            <Link
              key={game.title}
              href={game.href ?? "/mobile/challenges"}
              style={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                width: 92,
                padding: "14px 10px",
                borderRadius: "var(--radius-lg)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-mobile-alt)",
                }}
              >
                <Icon size={18} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
              </div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-mobile)" }}>{game.title}</p>
            </Link>
          );
        })}
        <Link
          href="/mobile/challenges"
          style={{
            flexShrink: 0,
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: 92,
            padding: "14px 10px",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface-mobile-alt)",
            border: "1px dashed var(--border-mobile)",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          <Swords size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-mobile-muted)" }}>+2 more</p>
        </Link>
      </div>
    </div>
  );
}
