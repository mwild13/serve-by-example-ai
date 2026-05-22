'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import StickyDemoCTA from '@/components/StickyDemoCTA';


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
  const heroRef = useRef<HTMLElement>(null);

  function handleField(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  }

  function openModal() {
    setShowModal(true);
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
  }

  function closeModal() {
    setShowModal(false);
  }

  function scrollToProductTour() {
    const el = document.getElementById('product-tour');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  return (
    <>
      <section className="hero" ref={heroRef}>
        <div className="container">

          <h1>Training Software Built for Hospitality Teams</h1>
          <p className="hero-tagline">From 6 months of onboarding to 6 weeks with AI</p>

          <p className="hero-sub" style={{ marginTop: 20 }}>
            Scenario-based AI training that gets new staff floor-ready in six weeks, not six months.
          </p>

          <div className="hero-cta-tiles">
            <button className="hero-cta-tile hero-cta-tile-primary" onClick={openModal}>
              Book a call
            </button>
            <button className="hero-cta-tile hero-cta-tile-secondary" onClick={scrollToProductTour}>
              How it works
            </button>
          </div>

          <div className="hero-showcase">
            <Image
              src="/257shots_so.jpg"
              alt="Serve By Example staff training dashboard"
              width={1400}
              height={875}
              priority
              className="hero-showcase-img"
            />
          </div>

        </div>
      </section>

      <StickyDemoCTA heroRef={heroRef} />

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
                  We&rsquo;ll map out your current staff onboarding layout, look at your venue count, and determine if interactive AI roleplay can realistically drop your training timeline from six months down to six weeks.
                </p>
                <blockquote className="book-modal-blockquote">
                  <strong>Zero fluff. No aggressive sales pitch.</strong> There is absolutely no point walking you through a software console unless it mathematically protects your venue&rsquo;s service margins, fixes consistency issues, and gets your new hires floor-ready before their first real shift.
                </blockquote>
              </div>

              {/* Right form panel */}
              <div className="book-modal-right">
                {submitted ? (
                  <div className="book-modal-success">
                    <h3>We&rsquo;ll be in touch shortly.</h3>
                    <p>Thanks for booking — we&rsquo;ll reach out within one business day to lock in your call.</p>
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

                    <button type="submit" className="btn btn-primary btn-block">
                      Book Initial Call
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
