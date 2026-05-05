import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { countActiveSeats } from "@/lib/session";

const TIER_MAX_SEATS: Record<string, number> = {
  "single-venue": 25,
  venue_single: 25,
  "multi-venue": 125,
  venue_multi: 125,
};

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
    const { data, error } = await admin
      .from("venue_memberships")
      .select("id, staff_email, venue_id, status, created_at")
      .eq("manager_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memberships: data ?? [] });
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
    const { staffEmail, venueId } = body as { staffEmail?: string; venueId?: string };

    if (!staffEmail || typeof staffEmail !== "string") {
      return NextResponse.json({ error: "staffEmail is required." }, { status: 400 });
    }
    const email = staffEmail.trim().toLowerCase();

    const admin = createSupabaseAdminClient();

    // Get manager's tier to check seat cap
    const { data: profile } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const tier = profile?.plan ?? "free";
    const maxSeats = TIER_MAX_SEATS[tier] ?? 0;

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

    // Insert membership
    const { data: membership, error: insertError } = await admin
      .from("venue_memberships")
      .upsert(
        {
          manager_id: user.id,
          staff_email: email,
          venue_id: venueId ?? null,
          status: "invited",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "manager_id,staff_email" },
      )
      .select("id, staff_email, venue_id, status")
      .single();

    if (insertError) {
      console.error("Membership insert error:", insertError);
      return NextResponse.json({ error: "Failed to invite staff member." }, { status: 500 });
    }

    // Send invite email via Brevo. For new users: generate a signup link.
    // For existing users: send a login notification instead.
    const appOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "noreply@serve-by-example.com";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";
    let inviteSent = false;

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
            console.warn("Memberships: Brevo send failed:", emailRes.status, await emailRes.text());
          }
        } catch (err) {
          console.warn("Memberships: Brevo fetch threw:", err);
        }
      } else {
        console.warn("Memberships: generateLink failed:", linkError.message);
      }
    } else {
      console.warn("Memberships: BREVO_API_KEY not set — no invite email sent.");
    }

    return NextResponse.json({
      membership,
      inviteSent,
      seatsUsed: currentSeats + 1,
      maxSeats,
    });
  } catch (error) {
    console.error("Memberships POST error:", error);
    return NextResponse.json({ error: "Failed to invite staff." }, { status: 500 });
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
      .from("venue_memberships")
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
