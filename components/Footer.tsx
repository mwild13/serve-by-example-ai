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
              <Image src="/logo.png" alt="Serve By Example" width={28} height={28} />
            </span>
            <div className="footer-brand-name">Serve By Example</div>
          </div>
          <p>Scenario-based training for hospitality teams.</p>
          <LanguageSwitcher variant="footer" mobileOnly />
        </div>

        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><Link href="/platform">Platform Tour</Link></li>
            <li><Link href="/platform/challenges">Interactive Challenges</Link></li>
            <li><Link href="/platform#scenario-builder">Scenario Builder</Link></li>
            <li><Link href="/platform#insights">Mission Control</Link></li>
            <li><Link href="/security">Security &amp; Safety</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>For Venues</h4>
          <ul>
            <li><Link href="/for-venues">For Venues — Overview</Link></li>
            <li><Link href="/solutions/pub-groups">Pub Groups</Link></li>
            <li><Link href="/solutions/fine-dining">Fine Dining &amp; Bars</Link></li>
            <li><Link href="/solutions/hotel-fb">Hotel F&amp;B</Link></li>
            <li><Link href="/solutions/franchise-systems">Franchise Systems</Link></li>
            <li><Link href="/solutions/multi-venue">Multi-Venue Groups</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><Link href="/resources">Free Training Checklist</Link></li>
            <li><Link href="/roi">ROI Calculator</Link></li>
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/roadmap">Roadmap</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
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
