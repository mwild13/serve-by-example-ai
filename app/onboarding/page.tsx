"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Step = 1 | 2 | 3;

const VENUE_TYPES = [
  { id: "bar", label: "Bar / Pub" },
  { id: "restaurant", label: "Restaurant" },
  { id: "hotel", label: "Hotel F\u0026B" },
  { id: "events", label: "Events venue" },
];

const EXPERIENCE_LEVELS = [
  {
    id: "beginner",
    label: "Just starting out",
    description: "0\u20131 years in hospitality",
  },
  {
    id: "intermediate",
    label: "Getting confident",
    description: "1\u20133 years experience",
  },
  {
    id: "experienced",
    label: "Seasoned pro",
    description: "3+ years in the industry",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [venueCode, setVenueCode] = useState("");
  const [venueCodeStatus, setVenueCodeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [venueCodeMessage, setVenueCodeMessage] = useState("");
  const [venueType, setVenueType] = useState("");
  const [experience, setExperience] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConnectVenue() {
    const code = parseInt(venueCode.trim(), 10);
    if (isNaN(code)) {
      setVenueCodeStatus("error");
      setVenueCodeMessage("Please enter a valid numeric venue code.");
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
    } catch (err) {
      setVenueCodeStatus("error");
      setVenueCodeMessage(err instanceof Error ? err.message : "Could not connect to venue.");
    }
  }

  async function save(skip = false) {
    setSaving(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      await supabase
        .from("profiles")
        .update({
          ...(skip
            ? {}
            : {
                venue_type: venueType || null,
                experience_level: experience || null,
              }),
          onboarding_completed: true,
        })
        .eq("id", user.id);

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-header">
        <span className="onboarding-logo-bg">
          <Image src="/logo.png" alt="Serve By Example" width={28} height={28} />
        </span>
        <span className="onboarding-brand">Serve By Example</span>
      </div>

      <div className="onboarding-card">
        <div className="onboarding-steps">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`onboarding-step-dot${step >= s ? " active" : ""}${step > s ? " done" : ""}`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="eyebrow">Step 1 of 3</div>
            <h2 className="onboarding-heading">Do you have a venue code?</h2>
            <p className="onboarding-hint">Your manager shares a venue code to link your training progress to their dashboard. You can skip this and add a code later from Settings.</p>
            <div className="onboarding-input-group">
              <label className="label" htmlFor="onboarding-venue-code">
                Venue code
                <input
                  id="onboarding-venue-code"
                  className="input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={venueCode}
                  onChange={(e) => { setVenueCode(e.target.value); setVenueCodeStatus("idle"); setVenueCodeMessage(""); }}
                  placeholder="e.g. 4821"
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
                disabled={!venueCode.trim() || venueCodeStatus === "loading" || venueCodeStatus === "success"}
                onClick={handleConnectVenue}
              >
                {venueCodeStatus === "loading" ? "Connecting..." : venueCodeStatus === "success" ? "Connected" : "Connect to venue"}
              </button>
            </div>
            <button
              className="btn btn-secondary btn-block"
              type="button"
              onClick={() => setStep(2)}
            >
              {venueCodeStatus === "success" ? "Continue" : "Skip for now"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="eyebrow">Step 2 of 3</div>
            <h2 className="onboarding-heading">What kind of venue?</h2>
            <div className="onboarding-option-grid onboarding-option-grid--4">
              {VENUE_TYPES.map((v) => (
                <button
                  key={v.id}
                  className={`onboarding-option${venueType === v.id ? " selected" : ""}`}
                  onClick={() => setVenueType(v.id)}
                  type="button"
                >
                  <span className="onboarding-option-label">{v.label}</span>
                </button>
              ))}
            </div>
            <div className="onboarding-nav">
              <button className="btn btn-secondary" onClick={() => setStep(1)} type="button">
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!venueType}
                onClick={() => setStep(3)}
                type="button"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="eyebrow">Step 3 of 3</div>
            <h2 className="onboarding-heading">How much experience do you have?</h2>
            <div className="onboarding-option-grid">
              {EXPERIENCE_LEVELS.map((e) => (
                <button
                  key={e.id}
                  className={`onboarding-option${experience === e.id ? " selected" : ""}`}
                  onClick={() => setExperience(e.id)}
                  type="button"
                >
                  <span className="onboarding-option-label">{e.label}</span>
                  <span className="onboarding-option-desc">{e.description}</span>
                </button>
              ))}
            </div>
            {error && (
              <div className="auth-status auth-status-error" style={{ marginTop: 12 }}>
                {error}
              </div>
            )}
            <div className="onboarding-nav">
              <button className="btn btn-secondary" onClick={() => setStep(2)} type="button">
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!experience || saving}
                onClick={() => save()}
                type="button"
              >
                {saving ? "Saving\u2026" : "Go to dashboard"}
              </button>
            </div>
          </>
        )}
      </div>

      <button className="onboarding-skip" onClick={() => save(true)} type="button" disabled={saving}>
        Skip for now
      </button>
    </div>
  );
}
