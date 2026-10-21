"use client";

import SaturdayRush from "@/components/rush/SaturdayRush";

// Desktop host for Saturday Rush (Rich update, Phase 15), on the staff
// desktop's green room (docs/STAFF_DESKTOP_REDESIGN_PLAN.md, 7.5). The game
// itself is components/rush/SaturdayRush.tsx, shared with mobile.
export default function RushPage({ getToken }: { getToken: () => Promise<string> }) {
  return (
    <div className="sd-page sd-rush">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">Saturday Rush</h1>
          <p className="sd-subtitle">A Saturday night shift against the clock. Every call moves the guests, the speed, the money and the safety. Keys 1 to 4 choose, B calls the bar-back.</p>
        </div>
      </header>
      <SaturdayRush theme="room" getToken={getToken} />
    </div>
  );
}
