import type { Metadata } from 'next';
import Link from 'next/link';
import SopGeneratorPreview from '@/app/toolkit/_components/SopGeneratorPreview';
import PageHero from '@/components/marketing/PageHero';

export const metadata: Metadata = {
  title: 'Free Staff Onboarding SOP Templates — Serve By Example',
  description:
    'Customisable FOH and BOH onboarding SOP templates for Australian hospitality venues. Covers RSA compliance, Day 1 orientation, food safety, and progress review.',
  robots: 'noindex',
  alternates: { canonical: '/toolkit' },
};

export default function ToolkitPage() {
  return (
    <main
      style={{
        backgroundColor: 'var(--bg)',
        minHeight: '100vh',
        padding: '4rem 1.5rem',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <nav style={{ maxWidth: '850px', margin: '0 auto 3rem auto' }}>
        <Link
          href="/"
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          Serve By Example
        </Link>
      </nav>

      {/* Deliberately chrome-less lead-magnet page — PageHero for markup
          consistency, but no Navbar/Footer/CTABand: the generator below IS
          the conversion action, and extra nav is an exit route. */}
      <PageHero
        compact
        eyebrow="Free for Australian hospitality operators"
        title="Your venue’s staff onboarding SOP, built in 60 seconds."
        subtitle="Select your venue type and biggest compliance pain point. We’ll generate a structured, copy-pasteable SOP template matched to your operation."
      />

      <section style={{ maxWidth: '850px', margin: '0 auto' }}>
        <SopGeneratorPreview />
      </section>

      <footer
        style={{
          maxWidth: '580px',
          margin: '4rem auto 0 auto',
          textAlign: 'center',
          borderTop: '1px solid var(--line)',
          paddingTop: '2rem',
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
          }}
        >
          Templates are aligned to the Hospitality Industry (General) Award 2020 and
          applicable state licensing requirements. Not a substitute for legal or HR advice.
          Current as at June 2026.
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Link
            href="/"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            servebyexample.co
          </Link>
          {' · '}
          <Link
            href="/privacy"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Privacy policy
          </Link>
        </p>
      </footer>
    </main>
  );
}
