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
    const {
      email,
      headcount,
      managerHours,
      avgTicket,
      turnoverSavings,
      managerSavings,
      upsellProfit,
      totalSavings,
    } = body as {
      email: string;
      headcount: number;
      managerHours: number;
      avgTicket: number;
      turnoverSavings: number;
      managerSavings: number;
      upsellProfit: number;
      totalSavings: number;
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.trim() || !emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const toEmail    = process.env.CONTACT_TO_EMAIL ?? "info@servebyexample.co";
    const fromEmail  = process.env.BREVO_FROM_EMAIL ?? "info@servebyexample.co";
    const fromName   = process.env.BREVO_FROM_NAME  ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("ROI email: BREVO_API_KEY not set");
      return Response.json({ error: "Email service not configured." }, { status: 500 });
    }

    const mailtoBody    = encodeURIComponent(`Hi there,\n\nThanks for checking out our ROI calculator! I'd love to show you how Serve By Example could deliver that profit lift for your venue.\n\nHappy to jump on a quick 15-min call. Does any time this week work?\n\nCheers,`);
    const mailtoSubject = encodeURIComponent("Your Serve By Example Profit Projection");

    const projectionHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f5f2e9">

        <div style="background:#1f4e37;padding:28px 32px;border-radius:16px 16px 0 0">
          <p style="margin:0;color:#e8c96a;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">Serve By Example</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:1.5rem;font-weight:800;line-height:1.3">Your profit projection is ready</h1>
        </div>

        <div style="background:#ffffff;padding:36px 32px;border-left:1px solid #ddd2ba;border-right:1px solid #ddd2ba">

          <p style="margin:0 0 24px;color:#496155;font-size:0.95rem;line-height:1.7">
            Based on your inputs, here&rsquo;s the estimated annual profit lift your venue could generate across three measurable cost-savings vectors.
          </p>

          <div style="background:#f5f2e9;border-radius:10px;padding:14px 18px;margin-bottom:28px;border:1px solid #ece5d5">
            <p style="margin:0 0 6px;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7a9185">Your inputs</p>
            <p style="margin:0;color:#172f22;font-size:0.925rem;font-weight:600">${headcount} staff &bull; ${managerHours}h manager training/week &bull; $${avgTicket} avg check</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
            <tr style="background:#f5f2e9">
              <td style="padding:14px 18px;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#7a9185;border-radius:10px 0 0 0">Revenue vector</td>
              <td style="padding:14px 18px;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#7a9185;text-align:right;border-radius:0 10px 0 0">Annual lift</td>
            </tr>
            <tr>
              <td style="padding:16px 18px;border-bottom:1px solid #ece5d5">
                <p style="margin:0 0 2px;font-weight:700;color:#172f22;font-size:0.9rem">Turnover cost reduction</p>
                <p style="margin:0;font-size:0.75rem;color:#7a9185">23% of replacement costs recovered via better onboarding</p>
              </td>
              <td style="padding:16px 18px;text-align:right;font-size:1.1rem;font-weight:800;color:#1f4e37;border-bottom:1px solid #ece5d5;vertical-align:top">$${fmt(turnoverSavings)}</td>
            </tr>
            <tr>
              <td style="padding:16px 18px;border-bottom:1px solid #ece5d5">
                <p style="margin:0 0 2px;font-weight:700;color:#172f22;font-size:0.9rem">Reclaimed manager time</p>
                <p style="margin:0;font-size:0.75rem;color:#7a9185">60% of weekly manual training hours redirected to operations</p>
              </td>
              <td style="padding:16px 18px;text-align:right;font-size:1.1rem;font-weight:800;color:#1f4e37;border-bottom:1px solid #ece5d5;vertical-align:top">$${fmt(managerSavings)}</td>
            </tr>
            <tr>
              <td style="padding:16px 18px">
                <p style="margin:0 0 2px;font-weight:700;color:#172f22;font-size:0.9rem">Upsell profit lift</p>
                <p style="margin:0;font-size:0.75rem;color:#7a9185">15% upsell conversion gain &times; 75% gross margin on upsold items</p>
              </td>
              <td style="padding:16px 18px;text-align:right;font-size:1.1rem;font-weight:800;color:#1f4e37;vertical-align:top">$${fmt(upsellProfit)}</td>
            </tr>
          </table>

          <div style="background:#1f4e37;border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center">
            <p style="margin:0 0 4px;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e8c96a">Total Annual Profit Lift</p>
            <p style="margin:0;font-size:2rem;font-weight:900;color:#ffffff">$${fmt(totalSavings)}</p>
          </div>

          <div style="border-left:3px solid #1f4e37;padding:14px 18px;margin-bottom:28px;background:#e4efea;border-radius:0 8px 8px 0">
            <p style="margin:0;color:#172f22;font-size:0.875rem;line-height:1.65">
              <strong>How this model works:</strong> The three pillars capture where poor training costs hospitality venues the most &mdash; staff who leave early, managers spending hours on repeated onboarding, and service teams who can&rsquo;t upsell confidently. Serve By Example addresses all three through structured scenario-based practice and real-time performance tracking.
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
          <p style="margin:0;font-size:0.72rem;color:#9ca3af">Indicative modelling based on published AU hospitality benchmarks. You received this because you requested your projection at servebyexample.co</p>
        </div>

      </div>
    `;

    const notificationHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f5f2e9">

        <div style="background:#1f4e37;padding:24px 28px;border-radius:16px 16px 0 0">
          <p style="margin:0;color:#e8c96a;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">Serve By Example &ndash; Lead Alert</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:1.25rem;font-weight:800">New ROI Lead</h1>
        </div>

        <div style="background:#ffffff;padding:28px 32px;border-left:1px solid #ddd2ba;border-right:1px solid #ddd2ba">

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185;width:42%">Email</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.95rem;font-weight:700;color:#172f22">
                <a href="mailto:${email.trim()}" style="color:#1f4e37;text-decoration:none">${email.trim()}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Frontline staff</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.95rem;font-weight:600;color:#172f22">${headcount}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Manager training hrs/week</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.95rem;font-weight:600;color:#172f22">${managerHours}h</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Avg check size</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.95rem;font-weight:600;color:#172f22">$${avgTicket}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Turnover savings</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:1rem;font-weight:700;color:#1f4e37">$${fmt(turnoverSavings)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Manager time savings</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:1rem;font-weight:700;color:#1f4e37">$${fmt(managerSavings)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Upsell profit lift</td>
              <td style="padding:14px 0;border-bottom:1px solid #ece5d5;font-size:1rem;font-weight:700;color:#1f4e37">$${fmt(upsellProfit)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a9185">Total annual profit lift</td>
              <td style="padding:14px 0;font-size:1.25rem;font-weight:900;color:#1f4e37">$${fmt(totalSavings)}</td>
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
          subject: `Your $${fmt(totalSavings)} annual profit projection – Serve By Example`,
          htmlContent: projectionHtml,
        }),
      }),
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: toEmail }],
          subject: `New ROI lead: ${email.trim()} – $${fmt(totalSavings)} annual lift`,
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
