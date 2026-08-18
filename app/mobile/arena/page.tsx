import { Suspense } from "react";
import ArenaScreen from "../_components/ArenaScreen";

// Phase C file 04 — ArenaScreen reads scenario payload via useSearchParams(),
// which Next.js requires to be wrapped in Suspense.
export default function MobileArenaPage() {
  return (
    <Suspense fallback={null}>
      <ArenaScreen />
    </Suspense>
  );
}
