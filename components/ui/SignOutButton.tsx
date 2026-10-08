"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SignOutButton({
  redirectTo = "/login",
  className = "sign-out-btn",
  title,
  children,
}: {
  redirectTo?: string;
  className?: string;
  title?: string;
  /** Replaces the default "Sign out" label, e.g. to add an icon. */
  children?: ReactNode;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button type="button" className={className} title={title} onClick={handleSignOut}>
      {children ?? "Sign out"}
    </button>
  );
}
