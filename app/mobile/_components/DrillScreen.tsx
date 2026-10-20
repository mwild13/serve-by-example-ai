"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "./BottomNav";
import MobileScreenShell from "./MobileScreenShell";
import { useMobileSession } from "../_lib/mobile-session-context";
import MixedDrill from "@/components/quiz/MixedDrill";

// Mobile host for the mixed drill (Rich update, Phase 10) and, with
// ?mode=preshift, the pre-shift drill from Home (Phase 12). The drill itself
// is components/quiz/MixedDrill.tsx, shared with desktop.
export default function DrillScreen() {
  const router = useRouter();
  const preshift = useSearchParams().get("mode") === "preshift";
  const { token } = useMobileSession();
  const getToken = useCallback(async () => token, [token]);

  return (
    <MobileScreenShell style={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "20px 20px 12px" }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>{preshift ? "Ready for your shift" : "Mixed Drill"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
            {preshift ? "Three minutes before you start" : "Every module you've started, mixed"}
          </p>
        </div>
        <MixedDrill
          key={preshift ? "preshift" : "mixed"}
          mode={preshift ? "preshift" : "mixed"}
          onLiveGuest={() => router.push("/mobile/live-guest")}
          theme="dark"
          getToken={getToken}
          onOpenModule={(moduleId, title) => router.push(`/mobile/quiz?moduleId=${moduleId}&moduleTitle=${encodeURIComponent(title)}`)}
          onBrowseModules={() => router.push("/mobile/learn")}
        />
      </div>
      <BottomNav active={preshift ? "home" : "learn"} />
    </MobileScreenShell>
  );
}
