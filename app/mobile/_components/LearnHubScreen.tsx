"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import BottomNav from "./BottomNav";
import MobileScreenShell from "./MobileScreenShell";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { useMobileSession } from "../_lib/mobile-session-context";
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
// several sections instead of a single module grid. "Scenarios" was removed
// as a bottom-nav tab, and /mobile/scenarios now redirects to Live Guest.
// Scenario Practice and the Live Arena were retired in the Rich update,
// Phase 8: the Practice section is Live Guest. useTrainingProgress()
// used to have no caching/dedup (every call fired its own fetch); it's now
// backed by a shared TrainingProgressProvider (Phase 1a), but this screen
// still calls the hook exactly once and prop-drills into the sections that
// need it, rather than each section calling it independently.
//
// Phase 2 (mobile bug-fix plan, 2026-08-24): sections reordered into an
// easy -> medium -> hard progression per explicit user instruction — Modules
// (quiz gate) first, then Practice (Live Guest), then Interactive
// Mini-Games, then Reference Library. Knowledge Base also
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
  const { skillCheckDone } = useMobileSession();

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

  const shellStyle: React.CSSProperties = { justifyContent: "space-between" };

  if (status === "loading") {
    return (
      <MobileScreenShell style={shellStyle}>
        <StatusMessage>Loading modules…</StatusMessage>
        <BottomNav active="learn" />
      </MobileScreenShell>
    );
  }

  if (status === "error") {
    return (
      <MobileScreenShell style={shellStyle}>
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
      </MobileScreenShell>
    );
  }

  return (
    <MobileScreenShell style={shellStyle}>
      {/* The nav is fixed, as on Home, so it is in reach without scrolling
          to the end of the hub. The bottom padding keeps the last section
          clear of it: 84px (64px tab row + 20px indicator strip) plus the
          safe area. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          paddingBottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
        }}
      >
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

        {!skillCheckDone && <SkillCheckPrompt />}

        <div ref={modulesRef}>
          <CoreKnowledgeSection data={data} search={debouncedSearch} />
        </div>

        <div ref={practiceRef}>
          <DrillCard />
          <RushCard />
          <LiveGuestCard />
        </div>

        <div ref={gamesRef}>
          <MiniGamesSection />
        </div>

        <div ref={referenceRef}>
          <ReferenceLibrarySection />
        </div>
      </div>

      <BottomNav active="learn" fixed />
    </MobileScreenShell>
  );
}

// Rich update, Phase 5: until the skill check is done, offer it above the
// modules. Full marks in an area starts that area's quizzes on harder
// questions (lib/diagnostic-engine.ts knowsArea).
function SkillCheckPrompt() {
  return (
    <div style={{ padding: "0 20px 16px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--border-mobile)",
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Skip what you already know</p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-mobile-muted)" }}>
          Take the 2-minute skill check. Areas you know start on harder questions, and any module can be mastered
          straight away with its test-out.
        </p>
        <Link
          href="/mobile/onboarding"
          style={{
            alignSelf: "flex-start",
            marginTop: 4,
            padding: "10px 18px",
            borderRadius: "var(--radius-pill)",
            background: "var(--gold-mobile)",
            color: "var(--bg-mobile-dark)",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Start the skill check
        </Link>
      </div>
    </div>
  );
}

// Rich update, Phase 10: the way into the mixed drill, ten questions across
// the modules the person has started (components/quiz/MixedDrill.tsx).
function DrillCard() {
  return (
    <div style={{ padding: "0 20px 12px" }}>
      <Link
        href="/mobile/drill"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--border-mobile)",
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold-mobile)" }}>
          Mixed drill
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Ten questions, every module you&apos;ve started</span>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-mobile-muted)" }}>
          A quick round at full difficulty, with the topics mixed. Practice only: it never changes your mastery.
        </span>
      </Link>
    </div>
  );
}

// Rich update, Phase 15: the way into Saturday Rush, the timed service game
// (components/rush/SaturdayRush.tsx).
function RushCard() {
  return (
    <div style={{ padding: "0 20px 12px" }}>
      <Link
        href="/mobile/rush"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--border-mobile)",
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold-mobile)" }}>
          Saturday Rush
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Two hours behind a busy bar, against the clock</span>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-mobile-muted)" }}>
          The queue grows and the ice runs down. Twelve quick calls, scored on guests, speed, money and safety.
        </span>
      </Link>
    </div>
  );
}

// Rich update, Phase 6: the way into Live Guest, a conversation with a guest
// who talks back (components/live-guest/LiveGuest.tsx).
function LiveGuestCard() {
  return (
    <div style={{ padding: "0 20px 20px" }}>
      <Link
        href="/mobile/live-guest"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--gold-mobile)",
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold-mobile)" }}>
          New: Live Guest
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Talk to a guest who talks back</span>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-mobile-muted)" }}>
          A flat beer, a cold parmy, a guest who&apos;s had too many. Reply the way you would on shift, then see what they were thinking.
        </span>
      </Link>
    </div>
  );
}
