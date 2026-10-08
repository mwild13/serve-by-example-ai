import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CompareMatrix from "@/components/ui/CompareMatrix";
import PageHero from "@/components/marketing/PageHero";
import CTABand from "@/components/marketing/CTABand";
import PricingPlans from "@/components/marketing/PricingPlans";

// ── Content ───────────────────────────────────────────────────────────────────
// Metadata lives in layout.tsx. Tier prices and checkout logic live in
// components/marketing/PricingPlans.tsx.

const FOUNDING = [
  {
    title: "Your rate is locked",
    copy: "Rates will rise as the platform grows. Founding Members keep their original rate for life, whatever happens to pricing later.",
  },
  {
    title: "Set up with us, 1-on-1",
    copy: "We personally walk your team through setup and get your first staff trained in week one. A direct conversation, not a video tutorial.",
  },
  {
    title: "A say in what we build",
    copy: "Monthly calls with our product team. Founding members directly influence which modules, features and tools get prioritised.",
  },
];

// Single source for the FAQ accordion and its FAQPage structured data.
const FAQS: { q: string; a: string; link?: { label: string; href: string } }[] = [
  {
    q: "Is there a free trial?",
    a: "Yes. Venue and Group plans include a 14-day free trial with no credit card required. Use the Manager Console and the full training library before committing to a paid plan.",
  },
  {
    q: "Can I skip the trial and buy straight away?",
    a: "Yes. Choose “buy now” under any plan to go straight to secure checkout. The Staff plan has no trial, so it starts with checkout.",
  },
  {
    q: "How does billing work?",
    a: "We offer monthly and annual billing. Annual billing costs the same as ten months, so you get two months free. There are no long-term contracts or lock-in periods. You can cancel at any time, and access continues through the end of your billing cycle.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 14-day window on your initial payment if the platform does not meet your operational standards. Beyond this period we do not offer refunds, though you can cancel at any time.",
  },
  {
    q: "What happens when I cancel?",
    a: "Your access stays active until your current paid period ends. Your historical training data is securely archived, so you can reactivate your subscription whenever you are ready.",
  },
  {
    q: "How many staff can I add?",
    a: "Venue plans provide up to 15 staff seats for one venue. Group plans support up to 35 staff across your team. Franchise plans are custom-scoped and support unlimited staff across multiple venues.",
  },
  {
    q: "Is my training data secure and private?",
    a: "Yes. Scenario responses are used only to calculate your own performance metrics. Your data is private and is never disclosed to third parties or other venues without your explicit consent. All data is isolated per venue using Supabase Row-Level Security.",
    link: { label: "Read the Privacy Policy", href: "/privacy" },
  },
  {
    q: "Do you offer a plan for large groups?",
    a: "Yes. The Franchise plan is designed for venue groups and large hospitality organisations. It includes unlimited seats, dedicated account management, custom module development and white-label options.",
    link: { label: "Talk to us about Franchise", href: "/contact?source=pricing&package=franchise" },
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="sbe-mkt-pricing-page">
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

        {/* ── Hero: short, so the price board overlapping it lands above the fold ── */}
        <div className="sbe-mkt-pricing-hero">
          <PageHero
            variant="dark"
            compact
            eyebrow="Founding Member Rates — Locked In For Life"
            title="Your Membership Starts Here."
            subtitle="Built for hospitality operators. Priced for founders. Lock in your rate before the industry catches up."
          />
        </div>

        {/* ── Price board (client): toggle, three plans, guarantee, Franchise row ── */}
        <PricingPlans />

        {/* ── Founding rate: same four tracks as the board above ── */}
        <section className="sbe-mkt-founding">
          <div className="container sbe-mkt-founding-grid">
            <header className="sbe-mkt-founding-intro">
              <p className="sbe-mkt-kicker">Founding members</p>
              <h2 className="sbe-mkt-founding-title">The price you start on is the price you keep.</h2>
              <p className="sbe-mkt-founding-lede">
                Serve By Example is opening to its first venues now. Every plan above is a founding rate.
              </p>
              <Link href="/roi" className="sbe-mkt-btn-text">
                Work out what this is worth for your venue
              </Link>
            </header>
            <ul className="sbe-mkt-founding-list">
              {FOUNDING.map(({ title, copy }) => (
                <li key={title} className="sbe-mkt-founding-item">
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Comparison: dark band, closed by default, columns under the plans ── */}
        <section className="sbe-mkt-compare-band">
          <div className="container">
            <CompareMatrix flush collapsible hideFranchise />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="sbe-mkt-faq">
          <div className="container sbe-mkt-faq-grid">
            <header className="sbe-mkt-head">
              <p className="sbe-mkt-kicker">Before you commit</p>
              <h2 className="sbe-mkt-display">Billing, trials and cancelling.</h2>
              <p className="sbe-mkt-lede">
                Something else?{" "}
                <a href="mailto:info@servebyexample.co" className="sbe-mkt-faq-link">Email support</a>
                {" "}or{" "}
                <Link href="/roadmap" className="sbe-mkt-faq-link">see what we are building next</Link>.
              </p>
            </header>
            <div className="sbe-mkt-faq-list">
              {FAQS.map(({ q, a, link }) => (
                <details key={q} className="sbe-mkt-faq-item" name="pricing-faq">
                  <summary className="sbe-mkt-faq-q">
                    <span>{q}</span>
                    <span className="sbe-mkt-faq-icon" aria-hidden="true" />
                  </summary>
                  <div className="sbe-mkt-faq-a">
                    <p>
                      {a}
                      {link ? (
                        <>
                          {" "}
                          <Link href={link.href} className="sbe-mkt-faq-link">{link.label}</Link>.
                        </>
                      ) : null}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <CTABand
          title="Start training your team this week."
          copy="14-day free trial. Set up in under 10 minutes."
          primary={{ label: "Start my 14-day trial", href: "/login?intent=trial&tier=boutique" }}
          secondary={{ label: "Talk to us", href: "/contact?source=pricing" }}
        />
      </main>

      <Footer />
    </div>
  );
}
