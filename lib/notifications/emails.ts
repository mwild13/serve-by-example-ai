// The weekly digest and the Sunday reminder: subject, preview text and HTML,
// built on the shared branded shell. Pure functions, so they are tested
// without sending anything.

import {
  EMAIL_SMALL_STYLE,
  EMAIL_TEXT_STYLE,
  brandedEmailHtml,
  emailButtonHtml,
  emailFieldTableHtml,
  escapeHtml,
} from "@/lib/email-template";
import { V3_TOTAL_MODULES } from "@/lib/mastery";
import type { NotificationKind } from "./schedule";

/** One person's numbers, as claim_notification_batch() returns them. */
export type NotificationStats = {
  displayName: string | null;
  daysTrained: number;
  quizAnswers: number;
  quizzesPassed: number;
  scenarios: number;
  modulesMastered: number;
  reviewsDue: number;
};

export type NotificationEmail = { subject: string; html: string };

type Links = {
  /** Where the button goes. /dashboard sends phones on to /mobile. */
  trainingUrl: string;
  /** The signed unsubscribe page for this email. */
  unsubscribeUrl: string;
};

function firstName(displayName: string | null): string | null {
  const first = displayName?.trim().split(/\s+/)[0];
  return first ? escapeHtml(first) : null;
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Mon 13 Oct", for the digest's date range. Built by hand: locale output
 * differs between ICU builds ("Mon, 13 Oct" in some). */
export function shortDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${DAY_NAMES[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
}

function footerHtml(kind: NotificationKind, unsubscribeUrl: string): string {
  const what = kind === "weekly_digest" ? "the weekly progress digest" : "Sunday training reminders";
  return `<p style="${EMAIL_SMALL_STYLE}">You are getting this because you turned on ${what} in Settings &gt; Notifications. <a href="${escapeHtml(unsubscribeUrl)}" style="color:inherit;text-decoration:underline">Unsubscribe</a> at any time.</p>`;
}

export function weeklyDigestEmail(stats: NotificationStats, range: { from: string; to: string }, links: Links): NotificationEmail {
  const name = firstName(stats.displayName);
  const greeting = name ? `Hi ${name},` : "Hi,";
  const trained = stats.daysTrained > 0;
  const remaining = Math.max(V3_TOTAL_MODULES - stats.modulesMastered, 0);

  const intro = trained
    ? `Here is your training from ${shortDate(range.from)} to ${shortDate(range.to)}.`
    : `No training was logged from ${shortDate(range.from)} to ${shortDate(range.to)}. A few quiz questions before a shift is enough to keep moving.`;

  const table = trained
    ? emailFieldTableHtml([
        ["Days trained", `${stats.daysTrained} of 7`],
        ["Quiz answers", String(stats.quizAnswers)],
        ["Modules passed", String(stats.quizzesPassed)],
        ["Scenarios practised", String(stats.scenarios)],
      ])
    : "";

  const progress =
    remaining === 0
      ? `You have mastered all ${V3_TOTAL_MODULES} modules. A short review keeps it sharp.`
      : `You have mastered ${stats.modulesMastered} of ${V3_TOTAL_MODULES} modules.`;
  const reviews =
    stats.reviewsDue > 0
      ? ` ${plural(stats.reviewsDue, "scenario is", "scenarios are")} due for review.`
      : "";

  const subject = trained
    ? `Your week in training: ${plural(stats.daysTrained, "day", "days")}${stats.quizzesPassed > 0 ? `, ${plural(stats.quizzesPassed, "module", "modules")} passed` : ""}`
    : "Your weekly training summary";

  return {
    subject,
    html: brandedEmailHtml({
      preheader: trained ? `${plural(stats.daysTrained, "day", "days")} of training last week.` : "A fresh week to pick up where you left off.",
      heading: "Your week in training",
      bodyHtml: `
        <p style="${EMAIL_TEXT_STYLE}">${greeting}</p>
        <p style="${EMAIL_TEXT_STYLE}">${intro}</p>
        ${table}
        <p style="${EMAIL_TEXT_STYLE}">${progress}${reviews}</p>
        ${emailButtonHtml(escapeHtml(links.trainingUrl), trained ? "Keep going" : "Start this week")}
        ${footerHtml("weekly_digest", links.unsubscribeUrl)}
      `,
    }),
  };
}

export function sundayReminderEmail(stats: NotificationStats, links: Links): NotificationEmail {
  const name = firstName(stats.displayName);
  const greeting = name ? `Hi ${name},` : "Hi,";
  const remaining = Math.max(V3_TOTAL_MODULES - stats.modulesMastered, 0);

  let nudge: string;
  if (stats.reviewsDue > 0) {
    nudge = `You have ${plural(stats.reviewsDue, "scenario", "scenarios")} due for review. Clearing them before your first shift keeps them fresh.`;
  } else if (remaining === 0) {
    nudge = `You have mastered all ${V3_TOTAL_MODULES} modules. A quick quiz before your first shift keeps it sharp.`;
  } else if (stats.modulesMastered === 0) {
    nudge = "Ten minutes on your first module tonight puts you ahead before your first shift.";
  } else {
    nudge = `You have mastered ${stats.modulesMastered} of ${V3_TOTAL_MODULES} modules. One more this week?`;
  }

  const week =
    stats.daysTrained > 0
      ? `<p style="${EMAIL_TEXT_STYLE}">You trained on ${plural(stats.daysTrained, "day", "days")} in the last week.</p>`
      : "";

  return {
    subject: "Get set for the week ahead",
    html: brandedEmailHtml({
      preheader: "Ten minutes tonight before the week starts.",
      heading: "Ready for the week ahead?",
      bodyHtml: `
        <p style="${EMAIL_TEXT_STYLE}">${greeting}</p>
        <p style="${EMAIL_TEXT_STYLE}">${nudge}</p>
        ${week}
        ${emailButtonHtml(escapeHtml(links.trainingUrl), "Start training")}
        ${footerHtml("sunday_reminder", links.unsubscribeUrl)}
      `,
    }),
  };
}
