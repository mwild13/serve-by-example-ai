import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Challenges | Serve By Example",
  description:
    "Tap-based hospitality training mini-games. Sequence sorts, recipe builds, match pairs, and scenario responses — no typing, no exam pressure.",
};

const formats = [
  {
    number: "01",
    title: "Sequence Sort",
    desc: "Arrange multi-step tasks in the correct order. A Guinness round, a wine and cocktail pour — staff learn operational workflow without memorising a checklist.",
    tag: "Workflow",
  },
  {
    number: "02",
    title: "Fill the Blank",
    desc: "Reconstruct a cocktail recipe or service procedure from a word bank. Tap a blank, pick the right term. No typing — just fast, tactile recall.",
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
    desc: "A guest interaction plays out. Three response options appear. Staff choose the best one under time pressure — building instinct before they ever face the situation for real.",
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
              Training That Feels Like a Game
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
              Interactive Challenges replaces the blank text box with five tap-based mini-game formats. Built for the 18–25 cohort who learn faster through doing than reading — and designed to fit in a 45-second break between orders.
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

        {/* Philosophy section */}
        <section style={{ background: "var(--bg)", padding: "5rem 1.5rem" }}>
          <div
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.25rem)",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "1.25rem",
                  lineHeight: 1.2,
                }}
              >
                Micro-Burst Learning
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text-soft)", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                Every challenge fits inside the natural pauses of a hospitality shift — the wait before a brief, the commute in, the 5 minutes before doors open. No course modules. No login-logout sessions. Just one fast challenge and back to work.
              </p>
              <p style={{ fontSize: "0.95rem", color: "var(--text-soft)", lineHeight: 1.75 }}>
                Formats requiring higher cognitive synthesis (Sequence Sort) take slightly longer but yield deeper workflow understanding. Formats relying on quick recognition (Match Pair, Spot the Error) are optimised for rapid reinforcement.
              </p>
            </div>
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
                  marginBottom: "1.5rem",
                }}
              >
                Completion time by format
              </h3>
              {[
                { label: "Sequence Sort", seconds: 35, pct: 88 },
                { label: "Fill the Blank", seconds: 25, pct: 63 },
                { label: "Spot the Error", seconds: 20, pct: 50 },
                { label: "Match Pair", seconds: 15, pct: 38 },
                { label: "Multiple Choice", seconds: 12, pct: 30 },
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: "1.1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    <span>{row.label}</span>
                    <span style={{ color: "var(--text-muted)" }}>{row.seconds}s</span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "var(--bg-alt)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${row.pct}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--green), var(--green-mid))",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>
              ))}
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
              Interactive Challenges is live for all staff accounts. Log in and find it under Challenges in the sidebar — no setup required.
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
                href="/pricing"
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
