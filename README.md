# Serve By Example

Hospitality staff training for Australian bars, restaurants and hotels. Staff learn on their phone or at a desk; managers see who knows what.

## What it does

- **Staff** work through 40 modules across bartending, service and sales, and safety and compliance. Each module has short Learn cards, then a quiz.
- **Practice:** mixed drills, a pre-shift drill with a shift streak, Live Guest (an AI guest you talk to), Saturday Rush (a timed shift game) and ten Challenges.
- **Reference:** a cocktail library and a 101-card Knowledge Base.
- **Managers** get the Manager Console: team progress, compliance, AI coaching, venue content and multi-venue rosters.

Staff use two surfaces:
- **`/mobile`:** the phone app.
- **`/dashboard`:** the desktop.

Phones are sent to `/mobile` automatically.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) on Cloudflare Pages via OpenNext |
| Database | Supabase: Postgres, Row Level Security, Auth |
| AI | OpenAI, model set once in `CHAT_MODEL_PARAMS` (`lib/openai.ts`) |
| Payments | Stripe: `free`, `pro`, `venue_single` (Boutique), `venue_multi` (Commercial) |
| Language | TypeScript throughout |

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Environment variables live in Cloudflare Pages. Ask the owner for local values; never commit them.

## Checks

CI (`.github/workflows/ci.yml`) runs these on every push:

```bash
npm run lint && npm run lint:css && npm run typecheck && npm test && npm run knip
```

## Releasing

- **Preview:** work goes to a `preview/<name>` branch first. Cloudflare builds a preview of it and CI runs.
- **Production:** once CI is green, the same commit is pushed to `main`, which deploys `servebyexample.co`.
- **No pull requests.**

## Where things are

| Path | What |
|------|------|
| `app/(marketing)/` | Public site (the group adds nothing to the URL) |
| `app/dashboard/` | Staff desktop |
| `app/mobile/` | Staff phone app |
| `app/management/` | Manager Console page |
| `app/api/` | API routes |
| `components/mission-control/` | Manager Console components |
| `components/quiz/`, `live-guest/`, `rush/`, `challenges/`, `team/` | Staff features shared by desktop and mobile |
| `lib/` | Mastery engine, sessions and tiers, teaching content, AI helpers |
| `app/globals.css`, `app/styles/` | Tokens and one stylesheet per surface |
| `supabase/migrations/` | Schema migrations, in date order |
| `docs/` | Per-area references (below) |

## Read first

- [CLAUDE.md](CLAUDE.md): security, stack, design system, conventions.
- [AGENTS.md](AGENTS.md): writing rules for every AI agent (no em or en dashes).
- [docs/STAFF_APP.md](docs/STAFF_APP.md), [docs/MOBILE_BUILD.md](docs/MOBILE_BUILD.md), [docs/MANAGER_CONSOLE.md](docs/MANAGER_CONSOLE.md), [docs/MARKETING_SITE.md](docs/MARKETING_SITE.md), [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md), [docs/MASTERY_ENGINE.md](docs/MASTERY_ENGINE.md).
- [To_do_list.md](To_do_list.md): open work.
