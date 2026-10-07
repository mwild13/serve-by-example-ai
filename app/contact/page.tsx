"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";

const VENUE_TYPES = ["Bar / Pub", "Restaurant", "Hotel F&B", "Events venue", "Other"];

// Attribution params set by linking pages (e.g. /advisory CTAs):
// /contact?source=advisory&package=service-reset. Slug-shaped values only.
const ATTRIBUTION_RE = /^[a-z0-9-]{1,40}$/;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [source, setSource] = useState("");
  const [enquiryPackage, setEnquiryPackage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Read once on mount (not useSearchParams) so the page stays statically
  // rendered and is unchanged when no params are present.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("source") ?? "";
    const p = params.get("package") ?? "";
    // Mount-only URL read, deferred so SSR hydrates with empty values first.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ATTRIBUTION_RE.test(s)) setSource(s);
    if (ATTRIBUTION_RE.test(p)) setEnquiryPackage(p);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (website) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          venueName,
          venueType,
          message,
          website,
          ...(source ? { source } : {}),
          ...(enquiryPackage ? { package: enquiryPackage } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSuccess("Thanks! We\u2019ll be in touch within one business day.");
      setName("");
      setEmail("");
      setVenueName("");
      setVenueType("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main id="main-content">
        <PageHero
          compact
          eyebrow="Get in touch"
          title="Talk to us"
          subtitle="Questions, partnership enquiries, or just want to see if we're a fit. We'd love to hear from you."
        />

        <section className="section">
          <div className="container contact-grid">
            <div className="contact-form-card card">
              <h2>Send a message</h2>
              {success && (
                <div className="auth-status auth-status-success" style={{ marginBottom: 16 }}>
                  {success}
                </div>
              )}
              {error && (
                <div className="auth-status auth-status-error" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                {source ? <input type="hidden" name="source" value={source} /> : null}
                {enquiryPackage ? <input type="hidden" name="package" value={enquiryPackage} /> : null}
                <div className="sr-only-hp" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div className="form-row">
                  <label className="label" htmlFor="contact-name">
                    Your name <span className="required">*</span>
                  </label>
                  <input
                    id="contact-name"
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="form-row">
                  <label className="label" htmlFor="contact-email">
                    Email address <span className="required">*</span>
                  </label>
                  <input
                    id="contact-email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="jane@yourvenue.com"
                  />
                </div>
                <div className="form-row">
                  <label className="label" htmlFor="contact-venue">
                    Venue name
                  </label>
                  <input
                    id="contact-venue"
                    className="input"
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="The Crown Hotel"
                  />
                </div>
                <div className="form-row">
                  <label className="label" htmlFor="contact-venue-type">
                    Venue type <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                  </label>
                  <select
                    id="contact-venue-type"
                    className="input"
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                  >
                    <option value="">Select a type</option>
                    {VENUE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label className="label" htmlFor="contact-message">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    className="input contact-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Tell us about your team and what you&apos;re looking for..."
                    rows={5}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? "Sending\u2026" : "Send message"}
                </button>
              </form>
            </div>

            <div className="contact-info">
              <div className="card contact-info-card">
                <h3>Direct email</h3>
                <a href="mailto:info@servebyexample.co" className="contact-email-link">
                  info@servebyexample.co
                </a>
                <p>We reply to all enquiries within one business day.</p>
              </div>
              <div className="card contact-info-card">
                <h3>For venues &amp; groups</h3>
                <p>
                  Looking to onboard your whole team? Visit our For Venues page to explore multi-staff plans and venue rollout options.
                </p>
                <a href="/for-venues" className="btn btn-secondary btn-block" style={{ marginTop: "12px" }}>
                  See Venue Plans
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <CTABand
          background="neutral"
          title="Not ready to talk yet?"
          copy="Try the demo first — no account needed, no sales conversation required."
          primary={{ label: "Try the Demo", href: "/demo" }}
        />
      </main>
      <Footer />
    </div>
  );
}
