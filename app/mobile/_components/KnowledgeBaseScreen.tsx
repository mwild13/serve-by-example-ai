"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B.5 — back button navigates via router.back(). Search stays
// non-functional and category pill selection is local UI state only, per
// the brief — no data fetching.

const CATEGORIES = ["All (31)", "Spirits 101 (15)", "Beer 101 (4)", "Wine 101 (4)", "Cocktails 101 (4)", "Non-Alcoholic 101 (4)"];

type KnowledgeCard = { title: string; snippet: string; tag: string };

const SPIRITS_101: KnowledgeCard[] = [
  {
    title: "What is Vodka?",
    snippet: "Vodka is a neutral spirit typically distilled from grains (wheat, rye, corn) or potatoes, filtered for high purity.",
    tag: "vodka",
  },
  {
    title: "Premium vs Well Vodka",
    snippet: "The difference between a well vodka and a premium expression lies in raw materials, distillation cycles, and charcoal filtration.",
    tag: "vodka",
  },
  {
    title: "What is Gin?",
    snippet: "Gin is a juniper-flavoured spirit made by redistilling a neutral base spirit with select botanicals and aromatics.",
    tag: "gin",
  },
  {
    title: "What is Rum?",
    snippet: "Rum is distilled from sugarcane juice or molasses. It ranges from light and crisp to dark, rich, and barrel-aged.",
    tag: "rum",
  },
  {
    title: "What is Tequila?",
    snippet: "Tequila is made from blue agave and must be produced in designated regions of Mexico, primarily Jalisco.",
    tag: "tequila",
  },
  {
    title: "What is Whiskey?",
    snippet: "Whiskey is a barrel-aged spirit made from fermented grain mash including barley, corn, rye, and wheat.",
    tag: "whiskey",
  },
];

export default function KnowledgeBaseScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

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
        {/* header-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>
              Knowledge Base
            </span>
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>101 Knowledge Base</p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: "var(--text-mobile-muted)" }}>
              31 quick-reference cards across 5 categories, the 101 Series.
            </p>
          </div>
        </div>

        {/* search-section */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <Search size={18} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              readOnly
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-mobile-muted)",
              }}
            />
          </div>
        </div>

        {/* category-scroller */}
        <div style={{ display: "flex", gap: 8, padding: "0 0 20px 20px", overflowX: "auto" }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-pill)",
                  border: isActive ? "1px solid var(--gold-mobile)" : "1px solid var(--border-mobile)",
                  background: isActive ? "var(--gold-mobile)" : "var(--surface-mobile)",
                  color: isActive ? "var(--bg-mobile-dark)" : "var(--text-mobile)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* cards-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Spirits 101
            </p>
            <div style={{ flex: 1, height: 1, background: "var(--border-mobile)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {SPIRITS_101.map((card) => (
              <div
                key={card.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 16,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-mobile)" }}>{card.title}</p>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: "var(--text-mobile-muted)" }}>{card.snippet}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: "var(--surface-mobile-alt)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--gold-mobile)",
                      textTransform: "uppercase",
                    }}
                  >
                    {card.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="learn" />
    </div>
  );
}
