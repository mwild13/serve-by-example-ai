"use client";

import { use, type ComponentProps } from "react";
import ManagerControlCenter from "./ManagerControlCenter";
import type { ManagementSnapshot } from "@/lib/management/types";

// Thin Suspense boundary target. Unwraps the snapshot promise via React 19's
// use() so app/management/dashboard/page.tsx can start getManagementSnapshot()
// server-side WITHOUT an `await` blocking the whole page render.
//
// This matters: an earlier version of page.tsx did `await getManagementSnapshot(...)`
// directly, which stalled the entire page shell behind that one query (see
// commit ae46df6, "perf(stage-1): Unblock dashboard render") — that's why it
// was moved to a client-side fetch-on-mount instead. This restores the
// server-side start (no extra client round trip, the query begins the
// instant the request arrives) while keeping the non-blocking behavior:
// Suspense only gates this one subtree, and ManagerControlCenter itself is
// untouched — it already accepts `initialSnapshot` and already skips its own
// client fetch when one is provided.
//
// If the promise rejects (a genuine DB/provisioning failure — see the
// error-swallowing fix in lib/management/service.ts), it throws during
// render and is caught by app/management/dashboard/error.tsx.
export default function ManagerControlCenterLoader({
  snapshotPromise,
  ...rest
}: {
  snapshotPromise: Promise<ManagementSnapshot>;
} & Omit<ComponentProps<typeof ManagerControlCenter>, "initialSnapshot">) {
  const snapshot = use(snapshotPromise);
  return <ManagerControlCenter initialSnapshot={snapshot} {...rest} />;
}
