import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { checkLocalStorageAuthKeys, forceAuthRecovery } from "@/lib/auth-guard";

interface AuthGuardState {
  isReady: boolean;
  hasError: boolean;
  errorMessage: string;
}

export function useAuthSessionGuard(showError: (msg: string) => void): AuthGuardState {
  const [state, setState] = useState<AuthGuardState>({
    isReady: false,
    hasError: false,
    errorMessage: "",
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef(false);

  useEffect(() => {
    if (sessionCheckRef.current) return;
    sessionCheckRef.current = true;

    let isComponentMounted = true;

    async function validateAuthSession() {
      try {
        // Check 1: Verify localStorage has Supabase auth keys
        const hasAuthKeys = checkLocalStorageAuthKeys();
        if (!hasAuthKeys) {
          if (isComponentMounted) {
            const msg = "Auth session out of sync. Logging you out to recover...";
            setState({ isReady: true, hasError: true, errorMessage: msg });
            showError(msg);
          }
          const supabase = createSupabaseBrowserClient();
          await forceAuthRecovery(supabase);
          return;
        }

        // Check 2: Call getSession with timeout protection (2 second window)
        const supabase = createSupabaseBrowserClient();

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Session fetch timeout")), 2000)
        );

        const result = await Promise.race<Awaited<ReturnType<typeof supabase.auth.getSession>> | never>([
          supabase.auth.getSession(),
          timeoutPromise,
        ]);

        const { data: { session } } = result;

        if (!session?.user?.id) {
          if (isComponentMounted) {
            const msg = "Session expired. Redirecting to login...";
            setState({ isReady: true, hasError: true, errorMessage: msg });
            showError(msg);
          }
          window.location.href = "/login?error=session_expired";
          return;
        }

        // Session is valid
        if (isComponentMounted) {
          setState({ isReady: true, hasError: false, errorMessage: "" });
        }
      } catch (error) {
        if (isComponentMounted) {
          const msg = error instanceof Error ? error.message : "Auth initialization failed";
          setState({ isReady: true, hasError: true, errorMessage: msg });
          showError(msg);
          // Force logout and redirect after 2 seconds
          timeoutRef.current = setTimeout(() => {
            const supabase = createSupabaseBrowserClient();
            void forceAuthRecovery(supabase);
          }, 2000);
        }
      }
    }

    // 5-second overall timeout for the entire auth check
    timeoutRef.current = setTimeout(() => {
      if (isComponentMounted && !sessionCheckRef.current) {
        const msg = "Dashboard initialization timeout. Redirecting to login...";
        setState({ isReady: true, hasError: true, errorMessage: msg });
        showError(msg);
        const supabase = createSupabaseBrowserClient();
        void forceAuthRecovery(supabase);
      }
    }, 5000);

    void validateAuthSession();

    return () => {
      isComponentMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showError]);

  return state;
}
