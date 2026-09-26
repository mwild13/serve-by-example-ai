import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getUserFromRequest } from "@/lib/supabase-server";
import { syncMasteryToVenueStaff, markModuleMastered } from "@/lib/mastery";
import { resolveAccess, validateSession } from "@/lib/session";
import { VERIFY_QUESTIONS } from "@/lib/verify-questions";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCookieValue, maybeMarkTrialActivated } from "@/lib/training-attempt";

const VERIFY_PASS_THRESHOLD = 4; // must match ModuleVerify PASS_THRESHOLD

// Legacy 3-module string names (backward compat)
const LEGACY_MODULES = ["bartending", "sales", "management"] as const;
type LegacyModule = (typeof LEGACY_MODULES)[number];
const LEGACY_MODULE_ID: Record<LegacyModule, number> = { bartending: 1, sales: 2, management: 3 };

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // V4 priority-1 fix (2026-08-21): this write path had no rate limiting.
    // 20/min matches the "text-route norm" this same file 08 established for
    // evaluate/arena (dual user+IP, same shape as arena/evaluate/route.ts).
    const ip = getClientIp(req);
    if (!rateLimit(`training-save:user:${user.id}`, 20) || !rateLimit(`training-save:ip:${ip}`, 20)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    const body = await req.json();

    // This route only handles the ModuleVerify quiz, whose answers are
    // re-checked against the question bank below. Scenario Training scores
    // are recorded by /api/evaluate when it grades the response — a score
    // in this body is never trusted (it used to be, and let any signed-in
    // user forge mastery). See
    // docs/handoff/security/2026-09-26-ai-token-abuse-and-request-races.md.
    const verifyPassed = Boolean(body.verifyPassed);
    if (!verifyPassed) {
      return NextResponse.json(
        {
          error: "Scenario scores are recorded when your response is evaluated. Please refresh the page.",
          code: "SCORE_SUBMISSION_REMOVED",
        },
        { status: 410 },
      );
    }

    // Support both new numeric moduleId and legacy string module name
    const rawModuleId = body.moduleId != null ? Number(body.moduleId) : null;
    const rawModuleName = body.module as string | undefined;

    let moduleId: number;
    if (rawModuleId != null && Number.isFinite(rawModuleId) && rawModuleId >= 1 && rawModuleId <= 100) {
      moduleId = rawModuleId;
    } else if (rawModuleName && LEGACY_MODULES.includes(rawModuleName as LegacyModule)) {
      moduleId = LEGACY_MODULE_ID[rawModuleName as LegacyModule];
    } else {
      return NextResponse.json({ error: "Invalid module.", code: "INVALID_MODULE" }, { status: 400 });
    }

    // ── Tier-based access gate ─────────────────────────────────
    const admin = createSupabaseAdminClient();

    // ── Session displacement check for protected write route ───
    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return NextResponse.json(
        { error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" },
        { status: 401 },
      );
    }

    const sessionValidation = await validateSession(admin, user.id, browserSessionId);
    if (!sessionValidation.valid) {
      return NextResponse.json(
        { error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" },
        { status: 409 },
      );
    }

    const access = await resolveAccess(admin, user.id, user.email ?? "");
    if (!access.allowedModules.includes(moduleId)) {
      return NextResponse.json(
        { error: "Your current plan does not include this module. Please upgrade.", code: "MODULE_ACCESS_DENIED" },
        { status: 403 },
      );
    }

    // ── V3 Verify pass branch ─────────────────────────────────
    // ModuleVerify posts { verifyPassed: true, answers: [{id, answer}] }.
    // Validate submitted answers server-side against the static question bank
    // before writing is_mastered — never trust the client's score directly.
    const questions = VERIFY_QUESTIONS[moduleId];
    const rawAnswers: unknown[] = Array.isArray(body.answers) ? body.answers : [];

    // Each question counts once, so one correct answer repeated N times
    // can't be passed off as N correct answers.
    const correctIndexes = new Set<number>();
    for (const entry of questions ? rawAnswers : []) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Partial<{ id: string; answer: string }>;
      if (typeof e.id !== "string" || typeof e.answer !== "string") continue;
      const idx = parseInt(e.id.split("-").pop() ?? "", 10);
      if (isNaN(idx) || idx < 0 || idx >= questions.length) continue;
      if (questions[idx].answer.toLowerCase() === e.answer.toLowerCase()) correctIndexes.add(idx);
    }
    const validatedCount = correctIndexes.size;

    if (validatedCount < VERIFY_PASS_THRESHOLD) {
      return NextResponse.json({ error: "Quiz not passed.", code: "QUIZ_NOT_PASSED" }, { status: 403 });
    }

    const result = await markModuleMastered(admin, {
      userId: user.id,
      moduleId,
      consecutiveCorrect: validatedCount,
    });
    if (user.email) {
      await syncMasteryToVenueStaff(admin, user.id, user.email);
      await maybeMarkTrialActivated(admin, user.email);
    }

    // ── SBE Elite badge check (only on a fresh mastery, once per lifetime) ──
    // Guard: only runs if this module was not already mastered and the user
    // hasn't yet received their Elite badge, preventing infinite increments.
    if (!result.alreadyMastered) {
      const { data: profile } = await admin
        .from("profiles")
        .select("all_modules_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.all_modules_completed) {
        const { count } = await admin
          .from("scenario_mastery")
          .select("module_id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_mastered", true)
          .is("archived_at", null);

        if ((count ?? 0) >= 20) {
          await admin
            .from("profiles")
            .update({ sbe_elite_number: 1, all_modules_completed: true })
            .eq("id", user.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      v3: {
        isMastered: result.isMastered,
        alreadyMastered: result.alreadyMastered,
        moduleId,
      },
    });
  } catch (error) {
    console.error("Training save error:", error);
    return NextResponse.json(
      { error: "Failed to save training progress.", code: "TRAINING_SAVE_FAILED" },
      { status: 500 },
    );
  }
}
