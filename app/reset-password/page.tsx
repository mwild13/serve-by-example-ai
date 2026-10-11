"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark, RightPanel } from "@/components/LoginSplitParts";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      if (updateError) throw updateError;
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
              <button className="sbe-mkt-btn-primary login-submit" type="submit" disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <RightPanel />
    </div>
  );
}
