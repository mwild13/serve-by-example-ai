"use client";

import { useCallback } from "react";
import SaturdayRush from "@/components/rush/SaturdayRush";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Desktop host for Saturday Rush (Rich update, Phase 15). The game itself is
// components/rush/SaturdayRush.tsx, shared with mobile.
export default function RushPage() {
  const getToken = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Session expired. Please sign in again.");
    return session.access_token;
  }, []);

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2 style={{ marginBottom: 8 }}>Saturday Rush</h2>
        <p className="stage-subtitle">
          A Saturday night shift against the clock. Every call moves the guests, the speed, the money and the safety. Keys 1 to
          4 choose, B calls the bar-back.
        </p>
      </div>
      <SaturdayRush theme="light" getToken={getToken} />
    </div>
  );
}
