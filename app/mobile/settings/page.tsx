import SettingsScreen from "../_components/SettingsScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Serve By Example",
  description: "Manage your profile, security, and venue settings.",
  robots: { index: false, follow: false },
};

// Mobile bug-fix plan, Phase 3a — new route for the Me page's previously
// dead settings icon.
export default function MobileSettingsPage() {
  return <SettingsScreen />;
}
