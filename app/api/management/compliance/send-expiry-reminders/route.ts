// POST /api/management/compliance/send-expiry-reminders
// Sends digest emails to managers for RSA certs expiring within 30 days.
// Call from a Supabase pg_cron job or Cloudflare Worker cron daily at 08:00.
// Requires BREVO_API_KEY in environment.
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Allow a shared cron secret so the route can be called without a user session
function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("x-cron-secret") === secret;
}

interface StaffExpiryRow {
  id: string;
  name: string;
  rsa_expiry_date: string;
  manager_user_id: string;
}

export async function POST(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const brevoApiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL ?? "info@servebyexample.co";
  const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

  // Find all staff with RSA expiry within 30 days
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: expiringStaff, error } = await admin
    .from("venue_staff")
    .select("id, name, rsa_expiry_date, manager_user_id")
    .not("rsa_expiry_date", "is", null)
    .gte("rsa_expiry_date", now.toISOString().split("T")[0])
    .lte("rsa_expiry_date", in30Days);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!expiringStaff || expiringStaff.length === 0) {
    return NextResponse.json({ sent: 0, message: "No expiring certs found" });
  }

  // Group by manager
  const byManager: Record<string, StaffExpiryRow[]> = {};
  for (const row of expiringStaff as StaffExpiryRow[]) {
    if (!byManager[row.manager_user_id]) byManager[row.manager_user_id] = [];
    byManager[row.manager_user_id].push(row);
  }

  let sent = 0;
  const errors: string[] = [];

  for (const [managerId, staffRows] of Object.entries(byManager)) {
    // Get manager email from auth.users
    const { data: managerUser } = await admin.auth.admin.getUserById(managerId);
    const managerEmail = managerUser?.user?.email;
    if (!managerEmail || !brevoApiKey) continue;

    const staffList = staffRows
      .map((s) => {
        const expiry = new Date(s.rsa_expiry_date);
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `<li><strong>${s.name}</strong> — RSA expires ${expiry.toLocaleDateString("en-AU")} (in ${days} days)</li>`;
      })
      .join("");

    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: managerEmail }],
        subject: `RSA certification reminder — ${staffRows.length} staff expiring within 30 days`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h2 style="margin-bottom:8px;color:#1f4e37">Compliance Reminder</h2>
            <p style="color:#555">The following staff members have RSA certifications expiring within 30 days. Plan renewals early — RSA courses can take 1–2 weeks to schedule.</p>
            <ul style="color:#333;line-height:1.8">${staffList}</ul>
            <p style="margin-top:24px">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/management/dashboard?tab=compliance" style="background:#1f4e37;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
                View Compliance Dashboard
              </a>
            </p>
            <p style="color:#aaa;font-size:12px;margin-top:24px">You received this because you are a venue manager on Serve By Example.</p>
          </div>
        `,
      }),
    });

    if (emailRes.ok) sent++;
    else errors.push(`Manager ${managerId}: ${await emailRes.text()}`);
  }

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined });
}
