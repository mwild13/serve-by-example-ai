# Serve By Example — Project Rules for Claude

## Security — Read These First

- **There is no `.env` file in this repo, on purpose. NEVER create, read or ask for one**, and never ask for a key in chat. Secrets (OpenAI API key, Supabase secret key, Stripe secret key) live only in Cloudflare. To test the signed-in app, follow `docs/LIVE_APP_TESTING.md` (QA account, keys typed into the owner's own terminal).
- **Supabase's legacy JWT keys (`anon`, `service_role`) are turned off.** Only the new keys work: `sb_publishable_...` in `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `sb_secret_...` in `SUPABASE_SERVICE_ROLE_KEY` (old variable names, new values). Never suggest or ask for a legacy key.
- **NEVER print, log, or suggest hardcoding** any API key, secret, or credential.
- All secrets are managed in Cloudflare Pages environment variables. Reference variable names only (e.g. `process.env.OPENAI_API_KEY`).
- If a config change requires a secret value, ask the user to provide it directly — do not read it from any file.

## What We're Building

Serve By Example is an AI-powered hospitality staff training platform that replaces paper manuals and inconsistent on-floor training with a structured, mobile-first digital learning system.

**The problem:** Bars, restaurants, and hotel groups have no scalable way to train staff consistently. Onboarding is verbal, compliance is untracked, managers have no visibility into who knows what.

**Two audiences:**
- **Staff** — bartenders, floor staff, and hospitality employees — work through a 3-stage mastery path covering Bartending, Sales, and Management modules.
- **Managers** — get the Manager Console: real-time team analytics, compliance tracking, AI coaching, multi-venue roster management, venue-specific inventory linking, and Applicant Testing for hiring.

## Tech Stack

- **Framework:** Next.js (App Router) deployed on Cloudflare Pages via OpenNext
- **Database:** Supabase (Postgres + Row Level Security + Auth)
- **AI:** OpenAI `gpt-6-luna` with reasoning off (scenario evaluation, manager coaching, translation). The model is set once in `CHAT_MODEL_PARAMS` in `lib/openai.ts` — never hardcode a model name in a route. Every prompt that writes text people read includes `AU_WRITING_RULES` from `lib/ai-guard.ts` (Australian English, no em or en dashes), and its output goes through `capText()` or `plainDashes()`
- **Payments:** Stripe, four tiers: `free` → `pro` → `venue_single` (Boutique) → `venue_multi` (Commercial)
- **Language:** TypeScript throughout — no `any` types

## Where to Find Domain-Specific Rules

This file is global rules only. Domain-specific architecture, component maps, and per-surface conventions live in `docs/`:

- Writing rules for every agent, above all no em or en dashes anywhere a person reads (enforced by `lib/no-dashes.test.ts`): `AGENTS.md`

- Marketing site (public routes, geo-blocking, brand voice, component usage): `docs/MARKETING_SITE.md`; page design standard: `docs/Pages-Redesign.md`
- Social media (Instagram content, slide graphics, ads, outreach, the rules to pull the owner up on): `AGENTS_SOCIALS.md`; slide template `docs/socials/slide-template.html`, rendered by `scripts/social-render.mjs`
- Manager Console (data fetching, RBAC, state management): `docs/MANAGER_CONSOLE.md`
- Applicant Testing (Manager Console Hiring tab: tests emailed to job applicants, no account, AI marked): `docs/APPLICANT_TESTING.md`
- Staff App, web and mobile: training loop, Live Guest, the staff desktop standard (section 8): `docs/STAFF_APP.md`
- Mobile app (`/mobile`) routes, data layer, offline queue: `docs/MOBILE_BUILD.md`
- Challenges mini-games, both surfaces: `docs/CHALLENGES.md`
- Database schema, table map, RLS rules: `docs/DATABASE_SCHEMA.md`
- Mastery/ELO scoring engine: `docs/MASTERY_ENGINE.md`
- Funnel numbers and the saved SQL behind them: `docs/FUNNEL_METRICS.md`

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
--text-soft: #525047
--text-muted: #54544c

/* Borders */
--line: #ddd2ba
--line-light: #ece5d5

/* Radius */
--radius-sm: 10px   --radius-md: 14px   --radius-lg: 20px   --radius-xl: 28px

/* Shadows */
--shadow-sm / --shadow-md / --shadow-lg / --shadow-xl
```

**Staff desktop tokens:** `/dashboard` styles read `--sd-*` tokens (also in `app/globals.css`): cream by default, swapped for bottle green by `.sd-dark` (the dark mode), and mapped to the mobile palette by `.sd-on-mobile`. Use them for anything on the staff desktop. **Staff mobile tokens:** `/mobile` styles read `--sm-*` tokens (also in `app/globals.css`): warm paper by default, swapped for bottle green by `.sm-dark` (the dark mode, set on `<html>`). Use them for anything on mobile; the old `--*-mobile` names are gone (`docs/MOBILE_BUILD.md` section 5, `docs/STAFF_APP.md` section 9).

**Fonts:**
- Always reference `var(--font-heading)` and `var(--font-body)`. Never name a font family or a `--font-<family>` variable in a rule or inline style.
- Marketing site, auth pages and the Manager Console (`/management`): Newsreader (headings, weight 600) and Inter (body), loaded in `app/layout.tsx`.
- Staff product (`/dashboard`, `/mobile`): Fraunces and Manrope, loaded in `app/fonts/product-fonts.ts` and applied by the `.sbe-app-type` wrapper in each of those layouts. `/management` does not use that wrapper. The staff desktop (`.sd-shell`) sets headings to Manrope as well, so it is Manrope throughout.
- All font files are self-hosted in `app/fonts/` through `next/font/local`. Do not use `next/font/google`.

**No emojis anywhere.** Use SVG icons or text labels instead.

**No Tailwind utility classes.** Use `style={{}}` inline props with CSS variables, or CSS class names defined in a stylesheet (below).

### Stylesheets

One shared file, then one file per surface. A page loads the shared file and its own surface file, nothing else.

| File | Loaded by | Holds |
|------|-----------|-------|
| `app/globals.css` | `app/layout.tsx` (every page) | Tokens, reset, and every rule used on more than one surface: Navbar, Footer, cookie banner, book-a-call modal, the error and not-found pages |
| `app/styles/marketing.css` | `app/(marketing)/layout.tsx` | The public site |
| `app/styles/staff.css` | `app/dashboard/layout.tsx`, `app/mobile/layout.tsx` | Staff web and mobile app |
| `app/styles/management.css` | `app/management/layout.tsx` | Manager Console |
| `app/styles/auth.css` | the `login`, `onboarding`, `reset-password` and `session-conflict` layouts | Sign-in and onboarding |
| `app/styles/applicant.css` | `app/apply/layout.tsx` | The applicant test (`/apply/[token]`) |

- Public pages live in the `app/(marketing)/` route group. The group adds nothing to the URL: `app/(marketing)/pricing/page.tsx` is `/pricing`.
- A new class goes in the surface file of the one surface that uses it. If a second surface starts using it, move the rule to `app/globals.css`.
- All tokens (`:root`) stay in `app/globals.css`.
- The shared file always loads first. A rule in it cannot override a surface rule of the same specificity, so do not rely on source order across files.
- `npm run lint:css` and `npm run lint:css:unused` read all six files.

## Coding Conventions

- TypeScript throughout — no `any` unless truly unavoidable
- **No Tailwind.** All styling via CSS classes in the stylesheets above (tokens in `app/globals.css`) or inline `style={{}}` with CSS variables
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

The one exception is `middleware.ts`, which runs on every page request: it uses `supabase.auth.getClaims()`, which verifies the token's signature locally against the project's ES256 keys instead of calling Supabase Auth each time. Don't copy that into server components or API routes.

## App Pages (Authenticated / Utility)

Cross-cutting auth/utility routes not owned by a single domain doc:

| Route | Purpose |
|-------|---------|
| `/login` | Auth login |
| `/auth/callback` | Supabase OAuth callback |
| `/onboarding` | New user onboarding flow |
| `/session-conflict` | Retired page; forwards to `/login?signedout=elsewhere`. One device at a time: the newest sign-in wins, and `middleware.ts` signs an older device out to `/login` with a line saying why |
| `/reset-password` | Password reset |
| `/geo-block` | Geo-restricted access page (see `docs/MARKETING_SITE.md` for a routing nuance — the geo-block middleware's actual redirect target is `/restricted`, not this page) |
| `/restricted` | General access-denied page |
| `/notifications/unsubscribe` | Signed unsubscribe link from the digest and reminder emails; no sign-in, open from any country |
| `/apply/[token]` | Applicant test from a manager's invite email; no sign-in, open from any country (`docs/APPLICANT_TESTING.md`) |

Domain-specific app pages (`/dashboard`, `/management/dashboard`, etc.) are documented in `docs/STAFF_APP.md` and `docs/MANAGER_CONSOLE.md`.

# conversion-ui
When the user types `/conversion-ui`, invoke the Skill tool with `skill: "conversion-ui"` before doing anything else.
