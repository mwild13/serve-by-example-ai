"use client";

import { useEffect } from "react";
import "./globals.css";

// Catches errors thrown in the root layout itself (providers, fonts, scripts)
// — app/error.tsx only catches errors in the tree below the root layout, so
// this is the last line of defence and must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="en-AU">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
            background: "var(--bg)",
            color: "var(--text)",
            fontFamily: "var(--font-manrope), sans-serif",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Something went wrong</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-soft)", maxWidth: 420 }}>
            An unexpected error occurred while loading the page. Please try again.
          </p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
