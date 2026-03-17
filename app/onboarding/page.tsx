"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Step = 1 | 2 | 3;

const ROLES = [
  {
    id: "staff",
    label: "I\u2019m venue staff",
    description: "Bartender, server, host or FOH team member",
  },
  {
    id: "manager",
    label: "I\u2019m a manager",
    description: "Venue manager, team lead or training coordinator",
  },
];

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
  const [role, setRole] = useState("");
  const [venueType, setVenueType] = useState("");
  const [experience, setExperience] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
                role: role || null,
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
          <Image src="/logo.ico" alt="Serve By Example" width={28} height={28} />
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
            <h2 className="onboarding-heading">What best describes you?</h2>
            <div className="onboarding-option-grid">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  className={`onboarding-option${role === r.id ? " selected" : ""}`}
                  onClick={() => setRole(r.id)}
                  type="button"
                >
                  <span className="onboarding-option-label">{r.label}</span>
                  <span className="onboarding-option-desc">{r.description}</span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary btn-block"
              disabled={!role}
              onClick={() => setStep(2)}
              type="button"
            >
              Continue
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
