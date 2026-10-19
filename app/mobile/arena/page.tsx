import { redirect } from "next/navigation";

// Retired in the Rich update, Phase 8: the Live Arena became Live
// Guest. Kept as a redirect so old links and bookmarks still land somewhere
// useful.
export default function MobileArenaRedirectPage() {
  redirect("/mobile/live-guest");
}
