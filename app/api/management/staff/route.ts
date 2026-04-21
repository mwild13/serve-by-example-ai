import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createStaffMember, getManagementSnapshot } from "@/lib/management/service";
import type { NewStaffPayload, StaffRole } from "@/lib/management/types";

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
    const { user, supabase } = await getUserFromRequest(req);

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

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
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
    let inviteLink: string | undefined;
    let emailSent = false;

    if (usedAdminInsertFallback) {
      inviteMessage = "Staff member added. A legacy database policy required admin fallback for this write.";
    }

    if (sendInvite && email) {
      const admin = createSupabaseAdminClient();
      const appOrigin = new URL(req.url).origin;
      const redirectTo = `${appOrigin}/login`;

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
          // User may already exist — surface a clear message.
          const msg = linkError.message ?? "";
          if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
            inviteMessage = `${name} added. Note: ${email} already has a Serve by Example account — they can log in directly.`;
          } else {
            inviteMessage = `Staff member added. Could not generate invite link: ${msg}`;
          }
        } else {
          inviteLink = linkData?.properties?.action_link ?? undefined;

          // Step 2: Send invite email via Brevo API (direct — no Supabase SMTP needed).
          const brevoApiKey = process.env.BREVO_API_KEY;
          if (brevoApiKey && inviteLink) {
            try {
              const fromEmail = process.env.BREVO_FROM_EMAIL ?? "noreply@serve-by-example.com";
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
                      <p style="color:#555">Hi ${name},</p>
                      <p style="color:#555">You&apos;ve been added as a staff member on <strong>Serve By Example</strong>. Click the button below to set up your account and start your training.</p>
                      <p style="margin:32px 0">
                        <a href="${inviteLink}" style="background:#22c55e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Accept invitation</a>
                      </p>
                      <p style="color:#aaa;font-size:13px">If the button doesn&apos;t work, copy and paste this link into your browser:<br>${inviteLink}</p>
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
                inviteMessage = `Staff member added. Brevo email failed (${emailRes.status}): ${errBody}. Use the invite link below.`;
              }
            } catch (brevoErr) {
              inviteMessage = `Staff member added. Email send error: ${brevoErr instanceof Error ? brevoErr.message : "Unknown error"}. Use the invite link below.`;
            }
          } else {
            // Fallback: try Supabase inviteUserByEmail if no Brevo key configured.
            try {
              const { error: emailError } = await admin.auth.admin.inviteUserByEmail(email, {
                redirectTo,
                data: { display_name: name },
              });

              if (emailError) {
                inviteMessage = `Staff member added. Set BREVO_API_KEY in Cloudflare env to enable automatic emails, or use the invite link below to onboard ${name}.`;
              } else {
                emailSent = true;
                inviteMessage = `Invite email sent to ${email}.`;
              }
            } catch {
              inviteMessage = `Staff member added. Share the invite link below with ${name} directly.`;
            }
          }

          // Persist invite link to pending_invites so managers can retrieve it later.
          try {
            await admin.from("pending_invites").insert({
              manager_user_id: user.id,
              staff_name: name,
              email,
              invite_link: inviteLink,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
          } catch {
            // Non-blocking — pending_invites table may not exist yet.
          }
        }
      } catch (linkSetupError) {
        inviteMessage =
          linkSetupError instanceof Error
            ? `Staff member added, but invite setup failed: ${linkSetupError.message}`
            : "Staff member added, but invite setup is incomplete.";
      }
    }

    const snapshot = await getManagementSnapshot(supabase, user.id);

    return NextResponse.json({ ...snapshot, inviteMessage, inviteLink, emailSent });
  } catch (error) {
    const code = getErrorCode(error);
    const message = getErrorMessage(error);
    const lowered = message.toLowerCase();
    const isConflict = code === "23505" || lowered.includes("duplicate") || lowered.includes("already");
    return NextResponse.json({ error: message }, { status: isConflict ? 409 : 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const staffId = url.searchParams.get("staffId");
    if (!staffId) {
      return NextResponse.json({ error: "staffId is required." }, { status: 400 });
    }

    // Use admin client to bypass RLS
    const admin = createSupabaseAdminClient();
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