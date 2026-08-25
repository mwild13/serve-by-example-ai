import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { brandedEmailHtml } from "@/lib/email-template";

// Mobile notifications + bug-report pass (2026-08-25) — new Settings >
// Support > "Report a Bug" entry (app/mobile/_components/ReportBugScreen.tsx).
// Authenticated (unlike app/api/contact/route.ts, which is a public
// marketing-site form) — this fires from inside the logged-in mobile app,
// per CLAUDE.md's "API routes must call getUserFromRequest and return 401
// if no user" rule. Send-only, no DB row (same pattern as
// app/api/contact/route.ts and app/api/toolkit-capture/route.ts — neither
// persists a lead/report row, they just relay to Brevo).

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = getClientIp(req);
    if (!rateLimit(`report-bug:user:${user.id}`, 5, 10 * 60_000) || !rateLimit(`report-bug:ip:${ip}`, 5, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many reports sent. Please try again shortly." }, { status: 429 });
    }

    const body = (await req.json()) as { description?: unknown; screen?: unknown };
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const screen = typeof body.screen === "string" ? body.screen.trim() : "";

    if (!description || description.length < 10) {
      return NextResponse.json({ error: "Please describe what went wrong in a bit more detail." }, { status: 400 });
    }
    if (description.length > 4000) {
      return NextResponse.json({ error: "That description is too long — please shorten it." }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@servebyexample.co";
    const fromEmail = "info@servebyexample.co";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("report-bug API: BREVO_API_KEY not set");
      return NextResponse.json(
        { error: "Bug reporting isn't configured right now. Please email us directly at info@servebyexample.co." },
        { status: 500 },
      );
    }

    const bodyHtml = `
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;border-bottom:1px solid #ece5d5;font-weight:600;width:140px">Reported by</td><td style="padding:8px 0;border-bottom:1px solid #ece5d5"><a href="mailto:${user.email}">${user.email}</a></td></tr>
        ${screen ? `<tr><td style="padding:8px 0;border-bottom:1px solid #ece5d5;font-weight:600">Screen</td><td style="padding:8px 0;border-bottom:1px solid #ece5d5">${screen}</td></tr>` : ""}
        <tr><td style="padding:8px 0;border-bottom:1px solid #ece5d5;font-weight:600">User ID</td><td style="padding:8px 0;border-bottom:1px solid #ece5d5;font-family:monospace;font-size:12px">${user.id}</td></tr>
        <tr><td style="padding:8px 0;font-weight:600">Reported at</td><td style="padding:8px 0">${new Date().toISOString()}</td></tr>
      </table>
      <div style="padding:16px 20px;background:#eeebe1;border-radius:10px;border-left:4px solid #1f4e37">
        <p style="margin:0 0 6px;font-weight:600;color:#172f22">What's wrong</p>
        <p style="margin:0;line-height:1.65;white-space:pre-wrap;color:#172f22">${description}</p>
      </div>
    `;

    const htmlContent = brandedEmailHtml({
      heading: "New bug report — mobile app",
      preheader: description.slice(0, 100),
      bodyHtml,
    });

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: toEmail }],
        replyTo: { email: user.email, name: user.email },
        subject: `Bug report — ${screen || "mobile app"}`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("report-bug API: Brevo send failed:", brevoRes.status, errText);
      return NextResponse.json(
        { error: "Could not send your report. Please email us directly at info@servebyexample.co." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("report-bug API error:", err);
    return NextResponse.json(
      { error: "Could not send your report. Please email us directly at info@servebyexample.co." },
      { status: 500 },
    );
  }
}
