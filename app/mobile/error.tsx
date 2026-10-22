"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";
import { useErrorRetry } from "@/lib/use-error-retry";

// Route-level error boundary for /mobile. Without it a render error falls
// through to app/error.tsx, which is styled for the light marketing pages.
export default function MobileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { retry, retrying } = useErrorRetry(reset);

  useEffect(() => {
    console.error("Mobile screen failed to load:", error);
    void reportError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="sm-screen sm-error" role="alert">
      <h1 className="sm-error-title">This screen couldn&rsquo;t load</h1>
      <p className="sm-error-text">Something went wrong on our side. Your progress is saved.</p>
      <button type="button" className="sm-btn sm-btn--primary" onClick={retry} disabled={retrying}>
        {retrying ? "Trying again…" : "Try again"}
      </button>
    </div>
  );
}
