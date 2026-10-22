"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Group } from "./ui/parts";
import { useMobileSession } from "../_lib/mobile-session-context";
import { signOutEverywhere } from "@/lib/sign-out";

// Sign out, as its own red row with the account under it, as at the foot of
// iPhone Settings. At the bottom of Me, where people look for it, and of
// Settings. Same sign-out as components/ui/SignOutButton.tsx.
export default function SignOutGroup() {
  const session = useMobileSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await signOutEverywhere();
    router.push("/login");
    router.refresh();
  }

  return (
    <Group foot={session.userEmail ? `Signed in as ${session.userEmail}` : undefined}>
      <button type="button" className="sm-row sm-set-row sm-set-signout" onClick={() => void signOut()} disabled={signingOut}>
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </Group>
  );
}
