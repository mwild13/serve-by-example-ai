export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, venueName, venueType, message, website } = body;

    // Honeypot — bots fill this invisible field
    if (website) {
      return Response.json({ ok: true });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
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
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@serve-by-example.com";
    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "noreply@serve-by-example.com";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("Contact API: BREVO_API_KEY not set");
      return Response.json(
        { error: "Contact form is not configured. Please email us directly at info@serve-by-example.com." },
        { status: 500 },
      );
    }

    const htmlContent = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
        <h2 style="margin-bottom:8px;color:#0B2B1E">New Contact Enquiry</h2>
        <p style="color:#6b7280;margin-top:0">Received from the Serve By Example contact form.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:24px">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600;width:140px">Name</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${name.trim()}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600">Email</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
          ${venueName?.trim() ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600">Venue</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${venueName.trim()}</td></tr>` : ""}
          ${venueType ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600">Type</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${venueType}</td></tr>` : ""}
        </table>
        <div style="margin-top:24px;padding:20px;background:#f9fafb;border-radius:8px;border-left:4px solid #0B2B1E">
          <p style="margin:0;font-weight:600;margin-bottom:8px">Message</p>
          <p style="margin:0;line-height:1.65;white-space:pre-wrap">${message.trim()}</p>
        </div>
        <p style="margin-top:24px;font-size:13px;color:#9ca3af">Reply directly to this email to respond to ${name.trim()}.</p>
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
        replyTo: { email: email.trim(), name: name.trim() },
        subject: `Contact enquiry from ${name.trim()}${venueName?.trim() ? ` — ${venueName.trim()}` : ""}`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("Contact API: Brevo send failed:", brevoRes.status, errText);
      return Response.json(
        { error: "Could not send your message. Please email us directly at info@serve-by-example.com." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return Response.json(
      { error: "Could not send your message. Please email us directly at info@serve-by-example.com." },
      { status: 500 },
    );
  }
}
