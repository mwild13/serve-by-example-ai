"use client";

import { useCallback } from "react";
import MixedDrill from "@/components/quiz/MixedDrill";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Desktop host for the mixed drill (Rich update, Phase 10) and the pre-shift
// drill Today opens (Phase 12). The drill itself is
// components/quiz/MixedDrill.tsx, shared with mobile. It replaced Rapid
// Fire's module picker.
export default function DrillPage({
  mode = "mixed",
  onOpenModule,
  onBrowseModules,
  onLiveGuest,
}: {
  mode?: "mixed" | "preshift";
  onOpenModule: (moduleId: number) => void;
  onBrowseModules: () => void;
  onLiveGuest: () => void;
}) {
  const getToken = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Session expired. Please sign in again.");
    return session.access_token;
  }, []);

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2 style={{ marginBottom: 8 }}>{mode === "preshift" ? "Ready for your shift" : "Mixed Drill"}</h2>
        <p className="stage-subtitle">
          {mode === "preshift"
            ? "Three minutes before you start: six questions from what you've learnt."
            : "A quick round across the modules you've started. Mixing topics is how what you learn sticks for the shift."}
        </p>
      </div>
      <MixedDrill
        theme="light"
        mode={mode}
        getToken={getToken}
        onOpenModule={(moduleId) => onOpenModule(moduleId)}
        onBrowseModules={onBrowseModules}
        onLiveGuest={onLiveGuest}
      />
    </div>
  );
}
