"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TabBar from "./ui/TabBar";
import MobileScreenShell from "./MobileScreenShell";
import { CompletionCard } from "./challenges/MobileChallengeChrome";
import { useMarkChallengeComplete } from "../_lib/use-challenge-complete";
import ChallengeGame from "@/components/challenges/ChallengeGame";
import { CHALLENGE_AREA_LABEL, CHALLENGE_KIND_LABEL, type Challenge } from "@/lib/challenge-content";

// Any challenge from lib/challenge-content.ts on mobile, at
// /mobile/challenge/<slug>: the same game the desktop plays
// (components/challenges/ChallengeGame.tsx), in the dark mobile colours
// through .sd-on-mobile. Challenges 0 to 4 still have their own screens.

export default function ChallengeScreen({ challenge }: { challenge: Challenge }) {
  const [solved, setSolved] = useState(false);
  const [round, setRound] = useState(0);
  useMarkChallengeComplete(challenge.index, solved);

  return (
    <MobileScreenShell style={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 20 }}>
          <Link
            href="/mobile/challenges"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-mobile-muted)", textDecoration: "none" }}
          >
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            Challenges
          </Link>
          <p style={{ margin: "8px 0 0", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold-mobile)" }}>
            {CHALLENGE_KIND_LABEL[challenge.kind]} · {CHALLENGE_AREA_LABEL[challenge.area]}
          </p>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-mobile)" }}>{challenge.title}</h1>
        </div>

        <div className="sd-on-mobile" style={{ padding: "0 20px 20px", fontSize: 14 }}>
          <ChallengeGame
            key={round}
            challenge={challenge}
            onResult={({ solved: right }) => {
              if (right) setSolved(true);
            }}
          />
        </div>

        {solved && (
          <CompletionCard
            title="Challenge done"
            subtitle="Saved to your progress."
            onReplay={() => {
              setSolved(false);
              setRound((r) => r + 1);
            }}
          />
        )}
      </div>

      <TabBar active="practise" />
    </MobileScreenShell>
  );
}
