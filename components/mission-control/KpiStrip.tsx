'use client';

// KPI strip — Hero Component #1 from the UX overhaul spec.
// Extracts MgrKpiCard/MgrSparkline out of ManagerControlCenter.tsx with:
//   - responsive value sizing via clamp() instead of a fixed rem size
//   - a gradient-filled sparkline (was flat 12%-opacity fill)
//   - an optional trend delta chip, reusing the same up/down convention
//     already used elsewhere in the app ("This week vs last week")
//
// Pure presentational — accepts already-computed values, no data fetching.

import { useId } from "react";

export type KpiTrend = { dir: "up" | "down" | "steady"; delta: number; suffix?: string };

export type KpiItem = {
  label: string;
  value: string;
  sub: string;
  data: number[];
  accent: string;
  trend?: KpiTrend;
};

function KpiTrendChip({ trend }: { trend: KpiTrend }) {
  const suffix = trend.suffix ?? "%";
  if (trend.dir === "steady" || trend.delta === 0) {
    return <span className="mcc-kpi-trend mcc-kpi-trend-steady">~ steady</span>;
  }
  if (trend.dir === "up") {
    return <span className="mcc-kpi-trend mcc-kpi-trend-up">↑ {trend.delta}{suffix} this week</span>;
  }
  return <span className="mcc-kpi-trend mcc-kpi-trend-down">↓ {Math.abs(trend.delta)}{suffix} this week</span>;
}

function GradientSparkline({ data, w = 96, h = 30, color, gradientId }: {
  data: number[]; w?: number; h?: number; color: string; gradientId: string;
}) {
  if (!data.length || data.every((v) => v === 0)) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 4) - 2] as [number, number]);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.75" fill={color} />
    </svg>
  );
}

function KpiCard({ item }: { item: KpiItem }) {
  const gradientId = useId();
  return (
    <div className="mcc-kpi-card">
      <div className="mcc-kpi-label">{item.label}</div>
      <div className="mcc-kpi-value-row">
        <div className="mcc-kpi-value">{item.value}</div>
        <GradientSparkline data={item.data} color={item.accent} gradientId={`kpi-spark-${gradientId}`} />
      </div>
      <div className="mcc-kpi-meta">
        <span className="mcc-kpi-sub">{item.sub}</span>
        {item.trend && <KpiTrendChip trend={item.trend} />}
      </div>
    </div>
  );
}

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <section className="mcc-kpi-strip">
      {items.map((item) => (
        <KpiCard key={item.label} item={item} />
      ))}
    </section>
  );
}
