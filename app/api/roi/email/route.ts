import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { EMAIL_SMALL_STYLE, EMAIL_TEXT_STYLE, brandedEmailHtml, emailButtonHtml, emailFieldTableHtml, emailNoteHtml, escapeHtml, formText } from "@/lib/email-template";

function fmt(n: number) {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`roi-email:${ip}`, 5, 60_000)) {
    return Response.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  try {
    const read = await readJsonBody(req);
    if (!read.ok) return read.response;
    const body = read.body;
    // Numbers are forced to real finite numbers: this email goes to whatever
    // address was submitted, from our domain, and these fields used to be
    // interpolated raw, so a string field could inject arbitrary HTML.
    const num = (v: unknown) => {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), 1_000_000_000) : 0;
    };
    const email = formText(body.email, 254);
    const headcount = num(body.headcount);
    const managerHours = num(body.managerHours);
    const avgTicket = num(body.avgTicket);
    const turnoverSavings = num(body.turnoverSavings);
    const managerSavings = num(body.managerSavings);
    const upsellProfit = num(body.upsellProfit);
    const totalSavings = num(body.totalSavings);
    const safeEmail = escapeHtml(email);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const toEmail    = process.env.CONTACT_TO_EMAIL ?? "info@servebyexample.co";
    const fromEmail  = "info@servebyexample.co";
    const fromName   = process.env.BREVO_FROM_NAME  ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("ROI email: BREVO_API_KEY not set");
      return Response.json({ error: "Email service not configured." }, { status: 500 });
    }

    const mailtoBody    = encodeURIComponent(`Hi there,\n\nThanks for checking out our ROI calculator! I'd love to show you how Serve By Example could deliver that profit lift for your venue.\n\nHappy to jump on a quick 15-min call. Does any time this week work?\n\nCheers,`);
    const mailtoSubject = encodeURIComponent("Your Serve By Example Profit Projection");

    const amount = "font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#1f4e37";
    const projectionHtml = brandedEmailHtml({
      preheader: `An estimated $${fmt(totalSavings)} a year, from the numbers you entered.`,
      heading: "Your profit projection",
      bodyHtml: `
        <p style="${EMAIL_TEXT_STYLE}">
          Based on your inputs, this is the estimated annual profit lift for your venue across three areas.
        </p>
        ${emailNoteHtml("Your inputs", `${headcount} staff, ${managerHours} hours of manager training a week, $${avgTicket} average check`)}
        ${emailFieldTableHtml([
          ["Turnover cost reduction", `<span style="${amount}">$${fmt(turnoverSavings)}</span><br /><span style="font-size:13px;color:#7a9185">23% of replacement costs recovered through better onboarding</span>`],
          ["Reclaimed manager time", `<span style="${amount}">$${fmt(managerSavings)}</span><br /><span style="font-size:13px;color:#7a9185">60% of weekly manual training hours returned to operations</span>`],
          ["Upsell profit lift", `<span style="${amount}">$${fmt(upsellProfit)}</span><br /><span style="font-size:13px;color:#7a9185">15% upsell conversion gain at 75% gross margin on upsold items</span>`],
          ["Total annual profit lift", `<span style="${amount};font-size:26px">$${fmt(totalSavings)}</span>`],
        ])}
        <p style="${EMAIL_TEXT_STYLE}">
          <strong>How this model works.</strong> The three areas are where poor training costs hospitality venues the most: staff who leave early, managers spending hours on repeated onboarding, and service teams who cannot upsell with confidence.
        </p>
        ${emailButtonHtml("https://servebyexample.co/demo", "Try the demo")}
        <p style="${EMAIL_TEXT_STYLE}">
          Or <a href="https://servebyexample.co/contact" style="color:#1f4e37;font-weight:700">book a 15-minute call with our team</a>.
        </p>
        <p style="${EMAIL_SMALL_STYLE}">Indicative modelling based on published AU hospitality benchmarks. You received this because you requested your projection at servebyexample.co.</p>
      `,
    });

    const notificationHtml = brandedEmailHtml({
      preheader: `${safeEmail}, $${fmt(totalSavings)} a year`,
      heading: "New ROI lead",
      bodyHtml: `
        ${emailFieldTableHtml([
          ["Email", `<a href="mailto:${safeEmail}" style="color:#1f4e37">${safeEmail}</a>`],
          ["Frontline staff", `${headcount}`],
          ["Manager training hours a week", `${managerHours}`],
          ["Average check", `$${avgTicket}`],
          ["Turnover savings", `$${fmt(turnoverSavings)}`],
          ["Manager time savings", `$${fmt(managerSavings)}`],
          ["Upsell profit lift", `$${fmt(upsellProfit)}`],
          ["Total annual profit lift", `<strong>$${fmt(totalSavings)}</strong>`],
        ])}
        ${emailButtonHtml(`mailto:${encodeURIComponent(email)}?subject=${mailtoSubject}&amp;body=${mailtoBody}`, "Reply to lead")}
      `,
    });

    const [userRes, notifyRes] = await Promise.all([
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email }],
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
          subject: `New ROI lead: ${email} – $${fmt(totalSavings)} annual lift`,
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
