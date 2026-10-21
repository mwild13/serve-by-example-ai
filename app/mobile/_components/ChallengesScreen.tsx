"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Trophy } from "lucide-react";
import Screen from "./ui/Screen";
import { ProgressBar, Section } from "./ui/parts";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { CHALLENGE_ROWS, readDoneChallenges } from "../_lib/challenge-rows";
import { TOTAL_CHALLENGES } from "@/lib/challenges";

// The ten Challenges (docs/CHALLENGES.md), reached from the Practise tab.
// The count is the server's (GET /api/training/progress); the tick on each
// row is this device's ("sbe_challenges_completed"), as on desktop.

export default function ChallengesScreen() {
  const { status, data } = useTrainingProgress();
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDone(readDoneChallenges());
  }, []);

  const completed = status === "ready" ? data.challengesCompleted : done.length;
  const total = status === "ready" ? data.totalChallenges : TOTAL_CHALLENGES;

  return (
    <Screen title="Challenges" back={{ href: "/mobile/practise", label: "Practise" }} tab="practise">
      <div className="sm-learn">
        <div className="sm-card sm-card--pad sm-challenges-sum">
          <span className="sm-icon-circle" aria-hidden="true">
            <Trophy size={20} strokeWidth={2.2} />
          </span>
          <span className="sm-row-text">
            <span className="sm-card-title">
              {completed} of {total} done
            </span>
            <span className="sm-card-sub">One-minute games. Tap to play, no typing.</span>
          </span>
        </div>
        <ProgressBar value={completed} max={total} gold={completed >= total} label={`${completed} of ${total} challenges done`} />
      </div>

      <Section title="All ten">
        <div className="sm-card sm-rows">
          {CHALLENGE_ROWS.map((c) => {
            const Icon = c.icon;
            const isDone = done.includes(c.challengeIndex);
            return (
              <Link key={c.href} href={c.href} className="sm-row">
                <span className="sm-icon-circle" aria-hidden="true">
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <span className="sm-row-text">
                  <span className="sm-row-label">{c.title}</span>
                  <span className="sm-row-sub">{c.description}</span>
                </span>
                {isDone ? (
                  <span className="sm-done" aria-label="Done">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>
                ) : (
                  <ChevronRight size={20} strokeWidth={2.2} className="sm-chevron" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </Section>
    </Screen>
  );
}
