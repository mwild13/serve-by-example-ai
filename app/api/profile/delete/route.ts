import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";

// Self-service account deletion (to-do 2026-10-02, Phase 1). Replaces a
// route that deleted from a hard-coded table list, wiped scenario_mastery,
// then threw on a table that no longer existed and left the account behind.
//
// Deletion is now one call: auth.admin.deleteUser(). The FK graph on
// auth.users cascades every per-user training table, and the trigger in
// 20261004_account_deletion_cascade.sql releases the user's seat and unlinks
// (but keeps) the manager-owned roster row. Adding a user table later needs
// an ON DELETE CASCADE FK, not an edit here. That migration must be applied
// before this route ships.
//
// Hard delete, not a scheduled soft delete: the Privacy Policy promises
// deletion "within 30 days", which immediate deletion satisfies, and a
// tombstone would need every query in the app to filter on it. Billing
// history is untouched — it lives in Stripe and billing_events, neither of
// which holds a user id.
//
// Refused (409) for:
// - an active subscription — the Stripe customer would keep being billed
//   with no account to manage it from;
// - venue or organization owners — venues.owner_user_id cascades and would
//   wipe the whole roster, and organizations.owner_user_id is RESTRICT.
//   Those go through support so the team's data is handled deliberately.

const CONFIRM_PHRASE = "DELETE";

// Stripe statuses that mean the customer can still be charged.
const BILLABLE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid", "incomplete"]);

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`profile-delete:user:${user.id}`, 3) || !rateLimit(`profile-delete:ip:${ip}`, 3)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  // The typed phrase is the server-side half of the UI's type-to-confirm
  // step, so a stray or replayed POST can't delete an account on its own.
  const read = await readJsonBody(req, 1024);
  if (!read.ok) return read.response;
  if (read.body.confirm !== CONFIRM_PHRASE) {
    return NextResponse.json({ error: `Type ${CONFIRM_PHRASE} to confirm.` }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  try {
    const [profileRes, orgRes, venueRes] = await Promise.all([
      admin.from("profiles").select("subscription_status").eq("id", user.id).maybeSingle(),
      admin.from("organizations").select("id", { count: "exact", head: true }).eq("owner_user_id", user.id),
      admin.from("venues").select("id", { count: "exact", head: true }).eq("owner_user_id", user.id),
    ]);
    if (profileRes.error) throw profileRes.error;
    if (orgRes.error) throw orgRes.error;
    if (venueRes.error) throw venueRes.error;

    const status = profileRes.data?.subscription_status;
    if (status && BILLABLE_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Cancel your subscription before deleting your account.", code: "active_subscription" },
        { status: 409 },
      );
    }
    if ((orgRes.count ?? 0) > 0 || (venueRes.count ?? 0) > 0) {
      return NextResponse.json(
        { error: "You manage a venue. Contact support to close it and delete your account.", code: "owns_venue" },
        { status: 409 },
      );
    }

    // Best effort: the photo is public-by-URL, so remove it, but a missing
    // file shouldn't block the deletion itself.
    const { error: photoError } = await admin.storage
      .from("profile-photos")
      .remove([`${user.id}/profile-photo.webp`]);
    if (photoError) {
      console.warn(JSON.stringify({ event: "account_delete_photo_failed", user_id: user.id, message: photoError.message }));
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    console.log(JSON.stringify({ event: "account_deleted", user_id: user.id, at: new Date().toISOString() }));
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error(JSON.stringify({
      event: "account_delete_failed",
      user_id: user.id,
      // PostgrestError is a plain object, not an Error instance.
      message: err && typeof err === "object" && "message" in err ? String(err.message) : String(err),
    }));
    return NextResponse.json({ error: "Could not delete your account. Please contact support." }, { status: 500 });
  }
}
