import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-name">Serve By Example</div>
          <p>
            AI-powered training for bartenders, venue teams and future
            hospitality leaders.
          </p>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li>
              <Link href="/demo">Demo</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Training</h4>
          <ul>
            <li>
              <Link href="/demo">Bartending</Link>
            </li>
            <li>
              <Link href="/demo">Sales</Link>
            </li>
            <li>
              <Link href="/demo">Management</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/pricing">Sign Up</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <div>&copy; 2026 Serve By Example. All rights reserved.</div>
        <div>Built for bartenders, venue teams and future managers.</div>
      </div>
    </footer>
  );
}