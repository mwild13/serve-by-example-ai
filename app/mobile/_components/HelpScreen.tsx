"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Mobile cleanup pass (2026-08-25) — Settings > Support > "Help & FAQ" used
// to send users to the public marketing /resources page. This is the real
// in-app answer: a static how-the-app-works reference, same full-screen
// shell pattern as SettingsScreen.tsx (dark bg, ArrowLeft back button, 390px
// frame) rather than a bottom sheet, since this is meant to be read start to
// finish, not glanced at.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 20px 24px" }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{title}</p>
      <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>{children}</p>
    </div>
  );
}

export default function HelpScreen() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>Settings</span>
        </button>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Help &amp; FAQ</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
          A quick tour of every part of the app and how it fits together.
        </p>
      </div>

      <Section title="Home">
        Your daily warm-up quiz and today&apos;s cocktail picks rotate once a day, so there&apos;s always something fresh to
        practice. The Continue Learning card always points at whichever module you&apos;re mid-way through, or your next
        recommended one if you&apos;re starting fresh.
      </Section>

      <Section title="Learn Hub / Modules">
        Training is split into Bartending, Sales, and Management modules — 40 in total. Each module is mastered by
        answering its True/False quiz correctly several times in a row; get one wrong and the streak resets, so it
        rewards genuine consistency over lucky guessing.
      </Section>

      <Section title="Scenario Practice">
        Written, AI-graded responses to real service situations tied to each module — a deeper check of judgment than
        the quiz alone.
      </Section>

      <Section title="Live Arena">
        Roleplay conversations evaluated live by the AI Coach — the closest thing to practicing on the floor. Arena
        opens straight from a module you&apos;ve just mastered, or any time from the Learn Hub.
      </Section>

      <Section title="Challenges">
        Short, tap-based mini-games that reinforce specs and service skills in bursts — good for a spare minute before
        a shift.
      </Section>

      <Section title="Knowledge Base &amp; Cocktail Library">
        Reference material you can look up mid-shift — cocktail specs, technique notes, and compliance basics, all
        searchable.
      </Section>

      <Section title="Me / Progress">
        Your mastery breakdown by category, best streak, skill level, and badges all live here — along with this Help
        &amp; FAQ page, reached via the gear icon.
      </Section>

      <Section title="Settings">
        Manage your display name, security, venue membership, and language from here.
      </Section>
    </div>
  );
}
