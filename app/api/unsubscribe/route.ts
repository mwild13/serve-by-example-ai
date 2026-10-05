import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { isLeadId } from '@/lib/toolkit-leads';

// Unsubscribe for /toolkit leads (to-do 2026-10-02, Phase 1).
//
// GET  — the link in the email. Shows a confirm button and changes nothing:
//        mail security scanners pre-fetch every link in an inbox, so a GET
//        that unsubscribed would silently opt people out on delivery.
// POST — does the unsubscribe. Called by the confirm button (form post) and
//        by mail clients' one-click unsubscribe (RFC 8058), which POSTs
//        straight to the List-Unsubscribe URL set in toolkit-capture.
//
// The lead id is the only credential. It is sent to the inbox and nowhere
// else. Any future nurture send must skip rows with unsubscribed_at set.

function page(title: string, body: string, status = 200): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>${title} — Serve By Example</title>
  <style>
    body { margin: 0; background: #f5f2e9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 420px; padding: 2.5rem; text-align: center; }
    h1 { font-size: 1.5rem; color: #172f22; margin-bottom: 0.75rem; }
    p { color: #7a9185; font-size: 0.95rem; line-height: 1.6; }
    a { color: #1f4e37; }
    button { margin-top: 1rem; padding: 0.75rem 1.5rem; border: none; border-radius: 999px; background: #1f4e37; color: #fffef9; font-size: 0.95rem; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    ${body}
  </div>
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

const contactLine = `If this was a mistake, <a href="mailto:info@servebyexample.co">contact us</a>.`;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!isLeadId(id)) {
    return page('Link not valid', `<h1>This link isn't valid.</h1><p>${contactLine}</p>`, 400);
  }
  // id is a validated UUID, so it is safe to place in the form action.
  return page(
    'Unsubscribe',
    `<h1>Unsubscribe from Serve By Example emails?</h1>
    <form method="POST" action="/api/unsubscribe?id=${id}">
      <button type="submit">Unsubscribe</button>
    </form>`
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`unsubscribe:ip:${ip}`, 10)) {
    return page('Try again', `<h1>Too many requests.</h1><p>Please try again in a minute.</p>`, 429);
  }

  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!isLeadId(id)) {
    return page('Link not valid', `<h1>This link isn't valid.</h1><p>${contactLine}</p>`, 400);
  }

  const now = new Date().toISOString();
  const { error } = await createSupabaseAdminClient()
    .from('toolkit_leads')
    .update({ unsubscribed_at: now, updated_at: now })
    .eq('id', id)
    .is('unsubscribed_at', null);

  if (error) {
    console.error(JSON.stringify({ event: 'unsubscribe_failed', message: error.message }));
    return page('Something went wrong', `<h1>We couldn't unsubscribe you.</h1><p>Please try again, or <a href="mailto:info@servebyexample.co">email us</a> and we'll remove you.</p>`, 500);
  }

  // Same response whether the id matched a lead or not, so the endpoint
  // can't be used to probe which ids exist.
  return page(
    'Unsubscribed',
    `<h1>You have been unsubscribed.</h1>
    <p>You will no longer receive emails from Serve By Example.<br />${contactLine}</p>`
  );
}
