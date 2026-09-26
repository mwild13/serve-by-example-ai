import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { readJsonBody } from "@/lib/ai-guard";
import { evaluateScenarioResponse, validateScenarioInput } from "@/lib/scenario-evaluator";
import { resolveAccess, validateSession } from "@/lib/session";
import { getCookieValue, recordScenarioAttempt } from "@/lib/training-attempt";
import type { ConfidenceLevel } from "@/lib/mastery";
import { SCENARIOS, type Module } from "@/app/dashboard/_components/trainer/trainer-data";

// Prevent static generation for this route (requires API credentials at runtime)
export const dynamic = "force-dynamic";

// Scenario Training modules and their catalog ids (matches lib/mastery.ts
// LEGACY_MODULE_NAMES).
const MODULE_IDS: Record<Module, number> = { bartending: 1, sales: 2, management: 3 };
const VALID_CONFIDENCE: readonly ConfidenceLevel[] = ["low", "medium", "high"];

/**
 * Grades a Scenario Training response and records the attempt.
 *
 * The client sends which scenario it answered ({ module, scenarioIndex }),
 * never the scenario text or a score: the text is looked up here and the
 * score written to mastery is the one this route produced. This replaces the
 * old evaluate-then-POST-/api/training/save flow, where the browser posted
 * its own overallScore and anyone could forge compliance.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`evaluate:user:${user.id}`, 20) || !rateLimit(`evaluate:ip:${ip}`, 20)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const read = await readJsonBody(req);
    if (!read.ok) return read.response;
    const { module, scenarioIndex, userResponse } = read.body;
    const confidence = (read.body.confidence ?? "medium") as ConfidenceLevel;

    if (typeof module !== "string" || !Object.hasOwn(MODULE_IDS, module)) {
      return Response.json({ error: "Invalid module.", code: "INVALID_MODULE" }, { status: 400 });
    }
    const moduleName = module as Module;
    const scenario =
      typeof scenarioIndex === "number" && Number.isInteger(scenarioIndex)
        ? SCENARIOS[moduleName][scenarioIndex]
        : undefined;
    if (!scenario) {
      return Response.json({ error: "Invalid scenario index.", code: "INVALID_SCENARIO_INDEX" }, { status: 400 });
    }
    if (!VALID_CONFIDENCE.includes(confidence)) {
      return Response.json({ error: "Invalid confidence level.", code: "INVALID_CONFIDENCE" }, { status: 400 });
    }

    const inputError = validateScenarioInput(scenario.text, userResponse);
    if (inputError) {
      return Response.json({ error: inputError, code: "BAD_REQUEST" }, { status: 400 });
    }

    // The session check runs before the OpenAI call, so a displaced session
    // doesn't cost tokens.
    const admin = createSupabaseAdminClient();
    const browserSessionId = getCookieValue(req, "sbe_session_id");
    if (!browserSessionId) {
      return Response.json(
        { error: "Missing active session. Please sign in again.", code: "SESSION_REQUIRED" },
        { status: 401 },
      );
    }
    const sessionValidation = await validateSession(admin, user.id, browserSessionId);
    if (!sessionValidation.valid) {
      return Response.json(
        { error: "Session conflict detected. Please resume this device.", code: "SESSION_CONFLICT" },
        { status: 409 },
      );
    }
    // Users whose plan doesn't include the module (e.g. free tier) are still
    // graded, as before, but nothing is recorded — the same outcome as the
    // old flow, where their /api/training/save call was refused with a 403.
    const moduleId = MODULE_IDS[moduleName];
    const access = await resolveAccess(admin, user.id, user.email ?? "");
    const canRecord = access.allowedModules.includes(moduleId);

    // No req.signal here: once the response is graded it should be recorded
    // even if the client has gone (e.g. a phone switched apps mid-request).
    const result = await evaluateScenarioResponse(scenario.text, userResponse as string, "evaluate");
    if (!result) {
      return Response.json(
        { error: "Failed to evaluate your response. Please try again.", code: "UPSTREAM_PARSE_ERROR" },
        { status: 500 }
      );
    }

    if (!canRecord) {
      return Response.json({ ...result, saved: false, saveCode: "MODULE_ACCESS_DENIED" });
    }

    // The evaluation is still returned if recording fails, flagged saved:false
    // so the client can tell the user their progress wasn't stored.
    try {
      const attempt = await recordScenarioAttempt(admin, user, {
        moduleName,
        moduleId,
        scenarioIndex: scenarioIndex as number,
        overallScore: result.overallScore,
        confidence,
      });
      return Response.json({
        ...result,
        saved: true,
        mastery: {
          level: attempt.masteryLevel,
          previousLevel: attempt.previousLevel,
          levelChanged: attempt.levelChanged,
          spamGuarded: attempt.spamGuarded,
          eloRating: attempt.eloRating,
          eloDelta: attempt.eloDelta,
          isBridge: attempt.isBridge,
          consecutiveFails: attempt.consecutiveFails,
          confidenceAccuracy: attempt.confidenceAccuracy,
          nextReviewAt: attempt.nextReviewAt,
        },
      });
    } catch (saveError) {
      console.error("Evaluate: failed to record attempt:", saveError);
      return Response.json({ ...result, saved: false, saveCode: "TRAINING_SAVE_FAILED" });
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Something went wrong while evaluating the response.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
