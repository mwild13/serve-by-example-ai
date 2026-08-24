"use client";

import { memo } from "react";
import Link from "next/link";
import { BrainCircuit, Martini, ChevronRight } from "lucide-react";

// 3-tab consolidation (2026-08-21) — fast, on-the-floor lookup content,
// distinct from CoreKnowledgeSection's structured "learn the fundamentals"
// content.
//
// Phase 2 (mobile bug-fix plan, 2026-08-24): Knowledge Base moved in here,
// above Cocktail Library, per explicit user instruction — this reverses the
// original "do not merge" split documented above; that split was a
// deliberate earlier decision, not an oversight, but the user's later call
// supersedes it. Wrapped in React.memo — this section has no props and
// never changes once mounted, so it shouldn't re-render on every Learn Hub
// search keystroke.

function ReferenceLibrarySection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Reference Library</p>

      <Link
        href="/mobile/knowledge"
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
            <BrainCircuit size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Knowledge Base</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Foundational guides &amp; venue rules</p>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
      </Link>

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

export default memo(ReferenceLibrarySection);
