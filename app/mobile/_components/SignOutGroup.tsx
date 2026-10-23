"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Group } from "./ui/parts";
import { signOutEverywhere } from "@/lib/sign-out";

// Sign out, as its own red row, as at the foot of iPhone Settings. At the
// bottom of Me, where people look for it, and of Settings. No email line
// under it: phones turned it into a mail link (2026-10-22). Settings shows
// the email in its own row. Same sign-out as components/ui/SignOutButton.tsx.
export default function SignOutGroup() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await signOutEverywhere();
    router.push("/login");
    router.refresh();
  }

  return (
    <Group>
      <button type="button" className="sm-row sm-set-row sm-set-signout" onClick={() => void signOut()} disabled={signingOut}>
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </Group>
  );
}
