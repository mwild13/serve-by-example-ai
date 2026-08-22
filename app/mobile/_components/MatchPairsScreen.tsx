"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Martini, RotateCcw } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileSession } from "../_lib/mobile-session-context";
import { enqueueRetry } from "../_lib/retry-queue";

// Phase C file 05 — real tap/match game logic (net-new mobile frontend; V3 has
// no server-side game-state API to extract, per v4-migration-plan/05). This is
// the mobile equivalent of MatchPairGame.tsx (V3's "Match Pair" challenge,
// challengeIndex 2 in the 5-challenge ordering — confirmed against
// ChallengesPage.tsx's markComplete() call sites). On full match:
//   1. POST /api/training/challenges/save { challengeIndex: 2 } — still
//      fire-and-forget from the UI's perspective, but a real failure (offline,
//      or an HTTP error status the original version never checked for) now
//      queues for retry (Priority 3, retry-queue.ts) instead of only logging.
//   2. Mirror to the SAME localStorage keys V3 uses ("sbe_challenges_completed",
//      "sbe-challenges-best-score" — here repurposed as "fewest moves") rather
//      than a mobile-namespaced key, since mobile and desktop are the same
//      account on the same device/browser and V3's own ProgressOverview.tsx
//      already treats this as "completion tracked on this device," not per-surface.
//
// The "1:14 Min" / "Moves: 8" figures in the Phase B skeleton were static mock
// values — no backend or client state produced them. Moves is now a real
// counter; elapsed time is a real running clock. Neither is invented data.

const CHALLENGE_INDEX = 2;

type PairDef = { id: string; ingredient: string; cocktail: string };

const PAIRS: PairDef[] = [
  { id: "old-fashioned", ingredient: "Angostura Bitters", cocktail: "Old Fashioned" },
  { id: "whiskey-sour", ingredient: "Bourbon Whiskey", cocktail: "Whiskey Sour" },
  { id: "margarita", ingredient: "Triple Sec", cocktail: "Margarita" },
  { id: "mojito", ingredient: "Fresh Mint", cocktail: "Mojito" },
  { id: "bloody-mary", ingredient: "Tomato Juice", cocktail: "Bloody Mary" },
  { id: "espresso-martini", ingredient: "Coffee Liqueur", cocktail: "Espresso Martini" },
];

type Card = { key: string; pairId: string; label: string };

// Hydration guard (2026-08-19): this screen is SSR'd like every other
// `app/mobile` route, so a Math.random() shuffle in the useState initialiser
// produced one deck order on the server and a different one on the client —
// a genuine hydration mismatch across all 12 card labels. The initial deck is
// now deterministic (all ingredients, then all cocktails: pair `i` lands at
// index `i` and `i + 6`, two rows apart in the 3x4 grid, so the pre-hydration
// HTML never reveals a pairing), and the real shuffle runs in a mount effect.
function buildDeck(shuffle: boolean): Card[] {
  const deck: Card[] = [
    ...PAIRS.map((p) => ({ key: `${p.id}-a`, pairId: p.id, label: p.ingredient })),
    ...PAIRS.map((p) => ({ key: `${p.id}-b`, pairId: p.id, label: p.cocktail })),
  ];
  if (!shuffle) return deck;
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MatchPairsScreen() {
  const session = useMobileSession();
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(false));
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const completionRef = useRef<HTMLDivElement | null>(null);

  // `matched` holds one entry per PAIR (keyed by pairId), not one per card —
  // the old `/ 2` halved the real count, so the counter stalled at 3/6 on a
  // fully-solved board.
  const pairsFound = matched.size;
  const isComplete = pairsFound === PAIRS.length;

  useEffect(() => {
    // Client-only shuffle — see buildDeck()'s note above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck(buildDeck(true));
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sbe-match-pairs-best-moves");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setBestMoves(parseInt(stored, 10));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (isComplete) return;
    const timer = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isComplete]);

  useEffect(() => {
    // Live-QA fix (2026-08-19): "doesn't finish when the answers are all
    // done" — the completion banner renders below the 3x4 card grid, off
    // the bottom of the viewport on real phones with no auto-scroll cue, so
    // it looked like nothing happened. Scroll it into view the moment it
    // mounts.
    if (isComplete) completionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isComplete]);

  useEffect(() => {
    if (!isComplete || saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(true);

    try {
      const stored = localStorage.getItem("sbe_challenges_completed");
      const existing: number[] = stored ? (JSON.parse(stored) as number[]) : [];
      if (!existing.includes(CHALLENGE_INDEX)) {
        localStorage.setItem("sbe_challenges_completed", JSON.stringify([...existing, CHALLENGE_INDEX]));
      }
      if (bestMoves === null || moves < bestMoves) {
        localStorage.setItem("sbe-match-pairs-best-moves", String(moves));
        setBestMoves(moves);
      }
    } catch {
      /* ignore */
    }

    void fetch("/api/training/challenges/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ challengeIndex: CHALLENGE_INDEX }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Challenge sync failed (${res.status})`);
      })
      .catch((err) => {
        console.error("[MatchPairsScreen] Failed to sync challenge:", err);
        enqueueRetry({ challengeIndex: CHALLENGE_INDEX });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, saved]);

  function handleTap(card: Card) {
    if (isComplete || matched.has(card.pairId) || selected.includes(card.key) || selected.length === 2) return;

    const next = [...selected, card.key];
    setSelected(next);

    if (next.length === 2) {
      const [firstKey, secondKey] = next;
      const first = deck.find((c) => c.key === firstKey)!;
      const second = deck.find((c) => c.key === secondKey)!;
      setMoves((m) => m + 1);

      if (first.pairId === second.pairId) {
        setTimeout(() => {
          setMatched((prev) => new Set(prev).add(first.pairId));
          setSelected([]);
        }, 350);
      } else {
        setWrongPair(next);
        setTimeout(() => {
          setWrongPair([]);
          setSelected([]);
        }, 700);
      }
    }
  }

  function reset() {
    setDeck(buildDeck(true));
    setSelected([]);
    setMatched(new Set());
    setWrongPair([]);
    setMoves(0);
    setElapsedSec(0);
    setSaved(false);
  }

  const timeLabel = useMemo(() => {
    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;
    return `${m}:${String(s).padStart(2, "0")} Min`;
  }, [elapsedSec]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* game-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Ingredient Match</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Classic Cocktails Mastery</p>
          </div>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--gold-mobile-bg)",
              border: "1px solid var(--gold-mobile)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-mobile)" }}>{timeLabel}</span>
          </div>
        </div>

        {/* game-stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 16px" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-mobile-muted)" }}>
            Pairs Found: <span style={{ fontWeight: 700, color: "var(--gold-mobile)" }}>{pairsFound}/{PAIRS.length}</span>
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-mobile-muted)" }}>
            Moves: <span style={{ fontWeight: 700, color: "var(--text-mobile)" }}>{moves}</span>
          </p>
        </div>

        {/* grid-container — 3 cols x 4 rows */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            padding: "0 20px 20px",
          }}
        >
          {deck.map((card) => {
            const isMatched = matched.has(card.pairId);
            const isSelected = selected.includes(card.key);
            const isWrong = wrongPair.includes(card.key);
            const revealed = isMatched || isSelected || isWrong;

            const style = isMatched
              ? { background: "var(--green-mobile-bg)", border: "1px solid var(--green-mobile)", color: "var(--green-mobile)" }
              : isWrong
                ? { background: "var(--red-mobile-bg, var(--surface-mobile))", border: "2px solid var(--red-mobile)", color: "var(--red-mobile)" }
                : isSelected
                  ? { background: "var(--gold-mobile-bg)", border: "2px solid var(--gold-mobile)", color: "var(--gold-mobile)" }
                  : { background: "var(--surface-mobile)", border: "1px solid var(--border-mobile)" };

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => handleTap(card)}
                disabled={isMatched || isComplete}
                aria-label={revealed ? card.label : "Hidden card"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 88,
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  background: style.background,
                  border: style.border,
                  textAlign: "center",
                  cursor: isMatched || isComplete ? "default" : "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {revealed ? (
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: style.color }}>{card.label}</p>
                ) : (
                  <Martini size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {isComplete && (
          <div ref={completionRef} style={{ padding: "0 20px 20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: 16,
                borderRadius: "var(--radius-lg)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--green-mobile)",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>All pairs matched!</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
                {moves} moves &bull; {timeLabel}
                {bestMoves !== null && ` • Best: ${bestMoves} moves`}
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--gold-mobile-bg)",
                    border: "1px solid var(--gold-mobile)",
                    color: "var(--gold-mobile)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
                  Play Again
                </button>
                <Link
                  href="/mobile/challenges"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--gold-mobile)",
                    color: "var(--bg-mobile-dark)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Back to Challenges
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
