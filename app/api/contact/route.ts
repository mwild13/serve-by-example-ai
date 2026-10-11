import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { EMAIL_SMALL_STYLE, EMAIL_TEXT_STYLE, brandedEmailHtml, emailFieldTableHtml, emailNoteHtml, escapeHtml, formText } from "@/lib/email-template";

export async function POST(req: Request) {
  // Public, unauthenticated and sends email, so it's capped per IP
  // (audit 2026-09-30, M6). In-memory per isolate — the edge WAF rule is
  // the hard ceiling.
  const ip = getClientIp(req);
  if (!rateLimit(`contact:ip:${ip}`, 3)) {
    console.warn(JSON.stringify({ event: "contact_rejected", reason: "rate_limited", ip }));
    return Response.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  try {
    const read = await readJsonBody(req);
    if (!read.ok) return read.response;
    const body = read.body;
    const name = formText(body.name, 120);
    const email = formText(body.email, 254);
    const venueName = formText(body.venueName, 160);
    const venueType = formText(body.venueType, 80);
    const message = formText(body.message, 5000);
    // Optional attribution from the linking page (?source=&package= on
    // /contact). Slug-shaped only; anything else is dropped, not rejected.
    const slug = (value: unknown) => {
      const text = formText(value, 40);
      return /^[a-z0-9-]+$/.test(text) ? text : "";
    };
    const source = slug(body.source);
    const enquiryPackage = slug(body.package);

    // Honeypot – bots fill this invisible field
    if (body.website) {
      return Response.json({ ok: true });
    }

    if (!name || !email || !message) {
      return Response.json(
        { error: "Name, email and message are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@servebyexample.co";
    const fromEmail = "info@servebyexample.co";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("Contact API: BREVO_API_KEY not set");
      return Response.json(
        { error: "Contact form is not configured. Please email us directly at info@servebyexample.co." },
        { status: 500 },
      );
    }

    // Every field is escaped: this email goes to our own inbox, and a form
    // field used to be able to inject markup (links, fake buttons) into it.
    const h = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      venueName: escapeHtml(venueName),
      venueType: escapeHtml(venueType),
      message: escapeHtml(message),
      source: escapeHtml(source),
      enquiryPackage: escapeHtml(enquiryPackage),
    };
    const htmlContent = brandedEmailHtml({
      preheader: `From ${h.name}`,
      heading: "New contact enquiry",
      bodyHtml: `
        <p style="${EMAIL_TEXT_STYLE}">Received from the Serve By Example contact form.</p>
        ${emailFieldTableHtml([
          ["Name", h.name],
          ["Email", `<a href="mailto:${h.email}" style="color:#1f4e37">${h.email}</a>`],
          ["Venue", h.venueName],
          ["Type", h.venueType],
          ["Source", h.source],
          ["Package", h.enquiryPackage],
        ])}
        ${emailNoteHtml("Message", h.message)}
        <p style="${EMAIL_SMALL_STYLE}">Reply to this email to respond to ${h.name}.</p>
      `,
    });

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: toEmail }],
        replyTo: { email, name },
        subject: `Contact enquiry from ${name}${venueName ? ` – ${venueName}` : ""}`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("Contact API: Brevo send failed:", brevoRes.status, errText);
      return Response.json(
        { error: "Could not send your message. Please email us directly at info@servebyexample.co." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return Response.json(
      { error: "Could not send your message. Please email us directly at info@servebyexample.co." },
      { status: 500 },
    );
  }
}
