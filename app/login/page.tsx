"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [mode, setMode] = useState<AuthMode>(checkoutSuccess ? "sign-up" : "sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSignUp = mode === "sign-up";
  const isForgotPassword = mode === "forgot-password";

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSuccess("Password reset email sent. Check your inbox and follow the link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createSupabaseBrowserClient();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        // Create a profile row for the new user.
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: email.split("@")[0],
            plan: "free",
          });
        }

        if (data.session) {
          // Check for any pending Stripe subscription for this email (guest checkout)
          const { data: { session: authSession } } = await supabase.auth.getSession();
          if (authSession?.access_token) {
            await fetch("/api/billing/link-pending", {
              method: "POST",
              headers: { "Authorization": `Bearer ${authSession.access_token}` },
            });
            // Stamp session for one-device enforcement
            const stampRes = await fetch("/api/session/stamp", {
              method: "POST",
              headers: { "Authorization": `Bearer ${authSession.access_token}` },
            });
            const stampData = await stampRes.json();
            if (stampData.sessionId) {
              document.cookie = `sbe_session_id=${stampData.sessionId};path=/;max-age=31536000;samesite=lax`;
            }
          }
          router.push("/onboarding");
          router.refresh();
          return;
        }

        setSuccess(
          "Account created. Check your email to confirm your address, then sign in.",
        );
        setMode("sign-in");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        // Check for any pending Stripe subscription for this email (guest checkout)
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession?.access_token) {
          await fetch("/api/billing/link-pending", {
            method: "POST",
            headers: { "Authorization": `Bearer ${authSession.access_token}` },
          });
          // Stamp session for one-device enforcement
          const stampRes = await fetch("/api/session/stamp", {
            method: "POST",
            headers: { "Authorization": `Bearer ${authSession.access_token}` },
          });
          const stampData = await stampRes.json();
          if (stampData.sessionId) {
            document.cookie = `sbe_session_id=${stampData.sessionId};path=/;max-age=31536000;samesite=lax`;
          }
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete authentication right now.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
  }

  if (isForgotPassword) {
    return (
      <div className="page-shell auth-clean">
        <main className="login-shell">
          <div className="login-card">
            <div className="eyebrow">Account recovery</div>
            <h1>Reset your password</h1>
            <p className="login-copy">
              Enter your email address and we will send you a link to set a new password.
            </p>
            <form className="form-grid" onSubmit={handleForgotPassword}>
              <label className="label" htmlFor="email-forgot">
                Email address
                <input
                  id="email-forgot"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              {error ? <div className="auth-status auth-status-error">{error}</div> : null}
              {success ? <div className="auth-status auth-status-success">{success}</div> : null}
              <div className="auth-actions">
                <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link 📧"}
                </button>
                <p className="auth-help">
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchMode("sign-in")}
                  >
                    Back to sign in
                  </button>
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell auth-clean">
      <main className="login-shell">
        <div className="login-card">
          {checkoutSuccess && (
            <div className="auth-status auth-status-success" style={{ marginBottom: 16 }}>
              🎉 Payment successful! Create your account or sign in below to access your plan.
            </div>
          )}
          <h1>{isSignUp ? "Create your Serve By Example AI account 🚀" : "Staff login: jump back in"}</h1>
          <p className="login-copy">
            {isSignUp
              ? "Create an account to unlock training modules, AI coaching, progress streaks, and leaderboard-ready momentum."
              : "Sign in to continue your hospitality training, keep your streak alive, and pick up exactly where you left off."}
          </p>

          <div className="login-perks" aria-label="Training perks">
            <span>🔥 Keep streaks</span>
            <span>🏆 Level up</span>
            <span>🎓 Earn progress</span>
          </div>

          <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={`auth-toggle-button ${!isSignUp ? "active" : ""}`}
              onClick={() => switchMode("sign-in")}
              aria-pressed={!isSignUp}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-toggle-button ${isSignUp ? "active" : ""}`}
              onClick={() => switchMode("sign-up")}
              aria-pressed={isSignUp}
            >
              Create account
            </button>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="label" htmlFor="email">
              Email address
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="label" htmlFor="password">
              Password
              <input
                id="password"
                className="input"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>
            {!isSignUp && (
              <div className="auth-forgot">
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => switchMode("forgot-password")}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {error ? <div className="auth-status auth-status-error">{error}</div> : null}
            {success ? <div className="auth-status auth-status-success">{success}</div> : null}

            <div className="auth-actions">
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                    ? "Create account"
                    : "Log in"}
              </button>

              <p className="auth-help">
                {isSignUp
                  ? "Already have an account? Switch to sign in."
                  : "Need an account? Switch to create account."}
              </p>
            </div>
          </form>
          <div className="login-footer" style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--line-light)", textAlign: "center" }}>
            <p style={{ marginBottom: 12, color: "var(--text-soft)", fontSize: "0.95rem" }}>Are you a venue manager?</p>
            <Link href="/management/login" className="btn btn-secondary" style={{ backgroundColor: "var(--green)", color: "var(--surface)", border: "none" }}>
              Management Login
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}