import { redirect } from "next/navigation";

// Retired in the Rich update, Phase 8: Scenario Practice became Live
// Guest. Kept as a redirect so old links and bookmarks still land somewhere
// useful.
export default function MobileScenarioPracticeRedirectPage() {
  redirect("/mobile/live-guest");
}
