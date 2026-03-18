"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Status = "verifying" | "exists" | "new" | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const supabase = createSupabaseBrowserClient();

  const [status, setStatus] = useState<Status>("verifying");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
        const data = await res.json();

        if (!data.verified) {
          setStatus("error");
          return;
        }

        setEmail(data.customer_email);
        sessionStorage.setItem("pending_payment_email", data.customer_email);
        sessionStorage.setItem("pending_payment_metadata", JSON.stringify(data.metadata));

        // Check if a user already exists with this email by attempting OTP (won't send, just checks)
        const { data: methods } = await supabase.auth.signInWithOtp({
          email: data.customer_email,
          options: { shouldCreateUser: false },
        });

        // If no error returned, the user exists; otherwise they're new
        if (methods) {
          setStatus("exists");
        } else {
          setStatus("new");
        }
      } catch {
        setStatus("error");
      }
    };

    verifySession();
  }, [sessionId]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }
    await fetch("/api/billing/link-pending", { method: "POST" });
    router.push("/dashboard?checkout=success");
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }
    await fetch("/api/billing/link-pending", { method: "POST" });
    router.push("/dashboard?checkout=success");
  }

  return (
    <div className="login-container" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      {status === "verifying" && (
        <div className="auth-status" style={{ textAlign: "center" }}>
          <p>Verifying your payment...</p>
        </div>
      )}

      {status === "error" && (
        <div className="auth-status auth-status-error" style={{ textAlign: "center", maxWidth: 480 }}>
          <p>We couldn&apos;t verify your payment. Please <a href="/pricing">go back to pricing</a> or <a href="/contact">contact support</a>.</p>
        </div>
      )}

      {(status === "exists" || status === "new") && (
        <div className="login-form-wrapper" style={{ maxWidth: 420, width: "100%" }}>
          <div className="auth-status" style={{ marginBottom: 24, textAlign: "center", background: "var(--success-bg, #d1fae5)", color: "var(--success-text, #065f46)", borderRadius: 8, padding: "12px 20px" }}>
            🎉 Payment successful! {status === "exists" ? "Sign in to access your plan." : "Create your account to get started."}
          </div>

          <form onSubmit={status === "exists" ? handleSignIn : handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {status === "new" && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            )}

            {authError && (
              <div className="auth-status auth-status-error">{authError}</div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Please wait..." : status === "exists" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {status === "exists" && (
            <p style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
              New here?{" "}
              <button className="link-button" onClick={() => setStatus("new")}>
                Create an account instead
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 80 }}>
        <Suspense fallback={<div style={{ textAlign: "center", padding: 80 }}>Loading...</div>}>
          <PaymentSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
