// Tab icons in two states, as on iPhone: a 2px outline, and a solid shape
// for the tab you're on. Lucide's house, book-open, target and user
// (lucide-react has no filled set). Cut-outs in the solid shapes are drawn
// in the page colour, so they read in light and dark mode.

export type TabIconName = "home" | "learn" | "practise" | "me";

const CUT = "var(--sm-bg)";

export function TabIcon({ name, active }: { name: TabIconName; active: boolean }) {
  const common = {
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const fill = active ? "currentColor" : "none";

  switch (name) {
    case "home":
      return (
        <svg {...common} fill={fill}>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M15 21v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6" stroke={active ? CUT : "currentColor"} fill="none" />
        </svg>
      );
    case "learn":
      return (
        <svg {...common} fill={fill}>
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
          <path d="M12 7v14" stroke={active ? CUT : "currentColor"} />
        </svg>
      );
    case "practise":
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="10" fill={fill} />
          <circle cx="12" cy="12" r="6" stroke={active ? CUT : "currentColor"} />
          <circle cx="12" cy="12" r="2" fill={active ? CUT : "none"} stroke={active ? CUT : "currentColor"} />
        </svg>
      );
    case "me":
      return (
        <svg {...common} fill={fill}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
  }
}

export function FlameIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
