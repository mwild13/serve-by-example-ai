"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 720;
const RESIZE_DEBOUNCE_MS = 150;

export function useDemoViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // One-time client read of window size, deliberately deferred to an effect
    // (not a lazy initializer) so SSR/hydration always starts from `false`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}
