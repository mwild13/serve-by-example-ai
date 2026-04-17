import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const admin = createSupabaseAdminClient();
  // Check for scenario_mastery table and a few critical columns
  const { data, error } = await admin
    .from('scenario_mastery')
    .select('id, user_id, module, mastery_level')
    .limit(1);
  if (error) {
    return NextResponse.json({ status: 'error', message: 'Supabase schema missing or reset.', error: error.message }, { status: 500 });
  }
  // Optionally check venue_staff columns as well
  const { error: staffError } = await admin
    .from('venue_staff')
    .select('id, mastery_status, elo_rating')
    .limit(1);
  if (staffError) {
    return NextResponse.json({ status: 'error', message: 'venue_staff table or columns missing.', error: staffError.message }, { status: 500 });
  }
  return NextResponse.json({ status: 'ok' });
}
