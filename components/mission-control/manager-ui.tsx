// Shared UI primitives for the Manager Control Center.
// Extracted to keep ManagerControlCenter.tsx focused on logic and layout.

import type { StaffMember } from "@/lib/management/types";

export function EmptyState({ copy }: { copy: string }) {
  return <p className="ops-empty-state">{copy}</p>;
}

function TrendBadge({ dir, delta }: { dir: "up" | "down" | "steady"; delta: number }) {
  const fmt = parseFloat(delta.toFixed(2));
  if (dir === "steady" || delta === 0) return <span className="ops-trend-badge ops-trend-steady">~ steady</span>;
  if (dir === "up") return <span className="ops-trend-badge ops-trend-up">↑ {fmt}% this week</span>;
  return <span className="ops-trend-badge ops-trend-down">↓ {fmt}% this week</span>;
}

export function OpsKpiCard({
  label,
  value,
  note,
  trend,
}: {
  label: string;
  value: string;
  note?: string;
  trend?: { dir: "up" | "down" | "steady"; delta: number };
}) {
  return (
    <div className="ops-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend && trend.delta > 0 ? <TrendBadge dir={trend.dir} delta={trend.delta} /> : null}
      {note ? <small>{note}</small> : null}
    </div>
  );
}

export function formatPercent(value: number) {
  if (!value) return "No data yet";
  return `${Number(value).toFixed(1)}%`;
}

// ── Module metadata for pip tooltips ────────────────────────
// Matches supabase/migrations/20260421_1_create_modules.sql

const MODULE_META: Record<number, { title: string; category: "technical" | "service" | "compliance" }> = {
  1:  { title: "Pouring the Perfect Beer",        category: "technical"   },
  2:  { title: "Wine Knowledge & Service",         category: "technical"   },
  3:  { title: "Cocktail Fundamentals",            category: "technical"   },
  4:  { title: "Coffee / Barista Basics",          category: "technical"   },
  5:  { title: "Carrying Glassware & Trays",       category: "technical"   },
  6:  { title: "Cleaning & Sanitation",            category: "technical"   },
  7:  { title: "Bar Back Efficiency",              category: "technical"   },
  8:  { title: "The Art of the Greeting",          category: "service"     },
  9:  { title: "Managing Table Dynamics",          category: "service"     },
  10: { title: "Anticipatory Service",             category: "service"     },
  11: { title: "Handling Guest Complaints",        category: "service"     },
  12: { title: "Up-selling & Suggestive Sales",    category: "service"     },
  13: { title: "VIP / Table Management",           category: "service"     },
  14: { title: "Phone Etiquette & Reservations",   category: "service"     },
  15: { title: "RSA",                              category: "compliance"  },
  16: { title: "Food Safety & Hygiene",            category: "compliance"  },
  17: { title: "Conflict De-escalation",           category: "compliance"  },
  18: { title: "Emergency Evacuation Protocols",   category: "compliance"  },
  19: { title: "Opening & Closing Procedures",     category: "compliance"  },
  20: { title: "Inventory & Waste Control",        category: "compliance"  },
};

const CATEGORY_COLOR: Record<"technical" | "service" | "compliance", string> = {
  technical:  "#1E5A3C",
  service:    "#B98220",
  compliance: "#7A4F2C",
};

type PipState = "mastered" | "in-progress" | "locked";

function pipColor(state: PipState, category: "technical" | "service" | "compliance"): string {
  if (state === "mastered")     return CATEGORY_COLOR[category];
  if (state === "in-progress")  return "#E5D9C0";
  return "#F0F0EE";
}

// ── MasteryMicroGrid ─────────────────────────────────────────
// 4 rows × 5 columns = 20 pips, one per module.
// Pip state derived from scenariosMastered / scenariosAttempted.
// Hover tooltip shows module title + status.

export function MasteryMicroGrid({
  scenariosMastered = 0,
  scenariosAttempted = 0,
}: {
  scenariosMastered?: number;
  scenariosAttempted?: number;
}) {
  const mastered   = Math.max(0, Math.min(20, scenariosMastered));
  const inProgress = Math.max(0, Math.min(20 - mastered, scenariosAttempted - mastered));

  function pipState(moduleId: number): PipState {
    if (moduleId <= mastered)                             return "mastered";
    if (moduleId <= mastered + inProgress)                return "in-progress";
    return "locked";
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 10px)",
        gridTemplateRows: "repeat(4, 10px)",
        gap: "3px",
        lineHeight: 0,
      }}
    >
      {Array.from({ length: 20 }, (_, i) => {
        const id    = i + 1;
        const meta  = MODULE_META[id]!;
        const state = pipState(id);
        const label = `${meta.title} — ${state === "mastered" ? "Mastered" : state === "in-progress" ? "In Progress" : "Locked"}`;
        return (
          <div
            key={id}
            title={label}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: pipColor(state, meta.category),
              cursor: "default",
              transition: "transform 0.12s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          />
        );
      })}
    </div>
  );
}

// ── StaffBadges — V3 category-based mastery ──────────────────
// Three category badges (Technical / Service / Compliance) plus
// overall milestone badges. Category thresholds are module counts.

const TECHNICAL_MODULES  = 7;  // modules 1–7
const SERVICE_MODULES    = 7;  // modules 8–14
const COMPLIANCE_MODULES = 6;  // modules 15–20

function categoryMastered(
  scenariosMastered: number,
  category: "technical" | "service" | "compliance",
): number {
  // Mastery fills left-to-right by module ID: technical first, then service, then compliance.
  const technicalMastered  = Math.min(scenariosMastered, TECHNICAL_MODULES);
  const serviceMastered    = Math.max(0, Math.min(scenariosMastered - TECHNICAL_MODULES, SERVICE_MODULES));
  const complianceMastered = Math.max(0, Math.min(scenariosMastered - TECHNICAL_MODULES - SERVICE_MODULES, COMPLIANCE_MODULES));
  if (category === "technical")  return technicalMastered;
  if (category === "service")    return serviceMastered;
  return complianceMastered;
}

export function StaffBadges({ staff }: { staff: StaffMember }) {
  const mastered   = staff.scenariosMastered   ?? 0;
  const attempted  = staff.scenariosAttempted  ?? 0;
  const techCount  = categoryMastered(mastered, "technical");
  const svcCount   = categoryMastered(mastered, "service");
  const compCount  = categoryMastered(mastered, "compliance");
  const productScore = staff.productScore ?? 0;

  const badges: Array<{ label: string; sublabel: string; earned: boolean; accent: string }> = [
    {
      label:    "Training Started",
      sublabel: "First module attempted",
      earned:   attempted > 0,
      accent:   "#1E5A3C",
    },
    {
      label:    `Product Expert (${techCount}/${TECHNICAL_MODULES})`,
      sublabel: "Beer, Wine, Cocktails, Coffee, Operations",
      earned:   productScore > 90,
      accent:   CATEGORY_COLOR.technical,
    },
    {
      label:    `Service (${svcCount}/${SERVICE_MODULES})`,
      sublabel: "Greeting, Tables, Upselling, VIP & more",
      earned:   svcCount >= SERVICE_MODULES,
      accent:   CATEGORY_COLOR.service,
    },
    {
      label:    `Compliance Ready (${compCount}/${COMPLIANCE_MODULES})`,
      sublabel: "RSA, Food Safety, Conflict, Emergency",
      earned:   compCount >= COMPLIANCE_MODULES,
      accent:   CATEGORY_COLOR.compliance,
    },
    {
      label:    "Fully Mastered",
      sublabel: "All 20 modules complete",
      earned:   mastered >= 20,
      accent:   "#1E5A3C",
    },
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <strong className="ops-subhead">Mastery badges</strong>
      <div className="ops-badge-list">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className={`ops-badge${badge.earned ? " ops-badge-earned" : " ops-badge-locked"}`}
            title={badge.earned ? badge.label : `${badge.label} (not yet earned)`}
            style={badge.earned ? { borderColor: badge.accent } : undefined}
          >
            <span style={badge.earned ? { color: badge.accent } : undefined}>
              {badge.earned ? "◆" : "◇"}
            </span>
            <div>
              <div style={{ fontWeight: 700 }}>{badge.label}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--mcc-ink-500)", marginTop: 1 }}>
                {badge.sublabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
