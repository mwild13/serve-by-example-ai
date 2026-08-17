"use client";

import { useState } from "react";
import {
  ThumbsUp,
  Award,
  Zap,
  Calendar,
  BottleWine,
  Timer,
  Check,
  type LucideIcon,
} from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B.5 — dumb UI, with one deliberate deviation from Figma: badge tiles
// use a dark-adapted progress ring (same stroke-dasharray technique as
// ProgressScreen's SkillRing / BadgeProgressRing.tsx) instead of Figma's flat
// icon chips, per the brief. Category tabs hold local selection state; actual
// filtering is Phase C.

const CATEGORIES = ["All", "Learning", "Challenges", "Streaks"];

type Badge = {
  title: string;
  icon: LucideIcon;
  earned: boolean;
  pct: number; // 100 for earned badges, partial for in-progress/locked ones
};

const BADGES: Badge[] = [
  { title: "Cocktail Novice", icon: Award, earned: true, pct: 100 },
  { title: "Quiz Master", icon: Zap, earned: true, pct: 100 },
  { title: "Week Warrior", icon: Calendar, earned: true, pct: 100 },
  { title: "Spirit Expert", icon: BottleWine, earned: true, pct: 100 },
  { title: "Speed Demon", icon: Timer, earned: true, pct: 100 },
  { title: "Perfect 100", icon: Check, earned: true, pct: 100 },
  { title: "Locked Badge", icon: Award, earned: false, pct: 80 },
  { title: "Locked Badge", icon: Award, earned: false, pct: 40 },
  { title: "Locked Badge", icon: Award, earned: false, pct: 10 },
];

function BadgeRing({ badge }: { badge: Badge }) {
  const Icon = badge.icon;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = (1 - badge.pct / 100) * circ;
  const ringColor = badge.earned ? "var(--gold-mobile)" : "var(--text-mobile-muted)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        flex: 1,
        minWidth: 0,
        padding: 12,
        borderRadius: "var(--radius-md)",
        background: "var(--surface-mobile)",
        border: "1px solid var(--border-mobile)",
      }}
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            size={20}
            strokeWidth={2}
            color={badge.earned ? "var(--gold-mobile)" : "var(--text-mobile-muted)"}
            opacity={badge.earned ? 1 : 0.5}
            aria-hidden="true"
          />
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
        {badge.earned ? badge.title : `${badge.pct}%`}
      </p>
    </div>
  );
}

export default function BadgesGalleryScreen() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

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
        {/* page-title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>My Achievements</p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--gold-mobile)" }}>14/52 earned</p>
        </div>

        {/* streak-banner */}
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
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Active Streak: 12 Days</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Your personal best is 28 days. Keep it up!</p>
            </div>
          </div>
        </div>

        {/* filter */}
        <div style={{ display: "flex", gap: 8, padding: "0 0 20px 20px", overflowX: "auto" }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(cat)}
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
                {cat}
              </button>
            );
          })}
        </div>

        {/* badge-grid — 3x3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          {[BADGES.slice(0, 3), BADGES.slice(3, 6), BADGES.slice(6, 9)].map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 12, width: "100%" }}>
              {row.map((badge, j) => (
                <BadgeRing key={`${badge.title}-${i}-${j}`} badge={badge} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}
