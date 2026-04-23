"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SessionConflictPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleResumeHere() {
    setLoading(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      // Stamp a new session on this device
      const res = await fetch("/api/session/stamp", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();

      if (data.sessionId) {
        document.cookie = `sbe_session_id=${data.sessionId};path=/;max-age=31536000;samesite=lax`;
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Could not resume session. Please sign in again.");
      }
    } catch {
      setError("Something went wrong. Please try signing in again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    document.cookie = "sbe_session_id=;path=/;max-age=0";
    router.push("/login");
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <section className="section" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
            <div style={{ marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ marginBottom: 12 }}>Session active on another device</h1>
            <p style={{ color: "var(--text-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              Your account is currently being used on another browser or device.
              Your plan allows one active session at a time.
            </p>
            <p style={{ color: "var(--text-soft)", marginBottom: 32, fontSize: "0.9rem" }}>
              You can resume on this device — the other session will be signed out automatically.
            </p>
            {error && <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={handleResumeHere}
                disabled={loading}
              >
                {loading ? "Resuming…" : "Resume on this device"}
              </button>
              <button className="btn btn-secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
