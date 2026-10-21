// The shift streak (Rich update, Phase 12): how many shifts in a row someone
// has done the pre-shift drill before. It counts shifts, not calendar days,
// so a casual who works Friday to Sunday keeps a streak through the week.
//
// The rules, worked forward from the first pre-shift drill to today:
// - A day with a pre-shift drill adds one to the streak, shift day or not
//   (an extra shift counts).
// - A shift day that has passed without one uses a freeze; the streak holds.
//   One freeze covers every shift missed in the GAP_DAYS from that first
//   miss, so a missed week costs one freeze, not one per shift. With no
//   freeze left, the streak goes back to 0 and the freezes refill.
// - Everyone starts with FREEZES. Every FREEZE_EARNED_AFTER shifts kept in a
//   row earns one back, up to FREEZES.
// - Today never counts as missed: the shift may not have started yet.
// - No shift days set means every day is a shift day.
//
// Pure, so the same rules run in tests and on the server. Dates are Sydney
// calendar dates, yyyy-mm-dd. Used by /api/training/shift-streak and the
// pre-shift drill (app/api/training/drill/answer).

export const FREEZES = 2;
const FREEZE_EARNED_AFTER = 5;
/** Days one freeze covers, from the first missed shift. */
const GAP_DAYS = 7;

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type ShiftStreak = {
  count: number;
  freezesLeft: number;
  /** A pre-shift drill is done today. */
  doneToday: boolean;
  /** The weekdays they work, 0 Sunday to 6 Saturday. Empty: every day. */
  shiftDays: number[];
  /** "HH:MM", Sydney time, on shift days; null when reminders are off. Set by the server. */
  reminderTime?: string | null;
  /** Weekdays (0 Sunday to 6 Saturday) of this Monday-to-Sunday week with a finished drill, for the week's dots on mobile Home. */
  weekDone?: number[];
};

function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** The Monday of the week a date is in. */
function mondayOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((weekdayOf(date) + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Keeps whole weekdays 0 to 6, once each, in order. */
export function cleanShiftDays(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length > 7) return null;
  if (!value.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) return null;
  return [...new Set(value as number[])].sort((a, b) => a - b);
}

export function computeShiftStreak(shiftDays: number[], drilledDays: string[], today: string): ShiftStreak {
  const drilled = new Set(drilledDays.filter((d) => d <= today));
  const monday = mondayOf(today);
  const weekDone = [...drilled].filter((d) => d >= monday).map(weekdayOf).sort((a, b) => a - b);
  const result = { count: 0, freezesLeft: FREEZES, doneToday: drilled.has(today), shiftDays, weekDone };
  if (drilled.size === 0) return result;

  const isShift = (date: string) => shiftDays.length === 0 || shiftDays.includes(weekdayOf(date));
  let count = 0;
  let freezes = FREEZES;
  let keptInRow = 0;
  // The first missed shift of the gap a freeze is covering, if any.
  let gapStart: string | null = null;
  let broken = false;
  for (let day = [...drilled].sort()[0]; day <= today; day = nextDay(day)) {
    if (drilled.has(day)) {
      count += 1;
      keptInRow += 1;
      gapStart = null;
      broken = false;
      if (keptInRow % FREEZE_EARNED_AFTER === 0 && freezes < FREEZES) freezes += 1;
    } else if (day < today && isShift(day) && !broken) {
      keptInRow = 0;
      if (gapStart !== null && daysBetween(gapStart, day) < GAP_DAYS) continue;
      if (freezes > 0) {
        freezes -= 1;
        gapStart = day;
      } else {
        // Broken: nothing more to lose until the next drill starts a new one.
        count = 0;
        freezes = FREEZES;
        gapStart = null;
        broken = true;
      }
    }
  }
  return { ...result, count, freezesLeft: freezes };
}

/** "16:30", or null to turn reminders off. Undefined when the value is neither. */
export function cleanReminderTime(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? value : undefined;
}

/** "4:30pm". */
export function reminderTimeText(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
}

/** "Fri, Sat and Sun", or "every day". */
export function shiftDaysText(shiftDays: number[]): string {
  if (shiftDays.length === 0 || shiftDays.length === 7) return "every day";
  const names = shiftDays.map((d) => WEEKDAY_SHORT[d]);
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** The next weekday after `weekday` that is a shift, or null when every day is. */
export function nextShiftDay(shiftDays: number[], weekday: number): number | null {
  if (shiftDays.length === 0 || shiftDays.length === 7) return null;
  for (let i = 1; i <= 7; i += 1) {
    const day = (weekday + i) % 7;
    if (shiftDays.includes(day)) return day;
  }
  return null;
}
