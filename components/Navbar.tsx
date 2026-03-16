import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand">
          <Image src="/logo.ico" alt="Serve By Example AI" width={40} height={40} className="brand-mark-img" />
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