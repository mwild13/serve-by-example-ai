"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";
import { useErrorRetry } from "@/lib/use-error-retry";

// Route-level error boundary for /dashboard. Without it a render error falls
// through to app/error.tsx and the staff member loses the dashboard shell.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { retry, retrying } = useErrorRetry(reset);

  useEffect(() => {
    console.error("Dashboard failed to load:", error);
    void reportError(error, { digest: error.digest });
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
            fontFamily: "var(--font-heading)",
            fontSize: "1.35rem",
            color: "var(--text)",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Your dashboard couldn&rsquo;t load
        </h1>
        <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", marginBottom: 20 }}>
          Something went wrong on our side. Your progress is saved. Try again, or contact support if it keeps
          happening.
        </p>
        <button type="button" onClick={retry} disabled={retrying} className="btn btn-primary">
          {retrying ? "Trying again…" : "Try again"}
        </button>
      </div>
    </div>
  );
}
