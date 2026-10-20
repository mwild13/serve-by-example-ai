"use client";

import LiveGuest from "@/components/live-guest/LiveGuest";

// Desktop host for Live Guest (Rich update, Phase 6), on the staff desktop's
// green room (docs/STAFF_DESKTOP_REDESIGN_PLAN.md, 7.4). The conversation
// itself is components/live-guest/LiveGuest.tsx, shared with mobile.
export default function LiveGuestPage({ getToken }: { getToken: () => Promise<string> }) {
  return (
    <div className="sd-page">
      <header className="sd-head">
        <p className="sd-kicker">Practise</p>
        <h1 className="sd-title">Live Guest</h1>
        <p className="sd-lede">
          A guest who talks back, over three or four replies. Read them the way you would on shift, then see what they were
          thinking at each turn.
        </p>
      </header>
      <LiveGuest getToken={getToken} theme="light" intro={false} layout="room" />
    </div>
  );
}
