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

const platformLinks: Array<{ href: string; title: string; desc: string; badge?: string }> = [
  {
    href: "/platform",
    title: "Platform Tour",
    desc: "A full walkthrough of how Serve By Example trains staff and gives managers real-time visibility.",
  },
  {
    href: "/platform#features",
    title: "Features",
    desc: "Scenario simulators, rapid-fire quizzes, tap-based challenges, and AI coaching — all in one platform.",
  },
  {
    href: "/platform#insights",
    title: "Manager Console",
    desc: "Live dashboards, audit-ready metrics, and squad-level performance analysis.",
  },
];

const solutionsLinks = [
  {
    href: "/for-venues",
    title: "Overview",
    desc: "How Serve By Example fits into your venue operations end to end.",
  },
  {
    href: "/solutions/pub-groups",
    title: "Pubs",
    desc: "Standardise brand guidelines and scale training across multi-site pub teams.",
  },
  {
    href: "/solutions/fine-dining",
    title: "Bars",
    desc: "Complex recipe specs, cellar logic, and premium service recovery.",
  },
  {
    href: "/solutions/hotel-fb",
    title: "Hotels",
    desc: "Consistent service standards across restaurant, bar, and room service teams.",
  },
  {
    href: "/solutions/franchise-systems",
    title: "Franchises",
    desc: "Speed of service, upselling workflows, and high-turnover cost reduction.",
  },
];

const resourcesLinks = [
  {
    href: "/roi",
    title: "ROI Calculator",
    desc: "Estimate the training ROI for your venue in under a minute.",
  },
  {
    href: "/resources/sop-toolkit",
    title: "Free SOP Checklist",
    desc: "Download a venue-specific staff onboarding SOP template.",
  },
  {
    href: "/vs-generic-lms",
    title: "vs Generic LMS",
    desc: "See how Serve By Example compares to off-the-shelf LMS tools.",
  },
  {
    href: "/roadmap",
    title: "Product Roadmap",
    desc: "What we're building next and when.",
  },
];

export default function Navbar({
  showActions = true,
  showTextLogin = false,
  showNavbarLanguageOnMobile: _showNavbarLanguageOnMobile = true,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"platform" | "solutions" | "resources" | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<"platform" | "solutions" | "resources" | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = useCallback((menu: "platform" | "solutions" | "resources") => {
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
            <Image src="/logo.webp" alt="Serve By Example" width={40} height={40} quality={50} className="brand-mark-img" />
            <div className="brand-copy">
              <span className="brand-title">Serve By Example</span>
            </div>
          </Link>

          <nav className="nav-links">
            {/* How It Works */}
            <Link href="/how-it-works">How It Works</Link>

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
                      key={item.title}
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

            {/* Resources dropdown */}
            <div
              className="nav-item-wrapper"
              onMouseEnter={() => openDropdown("resources")}
              onMouseLeave={scheduleClose}
            >
              <button
                className={`nav-dropdown-trigger${openMenu === "resources" ? " active" : ""}`}
                aria-expanded={openMenu === "resources"}
                aria-haspopup="true"
                aria-controls="nav-resources-dropdown"
                onClick={() => setOpenMenu(openMenu === "resources" ? null : "resources")}
              >
                Resources
                <ChevronDown className="nav-chevron" size={14} strokeWidth={2.5} />
              </button>
              {openMenu === "resources" && (
                <div id="nav-resources-dropdown" className="mega-menu" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                  {resourcesLinks.map((item) => (
                    <Link
                      key={item.title}
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

            <Link href="/how-it-works" className="nav-drawer-link" onClick={close}>
              How It Works
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
                  <Link key={item.title} href={item.href} className="nav-drawer-sub-link" onClick={close}>
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Resources accordion */}
            <button
              className="nav-drawer-link nav-drawer-accordion"
              onClick={() => setMobileExpanded(mobileExpanded === "resources" ? null : "resources")}
            >
              Resources
              <ChevronDown
                className={`nav-chevron${mobileExpanded === "resources" ? " rotated" : ""}`}
                size={16}
                strokeWidth={2.5}
              />
            </button>
            {mobileExpanded === "resources" && (
              <div className="nav-drawer-sub">
                {resourcesLinks.map((item) => (
                  <Link key={item.title} href={item.href} className="nav-drawer-sub-link" onClick={close}>
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/pricing" className="nav-drawer-link" onClick={close}>
              Pricing
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
