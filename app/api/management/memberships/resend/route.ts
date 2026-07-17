import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const membershipId = typeof body.membershipId === "string" ? body.membershipId.trim() : null;
  if (!membershipId) {
    return NextResponse.json({ error: "membershipId is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error: lookupError } = await admin
    .from("venue_memberships")
    .select("id, staff_email, staff_name, manager_user_id")
    .eq("id", membershipId)
    .eq("manager_user_id", user.id)
    .single();

  if (lookupError || !membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  const email = membership.staff_email as string;
  const name = (membership.staff_name as string | null) ?? email.split("@")[0];
  const appOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
  const redirectTo = `${appOrigin}/login`;

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo, data: { display_name: name } },
  });

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 422 });
  }

  const inviteLink = linkData?.properties?.action_link;
  if (!inviteLink) {
    return NextResponse.json({ error: "Could not generate invite link" }, { status: 500 });
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    return NextResponse.json({ inviteLink, emailSent: false, message: "Set BREVO_API_KEY to enable automatic emails." });
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL ?? "info@servebyexample.co";
  const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

  const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email, name }],
      subject: `Reminder: you've been invited to join ${fromName}`,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <h2 style="margin-bottom:8px">Reminder invitation</h2>
          <p style="color:#555">Hi ${name},</p>
          <p style="color:#555">This is a reminder that you've been added as a staff member on <strong>Serve By Example</strong>. Click the button below to set up your account and start your training.</p>
          <p style="margin:32px 0">
            <a href="${inviteLink}" style="background:#22c55e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Accept invitation</a>
          </p>
          <p style="color:#aaa;font-size:13px">If the button doesn't work, copy and paste this link into your browser:<br>${inviteLink}</p>
          <p style="color:#aaa;font-size:13px">This link expires in 7 days.</p>
        </div>
      `,
    }),
  });

  const emailSent = emailRes.ok;
  return NextResponse.json({ inviteLink, emailSent });
}
