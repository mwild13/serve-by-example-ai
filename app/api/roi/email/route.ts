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
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@servebyexample.co";
    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "info@servebyexample.co";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("ROI email: BREVO_API_KEY not set");
      return Response.json({ error: "Email service not configured." }, { status: 500 });
    }

    const mailtoBody = encodeURIComponent(
      `Hi there,\n\nThanks for checking out our ROI calculator! I'd love to show you how Serve By Example could deliver that revenue lift for your venue.\n\nHappy to jump on a quick 15-min call — does any time this week work?\n\nCheers,`
    );
    const mailtoSubject = encodeURIComponent("Your Serve By Example ROI Projection");

    const projectionHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f5f2e9">

        <div style="background:#1f4e37;padding:28px 32px;border-radius:16px 16px 0 0">
          <p style="margin:0;color:#e8c96a;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">Serve By Example</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:1.5rem;font-weight:800;line-height:1.3">Your revenue projection is ready</h1>
        </div>

        <div style="background:#ffffff;padding:36px 32px;border-left:1px solid #ddd2ba;border-right:1px solid #ddd2ba">

          <p style="margin:0 0 24px;color:#496155;font-size:0.95rem;line-height:1.7">
            Based on your inputs, here&rsquo;s the revenue lift your venue could generate by training staff to improve their average transaction value by just 5%.
          </p>

          <div style="background:#f5f2e9;border-radius:10px;padding:14px 18px;margin-bottom:28px;border:1px solid #ece5d5">
            <p style="margin:0 0 6px;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7a9185">Your inputs</p>
            <p style="margin:0;color:#172f22;font-size:0.925rem;font-weight:600">${staffCount} staff &times; $${avgTransaction} avg transaction &times; 5% upsell lift</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
            <tr style="background:#f5f2e9">
              <td style="padding:14px 18px;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#7a9185;border-radius:10px 0 0 0">Period</td>
              <td style="padding:14px 18px;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#7a9185;text-align:right;border-radius:0 10px 0 0">Revenue Lift</td>
            </tr>
            <tr>
              <td style="padding:16px 18px;font-weight:600;color:#496155;font-size:0.9rem;border-bottom:1px solid #ece5d5">Year 1</td>
              <td style="padding:16px 18px;text-align:right;font-size:1.15rem;font-weight:800;color:#1f4e37;border-bottom:1px solid #ece5d5">$${fmt(yr1)}</td>
            </tr>
            <tr>
              <td style="padding:16px 18px;font-weight:600;color:#496155;font-size:0.9rem;border-bottom:1px solid #ece5d5">Year 3 cumulative</td>
              <td style="padding:16px 18px;text-align:right;font-size:1.15rem;font-weight:800;color:#1f4e37;border-bottom:1px solid #ece5d5">$${fmt(yr3)}</td>
            </tr>
            <tr>
              <td style="padding:16px 18px;font-weight:600;color:#172f22;font-size:0.9rem">Year 5 cumulative</td>
              <td style="padding:16px 18px;text-align:right;font-size:1.375rem;font-weight:900;color:#1f4e37">$${fmt(yr5)}</td>
            </tr>
          </table>

          <div style="border-left:3px solid #1f4e37;padding:14px 18px;margin-bottom:28px;background:#e4efea;border-radius:0 8px 8px 0">
            <p style="margin:0;color:#172f22;font-size:0.875rem;line-height:1.65">
              <strong>Why just 5%?</strong> That&rsquo;s one better upsell per shift, per staff member &mdash; a wine upgrade, a spirits premium swap, or a dessert recommendation. Serve By Example trains these moments into muscle memory through AI-powered scenario practice.
            </p>
          </div>

          <div style="text-align:center">
            <a href="https://servebyexample.co/demo" style="display:inline-block;background:#1f4e37;color:#ffffff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:0.95rem;text-decoration:none">
              Try the Demo Free
            </a>
            <p style="margin:14px 0 0">
              <a href="https://servebyexample.co/contact" style="color:#496155;font-size:0.875rem;text-decoration:underline;text-underline-offset:3px">
                or book a 15-min call with our team
              </a>
            </p>
          </div>

        </div>

        <div style="background:#f5f2e9;padding:22px 32px;border-radius:0 0 16px 16px;border:1px solid #ddd2ba;border-top:none;text-align:center">
          <p style="margin:0 0 4px;font-size:0.75rem;color:#7a9185">Serve By Example &mdash; AI-powered hospitality staff training</p>
          <p style="margin:0;font-size:0.72rem;color:#9ca3af">You received this because you requested your ROI projection at servebyexample.co</p>
        </div>

      </div>
    `;

    const notificationHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f5f2e9">

        <div style="background:#1f4e37;padding:24px 28px;border-radius:16px 16px 0 0">
          <p style="margin:0;color:#e8c96a;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">Serve By Example — Lead Alert</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:1.25rem;font-weight:800">New ROI Lead</h1>
        </div>

        <div style="background:#ffffff;padding:28px 32px;border-left:1px solid #ddd2ba;border-right:1px solid #ddd2ba">

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185;width:40%">Email</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.95rem;font-weight:700;color:#172f22">
                <a href="mailto:${email.trim()}" style="color:#1f4e37;text-decoration:none">${email.trim()}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Staff count</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.95rem;font-weight:600;color:#172f22">${staffCount}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Avg transaction</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.95rem;font-weight:600;color:#172f22">$${avgTransaction}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Year 1 lift</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:1.1rem;font-weight:900;color:#1f4e37">$${fmt(yr1)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Year 3 lift</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:1rem;font-weight:800;color:#1f4e37">$${fmt(yr3)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Year 5 lift</td>
              <td style="padding:14px 0;font-size:1rem;font-weight:800;color:#1f4e37">$${fmt(yr5)}</td>
            </tr>
          </table>

          <a href="mailto:${email.trim()}?subject=${mailtoSubject}&body=${mailtoBody}" style="display:inline-block;background:#1f4e37;color:#ffffff;padding:13px 28px;border-radius:10px;font-weight:700;font-size:0.9rem;text-decoration:none">
            Reply to Lead
          </a>

        </div>

        <div style="background:#f5f2e9;padding:16px 28px;border-radius:0 0 16px 16px;border:1px solid #ddd2ba;border-top:none;text-align:center">
          <p style="margin:0;font-size:0.72rem;color:#9ca3af">Serve By Example &mdash; ROI Lead Notification</p>
        </div>

      </div>
    `;

    const [userRes, notifyRes] = await Promise.all([
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: email.trim() }],
          subject: `Your $${fmt(yr1)} revenue projection — Serve By Example`,
          htmlContent: projectionHtml,
        }),
      }),
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: toEmail }],
          subject: `New ROI lead: ${email.trim()} — $${fmt(yr1)} annual lift`,
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
