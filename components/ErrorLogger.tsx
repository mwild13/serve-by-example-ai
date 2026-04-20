"use client";

import { useEffect } from "react";

export default function ErrorLogger() {
  useEffect(() => {
    // Log unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error("[Frontend Error]", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack || event.error,
        timestamp: new Date().toISOString(),
      });
    };

    // Log unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[Unhandled Promise Rejection]", {
        reason: event.reason,
        timestamp: new Date().toISOString(),
      });
    };

    // Add listeners
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
