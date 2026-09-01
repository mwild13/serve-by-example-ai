import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { countActiveSeats, tierSeatLimit, isOwnerLevelRole, TIER_SEATS } from "@/lib/session";

/**
 * GET /api/management/memberships — list manager's memberships
 * POST /api/management/memberships — invite a staff member
 * DELETE /api/management/memberships — remove a membership
 */
export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    // "removed" rows are soft-deleted, not dropped (see DELETE handler) — they
    // must not resurface here, or a manager who removed someone sees them
    // sitting in the list forever with no way to make them go away.
    const { data, error } = await admin
      .from("organization_members")
      .select("id, staff_email, venue_id, status, role, created_at")
      .eq("manager_id", user.id)
      .not("status", "eq", "removed")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single();
    const maxSeats = tierSeatLimit(profile?.tier);
    const usedSeats = await countActiveSeats(admin, user.id);
    // TIER_SEATS.enterprise (9999) is the codebase's own "effectively
    // unlimited" sentinel for this map — surface that as an explicit flag
    // so UI callers show "Unlimited" rather than a literal "9999".
    const unlimited = maxSeats >= TIER_SEATS.enterprise;

    return NextResponse.json({
      memberships: data ?? [],
      seatUsage: { used: usedSeats, max: maxSeats, unlimited },
    });
  } catch (error) {
    console.error("Memberships GET error:", error);
    return NextResponse.json({ error: "Failed to load memberships." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { staffEmail, venueId, role: requestedRole } = body as {
      staffEmail?: string;
      venueId?: string;
      role?: string;
    };

    if (!staffEmail || typeof staffEmail !== "string") {
      return NextResponse.json({ error: "staffEmail is required." }, { status: 400 });
    }
    const email = staffEmail.trim().toLowerCase();

    if (requestedRole !== undefined && requestedRole !== "staff" && requestedRole !== "duty_manager") {
      return NextResponse.json({ error: "Invalid role. Must be \"staff\" or \"duty_manager\"." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Get manager's tier + platform_role — tier drives the seat cap,
    // platform_role gates who's allowed to grant duty-manager access below.
    const { data: profile } = await admin
      .from("profiles")
      .select("tier, platform_role")
      .eq("id", user.id)
      .single();

    // Only an owner-level manager (never a duty manager, even one already
    // in Mission Control) can grant duty-manager access to someone else —
    // otherwise a duty manager could mint peers without the venue owner
    // ever being involved. Silently downgrades to "staff" rather than
    // erroring, since the UI selector is already hidden for non-owners and
    // this should only ever fire on a crafted request.
    const role: "staff" | "duty_manager" =
      requestedRole === "duty_manager" && isOwnerLevelRole(profile?.platform_role) ? "duty_manager" : "staff";

    const maxSeats = tierSeatLimit(profile?.tier);

    if (maxSeats === 0) {
      return NextResponse.json(
        { error: "Your plan does not include staff seats. Upgrade to a venue plan." },
        { status: 403 },
      );
    }

    // Check seat cap
    const currentSeats = await countActiveSeats(admin, user.id);
    if (currentSeats >= maxSeats) {
      return NextResponse.json(
        { error: `Seat limit reached (${currentSeats}/${maxSeats}). Upgrade your plan to add more staff.` },
        { status: 403 },
      );
    }

    // Insert or reactivate membership. Uses select-then-insert because the partial unique
    // index on organization_members treats NULL venue_id as distinct, so upsert on conflict
    // would silently create duplicates when venue_id is omitted.
    // Deliberately includes "removed" rows here (unlike GET, which hides them) — a manager
    // re-inviting an email they'd previously removed should reactivate that row, not spawn
    // a second one. Excluding removed rows was the cause of the duplicate-row bug where the
    // same staff email ended up with a "removed" row and a separate "invited" row.
    let existingQuery = admin
      .from("organization_members")
      .select("id, staff_email, venue_id, status")
      .eq("manager_id", user.id)
      .ilike("staff_email", email);

    if (venueId) {
      existingQuery = existingQuery.eq("venue_id", venueId);
    } else {
      existingQuery = existingQuery.is("venue_id", null);
    }

    const { data: existingMembership } = await existingQuery.maybeSingle();

    let membership: { id: string; staff_email: string; venue_id: string | null; status: string } | null;
    let insertError: { message: string } | null;

    if (existingMembership) {
      // role is included here too (not just status) so re-inviting an
      // existing "staff" row as "duty_manager" (or vice versa) actually
      // changes their access, not just reactivates the old grant.
      const { data: updated, error: updateError } = await admin
        .from("organization_members")
        .update({ status: "invited", role, updated_at: new Date().toISOString() })
        .eq("id", existingMembership.id)
        .select("id, staff_email, venue_id, status")
        .single();
      membership = updated;
      insertError = updateError;
    } else {
      const { data: inserted, error: insertErr } = await admin
        .from("organization_members")
        .insert({
          manager_id: user.id,
          staff_email: email,
          venue_id: venueId ?? null,
          status: "invited",
          role,
          seat_counted: true,
          updated_at: new Date().toISOString(),
        })
        .select("id, staff_email, venue_id, status")
        .single();
      membership = inserted;
      insertError = insertErr;
    }

    if (insertError) {
      console.error("Membership insert error:", insertError);
      return NextResponse.json({ error: "Failed to invite staff member." }, { status: 500 });
    }

    // Best-effort immediate promotion: if this email already belongs to an
    // existing account, don't make them wait for their next login to pick
    // up duty-manager access — /api/session/stamp does the same promotion
    // (matched by organization_members row) as a fallback for brand-new
    // signups who have no profiles row yet at this point.
    if (role === "duty_manager") {
      const { error: promoteError } = await admin
        .from("profiles")
        .update({ platform_role: "duty_manager" })
        .eq("email", email)
        .eq("platform_role", "staff");
      if (promoteError) {
        console.warn("Membership invite: duty_manager promotion failed (will retry on next login):", promoteError);
      }
    }

    // Send invite email via Brevo. For new users: generate a signup link.
    // For existing users: send a login notification instead.
    const appOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const fromEmail = "info@servebyexample.co";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";
    let inviteSent = false;
    // Surfaced to the client so the manager UI can stop reporting "Invite
    // sent" when the email silently failed — this used to only reach a
    // console.warn that nobody could see.
    let inviteEmailError: string | null = null;

    if (brevoApiKey) {
      // Try to generate a signup link for new users
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: `${appOrigin}/login`, data: { invited_by_manager: user.id } },
      });

      const isExistingUser =
        linkError &&
        (linkError.message?.toLowerCase().includes("already registered") ||
          linkError.message?.toLowerCase().includes("already been registered"));

      const inviteLink = linkData?.properties?.action_link ?? null;
      const ctaHref = inviteLink ?? `${appOrigin}/login`;
      const ctaLabel = inviteLink ? "Accept invitation" : "Log in to your account";
      const bodyText = inviteLink
        ? "You've been added as a staff member on <strong>Serve By Example</strong>. Click the button below to set up your account and start your training."
        : "You've been added as a staff member on <strong>Serve By Example</strong>. Log in to your existing account to get started with your training.";

      if (!linkError || isExistingUser) {
        try {
          const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": brevoApiKey,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              sender: { name: fromName, email: fromEmail },
              to: [{ email }],
              subject: `You've been invited to join ${fromName}`,
              htmlContent: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
                  <h2 style="margin-bottom:8px">You've been invited!</h2>
                  <p style="color:#555">${bodyText}</p>
                  <p style="margin:32px 0">
                    <a href="${ctaHref}" style="background:#22c55e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">${ctaLabel}</a>
                  </p>
                  <p style="color:#aaa;font-size:13px">If the button doesn't work, copy and paste this link:<br>${ctaHref}</p>
                  ${inviteLink ? '<p style="color:#aaa;font-size:13px">This link expires in 7 days.</p>' : ""}
                </div>
              `,
            }),
          });
          inviteSent = emailRes.ok;
          if (!emailRes.ok) {
            const detail = await emailRes.text();
            console.warn("Memberships: Brevo send failed:", emailRes.status, detail);
            inviteEmailError = `Email provider rejected the send (HTTP ${emailRes.status}). Check the Brevo sender/API key configuration.`;
          }
        } catch (err) {
          console.warn("Memberships: Brevo fetch threw:", err);
          inviteEmailError = "Could not reach the email provider.";
        }
      } else {
        console.warn("Memberships: generateLink failed:", linkError.message);
        inviteEmailError = linkError.message ?? "Could not generate an invite link.";
      }
    } else {
      console.warn("Memberships: BREVO_API_KEY not set — no invite email sent.");
      inviteEmailError = "Email sending is not configured for this environment.";
    }

    return NextResponse.json({
      membership,
      inviteSent,
      inviteEmailError,
      seatsUsed: currentSeats + 1,
      maxSeats,
    });
  } catch (error) {
    console.error("Memberships POST error:", error);
    return NextResponse.json({ error: "Failed to invite staff." }, { status: 500 });
  }
}

/**
 * PATCH /api/management/memberships — change an existing staff member's
 * access level (staff <-> duty_manager). Separate from the invite-time role
 * assignment in POST above — this is how a manager promotes/demotes someone
 * who already joined (via venue code or an earlier plain-staff invite),
 * without re-inviting them. Owner-level only, same as inviting a duty
 * manager in the first place.
 */
export async function PATCH(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { staffEmail, role: requestedRole } = body as { staffEmail?: string; role?: string };

    if (!staffEmail || typeof staffEmail !== "string") {
      return NextResponse.json({ error: "staffEmail is required." }, { status: 400 });
    }
    if (requestedRole !== "staff" && requestedRole !== "duty_manager") {
      return NextResponse.json({ error: "Invalid role. Must be \"staff\" or \"duty_manager\"." }, { status: 400 });
    }
    const email = staffEmail.trim().toLowerCase();

    const admin = createSupabaseAdminClient();

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("platform_role")
      .eq("id", user.id)
      .single();

    if (!isOwnerLevelRole(callerProfile?.platform_role)) {
      return NextResponse.json({ error: "Only the venue owner can change a staff member's access level." }, { status: 403 });
    }

    const { data: membership, error: findError } = await admin
      .from("organization_members")
      .select("id")
      .eq("manager_id", user.id)
      .ilike("staff_email", email)
      .not("status", "eq", "removed")
      .maybeSingle();

    if (findError || !membership) {
      return NextResponse.json({ error: "No matching staff membership found for that email." }, { status: 404 });
    }

    const { error: updateError } = await admin
      .from("organization_members")
      .update({ role: requestedRole, updated_at: new Date().toISOString() })
      .eq("id", membership.id);

    if (updateError) {
      console.error("Membership PATCH role update error:", updateError);
      return NextResponse.json({ error: "Failed to update access level." }, { status: 500 });
    }

    // Guarded to only ever flip a "staff"/"duty_manager" row — never touches
    // an owner/admin profile even if an email somehow collided, since a
    // real owner/admin would never also have their own email listed as
    // their own organization_members row under themselves in practice.
    await admin
      .from("profiles")
      .update({ platform_role: requestedRole })
      .eq("email", email)
      .in("platform_role", ["staff", "duty_manager"]);

    return NextResponse.json({ success: true, role: requestedRole });
  } catch (error) {
    console.error("Memberships PATCH error:", error);
    return NextResponse.json({ error: "Failed to update access level." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { membershipId } = body as { membershipId?: string };

    if (!membershipId) {
      return NextResponse.json({ error: "membershipId is required." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    const { error } = await admin
      .from("organization_members")
      .update({ status: "removed", updated_at: new Date().toISOString() })
      .eq("id", membershipId)
      .eq("manager_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove membership." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Memberships DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove membership." }, { status: 500 });
  }
}
