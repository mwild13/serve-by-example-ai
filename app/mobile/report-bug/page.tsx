import ReportBugScreen from "../_components/ReportBugScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report a Bug | Serve By Example",
  description: "Report a problem with the Serve By Example mobile app.",
  robots: { index: false, follow: false },
};

// Mobile notifications + bug-report pass (2026-08-25) — new Settings >
// Support entry, sits above "Help & FAQ".
export default function MobileReportBugPage() {
  return <ReportBugScreen />;
}
