"use client";

import { Smartphone } from "lucide-react";
import { Row, RowList } from "./ui/parts";
import { useInstall } from "../_lib/use-install";

// "Add to Home Screen" in Settings, always there until the app is on the
// Home Screen (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 4.3). Hidden on a
// computer and in the installed app.
export default function InstallRow() {
  const { platform, installed } = useInstall();
  if (!platform || installed || platform === "desktop") return null;
  return (
    <div style={{ padding: "0 20px 20px" }}>
      <RowList>
        <Row href="/mobile/install?from=settings" icon={Smartphone} label="Add to Home Screen" sub="Open SBE in one tap, and get shift reminders" />
      </RowList>
    </div>
  );
}
