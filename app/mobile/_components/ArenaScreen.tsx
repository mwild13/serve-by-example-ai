"use client";

import { Sparkles, Send } from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B skeleton — dumb UI only. Matches the Figma "ai-arena" frame 1:1
// visually; the response chips and composer do not submit anything yet.

type Metric = { label: string; value: string };

const METRICS: Metric[] = [
  { label: "Empathy", value: "85%" },
  { label: "Knowledge", value: "60%" },
  { label: "Resolution", value: "Pending" },
];

const SUGGESTED_REPLIES = ["Apologize & Validate", "Ask Taste Questions", "Offer Different Pour"];

export default function ArenaScreen() {
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
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Live Arena</p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile-bg)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold-mobile)" }}>PRO</span>
          </div>
        </div>

        {/* scenario-card */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 16,
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--gold-mobile)", textTransform: "uppercase" }}>
                Wine Complaint Handling
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--red-mobile)", whiteSpace: "nowrap" }}>DIFFICULTY: HARD</p>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
              Hostile table requesting refund due to subjective taste disappointment.
            </p>
          </div>
        </div>

        {/* metrics-row */}
        <div style={{ display: "flex", gap: 8, padding: "0 20px 16px" }}>
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                flex: 1,
                padding: 8,
                borderRadius: "var(--radius-sm)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-mobile-muted)" }}>{metric.label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-mobile)" }}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 20px 16px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "var(--radius-pill)",
                background: "var(--avatar-mobile-bg)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mobile)" }}>G</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxWidth: 260,
                padding: 12,
                borderRadius: "12px 12px 12px 4px",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)" }}>Guest (Table 4)</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: "18px", color: "var(--text-mobile)" }}>
                I ordered a Cabernet but this tastes nothing like what I usually get. I want a refund or something else
                immediately.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 20 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-mobile-muted)" }}>SUGGESTED RESPONSES</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTED_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--gold-mobile-bg)",
                    border: "1px solid var(--gold-mobile)",
                    color: "var(--gold-mobile)",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* input-dock */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 16,
            background: "var(--surface-mobile)",
            borderTop: "1px solid var(--border-mobile)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-mobile-dark)",
            }}
          >
            <input
              type="text"
              placeholder="Type custom customer response..."
              readOnly
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--text-mobile-muted)",
              }}
            />
          </div>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile)",
              border: "none",
              flexShrink: 0,
              cursor: "pointer",
            }}
            aria-label="Send response"
          >
            <Send size={16} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
          </button>
        </div>

        <BottomNav active="scenarios" />
      </div>
    </div>
  );
}
