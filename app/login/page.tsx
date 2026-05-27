"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--gold-warm)", flexShrink: 0 }}
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const BrandMark = () => (
  <div className="login-brand">
    <Image src="/logo.png" alt="Serve By Example" width={36} height={36} className="login-brand-mark" />
    <span className="login-brand-name">Serve By Example</span>
  </div>
);

const LoginTypeSwitcher = () => (
  <div className="login-type-switcher">
    <span className="login-type-tab login-type-tab--active">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      Staff Login
    </span>
    <Link href="/management/login" className="login-type-tab">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
      Management Login
    </Link>
  </div>
);

const RightPanel = () => (
  <div className="login-split-right">
    <div className="login-visual-img-wrap">
      <Image
        src="/images/login-value-prop.png"
        alt="Serve By Example — hospitality staff training network"
        width={520}
        height={420}
        priority
        style={{ objectFit: "contain" }}
      />
    </div>
    <div className="login-visual-text">
      <p className="login-visual-headline">
        Floor-ready staff in 6 weeks,<br />not 6 months.
      </p>
      <ul className="login-visual-bullets">
        <li>
          <CheckIcon />
          Consistent standards across every venue
        </li>
        <li>
          <CheckIcon />
          Track readiness before problems show up
        </li>
        <li>
          <CheckIcon />
          Manage every site from one console
        </li>
      </ul>
    </div>
  </div>
);

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const oauthError = searchParams.get("error") === "oauth-error";
  const [mode, setMode] = useState<AuthMode>(checkoutSuccess ? "sign-up" : "sign-in");
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

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthErr) {
      setError(oauthErr.message);
      setGoogleLoading(false);
    }
    // On success: browser is redirected by Supabase — no further client action needed
  }

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
          const msg = signUpError.message ?? "";
          if (
            msg.toLowerCase().includes("already registered") ||
            msg.toLowerCase().includes("user already registered")
          ) {
            setError(
              "An account with this email already exists. Try signing in, or check your email for an invite link from your manager.",
            );
            setLoading(false);
            return;
          }
          throw signUpError;
        }

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

        router.push("/dashboard");
        router.refresh();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete authentication right now.",
      );
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
      <div className="login-split">
        <div className="login-split-left">
          <div className="login-card">
            <BrandMark />
            <LoginTypeSwitcher />
            <div className="eyebrow">Account recovery</div>
            <h1>Reset your password</h1>
            <p className="login-sub">
              Enter your email address and we&apos;ll send you a link to set a new password.
            </p>
            <form className="form-grid" onSubmit={handleForgotPassword} style={{ marginTop: 24 }}>
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
              <div className="auth-actions">
                <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
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
        </div>
        <RightPanel />
      </div>
    );
  }

  return (
    <div className="login-split">
      {/* ── Left: form panel ── */}
      <div className="login-split-left">
        <div className="login-card">
          <BrandMark />
          <LoginTypeSwitcher />

          {checkoutSuccess && (
            <div className="auth-status auth-status-success" style={{ marginBottom: 16 }}>
              Payment successful. Create your account or sign in below to access your plan.
            </div>
          )}

          <h1>{isSignUp ? "Create your account." : "Welcome back."}</h1>
          <p className="login-sub">
            {isSignUp
              ? "Already have an account? Sign in below."
              : "New here? Create an account to get started."}
          </p>

          <div className="auth-toggle" role="tablist" aria-label="Authentication mode" style={{ marginTop: 20, marginBottom: 24 }}>
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

          {/* Google OAuth */}
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
              <button className="btn btn-primary btn-block" type="submit" disabled={loading || googleLoading}>
                {loading
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* ── Right: visual panel ── */}
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
