"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/consent";

const PURCHASE_SEEN_PREFIX = "sbe-purchase-tracked:";

function alreadyTracked(sessionId: string): boolean {
  try {
    if (localStorage.getItem(PURCHASE_SEEN_PREFIX + sessionId)) return true;
    localStorage.setItem(PURCHASE_SEEN_PREFIX + sessionId, "1");
  } catch {
    // Storage blocked: the event may repeat on a reload, which GA dedupes by transaction_id.
  }
  return false;
}

/**
 * Sends the two conversion events that are only known after a redirect:
 * a Google sign-up (app/auth/callback adds ?signup=google for a new account)
 * and a purchase (Stripe returns with ?checkout=success&session_id=).
 * The other events fire where they happen: email sign-up and trial start in
 * app/login/page.tsx, trial start and checkout start in the pricing board.
 * Mounted after <CookieBanner /> so consent is applied first; trackEvent is
 * a no-op for a visitor who has not opted in.
 */
export default function ConversionEvents() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const signup = params.get("signup");
    if (signup === "google") {
      trackEvent("sign_up", { method: "Google" });
      params.delete("signup");
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }

    const sessionId = params.get("session_id");
    if (params.get("checkout") !== "success" || !sessionId || !/^cs_[A-Za-z0-9_]{1,200}$/.test(sessionId)) return;
    if (alreadyTracked(sessionId)) return;

    // The amount comes from Stripe through our own route, never from the URL.
    fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { verified?: boolean; value?: number; currency?: string; metadata?: { tier?: string } } | null) => {
        if (!data?.verified) return;
        trackEvent("purchase", {
          transaction_id: sessionId,
          value: data.value ?? 0,
          currency: data.currency ?? "AUD",
          plan: data.metadata?.tier ?? "",
        });
      })
      .catch(() => { /* analytics only: nothing to show the buyer */ });
  }, []);

  return null;
}
