import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar showActions={false} showTextLogin />

      <main>
        {/* ── Hero ──────────────────────────────────── */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <span className="eyebrow">AI-Powered Hospitality Training</span>
              <h1>
                Train bartenders and venue teams faster with AI
              </h1>
              <p className="hero-sub">
                Personalised, scenario-based training that improves service,
                compliance, and confidence in minutes, not months.
              </p>
              <div className="hero-actions">
                <Link href="/demo" className="btn btn-primary btn-lg">
                  Try the Demo
                </Link>
                <Link href="/how-it-works" className="btn btn-secondary btn-lg">
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust ──────────────────────────────── */}
        <section className="section trust-section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Trusted by Hospitality Teams</span>
              <h2>Built for venues that care about consistent standards</h2>
            </div>
            <div className="trust-stats">
              <article className="stat-card">
                <div className="stat-value">3×</div>
                <div className="stat-label">Faster Onboarding</div>
              </article>
              <article className="stat-card">
                <div className="stat-value">92%</div>
                <div className="stat-label">Completion Rate</div>
              </article>
              <article className="stat-card">
                <div className="stat-value">24/7</div>
                <div className="stat-label">AI Coach Access</div>
              </article>
            </div>
          </div>
        </section>

        {/* ── Product Value Pillars ─────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Why Teams Choose Us</span>
              <h2>Product value pillars that drive results</h2>
              <p>
                Built to improve team performance with practical, measurable
                outcomes.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">🎯</div>
                <h4>AI-Powered Scenarios</h4>
                <p>
                  Realistic training tailored to each staff member and their
                  role.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">⚡</div>
                <h4>Instant Feedback</h4>
                <p>
                  Staff learn exactly what to improve after every scenario.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Manager Insights</h4>
                <p>
                  Track progress and identify skill gaps across your whole team.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">🏢</div>
                <h4>Venue-Specific Modules</h4>
                <p>
                  Customise training to your venue&rsquo;s standards and service
                  style.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Product Preview (Dashboard Mockup) ──── */}
        <section className="section product-preview">
          <div className="container">
            <p className="mockup-caption">Your team&rsquo;s personalised training dashboard.</p>
            <div className="mockup-wrapper">
              <div className="app-mockup">
                <div className="mockup-sidebar">
                  <div className="mockup-logo">
                    <div className="mockup-logo-dot">SBE</div>
                    Serve By Example
                  </div>
                  <div className="mockup-nav-item active">
                    <span className="mockup-nav-icon">📊</span> Dashboard
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon">🍸</span> Bartending
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon">💬</span> Sales
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon">📋</span> Management
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon">📈</span> Progress
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon">⚙️</span> Settings
                  </div>
                </div>
                <div className="mockup-main">
                  <div className="mockup-header">
                    <h4>Welcome back, Alex</h4>
                    <div className="mockup-header-meta">
                      <span>2 modules in progress</span>
                      <div className="mockup-avatar" />
                    </div>
                  </div>
                  <div className="mockup-cards">
                    <div className="mockup-card">
                      <div className="mockup-card-top">
                        <div className="mockup-card-icon">🍸</div>
                        <span className="mockup-card-status in-progress">
                          In Progress
                        </span>
                      </div>
                      <div className="mockup-card-title">
                        Cocktail Fundamentals
                      </div>
                      <div className="mockup-progress">
                        <div
                          className="mockup-bar high"
                          style={{ width: "72%" }}
                        />
                      </div>
                      <div className="mockup-card-meta">72% complete</div>
                    </div>
                    <div className="mockup-card">
                      <div className="mockup-card-top">
                        <div className="mockup-card-icon">💬</div>
                        <span className="mockup-card-status in-progress">
                          In Progress
                        </span>
                      </div>
                      <div className="mockup-card-title">
                        Upselling Mastery
                      </div>
                      <div className="mockup-progress">
                        <div
                          className="mockup-bar mid"
                          style={{ width: "45%" }}
                        />
                      </div>
                      <div className="mockup-card-meta">45% complete</div>
                    </div>
                  </div>
                  <div className="mockup-chat">
                    <div className="mockup-chat-header">
                      <div className="mockup-chat-dot" />
                      AI Training Coach
                    </div>
                    <div className="mockup-chat-msg ai">
                      A customer asks for a &ldquo;strong but smooth&rdquo;
                      cocktail. What do you recommend and why?
                    </div>
                    <div className="mockup-chat-msg user">
                      I&rsquo;d suggest an Old Fashioned&nbsp;— it&rsquo;s
                      spirit-forward, smooth from the sugar and bitters, and
                      feels premium.
                    </div>
                    <div className="mockup-chat-msg ai">
                      Great choice! You&rsquo;ve identified the key attributes.
                      Let&rsquo;s explore how you&rsquo;d upsell the whisky
                      selection&hellip;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────── */}
        <section id="how-it-works" className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">How It Works</span>
              <h2>From sign-up to skill-up in&nbsp;minutes</h2>
            </div>
            <div className="steps-grid">
              <div className="step">
                <div className="step-illustration" aria-hidden="true">
                  🧭
                </div>
                <div className="step-num">1</div>
                <h3>Complete AI-driven scenarios</h3>
                <p>
                  Staff complete realistic scenarios built for bartending,
                  service and sales situations.
                </p>
              </div>
              <div className="step">
                <div className="step-illustration" aria-hidden="true">
                  🎭
                </div>
                <div className="step-num">2</div>
                <h3>Get instant coaching</h3>
                <p>
                  They receive immediate feedback and coaching on what to do
                  better next time.
                </p>
              </div>
              <div className="step">
                <div className="step-illustration" aria-hidden="true">
                  📈
                </div>
                <div className="step-num">3</div>
                <h3>Manage progress and assign modules</h3>
                <p>
                  Managers track progress, identify gaps and assign the right
                  modules for each team member.
                </p>
              </div>
            </div>
            <div className="steps-cta-wrap">
              <Link href="/demo" className="btn btn-primary">
                Start Your First Scenario
              </Link>
            </div>
          </div>
        </section>

        {/* ── Who It's For ─────────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Who It&rsquo;s For</span>
              <h2>Training that fits every role in hospitality</h2>
              <p>
                Clear pathways for frontline teams and leaders.
              </p>
            </div>
            <div className="audience-grid">
              <article className="audience-card">
                <div className="audience-icon">🍹</div>
                <h3>Bartenders</h3>
                <p className="audience-benefit">
                  Build speed, confidence and cocktail mastery with real-world
                  scenario practice.
                </p>
              </article>
              <article className="audience-card">
                <div className="audience-icon">⭐</div>
                <h3>Hospitality Staff</h3>
                <p className="audience-benefit">
                  Improve service consistency, guest experience and upselling
                  performance.
                </p>
              </article>
              <article className="audience-card">
                <div className="audience-icon">📋</div>
                <h3>Venue Managers</h3>
                <p className="audience-benefit">
                  Standardise training, track team readiness and close skill
                  gaps faster.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────── */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Features</span>
              <h2>Everything your team needs to train better</h2>
            </div>
            <div className="feature-grid feature-grid-3">
              <article className="feature-card">
                <div className="feature-icon">🧠</div>
                <h4>Adaptive Learning Paths</h4>
                <p>
                  Training adapts automatically by role, skill level and
                  performance trends.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">📝</div>
                <h4>Scenario Assignments</h4>
                <p>
                  Managers assign practical modules by shift goals or team skill
                  gaps.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">📍</div>
                <h4>Venue Standards Tracking</h4>
                <p>
                  Keep training aligned to your SOPs, service tone and brand
                  standards.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Pricing Preview ──────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">App Pricing</span>
              <h2>Simple, transparent pricing for every team size</h2>
              <p>Understand costs quickly and choose the best fit for your venue.</p>
            </div>
            <div className="pricing-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <div className="price-card">
                <div className="price-tier">Free Demo</div>
                <div className="price-amount">Free</div>
                <p className="price-desc">
                  Try the demo modules and see what AI training can do.
                </p>
                <p className="price-fit">Who this is for: individuals getting started.</p>
                <ul>
                  <li>3 demo scenarios</li>
                  <li>Basic progress tracking</li>
                  <li>Email support</li>
                </ul>
                <Link href="/demo" className="btn btn-primary btn-block starter-cta">
                  Start Free
                </Link>
              </div>
              <div className="price-card featured">
                <div className="price-badge">Most Popular</div>
                <div className="price-tier">Pro</div>
                <div className="price-amount">
                  $19<span>/month</span>
                </div>
                <p className="price-desc">
                  Full access for individual bartenders and hospitality pros.
                </p>
                <p className="price-fit">Who this is for: serious staff building career-ready skills.</p>
                <ul>
                  <li>All training modules</li>
                  <li>Unlimited AI coaching</li>
                  <li>Progress analytics</li>
                  <li>Certificate of completion</li>
                </ul>
                <Link href="/login" className="btn btn-primary btn-block">
                  Join Pro
                </Link>
              </div>
              <div className="price-card">
                <div className="price-tier">Single Venue</div>
                <div className="price-amount">
                  $49<span>/month</span>
                </div>
                <p className="price-desc">
                  Train one venue with team dashboards.
                </p>
                <p className="price-fit">Who this is for: small venues managing a single location.</p>
                <ul>
                  <li>One venue management</li>
                  <li>Team member logins</li>
                  <li>Basic dashboards</li>
                  <li>Progress tracking</li>
                  <li>Email support</li>
                </ul>
                <Link href="/for-venues#venue-enquiry" className="btn btn-secondary btn-block">
                  Request Access
                </Link>
              </div>
              <div className="price-card">
                <div className="price-tier">Multi-Venue</div>
                <div className="price-amount">
                  $149<span>/month</span>
                </div>
                <p className="price-desc">
                  Manage multiple locations with unified dashboards.
                </p>
                <p className="price-fit">Who this is for: venue groups and multi-site operators.</p>
                <ul>
                  <li>Up to 5 venues</li>
                  <li>Multiple user logins</li>
                  <li>Cross-venue comparison</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                </ul>
                <Link href="/for-venues#venue-enquiry" className="btn btn-secondary btn-block">
                  Request Multi-Venue
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Early Access ─────────────────────────── */}
        <section className="section early-access-section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Early access</span>
              <h2>Be a founding member</h2>
              <p>Serve By Example AI is opening to its first members now. Early access means hands-on onboarding, launch-stage pricing locked in, and direct input into what gets built next.</p>
            </div>
            <div className="early-access-grid">
              <div className="early-access-card">
                <div className="early-access-card-icon">🔒</div>
                <h3>Lock in launch pricing</h3>
                <p>Founding members keep their rate as long as they stay subscribed — even as the platform grows and pricing increases.</p>
              </div>
              <div className="early-access-card">
                <div className="early-access-card-icon">🤝</div>
                <h3>Hands-on onboarding</h3>
                <p>Early access comes with direct onboarding support — not a help doc — so your team is set up to train from day one.</p>
              </div>
              <div className="early-access-card">
                <div className="early-access-card-icon">💡</div>
                <h3>Shape what gets built</h3>
                <p>You tell us what the platform is missing. Early members have direct influence over the training modules and tools built next.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>Ready to train your team faster?</h3>
              <p className="cta-proof">No credit card required.</p>
            </div>
            <div className="cta-actions cta-actions-single">
              <Link href="/demo" className="btn btn-gold btn-lg">
                Try the Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
