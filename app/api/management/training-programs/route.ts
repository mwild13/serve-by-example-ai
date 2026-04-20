import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createTrainingProgram, deleteTrainingProgram, getManagementSnapshot } from "@/lib/management/service";
import type { NewTrainingProgramPayload } from "@/lib/management/types";

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<NewTrainingProgramPayload>;
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

    await createTrainingProgram(supabase, user.id, {
      name,
      roleTarget,
      description,
      dayPlan,
      venueId,
    });
    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create training program.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, supabase } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = (await req.json()) as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "Provide a program id to delete." }, { status: 400 });
    }

    await deleteTrainingProgram(supabase, user.id, id);
    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete training program.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}