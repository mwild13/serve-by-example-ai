import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (id) {
    // Non-blocking — don't delay the redirect waiting for DB confirmation
    const db = createSupabaseAdminClient();
    void db.from('toolkit_leads')
      .update({ toolkit_delivered: true })
      .eq('id', id)
      .then(
        () => {},
        (err: unknown) => console.error('[toolkit-open] DB update failed:', err)
      );
  }

  const notionUrl = process.env.NOTION_TOOLKIT_URL ?? 'https://servebyexample.co/toolkit';

  return NextResponse.redirect(notionUrl, { status: 302 });
}
