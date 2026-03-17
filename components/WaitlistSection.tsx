"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type WaitlistSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  copy?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  buttonLabel?: string;
  successTitle?: string;
  successCopy?: string;
  successSteps?: string[];
  successPrimaryHref?: string;
  successPrimaryLabel?: string;
  successSecondaryHref?: string;
  successSecondaryLabel?: string;
};

export default function WaitlistSection({
  id,
  eyebrow = "Venue waitlist",
  title = "Join 50+ venues already on the waitlist.",
  copy = "Get launch updates, early access invites and first access to venue plans as new training pathways go live.",
  inputLabel = "Work email",
  inputPlaceholder = "manager@yourvenue.com",
  buttonLabel = "Join the waitlist",
  successTitle = "You are on the waitlist.",
  successCopy = "We will send updates as new access opens and share the next step when venue onboarding spots are ready.",
  successSteps = [
    "We review demand and group venues by rollout timing.",
    "You get launch updates, pricing changes and early-access invites.",
    "When access opens, you get a clear next step instead of a vague follow-up.",
  ],
  successPrimaryHref = "/demo",
  successPrimaryLabel = "Try the demo",
  successSecondaryHref = "/pricing",
  successSecondaryLabel = "View app pricing",
}: WaitlistSectionProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Enter your email to join the waitlist.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: insertError } = await supabase.from("waitlist").insert({
        email: trimmedEmail,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          setSuccess("already-joined");
          setEmail("");
          return;
        }

        throw insertError;
      }

      setSuccess("joined");
      setEmail("");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to join the waitlist right now.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section waitlist-section" id={id}>
      <div className="container">
        <div className="waitlist-card">
          <div className="waitlist-copy">
            <div className="eyebrow">{eyebrow}</div>
            <h2>{title}</h2>
            <p>{copy}</p>
            <p className="waitlist-benefit">Get early access to new training pathways.</p>
          </div>

          {success ? (
            <div className="waitlist-form waitlist-success-card">
              <div className="waitlist-success-kicker">
                {success === "already-joined" ? "Already joined" : "Confirmed"}
              </div>
              <h3>{success === "already-joined" ? "You are already on the list." : successTitle}</h3>
              <p>
                {success === "already-joined"
                  ? "This email is already queued for updates, so you do not need to submit it again."
                  : successCopy}
              </p>
              <div className="waitlist-next-steps">
                <span>What happens next</span>
                <ul className="waitlist-step-list">
                  {successSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div className="waitlist-success-actions">
                <Link href={successPrimaryHref} className="btn btn-gold btn-lg">
                  {successPrimaryLabel}
                </Link>
                <Link href={successSecondaryHref} className="btn btn-secondary btn-lg">
                  {successSecondaryLabel}
                </Link>
              </div>
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={handleSubmit}>
              <label className="label" htmlFor="waitlist-email">
                {inputLabel}
                <input
                  id="waitlist-email"
                  type="email"
                  className="input"
                  placeholder={inputPlaceholder}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </label>

              <button className="btn btn-gold btn-lg btn-block" disabled={loading} type="submit">
                {loading ? "Joining..." : buttonLabel}
              </button>

              <p className="waitlist-fine-print">No spam, ever. Just launch updates and early access invites.</p>

              {error ? <div className="auth-status auth-status-error">{error}</div> : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}