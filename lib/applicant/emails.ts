// The two applicant test emails (docs/APPLICANT_TESTING.md §2): the invite to
// the applicant, and the note to the manager once a test is finished. Every
// value a manager or applicant typed goes through escapeHtml().
import { EMAIL_SMALL_STYLE, EMAIL_TEXT_STYLE, brandedEmailHtml, emailButtonHtml, emailFallbackLinkHtml, escapeHtml } from "@/lib/email-template";

/** The intro the invite dialog starts with. The manager can change it. */
export function defaultIntro(venueName: string): string {
  return [
    `Thank you for your interest in joining ${venueName}.`,
    "We'd like to see how you approach the work: how you think through a busy service, look after guests and keep people safe.",
    "It takes about 30 minutes, and there is no time limit. There are no trick questions. Answer the way you would on shift.",
    "It helps us get to know your strengths before we meet.",
  ].join(" ");
}

/** Brevo shows this as who the email is from. Plain text only, kept short. */
export function senderNameFor(venueName: string): string {
  const clean = venueName.replace(/[\r\n"<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 48);
  return clean ? `${clean} via Serve By Example` : "Serve By Example";
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="${EMAIL_TEXT_STYLE}">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function formatExpiry(expiresAt: Date): string {
  return new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", weekday: "long", day: "numeric", month: "long" }).format(expiresAt);
}

export function applicantInviteEmail({
  venueName,
  applicantName,
  intro,
  url,
  expiresAt,
}: {
  venueName: string;
  applicantName: string;
  intro: string;
  url: string;
  expiresAt: Date;
}): { subject: string; html: string } {
  const venue = escapeHtml(venueName);
  const href = escapeHtml(url);
  const greeting = firstName(applicantName);
  return {
    subject: `${venueName}: your next step`,
    html: brandedEmailHtml({
      preheader: `${venue} would like to see how you approach the work.`,
      heading: greeting ? `Hi ${escapeHtml(greeting)}` : "Hello",
      bodyHtml: `
        ${paragraphs(intro)}
        ${emailButtonHtml(href, "Start")}
        <p style="${EMAIL_SMALL_STYLE}">The link works until ${escapeHtml(formatExpiry(expiresAt))}, and only for you. You can stop and come back to it until you finish.</p>
        <p style="${EMAIL_SMALL_STYLE}">${venue} sees your answers and how you worked through them, such as the time each answer took. Serve By Example runs the test for ${venue} and keeps your answers for 12 months. Reply to this email to ask ${venue} to delete them sooner.</p>
        ${emailFallbackLinkHtml(href)}
      `,
    }),
  };
}

export function applicantFinishedEmail({
  venueName,
  applicantName,
  trackLabel,
  url,
}: {
  venueName: string;
  applicantName: string;
  trackLabel: string;
  url: string;
}): { subject: string; html: string } {
  const name = escapeHtml(applicantName);
  const href = escapeHtml(url);
  return {
    subject: `${applicantName} has finished their test`,
    html: brandedEmailHtml({
      preheader: `${name}'s answers are ready to read.`,
      heading: `${name} has finished`,
      bodyHtml: `
        <p style="${EMAIL_TEXT_STYLE}">${name} has finished the ${escapeHtml(trackLabel.toLowerCase())} applicant test for ${escapeHtml(venueName)}. Their answers and scores are in the Manager Console.</p>
        ${emailButtonHtml(href, "Read the report")}
        ${emailFallbackLinkHtml(href)}
      `,
    }),
  };
}
