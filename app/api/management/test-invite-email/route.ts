import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.email) {
      return NextResponse.json({ error: "No email on your account." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const appOrigin = new URL(req.url).origin;

    // Generate a test invite link — this always works (no SMTP needed).
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "invite",
      email: user.email,
      options: {
        redirectTo: `${appOrigin}/login`,
        data: { display_name: "Test invite" },
      },
    });

    if (linkError) {
      return NextResponse.json({
        success: false,
        smtpConfigured: false,
        message: `Could not generate test link: ${linkError.message}`,
      });
    }

    const testLink = linkData?.properties?.action_link ?? null;

    // Attempt email delivery — this will fail if SMTP is not configured.
    const { error: emailError } = await admin.auth.admin.inviteUserByEmail(user.email, {
      redirectTo: `${appOrigin}/login`,
      data: { display_name: "Test invite" },
    });

    if (emailError) {
      const msg = emailError.message ?? "";
      const isSmtpError =
        msg.toLowerCase().includes("smtp") ||
        msg.toLowerCase().includes("email") ||
        msg.toLowerCase().includes("not authorized") ||
        msg.toLowerCase().includes("rate limit");

      return NextResponse.json({
        success: false,
        smtpConfigured: false,
        testLink,
        message: isSmtpError
          ? "SMTP is not configured. Go to Supabase Dashboard → Authentication → Emails → SMTP and add your email provider credentials."
          : `Email delivery failed: ${msg}`,
      });
    }

    return NextResponse.json({
      success: true,
      smtpConfigured: true,
      message: `Test email sent to ${user.email}. Check your inbox.`,
    });
  } catch (error) {
    console.error("Test invite email error:", error);
    return NextResponse.json({ error: "Test failed." }, { status: 500 });
  }
}
