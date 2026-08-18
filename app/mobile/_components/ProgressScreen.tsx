"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings, CalendarClock, Pencil } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";

// Phase C file 02 — Mastery Engine Harvest. Real data via useTrainingProgress()
// (GET /api/training/progress). No XP field and no 9-category skill taxonomy
// exist in V3 (see v4-migration-plan/02-mastery-engine-harvest.md, Locked
// Decision #4 in file 00) — this screen shows the real 3-category breakdown
// (bartending/sales/management) and skillLevel instead of inventing either.

const LEGACY_MODULE_LABELS: Record<"bartending" | "sales" | "management", string> = {
  bartending: "Bartending",
  sales: "Sales",
  management: "Management",
};

function SkillRing({ label, pct }: { label: string; pct: number }) {
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
        <StatusMessage>Loading your progress…</StatusMessage>
        <BottomNav active="me" />
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
        <BottomNav active="me" />
      </div>
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
  }));

  const reviewItems = data.reviewQueue.slice(0, 5);

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* profile-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/mobile/ai-photo" aria-label="Change profile photo" style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, overflow: "hidden" }}>
                <Image
                  src={session.profilePhotoUrl ?? "/mobile/avatar-large.png"}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized={!!session.profilePhotoUrl}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gold-mobile)",
                  border: "2px solid var(--bg-mobile-dark)",
                }}
              >
                <Pencil size={11} strokeWidth={2.5} color="var(--bg-mobile-dark)" aria-hidden="true" />
              </div>
            </Link>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>{session.displayName}</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gold-mobile)", textTransform: "capitalize" }}>{session.tier} plan</p>
              {session.hasVenueMembership && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Venue team member</p>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Settings"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Settings size={20} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          </button>
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
              <SkillRing key={skill.label} label={skill.label} pct={skill.pct} />
            ))}
          </div>
          <Link
            href="/mobile/onboarding"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--gold-mobile)", textDecoration: "underline", alignSelf: "flex-start" }}
          >
            Retake placement assessment
          </Link>
        </div>

        {/* up-next-section — spaced-repetition review queue, not a fabricated history log */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Up Next For Review</p>
          {reviewItems.length === 0 ? (
            <div
              style={{
                padding: 16,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
                color: "var(--text-mobile-muted)",
                fontSize: 13,
              }}
            >
              You&apos;re all caught up — nothing due for review.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {reviewItems.map((item) => (
                <div
                  key={`${item.module}-${item.scenarioIndex}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-mobile)",
                    border: "1px solid var(--border-mobile)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: "var(--surface-mobile-alt)",
                      flexShrink: 0,
                    }}
                  >
                    <CalendarClock size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-mobile)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {LEGACY_MODULE_LABELS[item.module as keyof typeof LEGACY_MODULE_LABELS] ?? item.module} · Scenario {item.scenarioIndex + 1}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-mobile-muted)" }}>Due for review</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green-mobile)", flexShrink: 0 }}>{item.lastScore}/25</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}
