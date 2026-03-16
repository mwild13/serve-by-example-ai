"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSignUp = mode === "sign-up";

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
          router.push("/dashboard");
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

  return (
    <div className="page-shell">
      <Navbar />

      <main className="login-shell">
        <div className="login-card">
          <div className="eyebrow">Member access</div>
          <h1>{isSignUp ? "Create your Serve By Example AI account" : "Log in to Serve By Example AI"}</h1>
          <p className="login-copy">
            {isSignUp
              ? "Create an account to access training modules, AI coaching, and your progress dashboard."
              : "Sign in to continue your hospitality training and pick up where you left off."}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}