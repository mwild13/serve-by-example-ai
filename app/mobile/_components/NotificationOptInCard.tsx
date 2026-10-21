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
    <div className="sm-section">
      <div className="sm-card sm-notice">
        <span className="sm-icon-circle">
          <Mail size={20} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div className="sm-notice-text">
          <p className="sm-card-title">Want a weekly nudge?</p>
          <p className="sm-card-sub">
            A Monday progress summary and a Sunday reminder by email. Both are off until you turn them on.
          </p>
          <Link href="/mobile/settings#notifications" onClick={markDismissed} className="sm-textlink">
            Choose in Settings
          </Link>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="sm-icon-btn sm-notice-close">
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
