/**
 * web-push.ts – Shift reminders by web push (Rich update, Phase 12, part 2).
 *
 * The pushes carry no message: the service worker (public/sw.js) shows a
 * fixed "Ready for your shift?" notification when one arrives. With no
 * payload there is nothing to encrypt, so a push is one POST to the browser's
 * push service with a signed VAPID header (RFC 8292), made with Web Crypto,
 * which Cloudflare Workers has built in.
 *
 * Keys: VAPID_PUBLIC_KEY (base64url, uncompressed P-256 point) and
 * VAPID_PRIVATE_JWK (the private key as JWK JSON), made once with
 * `node scripts/vapid-keys.mjs` and kept as secrets in Cloudflare.
 * VAPID_SUBJECT is a mailto: address push services can contact.
 *
 * Used by /api/push/subscription (saving a browser's subscription) and
 * /api/cron/reminders (sending).
 */

import "server-only";

/**
 * Push services the reminders may be sent to. The address comes from the
 * browser, so anything else is refused: the server must never be pointed at
 * an arbitrary URL.
 */
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/,
  /^updates\.push\.services\.mozilla\.com$/,
  /^web\.push\.apple\.com$/,
  /^[a-z0-9-]+\.push\.apple\.com$/,
  /^[a-z0-9-]+\.notify\.windows\.com$/,
];

/** Minutes after the chosen time a reminder can still go (cron runs every 15). */
const REMINDER_WINDOW_MINUTES = 60;

export function isPushEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 1000) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && url.port === "" && PUSH_HOSTS.some((host) => host.test(url.hostname));
}

/** A browser key: base64url, a sensible length. */
export function isPushKey(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= max && /^[A-Za-z0-9_-]+=*$/.test(value);
}

function base64url(bytes: Uint8Array | string): string {
  const binary = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** A VAPID JWT for one push service, valid for 12 hours. */
export async function vapidJwt(endpoint: string, subject: string, privateJwk: JsonWebKey, now: number = Date.now()): Promise<string> {
  const key = await crypto.subtle.importKey("jwk", privateJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const header = base64url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const claims = base64url(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: subject }));
  const signed = `${header}.${claims}`;
  // Web Crypto's ECDSA signature is r and s side by side, which is what ES256 wants.
  const signature = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(signed)));
  return `${signed}.${base64url(signature)}`;
}

export type VapidConfig = { publicKey: string; privateJwk: JsonWebKey; subject: string };

/** The VAPID keys from the environment, or null when they aren't set yet. */
export function vapidConfig(): VapidConfig | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const jwk = process.env.VAPID_PRIVATE_JWK;
  const subject = process.env.VAPID_SUBJECT || "mailto:info@servebyexample.co";
  if (!publicKey || !jwk) return null;
  try {
    return { publicKey, privateJwk: JSON.parse(jwk) as JsonWebKey, subject };
  } catch {
    console.error("VAPID_PRIVATE_JWK is not valid JSON");
    return null;
  }
}

export type PushOutcome = "sent" | "gone" | "failed";

/** Sends one empty push. "gone" means the browser unsubscribed: delete it. */
export async function sendPush(endpoint: string, config: VapidConfig): Promise<PushOutcome> {
  if (!isPushEndpoint(endpoint)) return "gone";
  try {
    const jwt = await vapidJwt(endpoint, config.subject, config.privateJwk);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `vapid t=${jwt}, k=${config.publicKey}`, TTL: "7200", Urgency: "high", "Content-Length": "0" },
    });
    if (res.status === 404 || res.status === 410) return "gone";
    return res.ok ? "sent" : "failed";
  } catch (error) {
    console.error("push failed:", error);
    return "failed";
  }
}

export type ReminderRow = {
  user_id: string;
  shift_days: number[] | null;
  /** "HH:MM" or "HH:MM:SS", Sydney time. */
  reminder_time: string | null;
  last_reminded_on: string | null;
};

/** Sydney date, weekday and minutes past midnight. */
export function sydneyClock(at: Date): { date: string; weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    weekday: weekdays[part("weekday")] ?? -1,
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

/** "16:30" or "16:30:00" as minutes past midnight, or null. */
export function reminderMinutes(time: string | null): number | null {
  const match = time ? /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time) : null;
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return Number(match[1]) < 24 && Number(match[2]) < 60 ? minutes : null;
}

/**
 * Who gets a reminder now: their time has come in the last hour, today is
 * one of their shift days (or they work every day), they haven't had one
 * today, and they haven't done today's pre-shift drill already.
 */
export function dueReminders(rows: ReminderRow[], clock: { date: string; weekday: number; minutes: number }, doneToday: ReadonlySet<string>): string[] {
  return rows
    .filter((row) => {
      const at = reminderMinutes(row.reminder_time);
      if (at === null || row.last_reminded_on === clock.date || doneToday.has(row.user_id)) return false;
      const days = row.shift_days ?? [];
      if (days.length > 0 && !days.includes(clock.weekday)) return false;
      return clock.minutes >= at && clock.minutes < at + REMINDER_WINDOW_MINUTES;
    })
    .map((row) => row.user_id);
}
