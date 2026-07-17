import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();

  // Get all staff IDs for this manager first
  const { data: staffRows } = await admin
    .from("venue_staff")
    .select("id")
    .eq("manager_user_id", user.id);

  const staffIds = (staffRows ?? []).map((r: { id: string }) => r.id);
  if (staffIds.length === 0) return NextResponse.json({ certs: [] });

  const { data, error } = await admin
    .from("venue_staff_certifications")
    .select("id, venue_staff_id, cert_name, cert_number, expiry_date, notes, created_at")
    .in("venue_staff_id", staffIds)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ certs: data ?? [] });
}

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const venueStaffId = typeof body.venueStaffId === "string" ? body.venueStaffId.trim() : null;
  const certName = typeof body.certName === "string" ? body.certName.trim() : null;
  const certNumber = typeof body.certNumber === "string" ? body.certNumber.trim() || null : null;
  const expiryDate = typeof body.expiryDate === "string" ? body.expiryDate || null : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

  if (!venueStaffId) return NextResponse.json({ error: "venueStaffId is required" }, { status: 400 });
  if (!certName) return NextResponse.json({ error: "certName is required" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Verify the staff member belongs to this manager
  const { data: staffRow } = await admin
    .from("venue_staff")
    .select("id")
    .eq("id", venueStaffId)
    .eq("manager_user_id", user.id)
    .single();

  if (!staffRow) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

  const { data, error } = await admin
    .from("venue_staff_certifications")
    .insert({ venue_staff_id: venueStaffId, cert_name: certName, cert_number: certNumber, expiry_date: expiryDate, notes })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cert: data });
}

export async function DELETE(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const certId = url.searchParams.get("id");
  if (!certId) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Scope delete to manager's own staff via subquery check
  const { data: cert } = await admin
    .from("venue_staff_certifications")
    .select("id, venue_staff_id")
    .eq("id", certId)
    .single();

  if (!cert) return NextResponse.json({ error: "Cert not found" }, { status: 404 });

  const { data: staffRow } = await admin
    .from("venue_staff")
    .select("id")
    .eq("id", cert.venue_staff_id)
    .eq("manager_user_id", user.id)
    .single();

  if (!staffRow) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { error } = await admin
    .from("venue_staff_certifications")
    .delete()
    .eq("id", certId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
