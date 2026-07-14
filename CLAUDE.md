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
- **Managers** — get Mission Control: real-time team analytics, compliance tracking, AI coaching, multi-venue roster management, and venue-specific inventory linking.

## Tech Stack

- **Framework:** Next.js (App Router) deployed on Cloudflare Pages via OpenNext
- **Database:** Supabase (Postgres + Row Level Security + Auth)
- **AI:** OpenAI GPT-4o-mini (scenario evaluation, manager coaching, translation)
- **Payments:** Stripe — 3 tiers: `free` → `pro` → `venue_single` → `venue_multi`
- **Language:** TypeScript throughout — no `any` types

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

## Key Architecture

```
app/                            Next.js App Router pages and API routes
components/
  DashboardShell.tsx            Main authenticated staff UI (client component)
  ErrorLogger.tsx               Client-side error boundary and logger
  HeroSection.tsx               Homepage hero section
  HeroPlayableSandbox.tsx       Interactive sandbox embedded in hero
  LanguageRuntimeTranslator.tsx Runtime language translation wrapper
  MenuDrillGenerator.tsx        Menu drill generation UI
  Navbar.tsx                    Marketing site nav with mega-menu dropdowns
  Footer.tsx                    5-column marketing footer
  ProductTour.tsx               Interactive product tour component
  SectionSubNav.tsx             Reusable section sub-navigation
  StickyDemoCTA.tsx             Sticky demo call-to-action banner
  learning-engine/              All staff-facing training UI
    PreShiftHome.tsx            Dashboard home tab
    DynamicModuleNav.tsx        Module browser and stage routing
    ModuleVerify.tsx            Final verification quiz per module
    RapidFirePage.tsx           Rapid-fire quiz wrapper
    RapidFireQuiz.tsx           Quiz engine (streak-based, keyboard shortcuts)
    ArenaPage.tsx               AI Arena (GPT-4o-mini roleplay evaluation)
    ChallengesPage.tsx          Interactive mini-games (5 tap-based formats)
    DiagnosticFlow.tsx          Onboarding diagnostic
    DashboardTrainer.tsx        In-dashboard training prompt component
    ProgressOverview.tsx        Staff progress view
    BadgeStreakSection.tsx       Achievement display
    BadgeProgressRing.tsx       Badge progress ring animation
    BadgesView.tsx              Full badges gallery view
    RecommenderCard.tsx         Module recommendation widget
    MobileDashboardV3.tsx       Mobile-specific dashboard layout
    MobileLearnHub.tsx          Mobile learning hub wrapper
  mission-control/              Manager-facing tools
    ManagerControlCenter.tsx    Main manager dashboard (~3,965 lines)
    StaffRosterPanel.tsx        Extracted staff roster panel component
    CoachingDrawer.tsx          AI coaching slide-out drawer
    WorkspaceHeader.tsx         Manager workspace top header
    manager-ui.tsx              Shared manager UI primitives
  knowledge-base/
    CocktailLibrary.tsx         38-cocktail reference library (lazy-loaded)
    KnowledgeBase.tsx           101 Knowledge Base (lazy-loaded)
  toolkit/
    SopGeneratorPreview.tsx     SOP generator preview panel
    SopPreviewDocument.tsx      SOP formatted document preview
  ui/                           Shared primitives
    BrowserMockup.tsx           Browser chrome mockup for demos
    CompareMatrix.tsx           Feature comparison matrix
    DashboardMockup.tsx         Dashboard screenshot mockup
    LanguageSwitcher.tsx        Language selection UI
    ROICalculator.tsx           Interactive ROI calculator
    SectionHeading.tsx          Reusable section heading component
    SessionRefresher.tsx        Client-side session keepalive (polls every 5 min)
    SignOutButton.tsx            Auth sign-out button
    Skeletons.tsx               Loading skeleton components
    WaitlistSection.tsx         Waitlist signup section

lib/
  mastery.ts                    ELO scoring, streak tracking, spaced repetition, mastery flags
  session.ts                    Session displacement + tier access control
  verify-questions.ts           Hardcoded True/False question bank (all 40 modules)
  modules.ts                    Module type definitions and metadata
  cocktails.ts                  38 curated cocktail definitions
  knowledge-base.ts             101 Knowledge Base content
  badges.ts                     Badge definitions and award logic
  diagnostic-engine.ts          Onboarding diagnostic logic
  module-navigator.ts           Module progression helpers
  daily-focus.ts                Daily focus/recommendation logic
  rate-limit.ts                 Rate limiting for public API routes
  geo-config.ts                 Geo-blocking configuration
  supabase.ts                   Browser Supabase client factory
  supabase-server.ts            Server Supabase client + getUserFromRequest helper
  supabase-admin.ts             Admin Supabase client (bypasses RLS)
  management/
    service.ts                  Venue and staff management service layer (~896 lines)
    types.ts                    Manager-specific types
    seed.ts                     Management data seed helpers

supabase/migrations/            SQL schema migration files (chronological)
```

## Coding Conventions

- TypeScript throughout — no `any` unless truly unavoidable
- **No Tailwind.** All styling via CSS custom properties in `app/globals.css` or inline `style={{}}` with CSS variables
- Server components fetch data and pass as props; client components handle interaction and state
- Never fetch from the DB directly inside a client component — call an API route instead
- API routes validate input at the boundary before any DB access
- Rate limiting applied to all public-facing API routes (`lib/rate-limit.ts`)

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

## Learning Engine Structure

The staff training platform has a **3-stage mastery path** plus AI-powered extras:

| Nav ID | Label | Component | Description |
|--------|-------|-----------|-------------|
| `home` | Home | `PreShiftHome.tsx` | Daily dashboard with recommendations |
| `module` | Modules | `DynamicModuleNav.tsx` + `ModuleVerify.tsx` | 40 modules across Bartending, Sales, Management |
| `rapid-fire` | — | `RapidFirePage.tsx` | Internal sub-nav from Modules; rapid quiz mode |
| `stage4` | Scenario Training | `DiagnosticFlow.tsx` | Written scenario practice |
| `scenarios` | AI Arena | `ArenaPage.tsx` | GPT-4o-mini live roleplay evaluation |
| `challenges` | Challenges | `ChallengesPage.tsx` | 5 tap-based interactive mini-games |
| `cocktails` | Cocktail Library | `CocktailLibrary.tsx` | 38-cocktail reference (lazy-loaded) |
| `knowledge` | 101 Knowledge Base | `KnowledgeBase.tsx` | Quick-reference knowledge base (lazy-loaded) |
| `progress` | Me / How I'm improving | `ProgressOverview.tsx` | Personal stats and mastery overview |
| `settings` | Settings | `StaffSettingsPanel` | Profile, security, venue join |

**Premium gating** — `PREMIUM_NAV_ITEMS = ["module", "stage4", "scenarios", "cocktails", "knowledge"]`. Free users see these as locked. `challenges`, `home`, `progress`, and `settings` are always available.

**Tier access (lib/session.ts):**
- `free` — no module access
- `pro` — all 40 modules
- `venue_single` — all 40 modules, up to 25 staff
- `venue_multi` — all 40 modules, up to 125 staff (5 venues × 25)
- Staff invited via venue code (`venue_memberships` table) receive sponsored access equivalent to `pro`

## Dashboard Shell

`components/DashboardShell.tsx` is the main authenticated staff UI — a client component that manages `NavItem` state and renders the correct view. The mobile bottom nav bar shows: Home, Modules, Scenarios, AI Arena, Me.

To add a new learning view:
1. Add a string literal to `type NavItem`
2. Add an entry to `NAV_ITEMS`
3. Import the component (lazy-load heavy ones with `lazy(() => import(...))`)
4. Add a render case in the conditional chain
5. Add to `PREMIUM_NAV_ITEMS` if it should be gated

## API Routes

```
app/api/
  arena/evaluate/               GPT-4o-mini scenario evaluation
  billing/
    checkout/                   Stripe checkout session creation
    link-pending/               Link a pending purchase to a signed-in user
    webhook/                    Stripe webhook handler (billing state machine)
  book-call/                    Book a sales call lead capture
  coach/                        AI coaching messages
  contact/                      Contact form submission
  demo/
    evaluate/                   Public demo evaluation (no auth)
    generate-drills/            Public menu drill generation (no auth)
  evaluate/                     General scenario evaluation
  geo/                          Geo-block check endpoint
  management/
    coach/                      AI coaching for managers
    inventory/                  Venue inventory management
    join-venue/                 Staff join a venue via code
    memberships/                Venue membership CRUD
    snapshot/                   Team performance snapshot
    staff/                      Staff management (list, remove)
    test-invite-email/          Test invite email dispatch
    training-programs/          Training program management
    venues/                     Venue CRUD
  profile/update-name/          Profile name update
  roi/
    email/                      Send ROI report via email
  session/stamp/                Session displacement stamp
  toolkit-capture/              SOP toolkit lead capture
  toolkit-open/                 SOP toolkit open tracking
  training/
    save/                       Save training progress
    progress/                   Fetch training progress
    modules/[moduleId]/         Module data
    modules/[moduleId]/scenarios/ Module scenarios
    diagnostic/start/           Start onboarding diagnostic
    diagnostic/submit/          Submit diagnostic answer
  translate/                    Language translation
  unsubscribe/                  Email unsubscribe handler
  verify-session/               Stripe checkout session verification
```

## Key File Locations

| What | Where |
|------|-------|
| Root CSS + design tokens | `app/globals.css` |
| Root layout + font config | `app/layout.tsx` |
| Dashboard entry point (server) | `app/dashboard/page.tsx` |
| Main staff shell (client) | `components/DashboardShell.tsx` |
| Manager dashboard (server) | `app/management/dashboard/page.tsx` |
| All learning UI | `components/learning-engine/` |
| Shared UI primitives | `components/ui/` |
| Manager console | `components/mission-control/` |
| Knowledge base | `components/knowledge-base/` |
| SOP toolkit components | `components/toolkit/` |
| Mastery engine | `lib/mastery.ts` |
| Tier + session logic | `lib/session.ts` |
| Verify question bank | `lib/verify-questions.ts` |
| All training API routes | `app/api/training/` |
| SQL migrations | `supabase/migrations/` |

## App Pages (Authenticated / Utility)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Staff learning dashboard |
| `/dashboard/badges` | Full badge gallery |
| `/management/dashboard` | Manager Mission Control |
| `/management/login` | Manager-specific login |
| `/login` | Auth login |
| `/auth/callback` | Supabase OAuth callback |
| `/onboarding` | New user onboarding flow |
| `/payment-success` | Post-Stripe checkout confirmation |
| `/session-conflict` | One-device enforcement conflict page |
| `/reset-password` | Password reset |
| `/geo-block` | Geo-restricted access page |
| `/restricted` | General access-denied page |

## Marketing Pages

Public-facing marketing site lives in `app/` alongside the app routes:

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/platform` | Platform overview |
| `/platform/challenges` | Interactive Challenges marketing page |
| `/solutions` | Solutions by venue type |
| `/solutions/fine-dining` | Fine dining vertical |
| `/solutions/franchise-systems` | Franchise systems vertical |
| `/solutions/hotel-fb` | Hotel F&B vertical |
| `/solutions/multi-venue` | Multi-venue groups vertical |
| `/solutions/pub-groups` | Pub groups vertical |
| `/for-venues` | Venue operator landing |
| `/pricing` | Pricing (Stripe checkout) |
| `/demo` | Public AI demo |
| `/demo/complaint-master` | Complaint handling demo |
| `/how-it-works` | How It Works |
| `/roi` | ROI Calculator |
| `/resources` | Resources hub |
| `/resources/sop-toolkit` | Free SOP toolkit lead magnet |
| `/toolkit` | SOP toolkit landing page |
| `/toolkit/success` | Post-toolkit-download success page |
| `/roadmap` | Public product roadmap |
| `/security` | Security & Safety |
| `/about` | About |
| `/contact` | Contact |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/cookies` | Cookie Policy |

Shared marketing layout components: `components/Navbar.tsx` (mega-menu dropdowns) and `components/Footer.tsx` (5-column footer).

## Terminology Reference

### Database vs. Domain Language

The database schema is logically correct — no renames needed. This table documents how user-facing terms map to database reality.

| Domain Concept | Database Table | Database Column / Value | Notes |
|----------------|----------------|-------------------------|-------|
| Module | `modules` | `id` (1–40) | Training module identifier |
| Scenario (generic) | `scenarios` | `*` | Any question/exercise in the scenarios table |
| Quiz (L1) | `scenarios` | `scenario_type = 'quiz'` | Rapid-fire true/false; used in rapid-fire mode |
| Descriptor (L2) | `scenarios` | `scenario_type = 'descriptor_l2'` | Pick 2 of 5; used in Stage 4 |
| Descriptor (L3) | `scenarios` | `scenario_type = 'descriptor_l3'` | Pick 3 of 5; used in Stage 4 |
| AI Scenario (Arena) | `scenarios` | `scenario_type = 'roleplay'` | AI-evaluated roleplay; internal code uses `'ai_roleplay'` for clarity |
| Challenge | `user_challenges` | `*` | Tap-based mini-game; entirely separate from the scenarios table |

**Code reference:** `lib/domain-types.ts` contains `DbScenarioType`, `DomainScenarioType`, `mapDbToUi()`, `mapUiToDb()`, and `DomainNavigation` type definitions.
