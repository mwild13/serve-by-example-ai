import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardMockup from "@/components/ui/DashboardMockup";

const steps = [
  {
    number: "01",
    title: "Choose a pathway",
    description:
      "Start with Beginner, Bartender, Sales or Management Training depending on the staff member\u2019s role and experience level.",
  },
  {
    number: "02",
    title: "Learn the essentials",
    description:
      "Complete short, practical learning modules covering service basics, drink knowledge, sales skills and decision-making.",
  },
  {
    number: "03",
    title: "Practice real scenarios",
    description:
      "Staff respond to realistic hospitality situations using AI-powered simulations designed to build confidence under pressure.",
  },
  {
    number: "04",
    title: "Get instant AI feedback",
    description:
      "Every response is scored against service criteria like communication, professionalism, problem-solving and guest experience.",
  },
  {
    number: "05",
    title: "Track progress over time",
    description:
      "Staff can see improvement, while managers get visibility across completion, strengths, gaps and overall team performance.",
  },
];

const pillars = [
  {
    title: "Beginner Training",
    text: "Build confidence with guest greetings, taking drink orders and basic drink knowledge.",
  },
  {
    title: "Bartender Training",
    text: "Improve cocktail knowledge, speed, workflow, consistency and bar setup habits.",
  },
  {
    title: "Sales Training",
    text: "Teach natural upselling, premium recommendations and suggestive selling without sounding pushy.",
  },
  {
    title: "Management Training",
    text: "Develop leadership, complaint handling, team communication and venue decision-making.",
  },
  {
    title: "Scenario Simulations",
    text: "The core AI feature where staff practice realistic service situations and receive coaching.",
  },
  {
    title: "Performance Tracking",
    text: "Measure growth across communication, drink knowledge, sales, problem-solving and team performance.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">How It Works</span>
            <h1>From onboarding to real-world confidence.</h1>
            <p className="inner-hero-sub">
              Serve By Example combines short learning modules, AI-powered
              scenario practice and performance tracking to help hospitality
              teams train faster and perform better on shift.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Demo
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* ── The Problem ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="split-grid">
              <div>
                <span className="eyebrow">The Problem</span>
                <h2 className="split-heading">
                  Most hospitality training is inconsistent and hard to scale.
                </h2>
              </div>
              <div className="split-body">
                <p>
                  New staff are often trained on the job, under pressure and
                  with limited manager time.
                </p>
                <p>
                  Traditional training is usually passive, one-size-fits-all
                  and difficult to apply during real service.
                </p>
                <p>
                  Serve By Example bridges that gap by letting staff practice
                  realistic service situations before they face them in venue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── The System (5 Steps) ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">The System</span>
              <h2>A simple training loop that improves with every session.</h2>
            </div>
            <div className="card-grid card-grid-5">
              {steps.map((step) => (
                <article key={step.number} className="info-card">
                  <span className="info-card-num">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Training Framework (6 Pillars) ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">The Training Framework</span>
              <h2>
                Built around six core parts of hospitality performance.
              </h2>
            </div>
            <div className="card-grid card-grid-3">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="info-card">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Example Scenario ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Example Scenario</span>
              <h2>See the product in one glance.</h2>
              <p style={{ maxWidth: "560px", margin: "0 auto" }}>
                Every response is scored instantly. Over time, the AI tracks your weak areas and resurfaces them — so improvement isn&rsquo;t left to chance.
              </p>
            </div>
            <div className="card-grid card-grid-3">
              <article className="info-card">
                <span className="info-card-label">Scenario</span>
                <p>
                  A guest approaches the bar while you&rsquo;re finishing
                  another drink. How do you acknowledge them?
                </p>
              </article>
              <article className="info-card">
                <span className="info-card-label">Staff response</span>
                <p>
                  &ldquo;Hi there, I&rsquo;ll be with you in just a
                  moment.&rdquo;
                </p>
              </article>
              <article className="info-card">
                <span className="info-card-label">AI feedback</span>
                <p>
                  Score: 22/25. Clear acknowledgement, friendly tone and good
                  guest awareness. A strong service response.
                </p>
              </article>
            </div>

            {/* How AI improves your score */}
            <div style={{
              marginTop: "2.5rem",
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: "16px",
              padding: "2rem 2.5rem",
            }}>
              <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 700, color: "#1b4332" }}>
                How AI improves your score over time
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
                {[
                  { n: "01", title: "Score every response", desc: "Rated across 5 dimensions: communication, hospitality, problem-solving, professionalism and guest experience." },
                  { n: "02", title: "Identify weak areas", desc: "The system flags dimensions where your score drops consistently — not just one-off mistakes." },
                  { n: "03", title: "Resurface weak areas automatically", desc: "Spaced repetition brings back scenarios in those areas at the right intervals — 1, 4, 9 and 16 days." },
                  { n: "04", title: "Adjust difficulty to your level", desc: "The ELO rating system matches you to harder scenarios as you improve — always training at your current edge." },
                ].map(({ n, title, desc }) => (
                  <div key={n} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "8px", background: "#2d6a4f", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>{n}</span>
                    <div>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.875rem", color: "#1b4332" }}>{title}</p>
                      <p style={{ margin: 0, fontSize: "0.825rem", color: "#374151", lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Consoles ── */}
        <section className="section" style={{ background: "#0B2B1E" }}>
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow" style={{ color: "#86efac" }}>Consoles</span>
              <h2 style={{ color: "white", marginBottom: "0.5rem" }}>See the platform in one glance.</h2>
              <p style={{ color: "#9ca3af", maxWidth: "560px", margin: "0 auto" }}>
                Two powerful tools working together — one for managers, one for staff.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginTop: "2.5rem", alignItems: "start" }}>

              {/* Management Console */}
              <div>
                <p style={{ color: "#d1fae5", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Management Console</p>
                <DashboardMockup />
              </div>

              {/* Staff Mobile Console */}
              <div>
                <p style={{ color: "#d1fae5", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Staff Mobile Console</p>
                <div style={{ maxWidth: "340px", margin: "0 auto", background: "#111827", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #374151", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
                  {/* Top bar */}
                  <div style={{ background: "linear-gradient(135deg, #0B2B1E 0%, #1b4332 100%)", padding: "16px 18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "8px", fontWeight: 900, color: "#0B2B1E", letterSpacing: "-0.5px" }}>SBE</span>
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem", fontWeight: 600 }}>Serve By Example</span>
                      </div>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      </div>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", margin: "0 0 2px" }}>Good morning</p>
                    <h4 style={{ color: "white", margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 700 }}>Alex</h4>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "7px 12px", textAlign: "center", flex: 1 }}>
                        <div style={{ color: "#86efac", fontSize: "0.95rem", fontWeight: 800 }}>1,240</div>
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.6rem", marginTop: "2px" }}>XP</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "7px 12px", textAlign: "center", flex: 1 }}>
                        <div style={{ color: "#fbbf24", fontSize: "0.95rem", fontWeight: 800 }}>5</div>
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.6rem", marginTop: "2px" }}>Day Streak</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "7px 12px", textAlign: "center", flex: 1 }}>
                        <div style={{ color: "white", fontSize: "0.95rem", fontWeight: 800 }}>72%</div>
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.6rem", marginTop: "2px" }}>Progress</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div style={{ padding: "14px 18px 10px", background: "#1a2332" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>Quick actions</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {[
                        { label: "S", name: "Scenarios" },
                        { label: "A", name: "AI Coach" },
                        { label: "T", name: "Modules" },
                        { label: "I", name: "Progress" },
                      ].map(({ label, name }) => (
                        <div key={label} style={{ background: "#0B2B1E", borderRadius: "10px", padding: "10px 4px 8px", textAlign: "center" }}>
                          <div style={{ color: "#86efac", fontWeight: 900, fontSize: "0.95rem" }}>{label}</div>
                          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.55rem", marginTop: "4px" }}>{name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Module cards */}
                  <div style={{ padding: "10px 18px 6px", background: "#1a2332" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>Current modules</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { title: "Cocktail Fundamentals", pct: 72, color: "#86efac" },
                        { title: "Upselling Mastery", pct: 45, color: "#fbbf24" },
                      ].map(({ title, pct, color }) => (
                        <div key={title} style={{ background: "#111827", borderRadius: "10px", padding: "10px 12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 600 }}>{title}</span>
                            <span style={{ color, fontSize: "0.7rem", fontWeight: 700 }}>{pct}%</span>
                          </div>
                          <div style={{ background: "#374151", borderRadius: "4px", height: "4px" }}>
                            <div style={{ background: color, width: `${pct}%`, height: "100%", borderRadius: "4px" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Coach */}
                  <div style={{ padding: "10px 18px 18px", background: "#1a2332" }}>
                    <div style={{ background: "#0B2B1E", borderRadius: "10px", padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#86efac" }} />
                        <span style={{ color: "#86efac", fontSize: "0.7rem", fontWeight: 700 }}>AI Training Coach</span>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.725rem", margin: 0, lineHeight: 1.5 }}>
                        A guest asks for a &ldquo;smooth but strong&rdquo; cocktail. What do you recommend and why?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>Ready to train smarter?</h3>
              <p>
                Give every staff member a clearer path to confidence,
                consistency and better service.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/demo" className="btn btn-gold btn-lg">
                Try the Demo
              </Link>
              <Link href="/for-venues" className="btn btn-outline-light btn-lg">
                Explore For Venues
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
