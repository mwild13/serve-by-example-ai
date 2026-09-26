import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";
import { getDemoScenario } from "@/lib/demo-scenarios";
import { evaluateScenarioResponse, validateScenarioInput } from "@/lib/scenario-evaluator";

export const dynamic = "force-dynamic";

// Per-isolate ceiling across all IPs: a circuit breaker for a flood from many
// addresses, which the per-IP limit can't see. Like every limit in
// lib/rate-limit.ts it's in-memory, so the true ceiling is this times the
// number of live isolates; the Cloudflare WAF rule and OpenAI budget cap in
// docs/handoff/security/2026-09-26-ai-token-abuse-and-request-races.md are
// the hard backstops.
const GLOBAL_LIMIT_PER_MINUTE = 60;

export async function POST(req: Request) {
  try {
    // Limits run before the body is read, so rejected floods cost almost nothing.
    const ip = getClientIp(req);
    if (!rateLimit(`demo-evaluate:ip:${ip}`, 5) || !rateLimit("demo-evaluate:global", GLOBAL_LIMIT_PER_MINUTE)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const read = await readJsonBody(req);
    if (!read.ok) return read.response;

    // The scenario is looked up by id; any `scenario` text in the body is ignored.
    const scenario = getDemoScenario(read.body.scenarioId);
    if (!scenario) {
      return Response.json({ error: "Unknown scenario." }, { status: 400 });
    }

    const { userResponse } = read.body;
    const inputError = validateScenarioInput(scenario, userResponse);
    if (inputError) {
      return Response.json({ error: inputError }, { status: 400 });
    }

    const result = await evaluateScenarioResponse(scenario, userResponse as string, "demo/evaluate", req.signal);
    if (!result) {
      return Response.json({ error: "Failed to evaluate your response. Please try again." }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    if (req.signal.aborted) {
      // Client disconnected mid-evaluation; nobody is listening for a response.
      return new Response(null, { status: 499 });
    }
    console.error("Demo evaluate error:", error);
    return Response.json({ error: "Something went wrong while evaluating the response." }, { status: 500 });
  }
}
