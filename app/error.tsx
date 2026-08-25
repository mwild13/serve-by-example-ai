"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error Boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Something went wrong</h2>
      <p style={{ marginBottom: "2rem", color: "var(--text-soft)", maxWidth: 420 }}>
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <button type="button" className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
