export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, phone, company,
      teamSize, usesTraining, platformName, decisionMaker, intent,
    } = body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !company?.trim()) {
      return Response.json({ error: "Required fields missing." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@serve-by-example.com";
    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "info@serve-by-example.com";
    const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";

    if (!brevoApiKey) {
      console.error("Book-call API: BREVO_API_KEY not set");
      return Response.json(
        { error: "Booking is not configured. Please email us directly at info@serve-by-example.com." },
        { status: 500 },
      );
    }

    const row = (label: string, value: string) =>
      `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:600;width:160px;vertical-align:top">${label}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb">${value}</td></tr>`;

    const htmlContent = `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:32px 24px">
        <h2 style="margin-bottom:8px;color:#0B2B1E">New Book-a-Call Request</h2>
        <p style="color:#6b7280;margin-top:0">Submitted from the Serve By Example hero booking form.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:24px">
          ${row("Name", `${firstName.trim()} ${lastName.trim()}`)}
          ${row("Email", `<a href="mailto:${email.trim()}">${email.trim()}</a>`)}
          ${row("Phone", phone.trim())}
          ${row("Company", company.trim())}
          ${row("Team size", teamSize || "—")}
          ${row("Uses training?", usesTraining === "yes" ? `Yes${platformName?.trim() ? ` — ${platformName.trim()}` : ""}` : usesTraining === "no" ? "No" : "—")}
          ${row("Decision maker?", decisionMaker || "—")}
        </table>
        <div style="margin-top:24px;padding:20px;background:#f9fafb;border-radius:8px;border-left:4px solid #0B2B1E">
          <p style="margin:0;font-weight:600;margin-bottom:8px">What made them book a call</p>
          <p style="margin:0;line-height:1.65;white-space:pre-wrap">${intent?.trim() || "—"}</p>
        </div>
        <p style="margin-top:24px;font-size:13px;color:#9ca3af">Reply directly to this email to respond to ${firstName.trim()}.</p>
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
        replyTo: { email: email.trim(), name: `${firstName.trim()} ${lastName.trim()}` },
        subject: `Book-a-call request from ${firstName.trim()} ${lastName.trim()} — ${company.trim()}`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("Book-call API: Brevo send failed:", brevoRes.status, errText);
      return Response.json(
        { error: "Could not send your request. Please email us directly at info@serve-by-example.com." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Book-call API error:", err);
    return Response.json(
      { error: "Something went wrong. Please email us directly at info@serve-by-example.com." },
      { status: 500 },
    );
  }
}
