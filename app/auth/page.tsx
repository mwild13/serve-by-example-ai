"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

function AuthCard() {
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
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: email.split("@")[0],
            plan: "free",
          });
        }

        if (data.session) {
          const { data: { session: authSession } } = await supabase.auth.getSession();
          if (authSession?.access_token) {
            await fetch("/api/billing/link-pending", {
              method: "POST",
              headers: { "Authorization": `Bearer ${authSession.access_token}` },
            });
            await fetch("/api/session/stamp", {
              method: "POST",
              headers: { "Authorization": `Bearer ${authSession.access_token}` },
            });
          }
          // Route based on role
          await routeByRole(supabase, data.user?.id);
          return;
        }

        setSuccess("Account created. Check your email to confirm, then sign in.");
        setMode("sign-in");
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession?.access_token) {
          await fetch("/api/billing/link-pending", {
            method: "POST",
            headers: { "Authorization": `Bearer ${authSession.access_token}` },
          });
          await fetch("/api/session/stamp", {
            method: "POST",
            headers: { "Authorization": `Bearer ${authSession.access_token}` },
          });
        }

        await routeByRole(supabase, data.user?.id);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to complete authentication right now.");
    } finally {
      setLoading(false);
    }
  }

  async function routeByRole(supabase: ReturnType<typeof createSupabaseBrowserClient>, userId?: string) {
    if (!userId) { router.push("/dashboard"); router.refresh(); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, tier, management_unlocked")
      .eq("id", userId)
      .single();

    const plan = profile?.plan ?? "free";
    const tier = profile?.tier ?? "free";
    const isManager = plan === "single-venue" || plan === "multi-venue" || tier === "venue_single" || tier === "venue_multi" || profile?.management_unlocked;

    if (isManager) {
      router.push("/management/dashboard");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
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
              Enter your email address and we&rsquo;ll send you a reset link.
            </p>
            <form className="form-grid" onSubmit={handleForgotPassword}>
              <label className="label" htmlFor="auth-email-forgot">
                Email address
                <input
                  id="auth-email-forgot"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              {error && <div className="auth-status auth-status-error">{error}</div>}
              {success && <div className="auth-status auth-status-success">{success}</div>}
              <div className="auth-actions">
                <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
                <p className="auth-help">
                  <button type="button" className="auth-link-btn" onClick={() => switchMode("sign-in")}>
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
              Payment successful! Create your account or sign in below.
            </div>
          )}
          <div className="eyebrow">Welcome</div>
          <h1>{isSignUp ? "Create your account" : "Sign in to continue"}</h1>
          <p className="login-copy">
            {isSignUp
              ? "Unlock training modules, AI coaching, and progress tracking."
              : "Pick up where you left off."}
          </p>

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
            <label className="label" htmlFor="auth-email">
              Email address
              <input
                id="auth-email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="label" htmlFor="auth-password">
              Password
              <input
                id="auth-password"
                className="input"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
            {!isSignUp && (
              <div className="auth-forgot">
                <button type="button" className="auth-link-btn" onClick={() => switchMode("forgot-password")}>
                  Forgot your password?
                </button>
              </div>
            )}

            {error && <div className="auth-status auth-status-error">{error}</div>}
            {success && <div className="auth-status auth-status-success">{success}</div>}

            <div className="auth-actions">
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading
                  ? isSignUp ? "Creating account…" : "Signing in…"
                  : isSignUp ? "Create account" : "Sign in"}
              </button>

              <p className="auth-help">
                {isSignUp
                  ? "Already have an account? Switch to sign in."
                  : "Need an account? Switch to create account."}
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthCard />
    </Suspense>
  );
}
