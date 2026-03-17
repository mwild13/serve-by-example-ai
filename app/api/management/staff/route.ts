import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createStaffMember, getManagementSnapshot } from "@/lib/management/service";
import type { NewStaffPayload, StaffRole } from "@/lib/management/types";

const VALID_ROLES: StaffRole[] = ["Bartender", "Floor", "Supervisor", "Manager", "New Staff"];

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeSupabaseError = error as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
    };

    const message = typeof maybeSupabaseError.message === "string" ? maybeSupabaseError.message : "";
    const code = typeof maybeSupabaseError.code === "string" ? maybeSupabaseError.code : "";
    const details = typeof maybeSupabaseError.details === "string" ? maybeSupabaseError.details : "";
    const hint = typeof maybeSupabaseError.hint === "string" ? maybeSupabaseError.hint : "";
    const detail = [message, details, hint].filter(Boolean).join(" | ").trim();

    if (code || detail) {
      return code ? `[${code}] ${detail || "Staff insert failed."}` : detail;
    }
  }

  if (error instanceof Error) {
    const supabaseError = error as Error & {
      code?: string;
      details?: string;
      hint?: string;
    };

    const detailParts = [supabaseError.message, supabaseError.details, supabaseError.hint].filter(Boolean);
    const detail = detailParts.join(" | ").trim();

    if (supabaseError.code) {
      return detail ? `[${supabaseError.code}] ${detail}` : `[${supabaseError.code}] ${supabaseError.message}`;
    }

    return detail || "Unable to add staff member.";
  }

  return "Unable to add staff member.";
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<NewStaffPayload>;
    const name = body.name?.trim();
    const role = body.role;
    const venueId = body.venueId?.trim();
    const email = body.email?.trim().toLowerCase();
    const sendInvite = Boolean(body.sendInvite);

    if (!name || !role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Provide a valid staff name and role." }, { status: 400 });
    }

    if (sendInvite && !email) {
      return NextResponse.json({ error: "Add an email address if you want to send an invite." }, { status: 400 });
    }

    let usedAdminInsertFallback = false;
    try {
      await createStaffMember(supabase, user.id, { name, role, venueId, email, sendInvite });
    } catch (primaryInsertError) {
      try {
        const admin = createSupabaseAdminClient();
        await createStaffMember(admin, user.id, { name, role, venueId, email, sendInvite });
        usedAdminInsertFallback = true;
      } catch {
        throw primaryInsertError;
      }
    }

    let inviteMessage: string | undefined;
    if (usedAdminInsertFallback) {
      inviteMessage = "Staff member added. A legacy database policy required admin fallback for this write.";
    }

    if (sendInvite && email) {
      try {
        const admin = createSupabaseAdminClient();
        const appOrigin = new URL(req.url).origin;
        const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${appOrigin}/login`,
          data: {
            display_name: name,
          },
        });

        if (inviteError) {
          inviteMessage = `Staff member added, but invite email failed: ${inviteError.message}`;
        } else {
          inviteMessage = `Invite sent to ${email}.`;
        }
      } catch (inviteSetupError) {
        inviteMessage =
          inviteSetupError instanceof Error
            ? `Staff member added, but invite setup is incomplete: ${inviteSetupError.message}`
            : "Staff member added, but invite setup is incomplete.";
      }
    }

    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json({ ...snapshot, inviteMessage });
  } catch (error) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}