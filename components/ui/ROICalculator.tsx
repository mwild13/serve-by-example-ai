"use client";

import { useState } from "react";

export default function ROICalculator() {
  const [staffCount, setStaffCount] = useState(10);
  const [avgTransaction, setAvgTransaction] = useState(45);

  // Formula: Staff × 40 transactions/week × Avg Value × 5% lift × 52 weeks
  const weeklyLift = staffCount * 40 * avgTransaction * 0.05;
  const annualLift = weeklyLift * 52;

  return (
    <section className="roi-section">
      <div className="container">
        <div className="roi-card">
          <div className="roi-header">
            <span className="eyebrow">Revenue Impact Calculator</span>
            <h2>See what better training is worth</h2>
            <p className="roi-sub">
              A 5% lift in average transaction value — that&rsquo;s one better upsell per shift.
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
              ${annualLift.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
            </span>
            <span className="roi-result-note">
              Based on {staffCount} staff × 40 transactions/week × ${avgTransaction} avg × 5% uplift
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
