"use client";

import Link from "next/link";
import {
  AlarmClock,
  Flame,
  Clock,
  Lightbulb,
  Link as LinkIcon,
  ListOrdered,
  ScanSearch,
  Star,
  Play,
} from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B.5 — "Ingredient Match" routes to the Match Pairs game (the only
// challenge with a built screen). The other 4 play buttons stay inert — no
// dedicated game screen exists for them yet.

type ChallengeCard = {
  title: string;
  description: string;
  bestXp: number;
  stars: number; // out of 3, matches the Figma "stars" row
  icon: typeof Clock;
  href?: string;
};

const CHALLENGES: ChallengeCard[] = [
  { title: "Speed Round", description: "Speed Multiple Choice Questions", bestXp: 420, stars: 3, icon: Clock },
  { title: "Memory Test", description: "Fill in the blank cocktail descriptions", bestXp: 350, stars: 2, icon: Lightbulb },
  { title: "Ingredient Match", description: "Pair custom ingredients with names", bestXp: 300, stars: 3, icon: LinkIcon, href: "/mobile/match-pairs" },
  { title: "Recipe Order", description: "Sequence sorting cocktail building process", bestXp: 450, stars: 1, icon: ListOrdered },
  { title: "Menu Audit", description: "Spot the errors in seasonal menu listings", bestXp: 500, stars: 0, icon: ScanSearch },
];

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }} aria-label={`${count} of 3 stars`}>
      {Array.from({ length: 3 }, (_, i) => (
        <Star
          key={i}
          size={10}
          strokeWidth={2}
          color="var(--gold-mobile)"
          fill={i < count ? "var(--gold-mobile)" : "none"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ChallengesScreen() {
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
        {/* header-timer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>Daily Challenges</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              flexShrink: 0,
            }}
          >
            <AlarmClock size={14} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)" }}>14h 22m</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile-inverse)",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <span style={{ color: "var(--green-mobile)" }}>S</span>
            <span style={{ color: "var(--gold-mobile)" }}>B</span>
            <span style={{ color: "var(--green-mobile)" }}>E</span>
          </div>
        </div>

        {/* streak-xp-banner */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 54,
                height: 54,
                borderRadius: "var(--radius-pill)",
                background: "var(--green-mobile-bg)",
                flexShrink: 0,
              }}
            >
              <Flame size={24} strokeWidth={2} color="var(--green-mobile)" aria-hidden="true" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Active Streak &bull; 12 Days</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>+150 XP earned today</p>
            </div>
          </div>
        </div>

        {/* challenges-list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Active Mini-Games</p>
          {CHALLENGES.map((challenge) => {
            const Icon = challenge.icon;
            return (
              <div
                key={challenge.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-mobile-alt)",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-mobile)" }}>{challenge.title}</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "var(--text-mobile-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {challenge.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StarRating count={challenge.stars} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--gold-mobile)" }}>Best: {challenge.bestXp} XP</span>
                  </div>
                </div>
                {challenge.href ? (
                  <Link
                    href={challenge.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-pill)",
                      background: "var(--gold-mobile)",
                      flexShrink: 0,
                    }}
                    aria-label={`Play ${challenge.title}`}
                  >
                    <Play size={12} strokeWidth={2} color="var(--bg-mobile-dark)" fill="var(--bg-mobile-dark)" aria-hidden="true" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-pill)",
                      background: "var(--gold-mobile)",
                      border: "none",
                      flexShrink: 0,
                      opacity: 0.5,
                      cursor: "default",
                    }}
                    aria-label={`Play ${challenge.title} (coming soon)`}
                  >
                    <Play size={12} strokeWidth={2} color="var(--bg-mobile-dark)" fill="var(--bg-mobile-dark)" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
