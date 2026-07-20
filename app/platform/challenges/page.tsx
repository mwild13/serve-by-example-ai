import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Challenges | Serve By Example",
  description:
    "Tap-based hospitality training mini-games. Sequence sorts, recipe builds, match pairs, and scenario responses. No typing, no exam pressure.",
  alternates: { canonical: "/platform/challenges" },
};

const formats = [
  {
    number: "01",
    title: "Sequence Sort",
    desc: "Arrange multi-step tasks in the correct order. A Guinness round, a wine and cocktail pour. Staff learn operational workflow without memorising a checklist.",
    tag: "Workflow",
  },
  {
    number: "02",
    title: "Fill the Blank",
    desc: "Reconstruct a cocktail recipe or service procedure from a word bank. Tap a blank, pick the right term. No typing, just fast, tactile recall.",
    tag: "Recipe Knowledge",
  },
  {
    number: "03",
    title: "Match Pair",
    desc: "Link cocktails to their glassware, wines to their regions, or complaints to their correct responses. Two-column tap interaction that builds instant pattern recognition.",
    tag: "Association",
  },
  {
    number: "04",
    title: "Spot the Error",
    desc: "A recipe card or service procedure has one deliberate mistake. Staff tap what is wrong. Trains quality control instincts faster than any written test.",
    tag: "Quality Control",
  },
  {
    number: "05",
    title: "Multiple Choice Scenario",
    desc: "A guest interaction plays out. Three response options appear. Staff choose the best one under time pressure, building instinct before they ever face the situation for real.",
    tag: "Service",
  },
];

const metrics = [
  { value: "65%", label: "faster completion vs written inputs" },
  { value: "40%", label: "higher knowledge retention" },
  { value: "< 45s", label: "average time per challenge" },
];

export default function ChallengesMarketingPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section
          style={{
            background: "var(--bg)",
            padding: "6rem 1.5rem 5rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <div
              style={{
                display: "inline-block",
                padding: "0.35rem 1rem",
                background: "var(--green-light)",
                color: "var(--green-deep)",
                borderRadius: "999px",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1.75rem",
                border: "1px solid var(--green-mid)",
              }}
            >
              Experimental Learning Engine
            </div>
            <h1
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.15,
                marginBottom: "1.5rem",
              }}
            >
              Training that feels like a game
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-soft)",
                lineHeight: 1.75,
                maxWidth: "640px",
                margin: "0 auto 2.5rem",
              }}
            >
              Interactive Challenges replaces the blank text box with five tap-based mini-game formats. Built for the 18–25 cohort who learn faster through doing than reading, designed to fit in a 45-second break between orders.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "0.8rem 2rem",
                  background: "var(--green)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                Try it in the dashboard
              </Link>
              <Link
                href="/demo"
                style={{
                  display: "inline-block",
                  padding: "0.8rem 2rem",
                  background: "transparent",
                  color: "var(--text)",
                  border: "1.5px solid var(--line)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                Book a demo
              </Link>
            </div>
          </div>
        </section>

        {/* Product Preview */}
        <section style={{ background: "var(--bg-alt)", padding: "5rem 1.5rem", overflow: "hidden" }}>
          <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--green)",
                  marginBottom: "0.75rem",
                }}
              >
                Live inside the dashboard
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)",
                  fontWeight: 700,
                  color: "var(--text)",
                  lineHeight: 1.2,
                  marginBottom: "0.85rem",
                }}
              >
                What staff actually see
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text-soft)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
                Tap-based. No keyboard. Every format renders instantly on any screen, from the staff break room to the bar.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.75rem",
                alignItems: "start",
              }}
            >
              {/* Preview 1: Sequence Sort */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                {/* Dashboard chrome */}
                <div
                  style={{
                    background: "var(--green-deep)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Sequence Sort
                  </span>
                </div>

                <div style={{ padding: "1.25rem" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.5, marginBottom: "1rem" }}>
                    A Guinness, a Margarita, and a Pinot Grigio arrive simultaneously. What order do you build them?
                  </p>

                  {[
                    { n: 1, label: "Start the Guinness pour", active: true },
                    { n: 2, label: "Build the Margarita", active: false },
                    { n: 3, label: "Pour the Pinot Grigio", active: false },
                    { n: 4, label: "Top up the Guinness", active: false },
                  ].map((row) => (
                    <div
                      key={row.n}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        padding: "0.65rem 0.75rem",
                        background: row.active ? "var(--green-light)" : "var(--bg-alt)",
                        border: `1px solid ${row.active ? "var(--green-mid)" : "var(--line)"}`,
                        borderRadius: "var(--radius-md)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <div
                        style={{
                          width: "1.4rem",
                          height: "1.4rem",
                          borderRadius: "50%",
                          background: row.active ? "var(--green)" : "var(--green-light)",
                          color: row.active ? "white" : "var(--green)",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {row.n}
                      </div>
                      <span style={{ flex: 1, fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>{row.label}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px", opacity: 0.4 }}>
                        <span style={{ fontSize: "0.55rem", color: "var(--text-muted)" }}>▲</span>
                        <span style={{ fontSize: "0.55rem", color: "var(--text-muted)" }}>▼</span>
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.55rem 1rem",
                      background: "var(--green)",
                      color: "white",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Verify Order
                  </div>
                </div>
              </div>

              {/* Preview 2: Multiple Choice */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    background: "var(--green-deep)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Multiple Choice
                  </span>
                </div>

                <div style={{ padding: "1.25rem" }}>
                  {/* Guest bubble */}
                  <div
                    style={{
                      background: "var(--bg-alt)",
                      border: "1.5px solid var(--line)",
                      borderRadius: "var(--radius-lg)",
                      borderTopLeftRadius: "4px",
                      padding: "0.85rem 1rem",
                      marginBottom: "1rem",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "-10px",
                        left: "0.75rem",
                        background: "var(--text)",
                        color: "var(--surface)",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      Guest
                    </span>
                    <p style={{ fontFamily: "var(--font-fraunces)", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.45, marginTop: "0.2rem" }}>
                      Their wine glass has a lipstick mark on the rim. What do you do?
                    </p>
                  </div>

                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", borderLeft: "3px solid var(--gold)", paddingLeft: "0.6rem", marginBottom: "0.85rem" }}>
                    Choose the best immediate response.
                  </p>

                  {[
                    { text: "\"I'll let the bar team know.\"", state: "wrong" },
                    { text: "\"I'm so sorry, let me replace that immediately.\"", state: "correct" },
                    { text: "\"That must have been there before. I'll wipe it.\"", state: "neutral" },
                  ].map((opt, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        padding: "0.7rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        border: `1.5px solid ${opt.state === "correct" ? "var(--green)" : opt.state === "wrong" ? "var(--gold)" : "var(--line)"}`,
                        background: opt.state === "correct" ? "var(--green-light)" : opt.state === "wrong" ? "var(--gold-light)" : "var(--bg-alt)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: `2px solid ${opt.state === "correct" ? "var(--green)" : "var(--line)"}`,
                          background: opt.state === "correct" ? "var(--green)" : "transparent",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {opt.state === "correct" && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}
                      </div>
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: opt.state === "correct" ? "var(--green-deep)" : "var(--text)", lineHeight: 1.4 }}>{opt.text}</span>
                      {opt.state === "correct" && (
                        <span style={{ marginLeft: "auto", background: "var(--green)", color: "white", fontSize: "0.6rem", fontWeight: 800, padding: "2px 7px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
                          Best
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview 3: Match Pair */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    background: "var(--green-deep)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Match Pair
                  </span>
                </div>

                <div style={{ padding: "1.25rem" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "1rem", lineHeight: 1.45 }}>
                    Match each cocktail to its correct glassware.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {/* Left column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {[
                        { label: "Margarita", matched: true },
                        { label: "Old Fashioned", matched: true },
                        { label: "Mojito", matched: false, active: true },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            padding: "0.6rem 0.65rem",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${item.matched ? "var(--green-mid)" : item.active ? "var(--green)" : "var(--line)"}`,
                            background: item.matched ? "var(--green-light)" : item.active ? "var(--green-light)" : "var(--bg-alt)",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: item.matched || item.active ? "var(--green-deep)" : "var(--text)",
                            textAlign: "center",
                          }}
                        >
                          {item.label}
                          {item.matched && <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--green-mid)", marginTop: "1px" }}>Matched</div>}
                        </div>
                      ))}
                    </div>

                    {/* Right column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {[
                        { label: "Coupe glass", matched: true },
                        { label: "Rocks glass", matched: true },
                        { label: "Highball glass", matched: false },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            padding: "0.6rem 0.65rem",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${item.matched ? "var(--green-mid)" : "var(--line)"}`,
                            background: item.matched ? "var(--green-light)" : "var(--bg-alt)",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: item.matched ? "var(--green-deep)" : "var(--text)",
                            textAlign: "center",
                          }}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.65rem 0.85rem",
                      background: "var(--green-light)",
                      border: "1px solid var(--green-mid)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <p style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--green-deep)", marginBottom: "0.25rem" }}>2 of 3 matched</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--green-deep)", lineHeight: 1.5 }}>Mojito selected. Now tap its glass.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics strip */}
        <section
          style={{
            background: "var(--green)",
            padding: "2.5rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "2rem",
              textAlign: "center",
            }}
          >
            {metrics.map((m) => (
              <div key={m.label}>
                <div
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "2.25rem",
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1,
                    marginBottom: "0.4rem",
                  }}
                >
                  {m.value}
                </div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The 5 formats */}
        <section style={{ background: "var(--bg-alt)", padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "1rem",
                }}
              >
                Five Challenge Formats
              </h2>
              <p style={{ fontSize: "1rem", color: "var(--text-soft)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
                No typing required. Just tap, drag, and learn. Every format completes in under 45 seconds and works on any screen size.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {formats.map((f) => (
                <div
                  key={f.number}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--line)",
                        lineHeight: 1,
                      }}
                    >
                      {f.number}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--gold)",
                        background: "var(--gold-light)",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        border: "1px solid var(--gold-light)",
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "0.6rem",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-soft)", lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data section */}
        <section style={{ background: "var(--bg)", padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto" }}>

            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "1rem",
                  lineHeight: 1.2,
                }}
              >
                The Data Behind The Shift
              </h2>
              <p style={{ fontSize: "1rem", color: "var(--text-soft)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
                Why are we abandoning essay formats for interactive layouts? The analytics demonstrate significant improvements across all critical learning vectors for the 18–25 demographic.
              </p>
            </div>

            {/* Row 1: Performance metrics + Radar chart */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Performance Vector Analysis */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--line-light)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Performance Vector Analysis
                </h3>

                {[
                  {
                    label: "Completion Speed",
                    badge: "+65% Faster",
                    badgeColor: "var(--green-deep)",
                    badgeBg: "var(--green-light)",
                    desc: "Interactive tapping removes the friction of typing, drastically reducing time-to-completion per challenge.",
                  },
                  {
                    label: "Knowledge Retention",
                    badge: "+40% Higher",
                    badgeColor: "var(--green-deep)",
                    badgeBg: "var(--green-light)",
                    desc: "Visual associations (like dragging items or matching pairs) create stronger memory anchors than plain text reading.",
                  },
                  {
                    label: "Task Enjoyment",
                    badge: "Significantly Up",
                    badgeColor: "var(--gold)",
                    badgeBg: "var(--gold-light)",
                    desc: "By mimicking mechanics found in casual mobile games, the training process feels less like mandatory work.",
                  },
                ].map((metric, i) => (
                  <div
                    key={metric.label}
                    style={{
                      paddingBottom: i < 2 ? "1.25rem" : 0,
                      marginBottom: i < 2 ? "1.25rem" : 0,
                      borderBottom: i < 2 ? "1px solid var(--line-light)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>{metric.label}</span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background: metric.badgeBg,
                          color: metric.badgeColor,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {metric.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-soft)", lineHeight: 1.6 }}>{metric.desc}</p>
                  </div>
                ))}
              </div>

              {/* Radar chart */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <svg
                  viewBox="0 0 300 260"
                  style={{ width: "100%", flex: 1 }}
                  aria-hidden="true"
                >
                  {/* Grid pentagons */}
                  {[
                    "150,116 168,129 161,150 139,150 132,129",
                    "150,98 186,123 172,165 128,165 114,123",
                    "150,79 204,118 183,181 117,181 97,118",
                    "150,60 221,112 194,196 106,196 79,112",
                  ].map((pts, i) => (
                    <polygon
                      key={i}
                      points={pts}
                      fill="none"
                      stroke="#d4cfc4"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axis lines from center */}
                  {[
                    "150,135 150,60",
                    "150,135 221,112",
                    "150,135 194,196",
                    "150,135 106,196",
                    "150,135 79,112",
                  ].map((pts, i) => (
                    <line
                      key={i}
                      x1={pts.split(" ")[0].split(",")[0]}
                      y1={pts.split(" ")[0].split(",")[1]}
                      x2={pts.split(" ")[1].split(",")[0]}
                      y2={pts.split(" ")[1].split(",")[1]}
                      stroke="#d4cfc4"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Legacy data polygon */}
                  <polygon
                    points="150,107 176,127 169,161 128,165 124,127"
                    fill="rgba(169,129,42,0.12)"
                    stroke="rgba(169,129,42,0.5)"
                    strokeWidth="1.5"
                  />

                  {/* Interactive data polygon */}
                  <polygon
                    points="150,70 209,116 184,182 113,186 99,118"
                    fill="rgba(31,78,55,0.12)"
                    stroke="#1f4e37"
                    strokeWidth="2"
                  />

                  {/* Axis dot markers – interactive */}
                  {[
                    [150, 70], [209, 116], [184, 182], [113, 186], [99, 118],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="#1f4e37" />
                  ))}

                  {/* Axis dot markers – legacy */}
                  {[
                    [150, 107], [176, 127], [169, 161], [128, 165], [124, 127],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2.5" fill="none" stroke="rgba(169,129,42,0.7)" strokeWidth="1.5" />
                  ))}

                  {/* Labels */}
                  <text x="150" y="46" textAnchor="middle" fontSize="9" fill="#6b6459" fontWeight="700">Workflow</text>
                  <text x="150" y="56" textAnchor="middle" fontSize="9" fill="#6b6459" fontWeight="700">Accuracy</text>

                  <text x="234" y="108" textAnchor="start" fontSize="9" fill="#6b6459" fontWeight="700">Knowledge</text>
                  <text x="234" y="118" textAnchor="start" fontSize="9" fill="#6b6459" fontWeight="700">Retention</text>

                  <text x="200" y="212" textAnchor="middle" fontSize="9" fill="#6b6459" fontWeight="700">Task</text>
                  <text x="200" y="222" textAnchor="middle" fontSize="9" fill="#6b6459" fontWeight="700">Engagement</text>

                  <text x="100" y="212" textAnchor="middle" fontSize="9" fill="#6b6459" fontWeight="700">Completion</text>
                  <text x="100" y="222" textAnchor="middle" fontSize="9" fill="#6b6459" fontWeight="700">Speed</text>

                  <text x="66" y="108" textAnchor="end" fontSize="9" fill="#6b6459" fontWeight="700">User</text>
                  <text x="66" y="118" textAnchor="end" fontSize="9" fill="#6b6459" fontWeight="700">Enjoyment</text>
                </svg>

                {/* Legend */}
                <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "0.5rem" }}>
                  {[
                    { color: "rgba(169,129,42,0.5)", fill: "transparent", label: "Legacy Text Inputs" },
                    { color: "#1f4e37", fill: "#1f4e37", label: "Interactive Formats" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <circle cx="6" cy="6" r="5" fill={item.fill === "transparent" ? "none" : "rgba(31,78,55,0.12)"} stroke={item.color} strokeWidth="1.5" />
                      </svg>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <p style={{ textAlign: "center", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginTop: "0.6rem" }}>
                  Comparative Vector Output
                </p>
              </div>
            </div>

            {/* Row 2: Bar chart + Micro-Burst text */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                alignItems: "start",
              }}
            >
              {/* Vertical bar chart */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    marginBottom: "2rem",
                  }}
                >
                  Time to Value (Seconds)
                </h3>

                <div style={{ display: "flex", gap: "0", position: "relative" }}>
                  {/* Y-axis */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column-reverse",
                      justifyContent: "space-between",
                      height: "160px",
                      paddingBottom: "24px",
                      marginRight: "0.5rem",
                    }}
                  >
                    {[0, 10, 20, 30, 40].map((v) => (
                      <span key={v} style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, lineHeight: 1 }}>
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* Bars */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "0.4rem",
                      height: "160px",
                      borderLeft: "1px solid var(--line-light)",
                      borderBottom: "1px solid var(--line-light)",
                      paddingLeft: "0.5rem",
                    }}
                  >
                    {[
                      { label: "Sequence Sort", seconds: 35, pct: 87.5, color: "#1f4e37" },
                      { label: "Fill the Blank", seconds: 25, pct: 62.5, color: "#2d7a52" },
                      { label: "Spot the Error", seconds: 20, pct: 50, color: "#a9812a" },
                      { label: "Match the Pair", seconds: 15, pct: 37.5, color: "#c4a04a" },
                      { label: "Multiple Choice", seconds: 12, pct: 30, color: "#9e9e8a" },
                    ].map((bar) => (
                      <div
                        key={bar.label}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: `${bar.pct}%`,
                            background: bar.color,
                            borderRadius: "3px 3px 0 0",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            color: "var(--text-soft)",
                            textAlign: "center",
                            marginTop: "0.4rem",
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {bar.label.split(" ").map((w, i) => (
                            <span key={i} style={{ display: "block" }}>{w}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Micro-Burst Learning text */}
              <div style={{ paddingTop: "0.5rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "1rem",
                    lineHeight: 1.2,
                  }}
                >
                  Micro-Burst Learning
                </h2>
                <p style={{ fontSize: "0.95rem", color: "var(--text-soft)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                  The core philosophy of the new engine is <strong>Micro-Burst Learning</strong>. By ensuring every challenge can be completed in under 45 seconds, we fit into the natural downtime of a hospitality shift: during a commute, waiting for a manager, or before a brief.
                </p>

                {/* Architectural Note callout */}
                <div
                  style={{
                    borderLeft: "3px solid var(--gold)",
                    paddingLeft: "1rem",
                    background: "var(--gold-light)",
                    borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                    padding: "1rem 1rem 1rem 1.1rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--gold)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Architectural Note
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.65 }}>
                    Formats requiring higher cognitive synthesis (Drag Sequence) take slightly longer but yield deeper workflow comprehension. Formats relying on quick recognition (Match Pair, Spot Error) are designed for rapid knowledge reinforcement.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: "var(--green-deep)",
            padding: "5rem 1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "620px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "white",
                marginBottom: "1rem",
              }}
            >
              Available now inside the dashboard
            </h2>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2rem" }}>
              Interactive Challenges is live for all staff accounts. Log in and find it under Challenges in the sidebar. No setup required.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "0.85rem 2.25rem",
                  background: "white",
                  color: "var(--green-deep)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                Open the dashboard
              </Link>
              <Link
                href="/membership"
                style={{
                  display: "inline-block",
                  padding: "0.85rem 2.25rem",
                  background: "transparent",
                  color: "white",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
