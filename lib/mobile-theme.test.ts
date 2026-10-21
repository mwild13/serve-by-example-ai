import { describe, expect, it } from "vitest";
import { MOBILE_DARK_CLASS, THEME_SCRIPT, parseThemeChoice, resolveDark } from "./mobile-theme";

describe("parseThemeChoice", () => {
  it("keeps light and dark", () => {
    expect(parseThemeChoice("light")).toBe("light");
    expect(parseThemeChoice("dark")).toBe("dark");
  });

  it("treats anything else as following the phone", () => {
    expect(parseThemeChoice(null)).toBe("system");
    expect(parseThemeChoice("")).toBe("system");
    expect(parseThemeChoice("DARK")).toBe("system");
  });
});

describe("resolveDark", () => {
  it("follows the phone by default", () => {
    expect(resolveDark("system", true)).toBe(true);
    expect(resolveDark("system", false)).toBe(false);
  });

  it("lets a choice in Settings win over the phone", () => {
    expect(resolveDark("light", true)).toBe(false);
    expect(resolveDark("dark", false)).toBe(true);
  });
});

// Runs the inline pre-paint script against a stand-in browser.
function runScript(stored: string | null, systemDark: boolean, storageThrows = false) {
  const classes = new Set<string>();
  const root = {
    classList: { toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)) },
    style: { colorScheme: "" },
  };
  const localStorage = {
    getItem: () => {
      if (storageThrows) throw new Error("blocked");
      return stored;
    },
  };
  const window = { matchMedia: () => ({ matches: systemDark }) };
  new Function("document", "localStorage", "window", THEME_SCRIPT)({ documentElement: root }, localStorage, window);
  return { dark: classes.has(MOBILE_DARK_CLASS), scheme: root.style.colorScheme };
}

describe("THEME_SCRIPT", () => {
  it("matches resolveDark for every choice", () => {
    for (const stored of [null, "light", "dark"]) {
      for (const systemDark of [true, false]) {
        expect(runScript(stored, systemDark).dark).toBe(resolveDark(parseThemeChoice(stored), systemDark));
      }
    }
  });

  it("sets the colour scheme for form controls and scroll bars", () => {
    expect(runScript("dark", false).scheme).toBe("dark");
    expect(runScript("light", true).scheme).toBe("light");
  });

  it("still follows the phone when storage is blocked", () => {
    expect(runScript(null, true, true).dark).toBe(true);
  });
});
