import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WaitlistSection from "@/components/ui/WaitlistSection";
import ROICalculator from "@/components/ui/ROICalculator";
import BrowserMockup from "@/components/ui/BrowserMockup";
import DashboardMockup from "@/components/ui/DashboardMockup";

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IcoUsers({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IcoBuilding({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
    </svg>
  );
}

function IcoClipboard({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  );
}

function IcoBarChart({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function IcoPlay({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10,8 16,12 10,16"/>
    </svg>
  );
}

function IcoBot({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
      <line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
    </svg>
  );
}

function IcoBook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function IcoRefresh({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}

function IcoTrophy({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21"/>
      <line x1="12" y1="17" x2="12" y2="11"/>
      <path d="M7 4H4a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h.5"/>
      <path d="M17 4h3a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-.5"/>
      <rect x="7" y="2" width="10" height="10" rx="1"/>
    </svg>
  );
}

function IcoZap({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function IcoBrain({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    </svg>
  );
}

function IcoLayers({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  );
}

function IcoLock({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function IcoHandshake({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
      <path d="m21 3 1 11h-2"/>
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
      <path d="M3 4h8"/>
    </svg>
  );
}

function IcoCompass({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  );
}

function IcoGrid({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}

function IcoGlass({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8M7 2h10l-2 8H9z"/><line x1="12" y1="10" x2="12" y2="22"/>
    </svg>
  );
}

function IcoChat({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function IcoLineChart({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function IcoGear({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function IcoCalendar({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar showActions={false} showTextLogin showNavbarLanguageOnMobile={false} />

      <main>

        {/* ── Hero ─────────────────────────────────── */}
        <section className="hero">
          <div className="container">
            <div className="hero-split">
              <div className="hero-left">
                <span className="eyebrow">AI-Powered Hospitality Training</span>
                <h1>
                  From 6 months of onboarding to 6 weeks with AI
                </h1>
                <p className="hero-sub">
                  Scenario-based training that turns staff into confident service pros. Bartenders master cocktail specs and upselling. Managers track team readiness in real-time. All powered by adaptive learning and AI coaching
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

        {/* ── ROI Calculator ───────────────────────── */}
        <ROICalculator />

        {/* ── Trust Stats ──────────────────────────── */}
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
                <div className="stat-label">Cocktail &amp; Scenario<br/><span style={{fontSize: '0.7rem', fontWeight: 400}}>Training Content</span></div>
              </article>
              <article className="stat-card">
                <div className="stat-value">19</div>
                <div className="stat-label">Languages Supported<br/><span style={{fontSize: '0.7rem', fontWeight: 400}}>Global Training Ready</span></div>
              </article>
            </div>
          </div>
        </section>

        {/* ── The Complete Hospitality Solution ────── */}
        <section className="section section-ecosystem">
          <div className="container">
            <div className="section-header center">
              <h2>The Complete Hospitality Solution</h2>
              <p>One platform. Two powerful tools working together to lift your team and your venue.</p>
            </div>

            <div className="solution-grid">

              {/* Management Console Column */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoBuilding size={20} /></span>
                  <div>
                    <h3>Management Console</h3>
                    <p>Venue Performance Mission Control: Track team performance and compliance in real-time</p>
                  </div>
                </div>
                <DashboardMockup />
              </div>

              {/* Staff Column */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoUsers size={20} /></span>
                  <div>
                    <h3>For Your Staff</h3>
                    <p>Professional Development, On Demand: AI-powered training that scales with your venue</p>
                  </div>
                </div>
                <ul className="solution-features">
                  <li>
                    <span className="solution-feature-icon"><IcoPlay /></span>
                    <div>
                      <strong>Interactive Scenarios</strong>
                      <span>Realistic situations staff face every shift — guided by AI</span>
                    </div>
                  </li>
                  <li>
                    <span className="solution-feature-icon"><IcoBot /></span>
                    <div>
                      <strong>AI Coaching</strong>
                      <span>Instant personalised feedback on every response, available 24/7</span>
                    </div>
                  </li>
                  <li>
                    <span className="solution-feature-icon"><IcoBarChart /></span>
                    <div>
                      <strong>Visible Progress</strong>
                      <span>ELO ratings, skill levels, and mastery badges track real growth</span>
                    </div>
                  </li>
                  <li>
                    <span className="solution-feature-icon"><IcoBook /></span>
                    <div>
                      <strong>Knowledge Hub</strong>
                      <span>65 cocktail specs + 26 reference articles on demand</span>
                    </div>
                  </li>
                  <li>
                    <span className="solution-feature-icon"><IcoRefresh /></span>
                    <div>
                      <strong>Smart Review</strong>
                      <span>Spaced repetition resurfaces weak areas automatically</span>
                    </div>
                  </li>
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
                    <span className="mockup-nav-icon"><IcoGrid /></span> Dashboard
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon"><IcoGlass /></span> Bartending
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon"><IcoChat /></span> Sales
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon"><IcoClipboard size={14} /></span> Management
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon"><IcoLineChart /></span> Progress
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-nav-icon"><IcoGear /></span> Settings
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
                        <div className="mockup-card-icon"><IcoGlass size={16} /></div>
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
                        <div className="mockup-card-icon"><IcoChat size={16} /></div>
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
                      I&rsquo;d suggest an Old Fashioned&nbsp;&mdash; it&rsquo;s
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

        {/* ── Mastery Engine — 3-Step Process ─────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Powered by Mastery Engine</span>
              <h2>Intelligent learning that actually works</h2>
              <p>Three proven mechanisms working in combination to build lasting capability — not just passing scores.</p>
            </div>

            <div className="mastery-steps-flow">
              <div className="mastery-step-item">
                <div className="mastery-step-icon-wrap">
                  <IcoTrophy size={28} />
                </div>
                <div className="mastery-step-num">Step 1</div>
                <h3>Adaptive Skill-Level Matching</h3>
                <p>The ELO rating system matches each staff member to scenarios at their current level. Pass harder challenges and your rating climbs. Struggle and the system adjusts — always finding the optimal training edge.</p>
              </div>

              <div className="mastery-step-connector" aria-hidden="true">
                <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                  <path d="M0 8h32M26 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="mastery-step-item">
                <div className="mastery-step-icon-wrap">
                  <IcoCalendar size={28} />
                </div>
                <div className="mastery-step-num">Step 2</div>
                <h3>Automated Knowledge Retention</h3>
                <p>Spaced repetition resurfaces weak areas at the scientifically optimal intervals — 1, 4, 9, and 16 days. Staff don&rsquo;t cram. They retain. Knowledge decay is monitored and corrected automatically.</p>
              </div>

              <div className="mastery-step-connector" aria-hidden="true">
                <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                  <path d="M0 8h32M26 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="mastery-step-item">
                <div className="mastery-step-icon-wrap">
                  <IcoZap size={28} />
                </div>
                <div className="mastery-step-num">Step 3</div>
                <h3>Real-Time Performance Evaluation</h3>
                <p>AI scores every response across 5 dimensions: communication, hospitality, problem-solving, professionalism, and guest experience. Feedback is immediate — no waiting for a manager&rsquo;s opinion.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why SBE Works ──────────────────────────── */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">The Science Behind It</span>
              <h2>Why SBE produces results others can&rsquo;t</h2>
            </div>
            <div className="why-sbe-grid">
              <div className="why-sbe-card">
                <div className="why-sbe-icon why-sbe-icon-svg">
                  <IcoRefresh size={22} />
                </div>
                <h3>Spaced Repetition</h3>
                <p>
                  Decades of learning science prove that reviewing material at optimal intervals creates lasting memory. We resurface weak areas automatically &mdash; no cramming required.
                </p>
              </div>
              <div className="why-sbe-card">
                <div className="why-sbe-icon why-sbe-icon-svg">
                  <IcoTrophy size={22} />
                </div>
                <h3>ELO Rating System</h3>
                <p>
                  Just like chess, staff face scenarios matched to their skill level. Pass a hard scenario? Your rating jumps. Struggle with easy ones? We adjust to help you improve faster.
                </p>
              </div>
              <div className="why-sbe-card">
                <div className="why-sbe-icon why-sbe-icon-svg">
                  <IcoZap size={22} />
                </div>
                <h3>Immediate Feedback</h3>
                <p>
                  AI evaluates every response in real-time across 5 dimensions. Staff learn what works immediately &mdash; no waiting for a manager&rsquo;s opinion or guessing if they got it right.
                </p>
              </div>
              <div className="why-sbe-card">
                <div className="why-sbe-icon why-sbe-icon-svg">
                  <IcoLayers size={22} />
                </div>
                <h3>Progressive Difficulty</h3>
                <p>
                  The 4-stage path starts simple and progresses to complex judgment calls. Each stage builds on the last &mdash; not a random quiz every time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Pricing</span>
              <h2>Simple, transparent pricing for every team size</h2>
              <p>Choose the plan that fits your venue. No lock-in, no hidden fees.</p>
            </div>
            <div className="pricing-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>

              <div className="price-card">
                <div className="price-tier">Free Demo</div>
                <div className="price-amount">Free</div>
                <p className="price-desc">
                  Explore the training engine and see what AI-powered learning delivers.
                </p>
                <p className="price-fit">For individuals getting started.</p>
                <div className="price-cta-solo">
                  <Link href="/demo" className="btn btn-primary btn-block">
                    See the Engine in Action
                  </Link>
                </div>
              </div>

              <div className="price-card featured">
                <div className="price-badge">Most Popular</div>
                <div className="price-tier">Pro</div>
                <div className="price-amount">
                  AUD $19<span>/month</span>
                </div>
                <p className="price-desc">
                  Full access for individual bartenders and hospitality professionals.
                </p>
                <p className="price-fit">For serious staff building career-ready skills.</p>
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

              <div className="price-card price-card-recommended">
                <div className="price-badge-recommended">Recommended</div>
                <div className="price-tier">Single Venue</div>
                <div className="price-amount">
                  AUD $49<span>/month</span>
                </div>
                <p className="price-desc">
                  Full Command Center and staff training for one venue.
                </p>
                <p className="price-fit">For venues ready to professionalise their training.</p>
                <ul>
                  <li>Full manager dashboard</li>
                  <li>Unlimited staff logins</li>
                  <li>All training modules</li>
                  <li>AI coaching &amp; evaluation</li>
                  <li>Compliance tracking</li>
                  <li>Priority support</li>
                </ul>
                <Link href="/for-venues#venue-enquiry" className="btn btn-primary btn-block">
                  Request Access
                </Link>
              </div>

              <div className="price-card">
                <div className="price-tier">Multi-Venue</div>
                <div className="price-amount">
                  AUD $149<span>/month</span>
                </div>
                <p className="price-desc">
                  Manage multiple locations with unified dashboards and cross-venue analytics.
                </p>
                <p className="price-fit">For venue groups and multi-site operators.</p>
                <ul>
                  <li>Up to 5 venues</li>
                  <li>Cross-venue comparison</li>
                  <li>Advanced analytics</li>
                  <li>Centralised compliance</li>
                  <li>Priority support</li>
                </ul>
                <Link href="/for-venues#venue-enquiry" className="btn btn-secondary btn-block">
                  Request Multi-Venue
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── Roadmap ──────────────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Roadmap</span>
              <h2>Future Updates.</h2>
              <p>We&rsquo;re actively building and improving the platform. V2 updates are planned within 6 months.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
              {[
                { eta: "2 months", soon: true, title: "More Staff Modules", desc: "New training modules covering coffee service, food pairing, wine fundamentals and advanced guest interaction." },
                { eta: "4 months", soon: true, title: "More Staff Modules", desc: "Expanded scenario sets for large-venue management, events service and high-volume bar operations." },
                { eta: "Within 6 months", soon: true, title: "V2 — Major Feature Release", desc: "A significant platform update informed by founding member feedback, with new features across training, analytics and management." },
                { eta: "TBA", soon: false, title: "App Store — iOS & Android", desc: "Native mobile apps so staff can train on the go, anytime, anywhere — fully synced with their progress." },
              ].map((item, i) => (
                <div key={i} style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", color: item.soon ? "#16a34a" : "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {item.eta}
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.55 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Founder Story ────────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>
              <span className="eyebrow">Built From Experience</span>
              <h2 style={{ marginBottom: "1rem" }}>Created by someone who&rsquo;s lived it.</h2>
              <p style={{ fontSize: "1.125rem", color: "#374151", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "680px", margin: "0 auto 2.5rem" }}>
                Serve By Example was created and is managed by a real hospitality professional with over 15 years of experience across Australian bars, pubs and venues. Not built in a boardroom &mdash; built behind the bar.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#1b4332", lineHeight: 1 }}>15+</div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "6px", fontWeight: 500 }}>Years in Australian Hospitality</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#1b4332", lineHeight: 1 }}>100s</div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "6px", fontWeight: 500 }}>Staff Trained &amp; Managed</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#1b4332", lineHeight: 1 }}>1</div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "6px", fontWeight: 500 }}>Platform Built From Real Experience</div>
                </div>
              </div>
              <blockquote style={{
                margin: "0 auto",
                maxWidth: "600px",
                padding: "1.5rem 2rem",
                background: "white",
                border: "1.5px solid #d1fae5",
                borderLeft: "4px solid #2d6a4f",
                borderRadius: "12px",
                textAlign: "left",
              }}>
                <p style={{ margin: 0, fontSize: "1.05rem", fontStyle: "italic", color: "#1b4332", lineHeight: 1.65, fontWeight: 500 }}>
                  &ldquo;I built the training tool I always wished I had &mdash; one that works for real venues, real staff, and the real pressure of a busy service.&rdquo;
                </p>
                <footer style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#6b7280", fontStyle: "normal", fontWeight: 600 }}>
                  Founder, Serve By Example &mdash; Australia
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <WaitlistSection
          eyebrow="Stay in the loop"
          title="Get notified when we launch."
          copy="No credit card required. We&apos;ll send you early access updates and launch-stage pricing &mdash; no spam."
          inputPlaceholder="your@email.com"
          buttonLabel="Notify me"
          successTitle="You&apos;re on the list."
          successCopy="We&apos;ll reach out with early access details and launch updates."
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
