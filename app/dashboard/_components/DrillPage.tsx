"use client";

import { useCallback } from "react";
import MixedDrill from "@/components/quiz/MixedDrill";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Desktop host for the mixed drill (Rich update, Phase 10). The drill itself
// is components/quiz/MixedDrill.tsx, shared with mobile. It replaced Rapid
// Fire's module picker.
export default function DrillPage({ onOpenModule, onBrowseModules }: { onOpenModule: (moduleId: number) => void; onBrowseModules: () => void }) {
  const getToken = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Session expired. Please sign in again.");
    return session.access_token;
  }, []);

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2 style={{ marginBottom: 8 }}>Mixed Drill</h2>
        <p className="stage-subtitle">
          A quick round across the modules you&apos;ve started. Mixing topics is how what you learn sticks for the shift.
        </p>
      </div>
      <MixedDrill theme="light" getToken={getToken} onOpenModule={(moduleId) => onOpenModule(moduleId)} onBrowseModules={onBrowseModules} />
    </div>
  );
}
