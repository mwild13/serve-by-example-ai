import { redirect } from "next/navigation";

// 3-tab consolidation (2026-08-21): "Scenarios" was removed as a bottom-nav
// tab and its content (Scenario Training, Descriptor Practice, AI Arena)
// folded into /mobile/learn's "Practice & Scenarios" section. This route
// stays as a redirect so old links/bookmarks to /mobile/scenarios don't
// break — redirect() here (Server Component, not a Server Action) issues a
// 307 Temporary Redirect by default, matching app/dashboard/badges/page.tsx's
// existing redirect-stub precedent. Since the Rich update, Phase 8, it goes
// to Live Guest, which replaced the scenario screens.
export default function MobileScenariosRedirectPage() {
  redirect("/mobile/live-guest");
}
