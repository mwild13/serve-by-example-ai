"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/consent";

/*
 * Click tracking for every /advisory CTA. One delegated listener instead of
 * a handler per link, so server-rendered CTAs (hero, CTABand) and the sticky
 * bar are covered without becoming client components. The package slug comes
 * from the link's own ?package= param. trackEvent is consent-gated.
 */
export default function AdvisoryCtaTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href*="source=advisory"]');
      if (!link) return;
      const params = new URL(link.href, window.location.origin).searchParams;
      trackEvent("advisory_cta_click", {
        package: params.get("package") ?? "general",
        link_text: (link.textContent ?? "").trim().slice(0, 60),
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
