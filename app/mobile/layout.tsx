import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { resolveTierAccess } from "@/lib/session";
import { remainingGenerations } from "@/lib/profile-photo-cap";
import { MobileSessionProvider } from "./_lib/mobile-session-context";
import { TrainingProgressProvider } from "./_lib/training-progress-context";

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
    .select(
      "display_name, tier, org_id, subscription_status, onboarding_completed, profile_photo_url, profile_photo_generations_today, profile_photo_generations_reset_at",
    )
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
        profilePhotoGenerationsRemaining: remainingGenerations(
          profile?.profile_photo_generations_today ?? null,
          profile?.profile_photo_generations_reset_at ?? null,
        ),
      }}
    >
      {/* Perf fix (Phase 1a) — single shared fetch of /api/training/progress
          for the whole /mobile tree, instead of every screen independently
          re-fetching on its own mount. See training-progress-context.tsx. */}
      <TrainingProgressProvider token={session?.access_token ?? ""}>
        {children}
      </TrainingProgressProvider>
    </MobileSessionProvider>
  );
}
