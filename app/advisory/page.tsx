import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroStickyBar from "@/components/HeroStickyBar";
import CTABand from "@/components/marketing/CTABand";
import PackageCard, { type AdvisoryPackage } from "@/components/advisory/PackageCard";
import AdvisoryCtaTracker from "@/components/advisory/AdvisoryCtaTracker";

export const metadata: Metadata = {
  title: "Hospitality Consulting | By Example Advisory | Serve By Example",
  description:
    "Hands-on hospitality consulting for venues in SEQ and Northern NSW. Venue health checks, bar profit reviews, service training and systems setup from an operator with 20 years on the floor.",
  alternates: { canonical: "/advisory" },
  robots: { index: false },
};

// Same destination as the enterprise "Talk to us" action on /pricing, tagged
// so the contact form (and AdvisoryCtaTracker) know which CTA was used.
type AdvisorySlug =
  | "general"
  | "health-check"
  | "bar-profit"
  | "service-reset"
  | "ongoing"
  | "remote-review"
  | "systems-upgrade"
  | "strategy-session"
  | "hub-pilot";

const talkHref = (pkg: AdvisorySlug) => `/contact?source=advisory&package=${pkg}`;

const HERO_ALT = "Mitch, founder of Serve By Example, behind a venue bar";

const BOOK_CALL = "Book a free 15 min call";

const TRUST_ITEMS = [
  "20 years in hospitality",
  "6 years venue management",
  "7 years in bottleshops",
  "Liquor sales across QLD and Northern NSW",
];

const PROBLEMS = [
  { title: "Staff come and go.", body: "Service changes with every new face on the floor." },
  { title: "Wages keep creeping.", body: "Rosters built on habit, not sales." },
  { title: "The bar leaks money.", body: "Over-pours, waste and stock that never moves." },
];

const STEPS = [
  { title: "Audit", body: "We walk your venue, watch a service and read your numbers." },
  { title: "Fix", body: "We build the systems and train your team." },
  { title: "Sustain", body: "Serve By Example keeps your standards in place after we leave." },
];

// `id` doubles as the ?package= slug on the card's CTA.
const PACKAGES: (AdvisoryPackage & { id: AdvisorySlug })[] = [
  {
    id: "health-check",
    name: "Venue Health Check",
    price: "$990",
    cta: "Book a Health Check",
    audience: "For any venue that knows something's off.",
    inclusions: [
      "On-site walk-through and live service observation",
      "Review of roster, sales, wages and stock data",
      "Written report with a scorecard across service, labour, stock, bar, tech and online presence",
      "Tool and vendor recommendations",
      "60 min debrief",
      "Fee credited to your next package if booked within 30 days",
    ],
  },
  {
    id: "bar-profit",
    name: "Bar Profit Review",
    price: "$1,200",
    cta: "Book a Bar Profit Review",
    audience: "For pubs, bars and venues with bottleshops.",
    inclusions: [
      "Pour cost and margin analysis per drink",
      "Drinks list, pricing and range review",
      "Keg yield and beer line check",
      "Stock variance and shrinkage check",
      "Supplier terms review covering rebates, tap deals and equipment",
      "Bottleshop range and layout review, where attached",
      "Action plan and 60 min debrief",
    ],
  },
  {
    id: "service-reset",
    name: "Service Reset",
    price: "$3,500",
    cta: "Start a Service Reset",
    audience: "For venues battling turnover or inconsistent service.",
    recommended: true,
    inclusions: [
      "Everything in the Venue Health Check",
      "Service standards, SOPs and pre-shift checklists",
      "Staff training program built into Serve By Example",
      "On-site team training session",
      "3 months of Serve By Example included",
      "30 day follow-up",
    ],
  },
  {
    id: "ongoing",
    name: "Ongoing Advisory",
    price: "$500",
    priceSuffix: "/month",
    cta: "Ask about Ongoing Advisory",
    audience: "For venues that want an operator in their corner.",
    note: "3 month minimum",
    inclusions: [
      "Monthly check-in visit",
      "Monthly KPI review",
      "Priority phone and email support",
      "Serve By Example included",
      "Discounted add-ons and extra hours",
    ],
  },
];

const MODULES = [
  { title: "Rostering and labour", body: "Setup, templates and wage targets" },
  { title: "Stock and inventory", body: "Stock-take process, pars and ordering" },
  { title: "POS and bookings", body: "Configuration and booking flow" },
  { title: "CRM and loyalty", body: "Setup and your first guest campaign" },
  { title: "AI quick wins", body: "Phone answering, review responses and admin automation" },
  { title: "KPI dashboard", body: "Weekly numbers from your POS and roster" },
  { title: "Menu engineering", body: "Profit versus popularity across food and drinks" },
];

const HUB_MODULES = [
  { title: "Supplier inbox", body: "Deals and price lists sorted automatically" },
  { title: "Stock", body: "On-hand numbers and reorder alerts" },
  { title: "F&B KPIs", body: "Sales, margin and pour cost" },
  { title: "Team learning", body: "Serve By Example progress for managers" },
  { title: "Teaching area", body: "Your SOPs, specs and recipes" },
];

// Rows shown inside the coded phone mockup. Sample content only.
const HUB_MOCK_ROWS = [
  { label: "Supplier inbox", value: "3 new deals" },
  { label: "Stock", value: "2 reorder alerts" },
  { label: "F&B KPIs", value: "Weekly report ready" },
  { label: "Team learning", value: "8 of 11 on track" },
  { label: "Teaching area", value: "SOPs and specs" },
];

const ADD_ONS = [
  { name: "Google Business Profile setup and review templates", price: "from $350" },
  { name: "Recruitment kit", price: "from $450" },
  { name: "Labour cost analysis", price: "from $450" },
  { name: "Drinks list redesign", price: "from $500" },
  { name: "Supplier renewal negotiation prep", price: "from $500" },
  { name: "No and low alcohol or cocktail program", price: "from $600" },
  { name: "AI phone answering setup", price: "from $600" },
];

const FAQS = [
  {
    q: "Do I have to buy Serve By Example?",
    a: "No. We recommend it where it fits. The price of our advice is the same either way.",
  },
  {
    q: "Do you take commissions from suppliers or software vendors?",
    a: "If a vendor pays us for a referral, we'll tell you before you sign anything.",
  },
  {
    q: "Do you have ties to any suppliers?",
    a: "Mitch currently works in liquor sales for a craft brewer and has worked with other suppliers in the past. We never steer venues toward any supplier we're connected to. If a recommendation involves one, we'll tell you upfront, and the decision is always yours.",
  },
  {
    q: "What happens on the discovery call?",
    a: "15 minutes on your venue, your biggest problem and whether we're the right fit. No hard pitch.",
  },
  {
    q: "Can you work remotely?",
    a: "Yes. Our Remote Review and Strategy Sessions run over video call for venues anywhere in Australia.",
  },
  {
    q: "Are prices ex GST?",
    a: "Yes. All prices are in AUD and exclude GST.",
  },
];

export default function AdvisoryPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main id="main-content">
        <AdvisoryCtaTracker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />

        {/* ── 1. Hero: same classes as the homepage hero ── */}
        <section className="sbe-mkt-hero sbe-adv-hero">
          <div className="container sbe-mkt-hero-grid">
            <div className="sbe-mkt-hero-heading">
              <p className="sbe-mkt-hero-eyebrow">By Example Advisory</p>
              <h1 className="sbe-mkt-hero-h1">Run a tighter venue.</h1>
            </div>

            <div className="sbe-mkt-hero-teaser">
              <Image
                src="/images/advisory/advisory-hero.jpg"
                alt={HERO_ALT}
                width={1200}
                height={896}
                priority
                sizes="(max-width: 900px) 92vw, 58vw"
              />
            </div>

            <div className="sbe-mkt-hero-details">
              <p className="sbe-mkt-hero-sub">
                Hands-on hospitality consulting from 20 years on the floor, behind the bar and on
                the road.
              </p>

              <div className="sbe-mkt-hero-actions">
                <div className="sbe-mkt-hero-btn-row">
                  <Link href={talkHref("general")} className="sbe-mkt-hero-cta">
                    {BOOK_CALL}
                  </Link>
                  <a href="#packages" className="sbe-mkt-hero-secondary">
                    See packages
                  </a>
                </div>
              </div>
            </div>

            {/* Direct grid child (not inside details) so it can span the full hero width */}
            <ul className="sbe-mkt-hero-trust" aria-label="Founder experience">
              {TRUST_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <HeroStickyBar label="Free 15 min discovery call" cta="Book a free call" href={talkHref("general")} />
        </section>

        {/* ── 2. The problem ── */}
        <section className="section">
          <div className="container sbe-adv-problem">
            <header className="sbe-mkt-head">
              <h2 className="sbe-mkt-display">Sound familiar?</h2>
            </header>
            <ul className="sbe-adv-problem-list">
              {PROBLEMS.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong> {item.body}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 3. How it works ── */}
        <section className="section section-alt">
          <div className="container">
            <header className="sbe-mkt-head">
              <h2 className="sbe-mkt-display">Audit. Fix. Sustain.</h2>
            </header>
            <ol className="sbe-adv-steps">
              {STEPS.map((step, i) => (
                <li key={step.title} className="sbe-adv-step">
                  <span className="sbe-adv-step-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="sbe-adv-step-title">{step.title}</h3>
                  <p className="sbe-adv-step-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 4. Packages ── */}
        <section className="section sbe-adv-anchor" id="packages">
          <div className="container">
            <header className="sbe-mkt-head">
              <h2 className="sbe-mkt-display">Pick your starting point</h2>
              <p className="sbe-mkt-lede">
                All prices AUD ex GST. In person across SEQ and Northern NSW. Remote across Australia.
              </p>
            </header>

            <div className="sbe-adv-pkg-grid">
              {PACKAGES.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} href={talkHref(pkg.id)} />
              ))}
            </div>

            <p className="sbe-adv-remote">
              <strong>Remote Review: From $690.</strong> Interstate or regional? Our Remote Review
              covers the same data review and written report via video walk-through and a 45 min
              debrief.{" "}
              <Link href={talkHref("remote-review")} className="sbe-adv-inline-link">
                Ask about a Remote Review
              </Link>
            </p>

            <div className="sbe-adv-modules">
              <div className="sbe-adv-modules-head">
                <h3 className="sbe-adv-subhead">Systems Upgrade modules</h3>
                <p className="sbe-adv-modules-price">From $1,500 per module</p>
              </div>
              <ul className="sbe-adv-deflist">
                {MODULES.map((m) => (
                  <li key={m.title}>
                    <strong>{m.title}</strong>
                    <span>{m.body}</span>
                  </li>
                ))}
              </ul>
              <p className="sbe-adv-modules-cta">
                <Link href={talkHref("systems-upgrade")} className="sbe-adv-inline-link">
                  Ask about a module
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Your Venue Hub: darker band ── */}
        <section className="sbe-adv-hub">
          <div className="container sbe-adv-hub-grid">
            <div className="sbe-adv-hub-copy">
              <p className="sbe-mkt-hero-eyebrow">Coming soon</p>
              <h2 className="sbe-adv-hub-title">Your venue. One hub.</h2>
              <p className="sbe-adv-hub-body">
                A private app branded as your own, for example &quot;The Grand Hotel Hub&quot;.
                Supplier deals, stock, sales KPIs and staff training in one place. No more digging
                through 100 supplier emails.
              </p>

              <ul className="sbe-adv-hub-list">
                {HUB_MODULES.map((m) => (
                  <li key={m.title}>
                    <strong>{m.title}</strong>
                    <span>{m.body}</span>
                  </li>
                ))}
              </ul>

              <Link href={talkHref("hub-pilot")} className="sbe-mkt-btn-primary">
                Join the founding pilot
              </Link>
            </div>

            <div className="sbe-adv-hub-visual">
              <div
                className="sbe-adv-phone"
                role="img"
                aria-label="Sample Venue Hub app screen branded as The Grand Hotel Hub"
              >
                <div className="sbe-adv-phone-screen" aria-hidden="true">
                  <div className="sbe-adv-phone-head">
                    <span className="sbe-adv-phone-venue">The Grand Hotel Hub</span>
                    <span className="sbe-adv-phone-sub">Good afternoon, team</span>
                  </div>
                  <ul className="sbe-adv-phone-rows">
                    {HUB_MOCK_ROWS.map((row) => (
                      <li key={row.label} className="sbe-adv-phone-row">
                        <span className="sbe-adv-phone-row-label">{row.label}</span>
                        <span className="sbe-adv-phone-row-value">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="sbe-adv-phone-bar" />
                </div>
              </div>
              <p className="sbe-adv-hub-caption">Sample screen</p>
            </div>
          </div>
        </section>

        {/* ── 6. Add-ons ── */}
        <section className="section">
          <div className="container">
            <header className="sbe-mkt-head">
              <h2 className="sbe-mkt-display">Add-ons</h2>
            </header>
            <ul className="sbe-adv-addons">
              {ADD_ONS.map((a) => (
                <li key={a.name} className="sbe-adv-addon">
                  <span className="sbe-adv-addon-name">{a.name}</span>
                  <span className="sbe-adv-addon-price">{a.price}</span>
                </li>
              ))}
            </ul>
            <p className="sbe-adv-addons-note">
              Need a one-off session?{" "}
              <Link href={talkHref("strategy-session")} className="sbe-adv-inline-link">
                Strategy Sessions
              </Link>{" "}
              from $295 (90 min, remote). Extra hours from $150/hr, always quoted first.
            </p>
          </div>
        </section>

        {/* ── 7. About Mitch: text-led, pull quote beside the copy ── */}
        <section className="section section-alt">
          <div className="container sbe-adv-about">
            <div className="sbe-adv-about-copy">
              <header className="sbe-mkt-head">
                <h2 className="sbe-mkt-display">Built from the sink up.</h2>
              </header>
              <p>
                Mitch started at 13, washing dishes in a busy restaurant kitchen. Twenty years on,
                he&apos;s worked almost every role a venue has: chain operations, high-end cocktail
                bars, seven years in bottleshops, six years in venue management and years on the
                road selling liquor across QLD and Northern NSW.
              </p>
              <p>
                That path taught him one thing. Good venues don&apos;t run on luck. They run on
                structure.
              </p>
              <p>
                Through By Example Advisory, Mitch helps owners fix the problems underneath the
                busy nights and build a culture that holds when staff move on.
              </p>
            </div>
            {/* Repeats a line from the copy, so it is hidden from screen readers */}
            <p className="sbe-adv-pullquote" aria-hidden="true">
              Good venues don&apos;t run on luck. They run on structure.
            </p>
          </div>
        </section>

        {/* ── 8. FAQ ── */}
        <section className="sbe-mkt-faq">
          <div className="container sbe-mkt-faq-grid">
            <div className="sbe-adv-faq-intro">
              <header className="sbe-mkt-head">
                <h2 className="sbe-mkt-display">FAQ</h2>
              </header>
              <p>Still unsure? Book a free 15 min call.</p>
              <Link href={talkHref("general")} className="sbe-mkt-btn-primary">
                {BOOK_CALL}
              </Link>
            </div>
            <div className="sbe-mkt-faq-list">
              {FAQS.map((f) => (
                <details key={f.q} className="sbe-mkt-faq-item" name="advisory-faq">
                  <summary className="sbe-mkt-faq-q">
                    <span>{f.q}</span>
                    <span className="sbe-mkt-faq-icon" aria-hidden="true" />
                  </summary>
                  <div className="sbe-mkt-faq-a">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. Final CTA ── */}
        <CTABand
          title="Let's make your venue run better."
          copy="Start with a free 15 min call. No hard pitch."
          primary={{ label: BOOK_CALL, href: talkHref("general") }}
        />
      </main>

      <Footer />
    </div>
  );
}
