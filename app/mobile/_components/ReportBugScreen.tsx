"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMobileSession } from "../_lib/mobile-session-context";

// Mobile notifications + bug-report pass (2026-08-25) — Settings > Support >
// "Report a Bug", sitting above "Help & FAQ" (SettingsScreen.tsx). Same
// full-screen dark shell as HelpScreen.tsx / SettingsScreen.tsx. Posts to
// POST /api/report-bug, which emails info@servebyexample.co — see that
// route for the send-only (no DB row) pattern, matching app/api/contact.

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

export default function ReportBugScreen() {
  const router = useRouter();
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

  if (status === "sent") {
    return (
      <div style={shellStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>Settings</span>
          </button>
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 32px 80px", textAlign: "center" }}>
          <CheckCircle2 size={48} strokeWidth={1.5} color="var(--gold-mobile)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-mobile)" }}>Thanks for letting us know</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: "var(--text-mobile-muted)" }}>
            Our team will get this fixed within 24–48 hours. If you need help sooner or have any further questions, reach us
            any time at{" "}
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
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>Settings</span>
        </button>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Report a Bug</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
          Found something broken or confusing? Tell us what happened and our team will take a look.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 20px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Which screen? (optional)</label>
          <input
            value={screen}
            onChange={(e) => setScreen(e.target.value)}
            placeholder="e.g. Modules, Live Arena, Me page"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-mobile-alt)",
              border: "1px solid var(--border-mobile)",
              color: "var(--text-mobile)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>What&apos;s wrong?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what happened, what you expected instead, and any steps to reproduce it."
            rows={7}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-mobile-alt)",
              border: "1px solid var(--border-mobile)",
              color: "var(--text-mobile)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
            }}
          />
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
          {status === "sending" ? "Sending…" : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
