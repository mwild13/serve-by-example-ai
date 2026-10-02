import { NextResponse } from "next/server";
import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { createTrainingProgram, deleteTrainingProgram, getManagementSnapshot } from "@/lib/management/service";
import type { NewTrainingProgramPayload } from "@/lib/management/types";
import { readJsonBody } from "@/lib/ai-guard";

// Writes run on the admin client behind requireManager(), which checks the
// caller's role and session; the service functions scope every write to the
// caller's own venues/rows. Clients can no longer write training_programs
// directly (audit 2026-09-30, Phase 2).

export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-programs" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const body = read.body as Partial<NewTrainingProgramPayload>;
    const name = body.name?.trim();
    const roleTarget = body.roleTarget?.trim();
    const description = body.description?.trim();
    const venueId = body.venueId?.trim();
    const dayPlan = Array.isArray(body.dayPlan)
      ? body.dayPlan.map((item) => item.trim()).filter(Boolean)
      : [];

    if (!name || !roleTarget || !description || dayPlan.length === 0) {
      return NextResponse.json(
        { error: "Provide a program name, role target, description and at least one day-plan step." },
        { status: 400 },
      );
    }

    await createTrainingProgram(admin, user.id, {
      name,
      roleTarget,
      description,
      dayPlan,
      venueId,
    });
    const snapshot = await getManagementSnapshot(admin, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    return managementErrorResponse(error, "Unable to create training program.", "training-programs POST");
  }
}

export async function DELETE(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-programs" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const read2 = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read2.ok) return read2.response;
    const { id } = read2.body as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "Provide a program id to delete." }, { status: 400 });
    }

    await deleteTrainingProgram(admin, user.id, id);
    const snapshot = await getManagementSnapshot(admin, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    return managementErrorResponse(error, "Unable to delete training program.", "training-programs DELETE");
  }
}
