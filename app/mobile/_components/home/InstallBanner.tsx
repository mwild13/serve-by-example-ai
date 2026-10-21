"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, X } from "lucide-react";
import { trackInstall, useInstall } from "../../_lib/use-install";
import { installBannerDue, parseBannerState, type InstallBannerState } from "@/lib/install-platform";

// The top of mobile Home: "Add SBE to your Home Screen" (docs/
// STAFF_MOBILE_REDESIGN_PLAN.md section 4.3). From the second visit; closed,
// it comes back once after 14 days, then never (installBannerDue()). Kept on
// this phone only. Never in the installed app or on a computer.

const KEY = "sbe-install-banner";
/** Set for the rest of this visit, so a visit counts once however often Home opens. */
const COUNTED_KEY = "sbe-install-banner-counted";

function save(state: InstallBannerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // No storage: the banner just follows this visit.
  }
}

export default function InstallBanner() {
  const { platform, installed } = useInstall();
  // Read on arrival; the banner shows while `due`.
  const [banner, setBanner] = useState<{ state: InstallBannerState; due: boolean } | null>(null);

  useEffect(() => {
    if (!platform || installed || platform === "desktop") return;
    let next: InstallBannerState;
    try {
      next = parseBannerState(localStorage.getItem(KEY));
      if (!sessionStorage.getItem(COUNTED_KEY)) {
        sessionStorage.setItem(COUNTED_KEY, "1");
        next = { ...next, visits: next.visits + 1 };
        save(next);
      }
    } catch {
      return;
    }
    const due = installBannerDue(next, Date.now());
    if (due) trackInstall("shown", "home-banner", platform);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBanner({ state: next, due });
  }, [platform, installed]);

  if (!platform || !banner?.due) return null;

  function hide() {
    if (!banner || !platform) return;
    const next = { ...banner.state, dismissals: banner.state.dismissals + 1, dismissedAt: Date.now() };
    save(next);
    setBanner({ state: next, due: false });
    trackInstall("dismiss", "home-banner", platform);
  }

  return (
    <div className="sm-banner" role="region" aria-label="Add to Home Screen">
      <Smartphone size={20} strokeWidth={2.2} aria-hidden="true" />
      <span className="sm-banner-text">
        <span className="sm-banner-title">Add to Home Screen</span>
        <span className="sm-banner-sub">Opens in one tap</span>
      </span>
      <Link
        href="/mobile/install?from=home"
        className="sm-btn sm-btn--small"
        onClick={() => trackInstall("tap", "home-banner", platform)}
      >
        Show me
      </Link>
      <button type="button" className="sm-icon-btn" aria-label="Hide for now" onClick={hide}>
        <X size={18} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </div>
  );
}
