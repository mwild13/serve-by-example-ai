"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  OPEN_SETTINGS_EVENT,
  applyAnalyticsConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";

// Authenticated / utility shells where the banner UI must not appear.
// Stored consent is still applied on these routes (see the mount effect).
const HIDDEN_PREFIXES = [
  "/dashboard",
  "/management",
  "/mobile",
  "/login",
  "/onboarding",
  "/auth",
  "/reset-password",
  "/session-conflict",
  "/restricted",
  "/geo-block",
];

const SHOW_DELAY_MS = 1500;

export default function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Apply any stored choice, or schedule the first-visit prompt.
  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      applyAnalyticsConsent(stored.analytics);
      return;
    }
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Footer "Cookie settings" link reopens the banner with the panel showing.
  useEffect(() => {
    function reopen() {
      setAnalytics(readConsent()?.analytics ?? false);
      setPanelOpen(true);
      setVisible(true);
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (visible && panelOpen) rootRef.current?.focus();
  }, [visible, panelOpen]);

  const choose = useCallback((allowAnalytics: boolean) => {
    writeConsent(allowAnalytics);
    setVisible(false);
    setPanelOpen(false);
  }, []);

  if (!visible || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      tabIndex={-1}
    >
      <p id="cookie-banner-title" className="cookie-banner__title">
        Cookies, kept simple
      </p>
      <p id="cookie-banner-desc" className="cookie-banner__text">
        We use a few essential cookies to keep the site working. With your OK,
        we also use analytics to see which pages are useful. Nothing is used for
        advertising.{" "}
        <Link href="/cookies" className="cookie-banner__link">
          Cookie policy
        </Link>
      </p>

      {panelOpen ? (
        <div className="cookie-banner__panel">
          <div className="cookie-banner__row">
            <div>
              <span className="cookie-banner__row-name">Essential</span>
              <span className="cookie-banner__row-desc">
                Sign-in, security and site function. Always on.
              </span>
            </div>
            <span className="cookie-banner__always">Always on</span>
          </div>
          <label className="cookie-banner__row cookie-banner__row--toggle">
            <div>
              <span className="cookie-banner__row-name">Analytics</span>
              <span className="cookie-banner__row-desc">
                Google Analytics, anonymous page-visit counts.
              </span>
            </div>
            <input
              type="checkbox"
              role="switch"
              className="cookie-banner__switch"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
          </label>
          <div className="cookie-banner__actions">
            <button
              type="button"
              className="cookie-banner__btn cookie-banner__btn--primary"
              onClick={() => choose(analytics)}
            >
              Save choices
            </button>
            <button
              type="button"
              className="cookie-banner__btn cookie-banner__btn--secondary"
              onClick={() => setPanelOpen(false)}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cookie-banner__actions">
            <button
              type="button"
              className="cookie-banner__btn cookie-banner__btn--primary"
              onClick={() => choose(true)}
            >
              Accept all
            </button>
            <button
              type="button"
              className="cookie-banner__btn cookie-banner__btn--secondary"
              onClick={() => {
                setAnalytics(readConsent()?.analytics ?? false);
                setPanelOpen(true);
              }}
            >
              Customise
            </button>
          </div>
          <button
            type="button"
            className="cookie-banner__essential"
            onClick={() => choose(false)}
          >
            Essential only
          </button>
        </>
      )}
    </div>
  );
}
