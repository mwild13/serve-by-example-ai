"use client";

import { useCallback } from "react";
import LiveGuest from "@/components/live-guest/LiveGuest";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Desktop host for Live Guest (Rich update, Phase 6). The conversation itself
// is components/live-guest/LiveGuest.tsx, shared with mobile.
export default function LiveGuestPage() {
  const getToken = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Session expired. Please sign in again.");
    return session.access_token;
  }, []);

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2 style={{ marginBottom: 8 }}>Live Guest</h2>
        <p className="stage-subtitle">
          Talk to a guest who talks back, over three to six replies. Reply the way you would on shift, then see what they were
          thinking at each turn.
        </p>
      </div>
      <LiveGuest getToken={getToken} theme="light" intro={false} />
    </div>
  );
}
