"use client";

import { MessageCircle } from "lucide-react";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadTeamWeek } from "@/lib/staff-data";
import { GOAL_LABEL } from "@/lib/team-week-shared";
import { Card, Pill, ProgressBar, Row, RowList, Section } from "../ui/parts";

// This week at the venue on mobile Home (Rich update, Phase 16): the team
// goal the manager set, and the guest of the week as a row into Live Guest.
// Team totals only, never who. Hidden until the manager sets something. The
// staff desktop shows the same data in components/team/TeamWeekCard.tsx.

export default function VenueWeek({ getToken }: { getToken: () => Promise<string> }) {
  const { data: week } = useStaffData(STAFF_KEYS.teamWeek, loadTeamWeek, getToken);
  if (!week || (!week.goal && !week.guest)) return null;
  const { goal, guest } = week;
  const reached = !!goal && goal.progress >= goal.target;

  return (
    <Section title={`This week at ${week.venueName}`}>
      {goal && (
        <Card>
          <div className="sm-card-head">
            <p className="sm-card-title">Team goal</p>
            {reached ? (
              <Pill tone="gold">Goal reached</Pill>
            ) : (
              <span className="sm-figure">
                {goal.progress.toLocaleString("en-AU")} <span className="sm-figure-of">/ {goal.target.toLocaleString("en-AU")}</span>
              </span>
            )}
          </div>
          <p className="sm-card-sub">{GOAL_LABEL[goal.kind].many[0].toUpperCase() + GOAL_LABEL[goal.kind].many.slice(1)} between us by Sunday</p>
          <ProgressBar
            value={goal.progress}
            max={goal.target}
            gold={reached}
            label={`${goal.progress} of ${goal.target} ${GOAL_LABEL[goal.kind].many}`}
          />
        </Card>
      )}
      {guest && (
        <RowList>
          <Row
            href="/mobile/live-guest"
            icon={MessageCircle}
            iconCircle
            label="Guest of the week"
            sub={`${guest.title}. ${guest.sorted > 0 ? `${guest.sorted} of the team sorted` : "Be the first to sort it"}`}
          />
        </RowList>
      )}
    </Section>
  );
}
