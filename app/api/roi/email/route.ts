import { rateLimit, getClientIp } from "@/lib/rate-limit";

function fmt(n: number) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`roi-email:${ip}`, 5, 60_000)) {
    return Response.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, staffCount, avgTransaction, yr1, yr3, yr5 } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.trim() || !emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@serve-by-example.com";
    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "noreply@serve-by-example.com";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("ROI email: BREVO_API_KEY not set");
      return Response.json({ error: "Email service not configured." }, { status: 500 });
    }

    const projectionHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f5f2e9">
        <div style="background:#ffffff;border-radius:16px;padding:36px 32px;border:1px solid #ddd2ba">
          <h2 style="margin:0 0 4px;color:#1f4e37;font-size:1.5rem">Your Revenue Projection</h2>
          <p style="margin:0 0 24px;color:#7a9185;font-size:0.9rem">Based on your inputs — Serve By Example Revenue Impact Calculator</p>

          <div style="background:#f5f2e9;border-radius:10px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:0.8rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#7a9185">Your Inputs</p>
            <p style="margin:0;color:#172f22;font-size:0.9rem">${staffCount} staff &times; $${avgTransaction} avg transaction &times; 5% upsell lift</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-weight:600;color:#496155;font-size:0.875rem">Year 1 revenue lift</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;text-align:right;font-size:1.1rem;font-weight:800;color:#1f4e37">$${fmt(yr1)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-weight:600;color:#496155;font-size:0.875rem">Year 3 cumulative lift</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;text-align:right;font-size:1.1rem;font-weight:800;color:#1f4e37">$${fmt(yr3)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;font-weight:600;color:#496155;font-size:0.875rem">Year 5 cumulative lift</td>
              <td style="padding:14px 0;text-align:right;font-size:1.25rem;font-weight:900;color:#1f4e37">$${fmt(yr5)}</td>
            </tr>
          </table>

          <p style="color:#7a9185;font-size:0.8rem;line-height:1.6;margin-bottom:24px">
            These figures represent a conservative 5% lift in average transaction value from better-trained staff — one improved upsell per shift, per staff member.
          </p>

          <a href="https://servebyexample.co/demo" style="display:inline-block;background:#1f4e37;color:#ffffff;padding:13px 28px;border-radius:10px;font-weight:700;font-size:0.9rem;text-decoration:none">
            Start Free Demo
          </a>
        </div>
        <p style="text-align:center;margin-top:20px;font-size:0.75rem;color:#9ca3af">Serve By Example &mdash; AI-powered hospitality training</p>
      </div>
    `;

    const notificationHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h3 style="color:#1f4e37">ROI Calculator Lead</h3>
        <p>Email: <a href="mailto:${email.trim()}">${email.trim()}</a></p>
        <p>Staff: ${staffCount} | Avg transaction: $${avgTransaction}</p>
        <p>Year 1: $${fmt(yr1)} | Year 3: $${fmt(yr3)} | Year 5: $${fmt(yr5)}</p>
      </div>
    `;

    const [userRes, notifyRes] = await Promise.all([
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: email.trim() }],
          subject: `Your Revenue Projection — Serve By Example`,
          htmlContent: projectionHtml,
        }),
      }),
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: toEmail }],
          replyTo: { email: email.trim() },
          subject: `ROI lead — ${email.trim()} (${staffCount} staff, $${avgTransaction} avg)`,
          htmlContent: notificationHtml,
        }),
      }),
    ]);

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("ROI email: Brevo send failed:", userRes.status, errText);
      return Response.json({ error: "Could not send email. Please try again." }, { status: 500 });
    }

    if (!notifyRes.ok) {
      console.error("ROI email: Brevo notification failed (non-critical):", notifyRes.status);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("ROI email route error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
