import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "AI",
    title: "AI Scenario Training",
    description:
      "Staff practice real hospitality situations through guided AI roleplay — upselling, de-escalation, cocktail knowledge, service recovery.",
  },
  {
    icon: "→",
    title: "Role-Based Learning Paths",
    description:
      "Tailor training to bartenders, floor staff, sales-focused team members and managers. Each role gets a targeted pathway.",
  },
  {
    icon: "◈",
    title: "Live Performance Tracking",
    description:
      "Track progress across service, product knowledge, and sales skills. Real data shows you who is on-track and who needs support.",
  },
  {
    icon: "✦",
    title: "AI Coach (Ask Anything)",
    description:
      "A venue AI coach answers management questions in plain language. Ask who needs training this week and get an instant answer.",
  },
  {
    icon: "◆",
    title: "Gamification & Badges",
    description:
      "Staff earn milestone badges for completion, skill mastery, and top performance. Portable digital credentials boost engagement.",
  },
  {
    icon: "▣",
    title: "Multi-Venue Management",
    description:
      "Manage multiple sites from a single console. Compare venue health scores, spot group-wide skill gaps, and standardize training.",
  },
];

const dashboardStats = [
  { label: "Avg training completion", value: "87%", trend: "↑ 12% this month" },
  { label: "Scenario score (sales)", value: "74%", trend: "↑ 9%" },
  { label: "Upsell performance", value: "68%", trend: "↑ 15%" },
  { label: "Active staff this week", value: "14/16", trend: "2 need follow-up" },
];

const coachQuestions = [
  "Who hasn't completed their alcohol training?",
  "Which staff have the lowest sales scores?",
  "What's our average scenario score this week?",
  "Show me staff who need upselling practice.",
];

const productBlocks = [
  {
    icon: "◉",
    heading: "For staff",
    points: [
      "Short, mobile-first learning modules",
      "Realistic scenario-based practice",
      "Instant AI feedback on every response",
      "Earn badges and track your own progress",
    ],
  },
  {
    icon: "≡",
    heading: "For managers",
    points: [
      "Full staff roster with skill analytics",
      "Ask the AI coach about your team instantly",
      "Assign targeted training by role or gap",
      "Multi-venue health score comparison",
    ],
  },
  {
    icon: "◆",
    heading: "For venues",
    points: [
      "Faster onboarding with starter templates",
      "Stronger and more consistent service standards",
      "Revenue impact from better upsell performance",
      "Scalable from single bar to group rollout",
    ],
  },
];

const stats = [
  { value: "90%", label: "Mobile completion rate" },
  { value: "3×", label: "Faster onboarding vs traditional" },
  { value: "+15%", label: "Avg upsell improvement" },
  { value: "2026", label: "Built for the AI training era" },
];

export default function PlatformPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="inner-hero">
          <div className="container">
            <span className="eyebrow">Platform tour</span>
            <h1>
              AI-powered hospitality training that actually moves the needle.
            </h1>
            <p className="inner-hero-sub">
              Serve By Example gives your team scenario-based practice, live performance tracking, and
              an AI coach that knows your venue — all from a single management console.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Demo
              </Link>
              <Link href="/management/login" className="btn btn-secondary btn-lg">
                Manager Login
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing Section ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Pricing</span>
              <h2>Simple, transparent pricing for every team size</h2>
            </div>
            <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, maxWidth: 700, margin: "0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="price-card featured">
                  <div className="price-tier">Free Demo</div>
                  <div className="price-amount">Free</div>
                  <ul>
                    <li>Try all core features</li>
                    <li>Scenario-based training</li>
                    <li>Basic progress tracking</li>
                  </ul>
                  <Link href="/demo" className="btn btn-primary btn-block">Start Free</Link>
                </div>
                <div className="price-card">
                  <div className="price-tier">Pro</div>
                  <div className="price-amount">$19/mo</div>
                  <ul>
                    <li>Full access for individuals</li>
                    <li>Progress analytics</li>
                    <li>AI Coach Q&A</li>
                    <li>Earn badges</li>
                  </ul>
                  <Link href="/pricing" className="btn btn-secondary btn-block">Join Pro</Link>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="price-card">
                  <div className="price-tier">Single Venue</div>
                  <div className="price-amount">$49/mo</div>
                  <ul>
                    <li>All Pro features for your team</li>
                    <li>Staff analytics dashboard</li>
                    <li>Manager controls</li>
                    <li>Email support</li>
                  </ul>
                  <Link href="/pricing" className="btn btn-secondary btn-block">Join Now</Link>
                </div>
                <div className="price-card">
                  <div className="price-tier">Multi Venue</div>
                  <div className="price-amount">$149/mo</div>
                  <ul>
                    <li>All Single Venue features</li>
                    <li>Multi-site management</li>
                    <li>Group analytics</li>
                    <li>Dedicated onboarding</li>
                  </ul>
                  <Link href="/pricing" className="btn btn-secondary btn-block">Join Now</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="section-tight section-alt">
          <div className="container">
            <div className="platform-stats-row">
              {stats.map((stat) => (
                <div key={stat.label} className="platform-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dashboard Preview ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Management console</span>
              <h2>Your venue&rsquo;s mission control.</h2>
              <p>A live dashboard that shows staff performance, training completion, upsell trends, and venue health — all in one view.</p>
            </div>
            <div className="platform-dashboard-mockup">
              <div className="platform-dash-sidebar">
                <div className="platform-dash-logo">Venue operations</div>
                {["Overview", "Staff", "Training", "AI Coach", "Analytics", "Settings"].map((item) => (
                  <div key={item} className={`platform-dash-nav-item${item === "Overview" ? " active" : ""}`}>{item}</div>
                ))}
              </div>
              <div className="platform-dash-main">
                <div className="platform-dash-header">
                  <strong>Venue performance mission control</strong>
                  <span className="platform-dash-badge live">Live data</span>
                </div>
                <div className="platform-dash-kpis">
                  {dashboardStats.map((stat) => (
                    <div key={stat.label} className="platform-dash-kpi">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <small className="platform-dash-trend">{stat.trend}</small>
                    </div>
                  ))}
                </div>
                <div className="platform-dash-ai-preview">
                  <div className="platform-dash-ai-head">
                    <span>✦ Ask AI Coach</span>
                  </div>
                  <div className="platform-dash-ai-suggestions">
                    {coachQuestions.map((q) => (
                      <span key={q} className="platform-dash-ai-chip">{q}</span>
                    ))}
                  </div>
                  <div className="platform-dash-ai-response">
                    <span className="platform-dash-ai-label">✦ AI Coach</span>
                    <p>Sarah (Bartender) and James (Floor) haven&rsquo;t completed their sales training module. Their upsell scores are below the venue average — I&rsquo;d recommend assigning &ldquo;Sales Conversations&rdquo; this week.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">What&rsquo;s inside</span>
              <h2>Everything your team needs to perform at their best.</h2>
            </div>
            <div className="card-grid card-grid-3">
              {features.map((feature) => (
                <article key={feature.title} className="info-card platform-feature-card">
                  <span className="platform-feature-icon">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Three Layers ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Built for every level</span>
              <h2>One platform, three layers of value.</h2>
            </div>
            <div className="card-grid card-grid-3">
              {productBlocks.map((block) => (
                <article key={block.heading} className="info-card">
                  <span style={{ fontSize: "1.8rem", display: "block", marginBottom: 8 }}>{block.icon}</span>
                  <h3>{block.heading}</h3>
                  <ul className="check-list">
                    {block.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mobile-first ── */}
        <section className="section section-alt">
          <div className="container platform-mobile-section">
            <div className="platform-mobile-text">
              <span className="eyebrow">Mobile-first training</span>
              <h2>Your staff live on their phones. Your training should too.</h2>
              <p>
                Every scenario, coaching interaction, and progress dashboard is fully optimised for mobile.
                Staff can complete training between shifts, at the bar, or on the way to work.
                Platforms built this way achieve <strong>90%+ completion rates</strong> with frontline teams.
              </p>
              <ul className="check-list" style={{ marginTop: 16 }}>
                <li>Scenarios fully functional on a 6-inch screen</li>
                <li>AI Coach accessible with a single tap</li>
                <li>Progress badges shareable to LinkedIn</li>
                <li>Managers get push alerts for team milestones</li>
              </ul>
              <div style={{ marginTop: 24 }}>
                <Link href="/demo" className="btn btn-primary">Try it on your phone →</Link>
              </div>
            </div>
            <div className="platform-mobile-visual">
              <div className="platform-phone-mockup">
                <div className="platform-phone-screen">
                  <div className="platform-phone-top">
                    <span>Serve By Example</span>
                    <span>✦ AI Coach</span>
                  </div>
                  <div className="platform-phone-scenario">
                    <p className="platform-phone-label">Today&rsquo;s scenario</p>
                    <strong>Upsell challenge</strong>
                    <p>A customer orders a house vodka. Guide them toward a premium option.</p>
                  </div>
                  <div className="platform-phone-badges">
                    <span className="ops-badge ops-badge-earned">Training Complete</span>
                    <span className="ops-badge ops-badge-earned">Sales Champion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Integrations ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Coming in V2 — Late 2026</span>
              <h2>Connects with the tools your venue already uses.</h2>
              <p>Serve By Example V2 will integrate directly with your POS, scheduling, and ordering platforms — no manual data entry, no double-handling.</p>
            </div>

            <div className="integrations-category-grid">
              <div className="integrations-category">
                <span className="integrations-category-label">POS &amp; Payments</span>
                <div className="integrations-logo-row">
                  {["Lightspeed", "Square", "SwiftPOS", "Ordermate", "Zeller"].map((name) => (
                    <div key={name} className="integration-logo-chip">
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="integrations-category">
                <span className="integrations-category-label">Order &amp; Table Management</span>
                <div className="integrations-logo-row">
                  {["me\u0026u", "Doshii"].map((name) => (
                    <div key={name} className="integration-logo-chip">
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="integrations-category">
                <span className="integrations-category-label">Workforce Management</span>
                <div className="integrations-logo-row">
                  {["Tanda", "Deputy"].map((name) => (
                    <div key={name} className="integration-logo-chip">
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--text-soft)", marginTop: 32 }}>
              All integrations are planned for the Serve By Example V2 release, scheduled for late 2026.
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>The market is moving to AI-powered training. You&rsquo;re already there.</h3>
              <p>
                Major hospitality platforms are just now beginning to build what Serve By Example already has.
                Your window of competitive advantage is now — while the incumbents are still in the planning phase.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/demo" className="btn btn-gold btn-lg">
                Start Free Demo
              </Link>
              <Link href="/for-venues" className="btn btn-outline-light btn-lg">
                For Venues
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}