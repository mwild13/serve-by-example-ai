"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, BookOpenText, KeyRound, Martini } from "lucide-react";
import Screen from "./ui/Screen";
import {
  Avatar,
  ButtonLink,
  Card,
  Pill,
  PhotoCard,
  ProgressRing,
  Row,
  RowList,
  Section,
  ShiftDots,
  StackCard,
} from "./ui/parts";
import NotificationOptInCard from "./NotificationOptInCard";
import VenueWeek from "./home/VenueWeek";
import InstallBanner from "./home/InstallBanner";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { useGetToken } from "../_lib/use-staff";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadModules, loadShiftStreak } from "@/lib/staff-data";
import { pickNextSteps, type NextStep } from "@/lib/next-step";
import { copyFor } from "@/lib/next-step-copy";
import { homeClock, homeHero, keepGoingModule, moduleHref, stepHref } from "@/lib/home-feed";
import { isB2BTier } from "@/lib/session";
import { COCKTAILS, COCKTAIL_IMAGES, cocktailSlug } from "@/lib/cocktails";
import { KB_CATEGORIES, KB_ENTRIES } from "@/lib/knowledge-base";
import { streakLine } from "@/components/quiz/ShiftDays";

// Mobile Home (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md section 3): a feed led by
// one stack card. The card is the staff desktop's next step
// (pickNextSteps(), lib/next-step.ts), so both surfaces offer the same
// thing; once today's pre-shift drill is done it turns into "Ready for
// tonight" (homeHero(), lib/home-feed.ts). Below it: the venue's week, the
// module to keep going with, tonight's cocktails, the reference library and
// a fact. Data comes from the shared staff cache, so a return visit paints at
// once.

const AREA: Record<string, string> = {
  technical: "Behind the bar",
  service: "Service and sales",
  compliance: "Safety and compliance",
};

export default function HomeScreen() {
  const session = useMobileSession();
  const getToken = useGetToken();
  const { data: progress } = useTrainingProgress();
  const { data: modules, failed: modulesFailed } = useStaffData(STAFF_KEYS.modules, loadModules, getToken);
  const { data: streak, failed: streakFailed } = useStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken);

  // The clock is read once on the client, so the server and browser agree.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);
  const clock = now ? homeClock(now) : null;
  const weekday = clock?.weekday ?? 1;

  const hasModuleAccess = session.allowedModules.length > 0;
  const liveGuestOpen = isB2BTier(session.tier) || session.hasVenueMembership;
  const reviewDue = progress?.reviewQueue.length ?? 0;
  const ready = (modules !== undefined || modulesFailed) && (streak !== undefined || streakFailed) && clock !== null;

  const [step, alt] = useMemo(
    () => pickNextSteps({ hasModuleAccess, modules: modules ?? [], streak: streak ?? null, weekday, reviewDue, liveGuestOpen }),
    [hasModuleAccess, modules, streak, weekday, reviewDue, liveGuestOpen],
  );
  const hero = homeHero({ hasModuleAccess, streak: streak ?? null, weekday, step, alt });
  const heroStep: NextStep | null = hero.kind === "step" ? hero.step : hero.next;
  const keepGoing = keepGoingModule(modules ?? [], heroStep);

  // Tonight's cocktails and fact, the same for everyone each day, as on the
  // staff desktop's Today (the first cocktail is its cocktail of the day).
  const dayIdx = now ? Math.floor(now.getTime() / 86_400_000) : 0;
  const cocktails = [0, 1, 2].map((i) => COCKTAILS[(dayIdx * 2 + i) % COCKTAILS.length]);
  const fact = KB_ENTRIES[(dayIdx * 7) % KB_ENTRIES.length];

  const firstName = session.displayName.trim().split(/\s+/)[0] || "there";
  // The gold chip is a reward: shown once there's a streak, never as a gold 0.
  const streakChip = hasModuleAccess && streak && streak.count > 0 ? streak.count : null;
  const avatar = (small: boolean) => (
    <Avatar name={session.displayName} photoUrl={session.profilePhotoUrl} streak={streakChip} small={small} />
  );

  return (
    <Screen
      title={clock ? `${clock.greeting}, ${firstName}` : `Hi, ${firstName}`}
      compactTitle="Home"
      kicker={clock?.date ?? " "}
      tab="home"
      trailing={avatar(false)}
      compactTrailing={avatar(true)}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px var(--sm-gutter) 0" }}>
        <InstallBanner />
        {!ready ? (
          <div className="sm-skel" style={{ height: 238, borderRadius: 22 }} aria-label="Loading" />
        ) : hero.kind === "ready" ? (
          <StackCard label="Before your shift" labelEnd="Done" title="Ready for tonight" body={streak ? `${streakLine(streak)}.` : ""}>
            {streak && <ShiftDots shiftDays={streak.shiftDays} weekDone={streak.weekDone ?? [weekday]} weekday={weekday} />}
            {hero.next && (
              <ButtonLink href={stepHref(hero.next)} variant="hero">
                {copyFor(hero.next, reviewDue).cta}
                <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
              </ButtonLink>
            )}
          </StackCard>
        ) : (
          <HeroStep step={hero.step} reviewDue={reviewDue} streak={streak ?? null} weekday={weekday} />
        )}
      </div>

      <NotificationOptInCard token={session.token} />

      <VenueWeek getToken={getToken} />

      {keepGoing && (
        <Section title="Keep going">
          <Link href={moduleHref(keepGoing)} className="sm-card sm-card--active sm-keep">
            <ProgressRing
              value={progress?.moduleProgress[keepGoing.id]?.mastery ?? 0}
              label={`${progress?.moduleProgress[keepGoing.id]?.mastery ?? 0} percent mastered`}
            />
            <span className="sm-row-text">
              <span className="sm-card-title">{keepGoing.title}</span>
              <span className="sm-card-sub">
                {AREA[keepGoing.category] ?? "Module"}. Level {keepGoing.difficulty_level}
              </span>
            </span>
            <span className="sm-resume">Resume</span>
          </Link>
        </Section>
      )}

      <Section title="For the bar tonight" link={{ href: "/mobile/cocktails?from=home", label: `All ${COCKTAILS.length}` }}>
        {/* Only once the date is known: swapping the cocktails after the
            first paint made the snap row jump to keep its first card. */}
        <div className="sm-carousel">
          {!now && [0, 1, 2].map((i) => <div key={i} className="sm-photo sm-skel" aria-hidden="true" />)}
          {now && cocktails.map((c, i) => (
            <PhotoCard
              key={c.name}
              href={`/mobile/cocktails?from=home&cocktail_id=${cocktailSlug(c.name)}`}
              src={COCKTAIL_IMAGES[c.name] ?? "/mobile/thumb-cocktail.webp"}
              title={c.name}
              sub={c.glass}
              tag={i === 0 ? "Cocktail of the day" : undefined}
            />
          ))}
        </div>
      </Section>

      {!hasModuleAccess && !session.hasVenueMembership && (
        <Section title="Have a venue code?">
          <RowList>
            <Row href="/mobile/settings" icon={KeyRound} label="Join your venue" sub="Your manager's code opens your training" />
          </RowList>
        </Section>
      )}

      <Section title="Look it up">
        <RowList>
          <Row href="/mobile/cocktails?from=home" icon={Martini} label="Cocktail library" end={<Pill>{COCKTAILS.length}</Pill>} />
          <Row href="/mobile/knowledge?from=home" icon={BookOpenText} label="Knowledge base" end={<Pill>{KB_ENTRIES.length}</Pill>} />
          <Row href="/mobile/badges" icon={Award} label="Badges" />
        </RowList>
      </Section>

      <Section title="A fact for the bar">
        {now ? (
          <Card>
            <div className="sm-fact">
              <p className="sm-kicker">{KB_CATEGORIES[fact.category].label}</p>
              <p className="sm-card-title">{fact.title}</p>
              <p className="sm-fact-body">{fact.keyFacts[0]}</p>
            </div>
          </Card>
        ) : (
          <div className="sm-skel" style={{ height: 112 }} aria-hidden="true" />
        )}
      </Section>
    </Screen>
  );
}

function HeroStep({
  step,
  reviewDue,
  streak,
  weekday,
}: {
  step: NextStep;
  reviewDue: number;
  streak: { shiftDays: number[]; weekDone?: number[] } | null;
  weekday: number;
}) {
  const copy = copyFor(step, reviewDue);
  const preshift = step.kind === "preshift";
  return (
    <StackCard label={copy.kicker} labelEnd={preshift ? "Shift tonight" : undefined} title={copy.title} body={copy.body}>
      {preshift && streak && <ShiftDots shiftDays={streak.shiftDays} weekDone={streak.weekDone ?? []} weekday={weekday} />}
      <ButtonLink href={stepHref(step)} variant="hero">
        {copy.cta}
        <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
      </ButtonLink>
    </StackCard>
  );
}
