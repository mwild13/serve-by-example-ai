"use client";

import Link from "next/link";
import { Home, Library, User } from "lucide-react";

// Phase B.5 — real routing. Tabs render an active state via the `active` prop
// (still passed explicitly by each screen) and now navigate via next/link.
//
// 3-tab consolidation (2026-08-21): "Scenarios" was removed as a top-level
// tab — it was a training *method* (roleplay/descriptor/quiz), not a
// distinct destination from "Learn", and splitting them confused the IA.
// Scenario Training, Descriptor Practice, and AI Arena now live under
// /mobile/learn's "Practice & Scenarios" section. /mobile/scenarios redirects
// there for old links/bookmarks — see app/mobile/scenarios/page.tsx.

export type MobileNavTab = "home" | "learn" | "me";

const TABS: { id: MobileNavTab; label: string; icon: typeof Home; href: string }[] = [
  { id: "home", label: "Home", icon: Home, href: "/mobile/home" },
  { id: "learn", label: "Learn", icon: Library, href: "/mobile/learn" },
  { id: "me", label: "Me", icon: User, href: "/mobile/progress" },
];

// Fix-locked bottom nav (2026-08-25): Home's content could run taller than
// the viewport, and since this nav rendered inline at the end of that
// column (not fixed), it only came into view once the user scrolled all
// the way down — it should behave like a normal app tab bar, always
// visible. `fixed` is opt-in per screen (only HomeScreen passes it for
// now) rather than a global behavior change, so every other screen using
// this component keeps its current inline layout untouched.
export default function BottomNav({ active, fixed }: { active: MobileNavTab; fixed?: boolean }) {
  return (
    <nav
      style={{
        width: "100%",
        maxWidth: fixed ? 390 : undefined,
        flexShrink: 0,
        background: "var(--surface-mobile)",
        borderTop: "1px solid var(--border-mobile)",
        ...(fixed
          ? {
              position: "fixed" as const,
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              zIndex: 50,
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }
          : {}),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          padding: "0 16px",
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                width: 70,
                background: "none",
                border: "none",
                textDecoration: "none",
                color: isActive ? "var(--gold-mobile)" : "var(--text-mobile-muted)",
              }}
            >
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 20,
          width: "100%",
        }}
      >
        <div
          style={{
            width: 120,
            height: 5,
            borderRadius: "var(--radius-pill)",
            background: "var(--text-mobile-faint)",
          }}
        />
      </div>
    </nav>
  );
}
