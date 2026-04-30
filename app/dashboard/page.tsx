import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import DashboardShell from "@/components/DashboardShell";

// Prevent static generation — this page requires auth at runtime
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan, management_unlocked, notif_reminders, notif_weekly_digest, notif_achievement_alerts")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "there";
  const plan = profile?.plan ?? "free";

  // Check if user has an active venue membership (invited by a manager).
  // These users get full training access even on the free plan tier.
  // Use admin client to bypass RLS — the filter is scoped to this user's email.
  let hasVenueMembership = false;
  if (plan === "free" && user.email) {
    const admin = createSupabaseAdminClient();
    const { data: membership } = await admin
      .from("venue_memberships")
      .select("id")
      .eq("staff_email", user.email.toLowerCase())
      .in("status", ["invited", "active"])
      .limit(1)
      .maybeSingle();
    hasVenueMembership = !!membership;
  }

  return (
    <DashboardShell
      displayName={displayName}
      plan={plan}
      userEmail={user.email ?? ""}
      managementUnlockedInitial={profile?.management_unlocked ?? false}
      notifReminders={profile?.notif_reminders ?? true}
      notifWeeklyDigest={profile?.notif_weekly_digest ?? true}
      notifAchievementAlerts={profile?.notif_achievement_alerts ?? true}
      hasVenueMembership={hasVenueMembership}
    />
  );
}