"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, X } from "lucide-react";

// One-off card on mobile Home pointing to Settings > Notifications, added
// with the digest and reminder sender (2026-10-17). Shows only while both
// emails are off and until it is dismissed or tapped, once per device. It
// never turns anything on itself: opting in stays a choice made in Settings,
// with its confirm dialog, and nobody is emailed about it.

const DISMISSED_KEY = "sbe-notif-optin-card-dismissed";

function markDismissed() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Private mode or blocked storage: the card may show again, which is fine.
  }
}

export default function NotificationOptInCard({ token }: { token: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function check() {
      try {
        if (window.localStorage.getItem(DISMISSED_KEY)) return;
      } catch {
        // Storage unreadable: fall through and ask the server.
      }
      try {
        const res = await fetch("/api/profile/notifications", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = (await res.json()) as { notifReminders: boolean; notifWeeklyDigest: boolean };
        if (!cancelled && !data.notifReminders && !data.notifWeeklyDigest) setVisible(true);
      } catch {
        // Non-critical: no card.
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!visible) return null;

  function dismiss() {
    markDismissed();
    setVisible(false);
  }

  return (
    <div style={{ padding: "0 20px 16px" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: 14,
          paddingRight: 40,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--border-mobile)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "var(--radius-pill)",
            background: "var(--green-mobile-bg)",
            flexShrink: 0,
          }}
        >
          <Mail size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-mobile)" }}>Want a weekly nudge?</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: "var(--text-mobile-muted)" }}>
            A Monday progress summary and a Sunday reminder by email. Both are off until you turn them on.
          </p>
          <Link
            href="/mobile/settings#notifications"
            onClick={markDismissed}
            style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "var(--gold-mobile)", textDecoration: "none" }}
          >
            Choose in Settings
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            border: "none",
            borderRadius: "var(--radius-pill)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <X size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
