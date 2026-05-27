import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Australia Only — For Now | Serve By Example",
  description:
    "Serve By Example is currently available to hospitality venues and staff in Australia. Expanding to additional regions soon.",
  robots: { index: false, follow: false },
};

export default function RestrictedPage() {
  return (
    <div className="geo-block-shell">
      <div className="geo-block-card">

        {/* Logo */}
        <div className="geo-block-logo">
          <Image
            src="/logo.png"
            alt="Serve By Example"
            width={56}
            height={56}
            priority
          />
          <span className="geo-block-brand-name">Serve By Example</span>
        </div>

        {/* Globe icon */}
        <div className="geo-block-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>

        {/* Eyebrow */}
        <span className="geo-block-eyebrow">Availability</span>

        {/* Heading */}
        <h1 className="geo-block-heading">
          Australia Only —{" "}
          <span>For Now.</span>
        </h1>

        <div className="geo-block-divider" />

        {/* Body */}
        <p className="geo-block-body">
          Serve By Example is built for the Australian hospitality industry —
          WHS compliance, RSA certification, and the licensing environment
          that venues here operate under.
        </p>

        <p className="geo-block-note">
          We&rsquo;re working to expand into additional regions and will
          announce availability as we grow. Thank you for your interest.
        </p>

        {/* Footer links */}
        <div className="geo-block-footer">
          <Link href="/privacy">Privacy Policy</Link>
          <span className="geo-block-footer-dot" aria-hidden="true">&#9679;</span>
          <Link href="/terms">Terms of Service</Link>
          <span className="geo-block-footer-dot" aria-hidden="true">&#9679;</span>
          <Link href="/contact">Contact</Link>
        </div>

      </div>
    </div>
  );
}
