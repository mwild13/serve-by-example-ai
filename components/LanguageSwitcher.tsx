"use client";

import { useEffect, useId, useState } from "react";

type LanguageSwitcherProps = {
  variant?: "navbar" | "drawer" | "footer";
  mobileOnly?: boolean;
};

type LanguageOption = {
  code: string;
  label: string;
};

const LANGUAGE_STORAGE_KEY = "sbe-language";

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "auto", label: "Auto (Browser)" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "zh", label: "Mandarin Chinese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "pt", label: "Portuguese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "hi", label: "Hindi" },
  { code: "pa", label: "Punjabi" },
  { code: "it", label: "Italian" },
  { code: "vi", label: "Vietnamese" },
  { code: "tr", label: "Turkish" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
  { code: "tl", label: "Tagalog" },
];

function resolveLanguageCode(code: string): string {
  if (code !== "auto") {
    return code;
  }

  if (typeof navigator === "undefined") {
    return "en";
  }

  const browserCode = navigator.language?.split("-")[0]?.toLowerCase();
  const supportedCode = LANGUAGE_OPTIONS.find((option) => option.code === browserCode);
  return supportedCode?.code ?? "en";
}

export default function LanguageSwitcher({ variant = "navbar", mobileOnly = false }: LanguageSwitcherProps) {
  const selectId = useId();
  const [language, setLanguage] = useState("auto");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && LANGUAGE_OPTIONS.some((option) => option.code === saved)) {
      setLanguage(saved);
      return;
    }

    setLanguage("auto");
  }, []);

  useEffect(() => {
    const htmlLanguage = resolveLanguageCode(language);
    document.documentElement.lang = htmlLanguage;
    document.documentElement.setAttribute("data-ui-language", language);

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (
    <div
      className={[
        "language-switcher",
        `language-switcher-${variant}`,
        mobileOnly ? "language-switcher-mobile-only" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="language-switcher-control" htmlFor={selectId}>
        <span className="language-emoji" aria-hidden="true">
          🌐
        </span>
        <span className="sr-only">Select language</span>
        <select
          id={selectId}
          className="language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label="Select language"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
