"use client";

import Screen from "./ui/Screen";
import { useGetToken } from "../_lib/use-staff";
import LiveGuest from "@/components/live-guest/LiveGuest";

// Mobile host for Live Guest (Rich update, Phase 6), from the Practise tab.
// The conversation itself is components/live-guest/LiveGuest.tsx, shared
// with desktop; it takes the mobile look from the .sm-play rules.
export default function LiveGuestScreen() {
  const getToken = useGetToken();
  return (
    <Screen title="Live Guest" back={{ href: "/mobile/practise", label: "Practise" }} tab="practise">
      <div className="sm-quiz sm-play">
        <LiveGuest getToken={getToken} theme="dark" />
      </div>
    </Screen>
  );
}
