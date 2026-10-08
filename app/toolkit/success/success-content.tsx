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

export function SuccessContent() {
  const params = useSearchParams();
  const role = params.get('role') ?? '';

  const hint = ROLE_HINTS[role];
  // No lead id here on purpose: it is the unsubscribe credential and only
  // goes out in the delivery email (see app/api/toolkit-capture/route.ts).
  const notionHref = '/api/toolkit-open';

  return (
    <div className="sbe-mkt-confirm">
      <p className="sbe-mkt-kicker">Sent to your inbox</p>
      <h1 className="sbe-mkt-display">Your toolkit is ready.</h1>
      <p className="sbe-mkt-lede">
        We&rsquo;ve also sent it to your inbox. Look for an email from Mitch at Serve By Example.
      </p>
      <a href={notionHref} target="_blank" rel="noopener noreferrer" className="sbe-mkt-btn-primary">
        Open the Notion toolkit
      </a>

      {hint && (
        <div className="sbe-mkt-confirm-hint">
          <p className="sbe-mkt-plan-tier">One thing to look for</p>
          <h2>{hint.heading}</h2>
          <p>{hint.body}</p>
        </div>
      )}

      <p className="sbe-mkt-footnote">
        <Link href="/">servebyexample.co</Link>
      </p>
    </div>
  );
}
