// Server-side Sentry initialisation.
// Runs in Node.js / Cloudflare Workers server context.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  enabled: process.env.NODE_ENV === "production",
});
