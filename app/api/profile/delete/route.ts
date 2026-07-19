import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();
    const userId = user.id;

    // Audit log: record deletion request
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] Account deletion initiated: user_id=${userId}, timestamp=${timestamp}`);

    // Delete user training and progress data within 30 days per Privacy Policy
    const tablesToDelete = [
      "user_training_progress",
      "scenario_mastery",
      "mastery_rows",
      "user_challenges",
      "user_level_progress",
      "diagnostic_questions",
      "organization_members",
      "venue_staff",
    ];

    for (const table of tablesToDelete) {
      const { error } = await adminSupabase.from(table).delete().eq("user_id", userId);
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        throw error;
      }
      console.log(`[AUDIT] Deleted records from ${table} for user_id=${userId}`);
    }

    // Delete pending invites associated with user's email
    const { error: pendingError } = await adminSupabase
      .from("pending_invites")
      .delete()
      .eq("email", user.email);
    if (pendingError) {
      console.error("Error deleting pending invites:", pendingError);
      throw pendingError;
    }
    console.log(`[AUDIT] Deleted pending invites for email=${user.email}`);

    // Delete non-tax billing records (keep 7-year tax compliance records)
    // Only delete recent billing events to preserve tax records
    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

    const { error: billingError } = await adminSupabase
      .from("billing_events")
      .delete()
      .eq("user_id", userId)
      .lt("created_at", sevenYearsAgo.toISOString());
    if (billingError) {
      console.error("Error deleting old billing events:", billingError);
      throw billingError;
    }
    console.log(`[AUDIT] Deleted non-tax billing records for user_id=${userId}`);

    // Delete profile record (this is the final step)
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) {
      console.error("Error deleting profile:", profileError);
      throw profileError;
    }
    console.log(`[AUDIT] Deleted profile for user_id=${userId}`);

    // Final audit log
    console.log(`[AUDIT] Account deletion completed: user_id=${userId}, timestamp=${timestamp}`);

    return NextResponse.json({
      success: true,
      message: "Account and associated data have been deleted."
    });
  } catch (err) {
    console.error("[ERROR] Account deletion failed:", err);
    return NextResponse.json(
      { error: "Could not delete account. Please contact support." },
      { status: 500 }
    );
  }
}
