import React from "react";

const rows = [
  {
    capability: "Scenario Simulator",
    sbe: "Yes — scored dynamically across 5 dimensions",
    lms: "No — restricted to static text and passive video",
    binders: "No — requires manual GM time",
  },
  {
    capability: "Mobile-First Design",
    sbe: "Yes — tap-based microlearning",
    lms: "No — designed for desktop compliance",
    binders: "No — physically bound to venue",
  },
  {
    capability: "Automatic Progress Sync",
    sbe: "Yes — automatic dashboard sync",
    lms: "No — requires manual tracking",
    binders: "No — managed via check sheets",
  },
  {
    capability: "Menu Customisation",
    sbe: "Yes — auto-built from menu files",
    lms: "No — generic out-of-the-box courses",
    binders: "Yes — but highly time-consuming",
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
          Serve By Example is purpose-built for hospitality — not a generic corporate LMS retrofitted for the industry.
        </p>
      </div>

      <div className="compare-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-th sbe-sans-body" style={{ fontWeight: 600 }}>Capability</th>
              <th className="compare-th sbe-sans-body compare-highlight" style={{ textAlign: "center", fontWeight: 600 }}>
                Serve By Example
              </th>
              <th className="compare-th sbe-sans-body" style={{ textAlign: "center" }}>Generic LMS</th>
              <th className="compare-th sbe-sans-body" style={{ textAlign: "center" }}>Manual Binders</th>
            </tr>
          </thead>
          <tbody className="sbe-sans-body">
            {rows.map((row) => (
              <tr key={row.capability}>
                <td className="compare-td" style={{ fontWeight: 600 }}>{row.capability}</td>
                <td className="compare-td compare-highlight" style={{ textAlign: "center" }}>{row.sbe}</td>
                <td className="compare-td" style={{ textAlign: "center", color: "var(--mkt-charcoal-400)" }}>{row.lms}</td>
                <td className="compare-td" style={{ textAlign: "center", color: "var(--mkt-charcoal-400)" }}>{row.binders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
