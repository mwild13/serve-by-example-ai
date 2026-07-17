import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const staffId = typeof body.staffId === "string" ? body.staffId.trim() : null;
  const message = typeof body.message === "string" ? body.message.trim() : null;

  if (!staffId) return NextResponse.json({ error: "staffId is required" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Verify staff belongs to this manager and fetch email
  const { data: staffRow } = await admin
    .from("venue_staff")
    .select("id, name, email")
    .eq("id", staffId)
    .eq("manager_user_id", user.id)
    .single();

  if (!staffRow) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

  // Save recognition
  const { error: insertError } = await admin
    .from("staff_recognitions")
    .insert({ staff_id: staffId, from_manager_id: user.id, message });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Send recognition email if staff member has an email
  const staffEmail = typeof staffRow.email === "string" ? staffRow.email : null;
  const staffName = typeof staffRow.name === "string" ? staffRow.name : "there";
  let emailSent = false;

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey && staffEmail) {
    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "info@servebyexample.co";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";
    const appOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: staffEmail, name: staffName }],
        subject: "Your manager sent you a recognition",
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h2 style="margin-bottom:8px;color:#1f4e37">You've been recognised!</h2>
            <p style="color:#555">Hi ${staffName},</p>
            <p style="color:#555">Your manager has sent you a recognition message:</p>
            <blockquote style="border-left:4px solid #1f4e37;margin:20px 0;padding:12px 20px;background:#f5f2e9;color:#172f22;font-style:italic;border-radius:0 8px 8px 0">
              "${message}"
            </blockquote>
            <p style="color:#555">Keep up the great work. Log in to see your training progress and achievements.</p>
            <p style="margin-top:24px">
              <a href="${appOrigin}/dashboard" style="background:#1f4e37;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
                View your dashboard
              </a>
            </p>
          </div>
        `,
      }),
    });
    emailSent = emailRes.ok;
  }

  return NextResponse.json({ ok: true, emailSent });
}
