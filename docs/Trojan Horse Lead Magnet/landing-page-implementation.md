# Landing page — implementation

## Supabase schema

```sql
create table public.toolkit_leads (
  id                      uuid          default gen_random_uuid() primary key,
  created_at              timestamptz   default now() not null,
  first_name              text          not null,
  email                   text          not null,
  role                    text          not null,
  utm_source              text,
  utm_medium              text,
  utm_campaign            text,
  toolkit_delivered       boolean       default false not null,
  email_sequence_started  boolean       default false not null,
  waitlist_converted      boolean       default false not null,
  consent_marketing       boolean       default true not null,
  consent_at              timestamptz   default now() not null,
  unsubscribed_at         timestamptz,

  constraint toolkit_leads_role_check check (
    role in ('owner_operator', 'venue_manager', 'ops_manager')
  )
);

-- Case-insensitive unique email
create unique index toolkit_leads_email_idx
  on public.toolkit_leads (lower(email));

-- RLS — server-side only via service role
alter table public.toolkit_leads enable row level security;

create policy "Service role full access"
  on public.toolkit_leads
  for all
  to service_role
  using (true)
  with check (true);

create index toolkit_leads_created_at_idx
  on public.toolkit_leads (created_at desc);
```

---

## Environment variables

```env
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RESEND_API_KEY=re_your_resend_api_key

NOTION_TOOLKIT_URL=https://notion.so/servebyexample/Australian-Hospitality-Compliance-Onboarding-Toolkit-Bundle

APP_URL=https://servebyexample.co
```

---

## File structure

```
app/
  toolkit/
    page.tsx                        Landing page
    success/
      page.tsx                      Success page (server wrapper)
      success-content.tsx           Success content (client)
  api/
    toolkit-capture/
      route.ts                      Capture, validate, insert, fire Email 1
    toolkit-open/
      route.ts                      Track Notion open, redirect
    unsubscribe/
      route.ts                      Spam Act unsubscribe handler
components/
  toolkit/
    capture-form.tsx                Client-side form component
```

---

## `components/toolkit/capture-form.tsx`

```tsx
'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ROLES = [
  { value: '', label: 'My role', disabled: true },
  { value: 'owner_operator', label: 'Owner or operator' },
  { value: 'venue_manager', label: 'Venue manager' },
  { value: 'ops_manager', label: 'Group or multi-venue ops manager' },
] as const;

function FormInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/toolkit-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: fd.get('first_name'),
          email: fd.get('email'),
          role: fd.get('role'),
          utm_source: searchParams.get('utm_source'),
          utm_medium: searchParams.get('utm_medium'),
          utm_campaign: searchParams.get('utm_campaign'),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      window.location.href = json.redirect;
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <input
        name="first_name"
        type="text"
        placeholder="First name"
        required
        autoComplete="given-name"
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
      />
      <input
        name="email"
        type="email"
        placeholder="Business email"
        required
        autoComplete="email"
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
      />
      <select
        name="role"
        required
        defaultValue=""
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60 focus:outline-none focus:border-white/60 transition-colors appearance-none cursor-pointer"
      >
        {ROLES.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled ?? false}
            className="bg-gray-900 text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-60 transition-colors"
      >
        {status === 'loading' ? 'Sending…' : 'Get the free toolkit →'}
      </button>

      <p className="text-xs text-white/40 leading-relaxed">
        By submitting, you agree to receive the toolkit and occasional emails from{' '}
        <a href="https://servebyexample.co" className="underline hover:text-white/60">
          Serve By Example
        </a>
        . Unsubscribe anytime.
      </p>
    </form>
  );
}

export function CaptureForm() {
  return (
    <Suspense>
      <FormInner />
    </Suspense>
  );
}
```

---

## `app/api/toolkit-capture/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const VALID_ROLES = new Set(['owner_operator', 'venue_manager', 'ops_manager']);

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const first_name = typeof body.first_name === 'string' ? body.first_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body.role === 'string' ? body.role : '';
  const utm_source = typeof body.utm_source === 'string' ? body.utm_source : null;
  const utm_medium = typeof body.utm_medium === 'string' ? body.utm_medium : null;
  const utm_campaign = typeof body.utm_campaign === 'string' ? body.utm_campaign : null;

  if (!first_name)
    return NextResponse.json({ error: 'First name is required.' }, { status: 400 });
  if (!email || !isValidEmail(email))
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  if (!VALID_ROLES.has(role))
    return NextResponse.json({ error: 'Please select your role.' }, { status: 400 });

  const { data, error: dbError } = await db
    .from('toolkit_leads')
    .insert({ first_name, email, role, utm_source, utm_medium, utm_campaign })
    .select('id')
    .single();

  if (dbError) {
    // Duplicate email — silent success to prevent enumeration
    if (dbError.code === '23505') {
      const { data: existing } = await db
        .from('toolkit_leads')
        .select('id')
        .eq('email', email)
        .single();
      return NextResponse.json({
        redirect: `/toolkit/success?role=${role}&lead_id=${existing?.id ?? ''}`,
      });
    }
    console.error('[toolkit-capture] DB error:', dbError);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }

  // Fire Email 1 — non-blocking
  sendEmail1({ first_name, email, role, lead_id: data.id }).catch((err) =>
    console.error('[toolkit-capture] Email error:', err)
  );

  return NextResponse.json({
    redirect: `/toolkit/success?role=${role}&lead_id=${data.id}`,
  });
}

async function sendEmail1({
  first_name,
  email,
  lead_id,
}: {
  first_name: string;
  email: string;
  role: string;
  lead_id: string;
}) {
  const toolkitUrl = `${process.env.APP_URL}/api/toolkit-open?id=${lead_id}`;
  const unsubUrl = `${process.env.APP_URL}/api/unsubscribe?id=${lead_id}`;

  const body = [
    `Hi ${first_name},`,
    '',
    "Here's your free Australian Hospitality Compliance & Onboarding Toolkit:",
    '',
    toolkitUrl,
    '',
    "This is a working document — not a guide to read, a tool to fill out. Duplicate it into your own Notion workspace and work through it at your venue.",
    '',
    'Two things to look for as you go through it:',
    '',
    '• The friction counters at the end of each section — fill in your actual numbers.',
    '• The gap callouts — these flag the most common failure points in licensing inspections.',
    '',
    'More on that in a few days.',
    '',
    'Mitch',
    'Serve By Example',
    'servebyexample.co',
    '',
    '---',
    `You're receiving this because you requested the free toolkit at ${process.env.APP_URL}/toolkit.`,
    `Unsubscribe: ${unsubUrl}`,
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Mitch at Serve By Example <mitch@servebyexample.co>',
      reply_to: 'mitch@servebyexample.co',
      to: email,
      subject: 'Your free compliance and onboarding toolkit',
      text: body,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }

  await db
    .from('toolkit_leads')
    .update({ email_sequence_started: true })
    .eq('id', lead_id);
}
```

---

## `app/api/toolkit-open/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (id) {
    db.from('toolkit_leads')
      .update({ toolkit_delivered: true })
      .eq('id', id)
      .then(() => {})
      .catch((err) => console.error('[toolkit-open]', err));
  }

  return NextResponse.redirect(process.env.NOTION_TOOLKIT_URL ?? '/', {
    status: 302,
  });
}
```

---

## `app/api/unsubscribe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return new NextResponse('Invalid unsubscribe link.', { status: 400 });
  }

  await db
    .from('toolkit_leads')
    .update({ consent_marketing: false, unsubscribed_at: new Date().toISOString() })
    .eq('id', id);

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:system-ui,sans-serif;max-width:400px;margin:100px auto;text-align:center;color:#111">
  <h2>Unsubscribed</h2>
  <p style="color:#555">You've been removed from the Serve By Example mailing list.</p>
  <a href="https://servebyexample.co" style="color:#000">Return to servebyexample.co</a>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
```

---

## `app/toolkit/page.tsx`

```tsx
import { CaptureForm } from '@/components/toolkit/capture-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Compliance & Onboarding Toolkit — Serve By Example',
  description:
    'Free Notion templates for Australian hospitality venues — RSA incident logs, state-by-state audit checklists, and staff onboarding SOPs.',
  robots: 'noindex',
};

const ASSETS = [
  {
    label: 'Asset 1',
    title: 'RSA Incident Log & Audit Checklist',
    body: 'State-by-state RSA incident register, compliance checklist, and refusal log. Structured to the requirements of all 8 Australian jurisdictions.',
  },
  {
    label: 'Asset 2',
    title: 'Staff Onboarding SOP Templates',
    body: 'FOH and BOH onboarding templates covering pre-start compliance, Day 1 orientation, training sign-offs, and a 30-day progress review.',
  },
];

const FOR_WHO = [
  'Group and multi-venue ops managers running compliance across multiple sites',
  'Independent owner-operators managing their own staff onboarding',
  'Venue managers getting new hires floor-ready without pulling senior staff',
];

export default function ToolkitPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 px-6 py-4">
        <a href="/" className="text-sm text-white/50 hover:text-white transition-colors">
          Serve By Example
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-6">
          Free for Australian hospitality operators
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          The compliance and onboarding toolkit your venue should already have.
        </h1>
        <p className="text-lg text-white/60 max-w-xl mx-auto mb-4">
          RSA incident logs, state-by-state audit checklists, and staff onboarding SOPs —
          built in Notion, ready in 10 minutes.
        </p>
        <p className="text-xs text-white/30 tracking-wide">
          NSW · VIC · QLD · SA · WA · TAS · ACT · NT
        </p>
      </section>

      {/* Assets */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ASSETS.map((a) => (
            <div
              key={a.label}
              className="border border-white/10 rounded-xl p-6 bg-white/[0.02]"
            >
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">{a.label}</p>
              <h3 className="text-sm font-semibold mb-2">{a.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Who this is for</p>
        <ul className="flex flex-col gap-2">
          {FOR_WHO.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/60">
              <span className="mt-[7px] w-1 h-1 rounded-full bg-white/30 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Capture */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="border border-white/10 rounded-2xl p-8 md:p-10 bg-white/[0.02]">
          <h2 className="text-xl font-semibold mb-2">Get the free toolkit</h2>
          <p className="text-sm text-white/40 mb-8">
            Instant access to both assets in your Notion workspace.
          </p>
          <CaptureForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/25">
          <p>
            Built by someone who's managed training at Australian hospitality venues for 15+ years.
            Toolkit current as at June 2026.
          </p>
          <div className="flex gap-4">
            <a href="/" className="hover:text-white/50 transition-colors">servebyexample.co</a>
            <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy policy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
```

---

## `app/toolkit/success/page.tsx`

```tsx
import { Suspense } from 'react';
import { SuccessContent } from './success-content';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <Suspense>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
```

---

## `app/toolkit/success/success-content.tsx`

```tsx
'use client';

import { useSearchParams } from 'next/navigation';

const ROLE_HINTS: Record<string, string> = {
  owner_operator:
    'Fill in the friction counters in Section 7 with your actual turnover numbers. The annual total will be the number that matters.',
  venue_manager:
    "The SOP template is built around 30 minutes of your active time, not the whole shift. Pay attention to the sections you can't fill in.",
  ops_manager:
    'Run the audit checklist across each site separately. The gaps between venues is the finding.',
};

export function SuccessContent() {
  const params = useSearchParams();
  const role = params.get('role') ?? '';
  const leadId = params.get('lead_id') ?? '';
  const hint = ROLE_HINTS[role];
  const href = leadId ? `/api/toolkit-open?id=${leadId}` : '/api/toolkit-open';

  return (
    <div className="max-w-md w-full text-center">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-3">Your toolkit is ready.</h1>
      <p className="text-white/50 mb-8">
        We've also sent it to your inbox — check for an email from Mitch at Serve By Example.
      </p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full px-6 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors mb-6"
      >
        Open the Notion toolkit →
      </a>

      {hint && (
        <div className="border border-white/10 rounded-xl p-5 text-left bg-white/[0.02]">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">One thing to look for</p>
          <p className="text-sm text-white/60">{hint}</p>
        </div>
      )}

      <p className="mt-10 text-xs text-white/20">
        <a href="/" className="hover:text-white/40 transition-colors">servebyexample.co</a>
      </p>
    </div>
  );
}
```

---

## Secondary entry point — homepage component

Add to `app/page.tsx` (or the relevant homepage file) between the pricing section and FAQ:

```tsx
{/* Toolkit secondary CTA */}
<section className="border-t border-white/10 py-20 px-6">
  <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Free resource</p>
      <h2 className="text-2xl font-bold mb-2">
        Not ready to sign up yet?
      </h2>
      <p className="text-white/50 text-sm max-w-sm">
        Take the free compliance and onboarding toolkit first. RSA incident logs,
        audit checklists, and staff onboarding SOPs for Australian hospitality venues.
        No strings.
      </p>
    </div>
    <a
      href="/toolkit"
      className="shrink-0 px-6 py-3 border border-white/20 rounded-lg text-sm font-medium hover:border-white/50 hover:bg-white/5 transition-colors whitespace-nowrap"
    >
      Get the free toolkit →
    </a>
  </div>
</section>
```

---

## Schema migration — add email sequence tracking columns

Run after the initial schema if the table already exists:

```sql
alter table public.toolkit_leads
  add column if not exists email_2_sent_at timestamptz,
  add column if not exists email_3_sent_at timestamptz,
  add column if not exists email_4_sent_at timestamptz;
```

---

## Updated `sendEmail1` — with `getRoleHook`

Replaces the generic `sendEmail1` function in `app/api/toolkit-capture/route.ts`:

```typescript
function getRoleHook(role: string): string {
  switch (role) {
    case 'ops_manager':
      return [
        "Start with the RSA Incident Log. There's a section for each state — run",
        'the compliance checklist across your sites separately. The gaps between',
        'venues is the finding.',
        '',
        'Look for the friction counter at the end of each section. Fill in your',
        'actual numbers across all sites.',
      ].join('\n');
    case 'owner_operator':
      return [
        'Start with Section 7 of the onboarding SOP — the annual cost summary.',
        'Fill in the friction counters as you go through each section, then carry',
        'the totals forward. By the end, you\'ll have an exact number for what this',
        'process costs you per year.',
        '',
        'The number is always larger than people expect.',
      ].join('\n');
    case 'venue_manager':
      return [
        'Work through the onboarding SOP as if you were inducting a new hire right',
        'now. Pay attention to the sections you can\'t fill in — the procedures that',
        'only exist verbally, the knowledge that lives in one person\'s head.',
        '',
        'What you can\'t complete is the gap.',
      ].join('\n');
    default:
      return 'Work through the templates at your venue and fill in your actual numbers.';
  }
}

async function sendEmail1({
  first_name,
  email,
  role,
  lead_id,
}: {
  first_name: string;
  email: string;
  role: string;
  lead_id: string;
}) {
  const toolkitUrl = `${process.env.APP_URL}/api/toolkit-open?id=${lead_id}`;
  const unsubUrl   = `${process.env.APP_URL}/api/unsubscribe?id=${lead_id}`;

  const body = [
    `Hi ${first_name},`,
    '',
    "Here's your free Australian Hospitality Compliance & Onboarding Toolkit:",
    '',
    toolkitUrl,
    '',
    "This is a working document — not a guide to read, a tool to fill out.",
    "Duplicate it into your Notion workspace and work through it at your venue.",
    '',
    getRoleHook(role),
    '',
    'More on what to do with what you find in a few days.',
    '',
    'Mitch',
    'Serve By Example',
    'servebyexample.co',
    '',
    '---',
    `You're receiving this because you downloaded the free toolkit at ${process.env.APP_URL}/toolkit.`,
    `Unsubscribe: ${unsubUrl}`,
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:     'Mitch at Serve By Example <mitch@servebyexample.co>',
      reply_to: 'mitch@servebyexample.co',
      to:       email,
      subject:  'Your free compliance and onboarding toolkit',
      text:     body,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }

  await db
    .from('toolkit_leads')
    .update({ email_sequence_started: true })
    .eq('id', lead_id);
}
```

---

## Notes

- Resend sender domain `servebyexample.co` must be verified in the Resend dashboard before Email 1 fires.
- The `robots: 'noindex'` on the toolkit page keeps it out of search results during outreach — remove when/if you want organic discovery.
- The unsubscribe route satisfies the Australian Spam Act 2003 requirement for a working unsubscribe mechanism on every commercial email.
- Phase 5 nurture emails (2–4) must check `consent_marketing = true` and the relevant `email_N_sent_at IS NULL` before sending.
