"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/ui/SectionHeading";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  // Reset stuck "Redirecting..." when user presses browser back from Stripe
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setLoading(null);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function handleCheckout(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Unlikely — fall back to error message below the button instead of alert
        setLoading(null);
        setCheckoutError(data.error || "Unable to start checkout. Please try again.");
      }
    } catch {
      setLoading(null);
      setCheckoutError("Network error. Please try again.");
    }
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="page-hero">
          <div className="container">
            <div className="eyebrow">Pricing</div>
            <h1>Simple plans for individuals and venue teams.</h1>
            <p>
              Early access pricing in AUD for founding members and venue teams. Start
              with the demo, upgrade when you are ready, and lock in launch-stage
              rates while onboarding is still hands-on.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 24 }}>
          <div className="container">
            {checkoutError && (
              <div className="auth-status auth-status-error" style={{ marginBottom: 16, maxWidth: 480, margin: "0 auto 16px" }}>
                {checkoutError}
              </div>
            )}

            {/* Billing toggle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
              <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "4px", gap: "2px" }}>
                <button
                  onClick={() => setBilling("monthly")}
                  style={{ padding: "8px 22px", borderRadius: "7px", border: "none", background: billing === "monthly" ? "white" : "transparent", fontWeight: 700, fontSize: "0.875rem", color: billing === "monthly" ? "#111827" : "#6b7280", cursor: "pointer", boxShadow: billing === "monthly" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  style={{ padding: "8px 22px", borderRadius: "7px", border: "none", background: billing === "yearly" ? "white" : "transparent", fontWeight: 700, fontSize: "0.875rem", color: billing === "yearly" ? "#111827" : "#6b7280", cursor: "pointer", boxShadow: billing === "yearly" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "7px" }}
                >
                  Yearly
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#16a34a", background: "#d1fae5", borderRadius: "999px", padding: "2px 8px", letterSpacing: "0.03em" }}>
                    2 months free
                  </span>
                </button>
              </div>
            </div>

            <div className="pricing-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <div className="price-card">
                <h3>Free Demo</h3>
                <div className="price">
                  $0 <small>/ try it</small>
                </div>
                <div className="price-note">
                  Best for curious users wanting to preview the platform.
                </div>
                <ul className="feature-list">
                  <li>Limited demo access</li>
                  <li>Sample AI prompts</li>
                  <li>1 bartender module preview</li>
                </ul>
                <Link href="/demo" className="btn btn-secondary">
                  Start Demo
                </Link>
              </div>

              <div className="price-card featured">
                <h3>Pro</h3>
                <div className="price">
                  AUD ${billing === "monthly" ? "19" : "190"} <small>/ {billing === "monthly" ? "month" : "year"}</small>
                </div>
                {billing === "yearly" && (
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "-4px", marginBottom: "4px" }}>AUD $15.83/month billed annually</div>
                )}
                <div className="price-note">
                  Best for individual bartenders and hospitality staff.
                </div>
                <ul className="feature-list">
                  <li>Full bartending training</li>
                  <li>Sales and service prompts</li>
                  <li>Management starter modules</li>
                  <li>Progress tracking</li>
                </ul>
                <button
                  className="btn btn-gold"
                  onClick={() => handleCheckout(billing === "monthly" ? "pro" : "pro_yearly")}
                  disabled={loading === "pro" || loading === "pro_yearly"}
                >
                  {(loading === "pro" || loading === "pro_yearly") ? "Redirecting..." : "Join Pro"}
                </button>
              </div>

              <div className="price-card">
                <h3>Single Venue</h3>
                <div className="price">
                  AUD ${billing === "monthly" ? "49" : "490"} <small>/ {billing === "monthly" ? "month" : "year"}</small>
                </div>
                {billing === "yearly" && (
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "-4px", marginBottom: "4px" }}>AUD $40.83/month billed annually</div>
                )}
                <div className="price-note">
                  Best for small venues with one location.
                </div>
                <ul className="feature-list">
                  <li>One venue access</li>
                  <li>Team member logins</li>
                  <li>Management modules</li>
                  <li>Basic progress dashboard</li>
                  <li>Venue onboarding framework</li>
                </ul>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCheckout(billing === "monthly" ? "single_venue" : "single_venue_yearly")}
                  disabled={loading === "single_venue" || loading === "single_venue_yearly"}
                >
                  {(loading === "single_venue" || loading === "single_venue_yearly") ? "Redirecting..." : "Join Now"}
                </button>
              </div>

              <div className="price-card">
                <h3>Multi-Venue</h3>
                <div className="price">
                  AUD ${billing === "monthly" ? "149" : "1,490"} <small>/ {billing === "monthly" ? "month" : "year"}</small>
                </div>
                {billing === "yearly" && (
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "-4px", marginBottom: "4px" }}>AUD $124.17/month billed annually</div>
                )}
                <div className="price-note">
                  Best for multi-location teams wanting unified management.
                </div>
                <ul className="feature-list">
                  <li><strong>Up to 5 venues</strong></li>
                  <li>Multiple user logins</li>
                  <li>Full management modules</li>
                  <li>Cross-venue comparison reporting</li>
                  <li>Advanced analytics &amp; leaderboards</li>
                  <li>Priority support</li>
                </ul>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCheckout(billing === "monthly" ? "multi_venue" : "multi_venue_yearly")}
                  disabled={loading === "multi_venue" || loading === "multi_venue_yearly"}
                >
                  {(loading === "multi_venue" || loading === "multi_venue_yearly") ? "Redirecting..." : "Join Now"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Future Updates ── */}
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Roadmap"
              title="Future Updates."
              copy="We're actively building and improving the platform. V2 updates are planned within 6 months. Here's what's coming."
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
              {[
                { eta: "2 months", soon: true, title: "More Staff Modules", desc: "New training modules covering coffee service, food pairing, wine fundamentals and advanced guest interaction." },
                { eta: "4 months", soon: true, title: "More Staff Modules", desc: "Expanded scenario sets for large-venue management, events service and high-volume bar operations." },
                { eta: "6 months", soon: false, title: "More Staff Modules", desc: "Deep-dive certifications in spirits, cocktail history, advanced bar technique and cellar management." },
                { eta: "Within 6 months", soon: true, title: "V2 — Major Feature Release", desc: "A significant platform update informed by founding member feedback, with new features across training, analytics and management." },
                { eta: "TBA", soon: false, title: "Further Design & Functionality", desc: "Continuous UI improvements, accessibility updates and performance enhancements across all pages and flows." },
                { eta: "TBA", soon: false, title: "Management & POS Integrations", desc: "Connect Serve By Example with your existing POS and scheduling systems for a unified operations view." },
                { eta: "TBA", soon: false, title: "App Store — iOS & Android", desc: "Native mobile apps so staff can train on the go, anytime, anywhere — fully synced with their progress." },
              ].map((item, i) => (
                <div key={i} style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", color: item.soon ? "#16a34a" : "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {item.eta}
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.55 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Support & Operations"
              title="Common questions."
              copy="Everything you need to know before getting started."
            />
            <div className="faq-list">
              <details className="faq-item">
                <summary>Is there a trial available?</summary>
                <p>Yes. The <strong>Free Demo</strong> provides access to three AI scenario evaluations — no credit card required. Experience the platform&apos;s tactical feedback before upgrading to a paid tier.</p>
              </details>
              <details className="faq-item">
                <summary>How is billing structured?</summary>
                <p>We operate on a transparent, monthly subscription model. There are no long-term contracts or lock-in periods; you may cancel at any time, with access continuing through the end of your billing cycle.</p>
              </details>
              <details className="faq-item">
                <summary>What is your refund policy?</summary>
                <p>We offer a 14-day window on your initial payment should the platform not meet your operational standards. Beyond this period, we do not offer refunds, though you retain the flexibility to cancel at any time.</p>
              </details>
              <details className="faq-item">
                <summary>What occurs upon cancellation?</summary>
                <p>Your access remains active until your current paid period concludes. Afterward, your account transitions to the <strong>Free Demo</strong> tier; your historical training data is securely archived, allowing you to reactivate your subscription whenever you are ready.</p>
              </details>
              <details className="faq-item">
                <summary>What are the limits on staff access?</summary>
                <p><strong>Single Venue</strong> plans provide unlimited staff logins for one location. <strong>Multi-Venue</strong> plans support teams across up to 5 venues. For larger venue groups, please use our venue enquiry form to discuss custom scaling.</p>
              </details>
              <details className="faq-item">
                <summary>Is my training data secure and private?</summary>
                <p>Absolutely. All scenario responses are utilised exclusively to calculate your personal performance metrics. Your data is strictly private and is never disclosed to third parties or other venues without your explicit consent. Refer to our <a href="/privacy">Privacy Policy</a> for technical specifications.</p>
              </details>
              <details className="faq-item">
                <summary>Do you provide enterprise-level solutions?</summary>
                <p>While we are currently focused on individual and multi-venue setups, we are equipped to support larger organisations. Please submit your requirements via the venue enquiry form, and we will coordinate a custom arrangement.</p>
              </details>
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <p style={{ color: "var(--text-soft)", marginBottom: "1rem", fontSize: "0.95rem" }}>Still have questions?</p>
              <a href="mailto:hello@serve-by-example.com" className="btn btn-secondary">Contact support</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}