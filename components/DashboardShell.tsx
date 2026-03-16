"use client";

import { useState } from "react";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";
import DashboardTrainer from "@/components/DashboardTrainer";
import CocktailLibrary from "@/components/CocktailLibrary";

type NavItem = "home" | "bartending" | "sales" | "management" | "scenarios" | "cocktails" | "progress" | "settings";

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "bartending", label: "Bartending Training" },
  { id: "sales", label: "Sales Training" },
  { id: "management", label: "Management Training" },
  { id: "scenarios", label: "Mock Scenarios" },
  { id: "cocktails", label: "Cocktail Library" },
  { id: "progress", label: "Progress" },
  { id: "settings", label: "Settings" },
];

const TRAINER_MODULES: Partial<Record<NavItem, "bartending" | "sales" | "management">> = {
  home: undefined,
  bartending: "bartending",
  sales: "sales",
  management: "management",
};

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🚧</div>
      <h2 style={{ marginBottom: 8 }}>{label}</h2>
      <p style={{ color: "var(--text-soft)" }}>
        This module is coming soon. Keep training with the modules available now!
      </p>
    </div>
  );
}

export default function DashboardShell({
  displayName,
  plan,
}: {
  displayName: string;
  plan: string;
}) {
  const [activeNav, setActiveNav] = useState<NavItem>("home");

  const isTrainerNav = activeNav in TRAINER_MODULES;
  const defaultModule = TRAINER_MODULES[activeNav];

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Image src="/logo.ico" alt="SBE AI" width={38} height={38} style={{ borderRadius: 10, marginBottom: 8 }} />

        <div className="mockup-nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`mockup-nav-item${activeNav === item.id ? " active" : ""}`}
              onClick={() => setActiveNav(item.id)}
              style={{ cursor: "pointer" }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            background: "white",
            border: "1px solid #e7decb",
            borderRadius: 22,
            padding: 18,
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>
            {plan === "venue" ? "Venue plan" : plan === "pro" ? "Pro plan" : "Free plan"}
          </strong>
          <div style={{ color: "var(--text-soft)", fontSize: ".95rem" }}>
            {plan === "free"
              ? "Demo access. Upgrade to unlock full modules."
              : "Pro member access with bartender, sales and management modules."}
          </div>
        </div>

        <SignOutButton />
      </aside>

      <section className="dashboard-main">
        {isTrainerNav ? (
          <DashboardTrainer
            key={activeNav}
            displayName={displayName}
            defaultModule={defaultModule}
          />
        ) : activeNav === "cocktails" ? (
          <CocktailLibrary />
        ) : (
          <ComingSoon label={NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? activeNav} />
        )}
      </section>

      <aside className="dashboard-right">
        <h3 className="side-panel-title">Recent training</h3>

        <div className="history-item">
          <strong>Negroni build</strong>
          <span>Ingredients, garnish and confident guest language.</span>
        </div>

        <div className="history-item">
          <strong>Upselling drill</strong>
          <span>Moving a house pour to a premium recommendation.</span>
        </div>

        <div className="history-item">
          <strong>Late staff scenario</strong>
          <span>Manager response and standards conversation.</span>
        </div>

        <div className="history-item">
          <strong>Busy service simulation</strong>
          <span>Prioritising tickets, guests and team communication.</span>
        </div>
      </aside>
    </main>
  );
}
