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
    <main className="sbe-mkt-confirm-page">
      <div className="container">
        <div className="sbe-mkt-confirm">
          <p className="sbe-mkt-kicker">Something broke</p>
          <h1 className="sbe-mkt-display">Something went wrong.</h1>
          <p className="sbe-mkt-lede">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          <div className="sbe-mkt-confirm-actions">
            <button type="button" className="sbe-mkt-btn-primary" onClick={reset}>
              Try again
            </button>
            {/* A plain anchor: a full page load is the safest way out of a broken tree. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="sbe-mkt-btn-text">
              Back to home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
