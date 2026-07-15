import { useEffect, useRef, useState } from "react";

interface AuthGuardState {
  isReady: boolean;
  hasError: boolean;
  errorMessage: string;
}

export function useAuthSessionGuard(_showError: (msg: string) => void): AuthGuardState {
  const [state, setState] = useState<AuthGuardState>({
    isReady: false,
    hasError: false,
    errorMessage: "",
  });

  const sessionCheckRef = useRef(false);

  useEffect(() => {
    if (sessionCheckRef.current) return;
    sessionCheckRef.current = true;

    let isComponentMounted = true;

    async function validateAuthSession() {
      try {
        // Ping an existing authenticated API route using browser cookies.
        // The browser Supabase client cannot read HttpOnly cookies set by the server,
        // so client-side getSession()/getUser() always returns null in this SSR setup,
        // causing a redirect loop. A server-side fetch uses the HttpOnly cookies directly.
        const resp = await fetch("/api/training/progress", { credentials: "include" });

        if (!isComponentMounted) return;

        if (resp.status === 401) {
          // Truly unauthenticated — server confirmed no valid session
          window.location.href = "/login";
          return;
        }

        // Any other response (200, 4xx, 5xx) means the server accepted the auth cookies
        setState({ isReady: true, hasError: false, errorMessage: "" });
      } catch {
        // Network error — assume auth is fine (middleware already gated the page)
        if (isComponentMounted) {
          setState({ isReady: true, hasError: false, errorMessage: "" });
        }
      }
    }

    void validateAuthSession();

    return () => {
      isComponentMounted = false;
    };
  }, []);

  return state;
}