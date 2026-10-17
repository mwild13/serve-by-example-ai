// Brevo calls for the two opt-in emails, shared by the Settings route
// (app/api/profile/notifications), the unsubscribe route and the sender
// (app/api/cron/notifications). Moved here from the Settings route on
// 2026-10-17; the history of the sync rules is in that route's header.

import { EMAIL_TEXT_STYLE, brandedEmailHtml } from "@/lib/email-template";

export type NotifFlag = "reminders" | "digest";

const BREVO_TIMEOUT_MS = 8_000;
const FROM_EMAIL = "info@servebyexample.co";

function fromName(): string {
  return process.env.BREVO_FROM_NAME ?? "Serve By Example";
}

async function brevoPost(path: string, apiKey: string, payload: unknown, label: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.brevo.com/v3/${path}`, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(JSON.stringify({ event: "notif_brevo_failed", step: label, status: res.status }));
    }
    return res.ok;
  } catch (err) {
    console.error(JSON.stringify({ event: "notif_brevo_failed", step: label, message: err instanceof Error ? err.message : String(err) }));
    return false;
  }
}

function confirmationEmail(which: NotifFlag): { heading: string; bodyHtml: string } {
  const heading = which === "digest" ? "You're subscribed to the weekly progress digest" : "You're subscribed to training reminders";
  const bodyHtml =
    which === "digest"
      ? `<p style="${EMAIL_TEXT_STYLE}">You'll get a short summary of your training progress every <strong>Monday morning</strong>.</p>
         <p style="${EMAIL_TEXT_STYLE}">You can turn this off any time from Settings &gt; Notifications in the app.</p>`
      : `<p style="${EMAIL_TEXT_STYLE}">You'll get a training reminder every <strong>Sunday night</strong> to help you get ready for the week ahead.</p>
         <p style="${EMAIL_TEXT_STYLE}">You can turn this off any time from Settings &gt; Notifications in the app.</p>`;
  return { heading, bodyHtml };
}

/**
 * Mirrors real flag changes to Brevo: one contact upsert carrying every
 * changed attribute (true on opt-in, false on opt-out), plus a confirmation
 * email per opt-in when `confirm` is set. Calls run in parallel and are
 * awaited; failures are logged only.
 */
export async function syncBrevo(
  email: string,
  changes: Partial<Record<NotifFlag, boolean>>,
  subscribedAfter: boolean,
  { confirm = true }: { confirm?: boolean } = {},
): Promise<void> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.warn("[notifications] BREVO_API_KEY not set — skipping Brevo sync + confirmation email");
    return;
  }

  const listId = process.env.BREVO_NOTIFICATIONS_LIST_ID;
  const attributes: Record<string, boolean> = {};
  if (changes.reminders !== undefined) attributes.SUNDAY_REMINDER = changes.reminders;
  if (changes.digest !== undefined) attributes.WEEKLY_DIGEST = changes.digest;
  const optedIn = (Object.keys(changes) as NotifFlag[]).filter((k) => changes[k] === true);

  const calls: Promise<boolean>[] = [
    brevoPost("contacts", brevoApiKey, {
      email,
      attributes,
      ...(listId && optedIn.length > 0 ? { listIds: [Number(listId)] } : {}),
      updateEnabled: true,
    }, "contact_upsert"),
    ...(confirm ? optedIn : []).map((which) => {
      const { heading, bodyHtml } = confirmationEmail(which);
      return brevoPost("smtp/email", brevoApiKey, {
        sender: { name: fromName(), email: FROM_EMAIL },
        to: [{ email }],
        subject: heading,
        htmlContent: brandedEmailHtml({ heading, bodyHtml }),
      }, `confirmation_${which}`);
    }),
  ];
  // Off for both emails now: take the contact off the list too. Brevo
  // returns 400 if they weren't on it, which is logged and harmless.
  if (listId && !subscribedAfter) {
    calls.push(brevoPost(`contacts/lists/${Number(listId)}/contacts/remove`, brevoApiKey, { emails: [email] }, "list_remove"));
  }

  await Promise.all(calls);
}

/**
 * Sends one scheduled email. `oneClickUnsubscribeUrl` becomes the
 * List-Unsubscribe header, so Gmail and Apple Mail show their own
 * unsubscribe button and post to it (RFC 8058). Returns whether Brevo
 * accepted the message.
 */
export function sendScheduledEmail(
  apiKey: string,
  { to, subject, html, oneClickUnsubscribeUrl, tag }: {
    to: string;
    subject: string;
    html: string;
    oneClickUnsubscribeUrl: string;
    tag: string;
  },
): Promise<boolean> {
  return brevoPost("smtp/email", apiKey, {
    sender: { name: fromName(), email: FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    tags: [tag],
    headers: {
      "List-Unsubscribe": `<${oneClickUnsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  }, `scheduled_${tag}`);
}
