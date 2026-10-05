import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { brandedEmailHtml, escapeHtml, formText } from "@/lib/email-template";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const SITE_URL = 'https://servebyexample.co';

/** Sends the toolkit delivery email. Returns true only if Brevo accepted it. */
async function sendToolkitEmail({ email, firstName, role, leadId }: {
  email: string;
  firstName: string;
  role: string;
  leadId: string;
}): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.warn('[toolkit-capture] BREVO_API_KEY not configured — email skipped.');
    return false;
  }

  let emailHookText = 'Optimize your operational staff onboarding checklists.';
  if (role === 'venue_manager') {
    emailHookText = 'Protect your site licensing framework and streamline your casual rosters floor execution.';
  } else if (role === 'owner_operator') {
    emailHookText = 'Isolate your labour expenditure risks and protect your bottom line operating standards.';
  }

  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?id=${leadId}`;
  const toolkitUrl = `${SITE_URL}/api/toolkit-open?id=${leadId}`;
  const name = escapeHtml(firstName);
  const textStyle = 'margin:0 0 14px;line-height:1.65;color:#172f22;font-size:15px';
  // Branded like the other Brevo sends (lib/email-template.ts). It used to be
  // text only, so it arrived with no logo or colours. textContent stays as
  // the plain-text part for clients that don't render HTML.
  const htmlContent = brandedEmailHtml({
    preheader: 'Your editable Notion SOP toolkit is ready.',
    heading: 'Your onboarding toolkit is ready',
    bodyHtml: `
      <p style="${textStyle}">Hi ${name},</p>
      <p style="${textStyle}">Thank you for downloading the Serve By Example Onboarding Framework.</p>
      <p style="${textStyle}">${escapeHtml(emailHookText)}</p>
      <p style="margin:24px 0">
        <a href="${toolkitUrl}" style="background:#1f4e37;color:#fffef9;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">Open the Notion toolkit</a>
      </p>
      <p style="${textStyle}">Cheers,<br />Mitch<br />Serve By Example</p>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#7a9185">
        You're receiving this because you requested the free toolkit at
        <a href="${SITE_URL}/toolkit" style="color:#a9812a">servebyexample.co/toolkit</a>.
        <a href="${unsubscribeUrl}" style="color:#a9812a">Unsubscribe</a>
      </p>`,
  });

  try {
    // Brevo v3 Transactional Email Endpoint
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Serve By Example Resources',
          email: 'info@servebyexample.co',
        },
        to: [{ email, name: firstName }],
        subject: `${firstName}, your onboarding compliance template is ready`,
        // RFC 8058 one-click unsubscribe: mail clients POST to this URL
        // directly, which app/api/unsubscribe handles.
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        htmlContent,
        textContent: `Hi ${firstName},\n\nThank you for downloading the Serve By Example Onboarding Framework.\n\n${emailHookText}\n\nAccess your complete editable Notion SOP toolkit here:\n${toolkitUrl}\n\nCheers,\n\nMitch\nServe By Example\nservebyexample.co\n\n---\nYou're receiving this because you requested the free toolkit at servebyexample.co/toolkit.\nUnsubscribe: ${unsubscribeUrl}`,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error(JSON.stringify({ event: 'toolkit_capture_failed', stage: 'deliver', lead_id: leadId, status: res.status }));
      return false;
    }
    return true;
  } catch (err) {
    console.error(JSON.stringify({ event: 'toolkit_capture_failed', stage: 'deliver', lead_id: leadId, message: err instanceof Error ? err.message : String(err) }));
    return false;
  }
}

export async function POST(request: Request) {
  // Public, unauthenticated and sends email, so it's capped per IP
  // (audit 2026-09-30, M6). In-memory per isolate — the edge WAF rule is
  // the hard ceiling.
  const ip = getClientIp(request);
  if (!rateLimit(`toolkit-capture:ip:${ip}`, 3)) {
    console.warn(JSON.stringify({ event: "toolkit_capture_rejected", reason: "rate_limited", ip }));
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  try {
    const read = await readJsonBody(request);
    if (!read.ok) return read.response;
    const body = read.body;
    const first_name = formText(body.first_name, 80);
    const email = formText(body.email, 254);
    const role = formText(body.role, 40);
    const utm_campaign = formText(body.utm_campaign, 120);

    // 1. Strict Validation Guardrails
    if (!first_name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing mandatory lead profile vectors.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address structure.' },
        { status: 400 }
      );
    }

    const validRoles = ['owner_operator', 'venue_manager', 'ops_manager'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid industry role assignment.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const firstName = first_name.trim();
    const admin = createSupabaseAdminClient();

    // 2. Persist first. The lead row is the record of the signup; the email
    //    is delivery on top of it. If the insert fails nothing is sent, so a
    //    lead can never exist only in Brevo's send log again (to-do
    //    2026-10-02). Re-submitting the same email updates the existing row;
    //    unsubscribed_at is deliberately left as the person set it.
    const { data: lead, error: leadError } = await admin
      .from('toolkit_leads')
      .upsert(
        {
          email: normalizedEmail,
          first_name: firstName,
          role,
          utm_campaign: utm_campaign || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    if (leadError || !lead) {
      console.error(JSON.stringify({ event: 'toolkit_capture_failed', stage: 'persist', message: leadError?.message }));
      return NextResponse.json({ error: 'Could not save your request. Please try again.' }, { status: 500 });
    }

    // 3. Deliver. Awaited, not fire-and-forget: on Cloudflare Workers a
    //    promise still pending when the response returns can be cancelled,
    //    so the old un-awaited fetch could drop emails silently. A failed
    //    send still returns success (the lead is saved and the success page
    //    links the toolkit directly); toolkit_delivered = false marks it for
    //    a re-send.
    const delivered = await sendToolkitEmail({ email: normalizedEmail, firstName, role, leadId: lead.id });
    if (delivered) {
      const now = new Date().toISOString();
      const { error: markError } = await admin
        .from('toolkit_leads')
        .update({ toolkit_delivered: true, delivered_at: now, updated_at: now })
        .eq('id', lead.id);
      if (markError) {
        console.error(JSON.stringify({ event: 'toolkit_capture_failed', stage: 'mark_delivered', lead_id: lead.id, message: markError.message }));
      }
    }

    // The lead id is NOT echoed here. It is the only credential the
    // unsubscribe link carries, so it goes to the inbox and nowhere else —
    // otherwise anyone could submit someone else's email and get back the
    // id that unsubscribes them.
    return NextResponse.json({
      success: true,
      redirect: `/toolkit/success?role=${role}`
    });

  } catch (error) {
    console.error('Global capture API pipeline crash:', error);
    return NextResponse.json(
      { error: 'Internal pipeline transmission failure.' },
      { status: 500 }
    );
  }
}