"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TabBar, { type MobileNavTab } from "./TabBar";

// The frame of every /mobile screen (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md
// section 2.3).
//
// A tab screen opens on a large title. Once that scrolls under the top edge,
// a compact bar fades in with the title in the middle, as in iPhone apps.
// An IntersectionObserver on a marker under the title decides that, so
// nothing runs on scroll. A screen you drill into (`back`) has the compact
// bar from the start, with a back button.

export default function Screen({
  title,
  compactTitle,
  kicker,
  trailing,
  compactTrailing,
  tab,
  back,
  children,
}: {
  title: string;
  /** The compact bar's title, when it differs from the large one ("Home" under "Evening, Sam"). */
  compactTitle?: string;
  /** Small capitals above a large title, such as the date. */
  kicker?: ReactNode;
  /** Beside the large title. */
  trailing?: ReactNode;
  /** In the compact bar, on the right. */
  compactTrailing?: ReactNode;
  /** Shows the tab bar with this tab selected. */
  tab?: MobileNavTab;
  /** An inner screen: compact bar only, with a back button. `onClick` replaces the link, for a screen with steps of its own. */
  back?: { href: string; label: string; onClick?: () => void };
  children: ReactNode;
}) {
  const markerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  const large = !back;

  return (
    <div className="sm-screen">
      <div className="sm-frame">
        <header
          className={`sm-navbar${large ? " sm-navbar--collapsing" : ""}${collapsed ? " is-shown" : ""}`}
          aria-hidden={large && !collapsed ? true : undefined}
        >
          <div className="sm-navbar-row">
            <div className="sm-navbar-lead">
              {back?.onClick ? (
                <button type="button" className="sm-navbar-back" onClick={back.onClick}>
                  <ChevronLeft size={26} strokeWidth={2.4} aria-hidden="true" />
                  {back.label}
                </button>
              ) : (
                back && (
                  <Link href={back.href} className="sm-navbar-back">
                    <ChevronLeft size={26} strokeWidth={2.4} aria-hidden="true" />
                    {back.label}
                  </Link>
                )
              )}
            </div>
            {large ? (
              <span className="sm-navbar-title">{compactTitle ?? title}</span>
            ) : (
              <h1 className="sm-navbar-title">{title}</h1>
            )}
            <div className="sm-navbar-trail">{compactTrailing}</div>
          </div>
        </header>

        {large ? (
          <>
            <div className="sm-largetitle">
              <div className="sm-largetitle-text">
                {kicker && <p className="sm-kicker">{kicker}</p>}
                <h1 className="sm-title">{title}</h1>
              </div>
              {trailing}
            </div>
            <div ref={markerRef} className="sm-collapse-marker" aria-hidden="true" />
          </>
        ) : (
          <div className="sm-navbar-spacer" aria-hidden="true" />
        )}

        <main style={{ display: "flex", flexDirection: "column", flex: 1 }}>{children}</main>

        {tab && <TabBar active={tab} />}
      </div>
    </div>
  );
}
