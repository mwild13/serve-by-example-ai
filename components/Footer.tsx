import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-mark">
            <Image src="/logo.webp" alt="Serve By Example" width={40} height={40} />
            <div className="footer-brand-name">Serve By Example</div>
          </div>
          <p>Scenario-based training for hospitality teams.</p>
          <LanguageSwitcher variant="footer" mobileOnly />
        </div>

        <div className="footer-col">
          <h3>Platform</h3>
          <ul>
            <li><Link href="/platform">Platform Tour</Link></li>
            <li><Link href="/platform#features">Features</Link></li>
            <li><Link href="/platform#insights">Manager Console</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Industries</h3>
          <ul>
            <li><Link href="/for-venues">Overview</Link></li>
            <li><Link href="/solutions/pub-groups">Pubs</Link></li>
            <li><Link href="/solutions/fine-dining">Bars</Link></li>
            <li><Link href="/solutions/fine-dining">Restaurants</Link></li>
            <li><Link href="/solutions/hotel-fb">Hotels</Link></li>
            <li><Link href="/solutions/franchise-systems">Franchises</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Resources</h3>
          <ul>
            <li><Link href="/resources">Free Training Checklist</Link></li>
            <li><Link href="/roi">ROI Calculator</Link></li>
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/roadmap">Roadmap</Link></li>
            <li><Link href="/vs-generic-lms">vs Generic LMS</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Company</h3>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/security">Security &amp; Safety</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/login?intent=trial&tier=boutique">Start a free trial</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <div>&copy; 2026 Serve By Example. All rights reserved.</div>
        <div>Built for bartenders, venue teams and future managers.</div>
        <div className="footer-legal-links">
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
