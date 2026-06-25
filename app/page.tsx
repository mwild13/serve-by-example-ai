import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ROICalculator from "@/components/ui/ROICalculator";
import CompareMatrix from "@/components/ui/CompareMatrix";
import HeroSection from "@/components/HeroSection";
import VenueMarquee from "@/components/VenueMarquee";

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
      <Navbar showNavbarLanguageOnMobile={false} />

      <main id="main-content">

        {/* ── Hero ─────────────────────────────────── */}
        <HeroSection />

        <VenueMarquee />

        {/* ── Trust Stats ──────────────────────────── */}
        <section className="section trust-section" style={{ background: "transparent", padding: "2rem 0" }}>
          <div className="container">
            <div className="arch-blueprint" style={{ background: "white", padding: "2.5rem 2rem", borderRadius: "12px", border: "1px solid var(--mkt-border-subtle, #e5e7eb)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "11px", color: "#6b7280", letterSpacing: "0.15em", marginBottom: "2rem", textTransform: "uppercase", fontWeight: 700 }}>
                System Specifications
              </div>

              {/* Responsive CSS Grid to force perfect card balance */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem"
              }}>
                <article className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "8px", border: "1px solid #f3f4f6", background: "#fff" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1b4332", lineHeight: 1, marginBottom: "0.5rem" }}>
                    3<span style={{ fontSize: "1.75rem", marginLeft: "2px", color: "var(--mkt-gold-500, #b79438)" }}>×</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 600, lineHeight: 1.4 }}>
                    Faster Onboarding<br/>
                    <em style={{ fontSize: "0.8rem", color: "#b79438", fontStyle: "normal", fontWeight: 500 }}>6 months to 6 weeks</em>
                  </div>
                </article>

                <article className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "8px", border: "1px solid #f3f4f6", background: "#fff" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1b4332", lineHeight: 1, marginBottom: "0.5rem" }}>
                    100<span style={{ fontSize: "1.75rem", marginLeft: "2px", color: "var(--mkt-gold-500, #b79438)" }}>+</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 600, lineHeight: 1.4 }}>
                    Learning Modules<br/>
                    <em style={{ fontSize: "0.8rem", color: "#b79438", fontStyle: "normal", fontWeight: 500 }}>&amp; Scenarios</em>
                  </div>
                </article>

                <article className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "8px", border: "1px solid #f3f4f6", background: "#fff" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1b4332", lineHeight: 1, marginBottom: "0.5rem" }}>
                    19
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 600, lineHeight: 1.4 }}>
                    Languages Supported<br/>
                    <em style={{ fontSize: "0.8rem", color: "#b79438", fontStyle: "normal", fontWeight: 500 }}>Aus Training Ready</em>
                  </div>
                </article>

                <article className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem", borderRadius: "8px", border: "1px solid #f3f4f6", background: "#fff" }}>
                  <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#1b4332", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                    GPT-4o-mini
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 600, lineHeight: 1.4 }}>
                    5-Dimension AI<br/>
                    <em style={{ fontSize: "0.8rem", color: "#b79438", fontStyle: "normal", fontWeight: 500 }}>Evaluation Engine</em>
                  </div>
                </article>
              </div>

            </div>
          </div>
        </section>

        {/* ── Core Pillars — Bento Grid 2.0 ──────── */}
        <section className="section sbe-mkt-scope">
          <div className="container">
            <div className="section-header center">
              <span className="sbe-eyebrow">Three Systems, One Hub</span>
              <h2 className="sbe-serif-title">Built for High-Performance Venues</h2>
              <p className="sbe-sans-body">Everything your venue needs to train staff confidently, built for real hospitality operations.</p>
            </div>

            <div className="bento-grid" style={{ marginTop: "2.5rem" }}>

              {/* Dark col-6 — Frontline Staff */}
              <div className="bento-card bento-card-dark sbe-span-6 sbe-interactive-hover mkt-card-sharp">
                <div>
                  <div style={{ width: "44px", height: "44px", background: "rgba(212,175,55,0.18)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", color: "var(--mkt-gold-500)" }}>
                    <IcoZap size={22} />
                  </div>
                  <span className="sbe-eyebrow">For Frontline Staff</span>
                  <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem", fontWeight: 700, color: "var(--mkt-cream-100)" }}>AI Scenario Simulators</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.65, color: "rgba(250,249,246,0.72)" }}>GPT-4o-mini scores every roleplay response across 5 service dimensions. Real pressure, real feedback — no manager required.</p>
                </div>
              </div>

              {/* Light col-6 — General Managers */}
              <div className="bento-card sbe-span-6 sbe-interactive-hover mkt-card-sharp">
                <div>
                  <div style={{ width: "44px", height: "44px", background: "var(--green-light)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", marginBottom: "1.25rem" }}>
                    <IcoBuilding size={22} />
                  </div>
                  <span className="sbe-eyebrow">For General Managers</span>
                  <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem", fontWeight: 700, color: "var(--mkt-forest-900)" }}>Manager Mission Control</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.65, color: "var(--mkt-charcoal-400)" }}>Every module completion, quiz score, and scenario session syncs to the manager console automatically. Full visibility, zero admin overhead.</p>
                </div>
              </div>

              {/* Wide col-12 — Multi-Site Venue Groups */}
              <div className="bento-card sbe-span-12 sbe-interactive-hover mkt-card-sharp">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>
                  <div style={{ flex: "1 1 260px" }}>
                    <div style={{ width: "44px", height: "44px", background: "var(--green-light)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", marginBottom: "1.25rem" }}>
                      <IcoBook size={22} />
                    </div>
                    <span className="sbe-eyebrow">For Multi-Site Venue Groups</span>
                    <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem", fontWeight: 700, color: "var(--mkt-forest-900)" }}>Cocktail &amp; Spec Library</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.65, color: "var(--mkt-charcoal-400)" }}>40+ build guides, garnish specs, and flavour profiles — searchable by staff on any device, any shift. Standardise service quality across every location.</p>
                  </div>
                  <ul style={{ flex: "1 1 260px", listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {[
                      "Faster onboarding with venue-specific starter templates",
                      "Stronger, more consistent service standards across sites",
                      "Revenue impact from better upsell performance",
                      "Scalable from a single bar to a full group rollout",
                    ].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.875rem", color: "var(--mkt-charcoal-900)", borderBottom: "1px solid var(--mkt-border-subtle)", paddingBottom: "0.625rem" }}>
                        <span style={{ color: "var(--mkt-gold-500)", fontWeight: 700, flexShrink: 0, lineHeight: 1.65 }}>&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Founder Story ────────────────────────── */}
        <section className="section section-alt" style={{ border: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ maxWidth: "880px", margin: "0 auto" }}>
              {/* Photo + text row */}
              <div className="founder-row">
                {/* Left: photo + name */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <Image
                    src="/24 May Jpg's/Founder.png"
                    alt="Mitch, Founder of Serve By Example"
                    width={140}
                    height={140}
                    style={{ borderRadius: "4px", objectFit: "cover", width: "140px", height: "140px", display: "block" }}
                  />
                  <span style={{ marginTop: "0.625rem", fontSize: "0.875rem", fontWeight: 700, color: "var(--text-soft)", textAlign: "center" }}>Mitch</span>
                </div>
                {/* Right: eyebrow + heading + text */}
                <div className="founder-text">
                  <span className="eyebrow">Built From Experience</span>
                  <h2 style={{ marginBottom: "1rem" }}>Built by a 15-year hospitality veteran.</h2>
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
                    <p>Real-time visibility across your whole team (compliance, progress, and performance) without chasing anyone.</p>
                  </div>
                </div>
                <Image
                  src="/shots/Management Console View.png"
                  alt="Serve By Example management console – venue performance mission control"
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
                    <p>Floor-ready in six weeks, not six months, guided by scenario training and immediate scored feedback.</p>
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
        <section id="feature-preview" className="section section-warm">
          <div className="container">
            <div className="solution-grid">

              {/* Full training library */}
              <div className="solution-col">
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoLayers size={20} /></span>
                  <div>
                    <h3>The full training library</h3>
                    <p>All 40 modules across Bartending, Sales, and Management. Filter by role, track progress, and certify by topic.</p>
                  </div>
                </div>
                <Image
                  src="/shots/Modules View.png"
                  alt="Staff training modules view – full course library"
                  width={1400}
                  height={875}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

              {/* Mobile – train anywhere */}
              <div className="solution-col" style={{ display: "flex", flexDirection: "column" }}>
                <div className="solution-col-header">
                  <span className="solution-col-icon"><IcoPhone size={20} /></span>
                  <div>
                    <h3>Train anywhere, on any shift</h3>
                    <p>The full platform on mobile. Staff complete scenarios, quizzes, and modules between shifts without needing a desk or desktop.</p>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image
                    src="/shots/Mobile View3.png"
                    alt="Mobile training view – hospitality staff learning on phone"
                    width={347}
                    height={707}
                    sizes="(max-width: 768px) 80vw, 320px"
                    style={{ width: "100%", maxWidth: "320px", height: "auto", display: "block", margin: "0 auto" }}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── How It Works – 3-Step Process ─────── */}
        <section id="mastery-path" className="section section-band-green">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">The Mastery Path</span>
              <h2>Know it. Apply it. Managers see it.</h2>
              <p>Three stages that take staff from day one to floor-confident, every step tracked and visible without chasing anyone.</p>
            </div>

            <div className="mastery-steps-flow">
              <div className="mastery-step-item">
                <div className="mastery-step-icon-wrap">
                  <IcoBook size={28} />
                </div>
                <div className="mastery-step-num">Step 1</div>
                <h3>Know Your Product Cold.</h3>
                <p>Structured modules, tap-based mini-games, and rapid-fire quizzes. Staff build real knowledge through active recall, not passive reading. Short enough to complete before a shift, structured enough to build <em className="step-highlight">real capability</em> over weeks.</p>
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
                <p>Scenario roleplay puts staff in live service situations: awkward guests, difficult upsells, and service recovery moments. Every session scored across <em className="step-highlight">5 service dimensions</em>. Instant feedback. No manager required.</p>
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
        <section className="section" style={{ background: "#fff" }}>
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
                <p className="benefit-desc">Communication, hospitality, problem-solving, professionalism, and guest experience, scored automatically on every answer. Not just a pass/fail.</p>
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

        {/* ── Pricing Teaser ───────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="section-header center">
              <span className="eyebrow">Pricing</span>
              <h2>Plans &amp; Pricing</h2>
              <p>From individual staff to multi-site venue groups, one platform that grows with you.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", maxWidth: 860, margin: "2rem auto 0" }}>
              {[
                { tier: "Individual", name: "Pro", desc: "Full access to all 40 modules, scenario training, and progress analytics. For staff investing in their craft." },
                { tier: "Single Venue", name: "Boutique", desc: "Full manager console, team analytics, compliance tracking, and up to 15 staff seats for one venue." },
                { tier: "Multi-Venue", name: "Commercial", desc: "Up to 35 staff across your team, multi-venue health scores, and group-wide performance analytics." },
                { tier: "Enterprise", name: "Enterprise", desc: "Unlimited seats, dedicated account management, custom modules, and white-label options for venue groups." },
              ].map((plan) => (
                <div key={plan.name} style={{ flex: "1 1 180px", maxWidth: 220, background: "var(--surface)", border: "1.5px solid var(--line)", borderRadius: "14px", padding: "1.25rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{plan.tier}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{plan.name}</div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-soft)", lineHeight: 1.5 }}>{plan.desc}</p>
                </div>
              ))}
            </div>
            <div className="zero-risk-block" style={{ maxWidth: 860, margin: "1.75rem auto 0" }}>
              <strong>Zero risk to your floor operations.</strong>
              <p style={{ margin: "0.4rem 0 0" }}>If your team&rsquo;s training engagement doesn&rsquo;t noticeably increase in the first 14 days, you won&rsquo;t be charged.</p>
            </div>
            <div style={{ textAlign: "center", marginTop: "1.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <Link href="/pricing" className="btn btn-primary">View full pricing</Link>
              <Link href="/demo" style={{ fontSize: "0.8rem", color: "var(--text-soft)", textDecoration: "underline", textUnderlineOffset: "3px" }}>or explore the demo free</Link>
            </div>
          </div>
        </section>

        {/* ── ROI Calculator ───────────────────────── */}
        <ROICalculator />

        {/* ── Free Toolkit Teaser ──────────────────── */}
        <section style={{ backgroundColor: 'var(--green)', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '660px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              fontFamily: 'var(--font-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.55)',
              fontWeight: '600',
              marginBottom: '1.25rem',
            }}>Free resource</span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.85rem, 4vw, 2.6rem)',
              lineHeight: '1.2',
              color: '#fff',
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}>Not ready to sign up yet?</h2>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: 'rgba(255,255,255,0.72)',
              maxWidth: '520px',
              margin: '0 auto 2.5rem auto',
            }}>
              Get a free, venue-specific staff onboarding SOP template — customised to your venue type and biggest compliance pain point in under 60 seconds.
            </p>
            <Link href="/toolkit" style={{
              display: 'inline-block',
              backgroundColor: 'var(--gold)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontWeight: '600',
              fontSize: '1rem',
              padding: '0.9rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'background-color 0.2s ease',
            }}>
              Build Your Custom SOP &rarr;
            </Link>
          </div>
        </section>

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
                  a: "Most venues are fully set up within a day. We provide starter templates, onboarding support, and pre-built training modules. No content creation required from your side.",
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
                  a: "Our modules cover responsible service content and service standards. Formal RSA certification requires an accredited provider. We integrate training around compliance knowledge, not replace licensed certification.",
                },
                {
                  q: "Can I try it before committing?",
                  a: "Yes. The free demo gives you access to the scenario engine and a sample of the training content. No credit card required. Venue plans include a walkthrough call before any commitment.",
                },
                {
                  q: "How is this different from a generic LMS?",
                  a: "Generic LMS platforms are built for corporate compliance training: long videos, passive quizzes, and no real skill measurement. Serve By Example is built for hospitality: scenario roleplay, live scoring, and skill ratings designed around shift-by-shift operations.",
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

        {/* ── Comparison Matrix ────────────────────── */}
        <section className="section section-alt">
          <div className="container">
            <CompareMatrix />
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
                Explore the Demo
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}