"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/*
 * TurnstileWidget — Cloudflare Turnstile for the sign-in and sign-up forms.
 *
 * Supabase Auth has captcha protection on, so signUp() and
 * signInWithPassword() are refused without a fresh token. The widget fetches
 * one as soon as the form mounts and stays invisible unless Cloudflare wants
 * the visitor to tick a box. A token works once, so takeToken() hands it over
 * and immediately asks for the next one, ready for a retry after a wrong
 * password.
 */

// Public by design: the site key is sent to every browser. The secret key
// lives only in the Supabase Auth settings.
const TURNSTILE_SITE_KEY = "0x4AAAAAAFTs3kTDzlKXuSRA";
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_WAIT_MS = 12_000;

export const CAPTCHA_FAILED_MESSAGE =
  "We could not confirm you are not a robot. Reload the page and try again.";

/** True when Supabase refused a sign-in or sign-up because the captcha token was missing or rejected. */
export function isCaptchaError(error: unknown): boolean {
  return error instanceof Error && /captcha/i.test(error.message);
}

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance: "always" | "execute" | "interaction-only";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

type TurnstileWindow = Window & typeof globalThis & { turnstile?: TurnstileApi };

let scriptPromise: Promise<TurnstileApi> | null = null;

// Injected from the client bundle (no inline script), so it loads under the
// strict-dynamic CSP in middleware.ts.
function loadTurnstile(): Promise<TurnstileApi> {
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.onload = () => {
        const api = (window as TurnstileWindow).turnstile;
        if (api) resolve(api);
        else reject(new Error("Turnstile did not load."));
      };
      script.onerror = () => reject(new Error("Turnstile did not load."));
      document.head.appendChild(script);
    });
    // Let a later mount try again after a failed load (offline, blocked).
    scriptPromise.catch(() => {
      scriptPromise = null;
    });
  }
  return scriptPromise;
}

export type TurnstileHandle = {
  /** A fresh single-use token, or null if none could be had (blocked script, failed challenge, timeout). */
  takeToken: () => Promise<string | null>;
};

const TurnstileWidget = forwardRef<TurnstileHandle>(function TurnstileWidget(_props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TurnstileApi | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const waitersRef = useRef<Array<(token: string | null) => void>>([]);

  useEffect(() => {
    let cancelled = false;

    const settleWaiters = (token: string | null) => {
      const waiters = waitersRef.current;
      waitersRef.current = [];
      for (const waiter of waiters) waiter(token);
    };
    const requestNextToken = () => {
      if (apiRef.current && widgetIdRef.current) apiRef.current.reset(widgetIdRef.current);
    };

    loadTurnstile()
      .then((api) => {
        if (cancelled || !containerRef.current) return;
        apiRef.current = api;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: "interaction-only",
          callback: (token) => {
            if (waitersRef.current.length > 0) {
              // A submit is already waiting: it gets this token, so fetch another.
              settleWaiters(token);
              requestNextToken();
            } else {
              tokenRef.current = token;
            }
          },
          "expired-callback": () => {
            tokenRef.current = null;
            requestNextToken();
          },
          "error-callback": () => {
            tokenRef.current = null;
            settleWaiters(null);
          },
        });
      })
      .catch(() => settleWaiters(null));

    return () => {
      cancelled = true;
      settleWaiters(null);
      if (apiRef.current && widgetIdRef.current) apiRef.current.remove(widgetIdRef.current);
      apiRef.current = null;
      widgetIdRef.current = null;
      tokenRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    takeToken() {
      const ready = tokenRef.current;
      if (ready) {
        tokenRef.current = null;
        if (apiRef.current && widgetIdRef.current) apiRef.current.reset(widgetIdRef.current);
        return Promise.resolve(ready);
      }
      // Not issued yet (submitted within a second of the page loading, or the
      // visitor still has a challenge to complete): wait for it.
      return new Promise<string | null>((resolve) => {
        const timer = setTimeout(() => {
          waitersRef.current = waitersRef.current.filter((waiter) => waiter !== settle);
          resolve(null);
        }, TOKEN_WAIT_MS);
        const settle = (token: string | null) => {
          clearTimeout(timer);
          resolve(token);
        };
        waitersRef.current.push(settle);
      });
    },
  }));

  return <div ref={containerRef} />;
});

export default TurnstileWidget;
