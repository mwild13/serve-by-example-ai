"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * "Try again" for a route error boundary. reset() on its own only re-renders
 * on the client, so an error thrown while the server fetched the page (a
 * database blip, say) comes straight back. Refreshing first re-runs the
 * server components, then reset() clears the boundary.
 */
export function useErrorRetry(reset: () => void): { retry: () => void; retrying: boolean } {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  function retry() {
    setRetrying(true);
    startTransition(() => {
      router.refresh();
      reset();
      setRetrying(false);
    });
  }
  return { retry, retrying };
}
