"use client";

import type { ManagerSection } from "@/lib/management/types";

// Figma "Venue Manager Dashboard" KPI strip — 4 cards: Shift Readiness, Legal
// RSA/FSS status, Confidence Mismatch, Average Mastery. Every value here is
// computed by OverviewPanel from the same real venueStaff/metrics data the
// rest of the console already uses — no mock numbers.

export interface OverviewKpi {
  label: string;
  abbr: string;
  abbrColor: string;
  abbrBg: string;
  value?: string;
  valueColor?: string;
  pills?: { label: string; color: string; bg: string }[];
  sub: string;
  section: ManagerSection;
}

export function OverviewKpiStrip({ items, onNav }: { items: OverviewKpi[]; onNav: (section: ManagerSection) => void }) {
  return (
    <div className="mc-kpi-strip">
      {items.map((item) => (
        <button key={item.label} type="button" className="mc-kpi-card" onClick={() => onNav(item.section)}>
          <div className="mc-kpi-card-head">
            <span className="mc-kpi-label">{item.label}</span>
            <span className="mc-kpi-abbr" style={{ background: item.abbrBg, color: item.abbrColor }}>{item.abbr}</span>
          </div>

          <div style={{ marginTop: "auto" }}>
            {item.value && (
              <div className="mc-kpi-value-row">
                <span className="mc-kpi-value" style={{ color: item.valueColor ?? "var(--mc-text)" }}>{item.value}</span>
              </div>
            )}
            {item.pills && (
              <div className="mc-kpi-pills">
                {item.pills.map((p) => (
                  <span key={p.label} className="mc-kpi-pill" style={{ background: p.bg, color: p.color }}>{p.label}</span>
                ))}
              </div>
            )}
            <div className="mc-kpi-sub">{item.sub}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
