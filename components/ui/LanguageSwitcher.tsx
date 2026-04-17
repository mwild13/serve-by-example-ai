"use client";

import { useEffect, useId, useState } from "react";

type LanguageSwitcherProps = {
  variant?: "navbar" | "drawer" | "footer";
  mobileOnly?: boolean;
  hideOnMobile?: boolean;
};

type LanguageOption = {
  code: string;
  label: string;
};

const LANGUAGE_STORAGE_KEY = "sbe-language";
const DEFAULT_LANGUAGE = "en-US";

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en-US", label: "English - US" },
  { code: "en-AU", label: "English - AUS" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh-CN", label: "Mandarin Chinese" },
  { code: "pt", label: "Portuguese" },
  { code: "pa", label: "Punjabi" },
  { code: "ru", label: "Russian" },
  { code: "es", label: "Spanish" },
  { code: "tl", label: "Tagalog" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
];

function resolveLanguageCode(code: string): string {
  return code;
}

export default function LanguageSwitcher({
  variant = "navbar",
  mobileOnly = false,
  hideOnMobile = false,
}: LanguageSwitcherProps) {
  const selectId = useId();
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (saved === "auto" || saved === "en") {
      setLanguage(DEFAULT_LANGUAGE);
      return;
    }

    if (saved && LANGUAGE_OPTIONS.some((option) => option.code === saved)) {
      setLanguage(saved);
      return;
    }

    setLanguage(DEFAULT_LANGUAGE);
  }, []);

  useEffect(() => {
    const htmlLanguage = resolveLanguageCode(language);
    document.documentElement.lang = htmlLanguage;
    document.documentElement.dir = htmlLanguage.startsWith("ar") ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-ui-language", language);

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (
    <div
      className={[
        "language-switcher",
        `language-switcher-${variant}`,
        mobileOnly ? "language-switcher-mobile-only" : "",
        hideOnMobile ? "language-switcher-hide-mobile" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="language-switcher-control" htmlFor={selectId}>
        <span className="sr-only">Select language</span>
        <select
          id={selectId}
          className="language-select language-has-icon"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label="Select language"
        >
          {LANGUAGE_OPTIONS.slice(0, 2).map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
          <option value="__divider" disabled>
            --------------------
          </option>
          {LANGUAGE_OPTIONS.slice(2).map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
