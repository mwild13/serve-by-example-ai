"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type NavbarProps = {
  showActions?: boolean;
  showTextLogin?: boolean;
};

export default function Navbar({ showActions = true, showTextLogin = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="brand" onClick={close}>
            <Image src="/logo.ico" alt="Serve By Example AI" width={40} height={40} className="brand-mark-img" />
            <div className="brand-copy">
              <span className="brand-title">Serve By Example</span>
              <span className="brand-subtitle">AI Training Platform</span>
            </div>
          </Link>

          <nav className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/platform">AI Platform</Link>
            <Link href="/for-venues">For Venues</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/demo">Demo</Link>
          </nav>

          <div className="nav-right">
            <LanguageSwitcher variant="navbar" />

            {showActions ? (
              <div className="nav-actions">
                <Link href="/management/login" className="btn btn-secondary">
                  Manager Login
                </Link>
                <Link href="/login" className="btn btn-primary">
                  Staff Login
                </Link>
              </div>
            ) : showTextLogin ? (
              <div className="nav-text-actions">
                <Link href="/login" className="nav-text-link">
                  Staff Login
                </Link>
              </div>
            ) : null}
          </div>

          <button
            className="nav-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={`nav-hamburger-bar${menuOpen ? " open" : ""}`} />
            <span className={`nav-hamburger-bar${menuOpen ? " open" : ""}`} />
            <span className={`nav-hamburger-bar${menuOpen ? " open" : ""}`} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="nav-overlay" onClick={close} aria-hidden="true" />
          <nav className="nav-drawer" aria-label="Mobile navigation">
            <Link href="/" className="nav-drawer-link" onClick={close}>Home</Link>
            <Link href="/how-it-works" className="nav-drawer-link" onClick={close}>How It Works</Link>
            <Link href="/platform" className="nav-drawer-link" onClick={close}>AI Platform</Link>
            <Link href="/for-venues" className="nav-drawer-link" onClick={close}>For Venues</Link>
            <Link href="/pricing" className="nav-drawer-link" onClick={close}>Pricing</Link>
            <Link href="/demo" className="nav-drawer-link" onClick={close}>Demo</Link>
            <Link href="/about" className="nav-drawer-link" onClick={close}>About</Link>
            <Link href="/contact" className="nav-drawer-link" onClick={close}>Contact</Link>
            <LanguageSwitcher variant="drawer" />
            {showActions && (
              <div className="nav-drawer-actions">
                <Link href="/management/login" className="btn btn-secondary btn-block" onClick={close}>Manager Login</Link>
                <Link href="/login" className="btn btn-primary btn-block" onClick={close}>Staff Login</Link>
              </div>
            )}
            {showTextLogin && (
              <div className="nav-drawer-actions">
                <Link href="/login" className="btn btn-primary btn-block" onClick={close}>Staff Login</Link>
              </div>
            )}
          </nav>
        </>
      )}
    </>
  );
}