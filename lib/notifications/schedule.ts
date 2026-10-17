// When the two opt-in emails go out. Everything runs on Sydney time: the
// platform is Australia-only and the confirmation emails promise "Monday
// morning" and "Sunday night". The cron job fires every 15 minutes on Sunday
// and Monday UTC; dueSends() decides whether a run has anything to do.

export type NotificationKind = "weekly_digest" | "sunday_reminder";

const NOTIFICATION_TIME_ZONE = "Australia/Sydney";

/** Sydney hours, start inclusive and end exclusive, when each email may go. */
const SEND_WINDOWS: Record<NotificationKind, { weekday: number; startHour: number; endHour: number }> = {
  // Monday 7:00 to 11:59. Missed by noon means skipped: a "Monday morning"
  // summary arriving in the afternoon is worse than none.
  weekly_digest: { weekday: 1, startHour: 7, endHour: 12 },
  // Sunday 18:00 to 21:59.
  sunday_reminder: { weekday: 0, startHour: 18, endHour: 22 },
};

export type SydneyTime = {
  /** The Sydney calendar date, YYYY-MM-DD. */
  date: string;
  /** 0 is Sunday. */
  weekday: number;
  hour: number;
};

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function sydneyTime(at: Date): SydneyTime {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: NOTIFICATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    weekday: WEEKDAYS[part("weekday")] ?? -1,
    hour: Number(part("hour")),
  };
}

/** Adds whole days to a YYYY-MM-DD date. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type DueSend = {
  kind: NotificationKind;
  /** The send day, which the send log is keyed on. */
  period: string;
  /** The days the email's numbers cover, inclusive. */
  from: string;
  to: string;
};

/**
 * The numbers each email reports: the digest covers the seven days before
 * the send day (Monday to Sunday), the reminder the seven days up to and
 * including it.
 */
export function sendFor(kind: NotificationKind, sendDate: string): DueSend {
  return kind === "weekly_digest"
    ? { kind, period: sendDate, from: addDays(sendDate, -7), to: addDays(sendDate, -1) }
    : { kind, period: sendDate, from: addDays(sendDate, -6), to: sendDate };
}

/** What is due at this moment. Empty outside both windows. */
export function dueSends(at: Date): DueSend[] {
  const now = sydneyTime(at);
  return (Object.keys(SEND_WINDOWS) as NotificationKind[])
    .filter((kind) => {
      const w = SEND_WINDOWS[kind];
      return now.weekday === w.weekday && now.hour >= w.startHour && now.hour < w.endHour;
    })
    .map((kind) => sendFor(kind, now.date));
}

export function isNotificationKind(value: unknown): value is NotificationKind {
  return value === "weekly_digest" || value === "sunday_reminder";
}
