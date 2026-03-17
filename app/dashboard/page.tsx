import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DashboardShell from "@/components/DashboardShell";

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
    .select("display_name, plan, avatar, management_unlocked, notif_reminders, notif_weekly_digest, notif_achievement_alerts, is_founders_user")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "there";
  const plan = profile?.plan ?? "free";

  return (
    <DashboardShell
      displayName={displayName}
      plan={plan}
      userEmail={user.email ?? ""}
      savedAvatar={profile?.avatar ?? ""}
      managementUnlockedInitial={profile?.management_unlocked ?? false}
      notifReminders={profile?.notif_reminders ?? true}
      notifWeeklyDigest={profile?.notif_weekly_digest ?? true}
      notifAchievementAlerts={profile?.notif_achievement_alerts ?? true}
      isFounderInitial={profile?.is_founders_user ?? false}
    />
  );
}