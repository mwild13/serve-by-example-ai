// Which phone and browser someone is on, and how they add Serve By Example
// to their Home Screen from there (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md
// section 4). Pure, so it is tested against real user agent strings; the
// install guide (/mobile/install) draws each step's picture from `pic`.

export type InstallPlatform =
  /** iPhone Safari on iOS 26 or later: the "..." button, then Share. */
  | "ios-safari"
  /** iPhone Safari on iOS 16.4 to 18: Share in the toolbar. */
  | "ios-safari-legacy"
  /** Chrome, Edge or Firefox on iPhone: Share in the address bar. */
  | "ios-chrome"
  /** Inside Instagram, Facebook and the like on iPhone: open it in Safari first. */
  | "in-app-ios"
  /** Chrome, Edge and most other Android browsers. */
  | "android-chrome"
  | "android-samsung"
  /** Inside another app on Android: open it in Chrome first. */
  | "in-app-android"
  | "desktop";

/** The ones a person can pick under "Different phone?". */
export const PICKABLE_PLATFORMS: InstallPlatform[] = ["ios-safari", "ios-safari-legacy", "ios-chrome", "android-chrome", "android-samsung"];

const ALL: InstallPlatform[] = [...PICKABLE_PLATFORMS, "in-app-ios", "in-app-android", "desktop"];

export function isInstallPlatform(value: unknown): value is InstallPlatform {
  return typeof value === "string" && (ALL as string[]).includes(value);
}

export const PLATFORM_LABEL: Record<InstallPlatform, string> = {
  "ios-safari": "iPhone, Safari",
  "ios-safari-legacy": "iPhone, Safari on iOS 18 or earlier",
  "ios-chrome": "iPhone, Chrome or another browser",
  "in-app-ios": "iPhone, inside another app",
  "android-chrome": "Android, Chrome",
  "android-samsung": "Android, Samsung Internet",
  "in-app-android": "Android, inside another app",
  desktop: "Computer",
};

// Apps that open links in their own browser, where Add to Home Screen isn't offered.
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|musical_ly|BytedanceWebview|TikTok|Snapchat|Line\/|GSA\//;

/** `maxTouchPoints` tells an iPad (which says it's a Mac) from a Mac. */
export function detectInstallPlatform(ua: string, maxTouchPoints = 0): InstallPlatform {
  const ios = /iPhone|iPod|iPad/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  if (ios) {
    if (IN_APP.test(ua)) return "in-app-ios";
    if (/CriOS|FxiOS|EdgiOS/.test(ua)) return "ios-chrome";
    const safari = /Version\/(\d+)/.exec(ua);
    // No "Version/" and no "Safari": another app's own web view.
    if (!safari || !/Safari\//.test(ua)) return "in-app-ios";
    return Number(safari[1]) >= 26 ? "ios-safari" : "ios-safari-legacy";
  }
  if (/Android/.test(ua)) {
    if (IN_APP.test(ua) || /; wv\)/.test(ua)) return "in-app-android";
    if (/SamsungBrowser/.test(ua)) return "android-samsung";
    return "android-chrome";
  }
  return "desktop";
}

export function isIosPlatform(platform: InstallPlatform): boolean {
  return platform === "ios-safari" || platform === "ios-safari-legacy" || platform === "ios-chrome" || platform === "in-app-ios";
}

/** A step's picture, drawn by the guide in CSS. */
export type StepPic =
  /** A browser bar with one button lit: Safari's "..." or Share, Chrome's menu. */
  | { kind: "bar"; button: "dots" | "share" | "menu-dots" | "menu-lines"; at: "top" | "bottom" }
  /** A menu row to tap, after an optional plain one. */
  | { kind: "menu"; first?: string; tap: string; icon: "share" | "add" | "home" }
  /** The confirming sheet: Add (iPhone) or Install (Android), with Safari's web app switch on iOS 26. */
  | { kind: "confirm"; title: string; button: string; webAppSwitch?: boolean };

export type InstallStep = { title: string; pic: StepPic };

export const INSTALL_STEPS: Record<Exclude<InstallPlatform, "in-app-ios" | "in-app-android" | "desktop">, InstallStep[]> = {
  "ios-safari": [
    { title: "Tap the three dots", pic: { kind: "bar", button: "dots", at: "bottom" } },
    { title: "Share, then Add to Home Screen", pic: { kind: "menu", first: "Share", tap: "Add to Home Screen", icon: "add" } },
    { title: "Keep Open as Web App on, tap Add", pic: { kind: "confirm", title: "Add to Home Screen", button: "Add", webAppSwitch: true } },
  ],
  "ios-safari-legacy": [
    { title: "Tap Share at the bottom", pic: { kind: "bar", button: "share", at: "bottom" } },
    { title: "Scroll down, tap Add to Home Screen", pic: { kind: "menu", tap: "Add to Home Screen", icon: "add" } },
    { title: "Tap Add", pic: { kind: "confirm", title: "Add to Home Screen", button: "Add" } },
  ],
  "ios-chrome": [
    { title: "Tap Share in the address bar", pic: { kind: "bar", button: "share", at: "top" } },
    { title: "Tap Add to Home Screen", pic: { kind: "menu", tap: "Add to Home Screen", icon: "add" } },
    { title: "Tap Add", pic: { kind: "confirm", title: "Add to Home Screen", button: "Add" } },
  ],
  "android-chrome": [
    { title: "Tap the three dots at the top", pic: { kind: "bar", button: "menu-dots", at: "top" } },
    { title: "Tap Add to Home screen", pic: { kind: "menu", tap: "Add to Home screen", icon: "home" } },
    { title: "Tap Install", pic: { kind: "confirm", title: "Install app", button: "Install" } },
  ],
  "android-samsung": [
    { title: "Tap the menu at the bottom", pic: { kind: "bar", button: "menu-lines", at: "bottom" } },
    { title: "Tap Add page to", pic: { kind: "menu", tap: "Add page to", icon: "add" } },
    { title: "Tap Home screen, then Add", pic: { kind: "confirm", title: "Add to Home screen", button: "Add" } },
  ],
};

/** What the Home banner remembers on this phone. */
export type InstallBannerState = { visits: number; dismissals: number; dismissedAt: number | null };

const BANNER_BACK_AFTER_MS = 14 * 86_400_000;

/** From the second visit; once dismissed, back once after 14 days, then never. */
export function installBannerDue(state: InstallBannerState, now: number): boolean {
  if (state.visits < 2) return false;
  if (state.dismissals === 0) return true;
  return state.dismissals === 1 && state.dismissedAt !== null && now - state.dismissedAt >= BANNER_BACK_AFTER_MS;
}

/** Reads the stored state, starting over from anything unexpected. */
export function parseBannerState(raw: string | null): InstallBannerState {
  try {
    const value = JSON.parse(raw ?? "") as Partial<InstallBannerState>;
    return {
      visits: Number.isInteger(value.visits) ? Number(value.visits) : 0,
      dismissals: Number.isInteger(value.dismissals) ? Number(value.dismissals) : 0,
      dismissedAt: typeof value.dismissedAt === "number" ? value.dismissedAt : null,
    };
  } catch {
    return { visits: 0, dismissals: 0, dismissedAt: null };
  }
}
