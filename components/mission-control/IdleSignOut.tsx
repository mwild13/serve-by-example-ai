"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOutEverywhere } from "@/lib/sign-out";

// Signs the Manager Console out after 10 minutes with no activity, with a
// minute's warning first. A console left open on a shared office or bar
// computer would otherwise stay signed in for good: SessionRefresher renews
// the token every five minutes whether anyone is there or not.
//
// Activity is shared between tabs through localStorage, so working in one
// tab keeps the others open. The clock is the last activity time, not a
// timer, so a laptop that slept past the limit signs out the moment it wakes.
// Signing out revokes the session on the server, not only in this browser
// (lib/sign-out.ts).

const IDLE_LIMIT_MS = 10 * 60_000;
const WARNING_MS = 60_000;
const CHECK_EVERY_MS = 5_000;
const SAVE_EVERY_MS = 15_000;
const STORAGE_KEY = "sbe_mc_last_active";
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

function readShared(): number {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeShared(at: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(at));
  } catch {
    // Private mode or blocked storage: this tab still times itself.
  }
}

export default function IdleSignOut() {
  const lastActive = useRef(0);
  const lastSaved = useRef(0);
  const signingOut = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const stayRef = useRef<HTMLButtonElement>(null);
  // The activity listener reads the warning state without re-subscribing.
  const secondsLeftRef = useRef<number | null>(null);
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);
  const warningOpen = secondsLeft !== null;

  const markActive = useCallback(() => {
    const now = Date.now();
    lastActive.current = now;
    if (now - lastSaved.current >= SAVE_EVERY_MS) {
      lastSaved.current = now;
      writeShared(now);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    await signOutEverywhere();
    // A full page load, not router.push: nothing from the console stays in memory.
    window.location.replace("/login?signedout=idle");
  }, []);

  useEffect(() => {
    lastActive.current = Date.now();
    lastSaved.current = lastActive.current;
    writeShared(lastActive.current);

    function onActivity() {
      // While the warning is up only "Stay signed in" keeps the session, so
      // a stray tap on the backdrop is not taken as someone being there.
      if (secondsLeftRef.current !== null) return;
      markActive();
    }

    function check() {
      if (signingOut.current) return;
      const idleFor = Date.now() - Math.max(lastActive.current, readShared());
      if (idleFor >= IDLE_LIMIT_MS) {
        void signOut();
      } else if (idleFor >= IDLE_LIMIT_MS - WARNING_MS) {
        setSecondsLeft(Math.ceil((IDLE_LIMIT_MS - idleFor) / 1000));
      } else {
        setSecondsLeft(null);
      }
    }

    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, onActivity, { passive: true });
    document.addEventListener("visibilitychange", check);
    const interval = window.setInterval(check, CHECK_EVERY_MS);
    return () => {
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, onActivity);
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(interval);
    };
  }, [markActive, signOut]);

  useEffect(() => {
    if (warningOpen) stayRef.current?.focus();
  }, [warningOpen]);

  // Count down by the second while the warning shows.
  useEffect(() => {
    if (secondsLeft === null) return;
    const tick = window.setTimeout(() => {
      const idleFor = Date.now() - Math.max(lastActive.current, readShared());
      if (idleFor >= IDLE_LIMIT_MS) void signOut();
      else if (idleFor < IDLE_LIMIT_MS - WARNING_MS) setSecondsLeft(null); // Active in another tab.
      else setSecondsLeft(Math.ceil((IDLE_LIMIT_MS - idleFor) / 1000));
    }, 1000);
    return () => window.clearTimeout(tick);
  }, [secondsLeft, signOut]);

  function staySignedIn() {
    lastSaved.current = 0;
    markActive();
    setSecondsLeft(null);
  }

  if (secondsLeft === null) return null;

  return (
    <div className="mc-dialog-backdrop">
      <div className="mc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mc-idle-title" aria-describedby="mc-idle-lede">
        <h2 id="mc-idle-title" className="mc-dialog-title mc-trial-ended-title">
          Still there?
        </h2>
        <p id="mc-idle-lede" className="mc-trial-ended-lede" aria-live="polite">
          To keep your team&apos;s details safe, you&apos;ll be signed out in {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}.
        </p>
        <div className="mc-dialog-actions">
          <button type="button" className="mc-btn mc-btn-quiet" onClick={() => void signOut()}>
            Sign out now
          </button>
          <button ref={stayRef} type="button" className="mc-btn mc-btn-primary" onClick={staySignedIn}>
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
