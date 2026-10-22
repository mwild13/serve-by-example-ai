// Light and dark mode for the staff mobile app (/mobile),
// docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md section 2.1.
//
// The choice is "system" (follow the phone) unless the person picks light or
// dark in Settings, saved per device in localStorage. Dark mode is the
// .sm-dark class on <html> (app/globals.css). THEME_SCRIPT runs inline in
// app/mobile/layout.tsx before the screen paints, so there is no flash of
// the wrong theme; MobileThemeSync keeps it right afterwards.

export type MobileThemeChoice = "system" | "light" | "dark";

export const MOBILE_THEME_KEY = "sbe-sm-theme";
export const MOBILE_DARK_CLASS = "sm-dark";

// Browser chrome colours: literal mirrors of --paper and --bottle
// (app/globals.css). A <meta name="theme-color"> can't read a CSS variable.
// eslint-disable-next-line sbe-design/no-hardcoded-hex
export const MOBILE_THEME_COLOR = { light: "#F8F6F0", dark: "#0E2A1E" } as const;

export function parseThemeChoice(value: string | null | undefined): MobileThemeChoice {
  return value === "light" || value === "dark" ? value : "system";
}

export function resolveDark(choice: MobileThemeChoice, systemDark: boolean): boolean {
  return choice === "dark" || (choice === "system" && systemDark);
}

export function readThemeChoice(): MobileThemeChoice {
  try {
    return parseThemeChoice(localStorage.getItem(MOBILE_THEME_KEY));
  } catch {
    return "system";
  }
}

export function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Puts the theme on <html> (.sm-dark also sets color-scheme) and the browser's address bar. */
export function applyMobileTheme(dark: boolean): void {
  document.documentElement.classList.toggle(MOBILE_DARK_CLASS, dark);
  const color = dark ? MOBILE_THEME_COLOR.dark : MOBILE_THEME_COLOR.light;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = color;
  });
}

/** Saves a choice from Settings and applies it straight away. */
export function saveThemeChoice(choice: MobileThemeChoice): void {
  try {
    if (choice === "system") localStorage.removeItem(MOBILE_THEME_KEY);
    else localStorage.setItem(MOBILE_THEME_KEY, choice);
  } catch {
    // Per-device convenience only: the choice still applies for this visit.
  }
  applyMobileTheme(resolveDark(choice, systemPrefersDark()));
  window.dispatchEvent(new Event(MOBILE_THEME_KEY));
}

/** The pre-paint script: the same rules as above, inlined and dependency free. */
export const THEME_SCRIPT = `(function(){try{var c=null;try{c=localStorage.getItem(${JSON.stringify(MOBILE_THEME_KEY)})}catch(e){}var d=c==="dark"||(c!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle(${JSON.stringify(MOBILE_DARK_CLASS)},d)}catch(e){}})();`;
