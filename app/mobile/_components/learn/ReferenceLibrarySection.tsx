"use client";

import Link from "next/link";
import { Martini, ChevronRight } from "lucide-react";

// 3-tab consolidation (2026-08-21) — fast, on-the-floor lookup content,
// distinct from CoreKnowledgeSection's structured "learn the fundamentals"
// content. Only one item today (Cocktail Library), so a single full-width
// tile rather than a scroller. Do not merge with CoreKnowledgeSection's
// Knowledge Base tile — see the split note there.

export default function ReferenceLibrarySection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Reference Library</p>
      <Link
        href="/mobile/cocktails"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--border-mobile)",
          textDecoration: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-mobile-alt)",
            }}
          >
            <Martini size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Cocktail Library</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>38 recipes, ingredients &amp; glass pairings</p>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
      </Link>
    </div>
  );
}
