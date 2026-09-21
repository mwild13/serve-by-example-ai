# Manager Console — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers `app/management/dashboard/page.tsx` and `components/mission-control/*` — the venue-operator/manager-facing product, marketed externally as "Manager Console" (see `docs/MARKETING_SITE.md` §3 for the brand-voice rule; the codebase's internal directory/component naming is `mission-control`, and a few real user-facing surfaces still say "Mission Control" — see Known Gaps below).

## 1. Scope & Entry Points

- Server entry: `app/management/dashboard/page.tsx`
- Client shell: `components/mission-control/ManagerControlCenter.tsx` (2,111 lines as of this doc — re-verify with `wc -l` before citing, this number drifts)
- Loader: `components/mission-control/ManagerControlCenterLoader.tsx`
- Service layer: `lib/management/service.ts` (971 lines as of this doc)
- Roster table: `components/mission-control/StaffDirectoryTable.tsx` — **this is the real component name.** A `StaffRosterPanel.tsx` referenced elsewhere in older docs does not exist in the repo.
- Other panels: `TeamsPerformancePanel.tsx`, `RolesPermissionsMatrix.tsx`, `LeaderboardBoard.tsx`, `CoachingDrawer.tsx`, `WorkspaceHeader.tsx`, `TrialBillingSection.tsx`, `manager-ui.tsx` (shared primitives)

## 2. Data Fetching Pattern

**Not Server Actions, not SWR/React Query.** The real pattern is a hybrid of an unawaited cached server promise, a Suspense boundary, and a client-side fallback fetch:

1. `app/management/dashboard/page.tsx` starts `getCachedManagementSnapshot(user.id)` — **deliberately not awaited**. This is `unstable_cache(getManagementSnapshot, ["management-snapshot"], { revalidate: 20 })`, calling `getManagementSnapshot()` (`lib/management/service.ts`) with the **admin/service-role Supabase client** — it bypasses RLS entirely and scopes rows explicitly in the query (`.eq("manager_user_id", ...)` / `.eq("owner_user_id", ...)`) instead.
2. The unawaited promise is passed into `<ManagerControlCenterLoader snapshotPromise={...} />` inside a `<Suspense>` boundary.
3. `ManagerControlCenterLoader.tsx` calls React 19's `use(snapshotPromise)` to unwrap it, then renders `<ManagerControlCenter initialSnapshot={snapshot} ... />`.
4. `ManagerControlCenter.tsx` seeds local `useState` from `initialSnapshot`. On a cache miss, invalidation, or manual refresh, a client-side fallback (`fetchSnapshot` → `apiFetch("/api/management/snapshot")`) re-derives the identical snapshot by calling the **same** `getManagementSnapshot()` function from inside the API route, this time via `getUserFromRequest(req)`.
5. Panel components (`StaffDirectoryTable.tsx`, `TeamsPerformancePanel.tsx`, `LeaderboardBoard.tsx`, etc.) are purely prop-driven for reads — they receive the already-fetched snapshot's data as props and never fetch it themselves.
6. **Mutations** (invite staff, edit roster, create venue, etc.) go through `/api/management/*` routes. Their JSON response (an updated snapshot fragment) is merged directly into `ManagerControlCenter`'s local state — this deliberately **bypasses** the 20-second cached server fetch, so a mutation's effect is visible immediately without waiting for `revalidate: 20` to expire.

## 3. Access Control / RBAC

**Page-level only, string-based — not Postgres RLS.** The gate lives entirely in `app/management/dashboard/page.tsx`:

- Auth check: `createSupabaseServerClient()` → `supabase.auth.getUser()`; redirects to `/login` if no user.
- Reads `profiles.platform_role`, `tier`, `subscription_status`, `org_id` for the authenticated user.
- `hasManagerConsoleAccess(platformRole)` (`lib/session.ts`) — `true` for `platform_role` in `venue_manager`, `multi_venue_manager`, `duty_manager`.
- `isOwnerLevelRole(platformRole)` (`lib/session.ts`) — `true` for `venue_manager`/`multi_venue_manager` only, **excludes `duty_manager`**. Gates Billing/Settings inside `ManagerControlCenter`.
- A hardcoded `ADMIN_EMAILS` env-var list provides a separate internal-admin escape hatch (`isAdmin`).
- Final gate: `if (!isAdmin && !hasVenueAccess && !hasManagerRole && !hasTrialAccess) redirect("/pricing")`.

**API-route level: `/api/management/*` routes do NOT re-check `platform_role`.** They only check `getUserFromRequest(req)` returns a user (401 otherwise). Real authorization happens inside `lib/management/service.ts`: every mutation (`createStaffMember`, `updateStaffMember`, `createVenue`, etc.) filters its query on `manager_user_id`/`owner_user_id = the caller's own id` (e.g. `.eq("id", staffId).eq("manager_user_id", managerId)`). This means a manager can only touch rows they own **because of row-ownership filtering in application code**, not because of a role check at the API boundary or Postgres RLS. Keep this in mind before adding a new `/api/management/*` route — copy the row-ownership filter pattern from an existing route/service function, don't assume the page-level gate is enough.

**`RolesPermissionsMatrix.tsx` is purely presentational — it does not gate or enforce anything.** It renders a hardcoded `PERMISSIONS` array (e.g. `{ label: "Staff management", manager: true, supervisor: true, staff: false }`) as a static reference table, plus a training-compliance ring per role. **Never mistake this component for an ACL** — it has no connection to the real authorization logic described above.

## 4. State Management for Complex UI (Filtering, Tabs)

- **Tab navigation** reads `useSearchParams()` on mount to restore `?tab=`/`?subtab=`, but *writes* via raw `history.pushState`/`replaceState` rather than `router.push`/`router.replace` — a deliberate workaround to avoid Suspense re-suspension, not the idiomatic Next.js router pattern. Follow this same pattern if adding new tab-driven navigation here; don't "fix" it to use the router without understanding why it was avoided.
- **Everything else is local `useState`, not URL params**: `selectedVenueId` (venue selector), `staffRoleFilter` (`StaffDirectoryTable.tsx`), `leaderboardTab` (`LeaderboardBoard.tsx`). Filtering/sorting is done client-side on arrays already in memory (`venueStaff.filter(...)`, `.sort(...)`).
- **No date-range filter exists anywhere in `components/mission-control/*` today.** If a feature needs one, it's new work, not a hookup to existing state.

## 5. Mission Control Architecture Constraints

**CSS token anti-pattern:** `--bg-dark` (`#1B2A2F`) is a **marketing-site** dark-hero token — NOT a Manager Console token. The console runs on `--bg` (parchment `#f5f2e9`), `--surface`, and `--surface-raised`. Never apply `--bg-dark` to console panels.

**`--mcc-*` token block — resolved.** The parallel 20-token palette (`--mcc-canvas`, `--mcc-forest-900`, `--mcc-good`, `--mcc-bad`, etc.) that used to live in `app/globals.css` has been fully migrated onto `--status-*`/`--green`/`--surface`; zero `--mcc-*` definitions or usages remain anywhere in the codebase. Do not reintroduce a parallel `--mcc-*` namespace — extend `--status-*`/`--green`/`--surface` instead.

**`ManagerControlCenter.tsx` line-count target: under 3,200 lines.** Current state ~2,111 lines (verify with `wc -l` — this drifts) — target comfortably met.

**Component extractions — complete.** `StaffDirectoryTable.tsx`, `TeamsPerformancePanel.tsx`, `RolesPermissionsMatrix.tsx`, and `LeaderboardBoard.tsx` are extracted and imported into `ManagerControlCenter.tsx`. `QUICK_ACTIONS` is still an inline array in `ManagerControlCenter.tsx` — a `QuickActionMenu.tsx` extraction was proposed at one point but never happened / was reverted; it does not exist in the repo.

## Known Gaps / Drift

- **`RolesPermissionsMatrix.tsx` is decorative only** (§3) — the single most important gotcha in this doc. Repeated here deliberately.
- **No date-range filter exists** (§4).
- **API-boundary auth relies on row-ownership filtering in application code**, not a role check at the API layer or RLS (§3) — an architectural fact to know before adding a new route, not something this doc is proposing to fix.
- **"Mission Control" still appears in a few real user-facing strings** even though the product is marketed as "Manager Console": the `<title>` on `/management/dashboard` ("Mission Control | Serve By Example"), its `error.tsx` heading ("Mission Control couldn't load"), two `<option>` labels in `StaffDirectoryTable.tsx` ("Duty Manager — Mission Control" / "... (no Billing)"), and one blended string in `TrialBillingSection.tsx` ("Manager Mission Control"). Recorded as current state, not fixed here.

## Related Docs

- `docs/Phase5-Mission-Control-Execution-Brief.md` — component-extraction history and original acceptance criteria (historical; the extractions it called for are done)
- `docs/ManagmentConsoleUpgradeV5.md` — visual upgrade proposal (historical; note the filename's own spelling — "Managment" — is not a typo to fix, it's the real file)
- `docs/DATABASE_SCHEMA.md` — RLS patterns and the `organizations`/`venue_memberships` dual-model bridge referenced in §2–3 above
