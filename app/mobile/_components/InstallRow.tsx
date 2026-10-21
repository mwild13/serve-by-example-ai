"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useInstall } from "../_lib/use-install";

// "Add to Home Screen" in Settings > This phone, always there until the app
// is on the Home Screen (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 4.3).
// Hidden on a computer and in the installed app.
export default function InstallRow() {
  const { platform, installed } = useInstall();
  if (!platform || installed || platform === "desktop") return null;
  return (
    <Link href="/mobile/install?from=settings" className="sm-row sm-set-row">
      <span className="sm-row-text">
        <span className="sm-set-label">Add to Home Screen</span>
        <span className="sm-row-sub">Open SBE in one tap, and get shift reminders</span>
      </span>
      <ChevronRight className="sm-chevron" size={20} strokeWidth={2.6} aria-hidden="true" />
    </Link>
  );
}
