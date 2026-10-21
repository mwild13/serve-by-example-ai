"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Timer, Gamepad2 } from "lucide-react";
import Screen from "./ui/Screen";
import { Avatar, ButtonLink, Pill, ProgressBar, Row, RowList, Section, StackCard } from "./ui/parts";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { useShiftStreak } from "../_lib/use-staff";
import { CHALLENGE_ROWS, readDoneChallenges, type ChallengeRow } from "../_lib/challenge-rows";
import { TOTAL_CHALLENGES } from "@/lib/challenges";
import { pickTodaysChallenge } from "@/lib/challenge-content";

// The Practise tab (docs/STAFF_MOBILE_REDESIGN_PLAN.md, phases 0 and 5):
// everything that sharpens what's been learnt without changing mastery.
// The mixed drill is the hero; today's challenge (the desktop's pick,
// pickTodaysChallenge()) comes next; Live Guest and Saturday Rush play a
// shift out; the challenges show how many of the ten are done.

export default function PractiseScreen() {
  const session = useMobileSession();
  const streak = useShiftStreak();
  const { status, data } = useTrainingProgress();

  const done = status === "ready" ? data.challengesCompleted : 0;
  const total = status === "ready" ? data.totalChallenges : TOTAL_CHALLENGES;

  // Read on the client: the day and this device's done list.
  const [today, setToday] = useState<{ row: ChallengeRow; doneBefore: boolean } | null>(null);
  useEffect(() => {
    const doneList = readDoneChallenges();
    const pick = pickTodaysChallenge(doneList, new Date());
    const row = CHALLENGE_ROWS.find((c) => c.challengeIndex === pick.index);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (row) setToday({ row, doneBefore: doneList.includes(pick.index) });
  }, []);

  return (
    <Screen
      title="Practise"
      tab="practise"
      trailing={<Avatar name={session.displayName} photoUrl={session.profilePhotoUrl} streak={streak && streak.count > 0 ? streak.count : null} />}
      compactTrailing={<Avatar name={session.displayName} photoUrl={session.profilePhotoUrl} streak={streak && streak.count > 0 ? streak.count : null} small />}
    >
      <div style={{ padding: "20px var(--sm-gutter) 0" }}>
        <StackCard
          label="Ten questions"
          title="Mixed drill"
          body="Every module you've started, mixed together at full difficulty. Practice only: it never changes your mastery."
        >
          <ButtonLink href="/mobile/drill" variant="hero">
            Start drill
            <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
          </ButtonLink>
        </StackCard>
      </div>

      <Section title="Today's challenge">
        {today ? (
          <Link href={today.row.href} className="sm-card sm-card--active sm-keep">
            <span className="sm-icon-circle" aria-hidden="true">
              <today.row.icon size={20} strokeWidth={2.2} />
            </span>
            <span className="sm-row-text">
              <span className="sm-card-title">{today.row.title}</span>
              <span className="sm-card-sub">
                {today.row.description}
                {today.doneBefore ? ". Done before" : ""}
              </span>
            </span>
            <span className="sm-resume">Play</span>
          </Link>
        ) : (
          <div className="sm-skel" style={{ height: 78 }} aria-hidden="true" />
        )}
      </Section>

      <Section title="Play out a shift">
        <RowList>
          <Row href="/mobile/live-guest" icon={MessageCircle} label="Live Guest" sub="Talk to a guest who talks back" />
          <Row href="/mobile/rush" icon={Timer} label="Saturday Rush" sub="Twelve calls on a busy night, against the clock" />
        </RowList>
      </Section>

      <Section title="Challenges" link={{ href: "/mobile/challenges", label: "See all" }}>
        <RowList>
          <Row
            href="/mobile/challenges"
            icon={Gamepad2}
            label="Ten quick games"
            sub="Bar, service and safety"
            end={<Pill tone={done > 0 ? "gold" : undefined}>{done} of {total}</Pill>}
          />
          <div style={{ padding: "0 14px 16px" }}>
            <ProgressBar value={done} max={total} label={`${done} of ${total} challenges done`} />
          </div>
        </RowList>
      </Section>
    </Screen>
  );
}
