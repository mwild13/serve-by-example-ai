"use client";

import { useState, useMemo, useRef, useEffect } from "react";

function fmt(n: number) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function fillPct(val: number, min: number, max: number): string {
  return (((val - min) / (max - min)) * 100).toFixed(2);
}

function sliderBg(pct: string): string {
  return `linear-gradient(to right, var(--mkt-gold-500) ${pct}%, var(--mkt-border-subtle) ${pct}%)`;
}

// Hydration-safe default fills — must match state defaults exactly
const HC_DEFAULT_PCT = fillPct(15, 5, 150);  // 6.90%
const MH_DEFAULT_PCT = fillPct(8, 2, 40);    // 15.79%
const AT_DEFAULT_PCT = fillPct(45, 15, 150); // 22.22%

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

  const hcRef = useRef<HTMLInputElement>(null);
  const mhRef = useRef<HTMLInputElement>(null);
  const atRef = useRef<HTMLInputElement>(null);

  const { turnoverSavings, managerSavings, upsellProfit, totalSavings } = useMemo(() => {
    const turnoverSavings = Math.round(headcount * T * CH * 0.23);
    const managerSavings  = Math.round(managerHours * 52 * W_GM * 0.60);
    const upsellProfit    = Math.round(headcount * TX * 52 * (avgTicket * 0.15) * U_IMPACT * M_GROSS);
    return { turnoverSavings, managerSavings, upsellProfit, totalSavings: turnoverSavings + managerSavings + upsellProfit };
  }, [headcount, managerHours, avgTicket]);

  useEffect(() => {
    if (hcRef.current) hcRef.current.style.background = sliderBg(fillPct(headcount, 5, 150));
    if (mhRef.current) mhRef.current.style.background = sliderBg(fillPct(managerHours, 2, 40));
    if (atRef.current) atRef.current.style.background = sliderBg(fillPct(avgTicket, 15, 150));
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

  return (
    <section className="sbe-mkt-scope" id="roi-calculator" style={{ padding: "4rem 0", background: "var(--mkt-cream-200)" }}>
      <div className="container">

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="sbe-eyebrow">Revenue Impact Calculator</span>
          <h2 className="sbe-serif-title" style={{ marginBottom: "0.75rem" }}>See what better training is worth</h2>
          <p className="sbe-sans-body" style={{ maxWidth: "560px", margin: "0 auto", color: "var(--mkt-charcoal-400)" }}>
            Adjust the inputs below to model your venue&rsquo;s projected annual profit lift across three revenue vectors.
          </p>
        </div>

        {/* Dark forest card */}
        <div style={{
          background: "var(--mkt-forest-900)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          maxWidth: "860px",
          margin: "0 auto",
          boxShadow: "var(--shadow-xl)",
        }}>

          {/* Two-column layout: sliders left, results right */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", alignItems: "flex-start" }}>

            {/* ── Sliders ── */}
            <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "2rem" }}>

              {/* Headcount */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <label htmlFor="roi-headcount" style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.8rem", fontWeight: 600, color: "rgba(250,249,246,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Frontline staff
                  </label>
                  <strong style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "1rem", fontWeight: 700, color: "var(--mkt-gold-500)", background: "rgba(212,175,55,0.12)", padding: "0.15rem 0.6rem", borderRadius: "6px" }}>
                    {headcount}
                  </strong>
                </div>
                <input
                  ref={hcRef}
                  id="roi-headcount"
                  type="range"
                  min={5}
                  max={150}
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="sbe-slider-input"
                  aria-label="Number of frontline staff"
                  aria-valuenow={headcount}
                  aria-valuemin={5}
                  aria-valuemax={150}
                  style={{ background: sliderBg(HC_DEFAULT_PCT) }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", fontSize: "0.72rem", color: "rgba(250,249,246,0.35)", fontFamily: "var(--font-body, system-ui, sans-serif)" }}>
                  <span>5</span><span>150</span>
                </div>
              </div>

              {/* Manager hours */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <label htmlFor="roi-manager-hours" style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.8rem", fontWeight: 600, color: "rgba(250,249,246,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Manager training hours/week
                  </label>
                  <strong style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "1rem", fontWeight: 700, color: "var(--mkt-gold-500)", background: "rgba(212,175,55,0.12)", padding: "0.15rem 0.6rem", borderRadius: "6px" }}>
                    {managerHours}h
                  </strong>
                </div>
                <input
                  ref={mhRef}
                  id="roi-manager-hours"
                  type="range"
                  min={2}
                  max={40}
                  value={managerHours}
                  onChange={(e) => setManagerHours(Number(e.target.value))}
                  className="sbe-slider-input"
                  aria-label="Weekly manager hours spent on manual training"
                  aria-valuenow={managerHours}
                  aria-valuemin={2}
                  aria-valuemax={40}
                  style={{ background: sliderBg(MH_DEFAULT_PCT) }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", fontSize: "0.72rem", color: "rgba(250,249,246,0.35)", fontFamily: "var(--font-body, system-ui, sans-serif)" }}>
                  <span>2h</span><span>40h</span>
                </div>
              </div>

              {/* Average ticket */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <label htmlFor="roi-avg-ticket" style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.8rem", fontWeight: 600, color: "rgba(250,249,246,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Average check size
                  </label>
                  <strong style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "1rem", fontWeight: 700, color: "var(--mkt-gold-500)", background: "rgba(212,175,55,0.12)", padding: "0.15rem 0.6rem", borderRadius: "6px" }}>
                    AUD ${avgTicket}
                  </strong>
                </div>
                <input
                  ref={atRef}
                  id="roi-avg-ticket"
                  type="range"
                  min={15}
                  max={150}
                  step={5}
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="sbe-slider-input"
                  aria-label="Average check size in dollars"
                  aria-valuenow={avgTicket}
                  aria-valuemin={15}
                  aria-valuemax={150}
                  style={{ background: sliderBg(AT_DEFAULT_PCT) }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", fontSize: "0.72rem", color: "rgba(250,249,246,0.35)", fontFamily: "var(--font-body, system-ui, sans-serif)" }}>
                  <span>AUD $15</span><span>AUD $150</span>
                </div>
              </div>

            </div>

            {/* ── Results panel ── */}
            <div style={{ flex: "1 1 240px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "var(--radius-lg)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0" }}>

              {/* Pillar rows */}
              {[
                { label: "Turnover cost reduction", value: turnoverSavings, note: "23% of replacement costs recovered" },
                { label: "Reclaimed manager time", value: managerSavings, note: "60% of manual training hours saved" },
                { label: "Upsell profit lift", value: upsellProfit, note: "15% of check · 15% conversion gain · 75% margin" },
              ].map((row, i) => (
                <div key={row.label} style={{
                  padding: "1rem 0",
                  borderBottom: i < 2 ? "1px solid rgba(231,226,214,0.1)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
                    <span style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.82rem", color: "rgba(250,249,246,0.7)", lineHeight: 1.4 }}>{row.label}</span>
                    <span style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "1rem", fontWeight: 700, color: "var(--mkt-cream-100)", whiteSpace: "nowrap" }}>AUD ${fmt(row.value)}</span>
                  </div>
                  <p style={{ margin: "0.2rem 0 0", fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.7rem", color: "rgba(250,249,246,0.35)", lineHeight: 1.4 }}>{row.note}</p>
                </div>
              ))}

              {/* Total */}
              <div style={{ marginTop: "1.25rem", padding: "1.25rem", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.35)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.25rem", fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mkt-gold-500)" }}>
                  Total Annual Profit Lift
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-heading, Georgia, serif)", fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 600, color: "var(--mkt-gold-500)", lineHeight: 1 }}>
                  AUD ${fmt(totalSavings)}
                </p>
              </div>

              <p style={{ margin: "1rem 0 0", fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.67rem", color: "rgba(250,249,246,0.3)", lineHeight: 1.5, textAlign: "center" }}>
                Indicative modelling only. Based on published AU hospitality benchmarks (74% turnover rate, $2,490 average replacement cost). Actual results vary by venue type, team size, and service context.
              </p>

            </div>
          </div>

          {/* ── Email capture ── */}
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(231,226,214,0.1)" }}>
            {emailSent ? (
              <p style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.95rem", color: "var(--mkt-gold-500)", textAlign: "center", margin: 0 }}>
                Thanks &mdash; we&rsquo;ll email your projection shortly.
              </p>
            ) : (
              <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
                <label htmlFor="roi-email" style={{ fontFamily: "var(--font-body, system-ui, sans-serif)", fontSize: "0.82rem", color: "rgba(250,249,246,0.6)", whiteSpace: "nowrap" }}>
                  Email me this projection
                </label>
                <input
                  id="roi-email"
                  type="email"
                  placeholder="you@yourvenue.com.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: "1 1 200px",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(231,226,214,0.2)",
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--mkt-cream-100)",
                    fontFamily: "var(--font-body, system-ui, sans-serif)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--mkt-gold-500)",
                    color: "var(--mkt-forest-900)",
                    fontFamily: "var(--font-body, system-ui, sans-serif)",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity: sending ? 0.7 : 1,
                    whiteSpace: "nowrap",
                    transition: "opacity 200ms",
                  }}
                >
                  {sending ? "Sending…" : "Email me this projection"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
