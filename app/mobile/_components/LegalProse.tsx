"use client";

// Shared presentational primitives for the in-app Terms of Service and
// Privacy Policy screens (TermsScreen.tsx, PrivacyScreen.tsx). Mirrors the
// local Section/Divider pattern HelpScreen.tsx already established for
// Settings > Support screens, split out here only because two screens need
// the same numbered-heading + paragraph + list shape.

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "0 20px 20px" }}>
      <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{title}</p>
      {children}
    </div>
  );
}

export function LegalSubheading({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "var(--text-mobile)" }}>{children}</p>;
}

export function LegalParagraph({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>{children}</p>;
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ margin: "0 0 12px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LegalDivider() {
  return <div style={{ height: 1, background: "var(--border-mobile)", margin: "0 20px 20px" }} />;
}

export function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-mobile)", fontWeight: 600 }}>
      {children}
    </a>
  );
}

export function LegalEmailLink() {
  return (
    <a href="mailto:info@servebyexample.co" style={{ color: "var(--gold-mobile)", fontWeight: 600 }}>
      info@servebyexample.co
    </a>
  );
}
