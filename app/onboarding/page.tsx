"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { normalizeVenueCode } from "@/lib/venue-code";
import { isMobilePhoneUserAgent } from "@/lib/user-agent";
import { detectInstallPlatform, type InstallPlatform } from "@/lib/install-platform";
import { trackEvent } from "@/lib/consent";

// One step since 2026-10-17. The venue type and experience questions that
// followed were saved but never read by anything, so they were removed.
// On a phone, a second, skippable step offers the Add to Home Screen guide
// (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md section 4.3).

/** The phone's platform when it should be offered the guide, else null. */
function installOffer(): InstallPlatform | null {
  const ua = navigator.userAgent;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isMobilePhoneUserAgent(ua) && !standalone ? detectInstallPlatform(ua, navigator.maxTouchPoints) : null;
}
function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeSessionId = searchParams.get("session_id");
  const [venueCode, setVenueCode] = useState("");
  const [venueCodeStatus, setVenueCodeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [venueCodeMessage, setVenueCodeMessage] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [installStep, setInstallStep] = useState<InstallPlatform | null>(null);

  async function finish() {
    if (finishing) return;
    setFinishing(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        // Don't redirect on failure — the dashboard gates on
        // onboarding_completed and will just bounce the user straight back
        // here, which looks like a silent infinite loop. Surface the error
        // instead so the user can retry.
        const data = await res.json().catch(() => ({} as { error?: string }));
        setError(data.error || "Something went wrong saving your progress. Please try again.");
        setFinishing(false);
        return;
      }
      // Back from Stripe, the dashboard has a payment to confirm first.
      const offer = stripeSessionId ? null : installOffer();
      if (offer) {
        trackEvent("install_shown", { where: "onboarding", platform: offer });
        setInstallStep(offer);
        return;
      }
      router.push(
        stripeSessionId
          ? `/dashboard?checkout=success&session_id=${stripeSessionId}`
          : "/dashboard"
      );
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setFinishing(false);
    }
  }

  async function handleConnectVenue() {
    const code = normalizeVenueCode(venueCode);
    if (!code) {
      setVenueCodeStatus("error");
      setVenueCodeMessage("Please enter a valid venue code.");
      return;
    }
    setVenueCodeStatus("loading");
    setVenueCodeMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/management/join-venue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ venueCode: code }),
      });
      const data = await res.json() as { success?: boolean; venueName?: string; alreadyLinked?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not connect to venue.");
      setVenueCodeStatus("success");
      setVenueCodeMessage(
        data.alreadyLinked
          ? `Already connected to ${data.venueName}.`
          : `Connected to ${data.venueName}.`
      );
      // Long enough to read the venue name before the dashboard loads.
      setTimeout(() => void finish(), 1200);
    } catch (err) {
      setVenueCodeStatus("error");
      setVenueCodeMessage(err instanceof Error ? err.message : "Could not connect to venue.");
    }
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-header">
        <span className="onboarding-logo-bg">
          <Image src="/logo.webp" alt="Serve By Example" width={28} height={28} />
        </span>
        <span className="onboarding-brand">Serve By Example</span>
      </div>

      {installStep ? (
        <div className="onboarding-card">
          <h2 className="onboarding-heading">Put SBE on your Home Screen</h2>
          <p className="onboarding-hint">
            It opens in one tap, like any app on your phone, and it can remind you before your shifts. It takes three taps.
          </p>
          <div className="onboarding-input-group">
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={() => {
                trackEvent("install_tap", { where: "onboarding", platform: installStep });
                router.push("/mobile/install?from=onboarding");
              }}
            >
              Show me how
            </button>
            <button
              className="btn btn-block"
              type="button"
              onClick={() => {
                trackEvent("install_dismiss", { where: "onboarding", platform: installStep });
                router.push("/dashboard");
              }}
              style={{
                marginTop: 12,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--text-muted)",
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
      ) : (
      <div className="onboarding-card">
        <h2 className="onboarding-heading">Do you have a venue code?</h2>
        <p className="onboarding-hint">Your manager shares a venue code to link your training progress to their dashboard. You can skip this and add a code later from Settings.</p>
        <div className="onboarding-input-group">
          <label className="label" htmlFor="onboarding-venue-code">
            Venue code
            <input
              id="onboarding-venue-code"
              className="input"
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={8}
              value={venueCode}
              onChange={(e) => { setVenueCode(e.target.value.toUpperCase()); setVenueCodeStatus("idle"); setVenueCodeMessage(""); }}
              placeholder="e.g. K7P3QX"
            />
          </label>
          {venueCodeStatus === "success" && (
            <div className="auth-status auth-status-success">{venueCodeMessage}</div>
          )}
          {venueCodeStatus === "error" && (
            <div className="auth-status auth-status-error">{venueCodeMessage}</div>
          )}
          <button
            className="btn btn-primary btn-block"
            type="button"
            disabled={!venueCode.trim() || venueCodeStatus === "loading" || venueCodeStatus === "success" || finishing}
            onClick={handleConnectVenue}
          >
            {venueCodeStatus === "loading" ? "Connecting..." : venueCodeStatus === "success" ? "Opening your dashboard…" : "Connect to venue"}
          </button>
          {/* After a successful connect this only shows if saving failed, as a retry. */}
          {(venueCodeStatus !== "success" || error) && (
            <button
              className="btn btn-block"
              type="button"
              disabled={finishing}
              onClick={() => void finish()}
              style={{
                marginTop: 12,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--text-muted)",
              }}
            >
              {finishing ? "Loading…" : venueCodeStatus === "success" ? "Try again" : "Skip for now, I'll add this later"}
            </button>
          )}
          {error && (
            <div className="auth-status auth-status-error" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

// useSearchParams() needs a Suspense boundary for the production build.
// app/loading.tsx used to provide one for every page; it was removed on
// 2026-10-12 so public pages are sent whole.
export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageContent />
    </Suspense>
  );
}
