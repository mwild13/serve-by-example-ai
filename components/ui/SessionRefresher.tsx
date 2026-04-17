'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

/**
 * SessionRefresher
 * 
 * Initializes and refreshes the user session on mount.
 * This prevents "Invalid Refresh Token" errors by ensuring:
 * 1. The session is valid before interacting with Supabase
 * 2. Stale tokens are refreshed automatically
 * 3. Expired sessions are cleared cleanly
 * 
 * Place this component high in the component tree (e.g., in a protected layout).
 */
export default function SessionRefresher() {
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        
        // This will attempt to refresh the session if it's expired
        // and clear the tokens if refresh fails
        const { error } = await supabase.auth.refreshSession();
        
        if (error && error.message.includes('refresh_token_rotation_code')) {
          // User needs to re-authenticate
          // Clear the session silently
          await supabase.auth.signOut();
        }
      } catch {
        // Silently handle errors during session refresh
        // User will be redirected to login if needed
      }
    };

    refreshSession();
    
    // Optional: Refresh session every 5 minutes to prevent expiry mid-session
    const interval = setInterval(refreshSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null;
}
