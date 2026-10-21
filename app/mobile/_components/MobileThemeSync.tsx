"use client";

import { useEffect } from "react";
import {
  MOBILE_DARK_CLASS,
  MOBILE_THEME_KEY,
  applyMobileTheme,
  readThemeChoice,
  resolveDark,
  systemPrefersDark,
} from "@/lib/mobile-theme";

// Keeps light and dark mode right after the first paint (the inline script
// in app/mobile/layout.tsx handles the first paint itself): when the phone
// switches mode, when Settings saves a choice, and when another tab does.
// Takes dark mode off <html> on the way out of /mobile.
export default function MobileThemeSync() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyMobileTheme(resolveDark(readThemeChoice(), systemPrefersDark()));
    const onStorage = (e: StorageEvent) => {
      if (e.key === MOBILE_THEME_KEY) sync();
    };

    sync();
    media.addEventListener("change", sync);
    window.addEventListener(MOBILE_THEME_KEY, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener(MOBILE_THEME_KEY, sync);
      window.removeEventListener("storage", onStorage);
      document.documentElement.classList.remove(MOBILE_DARK_CLASS);
    };
  }, []);

  return null;
}
