"use client";

// Measures how one applicant answer was produced (docs/APPLICANT_TESTING.md
// §5): time on and away from the page, pastes, and typing time. Starts again
// whenever `itemKey` changes. Nothing is blocked: pasting still works, the
// page just counts it. The server trims every figure to its own clock
// (readSignals in lib/applicant/integrity.ts), so these can only ever be
// lower than the truth, never invent time.

import { useCallback, useEffect, useRef } from "react";
import type { SignalsPayload } from "@/lib/applicant/client";

type Tally = {
  startedAt: number;
  awayMs: number;
  awaySince: number | null;
  awayCount: number;
  pasteCount: number;
  pastedChars: number;
  firstInputAt: number | null;
  lastInputAt: number | null;
};

function fresh(): Tally {
  return { startedAt: Date.now(), awayMs: 0, awaySince: null, awayCount: 0, pasteCount: 0, pastedChars: 0, firstInputAt: null, lastInputAt: null };
}

export function useAnswerSignals(itemKey: string | number) {
  const tally = useRef<Tally>(fresh());

  useEffect(() => {
    tally.current = fresh();
    const t = tally.current;

    // Away: the tab is hidden, or the window lost focus (another app or
    // window on a desktop). One stretch of either counts once.
    const goAway = () => {
      if (t.awaySince !== null) return;
      t.awaySince = Date.now();
      t.awayCount += 1;
    };
    const comeBack = () => {
      if (t.awaySince === null || document.visibilityState === "hidden" || !document.hasFocus()) return;
      t.awayMs += Date.now() - t.awaySince;
      t.awaySince = null;
    };
    const onVisibility = () => (document.visibilityState === "hidden" ? goAway() : comeBack());
    const onPaste = (event: ClipboardEvent) => {
      t.pasteCount += 1;
      t.pastedChars += event.clipboardData?.getData("text").length ?? 0;
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", goAway);
    window.addEventListener("focus", comeBack);
    document.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", goAway);
      window.removeEventListener("focus", comeBack);
      document.removeEventListener("paste", onPaste);
    };
  }, [itemKey]);

  /** Call from a text field's onInput. */
  const noteInput = useCallback(() => {
    const now = Date.now();
    tally.current.firstInputAt ??= now;
    tally.current.lastInputAt = now;
  }, []);

  /** The figures so far, to send with the answer. */
  const read = useCallback((): SignalsPayload => {
    const t = tally.current;
    const now = Date.now();
    const awayMs = t.awayMs + (t.awaySince === null ? 0 : now - t.awaySince);
    return {
      activeMs: Math.max(0, now - t.startedAt - awayMs),
      awayMs,
      awayCount: t.awayCount,
      pasteCount: t.pasteCount,
      pastedChars: t.pastedChars,
      typingMs: t.firstInputAt !== null && t.lastInputAt !== null ? t.lastInputAt - t.firstInputAt : 0,
    };
  }, []);

  return { noteInput, read };
}
