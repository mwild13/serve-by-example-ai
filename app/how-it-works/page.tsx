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
                <div style={{ maxWidth: "300px", margin: "0 auto", borderRadius: "32px", overflow: "hidden", border: "6px solid #1a3322", boxShadow: "0 24px 64px rgba(0,0,0,0.7)", background: "#F0EBE0" }}>

                  {/* Header bar */}
                  <div style={{ background: "#0B2B1E", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B2B1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 22h8M7 2h10l-2 8H9z"/><line x1="12" y1="10" x2="12" y2="22"/>
                        </svg>
                      </div>
                      <span style={{ color: "white", fontSize: "0.58rem", fontWeight: 900, letterSpacing: "0.18em" }}>SERVE BY EXAMPLE</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f97316" stroke="none"><path d="M12 2C8 8 4 10 4 15a8 8 0 0 0 16 0c0-5-4-7-8-13z"/></svg>
                      <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 800 }}>4D</span>
                    </div>
                  </div>

                  {/* Scrollable content */}
                  <div style={{ background: "#F0EBE0", padding: "16px 14px 0" }}>

                    {/* PRE-SHIFT BRIEF label */}
                    <p style={{ margin: "0 0 9px", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.13em", color: "#9c8e7e", textTransform: "uppercase" }}>Pre-Shift Brief</p>

                    {/* Pre-shift card */}
                    <div style={{ background: "white", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                      <div style={{ display: "inline-block", border: "1.5px solid #d6cdc0", borderRadius: "5px", padding: "2px 8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em", color: "#5a4f44", textTransform: "uppercase" }}>Pre-Shift Brief</span>
                      </div>
                      <h3 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 900, color: "#111827", lineHeight: 1.2 }}>Welcome back, Alex</h3>
                      <p style={{ margin: "0 0 14px", fontSize: "0.775rem", color: "#6b6056", lineHeight: 1.55 }}>You&rsquo;re on a 4-day streak. Today&rsquo;s brief takes under 3 minutes.</p>
                      <div style={{ background: "#0B2B1E", borderRadius: "10px", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                        <span style={{ color: "white", fontSize: "0.8rem", fontWeight: 700 }}>Start Pre-Shift Warm-Up</span>
                      </div>
                    </div>

                    {/* STRENGTHEN YOUR WEAKNESS label */}
                    <p style={{ margin: "0 0 9px", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.13em", color: "#9c8e7e", textTransform: "uppercase" }}>Strengthen Your Weakness</p>

                    {/* Course card */}
                    <div style={{ background: "white", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                      <h4 style={{ margin: "0 0 5px", fontSize: "0.9rem", fontWeight: 800, color: "#111827" }}>Bartending Fundamentals</h4>
                      <p style={{ margin: "0 0 9px", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.07em", color: "#9c8e7e", textTransform: "uppercase" }}>62% Complete &middot; Next: Stage 3 Scenario</p>
                      <div style={{ background: "#e5ded4", borderRadius: "4px", height: "5px", marginBottom: "12px" }}>
                        <div style={{ background: "#0B2B1E", width: "62%", height: "100%", borderRadius: "4px" }} />
                      </div>
                      <p style={{ margin: 0, fontSize: "0.825rem", fontWeight: 700, color: "#0B2B1E" }}>Start Stage 3 Scenario &rarr;</p>
                    </div>

                    {/* QUICK ACCESS label */}
                    <p style={{ margin: "0 0 9px", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.13em", color: "#9c8e7e", textTransform: "uppercase" }}>Quick Access</p>

                    {/* Quick access tiles */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingBottom: "14px" }}>
                      <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", marginBottom: "8px" }}>
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        <p style={{ margin: "0 0 3px", fontSize: "0.85rem", fontWeight: 800, color: "#111827" }}>Modules</p>
                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#9c8e7e" }}>Stage-based learning</p>
                      </div>
                      <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", marginBottom: "8px" }}>
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                        <p style={{ margin: "0 0 3px", fontSize: "0.85rem", fontWeight: 800, color: "#111827" }}>Quick Drills</p>
                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#9c8e7e" }}>60-sec recall quizzes</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom nav */}
                  <div style={{ background: "white", borderTop: "1px solid #e8e0d5", padding: "10px 6px 6px", display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
                    {[
                      { label: "HOME", active: true, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
                      { label: "MODULES", active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
                      { label: "DRILLS", active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                      { label: "LIBRARY", active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8M7 2h10l-2 8H9z"/><line x1="12" y1="10" x2="12" y2="22"/></svg> },
                      { label: "ME", active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                    ].map(({ label, active, icon }) => (
                      <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", flex: 1 }}>
                        {active && <div style={{ width: "20px", height: "2.5px", background: "#c9a84c", borderRadius: "2px", marginBottom: "2px" }} />}
                        <div style={{ color: active ? "#0B2B1E" : "#9c8e7e" }}>{icon}</div>
                        <span style={{ fontSize: "0.45rem", fontWeight: 800, letterSpacing: "0.08em", color: active ? "#0B2B1E" : "#9c8e7e", textTransform: "uppercase" }}>{label}</span>
                      </div>
                    ))}
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
