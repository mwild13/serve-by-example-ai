"use client";

import { useState } from "react";

function fmt(n: number) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

export default function ROICalculator() {
  const [staffCount, setStaffCount] = useState(10);
  const [avgTransaction, setAvgTransaction] = useState(45);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Staff × 40 transactions/week × Avg Value × 5% lift × 52 weeks
  const annualLift = staffCount * 40 * avgTransaction * 0.05 * 52;
  const yr1 = annualLift;
  const yr3 = annualLift * 3;
  const yr5 = annualLift * 5;

  const bars = [
    { label: "Year 1", value: yr1, widthPct: 20 },
    { label: "Year 3", value: yr3, widthPct: 60 },
    { label: "Year 5", value: yr5, widthPct: 100 },
  ];

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    setEmailSent(true);
  }

  return (
    <section className="roi-section roi-section-band" id="roi-calculator">
      <div className="container">
        <div className="roi-card">
          <div className="roi-header">
            <span className="eyebrow">Revenue Impact Calculator</span>
            <h2>See what better training is worth</h2>
            <p className="roi-sub">
              A 5% lift in average transaction value &mdash; that&rsquo;s one better upsell per shift.
            </p>
          </div>

          <div className="roi-controls">
            <div className="roi-slider-group">
              <label className="roi-label" htmlFor="roi-staff">
                Staff count
                <strong className="roi-value-badge">{staffCount}</strong>
              </label>
              <input
                id="roi-staff"
                type="range"
                min={1}
                max={50}
                value={staffCount}
                onChange={(e) => setStaffCount(Number(e.target.value))}
                className="roi-range"
              />
              <div className="roi-range-labels">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            <div className="roi-slider-group">
              <label className="roi-label" htmlFor="roi-avg">
                Avg transaction value
                <strong className="roi-value-badge">${avgTransaction}</strong>
              </label>
              <input
                id="roi-avg"
                type="range"
                min={10}
                max={200}
                step={5}
                value={avgTransaction}
                onChange={(e) => setAvgTransaction(Number(e.target.value))}
                className="roi-range"
              />
              <div className="roi-range-labels">
                <span>$10</span>
                <span>$200</span>
              </div>
            </div>
          </div>

          <div className="roi-result">
            <span className="roi-result-label">Projected annual revenue lift</span>
            <span className="roi-result-value">
              ${fmt(annualLift)}
            </span>
            <span className="roi-result-note">
              Based on {staffCount} staff &times; 40 transactions/week &times; ${avgTransaction} avg &times; 5% uplift
            </span>
          </div>

          {/* 1 / 3 / 5-year bar chart */}
          <div className="roi-chart" aria-label="Cumulative revenue lift projection">
            <p className="roi-chart-heading">Cumulative lift over time</p>
            <div className="roi-chart-bars">
              {bars.map((bar) => (
                <div key={bar.label} className="roi-chart-row">
                  <span className="roi-chart-label">{bar.label}</span>
                  <div className="roi-chart-track">
                    <div
                      className="roi-chart-fill"
                      style={{ width: `${bar.widthPct}%` }}
                      role="presentation"
                    />
                  </div>
                  <span className="roi-chart-value">${fmt(bar.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email-capture CTA */}
          <div className="roi-email-cta">
            {emailSent ? (
              <p className="roi-email-thanks">
                Thanks &mdash; we&rsquo;ll email your projection shortly.
              </p>
            ) : (
              <form className="roi-email-form" onSubmit={handleEmailSubmit}>
                <label htmlFor="roi-email" className="roi-email-label">
                  Email me this projection
                </label>
                <div className="roi-email-row">
                  <input
                    id="roi-email"
                    type="email"
                    placeholder="you@yourvenue.com.au"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="roi-email-input"
                    required
                  />
                  <button
                    type="submit"
                    className="roi-email-btn"
                    disabled={sending}
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
