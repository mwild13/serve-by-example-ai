"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

// Route-level error boundary for /mobile. Without it a render error falls
// through to app/error.tsx, which is styled for the light marketing pages.
export default function MobileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Mobile screen failed to load:", error);
    void reportError(error, { digest: error.digest });
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "0 28px",
        textAlign: "center",
        background: "var(--bg-mobile-dark)",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-heading)",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-mobile)",
        }}
      >
        This screen couldn&rsquo;t load
      </h1>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
        Something went wrong on our side. Your progress is saved.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 8,
          padding: "12px 24px",
          borderRadius: "var(--radius-pill)",
          border: "none",
          background: "var(--gold-mobile)",
          color: "var(--bg-mobile-dark)",
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
