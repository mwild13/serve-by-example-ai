import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Links a signed-in account to roster/membership rows a manager created for
 * its email. The one place email-based linking happens: everything after this
 * (roster sync, sponsorship, duty-manager promotion) follows the linked
 * user id, never the email.
 *
 * Exact match on the lowercased address. This used to be `ilike`, where `_`
 * and `%` in an address act as wildcards, so `j_smith@x.com` matched
 * `jxsmith@x.com`. Only fills empty links — a row already linked to another
 * account is never re-pointed.
 */
export async function linkStaffAccountByEmail(
  admin: SupabaseClient,
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return;

  const now = new Date().toISOString();
  const [staffResult, memberResult] = await Promise.all([
    admin
      .from("venue_staff")
      .update({ staff_user_id: userId, updated_at: now })
      .eq("email", normalized)
      .is("staff_user_id", null),
    admin
      .from("organization_members")
      .update({ user_id: userId, updated_at: now })
      .eq("staff_email", normalized)
      .is("user_id", null)
      .not("status", "eq", "removed"),
  ]);

  if (staffResult.error) console.warn("linkStaffAccountByEmail: venue_staff link failed:", staffResult.error.message);
  if (memberResult.error) console.warn("linkStaffAccountByEmail: organization_members link failed:", memberResult.error.message);
}
