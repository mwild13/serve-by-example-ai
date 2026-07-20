/**
 * CompareMatrix.tsx
 *
 * Full-width feature comparison matrix for the /membership page.
 *
 * Columns: Staff | Venue | Group | Franchise
 * Sections: A — Learning Engine | B — Mastery & Progress |
 *           C — Venue Operations | D — Support & Trust
 *
 * Binary Icon Rule:
 *   - Simple Yes/No states: render <IncludedIcon/> or <ExcludedIcon/> only.
 *   - Capacity values: render <IncludedIcon/> followed by the value string.
 *   - No "Yes" / "No" text labels anywhere.
 *
 * Sticky thead:
 *   The <thead> carries className="pricing-matrix-sticky" so globals.css can
 *   apply position:sticky / box-shadow without touching this file.
 *
 * Rules enforced:
 *   - No Tailwind utility classes.
 *   - All colours via CSS custom properties (var(--...)).
 *   - All radius via var(--radius-*).
 *   - Headings via var(--font-fraunces); body via var(--font-manrope).
 */

import React, { CSSProperties } from "react";
import {
  IncludedIcon,
  ExcludedIcon,
  TreeConnector,
} from "@/components/ui/PricingIcons";

// ─── Types ───────────────────────────────────────────────────────────────────

type CellValue =
  | "yes"
  | "no"
  | string; // capacity string e.g. "Up to 35 staff seats"

interface MatrixRow {
  label: string;
  staff: CellValue;
  venue: CellValue;
  group: CellValue;
  franchise: CellValue;
  /** If true, renders this row indented with a TreeConnector. */
  isSubRow?: boolean;
}

interface MatrixSection {
  title: string;
  /** Inline SVG path string for the section header icon (24×24 viewBox). */
  iconPath: string;
  rows: MatrixRow[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const sections: MatrixSection[] = [
  {
    title: "Learning Engine",
    iconPath:
      "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
    rows: [
      {
        label: "Total training modules",
        staff: "40 modules",
        venue: "40 modules",
        group: "40 modules",
        franchise: "40 + custom",
      },
      {
        label: "Training tracks",
        staff: "Bartending, Sales & Management",
        venue: "Bartending, Sales & Management",
        group: "Bartending, Sales & Management",
        franchise: "All tracks + custom",
      },
      {
        label: "Neural Scenario Forge (AI Arena evaluations)",
        staff: "Unlimited",
        venue: "Unlimited",
        group: "Unlimited",
        franchise: "Unlimited",
      },
      {
        label: "AI evaluation scoring + written feedback per response",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
        isSubRow: true,
      },
      {
        label: "Rapid Deploy Drilling",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Reflex Scenario Challenges",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Cocktail Library (38 recipes)",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "101 Knowledge Base",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Multilingual Activation Layer",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Deployment Intelligence Survey",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
    ],
  },
  {
    title: "Mastery & Progress",
    iconPath:
      "M22 12 18 12 15 21 9 3 6 12 2 12",
    rows: [
      {
        label: "Dynamic Skill Calibration (ELO scoring)",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Spaced repetition scheduling",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Badge + achievement system",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Streak tracking",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Personal progress overview",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
    ],
  },
  {
    title: "Venue Operations",
    iconPath:
      "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
    rows: [
      {
        label: "Staff seats",
        staff: "1 (solo)",
        venue: "Up to 15",
        group: "Up to 35",
        franchise: "Unlimited",
      },
      {
        label: "Venues",
        staff: "1",
        venue: "1",
        group: "Multi",
        franchise: "Unlimited",
      },
      {
        label: "Command & Compliance Centre",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Competitive Performance Index",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Compliance Pulse Monitoring",
        staff: "no",
        venue: "no",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Cohort analytics and trend reporting",
        staff: "no",
        venue: "no",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Venue inventory management",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Training program management",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Staff invite via venue code",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Operator Intelligence Assistant",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Franchise Command Network",
        staff: "no",
        venue: "no",
        group: "no",
        franchise: "yes",
      },
      {
        label: "Custom module development",
        staff: "no",
        venue: "no",
        group: "no",
        franchise: "yes",
      },
      {
        label: "White-label options",
        staff: "no",
        venue: "no",
        group: "no",
        franchise: "yes",
      },
    ],
  },
  {
    title: "Support & Trust",
    iconPath:
      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.72a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15.92z",
    rows: [
      {
        label: "Onboarding sessions",
        staff: "no",
        venue: "1 guided call",
        group: "2 sessions",
        franchise: "Unlimited",
      },
      {
        label: "Support channel",
        staff: "Email",
        venue: "Email",
        group: "Priority email",
        franchise: "Dedicated account manager",
      },
      {
        label: "Response time target",
        staff: "48 hrs",
        venue: "24 hrs",
        group: "8 hrs",
        franchise: "4 hrs",
      },
      {
        label: "14-day free trial",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "no",
      },
      {
        label: "Founding member rate lock",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Data isolation (Supabase RLS)",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Secure Single-Session Architecture",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "SLA documentation",
        staff: "no",
        venue: "no",
        group: "no",
        franchise: "yes",
      },
      {
        label: "Uptime target",
        staff: "99.9% (Cloudflare edge)",
        venue: "99.9% (Cloudflare edge)",
        group: "99.9% (Cloudflare edge)",
        franchise: "Custom SLA",
      },
    ],
  },
];

const TIER_LABELS = ["Staff", "Venue", "Group", "Franchise"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Renders a single cell value.
 *
 * Binary Rule:
 *   "yes" → <IncludedIcon/> only
 *   "no"  → <ExcludedIcon/> only
 *   string (capacity / text) → <IncludedIcon/> + value text
 *
 * Exception: if value looks like a negative string that isn't "no"
 * (shouldn't happen with this dataset) it still renders as text.
 */
function Cell({ value }: { value: CellValue }) {
  const cellStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontFamily: "var(--font-manrope)",
    fontSize: "0.8125rem",
    color: "var(--text-soft)",
    lineHeight: 1.4,
    textAlign: "center" as const,
  };

  if (value === "yes") {
    return (
      <div style={cellStyle}>
        <IncludedIcon />
      </div>
    );
  }

  if (value === "no") {
    return (
      <div style={cellStyle}>
        <ExcludedIcon />
      </div>
    );
  }

  // Capacity or text value — icon + string
  return (
    <div style={{ ...cellStyle, flexWrap: "wrap" as const }}>
      <IncludedIcon />
      <span>{value}</span>
    </div>
  );
}

// ─── Section header icon ──────────────────────────────────────────────────────

function SectionIcon({ path }: { path: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--green)", flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CompareMatrix() {
  const colWidth = "18%";
  const labelColWidth = "28%";

  const thStyle: CSSProperties = {
    padding: "16px 12px",
    fontFamily: "var(--font-manrope)",
    fontWeight: 600,
    fontSize: "0.875rem",
    color: "var(--text)",
    textAlign: "center",
    verticalAlign: "bottom",
    borderBottom: "2px solid var(--line)",
    whiteSpace: "nowrap" as const,
  };

  const labelThStyle: CSSProperties = {
    ...thStyle,
    textAlign: "left",
    width: labelColWidth,
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: "0.8125rem",
  };

  return (
    <div style={{ width: "100%" }}>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span
          className="eyebrow"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Full Comparison
        </span>
        <h2
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "clamp(1.6rem, 3vw, 2rem)",
            color: "var(--text)",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Everything, side by side.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-manrope)",
            color: "var(--text-soft)",
            fontSize: "0.9375rem",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Every feature, every limit. No asterisks.
        </p>
      </div>

      {/* ── Table wrapper — horizontal scroll on small screens ── */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 640,
            borderCollapse: "collapse",
            background: "var(--surface)",
          }}
        >
          {/* ── Sticky thead ── */}
          <thead className="pricing-matrix-sticky">
            <tr>
              <th style={labelThStyle}>Feature</th>
              {TIER_LABELS.map((label) => (
                <th key={label} style={{ ...thStyle, width: colWidth }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontSize: "1rem",
                        color: "var(--text)",
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </span>
                    {(label === "Venue" || label === "Group") && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--green)",
                          background: "var(--green-light)",
                          borderRadius: "999px",
                          padding: "2px 8px",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase" as const,
                        }}
                      >
                        {label === "Venue" ? "Most Popular" : "Best Value"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sections.map((section, sIdx) => (
              <React.Fragment key={section.title}>
                {/* ── Section header row ── */}
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "14px 20px",
                      background: "var(--bg-alt)",
                      borderTop: sIdx === 0 ? "none" : "2px solid var(--line)",
                      borderBottom: "1px solid var(--line-light)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <SectionIcon path={section.iconPath} />
                      <span
                        style={{
                          fontFamily: "var(--font-manrope)",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase" as const,
                          color: "var(--text-soft)",
                        }}
                      >
                        {String.fromCharCode(65 + sIdx)} — {section.title}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* ── Feature rows ── */}
                {section.rows.map((row, rIdx) => {
                  const isLastRow = rIdx === section.rows.length - 1;
                  const rowBg = row.isSubRow ? "var(--bg-alt)" : "var(--surface)";

                  return (
                    <tr
                      key={row.label}
                      style={{ background: rowBg }}
                    >
                      {/* Label cell */}
                      <td
                        style={{
                          padding: row.isSubRow
                            ? "8px 20px 8px 12px"
                            : "13px 20px",
                          borderBottom: isLastRow
                            ? "none"
                            : "1px solid var(--line-light)",
                          verticalAlign: "middle",
                        }}
                      >
                        {row.isSubRow ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "6px",
                            }}
                          >
                            <TreeConnector />
                            <span
                              style={{
                                fontFamily: "var(--font-manrope)",
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                                lineHeight: 1.4,
                              }}
                            >
                              {row.label}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontFamily: "var(--font-manrope)",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "var(--text)",
                              lineHeight: 1.4,
                            }}
                          >
                            {row.label}
                          </span>
                        )}
                      </td>

                      {/* Value cells */}
                      {(
                        [
                          row.staff,
                          row.venue,
                          row.group,
                          row.franchise,
                        ] as CellValue[]
                      ).map((val, colIdx) => (
                        <td
                          key={colIdx}
                          style={{
                            padding: row.isSubRow ? "8px 12px" : "13px 12px",
                            borderBottom: isLastRow
                              ? "none"
                              : "1px solid var(--line-light)",
                            borderLeft: "1px solid var(--line-light)",
                            verticalAlign: "middle",
                          }}
                        >
                          <Cell value={val} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
