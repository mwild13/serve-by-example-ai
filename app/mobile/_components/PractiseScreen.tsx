"use client";

import { ArrowRight, MessageCircle, Timer, Gamepad2 } from "lucide-react";
import Screen from "./ui/Screen";
import { Avatar, ButtonLink, Pill, ProgressBar, Row, RowList, Section, StackCard } from "./ui/parts";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { useShiftStreak } from "../_lib/use-staff";
import { TOTAL_CHALLENGES } from "@/lib/challenges";

// The Practise tab (docs/STAFF_MOBILE_REDESIGN_PLAN.md, phases 0 and 5):
// everything that sharpens what's been learnt without changing mastery.
// The mixed drill is the hero; Live Guest and Saturday Rush play a shift
// out; the challenges show how many of the ten are done.

export default function PractiseScreen() {
  const session = useMobileSession();
  const streak = useShiftStreak();
  const { status, data } = useTrainingProgress();

  const done = status === "ready" ? data.challengesCompleted : 0;
  const total = status === "ready" ? data.totalChallenges : TOTAL_CHALLENGES;

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
            sub="Cocktails, ingredients and menus"
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
