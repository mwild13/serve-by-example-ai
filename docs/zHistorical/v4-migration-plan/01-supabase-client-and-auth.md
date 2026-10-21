# 01 — Supabase Client & Auth

## Primary Goal & UI Targets

Every one of the 13 `app/mobile/_components/` screens needs a signed-in user before it can read or write real data. This file covers the cross-cutting auth foundation — the one piece every other file (`02`–`10`) assumes already exists. "Done" = an `app/mobile/layout.tsx` (or equivalent gate) that resolves the user server-side exactly like `app/dashboard/page.tsx` does, threads a bearer token down to client components, and stamps the one-device session cookie so mobile writes don't get rejected.

## Diamond Extraction List

**`lib/supabase-server.ts`** (164 lines):
- `createSupabaseServerClient()` — async, reads cookies via `next/headers`, derives cookie domain dynamically (`resolveCookieDomain()`: `.servebyexample.co` in prod, `undefined` for `localhost` / `*.pages.dev` / `127.*`).
- `getUserFromRequest(req: Request)` — the pattern every API route uses. Tries `Authorization: Bearer <jwt>` first (creates a fresh client with the token in `global.headers` so `auth.uid()` resolves correctly for RLS on Cloudflare Workers — this exact gotcha is called out in the function's own comments as "the root cause of saves failing on CF"), falls back to cookie-based `createSupabaseServerClient().auth.getUser()`. Never throws — returns `{ user: null, supabase }` on failure so callers can 401 cleanly.
- `createSupabaseMiddlewareClient(request, response)` — sync variant, same domain logic, used in `middleware.ts`.

**`lib/supabase.ts`** — `createSupabaseBrowserClient()`: `createBrowserClient` from `@supabase/ssr`, mirrors the dynamic cookie-domain logic client-side via `window.location.hostname`.

**`lib/supabase-admin.ts`** — `createSupabaseAdminClient()`: plain `createClient` with `SUPABASE_SERVICE_ROLE_KEY`, `persistSession: false`, `autoRefreshToken: false`. Bypasses RLS — this is what nearly every API route uses once `getUserFromRequest` has confirmed identity.

**`app/dashboard/page.tsx`** auth-gate sequence (the reference pattern to replicate for `/mobile`):
1. `createSupabaseServerClient()` → `supabase.auth.getUser()` → `redirect("/login")` if no user.
2. Stripe checkout-success verification (writes `profiles.tier` immediately, doesn't wait on webhook).
3. Fetch `profiles` row → `redirect("/onboarding")` if `!onboarding_completed`.
4. Tier resolution chain: lapsed-subscription downgrade → trial-status sync (`getTrialStatus`) → sponsored venue-membership check (`organization_members`, paused if the manager's org trial expired).
5. Renders the shell with `initialToken={session?.access_token ?? ""}` passed as a prop — client components then use this token to auth their own `fetch()` calls without a second cookie round-trip.

**`lib/session.ts`**:
- `resolveAccess()` — own `profiles.tier` → org trial → sponsored membership (`organization_members`, active/invited + `seat_counted=true`) → falls back to `free`. Returns `{ tier, allowedModules, isSponsored }`. (Also harvested by `03` for module locking.)
- `generateSessionId()`, `stampSession()`, `validateSession()` — one-device enforcement.

**`app/api/session/stamp/route.ts`** — `POST` (auth-gated) calls `generateSessionId()` + `stampSession()`, sets an `HttpOnly`, `SameSite=Lax`, 1-year `sbe_session_id` cookie. `DELETE` clears it on sign-out. This cookie is read back by `/api/training/save` (see `02`/`09`) — a mobile write without it will 401/409.

## Architecture & Cleanup Plan

- Build `app/mobile/layout.tsx` as a server component running the same 5-step gate `app/dashboard/page.tsx` runs (steps 2–4 can likely be a shared extracted helper rather than copy-pasted — consider factoring `app/dashboard/page.tsx`'s tier-resolution block into a reusable function during this work, since duplicating it verbatim across two entry points is exactly the kind of drift CLAUDE.md warns against elsewhere).
- Thread `initialToken` down from the layout/page into whichever client component owns mobile state, mirroring `DashboardShell`'s prop.
- Call `/api/session/stamp` at mobile login time (or immediately after the layout confirms a user), same as the desktop flow does — otherwise every mobile `/api/training/save` call will hit the session-displacement 409/401 path documented in `02`.
- Client components under `app/mobile/_components/` use `createSupabaseBrowserClient()` from `lib/supabase.ts` for anything that must run client-side; never fetch from the DB directly in a client component — always go through an API route (existing project rule, restated here since it applies to every mobile screen equally).
- Do not build a parallel admin/service-role path for mobile — reuse `lib/supabase-admin.ts` inside API routes exactly as V3 does. There is nothing mobile-specific to invent here.

## Step-by-Step Task Checklist

1. Factor `app/dashboard/page.tsx`'s auth+tier-resolution sequence into a shared server-side helper (or accept light duplication if factoring is out of scope for this pass — note the decision either way).
2. Create `app/mobile/layout.tsx`, call the helper (or replicate the 5 steps), `redirect("/login")` on no user, `redirect("/onboarding")` on incomplete onboarding.
3. Pass `initialToken` (and `tier`/`allowedModules` from `resolveAccess()`) into the mobile client tree.
4. Wire a call to `POST /api/session/stamp` on mobile login/session start.
5. Confirm every mobile client component that needs Supabase reads uses the browser client from `lib/supabase.ts`, and every write goes through an API route using `getUserFromRequest`.
6. Manually verify: log in, load `/mobile/home`, confirm no redirect loop, confirm a subsequent `/api/training/save` call (once wired per file `02`) succeeds rather than 409ing.

## Implementation Notes (executed 2026-08-17)

Items 1–3 done as planned, with two corrections to how items 3–4 actually needed to be built — both closing real gaps, not just style choices:

- **Item 1 — factored, not duplicated.** Added `resolveTierAccess()` to `lib/session.ts`: the exact tier-resolution chain from `app/dashboard/page.tsx` (own tier → lapsed-subscription downgrade → org trial sync → sponsored venue-membership fallback, including the paused-sponsor-trial case) extracted verbatim, not reimplemented. `app/dashboard/page.tsx` now calls it too — this was a behavior-preserving refactor, not a rewrite (kept `checkoutAdmin` scoped to the Stripe-verification block, everything else identical). Deliberately kept separate from the pre-existing `resolveAccess()` — that function is the general-purpose API-route resolver and doesn't model the lapsed-subscription or paused-sponsor cases; folding the two together would have been a bigger, riskier change than this file's scope justified.
- **Item 3 — context provider, not prop-drilling.** V4's mobile surface is 12 independent routes (`app/mobile/*/page.tsx`), not one shell component like `DashboardShell` — there's no single place to receive an `initialToken` prop. Built `app/mobile/_lib/mobile-session-context.tsx` (`MobileSessionProvider` + `useMobileSession()` hook) instead: `app/mobile/layout.tsx` seeds it once from `resolveTierAccess()`, every screen reads `token`/`tier`/`allowedModules`/`displayName`/`hasVenueMembership`/`venueMembershipPaused` via the hook. This is a new pattern for the codebase (V3 has no React Context usage anywhere) — flagging it explicitly rather than letting it pass silently, since it's a real architectural divergence from the rest of the app, chosen because 12-way prop drilling would have been worse. Files `02`–`10` should consume state through this hook rather than inventing a second mobile context.
- **Item 4 — turned out to be a non-issue, root-caused instead.** `POST /api/session/stamp` is already called globally at sign-in (`app/login/page.tsx`, `app/auth/page.tsx`) — there is no separate "mobile login," a user reaching `/mobile/*` already went through the same `/login` flow that stamps the session cookie. Nothing to wire here. The **real** gap this surfaced: `middleware.ts`'s session-displacement check (the actual enforcement of "one device per purchase" — redirects to `/session-conflict` on a stamp mismatch) was scoped to `isDashboard || isManagementDashboard` only. `/mobile` was completely unguarded — a displaced session could browse every mobile screen with zero check. Fixed by adding `isMobile` to both the auth-redirect gate and the session-displacement gate in `middleware.ts`. This was a real security gap in the existing V3-era middleware, not something introduced by V4 — it just had no surface to expose it until `/mobile` needed the same protection `/dashboard` already had.
- Item 5 confirmed for what exists today: no mobile client component reads Supabase directly (all 13 screens are still static content, nothing calls the DB yet — that's files `02`–`09`'s job). Nothing to fix, just confirmed clean.
- Item 6 (manual redirect-loop verification) not run interactively this pass — `tsc --noEmit` and `eslint --max-warnings=0` both pass clean across the touched files, but an actual signed-in browser check of `/mobile/home` is still open before calling file `01` fully closed.
