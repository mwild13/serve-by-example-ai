"use client";

import { useCallback } from "react";
import TabBar from "./ui/TabBar";
import MobileScreenShell from "./MobileScreenShell";
import { useMobileSession } from "../_lib/mobile-session-context";
import SaturdayRush from "@/components/rush/SaturdayRush";

// Mobile host for Saturday Rush (Rich update, Phase 15), from the Learn hub.
// The game itself is components/rush/SaturdayRush.tsx, shared with desktop.
export default function RushScreen() {
  const { token } = useMobileSession();
  const getToken = useCallback(async () => token, [token]);

  return (
    <MobileScreenShell style={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "20px 20px 12px" }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Saturday Rush</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>A Saturday night shift against the clock</p>
        </div>
        <SaturdayRush theme="dark" getToken={getToken} />
      </div>
      <TabBar active="practise" />
    </MobileScreenShell>
  );
}
