"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type NavbarProps = {
  showActions?: boolean;
  showTextLogin?: boolean;
  showNavbarLanguageOnMobile?: boolean;
};

const platformLinks = [
  {
    href: "/platform#arena",
    title: "AI Interactive Arena",
    desc: "Real-time roleplay simulation that tests staff under pressure before real service.",
  },
  {
    href: "/platform/challenges",
    title: "Interactive Challenges",
    desc: "Tap-based mini-games that replace essay inputs — sequence sorts, recipe builds, and match pairs.",
    badge: "New",
  },
  {
    href: "/platform",
    title: "Custom Scenario Builder",
    desc: "Upload your menus, house rules, and POS workflows into the AI model.",
    badge: "Coming soon",
  },
  {
    href: "/platform#insights",
    title: "Manager Insights",
    desc: "Live dashboards, audit-ready metrics, and squad-level performance analysis.",
  },
];

const solutionsLinks = [
  {
    href: "/solutions#pub-groups",
    title: "Multi-Venue Pub Groups",
    desc: "Standardise brand guidelines and scale training across multi-site teams.",
  },
  {
    href: "/solutions#fine-dining",
    title: "Fine Dining & Cocktail Bars",
    desc: "Complex recipe specs, cellar logic, and premium service recovery.",
  },
  {
    href: "/solutions#franchises",
    title: "Franchises & QSRs",
    desc: "Speed of service, upselling workflows, and high-turnover cost reduction.",
  },
];

export default function Navbar({
  showActions = true,
  showTextLogin = false,
  showNavbarLanguageOnMobile: _showNavbarLanguageOnMobile = true,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"platform" | "solutions" | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<"platform" | "solutions" | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = useCallback((menu: "platform" | "solutions") => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenMenu(menu);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setOpenMenu(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const close = () => {
    setMenuOpen(false);
    setMobileExpanded(null);
  };

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthEmail(data.user?.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthEmail(session?.user?.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <>
      <header className="navbar" ref={headerRef}>
        <div className="container navbar-inner">
          <Link href="/" className="brand" onClick={close}>
            <Image src="/logo.png" alt="Serve By Example AI" width={40} height={40} className="brand-mark-img" />
            <div className="brand-copy">
              <span className="brand-title">Serve By Example</span>
              <span className="brand-subtitle">AI Training Platform</span>
            </div>
          </Link>

          <nav className="nav-links">
            {/* Platform dropdown */}
            <div
              className="nav-item-wrapper"
              onMouseEnter={() => openDropdown("platform")}
              onMouseLeave={scheduleClose}
            >
              <button
                className={`nav-dropdown-trigger${openMenu === "platform" ? " active" : ""}`}
                aria-expanded={openMenu === "platform"}
                onClick={() => setOpenMenu(openMenu === "platform" ? null : "platform")}
              >
                Platform
                <ChevronDown className="nav-chevron" size={14} strokeWidth={2.5} />
              </button>
              {openMenu === "platform" && (
                <div className="mega-menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                  {platformLinks.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="mega-menu-item"
                      onClick={() => setOpenMenu(null)}
                    >
                      <div className="mega-menu-item-title">
                        {item.title}
                        {item.badge && <span className="coming-soon-badge">{item.badge}</span>}
                      </div>
                      <div className="mega-menu-item-desc">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Solutions dropdown */}
            <div
              className="nav-item-wrapper"
              onMouseEnter={() => openDropdown("solutions")}
              onMouseLeave={scheduleClose}
            >
              <button
                className={`nav-dropdown-trigger${openMenu === "solutions" ? " active" : ""}`}
                aria-expanded={openMenu === "solutions"}
                onClick={() => setOpenMenu(openMenu === "solutions" ? null : "solutions")}
              >
                Solutions
                <ChevronDown className="nav-chevron" size={14} strokeWidth={2.5} />
              </button>
              {openMenu === "solutions" && (
                <div className="mega-menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                  {solutionsLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="mega-menu-item"
                      onClick={() => setOpenMenu(null)}
                    >
                      <div className="mega-menu-item-title">{item.title}</div>
                      <div className="mega-menu-item-desc">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/pricing">Pricing</Link>
            <Link href="/demo" className="nav-demo-btn">Try the Demo</Link>
          </nav>

          <div className="nav-right">
            {authEmail ? (
              <Link href="/dashboard" className="nav-logged-in" title={authEmail}>
                Go to Dashboard →
              </Link>
            ) : showActions ? (
              <div className="nav-actions">
                <Link href="/management/login" className="btn btn-secondary">
                  Manager Login
                </Link>
                <Link
                  href="/login"
                  className="btn"
                  style={{ backgroundColor: "var(--green)", color: "var(--surface)", border: "none" }}
                >
                  Login
                </Link>
              </div>
            ) : showTextLogin ? (
              <div className="nav-text-actions">
                <Link href="/login" className="nav-text-link">
                  Login
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
            <Link href="/" className="nav-drawer-link" onClick={close}>
              Home
            </Link>

            {/* Platform accordion */}
            <button
              className="nav-drawer-link nav-drawer-accordion"
              onClick={() => setMobileExpanded(mobileExpanded === "platform" ? null : "platform")}
            >
              Platform
              <ChevronDown
                className={`nav-chevron${mobileExpanded === "platform" ? " rotated" : ""}`}
                size={16}
                strokeWidth={2.5}
              />
            </button>
            {mobileExpanded === "platform" && (
              <div className="nav-drawer-sub">
                {platformLinks.map((item) => (
                  <Link key={item.title} href={item.href} className="nav-drawer-sub-link" onClick={close}>
                    {item.title}
                    {item.badge && <span className="coming-soon-badge">{item.badge}</span>}
                  </Link>
                ))}
              </div>
            )}

            {/* Solutions accordion */}
            <button
              className="nav-drawer-link nav-drawer-accordion"
              onClick={() => setMobileExpanded(mobileExpanded === "solutions" ? null : "solutions")}
            >
              Solutions
              <ChevronDown
                className={`nav-chevron${mobileExpanded === "solutions" ? " rotated" : ""}`}
                size={16}
                strokeWidth={2.5}
              />
            </button>
            {mobileExpanded === "solutions" && (
              <div className="nav-drawer-sub">
                {solutionsLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-drawer-sub-link" onClick={close}>
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/pricing" className="nav-drawer-link" onClick={close}>
              Pricing
            </Link>
            <Link href="/demo" className="nav-drawer-link" onClick={close}>
              Demo
            </Link>
            <Link href="/about" className="nav-drawer-link" onClick={close}>
              About
            </Link>
            <Link href="/contact" className="nav-drawer-link" onClick={close}>
              Contact
            </Link>

            {showActions && (
              <div className="nav-drawer-actions">
                <Link href="/management/login" className="btn btn-secondary btn-block" onClick={close}>
                  Manager Login
                </Link>
                <Link
                  href="/login"
                  className="btn btn-block"
                  onClick={close}
                  style={{ backgroundColor: "var(--green)", color: "var(--surface)", border: "none" }}
                >
                  Login
                </Link>
              </div>
            )}
            {showTextLogin && (
              <div className="nav-drawer-actions">
                <Link
                  href="/login"
                  className="btn btn-block"
                  onClick={close}
                  style={{ backgroundColor: "var(--green)", color: "var(--surface)", border: "none" }}
                >
                  Login
                </Link>
              </div>
            )}
          </nav>
        </>
      )}
    </>
  );
}
