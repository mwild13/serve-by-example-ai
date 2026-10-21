"use client";

import Screen from "./ui/Screen";
import { useGetToken } from "../_lib/use-staff";
import SaturdayRush from "@/components/rush/SaturdayRush";

// Mobile host for Saturday Rush (Rich update, Phase 15), from the Practise
// tab. The game itself is components/rush/SaturdayRush.tsx, shared with
// desktop; it takes the mobile look from the .sm-play rules.
export default function RushScreen() {
  const getToken = useGetToken();
  return (
    <Screen title="Saturday Rush" back={{ href: "/mobile/practise", label: "Practise" }} tab="practise">
      <div className="sm-quiz sm-play">
        <SaturdayRush theme="dark" getToken={getToken} />
      </div>
    </Screen>
  );
}
