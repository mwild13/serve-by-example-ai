import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WaitlistSection from "@/components/WaitlistSection";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        {/* ── Hero ──────────────────────────────────── */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <span className="eyebrow">AI-Powered Hospitality Training</span>
              <h1>
                Train bartenders and venue&nbsp;teams faster&nbsp;with&nbsp;AI
              </h1>
              <p className="hero-sub">
                Interactive hospitality training for bartending, service, sales
                and management&nbsp;— available anytime, anywhere.
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

            <div className="hero-stats">
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

        {/* ── Product Preview (Dashboard Mockup) ──── */}
        <section className="section product-preview">
          <div className="container">
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
                      <span>3 modules in progress</span>
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
                    <div className="mockup-card">
                      <div className="mockup-card-top">
                        <div className="mockup-card-icon">📋</div>
                        <span className="mockup-card-status new">New</span>
                      </div>
                      <div className="mockup-card-title">Shift Leadership</div>
                      <div className="mockup-progress">
                        <div
                          className="mockup-bar low"
                          style={{ width: "18%" }}
                        />
                      </div>
                      <div className="mockup-card-meta">18% complete</div>
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

        {/* ── Who It's For ─────────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Who It&rsquo;s For</span>
              <h2>Training that fits every role in hospitality</h2>
              <p>
                Whether you&rsquo;re behind the bar, on the floor, or running
                the shift&nbsp;— Serve By Example adapts to your needs.
              </p>
            </div>
            <div className="audience-grid">
              <article className="audience-card">
                <div className="audience-icon">🍹</div>
                <h3>Bartenders</h3>
                <p>
                  Master cocktails, speed, service flow and product knowledge
                  through real-world AI scenarios.
                </p>
              </article>
              <article className="audience-card">
                <div className="audience-icon">⭐</div>
                <h3>Hospitality Staff</h3>
                <p>
                  Build confidence in upselling, customer interaction and
                  front-of-house excellence.
                </p>
              </article>
              <article className="audience-card">
                <div className="audience-icon">🏢</div>
                <h3>Venues &amp; Groups</h3>
                <p>
                  Onboard faster, train consistently and track team progress
                  across every location.
                </p>
              </article>
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
                <div className="step-num">1</div>
                <h3>Choose your pathway</h3>
                <p>
                  Pick bartending, service, sales or management&nbsp;— or create
                  a custom plan for your team.
                </p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3>Train with AI scenarios</h3>
                <p>
                  Practice real conversations, service situations and
                  decision-making with an AI coach that adapts to you.
                </p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3>Track and improve</h3>
                <p>
                  See progress, get feedback and level up with every session.
                  Managers get team-wide dashboards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Training Categories ──────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Training Modules</span>
              <h2>Built for high-performance venue teams</h2>
              <p>
                Real scenarios, rapid feedback and role-based pathways for bars,
                restaurants and hospitality groups.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">🍸</div>
                <h4>Bartending Training</h4>
                <p>
                  Learn cocktails, spirits, service rhythm and practical bar
                  systems your team can apply immediately.
                </p>
                <ul className="feature-list">
                  <li>Classic &amp; modern cocktail builds</li>
                  <li>Speed and efficiency drills</li>
                  <li>Product knowledge &amp; recommendations</li>
                </ul>
              </article>
              <article className="feature-card">
                <div className="feature-icon">💰</div>
                <h4>Sales Training</h4>
                <p>
                  Strengthen upselling, menu language and customer interaction
                  with AI-guided roleplay.
                </p>
                <ul className="feature-list">
                  <li>Upselling prompts &amp; techniques</li>
                  <li>Menu description mastery</li>
                  <li>Customer objection handling</li>
                </ul>
              </article>
              <article className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Management Training</h4>
                <p>
                  Build leadership confidence, enforce standards and improve
                  shift decisions under pressure.
                </p>
                <ul className="feature-list">
                  <li>Shift planning &amp; delegation</li>
                  <li>Staff performance reviews</li>
                  <li>Conflict resolution scenarios</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── Why AI Training ──────────────────────── */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Why AI Training</span>
              <h2>
                Better than static courses, cheaper than&nbsp;consultants
              </h2>
            </div>
            <div className="comparison-grid">
              <div className="comparison-col bad">
                <h3>Traditional Training</h3>
                <ul>
                  <li>One-size-fits-all content</li>
                  <li>Expensive in-person sessions</li>
                  <li>No practice or feedback</li>
                  <li>Hard to scale across venues</li>
                  <li>Staff forget within weeks</li>
                </ul>
              </div>
              <div className="comparison-col good">
                <h3>Serve By Example AI</h3>
                <ul>
                  <li>Adaptive, role-based pathways</li>
                  <li>Available 24/7, fraction of the cost</li>
                  <li>Real-time AI feedback &amp; coaching</li>
                  <li>Scales to any team size</li>
                  <li>Spaced repetition for retention</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing Preview ──────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Pricing</span>
              <h2>Simple plans that scale with&nbsp;you</h2>
              <p>Start free. Upgrade when you&rsquo;re ready.</p>
            </div>
            <div className="pricing-grid">
              <div className="price-card">
                <div className="price-tier">Starter</div>
                <div className="price-amount">Free</div>
                <p className="price-desc">
                  Try the demo modules and see what AI training can do.
                </p>
                <ul>
                  <li>3 demo scenarios</li>
                  <li>Basic progress tracking</li>
                  <li>Email support</li>
                </ul>
                <Link href="/demo" className="btn btn-secondary btn-block">
                  Start Free
                </Link>
              </div>
              <div className="price-card featured">
                <div className="price-badge">Most Popular</div>
                <div className="price-tier">Professional</div>
                <div className="price-amount">
                  $19<span>/month</span>
                </div>
                <p className="price-desc">
                  Full access for individual bartenders and hospitality pros.
                </p>
                <ul>
                  <li>All training modules</li>
                  <li>Unlimited AI coaching</li>
                  <li>Progress analytics</li>
                  <li>Certificate of completion</li>
                </ul>
                <Link href="/pricing" className="btn btn-primary btn-block">
                  Get Started
                </Link>
              </div>
              <div className="price-card">
                <div className="price-tier">Venue</div>
                <div className="price-amount">
                  $149<span>/month</span>
                </div>
                <p className="price-desc">
                  Train your entire team with management dashboards.
                </p>
                <ul>
                  <li>Up to 25 team members</li>
                  <li>Custom training pathways</li>
                  <li>Team progress dashboard</li>
                  <li>Priority support</li>
                </ul>
                <Link href="/pricing" className="btn btn-secondary btn-block">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header center">
              <h2>Frequently asked questions</h2>
            </div>
            <div className="faq-list">
              <details className="faq-item">
                <summary>
                  What kind of training does Serve By Example offer?
                </summary>
                <p>
                  We offer AI-powered interactive training for bartending,
                  sales, customer service and venue management. Each module uses
                  real-world scenarios and conversational AI to help staff
                  practice and improve.
                </p>
              </details>
              <details className="faq-item">
                <summary>Is this suitable for complete beginners?</summary>
                <p>
                  Absolutely. Our pathways adapt to every skill level&nbsp;—
                  from day-one trainees to experienced bartenders looking to
                  sharpen specific skills.
                </p>
              </details>
              <details className="faq-item">
                <summary>
                  How is this different from watching training videos?
                </summary>
                <p>
                  Videos are passive. Serve By Example is interactive&nbsp;— you
                  practice conversations, make decisions and get immediate AI
                  feedback, just like having a personal coach.
                </p>
              </details>
              <details className="faq-item">
                <summary>Can I use this to train my whole team?</summary>
                <p>
                  Yes. Our Venue plan lets you onboard and train up to 25 team
                  members with a management dashboard to track everyone&rsquo;s
                  progress.
                </p>
              </details>
              <details className="faq-item">
                <summary>Is there a free trial?</summary>
                <p>
                  Yes&nbsp;— you can try our demo modules completely free, no
                  credit card required.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────── */}
        <section className="section section-cta">
          <div className="container cta-box">
            <div>
              <h3>Ready to train smarter?</h3>
              <p>
                Launch your first team pathway in minutes and give every staff
                member a clear plan to level up.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/demo" className="btn btn-gold btn-lg">
                Try the Free Demo
              </Link>
              <Link href="/pricing" className="btn btn-outline-light btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <WaitlistSection />
      </main>

      <Footer />
    </div>
  );
}
