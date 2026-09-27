"use client";

import { openCookieSettings } from "@/lib/consent";

// Footer is a server component; this tiny client button reopens the banner.
export default function CookieSettingsLink() {
  return (
    <button type="button" className="footer-legal-btn" onClick={openCookieSettings}>
      Cookie settings
    </button>
  );
}
