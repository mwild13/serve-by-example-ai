"use client";

import { useEffect, useRef } from "react";

export function BadgeProgressRing({ earned, total }: { earned: number; total: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? earned / total : 0;
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.strokeDashoffset = String((1 - pct) * circ);
    }
  }, [pct, circ]);

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
      <circle
        cx="48" cy="48" r={r}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="8"
      />
      <circle
        ref={ref}
        cx="48" cy="48" r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dashoffset 800ms var(--ease-out) 200ms" }}
      />
      <text
        x="48" y="46"
        textAnchor="middle"
        fill="var(--gold-warm)"
        fontSize="16"
        fontWeight="700"
        fontFamily="var(--font-heading)"
      >
        {earned}/{total}
      </text>
      <text
        x="48" y="60"
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize="9"
        fontWeight="600"
        letterSpacing="0.08em"
      >
        EARNED
      </text>
    </svg>
  );
}
