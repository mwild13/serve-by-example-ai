import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WaitlistSection from "@/components/ui/WaitlistSection";
import ROICalculator from "@/components/ui/ROICalculator";
import BrowserMockup from "@/components/ui/BrowserMockup";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar showActions={false} showTextLogin showNavbarLanguageOnMobile={false} />

      <main>
        {/* ── Hero (Split-Screen) ──────────────────── */}
        <section className="hero">
          <div className="container">
            <div className="hero-split">
              <div className="hero-left">
                <span className="eyebrow">AI-Powered Hospitality Training</span>
                <h1>
                  From 6 months of onboarding to 6 weeks with AI
                </h1>
                <p className="hero-sub">
                  Scenario-based training that turns staff into confident service pros. Bartenders master cocktail specs and upselling. Managers track team readiness in real-time. All powered by adaptive learning and AI coaching.
                </p>
                <div className="hero-actions">
                  <Link href="/demo" className="btn btn-primary btn-lg">
                    Try the Demo
                  </Link>
                  <Link href="/how-it-works" className="btn btn-secondary btn-lg">
                    How It Works
                  </Link>
                </div>
              </div>
              <div className="hero-right">
                <BrowserMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ── ROI Calculator (Sticky Lead Magnet) ──── */}
        <ROICalculator />

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
                <div className="stat-label">Faster Onboarding<br/><span style={{fontSize: '0.7rem', fontWeight: 400}}>6 months → 6 weeks</span></div>
              </article>
              <article className="stat-card">
                <div className="stat-value">65+</div>
                <div className="stat-label">Cocktail & Scenario<br/><span style={{fontSize: '0.7rem', fontWeight: 400}}>Training Content</span></div>
              </article>
              <article className="stat-card">
                <div className="stat-value">19</div>
                <div className="stat-label">Languages Supported<br/><span style={{fontSize: '0.7rem', fontWeight: 400}}>Global Training Ready</span></div>
              </article>
            </div>
          </div>
        </section>

        {/* ── THE SBE SYSTEM ─────────────────────────── */}
        <section className="section section-ecosystem">
          <div className="container">
            <div className="section-header center">
              <h2>Two Sides of One System</h2>
              <p>Unified learning for staff and real-time insights for managers.</p>
            </div>

            <div className="ecosystem-comparison">
              <div className="ecosystem-card">
                <div className="ecosystem-card-icon">👥</div>
                <h3>For Your Staff</h3>
                <p className="ecosystem-card-intro">A personal digital training campus.</p>
                <ul className="ecosystem-features">
                  <li>🎯 <strong>Interactive Scenarios:</strong> Realistic situations they&apos;ll face every shift</li>
                  <li>🤖 <strong>AI Coaching:</strong> Instant feedback on every response (24/7)</li>
                  <li>📊 <strong>Visible Progress:</strong> ELO ratings, skill levels, mastery badges</li>
                  <li>📚 <strong>Knowledge Hub:</strong> 65 cocktail specs + 26 reference articles</li>
                  <li>⚡ <strong>Smart Review:</strong> Spaced repetition resurfaces weak areas automatically</li>
                </ul>
              </div>

              <div className="ecosystem-card">
                <div className="ecosystem-card-icon">📊</div>
                <h3>For Your Venues</h3>
                <p className="ecosystem-card-intro">A command center for team readiness.</p>
                <ul className="ecosystem-features">
                  <li>👀 <strong>Real-Time Visibility:</strong> See team progress and compliance status instantly</li>
                  <li>⚠️ <strong>Smart Alerts:</strong> Know who&apos;s at risk, falling behind, or knowledge decay</li>
                  <li>🎓 <strong>Training Management:</strong> Assign programs, track completion across venues</li>
                  <li>🏆 <strong>Performance Insights:</strong> Leaderboards, upselling trends, service scores</li>
                  <li>🤖 <strong>Context-Aware AI:</strong> Coach gives venue-specific operational advice</li>
                </ul>
              </div>
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
              <span className="eyebrow">The 4-Stage Mastery Path</span>
              <h2>Progressive learning that sticks</h2>
            </div>
            <div className="steps-grid">
              <div className="step">
                <div className="step-illustration" aria-hidden="true">
                  1️⃣
                </div>
                <div className="step-num">Stage 1</div>
                <h3>Rapid-Fire Quiz</h3>
                <p>
                  Quick true/false questions to build foundational knowledge.
                  5 correct answers in a row = mastery.
                </p>
              </div>
              <div className="step">
                <div className="step-illustration" aria-hidden="true">
                  2️⃣
                </div>
                <div className="step-num">Stage 2</div>
                <h3>Descriptor Selection</h3>
                <p>
                  Pick 2 correct descriptors from 5 options for realistic scenarios.
                  Builds application of knowledge.
                </p>
              </div>
              <div className="step">
                <div className="step-illustration" aria-hidden="true">
                  3️⃣
                </div>
                <div className="step-num">Stage 3</div>
                <h3>Advanced Application</h3>
                <p>
                  Pick 3 descriptors from 5 (harder) with shuffled scenarios.
                  Proves deep understanding.
                </p>
              </div>
              <div className="step">
                <div className="step-illustration" aria-hidden="true">
                  4️⃣
                </div>
                <div className="step-num">Stage 4</div>
                <h3>AI Scenario Simulation</h3>
                <p>
                  Build your approach from 3 action pills. AI scores across 5 dimensions.
                  Immediate feedback on hospitality judgment.
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
                <h3>Bartenders & Mixologists</h3>
                <p className="audience-benefit">
                  Master cocktail specs, build speed under pressure, and develop confidence.
                </p>
                <div className="audience-examples">
                  <small><strong>Example:</strong> Practice Friday-night rush with 3 simultaneous orders</small>
                </div>
              </article>
              <article className="audience-card">
                <div className="audience-icon">⭐</div>
                <h3>Floor & Service Staff</h3>
                <p className="audience-benefit">
                  Improve service consistency, compliance, and upselling across every interaction.
                </p>
                <div className="audience-examples">
                  <small><strong>Example:</strong> Train on RSA, wine pairing, and premium spirit recommendations</small>
                </div>
              </article>
              <article className="audience-card">
                <div className="audience-icon">📋</div>
                <h3>Venue Managers & Groups</h3>
                <p className="audience-benefit">
                  Onboard teams 3× faster, track compliance, and manage multiple locations.
                </p>
                <div className="audience-examples">
                  <small><strong>Example:</strong> Monitor knowledge decay risk across 5 venues in real-time</small>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────── */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Powered by Mastery Engine</span>
              <h2>Intelligent learning that actually works</h2>
            </div>
            <div className="feature-grid feature-grid-3">
              <article className="feature-card">
                <div className="feature-icon">⭐</div>
                <h4>ELO Rating System</h4>
                <p>
                  Each scenario has a difficulty rating. Staff earn points by choosing harder scenarios and completing them correctly.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">🔄</div>
                <h4>Spaced Repetition</h4>
                <p>
                  Weak areas resurface automatically at the right time (1, 4, 9, 16 days) for long-term retention, not cramming.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">🧩</div>
                <h4>Confidence-Accuracy Tracking</h4>
                <p>
                  Identify true experts vs. lucky guessers vs. liabilities. Personalize coaching accordingly.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">🌉</div>
                <h4>Bridge Logic</h4>
                <p>
                  After 2 failures, the system offers easier scenarios to rebuild confidence before retrying.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">🤖</div>
                <h4>AI Evaluation (5 Dimensions)</h4>
                <p>
                  Scenarios scored across communication, hospitality, problem-solving, professionalism, and guest experience.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon">👀</div>
                <h4>Real-Time Manager Dashboard</h4>
                <p>
                  See team progress, compliance, knowledge decay risk, and leaderboards — all synced instantly.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Why SBE Works ──────────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Why SBE Works</span>
              <h2>The science behind faster learning</h2>
            </div>
            <div className="why-sbe-grid">
              <div className="why-sbe-card">
                <div className="why-sbe-icon">🎯</div>
                <h3>Spaced Repetition</h3>
                <p>
                  Decades of learning science prove that reviewing material at optimal intervals creates lasting memory. We resurface weak areas automatically — no cramming required.
                </p>
              </div>
              <div className="why-sbe-card">
                <div className="why-sbe-icon">📊</div>
                <h3>ELO Rating System</h3>
                <p>
                  Just like chess, staff face scenarios matched to their skill level. Pass a hard scenario? Your rating jumps. Struggle with easy ones? We adjust to help you improve faster.
                </p>
              </div>
              <div className="why-sbe-card">
                <div className="why-sbe-icon">🧠</div>
                <h3>Immediate Feedback</h3>
                <p>
                  AI evaluates every response in real-time across 5 dimensions. Staff learn what works immediately — no waiting for a manager&apos;s opinion or guessing if they got it right.
                </p>
              </div>
              <div className="why-sbe-card">
                <div className="why-sbe-icon">🎓</div>
                <h3>Progressive Difficulty</h3>
                <p>
                  The 4-stage path starts simple (true/false) and progresses to complex judgment calls. Each stage builds on the last — not a random quiz every time.
                </p>
              </div>
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
                  AUD $19<span>/month</span>
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
                  AUD $49<span>/month</span>
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
                  AUD $149<span>/month</span>
                </div>
                <p className="price-desc">
                  Manage multiple locations with unified dashboards.
                </p>
                <p className="price-fit">Who this is for: venue groups and multi-site operators.</p>
                <ul>
                  <li><strong>Up to 5 venues</strong></li>
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
              <span className="eyebrow">Early Access</span>
              <h2>Lock in founding member rates</h2>
              <p>Serve By Example is opening to its first venues now. Get early pricing, hands-on setup, and influence what gets built next.</p>
            </div>
            <div className="early-access-grid">
              <div className="early-access-card">
                <div className="early-access-card-icon">🔒</div>
                <h3>Lock-in Pricing Forever</h3>
                <p>
                  Pay <strong>AUD $49/venue</strong> today (vs. future <strong>AUD $79/venue</strong>). Your founding rate stays locked in as long as you&apos;re subscribed — guaranteed.
                </p>
              </div>
              <div className="early-access-card">
                <div className="early-access-card-icon">🤝</div>
                <h3>1-on-1 Onboarding</h3>
                <p>
                  We walk your team through setup personally. Get your first 10 staff trained in the first week — not a video tutorial.
                </p>
              </div>
              <div className="early-access-card">
                <div className="early-access-card-icon">💡</div>
                <h3>Shape the Roadmap</h3>
                <p>
                  Monthly calls with our product team. Your feedback directly influences what modules, features, and tools we build next.
                </p>
              </div>
            </div>
          </div>
        </section>

        <WaitlistSection
          eyebrow="Stay in the loop"
          title="Get notified when we launch."
          copy="No credit card required. We'll send you early access updates and launch-stage pricing — no spam."
          inputPlaceholder="your@email.com"
          buttonLabel="Notify me"
          successTitle="You're on the list."
          successCopy="We'll reach out with early access details and launch updates."
          successSteps={[
            "You'll receive launch updates and early access invites by email.",
            "Founding members lock in launch pricing for life.",
            "We'll walk you through onboarding personally when spots open.",
          ]}
        />

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
