"use client";

import { useCallback } from "react";
import BottomNav from "./BottomNav";
import MobileScreenShell from "./MobileScreenShell";
import { useMobileSession } from "../_lib/mobile-session-context";
import LiveGuest from "@/components/live-guest/LiveGuest";

// Mobile host for Live Guest (Rich update, Phase 6). The conversation itself
// is components/live-guest/LiveGuest.tsx, shared with desktop.
export default function LiveGuestScreen() {
  const session = useMobileSession();
  const { token } = session;
  const getToken = useCallback(async () => token, [token]);

  return (
    <MobileScreenShell style={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "20px 20px 12px" }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Live Guest</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>A guest who talks back</p>
        </div>
        <LiveGuest getToken={getToken} theme="dark" />
      </div>
      <BottomNav active="learn" />
    </MobileScreenShell>
  );
}
