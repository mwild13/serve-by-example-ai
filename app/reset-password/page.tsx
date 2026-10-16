"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark, RightPanel } from "@/components/LoginSplitParts";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // The reset email links here with ?token_hash=&type=recovery. Verifying it
  // in the browser saves the session in cookies, which updateUser needs.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    let verify: Promise<boolean> = Promise.resolve(true);
    if (tokenHash && params.get("type") === "recovery") {
      // The token works once, so a refresh must not try it again.
      window.history.replaceState(null, "", window.location.pathname);
      verify = createSupabaseBrowserClient()
        .auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error: verifyError }) => !verifyError);
    }
    verify
      .then((ok) => {
        if (!ok) setError("This reset link has expired or was already used. Request a new one from the sign-in page.");
      })
      .finally(() => setVerifying(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        if (updateError.name === "AuthSessionMissingError") {
          throw new Error("Your reset link has expired. Request a new one from the sign-in page.");
        }
        throw updateError;
      }
      setSuccess("Password updated successfully. Redirecting to your dashboard…");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-split-left">
        <div className="login-card">
          <BrandMark />
          <p className="sbe-mkt-kicker">Account recovery</p>
          <h1>Set a new password</h1>
          <p className="login-sub">
            Choose a strong password for your Serve By Example account. At least 6 characters.
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="label" htmlFor="password">
              New password
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <label className="label" htmlFor="confirm-password">
              Confirm new password
              <input
                id="confirm-password"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            {error ? <div className="auth-status auth-status-error">{error}</div> : null}
            {success ? <div className="auth-status auth-status-success">{success}</div> : null}

            <div className="auth-actions">
              <button className="sbe-mkt-btn-primary login-submit" type="submit" disabled={loading || verifying}>
                {verifying ? "Checking your link…" : loading ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <RightPanel />
    </div>
  );
}
