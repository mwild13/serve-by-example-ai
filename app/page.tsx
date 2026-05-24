import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ROICalculator from "@/components/ui/ROICalculator";
import HeroSection from "@/components/HeroSection";
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
        <HeroSection />

        {/* ── Founder Quote (promoted) ─────────────── */}
        <section className="founder-quote-strip">
          <div className="container">
            <blockquote className="founder-quote-inline">
              <p>I built the training tool I always wished I had &mdash; one that works for real venues, real staff, and the real pressure of a busy service.</p>
              <footer>Founder, Serve By Example &mdash; 15+ years in Australian hospitality</footer>
            </blockquote>
          </div>
        </section>

        {/* ── Trust Stats ──────────────────────────── */}
        <section className="section trust-section trust-section-green">
          <div className="container">
            <div className="trust-stats">
              <article className="stat-card stat-card-green">
                <div className="stat-value-green">3<span className="stat-value-unit">×</span></div>
                <div className="stat-label-green">Faster Onboarding<br/><em className="stat-accent">6 months to 6 weeks</em></div>
              </article>
              <article className="stat-card stat-card-green">
                <div className="stat-value-green">65<span className="stat-value-unit">+</span></div>
                <div className="stat-label-green">Cocktail &amp; Scenario<br/><em className="stat-accent">Training Modules</em></div>
              </article>
              <article className="stat-card stat-card-green">
                <div className="stat-value-green">19</div>
                <div className="stat-label-green">Languages Supported<br/><em className="stat-accent">Global Training Ready</em></div>
              </article>
            </div>
          </div>
        </section>

        {/* ── Scalable Training Tiers ──────────────── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Scalable Training Tiers</span>
              <h2>Built for every level of your team</h2>
              <p>From individual staff to multi-site venue groups, one platform that grows with you.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>

              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "16px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}>Try it free</div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Free Demo</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>Experience the AI training engine first-hand, no commitment required. See what your team would be working with before making a decision.</p>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>For individuals who want to explore the platform.</p>
                <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                  <Link href="/demo" className="btn btn-primary btn-block">Try the Demo</Link>
                </div>
              </div>

              <div style={{ background: "white", border: "2px solid #0B2B1E", borderRadius: "16px", padding: "1.75rem", paddingTop: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative", overflow: "visible" }}>
                <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#0B2B1E", color: "white", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "999px", padding: "4px 14px", whiteSpace: "nowrap" }}>Most Popular</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a" }}>Individual</div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Pro</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>Full access to all training modules, unlimited AI coaching and progress analytics. Build career-ready skills at your own pace.</p>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>For bartenders and hospitality staff investing in their craft.</p>
                <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                  <Link href="/pricing" className="btn btn-primary btn-block">See Pro Pricing</Link>
                </div>
              </div>

              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "16px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}>Single location</div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Single Venue</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>The full manager console, unlimited staff logins, compliance tracking and hands-on onboarding for one venue. Get your team trained in week one.</p>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>For venues ready to professionalise their training.</p>
                <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                  <Link href="/for-venues#venue-enquiry" className="btn btn-secondary btn-block">Request Venue Access</Link>
                </div>
              </div>

              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "16px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}>Multi-location</div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Multi-Venue</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>Unified dashboards across up to 5 venues, cross-venue analytics, leaderboards and a dedicated account process tailored to your group&rsquo;s needs.</p>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>For venue groups and multi-site operators.</p>
                <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                  <Link href="/for-venues#venue-enquiry" className="btn btn-secondary btn-block">Scale Your Team</Link>
                </div>
              </div>

            </div>
            <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
              <Link href="/pricing" style={{ fontSize: "0.875rem", color: "#6b7280", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                View full pricing and plan details
              </Link>
            </div>
          </div>
        </section>

        {/* ── One platform. Two outcomes. ───────────── */}
        <section className="section section-ecosystem">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">One Platform</span>
              <h2>One platform. Two outcomes.</h2>
              <p>Train confident staff. Run a tighter venue. Both from a single dashboard.</p>
            </div>

            <div className="outcomes-nav">
              <div className="outcomes-nav-pill">
                <span className="outcomes-nav-icon"><IcoUsers size={18} /></span>
                Train confident staff
              </div>
              <div className="outcomes-nav-sep" aria-hidden="true" />
              <div className="outcomes-nav-pill">
                <span className="outcomes-nav-icon"><IcoBuilding size={18} /></span>
                Run a tighter venue
              </div>
            </div>

            <div className="solution-grid">

              {/* Manager outcome */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoBuilding size={20} /></span>
                  <div>
                    <h3>Run a tighter venue</h3>
                    <p>Real-time visibility across your whole team — compliance, progress, and performance — without chasing anyone.</p>
                  </div>
                </div>
                <Image
                  src="/24 May Jpg's/Management Console View.png"
                  alt="Serve By Example management console — venue performance mission control"
                  width={1200}
                  height={750}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

              {/* Staff outcome */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoUsers size={20} /></span>
                  <div>
                    <h3>Train confident staff</h3>
                    <p>Floor-ready in six weeks, not six months — guided by AI scenarios and immediate scored feedback.</p>
                  </div>
                </div>
                <Image
                  src="/24 May Jpg's/Staff Certifications.png"
                  alt="Staff certification and module mastery progress view"
                  width={1200}
                  height={630}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

            </div>
          </div>
        </section>

        {/* ── Product Preview (Modules View) ──── */}
        <section className="section product-preview section-warm">
          <div className="container">
            <p className="mockup-caption">Your team&rsquo;s personalised training dashboard.</p>
            <Image
              src="/24 May Jpg's/Modules View.png"
              alt="Staff training modules view — full course library"
              width={1400}
              height={875}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </section>

        {/* ── Mastery Engine — 3-Step Process ─────── */}
        <section className="section section-band-green">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Powered by Mastery Engine</span>
              <h2>Intelligent learning that actually works</h2>
              <p>Three proven mechanisms working in combination to build lasting capability, not just passing scores.</p>
            </div>

            <div className="mastery-steps-flow">
              <div className="mastery-step-item">
                <div className="mastery-step-icon-wrap">
                  <IcoTrophy size={28} />
                </div>
                <div className="mastery-step-num">Step 1</div>
                <h3>Adaptive Skill-Level Matching</h3>
                <p>The ELO rating system matches each staff member to scenarios at their current level. Pass harder challenges and your rating climbs. Struggle and the system adjusts, always finding the <em className="step-highlight">optimal training edge</em>.</p>
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
                <p>Spaced repetition resurfaces weak areas at the scientifically optimal intervals: <em className="step-highlight">1, 4, 9, and 16 days</em>. Staff don&rsquo;t cram. They retain. Knowledge decay is monitored and corrected automatically.</p>
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
                <p>AI scores every response across <em className="step-highlight">5 dimensions</em>: communication, hospitality, problem-solving, professionalism, and guest experience. Feedback is immediate, with no waiting for a manager&rsquo;s opinion.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quantified Benefits ─────────────────────── */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">The Numbers Behind It</span>
              <h2>Why SBE produces results others can&rsquo;t</h2>
            </div>
            <div className="benefit-grid">
              <div className="benefit-card">
                <div className="benefit-metric">
                  1, 4, 9, 16
                  <span className="benefit-metric-unit">days</span>
                </div>
                <h3 className="benefit-title">Spaced Repetition Intervals</h3>
                <p className="benefit-desc">Scientifically optimal review timing resurfaces weak areas before knowledge decays. No cramming, no guessing.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-metric">
                  5<span className="benefit-metric-unit">×</span>
                </div>
                <h3 className="benefit-title">Dimensions Evaluated Per Response</h3>
                <p className="benefit-desc">Communication, hospitality, problem-solving, professionalism, and guest experience — scored live by AI on every answer.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-metric">
                  3<span className="benefit-metric-unit">×</span>
                </div>
                <h3 className="benefit-title">Faster Than Traditional Onboarding</h3>
                <p className="benefit-desc">New staff floor-ready in six weeks, not six months. Structured AI-guided modules replace inconsistent on-the-job guessing.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-metric">
                  65<span className="benefit-metric-unit">+</span>
                </div>
                <h3 className="benefit-title">AI Scenarios and Modules</h3>
                <p className="benefit-desc">Realistic situations — from an awkward upsell to a guest complaint under pressure — every shift, guided and scored.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-metric">
                  24<span className="benefit-metric-unit">/7</span>
                </div>
                <h3 className="benefit-title">AI Coach Always Available</h3>
                <p className="benefit-desc">Instant personalised feedback on every response. No manager required. No waiting until next week&rsquo;s check-in.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-metric">
                  19
                </div>
                <h3 className="benefit-title">Languages Supported</h3>
                <p className="benefit-desc">Train your full team in their first language. AI-translated scenarios and feedback for genuinely global venue groups.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ROI Calculator ───────────────────────── */}
        <ROICalculator />

        {/* ── FAQ ──────────────────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Common Questions</span>
              <h2>Everything you need to know before starting.</h2>
            </div>
            <div className="faq-list">
              {[
                {
                  q: "How long does setup take?",
                  a: "Most venues are fully set up within a day. We provide starter templates, onboarding support, and pre-built training modules — no content creation required from your side.",
                },
                {
                  q: "Is it mobile-friendly?",
                  a: "Yes. The entire platform is built mobile-first. Staff can complete training between shifts, on the way to work, or at the bar. Platforms built this way see 90%+ completion rates.",
                },
                {
                  q: "What happens if a staff member leaves?",
                  a: "Their account is deactivated and their seat is freed up for a new hire. Their training history stays on record for compliance and reporting purposes.",
                },
                {
                  q: "Do you offer compliance or RSA certificates?",
                  a: "Our modules cover responsible service content and service standards. Formal RSA certification requires an accredited provider — we integrate training around compliance knowledge, not replace licensed certification.",
                },
                {
                  q: "Can I try it before committing?",
                  a: "Yes. The free demo gives you access to the AI scenario engine and a sample of the training content — no credit card required. Venue plans include a walkthrough call before any commitment.",
                },
                {
                  q: "How is this different from a generic LMS?",
                  a: "Generic LMS platforms are built for corporate compliance training — long videos, passive quizzes, and no real skill measurement. Serve By Example is built for hospitality: AI roleplay, live scoring, ELO skill ratings, and a manager console designed around shift-by-shift operations.",
                },
              ].map(({ q, a }) => (
                <details key={q} className="faq-item">
                  <summary className="faq-question">{q}</summary>
                  <p className="faq-answer">{a}</p>
                </details>
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
                Serve By Example was created and is managed by a real hospitality professional with over 15 years of experience across Australian bars, pubs and venues. Not built in a boardroom, built behind the bar.
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
                  &ldquo;I built the training tool I always wished I had, one that works for real venues, real staff, and the real pressure of a busy service.&rdquo;
                </p>
                <footer style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#6b7280", fontStyle: "normal", fontWeight: 600 }}>
                  Founder, Serve By Example, Australia
                </footer>
              </blockquote>
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
