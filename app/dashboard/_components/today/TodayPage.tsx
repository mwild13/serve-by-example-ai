"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, BookOpen, Flame, MessageCircle, Shuffle } from "lucide-react";
import MasteryRing from "@/app/dashboard/_components/parts/MasteryRing";
import TeamWeekCard from "@/components/team/TeamWeekCard";
import ShiftDays, { ShiftReminder } from "@/components/quiz/ShiftDays";
import { COCKTAILS, COCKTAIL_IMAGES } from "@/lib/cocktails";
import { KB_CATEGORIES, KB_ENTRIES } from "@/lib/knowledge-base";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadModules, loadShiftStreak } from "@/lib/staff-data";
import { computeStreak } from "@/lib/streak";
import { shiftDaysText } from "@/lib/shift-streak";
import {
  DRILL_MIN_STARTED,
  isMastered,
  isShiftDay,
  isStarted,
  pickNextSteps,
  sydneyWeekday,
  type NextStep,
} from "@/lib/next-step";
import type { StaffNavId } from "@/app/dashboard/_components/shell/StaffSidebar";

// Today, the staff desktop home (docs/STAFF_APP.md section 8): one step for
// tonight beside the shift streak, this week at the venue, the path through
// Learn, Drill and Live Guest as three figures, then what's up next and a
// cocktail and a fact for the bar. Replaced PreShiftHome. Styles: the sd-
// rules in app/styles/staff.css.

const WEEK = [1, 2, 3, 4, 5, 6, 0];
const WEEK_LETTER = ["S", "M", "T", "W", "T", "F", "S"];
const WEEK_NAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const AREA_LABEL: Record<string, string> = {
  technical: "Behind the bar",
  service: "Service and sales",
  compliance: "Safety and compliance",
};

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
        cta: "Continue",
        alt: `Or continue ${step.module.title}`,
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
  const { data: modules, failed: modulesFailed } = useStaffData(STAFF_KEYS.modules, loadModules, getToken);
  const { data: streak, failed: streakFailed, set: setStreak } = useStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // The clock is read once on the client, so the server and browser agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    // The daily-visit streak behind the streak badges (lib/streak.ts), as Home always counted it.
    computeStreak();
  }, []);

  const reviewDue = Array.isArray(progressData?.reviewQueue) ? (progressData.reviewQueue as unknown[]).length : 0;
  const passes = typeof progressData?.arenaModuleCount === "number" ? progressData.arenaModuleCount : 0;
  const weekday = now ? sydneyWeekday(now) : 1;
  const ready = (modules !== undefined || modulesFailed) && (streak !== undefined || streakFailed) && now !== null;

  const [step, alt] = useMemo(
    () =>
      pickNextSteps({
        hasModuleAccess,
        modules: modules ?? [],
        streak: streak ?? null,
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

  // Up next: modules on the go first, then the navigator's suggestions.
  const upNext = [
    ...all.filter((m) => isStarted(m) && !isMastered(m)),
    ...all.filter((m) => m.recommended && !isStarted(m)),
    ...all.filter((m) => !isStarted(m) && !m.recommended),
  ].slice(0, 4);

  // One cocktail and one fact a day, the same for everyone. The cocktail is
  // the first of mobile Home's two hot picks (app/mobile/_components/HomeScreen.tsx).
  const dayIdx = now ? Math.floor(now.getTime() / 86_400_000) : 0;
  const cocktail = COCKTAILS[(dayIdx * 2) % COCKTAILS.length];
  const photo = COCKTAIL_IMAGES[cocktail.name];
  const fact = KB_ENTRIES[(dayIdx * 7) % KB_ENTRIES.length];

  const copy = copyFor(step, reviewDue);
  const altCopy = alt ? copyFor(alt, reviewDue) : null;
  const showStreak = !!streak && hasModuleAccess;

  const path = [
    {
      id: "module" as const,
      name: "Learn",
      Icon: BookOpen,
      figure: `${mastered}`,
      of: `of ${total}`,
      caption: "modules mastered",
      empty: `${total} modules, from carrying glassware to RSA. Short cards, then a quiz.`,
      pct: mastered / total,
      lit: started > 0,
      link: "Open modules",
    },
    {
      id: "drill" as const,
      name: "Drill",
      Icon: Shuffle,
      figure: `${started}`,
      of: "",
      caption: started === 1 ? "module in your drills" : "modules in your drills",
      empty:
        started > 0
          ? `Start ${DRILL_MIN_STARTED - started} more ${DRILL_MIN_STARTED - started === 1 ? "module" : "modules"} to open mixed drills.`
          : "Once three modules are started, mixed questions keep them fresh.",
      pct: Math.min(1, started / DRILL_MIN_STARTED),
      lit: started >= DRILL_MIN_STARTED,
      link: "Open Mixed Drill",
    },
    {
      id: "live-guest" as const,
      name: "Live Guest",
      Icon: MessageCircle,
      figure: `${passes}`,
      of: "",
      caption: passes === 1 ? "guest sorted" : "guests sorted",
      empty: liveGuestOpen
        ? "Talk a real moment through with a guest who answers back."
        : "A guest who talks back. On venue plans, with one free to try.",
      pct: Math.min(1, passes / total),
      lit: passes > 0,
      link: "Open Live Guest",
    },
  ];

  return (
    <div className="sd-page sd-today">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">
            {clock ? greeting(clock.hour) : "Hello"}, {firstName}
          </h1>
          <p className="sd-subtitle">
            {clock ? `${WEEK_NAME[weekday]} ${clock.date}` : " "}
            {showStreak && shiftToday ? <span className="sd-subtitle-accent"> · Shift day</span> : null}
          </p>
        </div>
      </header>

      <div className="sd-grid">
        <section
          className={`sd-panel sd-step ${showStreak ? "sd-col-8" : "sd-col-12"}`}
          aria-labelledby="sd-step-title"
          aria-busy={!ready}
        >
          {ready ? (
            <>
              <p className="sd-label sd-label-accent">{copy.kicker}</p>
              <h2 id="sd-step-title" className="sd-step-title">{copy.title}</h2>
              <p className="sd-step-body">{copy.body}</p>
              <div className="sd-actions">
                <button type="button" className="sd-btn sd-btn-primary" onClick={() => act(step)}>
                  {copy.cta}
                  <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
                </button>
                {altCopy && alt && (
                  <button type="button" className="sd-btn sd-btn-ghost" onClick={() => act(alt)}>
                    {altCopy.alt}
                  </button>
                )}
                {step.kind === "challenge" && (
                  <a className="sd-btn sd-btn-ghost" href="/pricing">See the plans</a>
                )}
              </div>
            </>
          ) : (
            <div className="sd-wait" aria-hidden="true">
              <span className="sd-skel sd-skel-label" />
              <span className="sd-skel sd-skel-title" />
              <span className="sd-skel sd-skel-line" />
            </div>
          )}
        </section>

        {showStreak && streak && (
          <section className="sd-panel sd-col-4 sd-streak" aria-label="Shift streak">
            <div className="sd-panel-head">
              <p className="sd-label">Shift streak</p>
              <Flame size={16} strokeWidth={2} className="sd-panel-icon" aria-hidden />
            </div>
            {streak.count > 0 ? (
              <p className="sd-figure">
                {streak.count}
                <span className="sd-figure-unit">{streak.count === 1 ? "shift" : "shifts"} in a row</span>
              </p>
            ) : (
              <p className="sd-streak-start">Finish a pre-shift drill on a shift day to start one.</p>
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
            <p className="sd-note">
              {streak.freezesLeft === 1 ? "1 freeze left" : `${streak.freezesLeft} freezes left`}.{" "}
              {streak.shiftDays.length === 0 ? "Every day counts until you pick your shifts." : `Shifts: ${shiftDaysText(streak.shiftDays)}.`}
            </p>
            <details className="sd-disclose">
              <summary>Shift days and reminder</summary>
              <div className="qz qz--room sd-disclose-body">
                <ShiftDays streak={streak} getToken={getToken} onSaved={setStreak} />
                <ShiftReminder streak={streak} getToken={getToken} onSaved={setStreak} />
              </div>
            </details>
          </section>
        )}

        <div className="sd-col-12 sd-team">
          <TeamWeekCard getToken={getToken} theme="room" onLiveGuest={() => onNavigate("live-guest")} />
        </div>

        {path.map((p) => (
          <section key={p.id} className={`sd-panel sd-col-4 sd-stat${p.lit ? " is-lit" : ""}`} aria-label={p.name}>
            <div className="sd-panel-head">
              <p className="sd-label">{p.name}</p>
              <p.Icon size={16} strokeWidth={2} className="sd-panel-icon" aria-hidden />
            </div>
            {p.lit && !firstDay ? (
              <p className="sd-figure">
                {p.figure}
                {p.of && <span className="sd-figure-of">{p.of}</span>}
                <span className="sd-figure-unit">{p.caption}</span>
              </p>
            ) : (
              <p className="sd-stat-empty">{p.empty}</p>
            )}
            <span className="sd-bar" aria-hidden="true"><span style={{ width: `${p.pct * 100}%` }} /></span>
            <button type="button" className="sd-textlink" onClick={() => onNavigate(p.id)}>
              {p.link}
              <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
            </button>
          </section>
        ))}

        <section className="sd-panel sd-col-7 sd-upnext" aria-labelledby="sd-upnext-title">
          <div className="sd-panel-head">
            <h2 id="sd-upnext-title" className="sd-h2">Up next</h2>
            <button type="button" className="sd-textlink" onClick={() => onNavigate("module")}>
              All modules
              <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          {modules === null ? (
            <div className="sd-wait" aria-hidden="true">
              <span className="sd-skel sd-skel-line" />
              <span className="sd-skel sd-skel-line" />
            </div>
          ) : (
            <ul className="sd-list">
              {upNext.map((m) => (
                <li key={m.id}>
                  <button type="button" className="sd-list-row" onClick={() => onOpenModule(m.id)}>
                    <MasteryRing module={m} />
                    <span className="sd-list-main">
                      <span className="sd-list-title">{m.title}</span>
                      <span className="sd-list-meta">
                        {isStarted(m) ? (m.mastery_pct > 0 ? `${m.mastery_pct}% mastered` : "Started") : AREA_LABEL[m.category] ?? "Module"}
                      </span>
                    </span>
                    <span className="sd-list-action">{isStarted(m) ? "Continue" : "Start"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="sd-panel sd-col-5 sd-bar-tonight" aria-labelledby="sd-bar-title">
          <div className="sd-panel-head">
            <h2 id="sd-bar-title" className="sd-h2">For the bar tonight</h2>
          </div>
          <button type="button" className="sd-cocktail" onClick={() => onNavigate("cocktails")}>
            {photo && (
              <span className="sd-cocktail-photo">
                <Image src={photo} alt="" fill sizes="88px" />
              </span>
            )}
            <span className="sd-cocktail-text">
              <span className="sd-list-title">{cocktail.name}</span>
              <span className="sd-list-meta">{cocktail.glass}</span>
              <span className="sd-cocktail-spec">{cocktail.ingredients.slice(0, 3).join(", ")}{cocktail.ingredients.length > 3 ? ", and more" : ""}</span>
            </span>
          </button>
          <div className="sd-fact">
            <p className="sd-label">Worth knowing · {KB_CATEGORIES[fact.category].label}</p>
            <p className="sd-fact-title">{fact.title}</p>
            <p className="sd-fact-text">{fact.keyFacts[0]}</p>
            <button type="button" className="sd-textlink" onClick={() => onNavigate("knowledge")}>
              Knowledge Base
              <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
