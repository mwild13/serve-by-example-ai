"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ManagementLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/management/dashboard");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in to the management portal right now.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="login-shell">
        <div className="login-card">
          <div className="eyebrow">Manager portal</div>
          <h1>Venue Operations Login</h1>
          <p className="login-copy">
            Sign in to access staff performance, training allocation, venue inventory
            intelligence and management analytics.
          </p>
          <p className="login-copy" style={{ marginTop: 8 }}>
            After login, you&apos;ll see each venue&apos;s numeric Management Training code to share with
            staff.
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="label" htmlFor="manager-email">
              Email address
              <input
                id="manager-email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="manager@yourvenue.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="label" htmlFor="manager-password">
              Password
              <input
                id="manager-password"
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error ? <div className="auth-status auth-status-error">{error}</div> : null}

            <div className="auth-actions">
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Enter Manager Portal"}
              </button>

              <p className="auth-help">
                <Link href="/login">Forgot your password?</Link>
              </p>
              <p className="auth-help">
                Need manager access? <Link href="/for-venues#venue-enquiry">Request venue onboarding</Link>.
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}