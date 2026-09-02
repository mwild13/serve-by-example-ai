"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMobileSession } from "../_lib/mobile-session-context";

// Mobile bugfix pass (2026-09-02) — Settings > Support > "Contact support"
// used to send mobile users out to the public marketing /contact page (a
// full page with its own Navbar/Footer, not meant for the app shell). This
// is the in-app answer: the same message form and direct-email/venue-plans
// copy, posting to the same POST /api/contact route the marketing page
// uses, same full-screen shell + success state pattern as
// ReportBugScreen.tsx, so mobile users never leave the app.

const VENUE_TYPES = ["Bar / Pub", "Restaurant", "Hotel F&B", "Events venue", "Other"];

const shellStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: 390,
  margin: "0 auto",
  minHeight: "100dvh",
  background: "var(--bg-mobile-dark)",
  fontFamily: "var(--font-body)",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "var(--radius-sm)",
  background: "var(--surface-mobile-alt)",
  border: "1px solid var(--border-mobile)",
  color: "var(--text-mobile)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  outline: "none",
};

function BackHeader({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>Settings</span>
    </button>
  );
}

export default function ContactSupportScreen() {
  const router = useRouter();
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

  if (status === "sent") {
    return (
      <div style={shellStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
          <BackHeader onBack={() => router.back()} />
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 32px 80px", textAlign: "center" }}>
          <CheckCircle2 size={48} strokeWidth={1.5} color="var(--gold-mobile)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-mobile)" }}>Message sent</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: "var(--text-mobile-muted)" }}>
            Thanks — we&apos;ll be in touch within one business day. You can also reach us any time at{" "}
            <a href="mailto:info@servebyexample.co" style={{ color: "var(--gold-mobile)", fontWeight: 600 }}>
              info@servebyexample.co
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => router.push("/mobile/settings")}
            style={{
              marginTop: 8,
              padding: "10px 20px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: "var(--gold-mobile)",
              color: "var(--bg-mobile-dark)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
        <BackHeader onBack={() => router.back()} />
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Contact support</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
          Questions, partnership enquiries, or just want to see if we&apos;re a fit — we&apos;d love to hear from
          you.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 20px" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Direct email</p>
        <a href="mailto:info@servebyexample.co" style={{ fontSize: 14, fontWeight: 600, color: "var(--gold-mobile)" }}>
          info@servebyexample.co
        </a>
        <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>
          We reply to all enquiries within one business day.
        </p>
      </div>

      <div style={{ height: 1, background: "var(--border-mobile)", margin: "0 20px 20px" }} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 20px 40px" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>Send a message</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required style={inputStyle} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="jane@yourvenue.com"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>
            Venue name <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span>
          </label>
          <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="The Crown Hotel" style={inputStyle} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>
            Venue type <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span>
          </label>
          <select value={venueType} onChange={(e) => setVenueType(e.target.value)} style={inputStyle}>
            <option value="">Select a type</option>
            {VENUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your team and what you're looking for..."
            required
            rows={5}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Honeypot — hidden from real users, bots tend to fill every field */}
        <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
          <label htmlFor="mobile-contact-website">Website</label>
          <input id="mobile-contact-website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </div>

        {error && <p style={{ margin: 0, fontSize: 12, color: "var(--red-mobile)" }}>{error}</p>}

        <button
          type="submit"
          disabled={status === "sending"}
          style={{
            padding: "12px 20px",
            borderRadius: "var(--radius-pill)",
            border: "none",
            background: "var(--gold-mobile)",
            color: "var(--bg-mobile-dark)",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 700,
            cursor: status === "sending" ? "default" : "pointer",
            opacity: status === "sending" ? 0.7 : 1,
          }}
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>

      <div style={{ height: 1, background: "var(--border-mobile)", margin: "0 20px 20px" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 40px" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>For venues &amp; groups</p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>
          Looking to onboard your whole team? Visit our For Venues page to explore multi-staff plans and venue
          rollout options.
        </p>
      </div>
    </div>
  );
}
