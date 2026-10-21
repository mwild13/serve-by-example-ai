"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { detectInstallPlatform, type InstallPlatform } from "@/lib/install-platform";
import { trackEvent } from "@/lib/consent";

// Getting the app on the Home Screen, in the browser
// (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 4). Android Chrome offers its
// own install prompt once per page load (`beforeinstallprompt`); InstallWatch
// keeps it here from the first screen, so the guide and banner can show a
// real Install button later. iPhone has no such prompt: the guide's steps.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: BeforeInstallPromptEvent | null = null;
let installedNow = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());
const RECORDED_KEY = "sbe-app-installed-recorded";

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function currentPlatform(): InstallPlatform {
  return detectInstallPlatform(navigator.userAgent, navigator.maxTouchPoints);
}

/** Install prompts shown, tapped, dismissed or finished, by where and on what. */
export function trackInstall(action: "shown" | "tap" | "dismiss" | "done", where: string, platform: InstallPlatform) {
  trackEvent(`install_${action}`, { where, platform });
}

/** Counts and saves the install to the profile, once per phone. */
export function recordInstall(getToken: () => Promise<string>, platform: InstallPlatform, where: string) {
  try {
    if (localStorage.getItem(RECORDED_KEY)) return;
  } catch {
    // No storage: record anyway; the server keeps only the first.
  }
  trackInstall("done", where, platform);
  void getToken()
    .then((token) =>
      fetch("/api/profile/app-installed", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform }),
      }),
    )
    .then((res) => {
      if (!res.ok) return;
      try {
        localStorage.setItem(RECORDED_KEY, "1");
      } catch {
        // Fine: it is sent again next launch and ignored.
      }
    })
    .catch(() => undefined);
}

/** Starts listening, once, for Android's install prompt and a finished install. */
export function watchInstall(onInstalled: () => void): () => void {
  function onPrompt(event: Event) {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  }
  function onAppInstalled() {
    deferred = null;
    installedNow = true;
    notify();
    onInstalled();
  }
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onAppInstalled);
  };
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * This phone and browser (null until mounted, so the server render
 * matches), whether the app is already on the Home Screen, and Android's
 * own Install prompt when the browser has offered one.
 */
export function useInstall() {
  const [info, setInfo] = useState<{ platform: InstallPlatform; standalone: boolean } | null>(null);
  useEffect(() => {
    // Read once in the browser: the server has no navigator.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInfo({ platform: currentPlatform(), standalone: isStandalone() });
  }, []);
  const canPrompt = useSyncExternalStore(subscribe, () => deferred !== null, () => false);
  const installed = useSyncExternalStore(subscribe, () => installedNow, () => false);

  async function prompt(): Promise<boolean> {
    const event = deferred;
    if (!event) return false;
    await event.prompt();
    const { outcome } = await event.userChoice;
    // A prompt can be shown once.
    deferred = null;
    notify();
    return outcome === "accepted";
  }

  return {
    platform: info?.platform ?? null,
    standalone: info?.standalone ?? false,
    installed: installed || (info?.standalone ?? false),
    canPrompt,
    prompt,
  };
}
