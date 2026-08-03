import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/marketing/PageHero';
import CTABand from '@/components/marketing/CTABand';
import FeatureGrid, { type FeatureGridItem } from '@/components/marketing/FeatureGrid';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata: Metadata = {
  title: 'Free Staff Onboarding SOP Templates | Serve By Example',
  description:
    'Generate customised, venue-specific staff onboarding SOP templates for Australian hospitality operators in 60 seconds. Covers RSA, allergens, opening/closing, and compliance paperwork.',
  alternates: { canonical: '/resources/sop-toolkit' },
};

const sopFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this actually free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. No credit card, no account, no catch. Enter your name and email to unlock your editable template.",
      },
    },
    {
      "@type": "Question",
      "name": "Which Australian states are covered?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All 8 states and territories. Regulatory references are tailored to the jurisdiction you select.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I edit the template?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You receive a fully editable Notion document you can duplicate into your own workspace and customise from there.",
      },
    },
    {
      "@type": "Question",
      "name": "Is this a substitute for legal or HR advice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Templates are aligned to publicly available Award and licensing frameworks. Seek qualified advice for complex compliance questions.",
      },
    },
    {
      "@type": "Question",
      "name": "What's the difference between this and the Serve By Example platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The SOP template is a one-time static document. The platform gives your team interactive training, AI scenario practice, progress tracking, and a full manager dashboard.",
      },
    },
  ],
};

// Blockquote used inside compliance cards
function CardQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        borderLeft: '3px solid var(--green)',
        paddingLeft: '1rem',
        margin: '1rem 0 0',
        fontStyle: 'italic',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
    >
      {children}
    </blockquote>
  );
}

const complianceCards: FeatureGridItem[] = [
  {
    title: 'RSA & Responsible Service',
    body: (
      <>
        <p style={{ margin: 0 }}>
          State liquor legislation, shift registry requirements, refusal-of-service escalation
          protocols, and competency card verification procedures.
        </p>
        <CardQuote>
          &ldquo;Log all incident reports inside the Shift Registry within 30 minutes of any patron
          eviction event.&rdquo;
        </CardQuote>
      </>
    ),
  },
  {
    title: 'Allergen Communication',
    body: (
      <>
        <p style={{ margin: 0 }}>
          Food Standards Code 1.2.3 disclosure obligations, cross-contamination prevention, and
          kitchen-to-floor sign-off accountability.
        </p>
        <CardQuote>
          &ldquo;Verify alternative milk pitchers are chemically isolated and machine-washed after
          every single use.&rdquo;
        </CardQuote>
      </>
    ),
  },
  {
    title: 'Opening & Closing Procedures',
    body: (
      <>
        <p style={{ margin: 0 }}>
          Security lockout compliance, environmental control shutdown checklists, incident register
          handover, and end-of-shift POS reconciliation.
        </p>
        <CardQuote>
          &ldquo;Confirm all fire egress pathways are cleared and unlocked before opening for
          service.&rdquo;
        </CardQuote>
      </>
    ),
  },
  {
    title: 'Pre-Start Compliance Paperwork',
    body: (
      <>
        <p style={{ margin: 0 }}>
          Right-to-work verification, tax file number collection, Fair Work Information Statement,
          and policy declaration signatures.
        </p>
        <CardQuote>
          &ldquo;Issue the Fair Work Information Statement before assigning the first paid roster
          shift.&rdquo;
        </CardQuote>
      </>
    ),
  },
];

const whoItsFor: FeatureGridItem[] = [
  {
    title: 'Venue Manager',
    body: 'Streamline casual inductions, reduce RSA exposure, and close procedural gaps before a compliance visit.',
  },
  {
    title: 'Owner-Operator',
    body: 'Protect your licence, document your standards, and hand off training to floor staff with confidence.',
  },
  {
    title: 'Hotel F&B / Ops Manager',
    body: 'Standardise onboarding across sites and audit compliance variation between venues.',
  },
];

export default function SopToolkitPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sopFaqSchema) }}
        />

        {/* ── Hero ── */}
        <PageHero
          eyebrow="Free Resource"
          title="Free Staff Onboarding SOP Templates for Australian Hospitality Venues"
          subtitle="Built in 60 seconds. Customised to your venue type, your state, and your biggest compliance pain point."
          actions={[
            { label: 'Build My Free SOP Template', href: '/toolkit', variant: 'primary' },
            { label: 'Download PDF Checklist', href: '/resources', variant: 'secondary' },
          ]}
        />

        {/* ── What's Covered ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Four compliance areas"
              title="Every template covers one critical friction point."
            />
            <FeatureGrid items={complianceCards} columns={2} />
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Three steps"
              title="Personalised to your venue in under a minute."
            />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              marginTop: '3rem',
            }}>
              {[
                {
                  n: '1',
                  heading: 'Select your venue type',
                  body: 'Pick from bars, cafes, full-service restaurants, clubs, or multi-outlet hotel F&B operations.',
                },
                {
                  n: '2',
                  heading: 'Select your state and pain point',
                  body: 'We align the template to your local regulatory framework and your primary operational friction point.',
                },
                {
                  n: '3',
                  heading: 'Unlock your editable template',
                  body: 'Receive a fully editable Notion document you can copy straight into your own workspace.',
                },
              ].map((step) => (
                <div key={step.n} style={{ padding: '1.5rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--green)',
                    color: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {step.n}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.6rem', color: 'var(--text)' }}>
                    {step.heading}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', lineHeight: '1.6' }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Venue Types ── */}
        <section className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Five venue categories"
              title="Built for every type of Australian hospitality operation."
            />

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              maxWidth: '780px',
              marginTop: '3rem',
            }}>
              {[
                { name: 'Late-Night Bar / Pub', angle: 'Liquor licensing curfews, lockout laws, RSA shift registry' },
                { name: 'Cafe or Brunch Venue', angle: 'BYO licensing edge cases, allergen menus, food safety supervisor requirements' },
                { name: 'Full-Service Restaurant', angle: 'FOH/BOH handover documentation, allergen accountability chains' },
                { name: 'Hotel F&B', angle: 'Cross-venue shift compliance, multi-outlet incident registers' },
                { name: 'Club or Nightclub', angle: 'Crowd controller registry, lockout/curfew procedures, patron ID logs' },
              ].map((v) => (
                <div key={v.name} style={{
                  background: 'var(--surface)',
                  padding: '1.1rem 1.75rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                }}>
                  <strong style={{ minWidth: '210px', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{v.name}</strong>
                  <span style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{v.angle}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who It's For ── */}
        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Built for operators"
              title="Whether you run one venue or five."
            />
            <FeatureGrid items={whoItsFor} columns={3} />
          </div>
        </section>

        {/* ── Compliance Context — dark set-piece, kept ── */}
        <section style={{ backgroundColor: 'var(--green)', padding: '5rem 1.5rem' }}>
          <div className="container">
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              textAlign: 'center',
              marginBottom: '3rem',
              color: 'var(--surface-raised)',
              letterSpacing: '-0.02em',
            }}>
              Why documentation matters under Australian law.
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '3rem',
              marginBottom: '3rem',
            }}>
              {[
                {
                  heading: 'Fair Work Act 2009',
                  body: 'Employers must provide the Fair Work Information Statement to every new employee at commencement.',
                },
                {
                  heading: 'Food Standards Code 1.2.3',
                  body: 'Allergen declaration is a legal obligation under the Australia New Zealand Food Standards Code, not a best-practice guideline.',
                },
                {
                  heading: 'State Liquor Acts',
                  body: 'RSA competency card verification is a venue licence condition in every Australian state and territory.',
                },
              ].map((stat) => (
                <div key={stat.heading}>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.15rem',
                    color: 'var(--text-light-on-dark)',
                    borderBottom: '1px solid var(--border-light-on-dark)',
                    paddingBottom: '0.6rem',
                    marginBottom: '0.9rem',
                  }}>
                    {stat.heading}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-light-muted-on-dark)', lineHeight: '1.6' }}>
                    {stat.body}
                  </p>
                </div>
              ))}
            </div>

            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-light-faint-on-dark)',
              textAlign: 'center',
              borderTop: '1px solid var(--border-light-faint-on-dark)',
              paddingTop: '1.5rem',
              maxWidth: '640px',
              margin: '0 auto',
            }}>
              Templates are aligned to the Hospitality Industry (General) Award 2020 and applicable state licensing requirements. Not a substitute for legal or HR advice. Current as at June 2026.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: '720px' }}>
            <SectionHeading eyebrow="Common questions" title="SOP Toolkit FAQ" />
            <div className="faq-list">
              {[
                { q: 'Is this actually free?', a: 'Yes. No credit card, no account, no catch. Enter your name and email to unlock your editable template.' },
                { q: 'Which Australian states are covered?', a: 'All 8 states and territories. Regulatory references are tailored to the jurisdiction you select.' },
                { q: 'Can I edit the template?', a: 'Yes. You receive a fully editable Notion document you can duplicate into your own workspace and customise from there.' },
                { q: 'Is this a substitute for legal or HR advice?', a: 'No. Templates are aligned to publicly available Award and licensing frameworks. Seek qualified advice for complex compliance questions.' },
                { q: "What's the difference between this and the Serve By Example platform?", a: 'The SOP template is a one-time static document. The platform gives your team interactive training, AI scenario practice, progress tracking, and a full manager dashboard.' },
              ].map((item, i) => (
                <div key={i} className="faq-item">
                  <button className="faq-question">{item.q}</button>
                  <div className="faq-answer"><p>{item.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <CTABand
          background="gold"
          title="Build your free SOP template now."
          copy="No account required. Takes 60 seconds."
          primary={{ label: 'Build My Free SOP Template', href: '/toolkit' }}
        />
      </main>
      <Footer />
    </div>
  );
}
