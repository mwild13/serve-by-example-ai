# Serve By Example

AI-powered hospitality staff training platform — mobile-first, structured, and built for the floor.

## What It Does

Staff work through a self-paced 3-stage mastery path (Learn → Verify → Perform) covering Bartending, Sales, and Management across 40 modules. Managers get Mission Control: real-time team analytics, compliance tracking, AI coaching, and multi-venue roster management. Everything runs on their phone.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), deployed on Cloudflare Pages via OpenNext |
| Database | Supabase — Postgres + Row Level Security + Auth |
| AI | OpenAI GPT-4o-mini — scenario evaluation, coaching, translation |
| Payments | Stripe — free / pro / venue_single / venue_multi tiers |
| Language | TypeScript throughout — no `any` types |

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in credentials (see Cloudflare Pages env vars)
npm run dev                  # http://localhost:3000
```

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

All secrets are managed in Cloudflare Pages environment variables. Never hardcode credentials.

## Branch Strategy

```
dev    →  Cloudflare Pages preview  →  https://dev.serve-by-example-ai.pages.dev
main   →  Production                →  https://servebyexample.co
```

Fast-forward merges from `dev` into `main` only. Never commit directly to `main`.

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages and API routes |
| `components/learning-engine/` | All staff-facing training UI (40 modules, quizzes, AI Arena, Challenges) |
| `components/mission-control/` | Manager Mission Control dashboard and extracted sub-panels |
| `components/knowledge-base/` | Cocktail Library and 101 Knowledge Base (lazy-loaded) |
| `components/toolkit/` | SOP generator preview and document components |
| `components/ui/` | Shared UI primitives (skeletons, mockups, ROI calculator, session keepalive) |
| `lib/` | Mastery engine, session logic, tier access, daily focus, AI helpers |
| `lib/management/` | Venue and staff management service layer |
| `supabase/migrations/` | SQL schema migration files (chronological) |

## Further Reading

- [CLAUDE.md](CLAUDE.md) — Full architecture, coding conventions, auth patterns, design system
- [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) — Product overview for stakeholders and venue operators
- [docs/MOBILE_VIEW.md](docs/MOBILE_VIEW.md) — Mobile UX architecture and component guide
- [docs/HOMEPAGE.md](docs/HOMEPAGE.md) — Homepage section inventory, hero, modal, and conversion flows
- [docs/v3-architecture.md](docs/v3-architecture.md) — V3 learning pipeline architecture
