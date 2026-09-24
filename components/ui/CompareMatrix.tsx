/**
 * CompareMatrix.tsx
 *
 * Feature comparison for /pricing and /for-venues, rendered as a dark panel
 * that matches the navbar / hero (--bg-dark tokens).
 *
 * Columns: Staff | Venue | Group | Franchise
 * Sections: A — Learning Engine | B — Venue Operations | C — Support
 *
 * The table only carries rows that differ between tiers or carry a number.
 * Features that are identical on every plan, plus the manager / franchise /
 * security detail, live in the "What's included" block below the table.
 *
 * Binary Icon Rule:
 *   - Simple Yes/No states: render <IncludedIcon/> or <ExcludedIcon/> only.
 *   - Capacity values: render <IncludedIcon/> followed by the value string.
 *   - No "Yes" / "No" text labels anywhere.
 *
 * Rules enforced:
 *   - No Tailwind utility classes; styles live in globals.css (.sbe-compare-*).
 *   - All colours via CSS custom properties (var(--...)).
 *   - Headings via var(--font-fraunces); body via var(--font-manrope).
 */

import React from "react";
import { IncludedIcon, ExcludedIcon } from "@/components/ui/PricingIcons";

// ─── Types ───────────────────────────────────────────────────────────────────

type CellValue =
  | "yes"
  | "no"
  | string; // capacity string e.g. "Up to 35"

interface MatrixRow {
  label: string;
  staff: CellValue;
  venue: CellValue;
  group: CellValue;
  franchise: CellValue;
}

interface MatrixSection {
  title: string;
  /** Inline SVG path string for the section header icon (24×24 viewBox). */
  iconPath: string;
  rows: MatrixRow[];
}

interface IncludedGroup {
  heading: string;
  items: { label: string; tier?: string }[];
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
        label: "AI Arena (live scenarios + written feedback)",
        staff: "Unlimited",
        venue: "Unlimited",
        group: "Unlimited",
        franchise: "Unlimited",
      },
      {
        label: "Mastery engine (ELO scoring, spaced repetition, badges, streaks)",
        staff: "yes",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Full training toolkit (drills, challenges, cocktail library, 19 languages)",
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
        label: "Manager Console",
        staff: "no",
        venue: "yes",
        group: "yes",
        franchise: "yes",
      },
      {
        label: "Team Performance Leaderboard",
        staff: "no",
        venue: "yes",
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
        label: "Compliance Tracking",
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
    ],
  },
  {
    title: "Support",
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
        label: "SLA documentation",
        staff: "no",
        venue: "no",
        group: "no",
        franchise: "yes",
      },
    ],
  },
];

const includedGroups: IncludedGroup[] = [
  {
    heading: "On every plan",
    items: [
      { label: "Rapid-fire knowledge drills" },
      { label: "Interactive challenges" },
      { label: "Cocktail library (38 recipes)" },
      { label: "Knowledge base" },
      { label: "19-language staff support" },
      { label: "Training diagnostic" },
      { label: "Founding member rate lock" },
    ],
  },
  {
    heading: "Manager tools",
    items: [
      { label: "Staff invite via venue code", tier: "Venue and up" },
      { label: "AI coaching for managers", tier: "Venue and up" },
      { label: "Multi-venue roster management", tier: "Franchise" },
    ],
  },
  {
    heading: "Franchise extras",
    items: [
      { label: "Custom module development", tier: "Franchise" },
      { label: "White-label options", tier: "Franchise" },
      { label: "Custom SLA", tier: "Franchise" },
    ],
  },
  {
    heading: "Security and uptime",
    items: [
      { label: "Data isolation (Supabase RLS)" },
      { label: "Secure single-session architecture" },
      { label: "99.9% uptime target on Cloudflare edge" },
    ],
  },
];

const TIER_LABELS = ["Staff", "Venue", "Group", "Franchise"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Renders a single cell value.
 *   "yes" → <IncludedIcon/> only
 *   "no"  → <ExcludedIcon/> only
 *   string (capacity / text) → <IncludedIcon/> + value text
 */
function Cell({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <div className="sbe-compare-cell">
        <IncludedIcon tone="dark" />
      </div>
    );
  }

  if (value === "no") {
    return (
      <div className="sbe-compare-cell">
        <ExcludedIcon tone="dark" />
      </div>
    );
  }

  return (
    <div className="sbe-compare-cell sbe-compare-cell--text">
      <IncludedIcon tone="dark" />
      <span>{value}</span>
    </div>
  );
}

function SectionIcon({ path }: { path: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CompareMatrix() {
  return (
    <div className="sbe-compare">
      {/* ── Header ── */}
      <div className="sbe-compare-head">
        <span className="sbe-compare-eyebrow">Full Comparison</span>
        <h2 className="sbe-compare-title">Everything, side by side.</h2>
        <p className="sbe-compare-sub">
          Every limit that changes between plans. No asterisks.
        </p>
      </div>

      {/* ── Table wrapper — horizontal scroll on small screens ── */}
      <div className="sbe-compare-scroll">
        <table className="sbe-compare-table">
          <thead>
            <tr>
              <th className="sbe-compare-th sbe-compare-th--label" scope="col">
                Feature
              </th>
              {TIER_LABELS.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className={
                    "sbe-compare-th" +
                    (label === "Venue" ? " sbe-compare-col--featured" : "")
                  }
                >
                  <div className="sbe-compare-th-inner">
                    <span className="sbe-compare-tier">{label}</span>
                    {(label === "Venue" || label === "Group") && (
                      <span className="sbe-compare-pill">
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
                <tr>
                  <td colSpan={5} className="sbe-compare-section">
                    <div className="sbe-compare-section-inner">
                      <SectionIcon path={section.iconPath} />
                      <span>
                        {String.fromCharCode(65 + sIdx)} — {section.title}
                      </span>
                    </div>
                  </td>
                </tr>

                {section.rows.map((row) => (
                  <tr key={row.label} className="sbe-compare-row">
                    <th scope="row" className="sbe-compare-label">
                      {row.label}
                    </th>
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
                        className={
                          "sbe-compare-td" +
                          (colIdx === 1 ? " sbe-compare-col--featured" : "")
                        }
                      >
                        <Cell value={val} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── What's included ── */}
      <div className="sbe-compare-included">
        <h3 className="sbe-compare-included-title">What else is included</h3>
        <div className="sbe-compare-included-grid">
          {includedGroups.map((group) => (
            <div key={group.heading} className="sbe-compare-included-group">
              <h4 className="sbe-compare-included-heading">{group.heading}</h4>
              <ul className="sbe-compare-included-list">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <IncludedIcon tone="dark" size={14} />
                    <span>
                      {item.label}
                      {item.tier && (
                        <span className="sbe-compare-included-tier">
                          {item.tier}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
