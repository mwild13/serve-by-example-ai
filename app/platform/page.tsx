import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionSubNav from "@/components/SectionSubNav";
import MenuDrillGenerator from "@/components/MenuDrillGenerator";

const features = [
  {
    icon: "◉",
    title: "Scenario Training",
    description:
      "Staff practice real hospitality situations through guided scenario roleplay — upselling, de-escalation, cocktail knowledge, service recovery.",
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
      "The AI Coach answers management questions in plain language. Ask who needs training this week and get an instant answer.",
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
      "Instant scored feedback on every response",
      "Earn badges and track your own progress",
    ],
  },
  {
    icon: "≡",
    heading: "For managers",
    points: [
      "Full staff roster with skill analytics",
      "Ask the AI Coach about your team instantly",
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
  { value: "2026", label: "Built for modern hospitality training" },
];

export default function PlatformPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <div className="section-subnav-sentinel" aria-hidden="true" />
        <SectionSubNav items={[
          { id: "overview", label: "Overview" },
          { id: "insights", label: "Analytics" },
          { id: "arena", label: "AI Arena" },
          { id: "scenario-builder", label: "Scenario Builder" },
          { id: "mobile", label: "Mobile" },
        ]} />
        {/* ── Hero ── */}
        <section id="overview" className="inner-hero">
          <div className="container">
            <span className="eyebrow">Platform tour</span>
            <h1>
              Interactive hospitality training that actually moves the needle.
            </h1>
            <p className="inner-hero-sub">
              Serve By Example gives your team scenario-based practice, live performance tracking, and
              an AI Coach that knows your venue — all from a single management console.
            </p>
            <div className="inner-hero-actions">
              <Link href="/demo" className="btn btn-primary btn-lg">
                Try the Demo
              </Link>
              <Link href="/for-venues" className="btn btn-secondary btn-lg">
                For Venues
              </Link>
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
        <section id="insights" className="section">
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
        <section id="arena" className="section section-alt">
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

        {/* ── Scenario Builder ── */}
        <div id="scenario-builder">
          <MenuDrillGenerator />
        </div>

        {/* ── Three Layers ── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Three tools in one platform</span>
              <h2>What each layer actually does.</h2>
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
        <section id="mobile" className="section section-alt">
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
                <Link href="/pricing" className="btn btn-secondary">View Pricing →</Link>
              </div>
            </div>
            <div className="platform-mobile-visual">
              <Image
                src="/shots/Mobile View.png"
                alt="Serve By Example staff training app on mobile — pre-shift brief screen"
                width={390}
                height={780}
                sizes="(max-width: 768px) 80vw, 320px"
                style={{ width: "100%", maxWidth: "320px", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>The market is shifting to interactive, scenario-based training. You&rsquo;re already there.</h3>
              <p>
                Major hospitality platforms are just now beginning to build what Serve By Example already has.
                Your window of competitive advantage is now — while the incumbents are still in the planning phase.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/demo" className="btn btn-gold btn-lg">
                Try the Demo
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