"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Screen from "./ui/Screen";
import DrillCelebration from "./drill/DrillCelebration";
import { useGetToken } from "../_lib/use-staff";
import MixedDrill from "@/components/quiz/MixedDrill";

// Mobile host for the mixed drill (Rich update, Phase 10) and, with
// ?mode=preshift, the pre-shift drill from Home (Phase 12). The drill itself
// is components/quiz/MixedDrill.tsx, shared with desktop; the pre-shift one
// ends on the mobile celebration (drill/DrillCelebration.tsx).
export default function DrillScreen() {
  const router = useRouter();
  const preshift = useSearchParams().get("mode") === "preshift";
  const getToken = useGetToken();
  const onLiveGuest = () => router.push("/mobile/live-guest");

  return (
    <Screen
      title={preshift ? "Before your shift" : "Mixed drill"}
      back={preshift ? { href: "/mobile", label: "Home" } : { href: "/mobile/practise", label: "Practise" }}
      tab={preshift ? "home" : "practise"}
    >
      <div className="sm-drill">
        <MixedDrill
          key={preshift ? "preshift" : "mixed"}
          mode={preshift ? "preshift" : "mixed"}
          onLiveGuest={onLiveGuest}
          theme="dark"
          getToken={getToken}
          onOpenModule={(moduleId, title) => router.push(`/mobile/quiz?moduleId=${moduleId}&moduleTitle=${encodeURIComponent(title)}`)}
          onBrowseModules={() => router.push("/mobile/learn")}
          renderPreshiftDone={({ summary, seconds }) => (
            <DrillCelebration summary={summary} seconds={seconds} getToken={getToken} onLiveGuest={onLiveGuest} />
          )}
        />
      </div>
    </Screen>
  );
}
