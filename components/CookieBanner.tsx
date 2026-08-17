"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sbe-cookie-consent";
const GA_ID = "G-EF9YRFXKBG";

type ConsentState = "accepted" | "declined" | null;

function loadGA() {
  if (typeof window === "undefined") return;
  if ((window as { _gaLoaded?: boolean })._gaLoaded) return;
  (window as { _gaLoaded?: boolean })._gaLoaded = true;

  const script1 = document.createElement("script");
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script1.async = true;
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `;
  document.head.appendChild(script2);
}

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
      if (stored === "accepted") {
        loadGA();
        setConsent("accepted");
      } else if (stored === "declined") {
        setConsent("declined");
      } else {
        // First visit — show banner after short delay so page renders first
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable (private browsing etc.) — just show banner
      setVisible(true);
    }
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch {}
    setConsent("accepted");
    setVisible(false);
    loadGA();
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, "declined"); } catch {}
    setConsent("declined");
    setVisible(false);
  }

  if (!visible || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "var(--surface-raised)",
        borderTop: "1px solid var(--line)",
        boxShadow: "var(--shadow-lg)",
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
        fontFamily: "var(--font-manrope, system-ui, sans-serif)",
      }}
    >
      <p
        style={{
          flex: 1,
          minWidth: 260,
          margin: 0,
          fontSize: "0.875rem",
          color: "var(--text-soft)",
          lineHeight: 1.55,
        }}
      >
        We use cookies to analyse site traffic and improve your experience.
        Strictly necessary cookies are always on.{" "}
        <a
          href="/cookies"
          style={{ color: "var(--green)", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Cookie policy
        </a>
        {" · "}
        <a
          href="/privacy"
          style={{ color: "var(--green)", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Privacy policy
        </a>
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: "0.5rem 1.1rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--line)",
            background: "transparent",
            color: "var(--text-soft)",
            fontSize: "0.875rem",
            fontFamily: "var(--font-manrope, system-ui, sans-serif)",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--green)",
            color: "#fff",
            fontSize: "0.875rem",
            fontFamily: "var(--font-manrope, system-ui, sans-serif)",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
