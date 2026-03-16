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
    .select("display_name, plan")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "there";
  const plan = profile?.plan ?? "free";

  return <DashboardShell displayName={displayName} plan={plan} />;
}