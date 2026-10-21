"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import Screen from "./ui/Screen";
import { ButtonLink } from "./ui/parts";
import { useMobileSession } from "../_lib/mobile-session-context";

// Mobile bugfix pass (2026-09-02) — Settings > Support > "Contact support"
// used to send mobile users out to the public marketing /contact page (a
// full page with its own Navbar/Footer, not meant for the app shell). This
// is the in-app answer: the same message form and direct-email/venue-plans
// copy, posting to the same POST /api/contact route the marketing page
// uses, same full-screen shell + success state pattern as
// ReportBugScreen.tsx, so mobile users never leave the app.
// Redesign phase 6: on the mobile frame, styles in the sm-form rules of
// app/styles/staff.css.

const VENUE_TYPES = ["Bar / Pub", "Restaurant", "Hotel F&B", "Events venue", "Other"];

export default function ContactSupportScreen() {
  const session = useMobileSession();
  const [name, setName] = useState(session.displayName ?? "");
  const [email, setEmail] = useState(session.userEmail ?? "");
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (website) return;
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, venueName, venueType, message, website }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send message. Please try again.");
    }
  }

  const back = { href: "/mobile/settings", label: "Settings" };

  if (status === "sent") {
    return (
      <Screen title="Contact support" back={back}>
        <div className="sm-form">
          <div className="sm-card sm-form-done" role="status">
            <CheckCircle2 size={44} strokeWidth={1.8} aria-hidden="true" />
            <h2 className="sm-card-title">Message sent</h2>
            <p className="sm-card-sub">
              Thanks. We&apos;ll be in touch within one business day. You can also email{" "}
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
    <Screen title="Contact support" back={back}>
      <form onSubmit={handleSubmit} className="sm-form">
        <p className="sm-form-lead">
          Questions about the app, your plan or your venue. Or email{" "}
          <a href="mailto:info@servebyexample.co" className="sm-inline-link">
            info@servebyexample.co
          </a>
          ; we reply within one business day.
        </p>
        <div className="sm-card sm-form-card">
          <label className="sm-field">
            <span className="sm-field-label">Your name</span>
            <input className="sm-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
          <label className="sm-field">
            <span className="sm-field-label">Email</span>
            <input className="sm-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" inputMode="email" required />
          </label>
          <label className="sm-field">
            <span className="sm-field-label">Venue name (optional)</span>
            <input className="sm-input" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
          </label>
          <label className="sm-field">
            <span className="sm-field-label">Venue type (optional)</span>
            <select className="sm-input sm-select" value={venueType} onChange={(e) => setVenueType(e.target.value)}>
              <option value="">Choose a type</option>
              {VENUE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="sm-field">
            <span className="sm-field-label">Message</span>
            <textarea
              className="sm-input sm-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              required
              rows={5}
            />
          </label>
        </div>

        {/* Honeypot: hidden from people, bots tend to fill every field.
            sr-only-hp, not an off-screen position, which once widened the
            page past the screen on iPhone. */}
        <div className="sr-only-hp" aria-hidden="true">
          <label htmlFor="mobile-contact-website">Website</label>
          <input id="mobile-contact-website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </div>

        {error && (
          <p className="sm-set-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="sm-btn sm-btn--primary sm-btn--block" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>
    </Screen>
  );
}
