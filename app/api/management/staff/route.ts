import { NextResponse } from "next/server";
import { ManagementAccessError, requireManager } from "@/lib/management/auth";
import { createStaffMember, updateStaffMember, getManagementSnapshot } from "@/lib/management/service";
import { escapeHtml } from "@/lib/email-template";
import type { NewStaffPayload, StaffRole, AustralianState } from "@/lib/management/types";
import { readJsonBody } from "@/lib/ai-guard";

const VALID_ROLES: StaffRole[] = ["Bartender", "Floor", "Supervisor", "Manager", "New Staff"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    const maybeCode = (error as { code?: unknown }).code;
    if (typeof maybeCode === "string") return maybeCode;
  }
  if (error instanceof Error && typeof (error as Error & { code?: string }).code === "string") {
    return (error as Error & { code?: string }).code;
  }
  return undefined;
}

// Writes run on the admin client behind requireManager(), which checks the
// caller's role and session before anything is written; every write is
// scoped to manager_user_id = caller. Clients can no longer write venue_staff
// directly (audit 2026-09-30, Phase 2).

export async function POST(req: Request) {
  // Adding staff can send an email from our domain, so its limit is tighter
  // than the other management writes.
  const gate = await requireManager(req, { rateKey: "mgmt-staff-create", limit: 10 });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const read = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const body = read.body as Partial<NewStaffPayload>;
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

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    await createStaffMember(admin, user.id, { name, role, venueId, email, sendInvite });

    let inviteMessage: string | undefined;
    let inviteLink: string | undefined;
    let emailSent = false;

    if (sendInvite && email) {
      // Prefer NEXT_PUBLIC_SITE_URL so the redirectTo is always the real public
      // domain. Falling back to req.url origin can produce an internal Cloudflare
      // worker address that isn't in Supabase's Redirect URLs allowlist.
      const appOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
      const redirectTo = `${appOrigin}/login`;
      // The Supabase invite action link signs whoever opens it in as `email`,
      // so it only ever goes into the email itself (which proves the
      // recipient owns the address). It used to be returned to the caller
      // and stored in pending_invites, which let any account mint a working
      // login for an email it didn't own. The manager's copy-link fallback
      // gets the plain signup page instead: the staff member signs up with
      // the invited email, confirms it, and is matched to this invite.
      inviteLink = redirectTo;

      // Step 1: Generate the invite link (works regardless of SMTP config).
      try {
        const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
          type: "invite",
          email,
          options: {
            redirectTo,
            data: { display_name: name },
          },
        });

        if (linkError) {
          const msg = linkError.message ?? "";
          console.error("[staff/invite] generateLink failed:", msg, "| redirectTo:", redirectTo);
          if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
            inviteMessage = `${name} added. Note: ${email} already has a Serve by Example account. They can log in directly.`;
          } else {
            inviteMessage = `Staff member added. Could not generate invite link: ${msg}`;
          }
        } else {
          const actionLink = linkData?.properties?.action_link ?? undefined;

          // Step 2: Send invite email via Brevo API (direct — no Supabase SMTP needed).
          const brevoApiKey = process.env.BREVO_API_KEY;
          if (!brevoApiKey) {
            console.error("[staff/invite] BREVO_API_KEY is not set in environment. Add it to Cloudflare Pages env vars to enable automatic invite emails.");
          }

          if (brevoApiKey && actionLink) {
            try {
              const fromEmail = "info@servebyexample.co";
              const fromName = process.env.BREVO_FROM_NAME ?? "Serve By Example";
              const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                  "api-key": brevoApiKey,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  sender: { name: fromName, email: fromEmail },
                  to: [{ email, name }],
                  subject: `You've been invited to join ${fromName}`,
                  htmlContent: `
                    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
                      <h2 style="margin-bottom:8px">You&apos;ve been invited!</h2>
                      <p style="color:#555">Hi ${escapeHtml(name)},</p>
                      <p style="color:#555">You&apos;ve been added as a staff member on <strong>Serve By Example</strong>. Click the button below to set up your account and start your training.</p>
                      <p style="margin:32px 0">
                        <a href="${escapeHtml(actionLink)}" style="background:#22c55e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Accept invitation</a>
                      </p>
                      <p style="color:#aaa;font-size:13px">If the button doesn&apos;t work, copy and paste this link into your browser:<br>${escapeHtml(actionLink)}</p>
                      <p style="color:#aaa;font-size:13px">This link expires in 7 days.</p>
                    </div>
                  `,
                }),
              });

              if (emailRes.ok) {
                emailSent = true;
                inviteMessage = `Invite email sent to ${email}.`;
              } else {
                const errBody = await emailRes.text();
                console.error(`[staff/invite] Brevo send failed (${emailRes.status}):`, errBody, "| from:", fromEmail);
                inviteMessage = `Staff member added, but the invite email failed (${emailRes.status}). Share the signup link below and ask ${name} to sign up with ${email}.`;
              }
            } catch (brevoErr) {
              console.error("[staff/invite] Brevo fetch threw:", brevoErr);
              inviteMessage = `Staff member added, but the invite email could not be sent. Share the signup link below and ask ${name} to sign up with ${email}.`;
            }
          } else {
            // Fallback: try Supabase inviteUserByEmail if no Brevo key configured.
            try {
              const { error: emailError } = await admin.auth.admin.inviteUserByEmail(email, {
                redirectTo,
                data: { display_name: name },
              });

              if (emailError) {
                console.error("[staff/invite] Supabase inviteUserByEmail failed:", emailError.message);
                inviteMessage = `Staff member added. Set BREVO_API_KEY in Cloudflare env to enable automatic emails, or share the signup link below and ask ${name} to sign up with ${email}.`;
              } else {
                emailSent = true;
                inviteMessage = `Invite email sent to ${email}.`;
              }
            } catch (supabaseInviteErr) {
              console.error("[staff/invite] Supabase inviteUserByEmail threw:", supabaseInviteErr);
              inviteMessage = `Staff member added. Share the signup link below and ask ${name} to sign up with ${email}.`;
            }
          }
        }
      } catch (linkSetupError) {
        console.error("[staff/invite] Unexpected error in invite setup:", linkSetupError);
        inviteMessage = "Staff member added, but the invite couldn't be set up.";
      }
    }

    const snapshot = await getManagementSnapshot(admin, user.id);

    return NextResponse.json({ ...snapshot, inviteMessage, inviteLink, emailSent });
  } catch (error) {
    if (error instanceof ManagementAccessError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    // Database details (codes, constraint names, hints) stay in the server
    // log; the client gets a plain message (audit 2026-09-30, L5).
    console.error("[staff POST]", error);
    if (getErrorCode(error) === "23505") {
      return NextResponse.json({ error: "That staff member is already on this venue's roster." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to add staff member." }, { status: 400 });
  }
}

const VALID_AU_STATES: AustralianState[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"];

export async function PATCH(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-staff" });
  if (!gate.ok) return gate.response;
  const { user, admin, assertOwnsStaff } = gate.ctx;

  try {
    const read2 = await readJsonBody(req, undefined, { requireJsonContentType: false });
    if (!read2.ok) return read2.response;
    const body = read2.body as Record<string, unknown>;
    const staffId = typeof body.staffId === "string" ? body.staffId.trim() : null;

    if (!staffId) {
      return NextResponse.json({ error: "staffId is required" }, { status: 400 });
    }

    const updates: Parameters<typeof updateStaffMember>[3] = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      updates.name = name;
    }

    if (typeof body.role === "string") {
      if (!VALID_ROLES.includes(body.role as StaffRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updates.role = body.role as StaffRole;
    }

    if ("rsaExpiryDate" in body) {
      updates.rsaExpiryDate = typeof body.rsaExpiryDate === "string" ? body.rsaExpiryDate : null;
    }

    if (typeof body.rsaJurisdiction === "string") {
      if (!VALID_AU_STATES.includes(body.rsaJurisdiction as AustralianState)) {
        return NextResponse.json({ error: "Invalid AU state" }, { status: 400 });
      }
      updates.rsaJurisdiction = body.rsaJurisdiction;
    }

    if ("fssExpiryDate" in body) {
      updates.fssExpiryDate = typeof body.fssExpiryDate === "string" ? body.fssExpiryDate : null;
    }

    if (typeof body.fssOnSiteCopy === "boolean") {
      updates.fssOnSiteCopy = body.fssOnSiteCopy;
    }

    if (typeof body.isJunior === "boolean") {
      updates.isJunior = body.isJunior;
    }

    if ("managerNotes" in body) {
      updates.managerNotes = typeof body.managerNotes === "string" ? body.managerNotes : null;
    }

    await assertOwnsStaff(staffId);
    await updateStaffMember(admin, user.id, staffId, updates);

    const snapshot = await getManagementSnapshot(admin, user.id);
    return NextResponse.json(snapshot);
  } catch (error) {
    if (error instanceof ManagementAccessError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("[staff PATCH]", error);
    return NextResponse.json({ error: "Update failed." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-staff" });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const url = new URL(req.url);
    const staffId = url.searchParams.get("staffId");
    if (!staffId) {
      return NextResponse.json({ error: "staffId is required." }, { status: 400 });
    }

    const { error } = await admin
      .from("venue_staff")
      .delete()
      .eq("manager_user_id", user.id)
      .eq("id", staffId);

    if (error) throw error;

    const snapshot = await getManagementSnapshot(admin, user.id);
    return NextResponse.json(snapshot);
  } catch (err) {
    console.error("Delete staff error:", err);
    return NextResponse.json({ error: "Could not delete staff member." }, { status: 500 });
  }
}