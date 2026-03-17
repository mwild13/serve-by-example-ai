import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SignOutButton from "@/components/SignOutButton";
import ManagerControlCenter from "@/components/ManagerControlCenter";
import { getManagementSnapshot } from "@/lib/management/service";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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
    .select("display_name, plan")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "Manager";
  const plan = profile?.plan ?? "free";
  const snapshot = await getManagementSnapshot(supabase, user.id);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="manager-portal-topbar">
            <div>
              <div className="eyebrow">Management area</div>
              <h2>Welcome, {displayName}.</h2>
            </div>
            <SignOutButton redirectTo="/management/login" />
          </div>

          <div className="manager-access-code-banner">
            <div>
              <div className="manager-access-code-label">Staff Management Training Venue IDs</div>
              <div className="manager-access-code-list">
                {snapshot.venues.map((venue) => (
                  <div key={venue.id} className="manager-access-code-row">
                    <span>{venue.name}</span>
                    <span className="manager-access-code-value">
                      {typeof venue.venueCode === "number" ? venue.venueCode : "Not set"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p>
              Share your venue&rsquo;s numeric ID with staff so they can unlock the Management Training section in
              their dashboard.
            </p>
          </div>

          <ManagerControlCenter initialSnapshot={snapshot} plan={plan} />
        </div>
      </main>

      <Footer />
    </div>
  );
}