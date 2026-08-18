"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Clock,
  Lightbulb,
  Link as LinkIcon,
  ListOrdered,
  ScanSearch,
  Play,
  Check,
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useTrainingProgress } from "../_lib/use-training-progress";

// Phase C file 05 — all 5 rows now route to a real game screen.
//
// The Phase B mock's "14h 22m" countdown, "+150 XP earned today", and each
// row's "Best: N XP" / star rating had no backing data — V3 has no XP system
// anywhere (grep-confirmed) and no daily-reset mechanic for challenges. Rather
// than invent numbers for them, this screen now shows the real completion
// count from GET /api/training/progress (challengesCompleted/totalChallenges,
// same read path ProgressOverview.tsx uses on desktop) plus a per-row
// "Completed" state read from the same "sbe_challenges_completed" localStorage
// key V3 writes — device-level completion tracking, matching V3's own
// documented behavior ("Completion is tracked on this device").

type ChallengeRow = {
  title: string;
  description: string;
  icon: typeof Clock;
  href?: string;
  challengeIndex?: number;
};

const CHALLENGES: ChallengeRow[] = [
  { title: "Speed Round", description: "Speed Multiple Choice Questions", icon: Clock, href: "/mobile/speed-round", challengeIndex: 4 },
  { title: "Memory Test", description: "Fill in the blank cocktail descriptions", icon: Lightbulb, href: "/mobile/memory-test", challengeIndex: 1 },
  { title: "Ingredient Match", description: "Pair custom ingredients with names", icon: LinkIcon, href: "/mobile/match-pairs", challengeIndex: 2 },
  { title: "Recipe Order", description: "Sequence sorting cocktail building process", icon: ListOrdered, href: "/mobile/recipe-order", challengeIndex: 0 },
  { title: "Menu Audit", description: "Spot the errors in seasonal menu listings", icon: ScanSearch, href: "/mobile/menu-audit", challengeIndex: 3 },
];

export default function ChallengesScreen() {
  const { status, data } = useTrainingProgress();
  const [completedLocal, setCompletedLocal] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sbe_challenges_completed");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setCompletedLocal(new Set(JSON.parse(stored) as number[]));
    } catch {
      /* ignore */
    }
  }, []);

  const completedCount = status === "ready" ? data.challengesCompleted : completedLocal.size;
  const totalCount = status === "ready" ? data.totalChallenges : 5;

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
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>Daily Challenges</p>
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

        {/* completion-summary */}
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
              <Trophy size={24} strokeWidth={2} color="var(--green-mobile)" aria-hidden="true" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>
                {completedCount} of {totalCount} completed
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
                Interactive mini-games — tap-based, no typing required
              </p>
            </div>
          </div>
        </div>

        {/* challenges-list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Active Mini-Games</p>
          {CHALLENGES.map((challenge) => {
            const Icon = challenge.icon;
            const isCompleted = challenge.challengeIndex !== undefined && completedLocal.has(challenge.challengeIndex);
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
                  {isCompleted && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green-mobile)" }}>Completed</span>
                  )}
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
                      background: isCompleted ? "var(--green-mobile)" : "var(--gold-mobile)",
                      flexShrink: 0,
                    }}
                    aria-label={isCompleted ? `Replay ${challenge.title}` : `Play ${challenge.title}`}
                  >
                    {isCompleted ? (
                      <Check size={14} strokeWidth={2.5} color="var(--bg-mobile-dark)" aria-hidden="true" />
                    ) : (
                      <Play size={12} strokeWidth={2} color="var(--bg-mobile-dark)" fill="var(--bg-mobile-dark)" aria-hidden="true" />
                    )}
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
