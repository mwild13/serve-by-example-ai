import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { forceAuthRecovery } from "@/lib/auth-guard";

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
  const overallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef(false);

  useEffect(() => {
    if (sessionCheckRef.current) return;
    sessionCheckRef.current = true;

    let isComponentMounted = true;
    let isValidationFinished = false;

    async function validateAuthSession() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Use getUser() (server-side cookie validation) not getSession() (localStorage only).
        // getSession() returns null when tokens are in HttpOnly cookies but not in memory,
        // which causes a false "session expired" redirect loop for users with valid server sessions.
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Session fetch timeout")), 5000)
        );

        const result = await Promise.race<Awaited<ReturnType<typeof supabase.auth.getUser>> | never>([
          supabase.auth.getUser(),
          timeoutPromise,
        ]);

        const { data: { user } } = result;

        if (!user?.id) {
          isValidationFinished = true;
          if (isComponentMounted) {
            const msg = "Session expired. Redirecting to login...";
            setState({ isReady: true, hasError: true, errorMessage: msg });
            showError(msg);
          }
          window.location.href = "/login?error=session_expired";
          return;
        }

        // Session is valid
        isValidationFinished = true;
        if (isComponentMounted) {
          setState({ isReady: true, hasError: false, errorMessage: "" });
        }
      } catch (error) {
        isValidationFinished = true;
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
    overallTimeoutRef.current = setTimeout(() => {
      if (isComponentMounted && !isValidationFinished) {
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
      if (overallTimeoutRef.current) clearTimeout(overallTimeoutRef.current);
    };
  }, [showError]);

  return state;
}