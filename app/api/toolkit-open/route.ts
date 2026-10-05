import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { isLeadId } from '@/lib/toolkit-leads';

// Redirects to the Notion toolkit. When the link came from the delivery email
// (?id=<lead id>), records the first open on toolkit_leads. Tracking is best
// effort — the redirect never waits on or fails because of it.
export async function GET(req: NextRequest) {
  const notionUrl = process.env.NOTION_TOOLKIT_URL ?? 'https://servebyexample.co/toolkit';
  const id = req.nextUrl.searchParams.get('id');

  if (id && isLeadId(id) && rateLimit(`toolkit-open:ip:${getClientIp(req)}`, 20)) {
    const now = new Date().toISOString();
    const { error } = await createSupabaseAdminClient()
      .from('toolkit_leads')
      .update({ opened_at: now, updated_at: now })
      .eq('id', id)
      .is('opened_at', null);
    if (error) {
      console.error(JSON.stringify({ event: 'toolkit_open_track_failed', message: error.message }));
    }
  }

  return NextResponse.redirect(notionUrl, { status: 302 });
}
