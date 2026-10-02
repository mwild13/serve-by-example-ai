import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { escapeHtml, formText } from "@/lib/email-template";

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
    };
    const htmlContent = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
        <h2 style="margin-bottom:8px;color:#0B2B1E">New Contact Enquiry</h2>
        <p style="color:#6b7280;margin-top:0">Received from the Serve By Example contact form.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:24px">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600;width:140px">Name</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${h.name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600">Email</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><a href="mailto:${h.email}">${h.email}</a></td></tr>
          ${venueName ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600">Venue</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${h.venueName}</td></tr>` : ""}
          ${venueType ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600">Type</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${h.venueType}</td></tr>` : ""}
        </table>
        <div style="margin-top:24px;padding:20px;background:#f9fafb;border-radius:8px;border-left:4px solid #0B2B1E">
          <p style="margin:0;font-weight:600;margin-bottom:8px">Message</p>
          <p style="margin:0;line-height:1.65;white-space:pre-wrap">${h.message}</p>
        </div>
        <p style="margin-top:24px;font-size:13px;color:#9ca3af">Reply directly to this email to respond to ${h.name}.</p>
      </div>
    `;

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
