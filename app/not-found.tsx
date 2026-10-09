import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="sbe-mkt-confirm-page">
        <div className="container">
          <div className="sbe-mkt-confirm">
            <p className="sbe-mkt-kicker">Error 404</p>
            <h1 className="sbe-mkt-display">Page not found.</h1>
            <p className="sbe-mkt-lede">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="sbe-mkt-confirm-actions">
              <Link href="/" className="sbe-mkt-btn-primary">
                Back to home
              </Link>
              <Link href="/demo" className="sbe-mkt-btn-text">
                Try the demo
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
