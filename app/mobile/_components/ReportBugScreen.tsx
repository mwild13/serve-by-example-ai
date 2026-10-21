"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Screen from "./ui/Screen";
import { ButtonLink } from "./ui/parts";
import { useMobileSession } from "../_lib/mobile-session-context";

// Mobile notifications + bug-report pass (2026-08-25) — Settings > Support >
// "Report a Bug", sitting above "Help & FAQ" (SettingsScreen.tsx). Same
// full-screen dark shell as HelpScreen.tsx / SettingsScreen.tsx. Posts to
// POST /api/report-bug, which emails info@servebyexample.co — see that
// route for the send-only (no DB row) pattern, matching app/api/contact.
// Redesign phase 6: on the mobile frame, styles in the sm-form rules of
// app/styles/staff.css.

export default function ReportBugScreen() {
  const session = useMobileSession();
  const [screen, setScreen] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError("Please describe what went wrong in a bit more detail.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/report-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ description: description.trim(), screen: screen.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not send your report.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send your report.");
    }
  }

  const back = { href: "/mobile/settings", label: "Settings" };

  if (status === "sent") {
    return (
      <Screen title="Report a bug" back={back}>
        <div className="sm-form">
          <div className="sm-card sm-form-done" role="status">
            <CheckCircle2 size={44} strokeWidth={1.8} aria-hidden="true" />
            <h2 className="sm-card-title">Thanks for letting us know</h2>
            <p className="sm-card-sub">
              We&apos;ll look at it within 24 to 48 hours. Need help sooner? Email{" "}
              <a href="mailto:info@servebyexample.co" className="sm-inline-link">
                info@servebyexample.co
              </a>
              .
            </p>
            <ButtonLink href="/mobile/settings" variant="primary">
              Back to Settings
            </ButtonLink>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Report a bug" back={back}>
      <form onSubmit={handleSubmit} className="sm-form">
        <p className="sm-form-lead">Something broken or confusing? Tell us what happened and we&apos;ll take a look.</p>
        <div className="sm-card sm-form-card">
          <label className="sm-field">
            <span className="sm-field-label">Which screen? (optional)</span>
            <input className="sm-input" value={screen} onChange={(e) => setScreen(e.target.value)} placeholder="Learn, Live Guest, Me" />
          </label>
          <label className="sm-field">
            <span className="sm-field-label">What went wrong?</span>
            <textarea
              className="sm-input sm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened, what you expected, and the steps to make it happen again."
              rows={7}
            />
          </label>
        </div>
        {error && (
          <p className="sm-set-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="sm-btn sm-btn--primary sm-btn--block" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send report"}
        </button>
      </form>
    </Screen>
  );
}
