import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { evaluateScenarioResponse, validateScenarioInput } from "@/lib/scenario-evaluator";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`demo-evaluate:ip:${ip}`, 5)) {
      return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = (await req.json()) as { scenario?: unknown; userResponse?: unknown };
    const { scenario, userResponse } = body;

    const inputError = validateScenarioInput(scenario, userResponse);
    if (inputError) {
      return Response.json({ error: inputError }, { status: 400 });
    }

    const result = await evaluateScenarioResponse(scenario as string, userResponse as string, "demo/evaluate");
    if (!result) {
      return Response.json({ error: "Failed to evaluate your response. Please try again." }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Demo evaluate error:", error);
    return Response.json({ error: "Something went wrong while evaluating the response." }, { status: 500 });
  }
}
