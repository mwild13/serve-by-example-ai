"use client";

import { useState } from "react";
import Screen from "./ui/Screen";
import { CompletionCard } from "./challenges/MobileChallengeChrome";
import { useMarkChallengeComplete } from "../_lib/use-challenge-complete";
import ChallengeGame from "@/components/challenges/ChallengeGame";
import { CHALLENGE_AREA_LABEL, CHALLENGE_KIND_LABEL, type Challenge } from "@/lib/challenge-content";

// Any challenge from lib/challenge-content.ts on mobile, at
// /mobile/challenge/<slug>: the same game the desktop plays
// (components/challenges/ChallengeGame.tsx), in the mobile colours through
// .sd-on-mobile. Challenges 0 to 4 still have their own screens.

export default function ChallengeScreen({ challenge }: { challenge: Challenge }) {
  const [solved, setSolved] = useState(false);
  const [round, setRound] = useState(0);
  useMarkChallengeComplete(challenge.index, solved);

  return (
    <Screen title={challenge.title} back={{ href: "/mobile/challenges", label: "Challenges" }} tab="practise">
      <div className="sm-game">
        <p className="sm-kicker sm-game-kind">
          {CHALLENGE_KIND_LABEL[challenge.kind]}. {CHALLENGE_AREA_LABEL[challenge.area]}
        </p>

        <div className="sd-on-mobile sm-game-shared">
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
    </Screen>
  );
}
