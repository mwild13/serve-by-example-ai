import { redirect } from "next/navigation";

// The old "Session active on another device" page, with its Resume button.
// Since 2026-10-22 the newest sign-in simply wins: middleware.ts signs an
// older device out and sends it to /login with a line saying why. This
// address only forwards there, for old links and bookmarks.
export default function SessionConflictPage() {
  redirect("/login?signedout=elsewhere");
}
