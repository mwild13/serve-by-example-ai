import type { Instrumentation } from "next";
import { reportError } from "@/lib/report-error";

// Called by Next.js for an error thrown while rendering a page or running a
// route handler that nothing caught. Routes that catch their own errors report
// them where they are caught.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const hostHeader = request.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  await reportError(error, {
    route: context.routePath,
    url: host ? `https://${host}${request.path}` : undefined,
    digest: (error as { digest?: string }).digest,
    handled: false,
  });
};
