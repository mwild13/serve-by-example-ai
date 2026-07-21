'use client';

// Revenue / training progression area chart — Hero Component #2 from the
// UX overhaul spec. Extracts MgrRevenueChart out of ManagerControlCenter.tsx
// with a soft gradient fill beneath the line, milestone markers at the days
// a completion threshold was first crossed, and larger axis labels (9px
// axis labels were well under the project's 16px body floor even accounting
// for their secondary role — raised to 12px).
//
// Pure presentational — accepts the already-computed training value.

import { useId } from "react";

const MILESTONES = [50, 75];

export function RevenueAreaChart({ trainingValue }: { trainingValue: number }) {
  const gradientId = useId();
  const days = ["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F", "S", "S"];

  if (trainingValue === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-soft)", fontSize: 16 }}>
        Complete training sessions to populate chart data.
      </div>
    );
  }

  const trn = days.map((_, i) => {
    const prog = i / (days.length - 1);
    return Math.max(0, Math.min(95, Math.round(trainingValue * (0.3 + prog * 0.7))));
  });

  const w = 720, h = 220, pad = 36;
  const max = 100;
  const stepX = (w - pad * 2) / (days.length - 1);
  const yScale = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const points = trn.map((v, i) => [pad + i * stepX, yScale(v)] as [number, number]);
  const linePath = points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const lastPoint = points[points.length - 1];
  const areaPath = `${linePath} L${lastPoint[0]},${h - pad} L${points[0][0]},${h - pad} Z`;

  // Milestone markers: the first day each threshold in MILESTONES is crossed.
  const milestones = MILESTONES.map((threshold) => {
    const idx = trn.findIndex((v) => v >= threshold);
    return idx === -1 ? null : { idx, threshold, point: points[idx] };
  }).filter((m): m is { idx: number; threshold: number; point: [number, number] } => m !== null);

  return (
    <div style={{ padding: "16px 20px" }}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id={`revenue-area-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green-mid)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--green-mid)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
          <line key={idx} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke="var(--border-parchment)" strokeDasharray="2 4" />
        ))}
        {days.map((d, i) => (
          <text key={i} x={pad + i * stepX} y={h - 8} fontSize="12" fill="var(--text-muted)" textAnchor="middle">{d}</text>
        ))}

        <path d={areaPath} fill={`url(#revenue-area-${gradientId})`} />
        <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth="2.25" strokeLinecap="round" />
        {points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="var(--gold)" />)}

        {milestones.map((m) => (
          <g key={m.threshold}>
            <circle cx={m.point[0]} cy={m.point[1]} r="5.5" fill="var(--surface)" stroke="var(--gold-warm)" strokeWidth="2.5" />
            <text x={m.point[0]} y={m.point[1] - 12} fontSize="12" fontWeight="700" fill="var(--gold-warm)" textAnchor="middle">
              {m.threshold}% reached
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
