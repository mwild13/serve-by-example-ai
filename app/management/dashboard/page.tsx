import { redirect } from "next/navigation";
import { Suspense } from "react";
import ManagerControlCenter from "@/components/mission-control/ManagerControlCenter";
import { getManagementSnapshot } from "@/lib/management/service";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Prevent static generation – this page requires auth at runtime
export const dynamic = "force-dynamic";

const FALLBACK_ADMIN_EMAILS = [
  "wild07man@gmail.com",
  "mitchellwildman1@gmail.com",
  "mitchellwildman1994@gmail.com",
  "campbell.wildman@gmail.com",
  "grahamwi@bigpond.com",
  "wildmanemmet@gmail.com",
  "hjallanson@gmail.com",
  "hello@studio-ell.com.au",
  "littlepub@hcs.on.net",
];
const envAdminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const ADMIN_EMAILS = envAdminEmails.length > 0 ? envAdminEmails : FALLBACK_ADMIN_EMAILS;

export default async function ManagementDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/management/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan, tier, platform_role")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "Manager";
  const plan = profile?.plan ?? "free";
  const tier = profile?.tier ?? "free";
  const platformRole = profile?.platform_role ?? "staff";

  const B2B_TIERS = ["boutique", "commercial", "enterprise", "venue_single", "venue_multi", "single-venue", "multi-venue"];

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");
  const hasVenuePlan = B2B_TIERS.includes(plan);
  const hasVenueTier = B2B_TIERS.includes(tier);
  const hasManagerRole = platformRole === "venue_manager" || platformRole === "multi_venue_manager" || platformRole === "admin";

  if (!isAdmin && !hasVenuePlan && !hasVenueTier && !hasManagerRole) {
    redirect("/pricing");
  }
  const snapshot = await getManagementSnapshot(supabase, user.id);

  return (
    <div className="management-app-root">
      <Suspense fallback={null}>
        <ManagerControlCenter initialSnapshot={snapshot} plan={plan} displayName={displayName} />
      </Suspense>
    </div>
  );
}