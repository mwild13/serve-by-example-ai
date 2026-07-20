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
    title: "Live Scenarios",
    desc: "Real-time roleplay simulation that tests staff under pressure before real service.",
  },
  {
    href: "/platform/challenges",
    title: "Interactive Challenges",
    desc: "Tap-based mini-games that replace essay inputs: sequence sorts, recipe builds, and match pairs.",
    badge: "New",
  },
  {
    href: "/platform#insights",
    title: "Mission Control",
    desc: "Live dashboards, audit-ready metrics, and squad-level performance analysis.",
  },
];

const companyLinks = [
  {
    href: "/about",
    title: "About",
    desc: "The story behind Serve By Example and what we're building.",
  },
  {
    href: "/security",
    title: "Security & Safety",
    desc: "How we protect your team's data, privacy, and platform access.",
  },
];

const solutionsLinks = [
  {
    href: "/for-venues",
    title: "For Venues – Overview",
    desc: "How Serve By Example fits into your venue operations end to end.",
  },
  {
    href: "/solutions/pub-groups",
    title: "Multi-Venue Pub Groups",
    desc: "Standardise brand guidelines and scale training across multi-site teams.",
  },
  {
    href: "/solutions/fine-dining",
    title: "Fine Dining & Cocktail Bars",
    desc: "Complex recipe specs, cellar logic, and premium service recovery.",
  },
  {
    href: "/solutions/hotel-fb",
    title: "Hotel F&B",
    desc: "Consistent service standards across restaurant, bar, and room service teams.",
  },
  {
    href: "/solutions/franchise-systems",
    title: "Franchise Systems",
    desc: "Speed of service, upselling workflows, and high-turnover cost reduction.",
  },
  {
    href: "/solutions/multi-venue",
    title: "Multi-Venue Groups",
    desc: "Centralised analytics and training management across all your sites.",
  },
];

export default function Navbar({
  showActions = true,
  showTextLogin = false,
  showNavbarLanguageOnMobile: _showNavbarLanguageOnMobile = true,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"platform" | "solutions" | "company" | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<"platform" | "solutions" | "company" | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = useCallback((menu: "platform" | "solutions" | "company") => {
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

  useEffect(() => {
    const header = document.querySelector('.navbar') as HTMLElement;
    const onScroll = () => header?.classList.toggle('navbar--scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="navbar" ref={headerRef}>
        <div className="container navbar-inner">
          <Link href="/" className="brand" onClick={close}>
            <Image src="/logo.png" alt="Serve By Example" width={40} height={40} className="brand-mark-img" />
            <div className="brand-copy">
              <span className="brand-title">Serve By Example</span>
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
                aria-haspopup="true"
                aria-controls="nav-platform-dropdown"
                onClick={() => setOpenMenu(openMenu === "platform" ? null : "platform")}
              >
                Platform
                <ChevronDown className="nav-chevron" size={14} strokeWidth={2.5} />
              </button>
              {openMenu === "platform" && (
                <div id="nav-platform-dropdown" className="mega-menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
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
                aria-haspopup="true"
                aria-controls="nav-solutions-dropdown"
                onClick={() => setOpenMenu(openMenu === "solutions" ? null : "solutions")}
              >
                Solutions
                <ChevronDown className="nav-chevron" size={14} strokeWidth={2.5} />
              </button>
              {openMenu === "solutions" && (
                <div id="nav-solutions-dropdown" className="mega-menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
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

            {/* Company dropdown */}
            <div
              className="nav-item-wrapper"
              onMouseEnter={() => openDropdown("company")}
              onMouseLeave={scheduleClose}
            >
              <button
                className={`nav-dropdown-trigger${openMenu === "company" ? " active" : ""}`}
                aria-expanded={openMenu === "company"}
                aria-haspopup="true"
                aria-controls="nav-company-dropdown"
                onClick={() => setOpenMenu(openMenu === "company" ? null : "company")}
              >
                Company
                <ChevronDown className="nav-chevron" size={14} strokeWidth={2.5} />
              </button>
              {openMenu === "company" && (
                <div id="nav-company-dropdown" className="mega-menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                  {companyLinks.map((item) => (
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

            <Link href="/resources">Resources</Link>
          </nav>

          <div className="nav-right">
            {authEmail ? (
              <Link href="/dashboard" className="nav-logged-in" title={authEmail}>
                Go to Dashboard →
              </Link>
            ) : showActions ? (
              <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  href="/login?intent=trial&tier=boutique"
                  className="btn btn-secondary"
                  style={{ fontSize: "0.875rem", padding: "8px 16px" }}
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/login"
                  className="btn"
                  style={{
                    backgroundColor: "var(--green)",
                    color: "var(--surface)",
                    border: "none",
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                  }}
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

            {/* Company accordion */}
            <button
              className="nav-drawer-link nav-drawer-accordion"
              onClick={() => setMobileExpanded(mobileExpanded === "company" ? null : "company")}
            >
              Company
              <ChevronDown
                className={`nav-chevron${mobileExpanded === "company" ? " rotated" : ""}`}
                size={16}
                strokeWidth={2.5}
              />
            </button>
            {mobileExpanded === "company" && (
              <div className="nav-drawer-sub">
                {companyLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-drawer-sub-link" onClick={close}>
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/resources" className="nav-drawer-link" onClick={close}>
              Resources
            </Link>

            {showActions && (
              <div className="nav-drawer-actions" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link
                  href="/login?intent=trial&tier=boutique"
                  className="btn btn-secondary btn-block"
                  onClick={close}
                >
                  Free Trial
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
