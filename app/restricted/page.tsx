import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Restricted — Serve By Example",
  robots: { index: false },
};

export default function RestrictedPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0B2B1E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        textAlign: "center",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(255,255,255,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 22h8M7 2h10l-2 8H9z"/>
          <line x1="12" y1="10" x2="12" y2="22"/>
        </svg>
      </div>

      {/* Brand wordmark */}
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          margin: "0 0 2.5rem",
        }}
      >
        Serve By Example
      </p>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
          fontWeight: 800,
          color: "white",
          margin: "0 0 1.25rem",
          lineHeight: 1.2,
          maxWidth: "480px",
        }}
      >
        Australia Only — For Now
      </h1>

      {/* Body copy */}
      <p
        style={{
          fontSize: "1.0625rem",
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.7,
          margin: "0 0 1.5rem",
          maxWidth: "420px",
        }}
      >
        Serve By Example is currently available to hospitality venues and staff in Australia.
      </p>
      <p
        style={{
          fontSize: "0.9375rem",
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.7,
          margin: "0 0 3rem",
          maxWidth: "400px",
        }}
      >
        Our platform is built around Australian WHS compliance standards, RSA certification requirements, and the specific regulatory environment for licensed venues in Australia. We are working to expand into other markets and will announce availability in additional regions as we grow.
      </p>

      {/* Divider */}
      <div
        style={{
          width: "48px",
          height: "1px",
          background: "rgba(255,255,255,0.12)",
          marginBottom: "3rem",
        }}
      />

      {/* Footer links */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          fontSize: "0.8125rem",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        <Link
          href="/privacy"
          style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
        >
          Privacy Policy
        </Link>
        <span style={{ opacity: 0.3 }}>·</span>
        <Link
          href="/terms"
          style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
        >
          Terms of Service
        </Link>
        <span style={{ opacity: 0.3 }}>·</span>
        <a
          href="mailto:hello@serve-by-example.com"
          style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
        >
          Contact
        </a>
      </div>
    </div>
  );
}
