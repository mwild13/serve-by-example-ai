"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import BottomNav from "./BottomNav";
import { useTrainingProgress } from "../_lib/use-training-progress";
import CoreKnowledgeSection from "./learn/CoreKnowledgeSection";
import PracticeScenariosSection from "./learn/PracticeScenariosSection";
import CategorySimulationsSection from "./learn/CategorySimulationsSection";
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
// several sections instead of a single module grid. "Scenarios" was removed
// as a bottom-nav tab — it was a training *method* (roleplay/descriptor/
// quiz), not a distinct destination from "Learn" — so ScenarioTrainingScreen
// .tsx's content (now PracticeScenariosSection + CategorySimulationsSection)
// lives here, and /mobile/scenarios redirects here. useTrainingProgress()
// used to have no caching/dedup (every call fired its own fetch); it's now
// backed by a shared TrainingProgressProvider (Phase 1a), but this screen
// still calls the hook exactly once and prop-drills into the sections that
// need it, rather than each section calling it independently.
//
// Phase 2 (mobile bug-fix plan, 2026-08-24): sections reordered into an
// easy -> medium -> hard progression per explicit user instruction — Modules
// (quiz gate) first, then Practice & Scenarios (Live Arena), then Category
// Simulations (a full category scenario run, the deepest practice mode),
// then Interactive Mini-Games, then Reference Library. Knowledge Base also
// moved out of the Modules section into Reference Library (above Cocktail
// Library) — see ReferenceLibrarySection.tsx's header comment; this
// reverses the "do not merge" split that used to be documented here.

const JUMP_SECTIONS = [
  { id: "modules", label: "Modules" },
  { id: "practice", label: "Practice" },
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

  // Phase 1d fix (mobile bug-fix plan): the search bar used to be a
  // decorative `readOnly` input wired to nothing. It now filters the module
  // grid in CoreKnowledgeSection (the section it's literally labeled
  // "Search training modules..." for), debounced 150ms so rapid keystrokes
  // don't re-filter on every character, and auto-scrolls to that section the
  // moment the user starts typing (not on every keystroke — only on the
  // empty-to-non-empty transition).
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(timer);
  }, [search]);

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

  function handleSearchChange(value: string) {
    const wasEmpty = search.length === 0;
    setSearch(value);
    if (wasEmpty && value.length > 0) {
      scrollToSection("modules");
    }
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
            {/* Phase 1c fix: wrapped in a Link so the logo doubles as a home
                button everywhere it's shown, matching Navbar.tsx's own
                <Link href="/" ...> pattern. */}
            <Link href="/mobile/home" style={{ flexShrink: 0, display: "flex" }} aria-label="Go to Home">
              <Image
                src="/logo.webp"
                alt="Serve By Example"
                width={32}
                height={32}
                quality={50}
                style={{ flexShrink: 0, width: 32, height: 32, objectFit: "contain" }}
              />
            </Link>
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
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
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

        <div ref={modulesRef}>
          <CoreKnowledgeSection data={data} search={debouncedSearch} />
        </div>

        <div ref={practiceRef}>
          <PracticeScenariosSection data={data} />
        </div>

        <CategorySimulationsSection data={data} />

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
