"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SignOutButton({
  redirectTo = "/login",
  className = "sign-out-btn",
}: {
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button className={className} onClick={handleSignOut}>
      Sign out
    </button>
  );
}
