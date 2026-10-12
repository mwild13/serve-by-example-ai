"use client";

import { useEffect } from "react";

// Public site token from Cloudflare Web Analytics (it is printed in the page
// HTML of every site that uses the beacon, so it is not a secret). Unset means
// the beacon is off.
const BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN ?? "";
const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";
const PRODUCTION_HOSTS = ["servebyexample.co", "www.servebyexample.co"];

/**
 * Cloudflare Web Analytics: plain visit counts with no cookies and nothing
 * stored in the browser, so it does not wait for cookie consent the way
 * Google Analytics does (lib/consent.ts). Injected from the client bundle
 * (no inline script) so it works under the strict-dynamic CSP in
 * middleware.ts, which also lists the two Cloudflare hosts it needs.
 * Production only: previews and localhost would count as visits.
 */
export default function WebAnalytics() {
  useEffect(() => {
    if (!/^[a-f0-9]{32}$/.test(BEACON_TOKEN)) return;
    if (!PRODUCTION_HOSTS.includes(window.location.hostname)) return;
    if (document.querySelector(`script[src="${BEACON_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = BEACON_SRC;
    script.defer = true;
    script.setAttribute("data-cf-beacon", JSON.stringify({ token: BEACON_TOKEN }));
    document.head.appendChild(script);
  }, []);

  return null;
}
