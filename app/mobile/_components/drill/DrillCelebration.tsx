"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, X } from "lucide-react";
import { FlameIcon } from "../ui/icons";
import { ShiftDots } from "../ui/parts";
import ShiftDays, { ShiftReminder } from "@/components/quiz/ShiftDays";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadShiftStreak } from "@/lib/staff-data";
import { FREEZES, nextShiftDay, type ShiftStreak } from "@/lib/shift-streak";
import { pushSupport } from "@/lib/push-client";
import { currentPlatform, trackInstall } from "../../_lib/use-install";
import { homeClock } from "@/lib/home-feed";
import { drillTime } from "@/lib/drill-time";
import type { DrillSummary } from "@/lib/verify-quiz-client";

// The end of the pre-shift drill on mobile (docs/STAFF_MOBILE_REDESIGN_PLAN.md
// section 5): the gold ring draws round, the streak number pops up and
// today's dot turns gold. Always bottle green, in light mode too, as a moment
// apart from the app. MixedDrill renders it through `renderPreshiftDone`;
// desktop keeps PreshiftResult. Styles: .sm-celebrate in app/styles/staff.css.

/** The ring's circumference: 2 * pi * 72. */
const RING = 452.4;

export default function DrillCelebration({
  summary,
  seconds,
  getToken,
  onLiveGuest,
}: {
  summary: DrillSummary;
  seconds: number;
  getToken: () => Promise<string>;
  onLiveGuest?: () => void;
}) {
  const [streak, setStreak] = useState<ShiftStreak | undefined>(summary.streak);
  const [weekday] = useState(() => homeClock(new Date()).weekday);
  // On an iPhone, reminders need the app on the Home Screen: the card pitches that.
  const [needsInstall] = useState(needsInstallNow);
  const [cardShown, setCardShown] = useState(
    () => needsInstallNow() || !summary.streak || summary.streak.shiftDays.length === 0 || !summary.streak.reminderTime,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Home and Practise read the streak from the shared cache: give it the
  // new one, so Home turns to "Ready for tonight" at once.
  const { set: setCachedStreak } = useStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken);
  useEffect(() => {
    if (streak) setCachedStreak(streak);
  }, [streak, setCachedStreak]);

  useEffect(() => {
    headingRef.current?.focus();
    // A short buzz on Android. iPhone browsers have no vibration, so the
    // animation carries it there.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) navigator.vibrate?.([14, 70, 22]);
    if (needsInstallNow() && summary.streak) trackInstall("shown", "drill-finish", currentPlatform());
  }, [summary.streak]);

  const count = streak?.count ?? 0;
  const freezeUsed = !!streak && streak.freezesLeft < FREEZES;
  const weekDone = streak?.weekDone?.includes(weekday) ? streak.weekDone : [...(streak?.weekDone ?? []), weekday];

  return (
    <section className="sm-dark sm-celebrate" aria-labelledby="sm-celebrate-title">
      <div className="sm-celebrate-inner">
        <div className="sm-celebrate-top">
          <Link href="/mobile" className="sm-icon-btn" aria-label="Close">
            <X size={22} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>

        <div className="sm-celebrate-ring">
          {SPARKS.map((spark, i) => (
            <svg key={i} className="sm-spark" width={spark.size} height={spark.size} viewBox="0 0 24 24" aria-hidden="true" style={spark.style}>
              <path d="M12 0 14.5 9.5 24 12 14.5 14.5 12 24 9.5 14.5 0 12 9.5 9.5Z" />
            </svg>
          ))}
          <div className="sm-celebrate-dial">
            <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
              <circle className="sm-celebrate-track" cx="84" cy="84" r="72" />
              <circle className="sm-celebrate-fill" cx="84" cy="84" r="72" strokeDasharray={RING} transform="rotate(-90 84 84)" />
            </svg>
            {streak ? (
              <div className="sm-celebrate-count" role="img" aria-label={`Shift streak: ${count} in a row`}>
                <FlameIcon size={28} />
                <span className="sm-celebrate-number">{count}</span>
                <span className="sm-celebrate-unit">{count === 1 ? "shift in a row" : "shifts in a row"}</span>
              </div>
            ) : (
              <div className="sm-celebrate-count" role="img" aria-label="Done">
                <Check size={56} strokeWidth={2.6} />
              </div>
            )}
          </div>
        </div>

        <div className="sm-celebrate-text sm-rise" style={{ animationDelay: "300ms" }}>
          <h1 id="sm-celebrate-title" ref={headingRef} tabIndex={-1}>
            You&apos;re ready for tonight
          </h1>
          <p>
            {summary.correct} of {summary.total} right in {drillTime(seconds)}.
          </p>
          {freezeUsed && streak && (
            <p className="sm-celebrate-freeze">
              A freeze covered a missed shift. {streak.freezesLeft === 1 ? "1 freeze" : `${streak.freezesLeft} freezes`} left.
            </p>
          )}
        </div>

        {streak && (
          <div className="sm-celebrate-week sm-rise" style={{ animationDelay: "450ms" }}>
            <ShiftDots shiftDays={streak.shiftDays} weekDone={weekDone} weekday={weekday} />
          </div>
        )}

        {streak && cardShown && needsInstall && (
          <div className="sm-celebrate-card sm-rise" style={{ animationDelay: "650ms" }}>
            <div className="sm-celebrate-card-head">
              <span className="sm-celebrate-card-icon" aria-hidden="true">
                <Bell size={20} strokeWidth={2.2} />
              </span>
              <span className="sm-row-text">
                <span className="sm-card-title">Get a nudge before {nextShiftText(streak.shiftDays, weekday)}</span>
                <span className="sm-card-sub">Add SBE to your Home Screen and we&apos;ll remind you on shift days.</span>
              </span>
            </div>
            <div className="sm-celebrate-card-actions">
              <Link
                href="/mobile/install?from=drill"
                className="sm-btn sm-btn--primary"
                onClick={() => trackInstall("tap", "drill-finish", currentPlatform())}
              >
                Show me how
              </Link>
              <button
                type="button"
                className="sm-btn sm-btn--text"
                onClick={() => {
                  setCardShown(false);
                  trackInstall("dismiss", "drill-finish", currentPlatform());
                }}
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {streak && cardShown && !needsInstall && (
          <div className="sm-celebrate-card sm-rise" style={{ animationDelay: "650ms" }}>
            <div className="sm-celebrate-card-head">
              <span className="sm-celebrate-card-icon" aria-hidden="true">
                <Bell size={20} strokeWidth={2.2} />
              </span>
              <span className="sm-row-text">
                <span className="sm-card-title">Get a nudge before each shift</span>
                <span className="sm-card-sub">Pick your days and a time, and we&apos;ll remind you to drill.</span>
              </span>
              <button type="button" className="sm-icon-btn" aria-label="Not now" onClick={() => setCardShown(false)}>
                <X size={18} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </div>
            <ShiftDays streak={streak} getToken={getToken} onSaved={setStreak} />
            <ShiftReminder streak={streak} getToken={getToken} onSaved={setStreak} />
          </div>
        )}

        <div className="sm-celebrate-actions">
          <Link href="/mobile" className="sm-btn sm-btn--gold sm-btn--block">
            Back to Home
          </Link>
          {onLiveGuest && (
            <button type="button" className="sm-btn sm-btn--text sm-btn--block" onClick={onLiveGuest}>
              Warm up with a Live Guest
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

const DAY_NAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function needsInstallNow(): boolean {
  return pushSupport() === "install";
}

/** "Thursday", "tomorrow", or "your next shift" when every day is one. */
function nextShiftText(shiftDays: number[], weekday: number): string {
  const next = nextShiftDay(shiftDays, weekday);
  if (next === null) return "your next shift";
  return next === (weekday + 1) % 7 ? "tomorrow" : DAY_NAME[next];
}

// Placed round the ring as in the Version 2 mock-up, from its centre line.
const SPARKS = [
  { size: 18, style: { left: "calc(50% - 117px)", top: 24, animationDelay: "0ms" } },
  { size: 12, style: { left: "calc(50% + 95px)", top: 34, animationDelay: "400ms" } },
  { size: 22, style: { left: "calc(50% + 105px)", top: 128, animationDelay: "800ms" } },
  { size: 10, style: { left: "calc(50% - 131px)", top: 140, animationDelay: "1200ms" } },
  { size: 14, style: { left: "calc(50% - 9px)", top: 0, animationDelay: "600ms" } },
];
