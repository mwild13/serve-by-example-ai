import { NextResponse } from "next/server";
import { requireManager } from "@/lib/management/auth";
import { readJsonBody } from "@/lib/ai-guard";

const MAX_FIELD_CHARS = 200;
const MAX_NOTES_CHARS = 2000;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-certifications" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;


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

  if (error) {
    console.error("[certifications]", error);
    return NextResponse.json({ error: "Certification request failed." }, { status: 500 });
  }
  return NextResponse.json({ certs: data ?? [] });
}

export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-certifications" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
  if (!read.ok) return read.response;
  const body = read.body as Record<string, unknown>;
  const venueStaffId = typeof body.venueStaffId === "string" ? body.venueStaffId.trim() : null;
  const certName = typeof body.certName === "string" ? body.certName.trim() : null;
  const certNumber = typeof body.certNumber === "string" ? body.certNumber.trim() || null : null;
  const expiryDate = typeof body.expiryDate === "string" ? body.expiryDate || null : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

  if (!venueStaffId) return NextResponse.json({ error: "venueStaffId is required" }, { status: 400 });
  if (!certName) return NextResponse.json({ error: "certName is required" }, { status: 400 });
  if (certName.length > MAX_FIELD_CHARS || (certNumber?.length ?? 0) > MAX_FIELD_CHARS || (notes?.length ?? 0) > MAX_NOTES_CHARS) {
    return NextResponse.json({ error: "One of the certification fields is too long." }, { status: 400 });
  }
  if (expiryDate && !DATE_REGEX.test(expiryDate)) {
    return NextResponse.json({ error: "expiryDate must be YYYY-MM-DD" }, { status: 400 });
  }


  // Verify the staff member belongs to this manager
  const { data: staffRow } = await admin
    .from("venue_staff")
    .select("id")
    .eq("id", venueStaffId)
    .eq("manager_user_id", user.id)
    .maybeSingle();

  if (!staffRow) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

  const { data, error } = await admin
    .from("venue_staff_certifications")
    .insert({ venue_staff_id: venueStaffId, cert_name: certName, cert_number: certNumber, expiry_date: expiryDate, notes })
    .select()
    .single();

  if (error) {
    console.error("[certifications]", error);
    return NextResponse.json({ error: "Certification request failed." }, { status: 500 });
  }
  return NextResponse.json({ cert: data });
}

export async function DELETE(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-certifications" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  const url = new URL(req.url);
  const certId = url.searchParams.get("id");
  if (!certId) return NextResponse.json({ error: "id is required" }, { status: 400 });


  // Scope delete to manager's own staff via subquery check
  const { data: cert } = await admin
    .from("venue_staff_certifications")
    .select("id, venue_staff_id")
    .eq("id", certId)
    .maybeSingle();

  if (!cert) return NextResponse.json({ error: "Cert not found" }, { status: 404 });

  const { data: staffRow } = await admin
    .from("venue_staff")
    .select("id")
    .eq("id", cert.venue_staff_id)
    .eq("manager_user_id", user.id)
    .maybeSingle();

  if (!staffRow) return NextResponse.json({ error: "Cert not found" }, { status: 404 });

  const { error } = await admin
    .from("venue_staff_certifications")
    .delete()
    .eq("id", certId);

  if (error) {
    console.error("[certifications]", error);
    return NextResponse.json({ error: "Certification request failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
