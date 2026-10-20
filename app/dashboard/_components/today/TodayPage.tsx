"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import TeamWeekCard from "@/components/team/TeamWeekCard";
import ShiftDays, { ShiftReminder } from "@/components/quiz/ShiftDays";
import { COCKTAILS, COCKTAIL_IMAGES } from "@/lib/cocktails";
import { KB_CATEGORIES, KB_ENTRIES } from "@/lib/knowledge-base";
import { getShiftStreak } from "@/lib/verify-quiz-client";
import { computeStreak } from "@/lib/streak";
import { shiftDaysText, type ShiftStreak } from "@/lib/shift-streak";
import {
  DRILL_MIN_STARTED,
  isMastered,
  isShiftDay,
  isStarted,
  pickNextSteps,
  sydneyWeekday,
  type NextStep,
  type StepModule,
} from "@/lib/next-step";
import type { StaffNavId } from "@/app/dashboard/_components/shell/StaffSidebar";

// Today, the staff desktop home (docs/STAFF_DESKTOP_REDESIGN_PLAN.md, 7.1):
// one step for tonight, the shift streak, this week at the venue, the path
// through Learn, Drill and Live Guest, and one cocktail and one fact for the
// bar. Replaced PreShiftHome. Styles: the sd-today rules in staff.css.

const WEEK = [1, 2, 3, 4, 5, 6, 0];
const WEEK_LETTER = ["S", "M", "T", "W", "T", "F", "S"];
const WEEK_NAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type StepCopy = { kicker: string; title: string; body: string; cta: string; alt: string };

function copyFor(step: NextStep, reviewDue: number): StepCopy {
  switch (step.kind) {
    case "challenge":
      return {
        kicker: "Start here",
        title: "Try a challenge",
        body: "Five quick games on the basics of the floor. Modules, drills and Live Guest come with a plan.",
        cta: "Play a challenge",
        alt: "Or play a challenge",
      };
    case "first-module":
      return {
        kicker: "Your first step",
        title: step.module.title,
        body: `${step.module.recommendation_reason ?? "The place to start"}. Read a few short cards, then answer questions on them.`,
        cta: "Start this module",
        alt: `Or start ${step.module.title}`,
      };
    case "preshift":
      return {
        kicker: "Before your shift",
        title: "Pre-shift drill",
        body: "Six quick questions from what you've learnt, about three minutes. Finish it and your shift streak grows.",
        cta: "Start the drill",
        alt: "Or do the pre-shift drill",
      };
    case "continue-module":
      return {
        kicker: "Pick up where you left off",
        title: step.module.title,
        body: "You've started this one. Pass its quiz and it's mastered.",
        cta: "Carry on",
        alt: `Or carry on with ${step.module.title}`,
      };
    case "review":
      return {
        kicker: "Due for a look",
        title: "Keep it fresh",
        body: `${reviewDue === 1 ? "One thing you've mastered is" : `${reviewDue} things you've mastered are`} due for review. A mixed drill brings them back before they fade.`,
        cta: "Start a mixed drill",
        alt: "Or a mixed drill",
      };
    case "next-module":
      return {
        kicker: "Next on your path",
        title: step.module.title,
        body: `${step.module.recommendation_reason ?? "Next up"}. Read a few short cards, then answer questions on them.`,
        cta: "Start this module",
        alt: `Or start ${step.module.title}`,
      };
    case "live-guest":
      return {
        kicker: "Put it into practice",
        title: "Talk to a guest",
        body: "A guest who talks back, over three or four replies. Then see what they were thinking at each turn.",
        cta: "Open Live Guest",
        alt: "Or talk to a guest",
      };
    case "drill":
      return {
        kicker: "Keep it sharp",
        title: "Mixed drill",
        body: "Ten questions from every module you've started, never two in a row from the same one.",
        cta: "Start a mixed drill",
        alt: "Or a mixed drill",
      };
  }
}

function greeting(hour: number): string {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

/** The hour and date in Sydney, for the greeting. */
function sydneyNow(at: Date): { hour: number; date: string } {
  const hour = Number(new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", hourCycle: "h23" }).format(at));
  const date = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "long" }).format(at);
  return { hour, date };
}

export default function TodayPage({
  displayName,
  progressData,
  hasModuleAccess,
  liveGuestOpen,
  getToken,
  onNavigate,
  onOpenModule,
  onStartPreshift,
}: {
  displayName: string;
  progressData: Record<string, unknown> | null;
  hasModuleAccess: boolean;
  liveGuestOpen: boolean;
  getToken: () => Promise<string>;
  onNavigate: (id: StaffNavId) => void;
  onOpenModule: (moduleId: number) => void;
  onStartPreshift: () => void;
}) {
  const [modules, setModules] = useState<StepModule[] | null>(null);
  const [streak, setStreak] = useState<ShiftStreak | null>(null);
  const [streakLoaded, setStreakLoaded] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // The clock is read once on the client, so the server and browser agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    // The daily-visit streak behind the streak badges (lib/streak.ts), as Home always counted it.
    computeStreak();
    let cancelled = false;
    getToken()
      .then((token) =>
        Promise.allSettled([
          fetch("/api/training/modules?sort=recommended", { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
            r.ok ? (r.json() as Promise<{ modules: StepModule[] }>) : Promise.reject(new Error("modules")),
          ),
          getShiftStreak(token),
        ]),
      )
      .then(([mods, shift]) => {
        if (cancelled) return;
        setModules(mods.status === "fulfilled" ? mods.value.modules : []);
        setStreak(shift.status === "fulfilled" ? shift.value : null);
        setStreakLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setModules([]);
        setStreakLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const reviewDue = Array.isArray(progressData?.reviewQueue) ? (progressData.reviewQueue as unknown[]).length : 0;
  const passes = typeof progressData?.arenaModuleCount === "number" ? progressData.arenaModuleCount : 0;
  const weekday = now ? sydneyWeekday(now) : 1;
  const ready = modules !== null && streakLoaded && now !== null;

  const [step, alt] = useMemo(
    () =>
      pickNextSteps({
        hasModuleAccess,
        modules: modules ?? [],
        streak,
        weekday,
        reviewDue,
        liveGuestOpen,
      }),
    [hasModuleAccess, modules, streak, weekday, reviewDue, liveGuestOpen],
  );

  const act = useCallback(
    (s: NextStep) => {
      switch (s.kind) {
        case "challenge": return onNavigate("challenges");
        case "first-module":
        case "continue-module":
        case "next-module": return onOpenModule(s.module.id);
        case "preshift": return onStartPreshift();
        case "review":
        case "drill": return onNavigate("drill");
        case "live-guest": return onNavigate("live-guest");
      }
    },
    [onNavigate, onOpenModule, onStartPreshift],
  );

  const all = modules ?? [];
  const total = all.length || 40;
  const mastered = all.filter(isMastered).length;
  const started = all.filter(isStarted).length;
  const firstDay = ready && started === 0;
  const firstName = displayName.trim().split(/\s+/)[0] || "there";
  const clock = now ? sydneyNow(now) : null;
  const shiftToday = streak ? isShiftDay(streak.shiftDays, weekday) : false;

  // One cocktail and one fact a day, the same for everyone. The cocktail is
  // the first of mobile Home's two hot picks (app/mobile/_components/HomeScreen.tsx).
  const dayIdx = now ? Math.floor(now.getTime() / 86_400_000) : 0;
  const cocktail = COCKTAILS[(dayIdx * 2) % COCKTAILS.length];
  const photo = COCKTAIL_IMAGES[cocktail.name];
  const fact = KB_ENTRIES[(dayIdx * 7) % KB_ENTRIES.length];

  const copy = copyFor(step, reviewDue);
  const altCopy = alt ? copyFor(alt, reviewDue) : null;

  return (
    <div className="sd-page sd-today">
      <header className="sd-today-head">
        <p className="sd-kicker">
          {clock ? `${WEEK_NAME[weekday]} ${clock.date}` : " "}
          {streak && hasModuleAccess && shiftToday ? <span className="sd-kicker-brass"> · Shift day</span> : null}
        </p>
        <h1 className="sd-display">
          {clock ? greeting(clock.hour) : "Hello"}, {firstName}.
        </h1>
      </header>

      <section className={`sd-tonight${streak && hasModuleAccess ? "" : " sd-tonight--solo"}`} aria-labelledby="sd-tonight-title" aria-busy={!ready}>
        <div className="sd-tonight-step">
          {ready ? (
            <>
              <p className="sd-kicker sd-kicker-brass">{copy.kicker}</p>
              <h2 id="sd-tonight-title" className="sd-tonight-title">{copy.title}</h2>
              <p className="sd-tonight-body">{copy.body}</p>
              <div className="sd-tonight-actions">
                <button type="button" className="sd-btn sd-btn-brass" onClick={() => act(step)}>
                  {copy.cta}
                  <ArrowRight size={18} strokeWidth={2} aria-hidden />
                </button>
                {altCopy && alt && (
                  <button type="button" className="sd-link" onClick={() => act(alt)}>
                    {altCopy.alt}
                  </button>
                )}
                {step.kind === "challenge" && (
                  <a className="sd-link" href="/pricing">See the plans</a>
                )}
              </div>
            </>
          ) : (
            <div className="sd-tonight-wait" aria-hidden="true">
              <span className="sd-skel sd-skel-kicker" />
              <span className="sd-skel sd-skel-title" />
              <span className="sd-skel sd-skel-line" />
            </div>
          )}
        </div>

        {streak && hasModuleAccess && (
          <aside className="sd-streak" aria-label="Shift streak">
            <p className="sd-kicker">Shift streak</p>
            {streak.count > 0 ? (
              <p className="sd-streak-figure">
                {streak.count}
                <span className="sd-streak-unit">{streak.count === 1 ? "shift" : "shifts"} in a row</span>
              </p>
            ) : (
              <p className="sd-streak-start">Do the pre-shift drill before a shift and your streak starts.</p>
            )}
            <ol className="sd-week" aria-label="Your week">
              {WEEK.map((d) => {
                const on = isShiftDay(streak.shiftDays, d);
                const today = d === weekday;
                const done = today && streak.doneToday;
                return (
                  <li
                    key={d}
                    className={`sd-week-day${on ? " is-shift" : ""}${today ? " is-today" : ""}${done ? " is-done" : ""}`}
                    aria-label={`${WEEK_NAME[d]}${on ? ", shift day" : ", day off"}${today ? ", today" : ""}${done ? ", drill done" : ""}`}
                  >
                    {WEEK_LETTER[d]}
                  </li>
                );
              })}
            </ol>
            <p className="sd-streak-note">
              {streak.freezesLeft === 1 ? "1 freeze left" : `${streak.freezesLeft} freezes left`}.{" "}
              {streak.shiftDays.length === 0 ? "Counting every day until you pick your shifts." : `Shifts: ${shiftDaysText(streak.shiftDays)}.`}
            </p>
            <details className="sd-streak-edit">
              <summary>Shift days and reminder</summary>
              <div className="qz qz--room sd-streak-forms">
                <ShiftDays streak={streak} getToken={getToken} onSaved={setStreak} />
                <ShiftReminder streak={streak} getToken={getToken} onSaved={setStreak} />
              </div>
            </details>
          </aside>
        )}
      </section>

      <TeamWeekCard getToken={getToken} theme="room" onLiveGuest={() => onNavigate("live-guest")} outer={{ marginBottom: "var(--sd-gap-section)" }} />

      <section className="sd-path" aria-labelledby="sd-path-title">
        <div className="sd-section-head">
          <h2 id="sd-path-title" className="sd-h2">Your path</h2>
          <p className="sd-section-lede">Learn the basics, drill them until they stick, then put them to a guest who talks back.</p>
        </div>
        <ol className="sd-path-steps">
          <li className={`sd-path-step${started > 0 ? " is-lit" : ""}`}>
            <p className="sd-path-num" aria-hidden="true">01</p>
            <h3 className="sd-path-name">Learn</h3>
            {firstDay || !ready ? (
              <p className="sd-path-text">{total} modules, from carrying glassware to RSA. Short cards first, then a quiz.</p>
            ) : (
              <p className="sd-path-figure">
                {mastered}<span> of {total} mastered</span>
              </p>
            )}
            <span className="sd-meter" aria-hidden="true"><span style={{ width: `${(mastered / total) * 100}%` }} /></span>
            <button type="button" className="sd-link" onClick={() => onNavigate("module")}>Open the modules</button>
          </li>
          <li className={`sd-path-step${started >= DRILL_MIN_STARTED ? " is-lit" : ""}`}>
            <p className="sd-path-num" aria-hidden="true">02</p>
            <h3 className="sd-path-name">Drill</h3>
            {started >= DRILL_MIN_STARTED ? (
              <p className="sd-path-figure">
                {started}<span> modules in your drills</span>
              </p>
            ) : (
              <p className="sd-path-text">
                {firstDay || !ready
                  ? "Once you've started three modules, mixed questions keep them fresh."
                  : `Start ${DRILL_MIN_STARTED - started} more ${DRILL_MIN_STARTED - started === 1 ? "module" : "modules"} to open mixed drills.`}
              </p>
            )}
            <span className="sd-meter" aria-hidden="true"><span style={{ width: `${Math.min(1, started / DRILL_MIN_STARTED) * 100}%` }} /></span>
            <button type="button" className="sd-link" onClick={() => onNavigate("drill")}>Open Mixed Drill</button>
          </li>
          <li className={`sd-path-step${passes > 0 ? " is-lit" : ""}`}>
            <p className="sd-path-num" aria-hidden="true">03</p>
            <h3 className="sd-path-name">Live Guest</h3>
            {passes > 0 ? (
              <p className="sd-path-figure">
                {passes}<span> {passes === 1 ? "guest" : "guests"} sorted</span>
              </p>
            ) : (
              <p className="sd-path-text">
                {liveGuestOpen
                  ? "Talk a real moment through with a guest who answers back, then see what they were thinking."
                  : "A guest who talks back. On venue plans, with one conversation free to try."}
              </p>
            )}
            <span className="sd-meter" aria-hidden="true"><span style={{ width: `${Math.min(1, passes / total) * 100}%` }} /></span>
            <button type="button" className="sd-link" onClick={() => onNavigate("live-guest")}>Open Live Guest</button>
          </li>
        </ol>
      </section>

      <section className="sd-forbar" aria-labelledby="sd-forbar-title">
        <div className="sd-section-head">
          <h2 id="sd-forbar-title" className="sd-h2">For the bar tonight</h2>
        </div>
        <div className="sd-forbar-grid">
          <article className="sd-cocktail">
            {photo && (
              <div className="sd-cocktail-photo">
                <Image src={photo} alt={cocktail.name} fill sizes="(max-width: 900px) 100vw, 280px" />
              </div>
            )}
            <div className="sd-cocktail-text">
              <p className="sd-kicker">Cocktail of the day</p>
              <h3 className="sd-h3">{cocktail.name}</h3>
              <p className="sd-meta">{cocktail.glass}, garnish {cocktail.garnish.charAt(0).toLowerCase() + cocktail.garnish.slice(1)}</p>
              <ul className="sd-spec">
                {cocktail.ingredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
              <button type="button" className="sd-link" onClick={() => onNavigate("cocktails")}>The cocktail library</button>
            </div>
          </article>
          <article className="sd-fact">
            <p className="sd-kicker">Worth knowing · {KB_CATEGORIES[fact.category].label}</p>
            <h3 className="sd-h3">{fact.title}</h3>
            <ul className="sd-fact-list">
              {fact.keyFacts.slice(0, 3).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button type="button" className="sd-link" onClick={() => onNavigate("knowledge")}>The knowledge base</button>
          </article>
        </div>
      </section>
    </div>
  );
}
