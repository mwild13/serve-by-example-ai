// Cookie consent storage + Google Analytics gating.
// Consent lives in localStorage (per-browser convenience, not a secret). Bump
// CONSENT_VERSION to re-prompt every visitor after a material policy change.

export const CONSENT_KEY = "sbe-cookie-consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "sbe:consent";
export const OPEN_SETTINGS_EVENT = "sbe:open-cookie-settings";

const GA_ID = "G-EF9YRFXKBG";

export type ConsentRecord = { v: number; analytics: boolean; ts: number };

type GaWindow = Window &
  typeof globalThis & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    _sbeGaLoaded?: boolean;
    [key: `ga-disable-${string}`]: boolean | undefined;
  };

export function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as ConsentRecord).v === CONSENT_VERSION &&
      typeof (parsed as ConsentRecord).analytics === "boolean"
    ) {
      return parsed as ConsentRecord;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): ConsentRecord {
  const record: ConsentRecord = { v: CONSENT_VERSION, analytics, ts: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked (private window etc.) — the choice still applies this page view.
  }
  applyAnalyticsConsent(analytics);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));
  return record;
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

function clearGaCookies(): void {
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = [host, `.${host}`];
  if (parts.length > 2) domains.push(`.${parts.slice(-2).join(".")}`);
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]?.trim();
    if (!name || !(name === "_ga" || name.startsWith("_ga_") || name === "_gid")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

// Loads gtag.js only after the visitor opts in. Injected from the client bundle
// (no inline script) so it works under the strict-dynamic CSP in middleware.ts.
export function applyAnalyticsConsent(analytics: boolean): void {
  if (typeof window === "undefined") return;
  const w = window as GaWindow;

  if (!analytics) {
    // gtag.js cannot be unloaded once running; this flag stops it sending hits.
    w[`ga-disable-${GA_ID}`] = true;
    if (w._sbeGaLoaded) clearGaCookies();
    return;
  }

  w[`ga-disable-${GA_ID}`] = false;
  if (w._sbeGaLoaded) return;
  w._sbeGaLoaded = true;

  const dataLayer: unknown[] = (w.dataLayer = w.dataLayer || []);
  w.gtag = function gtag() {
    // gtag.js requires the real `arguments` object, not a rest array.
    dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
}
