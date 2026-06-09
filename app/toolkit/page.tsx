import type { Metadata } from 'next';
import Link from 'next/link';
import SopGeneratorPreview from '@/components/toolkit/SopGeneratorPreview';

export const metadata: Metadata = {
  title: 'Free Staff Onboarding SOP Templates — Serve By Example',
  description:
    'Customisable FOH and BOH onboarding SOP templates for Australian hospitality venues. Covers RSA compliance, Day 1 orientation, food safety, and progress review.',
  robots: 'noindex',
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

      <section
        style={{
          maxWidth: '800px',
          margin: '0 auto 3rem auto',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.8rem',
            color: 'var(--green)',
            fontWeight: '600',
            marginBottom: '0.75rem',
          }}
        >
          Free for Australian hospitality operators
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            lineHeight: '1.15',
            color: 'var(--text)',
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          Your venue&rsquo;s staff onboarding SOP, built in 60 seconds.
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.65',
            color: 'var(--text-soft)',
            maxWidth: '580px',
            margin: '0 auto',
          }}
        >
          Select your venue type and biggest compliance pain point. We&rsquo;ll generate
          a structured, copy-pasteable SOP template matched to your operation.
        </p>
      </section>

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
