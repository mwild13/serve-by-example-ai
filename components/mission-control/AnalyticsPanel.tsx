"use client";

import { useEffect, useState } from "react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { groupStaffByPresentRoles } from "@/lib/management/team-grouping";
import { EmptyState } from "./manager-ui";
import { PageHead, Panel, StatRow, percent } from "./console-ui";

// The Analytics tab for one venue. Extracted from ManagerControlCenter.tsx
// in October 2026. Three parts: this week's figures, a comparison by role,
// and a revenue estimate the manager drives with one slider.
//
// There is no "vs last week" column. No historical snapshot is stored yet,
// so a trend figure would be invented (see To_do_list.md).

const SLIDER_KEY = "sbe_revenue_slider";
const SLIDER_MIN = 5;
const SLIDER_MAX = 300;
// The estimate's fixed assumptions, shown to the manager under the table.
const TRANSACTIONS_PER_SHIFT = 40;
const SHIFTS_PER_WEEK = 3;
const MIN_STAFF_FOR_ESTIMATE = 3;

type Staff = ManagementSnapshot["staff"];
type ScoreKey = "progress" | "serviceScore" | "salesScore" | "productScore";

const ROLE_METRICS: { label: string; key: ScoreKey }[] = [
  { label: "Training completed", key: "progress" },
  { label: "Service score", key: "serviceScore" },
  { label: "Sales score", key: "salesScore" },
  { label: "Product score", key: "productScore" },
];

export interface AnalyticsPanelProps {
  venueStaff: Staff;
  metrics: { avgCompletion: number; avgScenarioScore: number; salesSkill: number; activeThisWeek: number };
  isMultiVenue: boolean;
  onOpenGroupAnalytics: () => void;
  onAddStaff: () => void;
}

function averageOf(members: Staff, key: ScoreKey): number {
  return members.length ? Math.round(members.reduce((sum, m) => sum + m[key], 0) / members.length) : 0;
}

export function AnalyticsPanel({ venueStaff, metrics, isMultiVenue, onOpenGroupAnalytics, onAddStaff }: AnalyticsPanelProps) {
  const [transactionValue, setTransactionValue] = useState(45);

  // The slider position is remembered per browser.
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(SLIDER_KEY));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only preference after hydration.
      if (saved) setTransactionValue(Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, saved)));
    } catch {
      // Storage unavailable: keep the default.
    }
  }, []);

  function handleSlider(value: number) {
    setTransactionValue(value);
    try {
      window.localStorage.setItem(SLIDER_KEY, String(value));
    } catch {
      // The value still applies for this visit.
    }
  }

  // Every role present at the venue gets a column, in a fixed order.
  const roleGroups = groupStaffByPresentRoles(venueStaff);
  const staffForEstimate = Math.max(venueStaff.length, MIN_STAFF_FOR_ESTIMATE);
  const weeklyTransactions = staffForEstimate * TRANSACTIONS_PER_SHIFT * SHIFTS_PER_WEEK;
  const hasStaff = venueStaff.length > 0;

  return (
    <div className="mc-page">
      <PageHead
        title="Analytics"
        description="Where this venue's training stands today."
        actions={
          isMultiVenue ? (
            <button type="button" className="mc-btn" onClick={onOpenGroupAnalytics}>Compare all venues</button>
          ) : undefined
        }
      />

      <StatRow
        items={[
          { label: "Training completed", value: hasStaff ? percent(metrics.avgCompletion, false) : null, sub: "Average across all staff" },
          { label: "Scenario score", value: hasStaff ? percent(metrics.avgScenarioScore, false) : null, sub: "Service, sales and product" },
          { label: "Sales score", value: hasStaff ? percent(metrics.salesSkill, false) : null, sub: "Average across all staff" },
          { label: "Trained this week", value: hasStaff ? `${metrics.activeThisWeek} of ${venueStaff.length}` : null, sub: "Active in the last 7 days" },
        ]}
      />

      <Panel title="By role" description="Average for each role at this venue." flush>
        {roleGroups.length === 0 ? (
          <div className="mc-panel-body">
            <EmptyState copy="No staff added yet." ctaLabel="+ Add staff" onCtaClick={onAddStaff} />
          </div>
        ) : (
          <div className="mc-table-wrap">
            <table className="mc-table">
              <thead>
                <tr>
                  <th>Measure</th>
                  {roleGroups.map((group) => (
                    <th key={group.role} className="is-num">{group.role} ({group.members.length})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLE_METRICS.map((metric) => (
                  <tr key={metric.key}>
                    <td className="is-main">{metric.label}</td>
                    {roleGroups.map((group) => (
                      <td key={group.role} className="is-num">{percent(averageOf(group.members, metric.key))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mc-panel-note">A comparison with last week will appear here once weekly history is being stored.</p>
      </Panel>

      <Panel
        title="Revenue estimate"
        description="What a lift in upselling could be worth each week. This is a formula, not sales data from your till."
        flush
      >
        <div className="mc-panel-body" style={{ paddingTop: 20 }}>
          <label className="mc-field" htmlFor="mc-transaction-value">
            <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
              Average spend per transaction
              <span className="mc-figure">${transactionValue}</span>
            </span>
            <input
              id="mc-transaction-value"
              type="range"
              className="mc-range"
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              step={5}
              value={transactionValue}
              onChange={(event) => handleSlider(Number(event.target.value))}
            />
          </label>
          <div className="mc-range-ends" aria-hidden="true"><span>${SLIDER_MIN}</span><span>${SLIDER_MAX}</span></div>
        </div>
        <div className="mc-table-wrap">
          <table className="mc-table">
            <thead>
              <tr>
                <th>If upselling improves by</th>
                <th className="is-num">Extra revenue per week</th>
              </tr>
            </thead>
            <tbody>
              {[5, 10, 15, 20].map((improvement) => (
                <tr key={improvement}>
                  <td>{improvement}%</td>
                  <td className="is-num is-main">
                    ${Math.round(weeklyTransactions * transactionValue * (improvement / 100)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mc-panel-note">
          Worked out as {staffForEstimate} staff × {TRANSACTIONS_PER_SHIFT} transactions a shift × {SHIFTS_PER_WEEK} shifts a week × ${transactionValue} × the improvement.
          {venueStaff.length < MIN_STAFF_FOR_ESTIMATE ? ` A minimum of ${MIN_STAFF_FOR_ESTIMATE} staff is assumed.` : ""}
        </p>
      </Panel>
    </div>
  );
}
