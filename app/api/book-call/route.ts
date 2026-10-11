import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { EMAIL_SMALL_STYLE, EMAIL_TEXT_STYLE, brandedEmailHtml, emailFieldTableHtml, emailNoteHtml, escapeHtml, formText } from "@/lib/email-template";

export async function POST(req: Request) {
  // Public, unauthenticated and sends email, so it's capped per IP
  // (audit 2026-09-30, M6). In-memory per isolate — the edge WAF rule is
  // the hard ceiling.
  const ip = getClientIp(req);
  if (!rateLimit(`book-call:ip:${ip}`, 3)) {
    console.warn(JSON.stringify({ event: "book_call_rejected", reason: "rate_limited", ip }));
    return Response.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  try {
    const read = await readJsonBody(req);
    if (!read.ok) return read.response;
    const body = read.body;
    const firstName = formText(body.firstName, 80);
    const lastName = formText(body.lastName, 80);
    const email = formText(body.email, 254);
    const phone = formText(body.phone, 40);
    const company = formText(body.company, 160);
    const teamSize = formText(body.teamSize, 40);
    const usesTraining = formText(body.usesTraining, 10);
    const platformName = formText(body.platformName, 120);
    const decisionMaker = formText(body.decisionMaker, 40);
    const intent = formText(body.intent, 3000);

    if (!firstName || !lastName || !email || !phone || !company) {
      return Response.json({ error: "Required fields missing." }, { status: 400 });
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
      console.error("Book-call API: BREVO_API_KEY not set");
      return Response.json(
        { error: "Booking is not configured. Please email us directly at info@servebyexample.co." },
        { status: 500 },
      );
    }

    // Values are escaped here, once: this email goes to our own inbox, and a
    // form field used to be able to inject markup (links, fake buttons) into it.
    const e = escapeHtml;
    const htmlContent = brandedEmailHtml({
      preheader: `From ${e(firstName)} ${e(lastName)}, ${e(company)}`,
      heading: "New book-a-call request",
      bodyHtml: `
        <p style="${EMAIL_TEXT_STYLE}">Submitted from the Serve By Example booking form.</p>
        ${emailFieldTableHtml([
          ["Name", `${e(firstName)} ${e(lastName)}`],
          ["Email", `<a href="mailto:${e(email)}" style="color:#1f4e37">${e(email)}</a>`],
          ["Phone", e(phone)],
          ["Company", e(company)],
          ["Team size", e(teamSize) || "Not given"],
          ["Uses training?", usesTraining === "yes" ? `Yes${platformName ? `: ${e(platformName)}` : ""}` : usesTraining === "no" ? "No" : "Not given"],
          ["Decision maker?", e(decisionMaker) || "Not given"],
        ])}
        ${emailNoteHtml("What made them book a call", e(intent) || "Not given")}
        <p style="${EMAIL_SMALL_STYLE}">Reply to this email to respond to ${e(firstName)}.</p>
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
        replyTo: { email, name: `${firstName} ${lastName}` },
        subject: `Book-a-call request from ${firstName} ${lastName} – ${company}`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("Book-call API: Brevo send failed:", brevoRes.status, errText);
      return Response.json(
        { error: "Could not send your request. Please email us directly at info@servebyexample.co." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Book-call API error:", err);
    return Response.json(
      { error: "Something went wrong. Please email us directly at info@servebyexample.co." },
      { status: 500 },
    );
  }
}
