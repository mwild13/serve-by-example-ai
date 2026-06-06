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

function IcoBook({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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


function IcoLayers({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  );
}

function IcoPhone({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="18" r="0.5" fill="currentColor"/>
    </svg>
  );
}


// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar showActions={false} showTextLogin showNavbarLanguageOnMobile={false} />

      <main id="main-content">

        {/* ── Hero ─────────────────────────────────── */}
        <HeroSection />

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
              <span className="eyebrow">Pricing</span>
              <h2>Plans &amp; Pricing</h2>
              <p>From individual staff to multi-site venue groups, one platform that grows with you.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginTop: "2rem", maxWidth: 800, margin: "2rem auto 0" }}>

              <div style={{ background: "white", border: "2px solid #0B2B1E", borderRadius: "16px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative", overflow: "visible" }}>
                <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#0B2B1E", color: "white", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "999px", padding: "4px 14px", whiteSpace: "nowrap" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: "5px", verticalAlign: "middle" }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Most Popular
                </div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a" }}>Individual</div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Pro</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0B2B1E", lineHeight: 1 }}>$19</span>
                  <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>/month</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>Full access to all 40 training modules, unlimited coaching and progress analytics. Build career-ready skills at your own pace.</p>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>For bartenders and hospitality staff investing in their craft.</p>
                <div style={{ marginTop: "auto", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                  <Link href="/pricing" className="btn btn-primary btn-block">Join Pro</Link>
                  <Link href="/demo" style={{ fontSize: "0.8rem", color: "var(--text-soft)", textDecoration: "underline", textUnderlineOffset: "3px" }}>or try the demo free</Link>
                </div>
              </div>

              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "16px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}>Venues &amp; Groups</div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Scale Your Team</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>The full manager console, team analytics, compliance tracking and hands-on onboarding — for single venues up to multi-site groups. From 1 location to 5, all managed from one place.</p>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>For venue operators ready to professionalise their training.</p>
                <div style={{ marginTop: "auto", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                  <Link href="/contact" className="btn btn-secondary btn-block">Talk to Sales</Link>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>We respond within 1 business day.</span>
                  <Link href="/demo" style={{ fontSize: "0.8rem", color: "var(--text-soft)", textDecoration: "underline", textUnderlineOffset: "3px" }}>or try the demo free</Link>
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
              <h2>Built for two different roles.</h2>
              <p>Staff train and improve. Managers see everything. One platform, no duplication of effort.</p>
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
                  src="/shots/Management Console View.png"
                  alt="Serve By Example management console — venue performance mission control"
                  width={1200}
                  height={750}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

              {/* Staff outcome */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoUsers size={20} /></span>
                  <div>
                    <h3>Train confident staff</h3>
                    <p>Floor-ready in six weeks, not six months — guided by scenario training and immediate scored feedback.</p>
                  </div>
                </div>
                <Image
                  src="/shots/Staff Certifications.png"
                  alt="Staff certification and module mastery progress view"
                  width={1200}
                  height={630}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

            </div>
          </div>
        </section>

        {/* ── Product Preview (Modules + Mobile) ─── */}
        <section className="section section-warm">
          <div className="container">
            <div className="solution-grid">

              {/* Full training library */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoLayers size={20} /></span>
                  <div>
                    <h3>The full training library</h3>
                    <p>All 40 modules across Bartending, Sales, and Management — filter by role, track progress, and certify by topic.</p>
                  </div>
                </div>
                <Image
                  src="/shots/Modules View.png"
                  alt="Staff training modules view — full course library"
                  width={1400}
                  height={875}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

              {/* Mobile — train anywhere */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoPhone size={20} /></span>
                  <div>
                    <h3>Train anywhere, on any shift</h3>
                    <p>The full platform on mobile — staff complete scenarios, quizzes, and modules between shifts without needing a desk or desktop.</p>
                  </div>
                </div>
                <Image
                  src="/shots/Mobile View3.png"
                  alt="Mobile training view — hospitality staff learning on phone"
                  width={700}
                  height={1000}
                  sizes="(max-width: 768px) 80vw, 300px"
                  style={{ width: "auto", maxWidth: "300px", height: "auto", display: "block", margin: "0 auto" }}
                />
              </div>

            </div>
          </div>
        </section>

        {/* ── How It Works — 3-Step Process ─────── */}
        <section id="how-it-works" className="section section-band-green">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">How It Works</span>
              <h2>Know it. Apply it. Managers see it.</h2>
              <p>Three stages that take staff from day one to floor-confident — every step tracked and visible without chasing anyone.</p>
            </div>

            <div className="mastery-steps-flow">
              <div className="mastery-step-item">
                <div className="mastery-step-icon-wrap">
                  <IcoBook size={28} />
                </div>
                <div className="mastery-step-num">Step 1</div>
                <h3>Know Your Product Cold.</h3>
                <p>Structured modules, tap-based mini-games, and rapid-fire quizzes — staff build real knowledge through active recall, not passive reading. Short enough to complete before a shift, structured enough to build <em className="step-highlight">real capability</em> over weeks.</p>
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
                <div className="mastery-step-num">Step 2</div>
                <h3>Apply It Under Real Pressure.</h3>
                <p>Scenario roleplay puts staff in live service situations — awkward guests, difficult upsells, and service recovery moments. Every session scored across <em className="step-highlight">5 service dimensions</em>. Instant feedback. No manager required.</p>
              </div>

              <div className="mastery-step-connector" aria-hidden="true">
                <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                  <path d="M0 8h32M26 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="mastery-step-item">
                <div className="mastery-step-icon-wrap">
                  <IcoBuilding size={28} />
                </div>
                <div className="mastery-step-num">Step 3</div>
                <h3>Managers See Everything, in Real Time.</h3>
                <p>Every module completion, quiz score, and scenario session syncs to Manager Mission Control automatically. No chasing staff for updates. <em className="step-highlight">No guessing</em> who&rsquo;s been trained and who hasn&rsquo;t.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quantified Benefits ─────────────────────── */}
        <section className="section section-warm">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">What makes it different</span>
              <h2>Training that actually measures performance.</h2>
            </div>
            <div className="benefit-grid">
              <div className="benefit-card">
                <div className="benefit-metric">
                  5<span className="benefit-metric-unit">×</span>
                </div>
                <h3 className="benefit-title">Dimensions Scored Per Response</h3>
                <p className="benefit-desc">Communication, hospitality, problem-solving, professionalism, and guest experience — scored automatically on every answer. Not just a pass/fail.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-metric">
                  24<span className="benefit-metric-unit">/7</span>
                </div>
                <h3 className="benefit-title">AI Coach, Always On</h3>
                <p className="benefit-desc">Instant personalised feedback on every scenario response. No manager required. No waiting until next week&rsquo;s check-in.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-metric">
                  0
                </div>
                <h3 className="benefit-title">Hours of Manager Admin</h3>
                <p className="benefit-desc">Progress, compliance, and performance sync automatically to the manager console. No chasing staff for updates. No spreadsheets.</p>
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
                  a: "Yes. The free demo gives you access to the scenario engine and a sample of the training content — no credit card required. Venue plans include a walkthrough call before any commitment.",
                },
                {
                  q: "How is this different from a generic LMS?",
                  a: "Generic LMS platforms are built for corporate compliance training — long videos, passive quizzes, and no real skill measurement. Serve By Example is built for hospitality: scenario roleplay, live scoring, and skill ratings designed around shift-by-shift operations.",
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
            <div style={{ maxWidth: "880px", margin: "0 auto" }}>
              {/* Photo + text row */}
              <div className="founder-row">
                {/* Left: circular photo + name */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <Image
                    src="/24 May Jpg's/Founder.png"
                    alt="Mitch, Founder of Serve By Example"
                    width={140}
                    height={140}
                    style={{ borderRadius: "50%", objectFit: "cover", width: "140px", height: "140px", display: "block" }}
                  />
                  <span style={{ marginTop: "0.625rem", fontSize: "0.875rem", fontWeight: 700, color: "var(--text-soft)", textAlign: "center" }}>Mitch</span>
                </div>
                {/* Right: eyebrow + heading + text */}
                <div className="founder-text">
                  <span className="eyebrow">Built From Experience</span>
                  <h2 style={{ marginBottom: "1rem" }}>Created by someone who&rsquo;s lived it.</h2>
                  <p style={{ fontSize: "1.125rem", color: "#374151", lineHeight: 1.7, margin: 0 }}>
                    Serve By Example was created and is managed by a real hospitality professional with over 15 years of experience across Australian bars, pubs and venues. Not built in a boardroom, built behind the bar.
                  </p>
                </div>
              </div>
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
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#1b4332", lineHeight: 1 }}>40+</div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "6px", fontWeight: 500 }}>Modules Built for Hospitality</div>
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
              <h2>Ready to train your team faster?</h2>
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
