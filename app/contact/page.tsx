"use client";

import { FormEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VENUE_TYPES = ["Bar / Pub", "Restaurant", "Hotel F&B", "Events venue", "Other"];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, venueName, venueType, message }),
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
      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">Get in touch</div>
            <h1>Talk to us</h1>
            <p className="hero-sub">
              Questions, partnership enquiries, or just want to see if we&apos;re a fit —
              we&apos;d love to hear from you.
            </p>
          </div>
        </section>

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
                    Venue type
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
                <a href="mailto:info@serve-by-example.com" className="contact-email-link">
                  info@serve-by-example.com
                </a>
                <p>We reply to all enquiries within one business day.</p>
              </div>
              <div className="card contact-info-card">
                <h3>Not sure yet?</h3>
                <p>
                  Try our free AI demo — no account needed. Get a feel for how the platform
                  works before reaching out.
                </p>
                <a href="/demo" className="btn btn-secondary btn-block" style={{ marginTop: "12px" }}>
                  Try the demo
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
