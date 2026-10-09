# Manager Console — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers `app/management/dashboard/page.tsx` and `components/mission-control/*` — the venue-operator/manager-facing product, marketed externally as "Manager Console" (see `docs/MARKETING_SITE.md` §3 for the brand-voice rule; the codebase's internal directory/component naming is `mission-control`, and a few real user-facing surfaces still say "Mission Control" — see Known Gaps below).

## 1. Scope & Entry Points

- Server entry: `app/management/dashboard/page.tsx`
- Client shell: `components/mission-control/ManagerControlCenter.tsx` (1,717 lines on 2026-10-09 — re-verify with `wc -l` before citing, this number drifts)
- Sidebar: `components/mission-control/ConsoleSidebar.tsx` (navigation list, collapse to an icon rail)
- Shared page parts: `components/mission-control/console-ui.tsx` (`PageHead`, `StatRow`, `Panel`, `StatusText`, `BarCell`, `ExportButton`, `downloadCsv`). Every tab other than Overview is built from these (see §6)
- Overview tab: `OverviewPanel.tsx`, with `OverviewNoticeReel.tsx`, `OverviewKpiStrip.tsx`, `TeamActivityCard.tsx`, `NeedsAttentionCard.tsx`, `SkillGapsSummaryCard.tsx` and `RoleQualificationCard.tsx`. Notice sentences are built in `lib/management/notices.ts` (see §6)
- Loader: `components/mission-control/ManagerControlCenterLoader.tsx`
- Service layer: `lib/management/service.ts` (971 lines as of this doc)
- Roster table: `components/mission-control/StaffDirectoryTable.tsx` — **this is the real component name.** A `StaffRosterPanel.tsx` referenced elsewhere in older docs does not exist in the repo.
- Other panels in `components/mission-control/`: `TeamsPerformancePanel.tsx`, `AnalyticsPanel.tsx`, `AICoachPanel.tsx`, `ReportsPanel.tsx`, `PredictivePanel.tsx` (Training Gaps), `GroupAnalyticsPanel.tsx` (All venues), `LeaderboardBoard.tsx`, `SettingsPanel.tsx`, `TrialBillingSection.tsx`, `manager-ui.tsx` (empty state, skeleton, mastery badges)
- `CoachingDrawer.tsx`, `ActionDrawer.tsx` and `ManagementTopbar.tsx` live in `app/management/dashboard/_components/`, not `components/mission-control/`
- Removed in October 2026: `RolesPermissionsMatrix.tsx` (its role table moved into Teams) and `WorkspaceHeader.tsx` (replaced by `PageHead`)

## 2. Data Fetching Pattern

**Not Server Actions, not SWR/React Query.** The real pattern is a hybrid of an unawaited cached server promise, a Suspense boundary, and a client-side fallback fetch:

1. `app/management/dashboard/page.tsx` starts `getCachedManagementSnapshot(user.id)` — **deliberately not awaited**. This is `unstable_cache(getManagementSnapshot, ["management-snapshot"], { revalidate: 20 })`, calling `getManagementSnapshot()` (`lib/management/service.ts`) with the **admin/service-role Supabase client** — it bypasses RLS entirely and scopes rows explicitly in the query (`.eq("manager_user_id", ...)` / `.eq("owner_user_id", ...)`) instead.
2. The unawaited promise is passed into `<ManagerControlCenterLoader snapshotPromise={...} />` inside a `<Suspense>` boundary.
3. `ManagerControlCenterLoader.tsx` calls React 19's `use(snapshotPromise)` to unwrap it, then renders `<ManagerControlCenter initialSnapshot={snapshot} ... />`.
4. `ManagerControlCenter.tsx` seeds local `useState` from `initialSnapshot`. On a cache miss, invalidation, or manual refresh, a client-side fallback (`fetchSnapshot` → `apiFetch("/api/management/snapshot")`) re-derives the identical snapshot by calling the **same** `getManagementSnapshot()` function from inside the API route, behind `requireManager()` (§3), on the admin client.
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

**API-route level: every `/api/management/*` handler starts with `requireManager()`** (`lib/management/auth.ts`, audit 2026-09-30 Phases 2–3). Since the Phase 2 RLS lockdown, clients can't write any of these tables, and every write runs on the service-role client, which bypasses RLS — so **this guard is the security boundary**. It:

- validates the JWT with `auth.getUser` → 401; rate-limits per user and IP → 429; checks the one-device `sbe_session_id` → 409 (a missing cookie is allowed, matching middleware);
- reads role, tier and trial from the database (never from the body) using the same rules as the page gate → 403; `ownerOnly: true` excludes duty managers (venues, billing-type actions, membership role changes);
- returns `entitlement { tier, seatLimit, venueLimit }` — plan limits are enforced here (venue cap: Boutique/`venue_single` 1, Commercial/Enterprise unlimited; seats from `TIER_SEATS`), never from `profiles.tier` directly;
- returns `assertOwnsVenue(id)` / `assertOwnsStaff(id)`, which throw a 404 for anything the caller doesn't own.

Service functions still filter every update/delete by `manager_user_id`/`owner_user_id = caller` as a second layer. Errors go through `managementErrorResponse()` (generic message to the client, details to the server log).

**Adding a route:** copy the pattern — `const gate = await requireManager(req, { rateKey, ownerOnly?, limit? }); if (!gate.ok) return gate.response;`, assert ownership of every id in the body, read the body with `readJsonBody()`, and escape anything that goes into an email with `escapeHtml()`. The one exception is `join-venue`, which staff must be able to call (documented in that file).

**Nothing in the console UI gates or enforces access.** The old Roles & Permissions tab (`RolesPermissionsMatrix.tsx`) showed a hardcoded access table that looked like an ACL and was not one; it was removed in October 2026. The "By role" table on the Teams tab lists the modules each role is expected to complete (`REQUIRED_MODULES` in `TeamsPerformancePanel.tsx`). That list is display only too.

## 4. State Management for Complex UI (Filtering, Tabs)

- **Tab navigation** reads `useSearchParams()` on mount to restore `?tab=`/`?subtab=`, but *writes* via raw `history.pushState`/`replaceState` rather than `router.push`/`router.replace` — a deliberate workaround to avoid Suspense re-suspension, not the idiomatic Next.js router pattern. Follow this same pattern if adding new tab-driven navigation here; don't "fix" it to use the router without understanding why it was avoided.
- **Everything else is local `useState`, not URL params**: `selectedVenueId` (venue selector), `staffRoleFilter` (`StaffDirectoryTable.tsx`), `leaderboardTab` (`LeaderboardBoard.tsx`). Filtering/sorting is done client-side on arrays already in memory (`venueStaff.filter(...)`, `.sort(...)`).
- **No date-range filter exists anywhere in `components/mission-control/*` today.** If a feature needs one, it's new work, not a hookup to existing state.

## 5. Mission Control Architecture Constraints

**CSS token anti-pattern:** `--bg-dark` (`#1B2A2F`) is a **marketing-site** dark-hero token — NOT a Manager Console token. The console runs on `--bg` (parchment `#f5f2e9`), `--surface`, and `--surface-raised`. Never apply `--bg-dark` to console panels.

**`--mcc-*` token block — resolved.** The parallel 20-token palette (`--mcc-canvas`, `--mcc-forest-900`, `--mcc-good`, `--mcc-bad`, etc.) that used to live in `app/globals.css` has been fully migrated onto `--status-*`/`--green`/`--surface`; zero `--mcc-*` definitions or usages remain anywhere in the codebase. Do not reintroduce a parallel `--mcc-*` namespace — extend `--status-*`/`--green`/`--surface` instead.

**`ManagerControlCenter.tsx` line-count target: under 3,200 lines.** Current state ~1,717 lines (verify with `wc -l` — this drifts) — target comfortably met.

**Component extractions — complete.** `StaffDirectoryTable.tsx`, `TeamsPerformancePanel.tsx`, `LeaderboardBoard.tsx`, `AnalyticsPanel.tsx` and `AICoachPanel.tsx` are extracted and imported into `ManagerControlCenter.tsx`. `QUICK_ACTIONS` is still an inline array in `ManagerControlCenter.tsx` — a `QuickActionMenu.tsx` extraction was proposed at one point but never happened / was reverted; it does not exist in the repo.

## 6. Console design (October 2026 redesign)

The whole console was rebuilt to the `docs/Pages-Redesign.md` principles. Styles are two blocks in `app/globals.css`, both `.mc-*` classes: "MANAGER CONSOLE — SHELL AND OVERVIEW TAB" and "MANAGER CONSOLE — PAGES".

**Look**
- **Type:** Newsreader and Inter through `--font-heading` / `--font-body`. The console loads no fonts of its own.
- **Colour:** parchment, ink and hairlines. Brand green marks the active nav item and actions. Red means an expired certificate or a person blocked from service, and nothing else. A small gold dot marks "due soon" or "needs follow-up". No tinted pills, chips or banners.
- **Figures:** the body face with tabular lining numerals (`.mc-figure`, `.mc-kpi-value`). Never the heading serif.
- **Tokens:** `--mc-*` names are aliases of the brand tokens. Do not give one a hex value.
- **Readability floor:** nothing below 13px, controls at least 40px tall, visible focus rings.

**Shell**
- **Header alignment:** `--mc-header-h` sets the height of both `.mc-sidebar-logo` and `.mc-topbar`. Change the token, not either rule.
- **Sidebar collapse:** a 64px icon rail. The control is an icon button to the right of the logo; in the rail it takes the logo's place. Saved in `localStorage` (`sbe-mc-sidebar-collapsed`), toggled by the button or Cmd/Ctrl+B, and used by default below 1100px. Labels stay in the DOM so buttons keep their names.
- **Sidebar contents:** Overview (no group heading), People, Performance, then Settings alone at the foot (owners only). There is no profile row or Sign out in the sidebar.
- **Account menu:** the avatar in the top header opens a menu with the manager's name, Account settings (owners only) and Sign out.
- **Adding a nav item:** edit `NAV_GROUPS` in `ConsoleSidebar.tsx`. "Training Gaps" is section id `predictive` (`PredictivePanel.tsx`). `?tab=roles` redirects to Teams.
- **Search:** `/` or Cmd/Ctrl+K focuses it.
- **Narrow screens:** the shell stays side by side at every width; it does not stack. The workspace is one grid track of `minmax(0, 1fr)`, so a wide child cannot cause sideways scroll.

**Every tab other than Overview**
- **Structure:** a `.mc-page` wrapper, one `PageHead` (title, one sentence, the tab's actions), then `StatRow` and `Panel`s. Do not wrap a tab in `ops-grid` / `ops-card`.
- **Tables:** `.mc-table` inside `.mc-table-wrap`, in a `Panel` with `flush`. Numbers are right-aligned with `.is-num`.
- **Status:** `StatusText` with a tone (`ok`, `warn`, `alert`, or none). No filled pills.
- **Buttons:** `.mc-btn` (outline), `.mc-btn-primary`, `.mc-btn-quiet`, `.mc-btn-danger`, `.mc-btn-sm`, `.mc-icon-btn`. One primary button per tab.
- **Settings:** `.mc-setting` rows (heading and note left, controls right) in a narrow column. No cards.
- **Dialogs:** `.mc-dialog-backdrop` and `.mc-dialog`.
- **Older markup:** the Staff tab's tables and the profile drawer still use some `ops-*` classes. Rules scoped to `.mc-shell` at the end of the PAGES block restyle them; new work should use the `.mc-*` parts.

**Ask AI Coach**
- **Layout:** the page is exactly as tall as the window, so the question box is always in view. Conversation on the left, starting points on the right.
- **Each question stands alone.** `/api/management/coach` is not sent earlier messages. Saved history is for reading back only.
- **New chat** calls `DELETE /api/management/coach/history?venueId=…`, which permanently removes that manager's saved messages for the venue, after one confirmation.

**Overview tab**
- **Notice reel:** `buildOverviewNotices(venueStaff)` returns sentences in priority order (expired RSA, RSA within 7 days, within 30 days, expired FSS, no RSA date on file, inactive 45+ days, not started, completed all modules, trained this week). Add a notice there and add a test in `lib/management/notices.test.ts`. The reel advances every 7 seconds, stops on hover, focus or pause, and never auto-advances under `prefers-reduced-motion`.
- **Figure strip:** Shift readiness, Average mastery, Trained this week, RSA and FSS. Each opens a tab.
- **"Trained this week"** uses `wasActiveWithinDays()` in `lib/management/needs-attention.ts`. The tile, the reel and the venue health score share it.
- **Shift readiness** is scored across all venue staff. There is no roster in the data model, so it cannot describe one shift.
- **Team activity** groups staff by last-active date. No daily activity is stored, so there is no trend chart.

## Known Gaps / Drift

- **No console screen enforces access** (§3). The role table on Teams is display only.
- **Not yet on the new parts:** `TrialBillingSection.tsx` (Settings, Billing, during a trial), `NotificationsPanel.tsx` and the Training programs section. None has a nav item; the last two are reached from search or a shortcut.
- **No date-range filter exists** (§4).
- **The API route is the security boundary** (§3): the admin client bypasses RLS, so a new `/api/management/*` route without `requireManager()` and ownership assertions is an open door. Clients have read-only access to these tables.
- **Duty-manager data scope:** duty managers own no venues, so their first write auto-creates a "Primary Venue" for them (pre-existing behaviour, not yet redesigned).
- **"Staff invites & seat management" card** lists every invite across all of an owner's venues (no venue filter) and shows Enterprise seats as "/ 9999" — tracked in `To_do_list.md`.
- **"Mission Control" still appears in a few real user-facing strings** even though the product is marketed as "Manager Console": the `<title>` on `/management/dashboard` ("Mission Control | Serve By Example"), its `error.tsx` heading ("Mission Control couldn't load"), two `<option>` labels in `StaffDirectoryTable.tsx` ("Duty Manager — Mission Control" / "... (no Billing)"), and one blended string in `TrialBillingSection.tsx` ("Manager Mission Control"). Recorded as current state, not fixed here.

## Related Docs

- `docs/Phase5-Mission-Control-Execution-Brief.md` — component-extraction history and original acceptance criteria (historical; the extractions it called for are done)
- `docs/ManagmentConsoleUpgradeV5.md` — visual upgrade proposal (historical; note the filename's own spelling — "Managment" — is not a typo to fix, it's the real file)
- `docs/DATABASE_SCHEMA.md` — RLS model (clients read-only) and the `organizations` model referenced in §2–3 above
- `docs/handoff/security/2026-10-02-audit-remediation-handoff.md` — why the API guard exists and the rules for new code
