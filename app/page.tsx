import Link from "next/link";
import Image from "next/image";
import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LogoMarquee from "@/components/marketing/LogoMarquee";
import CTABand from "@/components/marketing/CTABand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serve By Example | Train Hospitality Staff 3x Faster",
  description:
    "Get your team shift-ready instantly with live-scored scenario roleplays and real-time skill ratings built for fast-paced hospitality.",
  alternates: { canonical: "/" },
};

// Lazy-load heavy interactive components
const ROICalculator = lazy(() => import("@/components/ui/ROICalculator"));

// ── Content ───────────────────────────────────────────────────────────────────

// Single source for the FAQ accordion and its FAQPage structured data.
const FAQS = [
  {
    q: "How long does setup take?",
    a: "Most venues are fully set up within a day. We provide starter templates, onboarding support, and pre-built training modules. No content creation required from your side.",
  },
  {
    q: "Is it mobile-friendly?",
    a: "Yes. The entire platform is built mobile-first. Staff can complete training between shifts, on the way to work, or at the bar.",
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
];

const SYSTEMS = [
  {
    audience: "For frontline staff",
    title: "AI Scenario Simulators",
    body: "Staff talk their way through a difficult guest, a slow upsell or a complaint. Every answer is scored on five service dimensions before their next shift starts.",
  },
  {
    audience: "For general managers",
    title: "Manager Console",
    body: "Every module, quiz and scenario lands in your console as it happens. You can see who is ready for Friday night without asking anyone.",
  },
];

const STEPS: { num: string; title: string; body: ReactNode }[] = [
  {
    num: "01",
    title: "Know Your Product Cold.",
    body: (
      <>
        Structured modules, tap-based mini-games, and rapid-fire quizzes. Staff build real knowledge through active recall, not passive reading. Short enough to complete before a shift, structured enough to build <em className="step-highlight">real capability</em> over weeks.
      </>
    ),
  },
  {
    num: "02",
    title: "Apply It Under Real Pressure.",
    body: (
      <>
        Scenario roleplay puts staff in live service situations: awkward guests, difficult upsells, and service recovery moments. Every session scored across <em className="step-highlight">5 service dimensions</em>. Instant feedback. No manager required.
      </>
    ),
  },
  {
    num: "03",
    title: "Managers See Everything, in Real Time.",
    body: (
      <>
        Every module completion, quiz score, and scenario session syncs to the Manager Console automatically. No chasing staff for updates. <em className="step-highlight">No guessing</em> who&rsquo;s been trained and who hasn&rsquo;t.
      </>
    ),
  },
];

const MEASURES = [
  {
    metric: "5",
    unit: "×",
    title: "Dimensions scored per response",
    body: "Communication, hospitality, problem-solving, professionalism, and guest experience, scored automatically on every answer. Not just a pass/fail.",
  },
  {
    metric: "24",
    unit: "/7",
    title: "AI coach, always on",
    body: "Instant personalised feedback on every scenario response. No manager required. No waiting until next week’s check-in.",
  },
  {
    metric: "0",
    unit: "",
    title: "Hours of manager admin",
    body: "Progress, compliance, and performance sync automatically to the manager console. No chasing staff for updates. No spreadsheets.",
  },
];

const PLANS = [
  { tier: "Starter", name: "Pro", desc: "Full access to all 40 modules, scenario training, and progress analytics. For staff investing in their craft." },
  { tier: "Venue Pro", name: "Boutique", desc: "Full manager console, team analytics, compliance tracking, and up to 15 staff seats for one venue." },
  { tier: "Group", name: "Commercial", desc: "Up to 35 staff across your team, multi-venue health scores, and group-wide performance analytics." },
  { tier: "Enterprise", name: "Enterprise", desc: "Unlimited seats, dedicated account management, custom modules, and white-label options for venue groups." },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar showNavbarLanguageOnMobile={false} />

      <main id="main-content">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": FAQS.map(({ q, a }) => ({
                "@type": "Question",
                "name": q,
                "acceptedAnswer": { "@type": "Answer", "text": a },
              })),
            }),
          }}
        />

        {/* ── Hero ─────────────────────────────────── */}
        {/* 100svh fold: navbar (sticky, above) + hero (grows) + marquee (flush bottom) */}
        <div className="sbe-mkt-fold">
          <HeroSection />

          {/* Text-category fallback until real venue logos exist (§5.3) —
              pass `logos={[...]}` once named customers grant permission. */}
          <LogoMarquee />
        </div>

        {/* Trust Stats band removed — the hero's in-line trust row now carries
            3× / 100+ / 19 (Pages-Redesign.md §6.1); repeating them in cards
            directly below was numbers-as-decoration (§6.3). */}

        {/* ── Core Pillars ─────────────────────────── */}
        {/* Parchment lead on the left; the dark panel bleeds off the right edge
            and hangs into the founder section below. */}
        <section className="sbe-mkt-duo">
          <div className="sbe-mkt-duo-lead">
            <p className="sbe-mkt-kicker">Staff side. Manager side.</p>
            <h2 className="sbe-mkt-display">Built for High-Performance Venues</h2>
            <p className="sbe-mkt-lede">
              One side drills your staff on real service moments. The other shows you who is ready for the floor.
            </p>
          </div>
          <div className="sbe-mkt-duo-panel">
            {SYSTEMS.map((system) => (
              <div key={system.title} className="sbe-mkt-duo-item">
                <p className="sbe-mkt-duo-for">{system.audience}</p>
                <h3>{system.title}</h3>
                <p>{system.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Founder Story ────────────────────────── */}
        {/* Stat row (15+/100s/40+) removed per §6.3 — the photo and quote are
            the trust asset, not the digits. */}
        <section className="sbe-mkt-founder">
          <div className="container sbe-mkt-founder-grid">
            <figure className="sbe-mkt-founder-portrait">
              <Image
                src="/24 May Jpg's/Founder.webp"
                alt="Mitch, Founder of Serve By Example"
                width={140}
                height={140}
                loading="lazy"
                quality={60}
              />
              <figcaption>Mitch, founder</figcaption>
            </figure>
            <div className="sbe-mkt-founder-body">
              <p className="sbe-mkt-kicker">Who built this</p>
              <h2 className="sbe-mkt-display">Built by a 15-year hospitality veteran.</h2>
              <p className="sbe-mkt-lede">
                Serve By Example was created and is managed by a real hospitality professional with over 15 years of experience across Australian bars, pubs and venues. Not built in a boardroom, built behind the bar.
              </p>
            </div>
            <blockquote className="sbe-mkt-pullquote">
              <p>
                &ldquo;I built the training tool I always wished I had, one that works for real venues, real staff, and the real pressure of a busy service.&rdquo;
              </p>
              <footer>Mitch, Serve By Example, Australia</footer>
            </blockquote>
          </div>
        </section>

        {/* ── One platform. Two outcomes. ───────────── */}
        <section className="sbe-mkt-showcase">
          <div className="container">
            <header className="sbe-mkt-head">
              <p className="sbe-mkt-kicker">Inside the platform</p>
              <h2 className="sbe-mkt-display">Two views of the same shift.</h2>
              <p className="sbe-mkt-lede">Staff train and improve. Managers see everything. Nobody enters anything twice.</p>
            </header>

            {/* Manager outcome */}
            <div className="sbe-mkt-show-row">
              <div className="sbe-mkt-show-text">
                <p className="sbe-mkt-show-tag">Manager view</p>
                <h3>Run a tighter venue</h3>
                <p>Real-time visibility across your whole team (compliance, progress, and performance) without chasing anyone.</p>
              </div>
              <div className="sbe-mkt-show-media sbe-mkt-show-media-end">
                <Image
                  src="/shots/Overview Console Wide.png"
                  alt="Serve By Example management console – venue overview with training completion, compliance status, and staff needing attention"
                  width={3004}
                  height={1654}
                  sizes="(max-width: 900px) 100vw, 760px"
                  loading="lazy"
                  className="sbe-shot"
                />
              </div>
            </div>

            {/* Staff outcome */}
            <div className="sbe-mkt-show-row sbe-mkt-show-row-flip">
              <div className="sbe-mkt-show-text">
                <p className="sbe-mkt-show-tag">Staff view</p>
                <h3>Train confident staff</h3>
                <p>Floor-ready in six weeks, not six months, guided by scenario training and immediate scored feedback.</p>
              </div>
              <div className="sbe-mkt-show-media sbe-mkt-show-media-start">
                <Image
                  src="/shots/Mastery Grid.png"
                  alt="Staff training progress view – certification hub and module mastery by category"
                  width={3024}
                  height={1654}
                  sizes="(max-width: 900px) 100vw, 760px"
                  loading="lazy"
                  className="sbe-shot"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Preview (Modules + Mobile) ─── */}
        <section id="feature-preview" className="sbe-mkt-showcase sbe-mkt-showcase-warm">
          <div className="container">
            <div className="sbe-mkt-show-row">
              <div className="sbe-mkt-show-text">
                <div className="sbe-mkt-show-block">
                  <p className="sbe-mkt-show-tag">40 modules</p>
                  <h3>The full training library</h3>
                  <p>All 40 modules across Bartending, Sales, and Management. Filter by role, track progress, and certify by topic.</p>
                </div>
                <div className="sbe-mkt-show-block">
                  <p className="sbe-mkt-show-tag">On their phone</p>
                  <h3>Train anywhere, on any shift</h3>
                  <p>The full platform on mobile. Staff complete scenarios, quizzes, and modules between shifts without needing a desk or desktop.</p>
                </div>
              </div>
              <div className="sbe-mkt-show-media sbe-mkt-show-media-end sbe-mkt-show-stack">
                <Image
                  src="/shots/Modules View.png"
                  alt="Staff training modules view – full course library"
                  width={1400}
                  height={875}
                  sizes="(max-width: 900px) 100vw, 760px"
                  loading="lazy"
                  className="sbe-shot"
                />
                <Image
                  src="/shots/Mobile-home.png"
                  alt="Serve By Example staff training app on mobile – home screen with streak, pre-shift brief, and quick access training"
                  width={912}
                  height={1844}
                  sizes="(max-width: 900px) 30vw, 200px"
                  loading="lazy"
                  className="sbe-mkt-show-phone"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works – 3-Step Process ─────── */}
        <section id="mastery-path" className="sbe-mkt-path sbe-mkt-on-dark">
          <div className="container">
            <header className="sbe-mkt-head sbe-mkt-head-split">
              <div>
                <p className="sbe-mkt-kicker">The Mastery Path</p>
                <h2 className="sbe-mkt-display">Know it. Apply it. Managers see it.</h2>
              </div>
              <p className="sbe-mkt-lede">Three stages that take staff from day one to floor-confident, every step tracked and visible without chasing anyone.</p>
            </header>

            <ol className="sbe-mkt-path-steps">
              {STEPS.map((step) => (
                <li key={step.num} className="sbe-mkt-path-step">
                  <span className="sbe-mkt-path-num" aria-hidden="true">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Quantified Benefits ─────────────────────── */}
        <section className="sbe-mkt-measures">
          <div className="container">
            <header className="sbe-mkt-head">
              <p className="sbe-mkt-kicker">What gets measured</p>
              <h2 className="sbe-mkt-display">Training that measures performance, not attendance.</h2>
            </header>
            <dl className="sbe-mkt-ledger">
              {MEASURES.map((measure) => (
                <div key={measure.title} className="sbe-mkt-ledger-row">
                  <dt>
                    <span className="sbe-mkt-ledger-metric">
                      {measure.metric}
                      {measure.unit ? <span className="sbe-mkt-ledger-unit">{measure.unit}</span> : null}
                    </span>
                    <span className="sbe-mkt-ledger-title">{measure.title}</span>
                  </dt>
                  <dd>{measure.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── SOP Lead Magnet Banner ───────────────── */}
        <section className="sbe-mkt-leadband">
          <div className="sbe-mkt-leadband-inner">
            <span className="sbe-mkt-leadband-eyebrow">Free SOP builder</span>
            <h2 className="sbe-mkt-leadband-title">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <span>Take a venue SOP template with you.</span>
            </h2>
            <p className="sbe-mkt-leadband-copy">
              Customised to your venue type and biggest compliance pain point in under 60 seconds.
            </p>
            <Link href="/toolkit" className="sbe-mkt-btn-primary">
              Build my venue SOP
            </Link>
          </div>
        </section>

        {/* ── Pricing Teaser ───────────────────────── */}
        <section className="sbe-mkt-plans">
          <div className="container sbe-mkt-plans-grid">
            <div className="sbe-mkt-plans-intro">
              <p className="sbe-mkt-kicker">Plans &amp; Pricing</p>
              <h2 className="sbe-mkt-display">Priced by the size of your roster.</h2>
              <p className="sbe-mkt-lede">From one bartender to a multi-site group. Start on the plan that fits and move up when the team grows.</p>
              <div className="sbe-mkt-plans-actions">
                <Link href="/membership" className="sbe-mkt-btn-primary">Compare plans and prices</Link>
                <Link href="/demo" className="sbe-mkt-btn-text">Or try the demo first, no card needed</Link>
              </div>
            </div>
            <ul className="sbe-mkt-plans-list">
              {PLANS.map((plan) => (
                <li key={plan.name} className="sbe-mkt-plan">
                  <span className="sbe-mkt-plan-tier">{plan.tier}</span>
                  <h3>{plan.name}</h3>
                  <p>{plan.desc}</p>
                </li>
              ))}
            </ul>
            {/* One consolidated risk-reversal moment (Pages-Redesign.md §5.4) */}
            <p className="sbe-mkt-guarantee">
              <strong>14-Day Performance Guarantee. Zero risk to your floor operations.</strong>
              If your team&rsquo;s training engagement doesn&rsquo;t noticeably increase in the first 14 days, you won&rsquo;t be charged. No questions asked.
            </p>
          </div>
        </section>

        {/* ── ROI Calculator ───────────────────────── */}
        <Suspense fallback={<div style={{ height: "400px", background: "var(--bg-dark)" }} />}>
          <ROICalculator />
        </Suspense>

        {/* ── FAQ ──────────────────────────────────── */}
        <section className="sbe-mkt-faq">
          <div className="container sbe-mkt-faq-grid">
            <header className="sbe-mkt-head">
              <p className="sbe-mkt-kicker">Before you start</p>
              <h2 className="sbe-mkt-display">The questions worth asking first.</h2>
            </header>
            <div className="sbe-mkt-faq-list">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="sbe-mkt-faq-item" name="home-faq">
                  <summary className="sbe-mkt-faq-q">
                    <span>{q}</span>
                    <span className="sbe-mkt-faq-icon" aria-hidden="true" />
                  </summary>
                  <div className="sbe-mkt-faq-a">
                    <p>{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────── */}
        <CTABand
          title="Get your next hire floor-ready sooner."
          copy="14-day free trial. No credit card required."
          primary={{ label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique" }}
        />

      </main>

      <Footer />
    </div>
  );
}
