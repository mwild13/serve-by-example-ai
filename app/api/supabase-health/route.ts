import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase-server';

export async function GET(req: Request) {
  // Internal diagnostic endpoint — require authentication
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    // Check for scenario_mastery table and a few critical columns
    const { error } = await admin
      .from('scenario_mastery')
      .select('id')
      .limit(1);
    if (error) {
      // Generic error message, no schema details exposed
      return NextResponse.json({ status: 'error', message: 'Database check failed.' }, { status: 500 });
    }
    // Optionally check venue_staff columns as well
    const { error: staffError } = await admin
      .from('venue_staff')
      .select('id')
      .limit(1);
    if (staffError) {
      return NextResponse.json({ status: 'error', message: 'Database check failed.' }, { status: 500 });
    }
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: 'Database check failed.' }, { status: 500 });
  }
}
