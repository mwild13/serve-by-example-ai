"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

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
      void reportError(event.error ?? event.message, { handled: false });
    };

    // Log unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[Unhandled Promise Rejection]", {
        reason: event.reason,
        timestamp: new Date().toISOString(),
      });
      void reportError(event.reason, { handled: false });
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
