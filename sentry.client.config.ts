// Client-side Sentry initialisation.
// Runs in the browser — keep bundle impact minimal.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  // Raise once you've confirmed traces are flowing.
  tracesSampleRate: 0.1,

  // Record a session replay on 10% of sessions, 100% of sessions with errors.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only send errors in production — keeps dev console clean
  enabled: process.env.NODE_ENV === "production",

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
