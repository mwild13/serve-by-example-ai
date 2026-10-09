"use client";

import { useState, useMemo } from "react";
import type { CSSProperties } from "react";

function fmt(n: number) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function fillPct(val: number, min: number, max: number): string {
  return (((val - min) / (max - min)) * 100).toFixed(2);
}

// Static model constants
const T       = 0.74;   // annual hospitality turnover rate
const CH      = 2490;   // loaded replacement cost per employee ($)
const W_GM    = 30;     // GM loaded hourly rate ($/hr)
const TX      = 40;     // avg weekly transactions per employee
const U_IMPACT = 0.15;  // upsell conversion improvement
const M_GROSS  = 0.75;  // gross margin on upsold items

export default function ROICalculator() {
  const [headcount, setHeadcount]       = useState(15);
  const [managerHours, setManagerHours] = useState(8);
  const [avgTicket, setAvgTicket]       = useState(45);
  const [email, setEmail]               = useState("");
  const [emailSent, setEmailSent]       = useState(false);
  const [sending, setSending]           = useState(false);

  const { turnoverSavings, managerSavings, upsellProfit, totalSavings } = useMemo(() => {
    const turnoverSavings = Math.round(headcount * T * CH * 0.23);
    const managerSavings  = Math.round(managerHours * 52 * W_GM * 0.60);
    const upsellProfit    = Math.round(headcount * TX * 52 * (avgTicket * 0.15) * U_IMPACT * M_GROSS);
    return { turnoverSavings, managerSavings, upsellProfit, totalSavings: turnoverSavings + managerSavings + upsellProfit };
  }, [headcount, managerHours, avgTicket]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/roi/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          headcount,
          managerHours,
          avgTicket,
          turnoverSavings,
          managerSavings,
          upsellProfit,
          totalSavings,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Could not send email. Please try again.");
        return;
      }
      setEmailSent(true);
    } catch {
      alert("Connection error. Please check your internet and try again.");
    } finally {
      setSending(false);
    }
  }

  const fields = [
    {
      id: "roi-headcount",
      label: "Frontline staff",
      ariaLabel: "Number of frontline staff",
      value: headcount,
      set: setHeadcount,
      min: 5,
      max: 150,
      step: 1,
      prefix: "",
      suffix: "",
    },
    {
      id: "roi-manager-hours",
      label: "Manager training hours/week",
      ariaLabel: "Weekly manager hours spent on manual training",
      value: managerHours,
      set: setManagerHours,
      min: 2,
      max: 40,
      step: 1,
      prefix: "",
      suffix: "h",
    },
    {
      id: "roi-avg-ticket",
      label: "Average check size",
      ariaLabel: "Average check size in dollars",
      value: avgTicket,
      set: setAvgTicket,
      min: 15,
      max: 150,
      step: 5,
      prefix: "AUD",
      suffix: "",
    },
  ];

  const lines = [
    { label: "Turnover cost reduction", value: turnoverSavings, note: "23% of replacement costs recovered" },
    { label: "Reclaimed manager time", value: managerSavings, note: "60% of manual training hours saved" },
    { label: "Upsell profit lift", value: upsellProfit, note: "15% of check · 15% conversion gain · 75% margin" },
  ];

  return (
    <section className="sbe-mkt-roi sbe-mkt-on-dark" id="roi-calculator">
      <div className="container">

        <header className="sbe-mkt-head sbe-mkt-head-split">
          <div>
            <p className="sbe-mkt-kicker">Revenue Impact Calculator</p>
            <h2 className="sbe-mkt-display">Put a dollar figure on better training.</h2>
          </div>
          <p className="sbe-mkt-lede">
            Move the sliders to match your venue. The estimate covers staff turnover, manager time and upsell.
          </p>
        </header>

        <div className="sbe-mkt-roi-grid">

          {/* ── Sliders, with the email capture under them so it stays in view ── */}
          <div className="sbe-mkt-roi-inputs">
            <div className="sbe-mkt-roi-controls">
              {fields.map((field) => (
                <div key={field.id}>
                  <div className="sbe-mkt-roi-field-head">
                    <label htmlFor={field.id} className="sbe-mkt-roi-label">{field.label}</label>
                    <output htmlFor={field.id} className="sbe-mkt-roi-value">
                      {field.prefix ? <small>{field.prefix}</small> : null}
                      {field.prefix ? "$" : ""}{field.value}{field.suffix}
                    </output>
                  </div>
                  <div className="sbe-mkt-roi-rail">
                    <input
                      id={field.id}
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={field.value}
                      onChange={(e) => field.set(Number(e.target.value))}
                      className="sbe-mkt-roi-range"
                      aria-label={field.ariaLabel}
                      style={{ "--sbe-fill": `${fillPct(field.value, field.min, field.max)}%` } as CSSProperties}
                    />
                  </div>
                  <div className="sbe-mkt-roi-bounds">
                    <span>{field.prefix ? `${field.prefix} $` : ""}{field.min}{field.suffix}</span>
                    <span>{field.prefix ? `${field.prefix} $` : ""}{field.max}{field.suffix}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sbe-mkt-roi-email">
              {emailSent ? (
                <p className="sbe-mkt-roi-sent">Thanks. We&apos;ll email your projection shortly.</p>
              ) : (
                <>
                  <form onSubmit={handleEmailSubmit} className="sbe-mkt-roi-form" noValidate>
                    <div className="sbe-mkt-roi-form-field">
                      <label htmlFor="roi-email">Want these numbers in your inbox?</label>
                      <input
                        id="roi-email"
                        type="email"
                        placeholder="you@yourvenue.com.au"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="sbe-mkt-roi-input"
                      />
                    </div>
                    <button type="submit" disabled={sending} className="sbe-mkt-btn-primary sbe-mkt-roi-submit">
                      {sending ? "Sending…" : "Send my projection"}
                    </button>
                  </form>
                  <p className="sbe-mkt-roi-fineprint">No spam. One click to unsubscribe.</p>
                </>
              )}
            </div>
          </div>

          {/* ── Readout ── */}
          <div aria-live="polite">
            <p className="sbe-mkt-roi-total-label">Total annual profit lift</p>
            <p className="sbe-mkt-roi-total">
              <small>AUD</small>
              ${fmt(totalSavings)}
            </p>

            <dl className="sbe-mkt-roi-lines">
              {lines.map((row) => (
                <div key={row.label} className="sbe-mkt-roi-line">
                  <dt>{row.label}</dt>
                  <dd>AUD ${fmt(row.value)}</dd>
                  <dd className="sbe-mkt-roi-note">{row.note}</dd>
                </div>
              ))}
            </dl>

            <p className="sbe-mkt-roi-fineprint">
              Indicative modelling only. Based on published AU hospitality benchmarks (74% turnover rate, $2,490 average replacement cost). Actual results vary by venue type, team size, and service context.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
