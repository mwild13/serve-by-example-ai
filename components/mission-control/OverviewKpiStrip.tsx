"use client";

import { ChevronRight } from "lucide-react";
import type { ManagerSection } from "@/lib/management/types";

// The four figures at the top of the Overview tab, set as one ruled strip
// rather than four cards. Each column is a button that opens the tab behind
// the figure. Every value is computed by OverviewPanel from the same
// venueStaff/metrics data the rest of the console uses.
//
// `alert` is the only colour here: it turns the figure red, and is reserved
// for a count that is a legal problem (expired certificates).

export interface OverviewKpi {
  label: string;
  value: string;
  sub: string;
  section: ManagerSection;
  alert?: boolean;
}

export function OverviewKpiStrip({ items, onNav }: { items: OverviewKpi[]; onNav: (section: ManagerSection) => void }) {
  return (
    <div className="mc-kpi-strip">
      {items.map((item) => (
        <button key={item.label} type="button" className="mc-kpi-card" onClick={() => onNav(item.section)}>
          <span className="mc-kpi-card-head">
            <span className="mc-kpi-label">{item.label}</span>
            <ChevronRight size={16} strokeWidth={1.75} className="mc-kpi-chevron" aria-hidden="true" />
          </span>
          <span className={`mc-kpi-value${item.alert ? " is-alert" : ""}`}>{item.value}</span>
          <span className="mc-kpi-sub">{item.sub}</span>
        </button>
      ))}
    </div>
  );
}
