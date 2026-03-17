"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/SectionHeading";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
              Early access pricing for founding members and venue teams. Start
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
                  $19 <small>/ month</small>
                </div>
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
                  onClick={() => handleCheckout("pro")}
                  disabled={loading === "pro"}
                >
                  {loading === "pro" ? "Redirecting..." : "Join Pro"}
                </button>
              </div>

              <div className="price-card">
                <h3>Single Venue</h3>
                <div className="price">
                  $49 <small>/ month</small>
                </div>
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
                  onClick={() => handleCheckout("single_venue")}
                  disabled={loading === "single_venue"}
                >
                  {loading === "single_venue" ? "Redirecting..." : "Request Access"}
                </button>
              </div>

              <div className="price-card">
                <h3>Multi-Venue</h3>
                <div className="price">
                  $149 <small>/ month</small>
                </div>
                <div className="price-note">
                  Best for multi-location teams wanting unified management.
                </div>
                <ul className="feature-list">
                  <li>Up to 5 venues</li>
                  <li>Multiple user logins</li>
                  <li>Full management modules</li>
                  <li>Cross-venue comparison reporting</li>
                  <li>Advanced analytics & leaderboards</li>
                  <li>Priority support</li>
                </ul>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCheckout("multi_venue")}
                  disabled={loading === "multi_venue"}
                >
                  {loading === "multi_venue" ? "Redirecting..." : "Request Multi-Venue Access"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ maxWidth: 560, margin: "0 auto", background: "var(--surface-raised)", border: "2px solid var(--green-mid)", borderRadius: 18, padding: "36px 32px", textAlign: "center", boxShadow: "0 8px 32px rgba(31,78,55,0.15)" }}>
              <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>👑</div>
              <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--green-deep)", marginBottom: 8 }}>Founding Member Access</h2>
              <p style={{ color: "var(--text-soft)", marginBottom: 20, lineHeight: 1.7 }}>
                Launching soon. Be a Founding Member — request your private access code and lock in launch-stage pricing for life. Founding members get full access, an exclusive Founder badge, and direct input into what gets built next.
              </p>
              <Link href="/contact" className="btn btn-primary btn-lg">
                Request your founders code
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions."
              copy=""
            />
            <div className="faq-list">
              <div className="faq-item">
                <p className="faq-question">Is there a free trial?</p>
                <p className="faq-answer">Yes. The Free Demo plan gives you access to three AI scenario evaluations with no credit card required. You can try the platform before committing to a paid plan.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">How does billing work?</p>
                <p className="faq-answer">Paid plans are billed monthly. You can cancel any time and your access continues until the end of the billing period. No contracts, no lock-in.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">Can I get a refund?</p>
                <p className="faq-answer">We offer a 14-day refund on your first payment if you are not satisfied. After that, refunds are not available but you are always free to cancel.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">What happens if I cancel?</p>
                <p className="faq-answer">Your access stays active to the end of your paid period. After that your account moves to the Free Demo tier — your training history is preserved and you can resubscribe at any time.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">How many staff can join on the Single Venue and Multi-Venue plans?</p>
                <p className="faq-answer">Single Venue plans support multiple staff logins for one location. Multi-Venue plans support multiple user logins across up to 5 venues. Get in touch via the venue enquiry form and we will confirm capacity for your specific venue size.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">Is my training data private?</p>
                <p className="faq-answer">Yes. Your scenario responses are used only to generate your personal feedback scores. They are never shared with other staff, managers, or venues without your consent. See our <a href="/privacy">Privacy Policy</a> for full details.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">Do you offer a larger team or enterprise plan?</p>
                <p className="faq-answer">Not yet, but if you have a group of venues or a large team, reach out via the venue enquiry form and we will work out a custom arrangement.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}