"use client";

import { useEffect, useMemo, useState } from "react";
import { ThumbsUp, Award, CircleCheck, CircleHelp } from "lucide-react";
import BottomNav from "./BottomNav";
import { useTrainingProgress } from "../_lib/use-training-progress";
import {
  computeBadges,
  countEarned,
  type Badge,
  type ModuleSummaryForBadges,
  type CategoryScores,
} from "@/lib/badges";

// Phase C file 07 — Badges & Achievements. Badges are computed client-side
// via lib/badges.ts::computeBadges(), the same pure function V3 desktop uses
// (BadgesView.tsx) — never persisted as "unlocked" rows in the DB. See
// v4-migration-plan/07-badges-and-achievements.md.
//
// Two distinct "streak" inputs, per the plan's own warning — do not conflate:
//   - `streak` (arg #3): client-only daily-login streak, localStorage["sbe-streak-count"].
//   - `bestStreak` (arg #4, Pro badge) + `sbeElite` (arg #5): server data from
//     /api/training/progress's `bestCorrectStreak`/`sbeEliteNumber` fields.
//
// The Phase B mock's "14/52 earned" header and its 9 static tiles had no
// backing data (there is no 52-badge catalog anywhere in V3 — the real total
// is 17: 12 category badges + 3 streak badges + 2 specials). The mock's
// "Your personal best is 28 days" streak-banner line is also dropped — V3
// only ever stores the *current* daily-login streak count in localStorage,
// never a personal-best; nothing to source that number from (same
// "don't fabricate a data source that doesn't exist" call made in files
// 02/04/05).
//
// Category pills: the Phase B mock's ["All", "Learning", "Challenges",
// "Streaks"] didn't map to any real badge category. Replaced with the 5 real
// categories lib/badges.ts actually produces (technical/service/compliance/
// streak/special), plus "All" — 6 pills instead of the plan's illustrative
// "4", because forcing the real taxonomy into 4 buckets would just reinvent
// the same mismatch this file exists to fix.

type CategoryFilter = "all" | Badge["category"];

const CATEGORY_PILLS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "technical", label: "Technical" },
  { key: "service", label: "Service" },
  { key: "compliance", label: "Compliance" },
  { key: "streak", label: "Streaks" },
  { key: "special", label: "Special" },
];

function readStreakCount(): number {
  try {
    const count = parseInt(localStorage.getItem("sbe-streak-count") ?? "0", 10);
    return isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
}

function BadgeIcon({ badge }: { badge: Badge }) {
  if (badge.earned) return <Award size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />;
  if (badge.progress && badge.progress.current > 0) {
    return <CircleHelp size={20} strokeWidth={2} color="var(--text-mobile-muted)" opacity={0.7} aria-hidden="true" />;
  }
  return <CircleCheck size={20} strokeWidth={2} color="var(--text-mobile-muted)" opacity={0.4} aria-hidden="true" />;
}

function BadgeRing({ badge }: { badge: Badge }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = badge.earned
    ? 100
    : badge.progress
      ? Math.max(0, Math.min(100, Math.round((badge.progress.current / badge.progress.required) * 100)))
      : 0;
  const offset = (1 - pct / 100) * circ;
  const ringColor = badge.earned ? "var(--gold-mobile)" : "var(--text-mobile-muted)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        flex: "1 1 calc(33.333% - 8px)",
        minWidth: 96,
        padding: 12,
        borderRadius: "var(--radius-md)",
        background: "var(--surface-mobile)",
        border: "1px solid var(--border-mobile)",
      }}
      title={badge.description}
    >
      <div style={{ position: "relative", width: 52, height: 52 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r={r} fill="none" stroke="var(--surface-mobile-alt)" strokeWidth="3" />
          <circle
            cx="26" cy="26" r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 26 26)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BadgeIcon badge={badge} />
        </div>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          color: badge.earned ? "var(--text-mobile)" : "var(--text-mobile-muted)",
        }}
      >
        {badge.label}
      </p>
      {!badge.earned && badge.progress && (
        <p style={{ margin: 0, fontSize: 10, color: "var(--text-mobile-muted)", textAlign: "center" }}>
          {badge.progress.current}/{badge.progress.required} {badge.progress.unit}
        </p>
      )}
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

export default function BadgesGalleryScreen() {
  const { status, data, error, refetch } = useTrainingProgress();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  // Mount-only client read, mirrors BadgeStreakSection.tsx's identical
  // SSR-safe pattern on desktop — daily-login streak lives in localStorage
  // only, never on the server, so it starts null (skeleton) to avoid a
  // hydration mismatch and resolves right after mount.
  const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(readStreakCount());
  }, []);

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

  const badges = useMemo(() => {
    if (!data || streak === null) return [];
    const modules: ModuleSummaryForBadges[] = data.allModules.map((m) => {
      const p = data.moduleProgress[m.id];
      return {
        category: m.category,
        mastered: (p?.mastery ?? 0) >= 80,
        attempted: (p?.scenariosAttempted ?? 0) > 0,
      };
    });
    const scores: CategoryScores = data.mastery;
    return computeBadges(modules, scores, streak, data.bestCorrectStreak, data.sbeEliteNumber);
  }, [data, streak]);

  if (status === "loading" || (data && streak === null)) {
    return (
      <div style={shellStyle}>
        <StatusMessage>Loading your badges…</StatusMessage>
        <BottomNav active="me" />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div style={shellStyle}>
        <StatusMessage>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <span>{error ?? "Failed to load badges."}</span>
            <button
              type="button"
              onClick={refetch}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--gold-mobile)",
                background: "none",
                color: "var(--gold-mobile)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </StatusMessage>
        <BottomNav active="me" />
      </div>
    );
  }

  const earnedCount = countEarned(badges);
  const filtered = activeCategory === "all" ? badges : badges.filter((b) => b.category === activeCategory);

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* page-title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>My Achievements</p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--gold-mobile)" }}>
            {earnedCount}/{badges.length} earned
          </p>
        </div>

        {/* streak-banner — current daily-login streak only; V3 has no
           persisted "personal best" streak figure to show alongside it. */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--green-mobile-bg)",
              border: "1px solid var(--green-mobile)",
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
                background: "var(--green-mobile)",
                flexShrink: 0,
              }}
            >
              <ThumbsUp size={20} strokeWidth={2} color="var(--text-mobile)" fill="var(--text-mobile)" aria-hidden="true" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>
                Active Streak: {streak} Day{streak === 1 ? "" : "s"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                Train daily to keep it going.
              </p>
            </div>
          </div>
        </div>

        {/* filter */}
        <div style={{ display: "flex", gap: 8, padding: "0 0 20px 20px", overflowX: "auto" }}>
          {CATEGORY_PILLS.map(({ key, label }) => {
            const isActive = key === activeCategory;
            const count = key === "all" ? badges.length : badges.filter((b) => b.category === key).length;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(key)}
                style={{
                  flexShrink: 0,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-pill)",
                  border: isActive ? "1px solid var(--gold-mobile)" : "1px solid var(--border-mobile)",
                  background: isActive ? "var(--gold-mobile)" : "var(--surface-mobile)",
                  color: isActive ? "var(--bg-mobile-dark)" : "var(--text-mobile)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* badge-grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "0 20px 20px" }}>
          {filtered.length > 0 ? (
            filtered.map((badge) => <BadgeRing key={badge.id} badge={badge} />)
          ) : (
            <div style={{ width: "100%", padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--text-mobile-muted)" }}>
              No badges in this category yet.
            </div>
          )}
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}
