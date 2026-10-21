"use client";

import Image from "next/image";
import Link from "next/link";
import BottomNav from "./BottomNav";
import MobileScreenShell from "./MobileScreenShell";
import AiCoachWidget from "./progress/AiCoachWidget";
import ProfileMenu from "./progress/ProfileMenu";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";

// Phase C file 02 — Mastery Engine Harvest. Real data via useTrainingProgress()
// (GET /api/training/progress). No XP field and no 9-category skill taxonomy
// exist in V3 (see docs/MASTERY_ENGINE.md) — this screen shows the real 3-category breakdown
// (bartending/sales/management) and skillLevel instead of inventing either.
//
// Phase 3b (mobile bug-fix plan, 2026-08-24): "Up Next For Review" removed
// per explicit user instruction — reviewLabel() and its review-queue
// rendering are gone with it (data.reviewQueue itself is untouched server
// -side; nothing else on this screen read it).

const LEGACY_MODULE_LABELS: Record<"bartending" | "sales" | "management", string> = {
  bartending: "Bartending",
  sales: "Sales",
  management: "Management",
};

function SkillRing({ label, pct, breakdown }: { label: string; pct: number; breakdown: { modules: number; scenarios: number; aiScenarios: number } }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = (1 - pct / 100) * circ;

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
      <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r={r} fill="none" stroke="var(--surface-mobile-alt)" strokeWidth="5" />
        <circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke="var(--gold-mobile)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 30 30)"
        />
        <text x="30" y="35" textAnchor="middle" fill="var(--text-mobile)" fontSize="14" fontWeight="700">
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)", textAlign: "center" }}>{label}</span>

      {/* Sub-bars: Modules (the quiz gate) and Live Guest (the roleplay
          row), split by scenario_type per lib/mastery.ts's
          moduleMasteryByType() and GET /api/training/progress's
          categoryBreakdown. The ring is their average. Scenario Practice was
          retired in the Rich update, Phase 8. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        {([
          ["Modules", breakdown.modules],
          ["Live Guest", breakdown.aiScenarios],
        ] as const).map(([subLabel, subPct]) => (
          <div key={subLabel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, color: "var(--text-mobile-muted)", width: 46, flexShrink: 0, textAlign: "left" }}>
              {subLabel}
            </span>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
              <div style={{ width: `${subPct}%`, height: "100%", background: "var(--green-mobile)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

export default function ProgressScreen() {
  const session = useMobileSession();
  const { status, data, error, refetch } = useTrainingProgress();

  const shellStyle: React.CSSProperties = { justifyContent: "space-between" };

  if (status === "loading") {
    return (
      <MobileScreenShell style={shellStyle}>
        <StatusMessage>Loading your progress…</StatusMessage>
        <BottomNav active="me" />
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
        <BottomNav active="me" />
      </MobileScreenShell>
    );
  }

  const STATS = [
    { value: `${data.masteredModuleCount}/${data.totalModuleCount}`, label: "Modules Mastered", color: "var(--text-mobile)" },
    { value: `${data.bestCorrectStreak}`, label: "Best Streak", color: "var(--green-mobile)" },
    { value: `${data.skillLevel}/10`, label: "Skill Level", color: "var(--gold-mobile)" },
  ];

  const SKILLS = (Object.keys(LEGACY_MODULE_LABELS) as Array<keyof typeof LEGACY_MODULE_LABELS>).map((key) => ({
    label: LEGACY_MODULE_LABELS[key],
    pct: data.mastery[key] ?? 0,
    breakdown: data.categoryBreakdown[key] ?? { modules: 0, scenarios: 0, aiScenarios: 0 },
  }));

  return (
    <MobileScreenShell style={shellStyle}>
      {/* The nav is fixed, as on Home and Learn, and the AI Coach button sits
          just above it. The bottom padding keeps the last card clear of both:
          84px (64px tab row + 20px indicator strip), 64px for the coach
          button, plus the safe area. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          paddingBottom: "calc(148px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* profile-header (2026-10-14): logo, then name and plan; the photo
            on the right opens the account menu (Settings, Change photo,
            Log out). */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <Link href="/mobile/home" aria-label="Go to Home" style={{ flexShrink: 0, display: "flex" }}>
              <Image
                src="/logo.webp"
                alt="Serve By Example"
                width={40}
                height={40}
                quality={50}
                style={{ width: 40, height: 40, objectFit: "contain" }}
              />
            </Link>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.displayName}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gold-mobile)", textTransform: "capitalize" }}>{session.tier} plan</p>
              {session.hasVenueMembership && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Venue team member</p>
              )}
            </div>
          </div>
          <ProfileMenu />
        </div>

        {/* stats-row */}
        <div style={{ display: "flex", gap: 10, padding: "0 20px 20px" }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: 12,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-mobile-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* mastery-grid-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Mastery Breakdown</p>
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            {SKILLS.map((skill) => (
              <SkillRing key={skill.label} label={skill.label} pct={skill.pct} breakdown={skill.breakdown} />
            ))}
          </div>

          {/* What builds each ring: the module quizzes and Live Guest. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-mobile)" }}>Live Guest</p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--text-mobile-muted)" }}>
              Each ring is half module quizzes, half Live Guest conversations. Pass a guest in each module to fill it.{" "}
              <Link href="/mobile/live-guest" style={{ color: "var(--gold-mobile)", fontWeight: 600, textDecoration: "underline" }}>
                Talk to a guest
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Phase 3d — AI chat widget, lower third above BottomNav. Rendered
          only on the main content branch (not loading/error), stateless
          per request (v1 scope confirmed with user — no persisted history). */}
      <AiCoachWidget />

      <BottomNav active="me" fixed />
    </MobileScreenShell>
  );
}
