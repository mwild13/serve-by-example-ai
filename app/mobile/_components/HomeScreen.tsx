"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Flame, Swords, BrainCircuit, Martini } from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B.5 — dumb UI plus real navigation. Matches the Figma "home" frame
// 1:1 visually. Pre-Shift Warmup and Today's Hot Picks cards stay inert (no
// detail screen exists for either yet) — everything else routes.

const QUICK_ACCESS = [
  { label: "Challenges", icon: Swords, href: "/mobile/challenges" },
  { label: "101 Knowledge", icon: BrainCircuit, href: "/mobile/knowledge" },
  { label: "Cocktail Library", icon: Martini, href: "/mobile/cocktails" },
];

export default function HomeScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* hero-header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 20,
          }}
        >
          <Link href="/mobile/progress" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, overflow: "hidden", flexShrink: 0 }}>
              <Image src="/mobile/avatar.png" alt="" width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>Welcome back,</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>USERNAME</p>
            </div>
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--green-mobile-bg)",
            }}
          >
            <Flame size={16} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-mobile)" }}>12 Days</span>
          </div>
        </div>

        {/* pre-shift-brief */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "var(--radius-pill)",
                background: "var(--gold-mobile-bg)",
                flexShrink: 0,
              }}
            >
              <Bell size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--gold-mobile)" }}>
                Pre-Shift Warmup
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile)" }}>
                Tonight&apos;s Specials: Bordeaux &amp; Ribeye Pairings quiz ready.
              </p>
            </div>
          </div>
        </div>

        {/* todays-picks-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Today&apos;s Hot Picks</p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: "var(--radius-pill)",
                background: "var(--surface-mobile-inverse)",
                fontSize: 12,
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              <span style={{ color: "var(--green-mobile)" }}>S</span>
              <span style={{ color: "var(--gold-mobile)" }}>B</span>
              <span style={{ color: "var(--green-mobile)" }}>E</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
            {[
              { src: "/mobile/thumb-wine.png", category: "Wine pairing", title: "Upselling Bordeaux" },
              { src: "/mobile/thumb-cocktail.png", category: "Cocktail Craft", title: "Classic Refresher" },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  width: 220,
                  flexShrink: 0,
                  padding: 16,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                }}
              >
                <div style={{ width: "100%", height: 100, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  <Image src={card.src} alt="" width={188} height={100} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--gold-mobile)" }}>
                    {card.category}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-mobile)" }}>{card.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* continue-learning-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Continue Learning</p>
          <Link
            href="/mobile/learn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              textDecoration: "none",
            }}
          >
            <div style={{ width: 54, height: 54, borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
              <Image src="/mobile/module-cover.png" alt="" width={54} height={54} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-mobile)" }}>Spirits Masterclass</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Lesson 4 of 12 &middot; Whiskies of the World</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 100, height: 6, borderRadius: 3, background: "var(--surface-mobile-alt)", overflow: "hidden" }}>
                  <div style={{ width: "65%", height: "100%", background: "var(--gold-mobile)" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-mobile)" }}>65%</span>
              </div>
            </div>
          </Link>
        </div>

        {/* quick-access-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Quick Access Training</p>
          <div style={{ display: "flex", gap: 10 }}>
            {QUICK_ACCESS.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 12,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                  textDecoration: "none",
                }}
              >
                <Icon size={24} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mobile)", textAlign: "center" }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
