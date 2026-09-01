"use client";

import { useEffect } from "react";

// Route-level error boundary for /management/dashboard. Needed now that the
// snapshot fetch starts server-side and streams in via Suspense/use()
// (see ManagerControlCenterLoader.tsx) — a genuine failure (RLS misconfig,
// transient DB error, etc.) throws during render instead of being caught by
// a route handler's try/catch, so it must land somewhere other than a blank
// white screen. Real errors are also no longer silently masked as fake seed
// data (see the ensureManagerVenue() fix in lib/management/service.ts), so
// this is the first time a manager could actually see one of these.
export default function ManagementDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Mission Control failed to load:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 28px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "1.35rem",
            color: "var(--text)",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Mission Control couldn&rsquo;t load
        </h1>
        <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", marginBottom: 20 }}>
          Something went wrong fetching your venue data. This has been logged
          &mdash; try again, or contact support if it keeps happening.
        </p>
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
