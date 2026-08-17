"use client";

import { useState } from "react";
import Link from "next/link";
import { Martini, Wine, Award, type LucideIcon } from "lucide-react";

// Phase B.5 — level selection is local UI state (self-report picker, not the
// real 10-question diagnostic — see v4-migration-plan/08 for the Phase C
// replacement plan). Progress bar and step count stay static. "Skip
// Assessment" routes to Home; "Next Question" stays disabled — no real
// question flow exists yet to advance through.

type LevelOption = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const LEVELS: LevelOption[] = [
  { title: "Beginner", description: "I know the basic spirits & measurements but rarely mix.", icon: Martini },
  { title: "Intermediate", description: "I can make the absolute classics (Margarita, Old Fashioned).", icon: Wine },
  { title: "Advanced", description: "I design custom menus and handle busy hospitality shifts.", icon: Award },
];

export default function OnboardingDiagnosticScreen() {
  const [selectedLevel, setSelectedLevel] = useState("Intermediate");

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
        {/* step-header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <div style={{ width: "100%", height: 4, borderRadius: 2, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
            <div style={{ width: "51%", height: "100%", background: "var(--gold-mobile)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Placement Assessment</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--gold-mobile)" }}>Step 2 of 4</p>
          </div>
        </div>

        {/* question-prompt */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>
            How experienced are you with crafting cocktails?
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
            We will customise your daily pre-shift warmups based on your experience tier.
          </p>
        </div>

        {/* selection-grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 24px" }}>
          {LEVELS.map((level) => {
            const Icon = level.icon;
            const isSelected = level.title === selectedLevel;
            return (
              <button
                key={level.title}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedLevel(level.title)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 20,
                  borderRadius: "var(--radius-lg)",
                  background: isSelected ? "var(--gold-mobile-bg)" : "var(--surface-mobile)",
                  border: isSelected ? "1.5px solid var(--gold-mobile)" : "1.5px solid var(--border-mobile)",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-pill)",
                    background: isSelected ? "var(--gold-mobile)" : "var(--surface-mobile-alt)",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={2}
                    color={isSelected ? "var(--bg-mobile-dark)" : "var(--text-mobile)"}
                    aria-hidden="true"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{level.title}</p>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: "var(--text-mobile-muted)" }}>
                    {level.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* footer */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 20 }}>
        <button
          type="button"
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 48,
            borderRadius: "var(--radius-pill)",
            background: "var(--gold-mobile)",
            border: "none",
            opacity: 0.5,
            cursor: "default",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>Next Question</span>
        </button>
        <Link
          href="/mobile/home"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-mobile-muted)",
            textDecoration: "underline",
          }}
        >
          Skip Assessment
        </Link>
      </div>
    </div>
  );
}
