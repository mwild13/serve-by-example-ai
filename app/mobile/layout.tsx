import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { resolveTierAccess } from "@/lib/session";
import { MobileSessionProvider } from "./_lib/mobile-session-context";

// Phase C file 01 — auth + tier gate for the whole /mobile route tree,
// mirroring app/dashboard/page.tsx via the shared resolveTierAccess() helper
// (lib/session.ts) so the two entry points can't drift. No Stripe
// checkout-success handling here: that redirect always lands on /dashboard,
// never /mobile, and Next.js layouts don't receive searchParams anyway.
// One-device session displacement is enforced in middleware.ts (not here) —
// see the /mobile addition to that gate.
export const dynamic = "force-dynamic";

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, tier, org_id, subscription_status, onboarding_completed, profile_photo_url")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const admin = createSupabaseAdminClient();
  const { plan, allowedModules, hasVenueMembership, venueMembershipPaused } =
    await resolveTierAccess(admin, user.email ?? undefined, {
      tier: profile?.tier ?? null,
      org_id: profile?.org_id ?? null,
      subscription_status: profile?.subscription_status ?? null,
    });

  const displayName =
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <MobileSessionProvider
      value={{
        token: session?.access_token ?? "",
        userEmail: user.email ?? "",
        displayName,
        tier: plan,
        allowedModules,
        hasVenueMembership,
        venueMembershipPaused,
        profilePhotoUrl: profile?.profile_photo_url ?? null,
      }}
    >
      {children}
    </MobileSessionProvider>
  );
}
