import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.email) {
      return NextResponse.json({ error: "No email on your account." }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      return NextResponse.json({
        success: false,
        smtpConfigured: false,
        message: "BREVO_API_KEY is not set in your Cloudflare Pages environment variables. Add it to enable automatic invite emails.",
      });
    }

    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "noreply@serve-by-example.com";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: user.email, name: "Manager" }],
        subject: "Serve By Example — email delivery test",
        htmlContent: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <h2 style="margin-bottom:8px">Email delivery confirmed</h2>
            <p style="color:#555">This is a test email from your Serve By Example manager dashboard.</p>
            <p style="color:#555">If you received this, your invite email system is working correctly and staff invite emails will be delivered automatically.</p>
          </div>
        `,
      }),
    });

    if (emailRes.ok) {
      return NextResponse.json({
        success: true,
        smtpConfigured: true,
        message: `Test email sent to ${user.email}. Check your inbox to confirm delivery.`,
      });
    }

    const errBody = await emailRes.text();
    console.error(`[test-invite-email] Brevo send failed (${emailRes.status}):`, errBody);
    return NextResponse.json({
      success: false,
      smtpConfigured: false,
      message: `Brevo email failed (${emailRes.status}). Check that your BREVO_API_KEY is correct and the sender email is verified in Brevo.`,
    });
  } catch (error) {
    console.error("Test invite email error:", error);
    return NextResponse.json({ error: "Test failed." }, { status: 500 });
  }
}
