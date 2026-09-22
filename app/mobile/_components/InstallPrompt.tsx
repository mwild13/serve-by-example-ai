"use client";

import { useEffect, useState } from "react";
import { Smartphone, Share2, Download, X } from "lucide-react";

// Phase 6 mobile-responsive fix (2026-09-21) — "Add to Home Screen" nudge.
// manifest.json + icons + theme-color were already correctly set up, but
// nothing in the app ever surfaced an install path. Rendered as a row in
// SettingsScreen.tsx's Support area.
//
// iOS has no `beforeinstallprompt` event at all, so that path is always
// static Share-sheet instructions, never a native trigger — and it's gated
// to genuine Safari specifically, since Chrome-on-iOS (CriOS) and other
// in-app iOS browsers don't expose the same Share-sheet flow; showing
// Safari-specific instructions there would just confuse staff using a
// different browser. Android/Chrome gets the real native prompt via
// `beforeinstallprompt`.

const DISMISS_KEY = "sbe-mobile-install-dismissed";

type Platform = "ios-safari" | "android-chrome";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      // localStorage unavailable (private mode, etc.) — default to showing the nudge.
      setDismissed(false);
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
      setPlatform("ios-safari");
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android-chrome");
    }
    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Per-viewer convenience only — fine if it doesn't persist.
    }
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (installed || dismissed || !platform) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 16,
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-mobile)",
        border: "1px solid var(--border-mobile)",
        margin: "0 20px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Smartphone size={16} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-mobile)" }}>Install this app</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          style={{ background: "none", border: "none", padding: 4, margin: -4, cursor: "pointer", lineHeight: 0 }}
        >
          <X size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
        </button>
      </div>

      {platform === "ios-safari" ? (
        <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>
          Tap <Share2 size={13} strokeWidth={2} style={{ verticalAlign: "-2px", display: "inline" }} aria-hidden="true" /> Share,
          then &ldquo;Add to Home Screen&rdquo; for quicker access and a full-screen view.
        </p>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>
            Add this app to your home screen for quicker access and a full-screen view.
          </p>
          <button
            type="button"
            onClick={handleAndroidInstall}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: "var(--gold-mobile)",
              color: "var(--bg-mobile-dark)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            <Download size={14} strokeWidth={2} aria-hidden="true" />
            Install App
          </button>
        </>
      )}
    </div>
  );
}
