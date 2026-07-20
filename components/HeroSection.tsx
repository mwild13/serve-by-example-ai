'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  teamSize: string;
  usesTraining: string;
  platformName: string;
  decisionMaker: string;
  intent: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  teamSize: '',
  usesTraining: '',
  platformName: '',
  decisionMaker: '',
  intent: '',
};

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!data.phone.trim()) errors.phone = 'Phone number is required';
  if (!data.company.trim()) errors.company = 'Company name is required';
  if (!data.teamSize) errors.teamSize = 'Please select a team size';
  if (!data.usesTraining) errors.usesTraining = 'Please select an option';
  if (!data.decisionMaker) errors.decisionMaker = 'Please select an option';
  if (!data.intent.trim()) errors.intent = 'Please tell us what made you book a call';
  return errors;
}

export default function HeroSection() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const heroRef = useRef<HTMLElement>(null);

  function handleField(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const res = await fetch('/api/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not submit. Please email info@servebyexample.co.');
      }
      setSubmitted(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (window.location.hash === '#book-call') {
      openModal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openModal() {
    setShowModal(true);
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
    setApiError('');
    window.history.pushState(null, '', '#book-call');
  }

  function closeModal() {
    setShowModal(false);
    if (window.location.hash === '#book-call') {
      window.history.pushState(null, '', window.location.pathname);
    }
  }

  return (
    <>
      <section className="hero" ref={heroRef}>
        <div className="container">

          <h1>Training Software <br />Built for Hospitality</h1>

          <p className="hero-sub" style={{ marginTop: 20 }}>
            From 6 months of onboarding to 6 weeks. Deliver the exact operational standard your best shift manager enforces, without pulling them off the floor.
          </p>

          <div className="hero-cta-tiles">
            <Link href="/membership" className="hero-cta-tile hero-cta-tile-primary mkt-sharp-btn">
              View Memberships &rarr;
            </Link>
            <button
              className="hero-cta-tile hero-cta-tile-secondary mkt-sharp-btn"
              onClick={openModal}
            >
              Book a free 15-min call
            </button>
          </div>
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link href="/how-it-works" style={{ fontSize: "0.9rem", color: "var(--text-soft)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              How it works
            </Link>
          </div>

          <div className="hero-showcase">
            <Image
              src="/shots/257shots_so.png"
              alt="Serve By Example staff training dashboard"
              width={1400}
              height={875}
              priority
              sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1280px) 90vw, 1080px"
              className="hero-showcase-img"
            />
          </div>

        </div>
      </section>

      {showModal && (
        <div
          className="book-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Book a call"
        >
          <div className="book-modal" onClick={e => e.stopPropagation()}>
            <button className="book-modal-close" onClick={closeModal} aria-label="Close">
              &times;
            </button>

            <div className="book-modal-inner">
              {/* Left info panel */}
              <div className="book-modal-left">
                <h3 className="book-modal-left-heading">Let&rsquo;s Chat</h3>
                <ol className="book-modal-steps">
                  <li><strong>Step 1:</strong> Tell us a bit about your venues on the right.</li>
                  <li><strong>Step 2:</strong> We&rsquo;ll reach out shortly to lock in a brief, low-friction strategy call.</li>
                </ol>
                <div className="book-modal-divider" />
                <h4 className="book-modal-brief-heading">15-Min Operational Briefing</h4>
                <p className="book-modal-brief-body">
                  We&rsquo;ll map out your current staff onboarding layout, look at your venue count, and determine if interactive scenario roleplay can realistically drop your training timeline from six months down to six weeks.
                </p>
                <blockquote className="book-modal-blockquote">
                  <strong>Zero fluff. No aggressive sales pitch.</strong>
                  <p>There is absolutely no point walking you through a software console unless it mathematically protects your venue&rsquo;s service margins, fixes consistency issues, and gets your new hires floor-ready before their first real shift.</p>
                </blockquote>
              </div>

              {/* Right form panel */}
              <div className="book-modal-right">
                {submitted ? (
                  <div className="book-modal-success">
                    <h3>We&rsquo;ll be in touch shortly.</h3>
                    <p>Thanks for booking. We&rsquo;ll reach out within one business day to lock in your call.</p>
                  </div>
                ) : (
                  <form className="book-form" onSubmit={handleSubmit} noValidate>
                    <div className="book-form-row">
                      <div className="book-form-field">
                        <label className="label" htmlFor="bf-first">First Name</label>
                        <input
                          id="bf-first"
                          className={`input${errors.firstName ? ' input-error' : ''}`}
                          type="text"
                          value={form.firstName}
                          onChange={e => handleField('firstName', e.target.value)}
                          autoComplete="given-name"
                        />
                        {errors.firstName && <span className="book-form-error">{errors.firstName}</span>}
                      </div>
                      <div className="book-form-field">
                        <label className="label" htmlFor="bf-last">Last Name</label>
                        <input
                          id="bf-last"
                          className={`input${errors.lastName ? ' input-error' : ''}`}
                          type="text"
                          value={form.lastName}
                          onChange={e => handleField('lastName', e.target.value)}
                          autoComplete="family-name"
                        />
                        {errors.lastName && <span className="book-form-error">{errors.lastName}</span>}
                      </div>
                    </div>

                    <div className="book-form-field">
                      <label className="label" htmlFor="bf-email">Email Address</label>
                      <input
                        id="bf-email"
                        className={`input${errors.email ? ' input-error' : ''}`}
                        type="email"
                        value={form.email}
                        onChange={e => handleField('email', e.target.value)}
                        autoComplete="email"
                      />
                      {errors.email && <span className="book-form-error">{errors.email}</span>}
                    </div>

                    <div className="book-form-field">
                      <label className="label" htmlFor="bf-phone">Phone Number</label>
                      <input
                        id="bf-phone"
                        className={`input${errors.phone ? ' input-error' : ''}`}
                        type="tel"
                        value={form.phone}
                        onChange={e => handleField('phone', e.target.value)}
                        autoComplete="tel"
                      />
                      {errors.phone && <span className="book-form-error">{errors.phone}</span>}
                    </div>

                    <div className="book-form-field">
                      <label className="label" htmlFor="bf-company">Company Name</label>
                      <input
                        id="bf-company"
                        className={`input${errors.company ? ' input-error' : ''}`}
                        type="text"
                        value={form.company}
                        onChange={e => handleField('company', e.target.value)}
                        autoComplete="organization"
                      />
                      {errors.company && <span className="book-form-error">{errors.company}</span>}
                    </div>

                    <div className="book-form-field">
                      <label className="label" htmlFor="bf-teamsize">Size of Sales Team</label>
                      <select
                        id="bf-teamsize"
                        className={`input${errors.teamSize ? ' input-error' : ''}`}
                        value={form.teamSize}
                        onChange={e => handleField('teamSize', e.target.value)}
                      >
                        <option value="">Select team size</option>
                        <option value="just-myself">Just myself</option>
                        <option value="2-10">2–10</option>
                        <option value="10-20">10–20</option>
                        <option value="30-40">30–40</option>
                        <option value="40-50">40–50</option>
                        <option value="50+">50+</option>
                      </select>
                      {errors.teamSize && <span className="book-form-error">{errors.teamSize}</span>}
                    </div>

                    <div className="book-form-field">
                      <label className="label" htmlFor="bf-training">
                        Are you currently using any online training all year round?
                      </label>
                      <select
                        id="bf-training"
                        className={`input${errors.usesTraining ? ' input-error' : ''}`}
                        value={form.usesTraining}
                        onChange={e => handleField('usesTraining', e.target.value)}
                      >
                        <option value="">Select one</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      {errors.usesTraining && <span className="book-form-error">{errors.usesTraining}</span>}
                    </div>

                    {form.usesTraining === 'yes' && (
                      <div className="book-form-field book-form-expand">
                        <label className="label" htmlFor="bf-platform">Platform name</label>
                        <input
                          id="bf-platform"
                          className="input"
                          type="text"
                          placeholder="e.g. Typsy, Axonify..."
                          value={form.platformName}
                          onChange={e => handleField('platformName', e.target.value)}
                        />
                      </div>
                    )}

                    <div className="book-form-field">
                      <label className="label" htmlFor="bf-decision">Are you the decision maker?</label>
                      <select
                        id="bf-decision"
                        className={`input${errors.decisionMaker ? ' input-error' : ''}`}
                        value={form.decisionMaker}
                        onChange={e => handleField('decisionMaker', e.target.value)}
                      >
                        <option value="">Select one</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="one-of-several">One of several</option>
                      </select>
                      {errors.decisionMaker && <span className="book-form-error">{errors.decisionMaker}</span>}
                    </div>

                    <div className="book-form-field">
                      <label className="label" htmlFor="bf-intent">What made you book a call?</label>
                      <textarea
                        id="bf-intent"
                        className={`input book-form-textarea${errors.intent ? ' input-error' : ''}`}
                        rows={3}
                        value={form.intent}
                        onChange={e => handleField('intent', e.target.value)}
                      />
                      {errors.intent && <span className="book-form-error">{errors.intent}</span>}
                    </div>

                    {apiError && <div className="book-form-error" style={{ marginBottom: 8 }}>{apiError}</div>}
                    <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Book Initial Call'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
