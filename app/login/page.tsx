"use client";

import Link from "next/link";
import { FormEvent, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { BrandMark, RightPanel } from "@/components/LoginSplitParts";
import TurnstileWidget, { CAPTCHA_FAILED_MESSAGE, isCaptchaError, type TurnstileHandle } from "@/components/TurnstileWidget";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";
type Portal = "staff" | "management";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--google-blue)" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--google-green)" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="var(--google-yellow)" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--google-red)" />
  </svg>
);

const LoginTypeSwitcher = ({
  portal,
  onSwitch,
}: {
  portal: Portal;
  onSwitch: (p: Portal) => void;
}) => (
  <div className="login-type-switcher">
    <button
      type="button"
      className={`login-type-tab${portal === "staff" ? " login-type-tab--active" : ""}`}
      onClick={() => onSwitch("staff")}
    >
      Staff Login
    </button>
    <button
      type="button"
      className={`login-type-tab${portal === "management" ? " login-type-tab--active" : ""}`}
      onClick={() => onSwitch("management")}
    >
      Management Login
    </button>
  </div>
);

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const stripeSessionId = searchParams.get("session_id");
  const oauthError = searchParams.get("error") === "oauth-error";
  // Carried forward from "Try Free for 14 Days" CTAs (HeroSection.tsx,
  // app/pricing/page.tsx) for a logged-out visitor — this page previously
  // never read these, so clicking Start Trial while logged out silently
  // dropped the intent and just signed the visitor in/up with no trial
  // ever created. Password-based sign-in/sign-up handlers below call
  // maybeStartTrial() once authenticated; Google OAuth is a separate
  // redirect-based flow (/auth/callback) not covered by this fix.
  const trialIntent = searchParams.get("intent") === "trial";
  const trialTier = searchParams.get("tier");
  // A signed-out visitor who chose a paid plan on /pricing is sent here first
  // (checkout needs an account). Once signed in, by any route below, they go
  // back to /membership (the live address of the price board; /pricing
  // redirects to it), which starts checkout for the plan they picked.
  // Arrived from a staff sign-up link (/dashboard?join=CODE). middleware.ts
  // has parked the code in a cookie and joins the venue after sign-in.
  const joiningVenue = /^[A-Za-z0-9]{4,8}$/.test(searchParams.get("join") ?? "");
  const checkoutPlan = searchParams.get("plan") ?? "";
  const resumeCheckoutPath =
    searchParams.get("intent") === "checkout" && /^[a-z_]{1,40}$/.test(checkoutPlan)
      ? `/membership?checkout_plan=${checkoutPlan}`
      : null;

  const [portal, setPortal] = useState<Portal>("staff");
  const [mode, setMode] = useState<AuthMode>(checkoutSuccess || resumeCheckoutPath || joiningVenue ? "sign-up" : "sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(
    oauthError ? "Google sign-in failed. Please try again or use email below." : ""
  );
  const [success, setSuccess] = useState("");

  const isSignUp = mode === "sign-up";
  const isForgotPassword = mode === "forgot-password";

  // Supabase Auth refuses password sign-in and sign-up without a Turnstile
  // token. Each call takes a fresh one: a token only works once.
  const turnstileRef = useRef<TurnstileHandle>(null);
  async function captchaOptions(): Promise<{ captchaToken?: string }> {
    const captchaToken = await turnstileRef.current?.takeToken();
    return captchaToken ? { captchaToken } : {};
  }

  function switchPortal(next: Portal) {
    setPortal(next);
    setMode("sign-in");
    setError("");
    setSuccess("");
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setError("");
    setSuccess("");
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const callbackParams = new URLSearchParams({ next: resumeCheckoutPath ?? "/onboarding" });
    if (stripeSessionId) callbackParams.set("session_id", stripeSessionId);
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?${callbackParams.toString()}`,
      },
    });
    if (oauthErr) {
      setError(oauthErr.message);
      setGoogleLoading(false);
    }
  }

  // Called right after a successful sign-in/sign-up when the visitor
  // arrived via a "Try Free for 14 Days" CTA. Returns true if it's safe to
  // continue to the normal post-auth redirect; false means a real problem
  // occurred (most commonly a 409 — org already used its trial) and the
  // caller should stop and show the error here instead of navigating away,
  // since /pricing itself can't tell the visitor apart from a fresh one
  // without a live session, and errors won't be seen at all after redirect.
  async function maybeStartTrial(accessToken: string | undefined): Promise<boolean> {
    if (!trialIntent || !trialTier) return true;
    try {
      const res = await fetch("/api/billing/trial/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ tier: trialTier }),
      });
      if (res.ok) return true;
      const data = await res.json().catch(() => ({}));
      setError(
        data.error === "This organisation has already used its free trial"
          ? "This organisation has already used its free trial. Visit Pricing to subscribe directly."
          : (data.error || "Unable to start your free trial. You can still sign in and add billing from Settings.")
      );
      return false;
    } catch {
      // Network failure starting the trial shouldn't strand the visitor on
      // a form that otherwise succeeded — let them through; the dashboard's
      // own trial-state banner will reflect whatever actually happened.
      return true;
    }
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Server-side route (not supabase.auth.resetPasswordForEmail directly)
      // so we send our own branded email via Brevo instead of Supabase's
      // stock template — see app/api/auth/forgot-password/route.ts.
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(await captchaOptions()) }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not send reset email.");
      setSuccess(data.message || "Password reset email sent. Check your inbox and follow the link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleManagementGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          resumeCheckoutPath ?? "/management/dashboard"
        )}`,
      },
    });
    if (oauthErr) {
      setError(oauthErr.message);
      setGoogleLoading(false);
    }
  }

  async function handleManagementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: await captchaOptions(),
      });
      if (signInError) throw signInError;
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const canContinue = await maybeStartTrial(authSession?.access_token);
      if (!canContinue) {
        setLoading(false);
        return;
      }
      router.push(resumeCheckoutPath ?? "/management/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        isCaptchaError(err)
          ? CAPTCHA_FAILED_MESSAGE
          : err instanceof Error ? err.message : "Unable to sign in to the management portal right now."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStaffSubmit(event: FormEvent<HTMLFormElement>) {
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
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              stripeSessionId
                ? `/onboarding?checkout=success&session_id=${stripeSessionId}`
                : resumeCheckoutPath ?? "/onboarding"
            )}`,
            ...(await captchaOptions()),
          },
        });

        if (signUpError) {
          const msg = signUpError.message ?? "";
          if (
            msg.toLowerCase().includes("already registered") ||
            msg.toLowerCase().includes("user already registered")
          ) {
            setError("An account with this email already exists. Try signing in, or check your email for an invite link from your manager.");
            setLoading(false);
            return;
          }
          throw signUpError;
        }

        // No client-side profiles write: the on_auth_user_created trigger
        // creates the row, and readers fall back to the email prefix for a
        // missing display_name. (This upsert was already rejected by RLS —
        // profiles has no INSERT policy — and clients can no longer write
        // profiles at all; audit 2026-09-30, Phase 2.)

        if (data.session) {
          const { data: { session: authSession } } = await supabase.auth.getSession();
          if (authSession?.access_token) {
            await fetch("/api/session/stamp", {
              method: "POST",
              headers: { "Authorization": `Bearer ${authSession.access_token}` },
            });
          }
          const canContinue = await maybeStartTrial(authSession?.access_token);
          if (!canContinue) {
            setLoading(false);
            return;
          }
          router.push(
            trialIntent
              ? "/management/dashboard"
              : stripeSessionId
              ? `/onboarding?checkout=success&session_id=${stripeSessionId}`
              : resumeCheckoutPath ?? "/onboarding"
          );
          router.refresh();
          return;
        }

        setSuccess("Account created. Check your email to confirm your address, then sign in.");
        setMode("sign-in");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: await captchaOptions(),
        });
        if (signInError) throw signInError;

        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession?.access_token) {
          await fetch("/api/session/stamp", {
            method: "POST",
            headers: { "Authorization": `Bearer ${authSession.access_token}` },
          });
        }
        const canContinue = await maybeStartTrial(authSession?.access_token);
        if (!canContinue) {
          setLoading(false);
          return;
        }
        router.push(trialIntent ? "/management/dashboard" : resumeCheckoutPath ?? "/dashboard");
        router.refresh();
      }
    } catch (submitError) {
      setError(
        isCaptchaError(submitError)
          ? CAPTCHA_FAILED_MESSAGE
          : submitError instanceof Error ? submitError.message : "Unable to complete authentication right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-split-left">
        {/*
          key forces a full remount when portal changes so React never
          reuses a stale h1/p DOM node from a previous portal's render.
        */}
        <div className="login-card" key={portal}>
          <BrandMark />
          <LoginTypeSwitcher portal={portal} onSwitch={switchPortal} />

          {/* ── Forgot password (shared) ── */}
          {isForgotPassword ? (
            <>
              <p className="sbe-mkt-kicker">Account recovery</p>
              <h1>Reset your password</h1>
              <p className="login-sub">
                Enter your email address and we&apos;ll send you a link to set a new password.
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                {error ? <div className="auth-status auth-status-error">{error}</div> : null}
                {success ? <div className="auth-status auth-status-success">{success}</div> : null}
                <TurnstileWidget ref={turnstileRef} />
                <div className="auth-actions">
                  <button className="sbe-mkt-btn-primary login-submit" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                  <p className="auth-help">
                    <button type="button" className="auth-link-btn" onClick={() => switchMode("sign-in")}>
                      Back to sign in
                    </button>
                  </p>
                </div>
              </form>
            </>
          ) : portal === "management" ? (
            /* ── Management portal ── */
            <>
              <h1>Welcome back.</h1>
              <p className="login-sub">Sign in to your management console.</p>
              <button
                className="login-google-btn"
                type="button"
                onClick={handleManagementGoogleSignIn}
                disabled={googleLoading || loading}
              >
                <GoogleIcon />
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </button>
              <div className="login-divider">or continue with email</div>
              <form className="form-grid" onSubmit={handleManagementSubmit}>
                <label className="label" htmlFor="mgmt-email">
                  Email address
                  <input
                    id="mgmt-email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder="manager@yourvenue.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="label" htmlFor="mgmt-password">
                  Password
                  <input
                    id="mgmt-password"
                    className="input"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <div className="auth-forgot">
                  <button type="button" className="auth-link-btn" onClick={() => switchMode("forgot-password")}>
                    Forgot your password?
                  </button>
                </div>
                {error ? <div className="auth-status auth-status-error">{error}</div> : null}
                {success ? <div className="auth-status auth-status-success">{success}</div> : null}
                <TurnstileWidget ref={turnstileRef} />
                <div className="auth-actions">
                  <button className="sbe-mkt-btn-primary login-submit" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Enter Manager Portal"}
                  </button>
                  <p className="auth-help">
                    Need manager access?{" "}
                    <Link href="/contact" className="auth-link-btn">Request venue onboarding</Link>.
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* ── Staff portal ── */
            <>
              {checkoutSuccess && (
                <div className="auth-status auth-status-success" style={{ marginBottom: 16 }}>
                  Payment successful. Create your account or sign in below to access your plan.
                </div>
              )}
              {joiningVenue && !checkoutSuccess && !resumeCheckoutPath && (
                <div className="auth-status auth-status-success" style={{ marginBottom: 16 }}>
                  Create your account or sign in, and we will connect you to your venue.
                </div>
              )}
              {resumeCheckoutPath && !checkoutSuccess && (
                <div className="auth-status auth-status-success" style={{ marginBottom: 16 }}>
                  Create a free account or sign in, and we will take you straight to checkout.
                </div>
              )}
              <h1>{isSignUp ? "Create your account." : "Welcome back."}</h1>
              <p className="login-sub">
                {isSignUp ? "Already have an account?" : "New here?"}{" "}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => switchMode(isSignUp ? "sign-in" : "sign-up")}
                >
                  {isSignUp ? "Sign in" : "Create an account"}
                </button>
              </p>
              <button
                className="login-google-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                <GoogleIcon />
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </button>
              <div className="login-divider">or continue with email</div>
              <form className="form-grid" onSubmit={handleStaffSubmit}>
                <label className="label" htmlFor="email">
                  Email address
                  <input
                    id="email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {error ? <div className="auth-status auth-status-error">{error}</div> : null}
                {success ? <div className="auth-status auth-status-success">{success}</div> : null}
                <TurnstileWidget ref={turnstileRef} />
                <div className="auth-actions">
                  <button className="sbe-mkt-btn-primary login-submit" type="submit" disabled={loading || googleLoading}>
                    {loading
                      ? isSignUp ? "Creating account..." : "Signing in..."
                      : isSignUp ? "Create account" : "Sign in"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <RightPanel />
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
