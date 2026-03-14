import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand">
          <div className="brand-mark">SBE</div>
          <div className="brand-copy">
            <span className="brand-title">Serve By Example</span>
            <span className="brand-subtitle">AI Training Platform</span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/platform">Platform</Link>
          <Link href="/for-venues">For Venues</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/demo">Demo</Link>
          <Link href="/login">Login</Link>
        </nav>

        <div className="nav-actions">
          <Link href="/pricing" className="btn btn-secondary">
            View Pricing
          </Link>
          <Link href="/demo" className="btn btn-primary">
            Try Demo
          </Link>
        </div>
      </div>
    </header>
  );
}