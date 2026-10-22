"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, ChevronRight, CircleHelp, Settings } from "lucide-react";
import Screen from "./ui/Screen";
import { AvatarFace, Card, ProgressBar, Row, RowList, Section } from "./ui/parts";
import { FlameIcon } from "./ui/icons";
import AiCoachWidget from "./progress/AiCoachWidget";
import SignOutGroup from "./SignOutGroup";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { useGetToken } from "../_lib/use-staff";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadModules, loadRushStats, loadShiftStreak } from "@/lib/staff-data";
import { isMastered, isStarted } from "@/lib/next-step";
import { badgeProgressText, badgesFromProgress, nextBadge, readVisitStreak } from "@/lib/badges";
import { tierDisplayName } from "@/lib/session";

// The Me tab (docs/STAFF_MOBILE_REDESIGN_PLAN.md, phase 6), the phone
// version of the staff desktop's My progress (MyProgressPage.tsx): who you
// are, four figures, mastery by area, the next badge, then Settings and
// help. The AI Coach floats above the tab bar. Styles: the sm-me rules in
// app/styles/staff.css.

const AREAS: { id: "technical" | "service" | "compliance"; label: string }[] = [
  { id: "technical", label: "Behind the bar" },
  { id: "service", label: "Service and sales" },
  { id: "compliance", label: "Safety and compliance" },
];

export default function ProgressScreen() {
  const session = useMobileSession();
  const getToken = useGetToken();
  const { data: progress } = useTrainingProgress();
  const { data: modules } = useStaffData(STAFF_KEYS.modules, loadModules, getToken);
  const { data: streak } = useStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken);
  const { data: rush } = useStaffData(STAFF_KEYS.rush, loadRushStats, getToken);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    // Browser-only read on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisits(readVisitStreak());
  }, []);

  const all = useMemo(() => modules ?? [], [modules]);
  const total = all.length || 40;
  const mastered = all.filter(isMastered).length;
  const going = all.filter((m) => isStarted(m) && !isMastered(m)).length;

  const badges = useMemo(() => (progress ? badgesFromProgress(progress, visits) : []), [progress, visits]);
  const earned = badges.filter((b) => b.earned).length;
  const next = nextBadge(badges);

  const plan = `${tierDisplayName(session.tier)} plan`;
  const team = session.hasVenueMembership ? (session.venueMembershipPaused ? "Venue access paused" : "On a venue team") : null;

  return (
    <Screen title="Me" tab="me">
      <div className="sm-me">
        <Link href="/mobile/ai-photo" className="sm-card sm-me-profile">
          <AvatarFace name={session.displayName} photoUrl={session.profilePhotoUrl} size={64} className="sm-me-face" />
          <span className="sm-row-text">
            <span className="sm-me-name">{session.displayName}</span>
            <span className="sm-row-sub">{team ? `${plan}. ${team}` : plan}</span>
            <span className="sm-me-photo">{session.profilePhotoUrl ? "Change photo" : "Add a photo"}</span>
          </span>
          <ChevronRight className="sm-chevron" size={20} strokeWidth={2.6} aria-hidden="true" />
        </Link>

        {!modules ? (
          <div className="sm-me-stats" aria-label="Loading">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sm-skel" style={{ height: 118 }} />
            ))}
          </div>
        ) : (
          <div className="sm-me-stats">
            <Stat label="Mastered" figure={mastered} of={`of ${total}`} note={going > 0 ? `${going} on the go` : "Pass a quiz to master one"}>
              <ProgressBar value={mastered} max={total} label={`${mastered} of ${total} modules mastered`} />
            </Stat>
            <Stat
              label="Shift streak"
              figure={streak?.count ?? 0}
              of={streak?.count === 1 ? "shift" : "shifts"}
              note={streak ? `${streak.freezesLeft} ${streak.freezesLeft === 1 ? "freeze" : "freezes"} left` : "Starts with a pre-shift drill"}
              gold={(streak?.count ?? 0) > 0}
            />
            <Stat
              label="Guests sorted"
              figure={progress?.arenaModuleCount ?? 0}
              of="in Live Guest"
              note={rush?.best != null ? `Saturday Rush best: ${rush.best}` : "Rush not played yet"}
            />
            <Stat
              label="Challenges"
              figure={progress?.challengesCompleted ?? 0}
              of={`of ${progress?.totalChallenges ?? 10}`}
              note="Quick games on Practise"
            >
              <ProgressBar
                value={progress?.challengesCompleted ?? 0}
                max={progress?.totalChallenges ?? 10}
                label={`${progress?.challengesCompleted ?? 0} challenges done`}
              />
            </Stat>
          </div>
        )}
      </div>

      {all.length > 0 && (
        <Section title="Mastery by area" link={{ href: "/mobile/learn", label: "Modules" }}>
          <RowList>
            {AREAS.map((area) => {
              const list = all.filter((m) => m.category === area.id);
              const done = list.filter(isMastered).length;
              return (
                <div key={area.id} className="sm-row sm-me-area">
                  <span className="sm-row-text">
                    <span className="sm-me-area-head">
                      <span className="sm-row-label">{area.label}</span>
                      <span className="sm-figure">
                        {done}
                        <span className="sm-figure-of"> of {list.length}</span>
                      </span>
                    </span>
                    <ProgressBar value={done} max={list.length} label={`${area.label}: ${done} of ${list.length} mastered`} />
                  </span>
                </div>
              );
            })}
          </RowList>
        </Section>
      )}

      {progress && (
        <Section title="Badges" note={`${earned} of ${badges.length} earned`}>
          {next && (
            <Card>
              <p className="sm-kicker">Next to earn</p>
              <p className="sm-card-title sm-me-badge-title">{next.label}</p>
              <p className="sm-card-sub">{next.description}</p>
              {next.progress && (
                <>
                  <ProgressBar value={next.progress.current} max={next.progress.required} label={badgeProgressText(next.progress)} gold />
                  <p className="sm-me-badge-progress">{badgeProgressText(next.progress)}</p>
                </>
              )}
            </Card>
          )}
          <RowList>
            <Row href="/mobile/badges" icon={Award} label="All badges" sub={earned > 0 ? `${earned} earned so far` : "See what you can earn"} />
          </RowList>
        </Section>
      )}

      <Section title="You">
        <RowList>
          <Row href="/mobile/settings" icon={Settings} label="Settings" sub="Account, reminders, appearance" />
          <Row href="/mobile/help?from=me" icon={CircleHelp} label="Help and support" sub="How the app works, report a problem" />
        </RowList>
      </Section>

      <SignOutGroup />

      {/* Keeps the last row clear of the AI Coach button. */}
      <div className="sm-me-foot" aria-hidden="true" />
      <AiCoachWidget />
    </Screen>
  );
}

function Stat({
  label,
  figure,
  of,
  note,
  gold,
  children,
}: {
  label: string;
  figure: number;
  of: string;
  note: string;
  gold?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="sm-card sm-me-stat" aria-label={label}>
      <p className="sm-kicker">{label}</p>
      <p className="sm-me-stat-figure">
        {gold && <FlameIcon size={22} />}
        {figure}
        <span className="sm-figure-of"> {of}</span>
      </p>
      {children}
      <p className="sm-me-stat-note">{note}</p>
    </section>
  );
}
