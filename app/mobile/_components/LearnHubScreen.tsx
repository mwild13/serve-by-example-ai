"use client";

import { useRef } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import BottomNav from "./BottomNav";
import { useTrainingProgress } from "../_lib/use-training-progress";
import PracticeScenariosSection from "./learn/PracticeScenariosSection";
import CoreKnowledgeSection from "./learn/CoreKnowledgeSection";
import MiniGamesSection from "./learn/MiniGamesSection";
import ReferenceLibrarySection from "./learn/ReferenceLibrarySection";

// Phase C file 02 — Mastery Engine Harvest. Module cards read from the real
// 40-module catalog + moduleProgress map returned by GET /api/training/progress,
// via useTrainingProgress(). Category pills map to the real `modules.category`
// values (technical/service/compliance) — not the arbitrary Phase B placeholder
// categories. Module locking stays cosmetic-only per v4-migration-plan/00
// Locked Decision #3: V3 has a single global free/paid gate, no per-module rules.
//
// 3-tab consolidation (2026-08-21): this screen is now the orchestrator for
// 4 sections instead of a single module grid. "Scenarios" was removed as a
// bottom-nav tab — it was a training *method* (roleplay/descriptor/quiz), not
// a distinct destination from "Learn" — so ScenarioTrainingScreen.tsx's
// content (now PracticeScenariosSection) lives here as the first section,
// and /mobile/scenarios redirects here. useTrainingProgress() has no
// caching/dedup (every call fires its own fetch), so it's called exactly
// once here and prop-drilled into the sections that need it — calling it
// per-section would fire redundant network requests on every page load.
//
// Core Knowledge (Knowledge Base) vs. Reference Library (Cocktail Library)
// is a deliberate split, not a naming accident: Knowledge Base is
// structured, read-through reference content ("learn the fundamentals in
// order"); Cocktail Library is fast, searchable, on-the-floor lookup
// ("check this right now, mid-shift"). Do not merge these two sections.

const JUMP_SECTIONS = [
  { id: "practice", label: "Practice" },
  { id: "modules", label: "Modules" },
  { id: "games", label: "Games" },
  { id: "reference", label: "Reference" },
] as const;

type SectionId = (typeof JUMP_SECTIONS)[number]["id"];

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60dvh",
        padding: 20,
        color: "var(--text-mobile-muted)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

export default function LearnHubScreen() {
  const { status, data, error, refetch } = useTrainingProgress();

  const practiceRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const gamesRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<SectionId, React.RefObject<HTMLDivElement | null>> = {
    practice: practiceRef,
    modules: modulesRef,
    games: gamesRef,
    reference: referenceRef,
  };

  function scrollToSection(id: SectionId) {
    sectionRefs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const shellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 390,
    margin: "0 auto",
    minHeight: "100dvh",
    background: "var(--bg-mobile-dark)",
    fontFamily: "var(--font-body)",
  };

  if (status === "loading") {
    return (
      <div style={shellStyle}>
        <StatusMessage>Loading modules…</StatusMessage>
        <BottomNav active="learn" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={shellStyle}>
        <StatusMessage>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <span>{error}</span>
            <button
              type="button"
              onClick={refetch}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-mobile)",
                background: "var(--surface-mobile)",
                color: "var(--text-mobile)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </StatusMessage>
        <BottomNav active="learn" />
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* header-search-group */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>Learn Hub</p>
            <Image
              src="/logo.webp"
              alt="Serve By Example"
              width={32}
              height={32}
              quality={50}
              style={{ flexShrink: 0, width: 32, height: 32, objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <Search size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search training modules..."
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
        </div>

        {/* section-jump-nav — sticky pill row so staff can jump straight to
            the section they need without scrolling through all 4. Click-to-
            scroll only, no scroll-spy active-state tracking (that's a
            reasonable v2 enhancement, not required here). */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            display: "flex",
            gap: 8,
            padding: "0 20px 16px",
            background: "var(--bg-mobile-dark)",
            overflowX: "auto",
            scrollSnapType: "x proximity",
            scrollPaddingLeft: 20,
            scrollPaddingRight: 20,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {JUMP_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              style={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-mobile)",
                background: "var(--surface-mobile)",
                color: "var(--text-mobile)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div ref={practiceRef}>
          <PracticeScenariosSection data={data} />
        </div>

        <div ref={modulesRef}>
          <CoreKnowledgeSection data={data} />
        </div>

        <div ref={gamesRef}>
          <MiniGamesSection />
        </div>

        <div ref={referenceRef}>
          <ReferenceLibrarySection />
        </div>
      </div>

      <BottomNav active="learn" />
    </div>
  );
}
