import Link from "next/link";
import Image from "next/image";
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
              {[
                {
                  src: "/shots/Challenge Sequence Sort.png",
                  alt: "Serve By Example Sequence Sort challenge – ordering the steps to build three drinks that arrive at once",
                },
                {
                  src: "/shots/Challenge Multiple Choice.png",
                  alt: "Serve By Example Multiple Choice challenge – choosing the best immediate response to a guest complaint",
                },
                {
                  src: "/shots/Challenge Match Pair.png",
                  alt: "Serve By Example Match Pair challenge – matching cocktails to their correct glassware",
                },
              ].map((shot) => (
                <div
                  key={shot.src}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-xl)",
                    overflow: "hidden",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                  }}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={3024}
                    height={1654}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              ))}
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
                Every challenge, module, and scenario is scored the moment staff finish it — no separate reporting step, no manager chasing a paper checklist.
              </p>
            </div>

            {/* Row 1: Design rationale + real Modules screen */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Why tap-based */}
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
                  Why tap-based beats typing
                </h3>

                {[
                  {
                    label: "Faster to finish",
                    desc: "Interactive tapping removes the friction of typing, so staff get through a challenge in the gap between orders, not during a sit-down break.",
                  },
                  {
                    label: "Built for retention",
                    desc: "Visual associations, like matching a cocktail to its glass, create stronger memory anchors than reading a paragraph and answering from memory.",
                  },
                  {
                    label: "Feels less like homework",
                    desc: "By mimicking mechanics found in casual mobile games, the training process feels like a quick break, not mandatory paperwork.",
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
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>{metric.label}</span>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-soft)", lineHeight: 1.6 }}>{metric.desc}</p>
                  </div>
                ))}
              </div>

              {/* Real screen: Modules / mastery breakdown */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                <Image
                  src="/shots/Mastery Grid.png"
                  alt="Serve By Example training progress – certification hub showing modules mastered per category"
                  width={3024}
                  height={1654}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            </div>

            {/* Row 2: Real Overview screen + Micro-Burst text */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                alignItems: "start",
              }}
            >
              {/* Real screen: Progress overview */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                <Image
                  src="/shots/Progress Bar Chart.png"
                  alt="Serve By Example training progress overview – skill level, modules mastered, and badge collection"
                  width={3024}
                  height={1654}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
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
                  The core philosophy of the challenge engine is <strong>Micro-Burst Learning</strong>. Every format is designed to be finished in a couple of minutes, so it fits into the natural downtime of a hospitality shift: during a commute, waiting for a manager, or before a briefing.
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
                    Formats requiring higher cognitive synthesis (Sequence Sort) take slightly longer but yield deeper workflow comprehension. Formats relying on quick recognition (Match Pair, Multiple Choice) are designed for rapid knowledge reinforcement.
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
