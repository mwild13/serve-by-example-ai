'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const ROLE_HINTS: Record<string, { heading: string; body: string }> = {
  owner_operator: {
    heading: 'Start with Section 7 — Annual Cost Summary',
    body: 'Fill in the friction counters as you work through each section and carry the totals forward. The final number is always larger than people expect.',
  },
  venue_manager: {
    heading: 'Work through it as if inducting someone right now',
    body: "The sections you can't complete are the gaps. What only exists verbally, or lives in one person's head, is your operational risk.",
  },
  ops_manager: {
    heading: 'Run the checklist across each site separately',
    body: 'The variation between venues is the finding. Where one site has a signed process and another relies on memory — that is the exposure.',
  },
};

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function SuccessContent() {
  const params = useSearchParams();
  const role = params.get('role') ?? '';
  const leadId = params.get('lead_id') ?? '';

  const hint = ROLE_HINTS[role];
  const notionHref = leadId
    ? `/api/toolkit-open?id=${leadId}`
    : '/api/toolkit-open';

  return (
    <div
      style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--green-light)',
          color: 'var(--green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem auto',
        }}
      >
        <CheckIcon />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          lineHeight: '1.2',
          color: 'var(--text)',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}
      >
        Your toolkit is ready.
      </h1>

      <p
        style={{
          color: 'var(--text-soft)',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
        }}
      >
        We&rsquo;ve also sent it to your inbox. Look for an email from Mitch
        at Serve By Example.
      </p>

      <a
        href={notionHref}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-block"
        style={{ display: 'block', marginBottom: '1.5rem' }}
      >
        Open the Notion toolkit
      </a>

      {hint && (
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            backgroundColor: 'var(--surface)',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}
          >
            One thing to look for
          </p>
          <p
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '0.4rem',
            }}
          >
            {hint.heading}
          </p>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-soft)',
              lineHeight: '1.55',
            }}
          >
            {hint.body}
          </p>
        </div>
      )}

      <p
        style={{
          marginTop: '3rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <Link
          href="/"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          servebyexample.co
        </Link>
      </p>
    </div>
  );
}
