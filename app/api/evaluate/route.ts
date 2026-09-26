import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserFromRequest } from "@/lib/supabase-server";
import { evaluateScenarioResponse, validateScenarioInput } from "@/lib/scenario-evaluator";

// Prevent static generation for this route (requires API credentials at runtime)
export const dynamic = "force-dynamic";

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

    const body = (await req.json()) as { scenario?: unknown; userResponse?: unknown };
    const { scenario, userResponse } = body;

    const inputError = validateScenarioInput(scenario, userResponse);
    if (inputError) {
      return Response.json({ error: inputError, code: "BAD_REQUEST" }, { status: 400 });
    }

    const result = await evaluateScenarioResponse(scenario as string, userResponse as string, "evaluate");
    if (!result) {
      return Response.json(
        { error: "Failed to evaluate your response. Please try again.", code: "UPSTREAM_PARSE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Something went wrong while evaluating the response.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
