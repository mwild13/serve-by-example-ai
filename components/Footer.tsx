import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-mark">
            <span className="footer-brand-icon-bg">
              <Image src="/logo.ico" alt="Serve By Example" width={28} height={28} />
            </span>
            <div className="footer-brand-name">Serve By Example</div>
          </div>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li>
              <Link href="/platform">AI Platform</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/demo">Demo</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/how-it-works">How It Works</Link>
            </li>
            <li>
              <Link href="/for-venues">For Venues</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/login">Sign Up</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <Link href="/cookies">Cookies</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <div>&copy; 2026 Serve By Example. All rights reserved.</div>
        <div>Built for bartenders, venue teams and future managers.</div>
        <LanguageSwitcher variant="footer" mobileOnly />
      </div>
    </footer>
  );
}