// The pieces of the in-app Terms of Service and Privacy Policy screens
// (TermsScreen.tsx, PrivacyScreen.tsx). Styles: the sm-legal rules in
// app/styles/staff.css.

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="sm-legal">
      <h2 className="sm-legal-title">{title}</h2>
      {children}
    </section>
  );
}

export function LegalSubheading({ children }: { children: React.ReactNode }) {
  return <h3 className="sm-legal-sub">{children}</h3>;
}

export function LegalParagraph({ children }: { children: React.ReactNode }) {
  return <p className="sm-legal-p">{children}</p>;
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="sm-legal-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalDivider() {
  return <hr className="sm-legal-rule" />;
}

export function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="sm-inline-link">
      {children}
    </a>
  );
}

export function LegalEmailLink() {
  return (
    <a href="mailto:info@servebyexample.co" className="sm-inline-link">
      info@servebyexample.co
    </a>
  );
}
