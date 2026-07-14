import React from "react";

const rows = [
  {
    capability: "Staff Training Format",
    sbe: "60-Second Active Scenarios",
    sbeDetail: "Staff build muscle memory on 5 operational dimensions",
    lms: "Passive Compliance Videos",
    lmsDetail: "Staff skip or mute long corporate videos",
    binders: "Trial by Fire on Floor",
    bindersDetail: "Live mistakes made in front of paying guests",
  },
  {
    capability: "Accessibility",
    sbe: "Tap-Based Microlearning",
    sbeDetail: "Optimized for quick 3-minute shift breaks",
    lms: "Desktop-Heavy Portals",
    lmsDetail: "Impossible to access during a busy service",
    binders: "The Back-Office Folder",
    bindersDetail: "Physically tethered to a dusty office shelf",
  },
  {
    capability: "Manager Oversight",
    sbe: "Live Audit-Ready Dashboard",
    sbeDetail: "Real-time progress tracking updates instantly",
    lms: "Lagging CSV Reports",
    lmsDetail: "Requires manual data pulls to check completions",
    binders: "Chasing Staff on Floor",
    bindersDetail: "Manually tracking down signatures on clipboards",
  },
  {
    capability: "Time to Go-Live",
    sbe: "Under 5 Minutes",
    sbeDetail: "Deploy purpose-built training modules to your team instantly",
    lms: "30 to 90 Days",
    lmsDetail: "Requires lengthy corporate sales, onboarding, and setup cycles",
    binders: "Never Truly Finished",
    bindersDetail: "A constant cycle of printing, organizing, and losing papers",
  },
];

export default function CompareMatrix() {
  return (
    <div className="sbe-mkt-scope" style={{ width: "100%", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <span className="sbe-eyebrow">Platform Comparison</span>
        <h2 className="sbe-serif-title" style={{ marginBottom: "0.5rem" }}>
          See how we compare
        </h2>
        <p className="sbe-sans-body" style={{ color: "var(--mkt-charcoal-400)", maxWidth: "520px", margin: "0 auto" }}>
          Serve By Example is purpose-built for hospitality. Not a generic corporate LMS retrofitted for the industry.
        </p>
      </div>

      <div className="compare-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-th sbe-sans-body" style={{ fontWeight: 600 }}>Capability</th>
              <th className="compare-th sbe-sans-body compare-sbe-header" style={{ textAlign: "center", fontWeight: 600, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    display: "inline-block",
                    background: "var(--green)",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}>
                    Purpose-Built
                  </span>
                  <span>Serve By Example</span>
                </div>
              </th>
              <th className="compare-th sbe-sans-body" style={{ textAlign: "center", color: "var(--mkt-charcoal-400)" }}>Generic LMS</th>
              <th className="compare-th sbe-sans-body" style={{ textAlign: "center", color: "var(--mkt-charcoal-400)" }}>Manual Binders</th>
            </tr>
          </thead>
          <tbody className="sbe-sans-body">
            {rows.map((row) => (
              <tr key={row.capability}>
                <td className="compare-td" style={{ fontWeight: 600, color: "var(--text)" }}>{row.capability}</td>
                <td className="compare-td compare-sbe-cell" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontWeight: 600, color: "var(--green)" }}>{row.sbe}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: "1.4" }}>{row.sbeDetail}</div>
                  </div>
                </td>
                <td className="compare-td" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontWeight: 600, color: "var(--mkt-charcoal-400)" }}>{row.lms}</div>
                    <div style={{ fontSize: "13px", color: "var(--mkt-charcoal-300)", lineHeight: "1.4" }}>{row.lmsDetail}</div>
                  </div>
                </td>
                <td className="compare-td" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontWeight: 600, color: "var(--mkt-charcoal-400)" }}>{row.binders}</div>
                    <div style={{ fontSize: "13px", color: "var(--mkt-charcoal-300)", lineHeight: "1.4" }}>{row.bindersDetail}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
