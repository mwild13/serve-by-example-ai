import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroStickyBar from "@/components/HeroStickyBar";
import CTABand from "@/components/marketing/CTABand";
import FeatureGrid, { type FeatureGridItem } from "@/components/marketing/FeatureGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import PackageCard, { type AdvisoryPackage } from "@/components/advisory/PackageCard";
import AdvisoryCtaTracker from "@/components/advisory/AdvisoryCtaTracker";
import {
  IconUsers,
  IconClock,
  IconGlass,
  IconMessage,
  IconLayers,
  IconChart,
  IconBook,
} from "@/components/icons/MarketingIcons";

export const metadata: Metadata = {
  title: "Hospitality Consulting | By Example Advisory | Serve By Example",
  description:
    "Hands-on hospitality consulting for venues in SEQ and Northern NSW. Venue health checks, bar profit reviews, service training and systems setup from an operator with 15+ years on the floor.",
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

const TRUST_ITEMS = [
  "15+ years in hospitality operations",
  "7 years in bottleshops",
  "Ex liquor sales rep",
];

const PROBLEMS: FeatureGridItem[] = [
  {
    icon: <IconUsers />,
    title: "Staff come and go.",
    body: "Service changes with every new face on the floor.",
  },
  {
    icon: <IconClock />,
    title: "Wages keep creeping.",
    body: "Rosters built on habit, not sales.",
  },
  {
    icon: <IconGlass />,
    title: "The bar leaks money.",
    body: "Over-pours, waste and stock that never moves.",
  },
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
    audience: "For venues battling turnover or inconsistent service.",
    popular: true,
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
    audience: "For venues that want an operator in their corner.",
    note: "3 month minimum.",
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

const HUB_TILES: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <IconMessage />, title: "Supplier inbox", body: "Deals and price lists sorted automatically" },
  { icon: <IconLayers />, title: "Stock", body: "On-hand numbers and reorder alerts" },
  { icon: <IconChart />, title: "F&B KPIs", body: "Sales, margin and pour cost" },
  { icon: <IconUsers />, title: "Team learning", body: "Serve By Example progress for managers" },
  { icon: <IconBook size={22} />, title: "Teaching area", body: "Your SOPs, specs and recipes" },
];

// Rows shown inside the coded phone mockup — sample content only.
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

const WAYS: FeatureGridItem[] = [
  {
    eyebrow: "15 min",
    title: "Free discovery call",
    body: "Your venue, your biggest problem and whether we're a fit.",
  },
  {
    eyebrow: "From $295",
    title: "Strategy Session",
    body: "A 90 min remote deep dive on one problem, with a written action summary. Credited to any package booked within 30 days.",
  },
  {
    eyebrow: "From $150/hr",
    title: "Extra hours",
    body: "Only once a package's included time is used, and always quoted first.",
  },
];

const SERVICE_AREAS = [
  {
    title: "SEQ and Northern NSW",
    body: "In person, with travel included from Brisbane to Byron Bay.",
  },
  {
    title: "Interstate",
    body: "Remote via video call, or in person on request with travel at cost.",
  },
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

        {/* ── 1. Hero — same classes as the homepage hero ── */}
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
                Advice from an operator, not a tech company. Hands-on hospitality consulting from
                the team behind Serve By Example.
              </p>

              <div className="sbe-mkt-hero-actions">
                <div className="sbe-mkt-hero-btn-row">
                  <Link href={talkHref("general")} className="sbe-mkt-hero-cta">
                    Talk to us
                  </Link>
                  <a href="#packages" className="sbe-mkt-hero-secondary">
                    See packages
                  </a>
                </div>
              </div>

              <ul className="sbe-mkt-hero-trust" aria-label="Founder experience">
                {TRUST_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <HeroStickyBar label="Free 15 min discovery call" cta="Talk to us" href={talkHref("general")} />
        </section>

        {/* ── 2. The problem ── */}
        <section className="section">
          <div className="container">
            <SectionHeading title="Sound familiar?" />
            <FeatureGrid items={PROBLEMS} columns={3} />
          </div>
        </section>

        {/* ── 3. How it works ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading title="Audit. Fix. Sustain." />
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
            <SectionHeading title="Pick your starting point" copy="All prices AUD ex GST." />

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
                Talk to us about a Remote Review
              </Link>
            </p>

            <div className="sbe-adv-modules">
              <div className="sbe-adv-modules-head">
                <h3 className="sbe-adv-subhead">Systems Upgrade modules</h3>
                <p className="sbe-adv-modules-price">From $1,500 per module</p>
              </div>
              <ul className="sbe-adv-module-grid">
                {MODULES.map((m) => (
                  <li key={m.title} className="sbe-adv-module">
                    <span className="sbe-adv-module-title">{m.title}</span>
                    <span className="sbe-adv-module-body">{m.body}</span>
                  </li>
                ))}
              </ul>
              <p className="sbe-adv-modules-cta">
                <Link href={talkHref("systems-upgrade")} className="sbe-adv-inline-link">
                  Talk to us about a module
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Your Venue Hub — darker band ── */}
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

              <ul className="sbe-adv-hub-tiles">
                {HUB_TILES.map((tile) => (
                  <li key={tile.title} className="sbe-adv-hub-tile">
                    <span className="sbe-adv-hub-tile-icon" aria-hidden="true">
                      {tile.icon}
                    </span>
                    <span className="sbe-adv-hub-tile-title">{tile.title}</span>
                    <span className="sbe-adv-hub-tile-body">{tile.body}</span>
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
            <SectionHeading title="Add-ons" />
            <ul className="sbe-adv-addons">
              {ADD_ONS.map((a) => (
                <li key={a.name} className="sbe-adv-addon">
                  <span className="sbe-adv-addon-name">{a.name}</span>
                  <span className="sbe-adv-addon-price">{a.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 7. Ways to work with us ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading title="Ways to work with us" />
            <FeatureGrid items={WAYS} columns={3} />
            <div className="sbe-adv-section-cta">
              <Link href={talkHref("strategy-session")} className="btn btn-primary btn-lg">
                Talk to us
              </Link>
            </div>
          </div>
        </section>

        {/* ── 8. Service area ── */}
        <section className="section">
          <div className="container">
            <SectionHeading title="Where we work" />
            <div className="sbe-adv-areas">
              {SERVICE_AREAS.map((area) => (
                <div key={area.title} className="sbe-adv-area">
                  <h3 className="sbe-adv-area-title">{area.title}</h3>
                  <p className="sbe-adv-area-body">{area.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. About Mitch ── */}
        <section className="section section-alt">
          <div className="container sbe-adv-about">
            <div className="sbe-adv-about-photo">
              <Image
                src="/images/advisory/advisory-about.jpg"
                alt={HERO_ALT}
                width={896}
                height={1200}
                sizes="(max-width: 900px) 92vw, 400px"
              />
            </div>
            <div className="sbe-adv-about-copy">
              <SectionHeading title="Built on the floor" />
              <p>
                Mitch has spent 15+ years in hospitality operations, from running floors to fixing
                venues that had lost their way. Before that came 7 years in bottleshops and years
                on the road as a liquor sales rep across QLD and Northern NSW.
              </p>
              <p>
                He&apos;s seen every side of a venue: the pass, the bar, the cool room and the
                supplier meeting. By Example Advisory brings all of it to your business.
              </p>
              <p>
                He built Serve By Example because good service shouldn&apos;t walk out the door
                every time a staff member does.
              </p>
            </div>
          </div>
        </section>

        {/* ── 10. FAQ ── */}
        <section className="section">
          <div className="container">
            <SectionHeading title="FAQ" />
            <div className="faq-list sbe-adv-faq">
              {FAQS.map((f) => (
                <details key={f.q} className="faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 11. Final CTA ── */}
        <CTABand
          title="Let's make your venue run better."
          copy="Start with a free 15 minute call."
          primary={{ label: "Talk to us", href: talkHref("general") }}
        />
      </main>

      <Footer />
    </div>
  );
}
