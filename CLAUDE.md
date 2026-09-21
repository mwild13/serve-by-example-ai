# Serve By Example — Project Rules for Claude

## Security — Read These First

- **NEVER read `.env.local` or any `.env*` file.** These contain live production secrets (OpenAI API key, Supabase service role key, Stripe secret key).
- **NEVER print, log, or suggest hardcoding** any API key, secret, or credential.
- All secrets are managed in Cloudflare Pages environment variables. Reference variable names only (e.g. `process.env.OPENAI_API_KEY`).
- If a config change requires a secret value, ask the user to provide it directly — do not read it from any file.

## What We're Building

Serve By Example is an AI-powered hospitality staff training platform that replaces paper manuals and inconsistent on-floor training with a structured, mobile-first digital learning system.

**The problem:** Bars, restaurants, and hotel groups have no scalable way to train staff consistently. Onboarding is verbal, compliance is untracked, managers have no visibility into who knows what.

**Two audiences:**
- **Staff** — bartenders, floor staff, and hospitality employees — work through a 3-stage mastery path covering Bartending, Sales, and Management modules.
- **Managers** — get the Manager Console: real-time team analytics, compliance tracking, AI coaching, multi-venue roster management, and venue-specific inventory linking.

## Tech Stack

- **Framework:** Next.js (App Router) deployed on Cloudflare Pages via OpenNext
- **Database:** Supabase (Postgres + Row Level Security + Auth)
- **AI:** OpenAI GPT-4o-mini (scenario evaluation, manager coaching, translation)
- **Payments:** Stripe — 3 tiers: `free` → `pro` → `venue_single` → `venue_multi`
- **Language:** TypeScript throughout — no `any` types

## Where to Find Domain-Specific Rules

This file is global rules only. Domain-specific architecture, component maps, and per-surface conventions live in `docs/`:

- Marketing site (public routes, geo-blocking, brand voice, component usage): `docs/MARKETING_SITE.md`
- Manager Console (data fetching, RBAC, state management): `docs/MANAGER_CONSOLE.md`
- Staff App — web & mobile training loop, AI Arena, PWA: `docs/STAFF_APP.md`
- Database schema, table map, RLS rules: `docs/DATABASE_SCHEMA.md`
- Mastery/ELO scoring engine: `docs/MASTERY_ENGINE.md`

## Design System — Use These Exactly

All styling uses CSS custom properties defined in `app/globals.css`. **Do not invent hex values — always reference variables.**

```css
/* Backgrounds */
--bg: #f5f2e9           /* warm parchment — default page background */
--bg-alt: #eeebe1
--surface: #fffef9      /* card/panel background */
--surface-raised: #fff

/* Brand colours */
--green: #1f4e37        /* primary CTA colour */
--green-deep: #0f2d1d
--green-mid: #2a6848
--green-light: #e4efea
--gold: #a9812a
--gold-warm: #c49a2f
--gold-light: #f7ecd0

/* Text */
--text: #172f22         /* primary text */
--text-soft: #496155
--text-muted: #7a9185

/* Borders */
--line: #ddd2ba
--line-light: #ece5d5

/* Radius */
--radius-sm: 10px   --radius-md: 14px   --radius-lg: 20px   --radius-xl: 28px

/* Shadows */
--shadow-sm / --shadow-md / --shadow-lg / --shadow-xl
```

**Fonts:**
- Headings: `var(--font-fraunces)` — serif, elegant
- Body: `var(--font-manrope)` — clean sans-serif

**No emojis anywhere.** Use SVG icons or text labels instead.

**No Tailwind utility classes.** Use `style={{}}` inline props with CSS variables, or CSS class names defined in `app/globals.css`.

## Coding Conventions

- TypeScript throughout — no `any` unless truly unavoidable
- **No Tailwind.** All styling via CSS custom properties in `app/globals.css` or inline `style={{}}` with CSS variables
- Server components fetch data and pass as props; client components handle interaction and state
- Never fetch from the DB directly inside a client component — call an API route instead
- API routes validate input at the boundary before any DB access
- Rate limiting applied to all public-facing API routes (`lib/rate-limit.ts`)
- Custom lint rule: `sbe-design/no-hardcoded-hex` (`eslint.config.mjs`) — enforces the Design System rule above as a lint error, not just a style guideline
- Git commit style: Conventional Commits prefixes — `feat:`, `fix:`, `style:`, `test:`, `chore:`, `debug:` — followed by a short imperative summary

## Auth Pattern

```ts
// Server components and API routes:
import { createSupabaseServerClient } from "@/lib/supabase-server";
const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser(); // always getUser(), not getSession()

// Client components:
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Admin operations (bypass RLS):
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
```

API routes must call `getUserFromRequest(req)` from `@/lib/supabase-server` and return 401 immediately if no user.

## App Pages (Authenticated / Utility)

Cross-cutting auth/utility routes not owned by a single domain doc:

| Route | Purpose |
|-------|---------|
| `/login` | Auth login |
| `/auth/callback` | Supabase OAuth callback |
| `/onboarding` | New user onboarding flow |
| `/payment-success` | Post-Stripe checkout confirmation |
| `/session-conflict` | One-device enforcement conflict page |
| `/reset-password` | Password reset |
| `/geo-block` | Geo-restricted access page (see `docs/MARKETING_SITE.md` for a routing nuance — the geo-block middleware's actual redirect target is `/restricted`, not this page) |
| `/restricted` | General access-denied page |

Domain-specific app pages (`/dashboard`, `/management/dashboard`, etc.) are documented in `docs/STAFF_APP.md` and `docs/MANAGER_CONSOLE.md`.

# conversion-ui
When the user types `/conversion-ui`, invoke the Skill tool with `skill: "conversion-ui"` before doing anything else.
