// Sends an error to Sentry, from the browser or from the server.
//
// There is no Sentry SDK in this build. The Next.js SDK is heavy enough to
// threaten the Cloudflare worker's size limit, so this posts the event to
// Sentry's envelope endpoint with fetch, which costs nothing in either bundle.
//
// What is sent: the error's type, message and stack trace, the page or route
// it happened on (path only, never the query string), and whether it came
// from the browser or the server. No cookie is set, nothing is stored in the
// browser, and no user id, email or IP address is attached.
//
// With NEXT_PUBLIC_SENTRY_DSN unset, every call does nothing.

type ErrorContext = {
  /** The route pattern or API path, for example "/api/billing/webhook". */
  route?: string;
  /** The request URL on the server. The browser uses the page's own. */
  url?: string;
  /** Next.js's digest, which ties a browser error page to its server log line. */
  digest?: string;
  /** False for an error that reached a global handler instead of a catch. */
  handled?: boolean;
};

type Frame = { filename: string; function?: string; lineno: number; colno: number; in_app: boolean };

const PRODUCTION_HOST = "servebyexample.co";
const MAX_MESSAGE_CHARS = 1000;
const MAX_FRAMES = 50;
const MAX_EVENTS_PER_MINUTE = 20;
const SEND_TIMEOUT_MS = 2000;

// Browser noise that is not a fault in this site. The Supabase lock one:
// when a sign-in check holds the auth lock over 5 seconds (slow wifi, a
// phone pausing a tab), the next check takes it over and the first throws.
// Supabase recovers on its own; the next call has the session.
const IGNORED_MESSAGES = [/^Script error\.?$/, /ResizeObserver loop/, /^Lock "lock:sb-.*" was released because another request stole it$/];
const EXTENSION_FRAME = /^(chrome|moz|safari(-web)?)-extension:/;

type Dsn = { origin: string; endpoint: string };

function parseDsn(raw: string | undefined): Dsn | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const projectId = url.pathname.replace(/^\/+/, "");
    if (!url.username || !projectId) return null;
    return {
      origin: url.origin,
      endpoint: `${url.origin}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${url.username}`,
    };
  } catch {
    return null;
  }
}

const DSN = parseDsn(process.env.NEXT_PUBLIC_SENTRY_DSN);

/** The host error reports are posted to, for connect-src in middleware.ts. Null when reporting is off. */
export function errorReportingOrigin(): string | null {
  return DSN?.origin ?? null;
}

/**
 * Turns a stack string into Sentry's frames, oldest call first. Reads both
 * shapes browsers and workers produce: "at fn (file:1:2)" and "fn@file:1:2".
 */
export function parseStack(stack: string | undefined): Frame[] {
  if (!stack) return [];
  const frames: Frame[] = [];
  for (const line of stack.split("\n")) {
    const match =
      /^\s*at (?:async )?(?:(.+?) \()?(.+?):(\d+):(\d+)\)?\s*$/.exec(line) ??
      /^\s*(.*?)@(.+?):(\d+):(\d+)\s*$/.exec(line);
    if (!match) continue;
    frames.push({
      ...(match[1] ? { function: match[1] } : {}),
      filename: match[2],
      lineno: Number(match[3]),
      colno: Number(match[4]),
      in_app: !match[2].includes("node_modules"),
    });
    if (frames.length === MAX_FRAMES) break;
  }
  return frames.reverse();
}

function pathOnly(url: string | undefined): { href?: string; host?: string } {
  if (!url) return {};
  try {
    const parsed = new URL(url);
    return { href: `${parsed.origin}${parsed.pathname}`, host: parsed.hostname };
  } catch {
    return {};
  }
}

function eventId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/** The envelope body for one error. Exported for the tests. */
export function buildEnvelope(error: unknown, context: ErrorContext, runtime: "browser" | "server", now = new Date()) {
  const asError = error instanceof Error ? error : new Error(typeof error === "string" ? error : "Non-error value thrown");
  const { href, host } = pathOnly(context.url);
  const environment = !host ? "unknown" : host === PRODUCTION_HOST || host === `www.${PRODUCTION_HOST}` ? "production" : "preview";
  const id = eventId();
  const event = {
    event_id: id,
    timestamp: now.getTime() / 1000,
    platform: "javascript",
    level: "error",
    environment,
    tags: {
      runtime,
      ...(context.route ? { route: context.route } : {}),
      ...(context.digest ? { digest: context.digest } : {}),
    },
    ...(href ? { request: { url: href } } : {}),
    exception: {
      values: [
        {
          type: asError.name || "Error",
          value: asError.message.slice(0, MAX_MESSAGE_CHARS),
          stacktrace: { frames: parseStack(asError.stack) },
          mechanism: { type: "generic", handled: context.handled ?? true },
        },
      ],
    },
  };
  const header = { event_id: id, sent_at: now.toISOString() };
  return { event, body: `${JSON.stringify(header)}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}\n` };
}

// A fault in a loop must not flood Sentry or the page. Counted per browser
// tab, and per worker instance on the server.
let windowStart = 0;
let sentInWindow = 0;
const recentlySent = new Set<string>();

function allow(key: string, now: number): boolean {
  if (now - windowStart > 60_000) {
    windowStart = now;
    sentInWindow = 0;
    recentlySent.clear();
  }
  // The same error often arrives twice: once from an error boundary and once
  // from the window's own handler.
  if (recentlySent.has(key) || sentInWindow >= MAX_EVENTS_PER_MINUTE) return false;
  recentlySent.add(key);
  sentInWindow += 1;
  return true;
}

/**
 * Reports one error. Never throws and never rejects. On the server, await it:
 * a Cloudflare worker stops outstanding requests once the response is sent.
 */
export async function reportError(error: unknown, context: ErrorContext = {}): Promise<void> {
  if (!DSN || process.env.NODE_ENV === "development") return;
  try {
    const inBrowser = typeof window !== "undefined";
    const url = context.url ?? (inBrowser ? window.location.href : undefined);
    const { event, body } = buildEnvelope(error, { ...context, url }, inBrowser ? "browser" : "server");

    const exception = event.exception.values[0];
    if (IGNORED_MESSAGES.some((pattern) => pattern.test(exception.value))) return;
    const frames = exception.stacktrace.frames;
    if (frames.some((frame) => EXTENSION_FRAME.test(frame.filename))) return;
    const top = frames[frames.length - 1];
    if (!allow(`${exception.type}:${exception.value}:${top?.filename ?? ""}:${top?.lineno ?? 0}`, Date.now())) return;

    await fetch(DSN.endpoint, {
      method: "POST",
      // A simple content type, so the browser sends no preflight request.
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body,
      keepalive: inBrowser,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  } catch {
    // Reporting an error must never cause another one.
  }
}
