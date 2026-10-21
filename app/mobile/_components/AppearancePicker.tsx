"use client";

import { useEffect, useState } from "react";
import { readThemeChoice, saveThemeChoice, type MobileThemeChoice } from "@/lib/mobile-theme";

// Settings > Appearance: follow the phone (the default), or always light or
// always dark. Saved on this device only (lib/mobile-theme.ts).

const OPTIONS: { value: MobileThemeChoice; label: string }[] = [
  { value: "system", label: "Phone" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function AppearancePicker() {
  const [choice, setChoice] = useState<MobileThemeChoice>("system");

  useEffect(() => {
    // localStorage is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(readThemeChoice());
  }, []);

  function pick(next: MobileThemeChoice) {
    setChoice(next);
    saveThemeChoice(next);
  }

  return (
    <div className="sm-segment" role="radiogroup" aria-label="Appearance">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={choice === option.value}
          className="sm-segment-option"
          onClick={() => pick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
