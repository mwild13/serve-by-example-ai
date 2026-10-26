// Work that shouldn't keep the applicant waiting: AI marking and the
// manager's email. On Cloudflare the task runs after the response has gone,
// through the request's waitUntil (Workers allow about 30 seconds more). Off
// Cloudflare (next dev, tests) it runs before the response instead. A failure
// is logged and left: opening the report finishes anything left undone.
import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function afterResponse(label: string, task: () => Promise<void>): Promise<void> {
  const run = () =>
    task().catch((error: unknown) => {
      console.error(JSON.stringify({ event: "applicant_background_failed", label, message: error instanceof Error ? error.message : String(error) }));
    });
  let waitUntil: ((promise: Promise<unknown>) => void) | undefined;
  try {
    const { ctx } = getCloudflareContext();
    waitUntil = ctx?.waitUntil?.bind(ctx);
  } catch {
    // Not running on Cloudflare.
  }
  if (waitUntil) waitUntil(run());
  else await run();
}
