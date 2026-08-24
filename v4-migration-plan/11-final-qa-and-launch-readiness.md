# 11 — Final QA & Launch Readiness

## Primary Goal & UI Targets

All 17 `app/mobile/_components/*Screen.tsx` screens (corrected 2026-08-22 — this file's original "13" count predates Challenges' 4 mini-game screens and AI Photo). "Done" = a single end-to-end integration checklist confirming every screen's real data path works (not just navigation, which the earlier Phase B.5 plan already covers), every rate limit is accounted for, and the codebase passes the same type/lint/style bar the rest of the project holds.

## Diamond Extraction List

- **Phase B.5 Navigation & Flow plan** (already executed) — route map, `BottomNav` wiring, `<Link>`/`router.back()` glue, local `useState` toggles. This file cross-links rather than duplicates it; the click-through script below extends it to cover real data, not just navigation.
- **Consolidated rate-limit table from the AI/wiring audit** (`lib/rate-limit.ts`, fixed-window in-memory, per-edge-node):

| Route | Key pattern | Limit |
|---|---|---|
| `arena/evaluate` | `arena:user:${id}` + `arena:ip:${ip}` | 20/min (both) |
| `evaluate` | `evaluate:user:${id}` + `evaluate:ip:${ip}` | 20/min (both) |
| `coach` | `coach:${id ?? ip}` | 30/min |
| `management/coach` | — | **none** (session-cookie guard only) |
| `translate` | `translate:${ip}` | 15/min |
| `demo/evaluate` | `demo-evaluate:ip:${ip}` | 5/min |
| `demo/generate-drills` | `demo-generate-drills:ip:${ip}` | 3/min |
| `roi/email` | `roi-email:${ip}` | 5/min |
| `training/save` | `training-save:user:${id}` + `training-save:ip:${ip}` | 20/min (both) |
| `training/progress` | `training-progress:user:${id}` + `training-progress:ip:${ip}` | 60/min (both) |
| `training/challenges/save` | `challenges-save:user:${id}` + `challenges-save:ip:${ip}` | 20/min (both) |
| `session/stamp` | `session-stamp:user:${id}` + `session-stamp:ip:${ip}` | 10/min (both) |

(Table refreshed 2026-08-23 — the 4 routes above were rate-limited in commit `a5f824f`; this table had gone stale since.)

**Flag before launch:** if mobile usage patterns (e.g. tap-based mini-games firing saves rapidly) drive materially more traffic to the unrated routes than V3's desktop usage ever did, consider adding rate limiting to `training/save`/`challenges/save` as part of this migration rather than deferring further — it's cheap to add (`rateLimit()` is a one-line call) and this audit is the first time the gap has been documented.

- **`CLAUDE.md` compliance bar** (restated as the launch checklist, not new rules): no Tailwind utility classes; CSS custom properties / inline `style={{}}` only; canonical field names `elo_rating`/`mastery`; module metadata sourced through `module-navigator.ts`/`/api/training/modules`, never re-hardcoded; no emojis anywhere; TypeScript throughout, no `any` unless unavoidable.

## Architecture & Cleanup Plan

- This file doesn't introduce new logic — it's the closing verification pass across everything built in files `01`–`10`. Treat it as a gate before calling Phase C "done," not a parallel workstream.
- Any new AI route added during this migration (the profile-photo generator in `08`) must land in the consolidated rate-limit table above — update this file when that ships.
- Confirm no screen re-introduces a hardcoded module/scenario list after the `03`/`04` wiring — a regression here is exactly the "known duplication" pattern `CLAUDE.md` warns against.

## Step-by-Step Task Checklist

1. Run `npx tsc --noEmit -p .` — clean.
2. Run `npx eslint` across every file touched in files `01`–`10`'s implementation — clean, including `sbe-design/no-hardcoded-hex`.
3. Full manual click-through, real data this time (extends the earlier Phase B.5 navigation-only pass):
   - Log in fresh → `/mobile/home` → confirm no redirect loop, confirm real recommendation data (not static copy).
   - Learn Hub → confirm real modules, real lock state per tier, real mastery badges. (Post 3-tab consolidation, 2026-08-21: Learn Hub is now the single entry point for Practice & Scenarios / Core Knowledge / Mini-Games / Reference Library — "Scenario Training" as a standalone screen no longer exists, see below.)
   - Learn Hub's Practice & Scenarios section → tap a Live Arena module card → Arena → submit a response → confirm real score, confirm `elo_rating` updates, confirm manager console reflects it (traced end-to-end 2026-08-22, see Implementation Notes below — confirmed wired, no broken link).
   - Challenges → Match Pairs → complete → confirm `user_challenges` upsert, confirm Progress screen's challenge count increments.
   - Cocktail Library / Knowledge Base → confirm real 38/31-entry data, confirm search and filters work.
   - Badges → confirm real computed badge states, not the "14/52" mock.
   - Onboarding Diagnostic → confirm the real 10-question flow (not the self-report picker) produces correct category Elo and seeds `scenario_mastery`.
   - AI Profile Photo → confirm generation, save, and persistence (shipped; confirm on-device).
4. Confirm every mobile write path traces to an existing V3 API route per file `09`'s audit — no orphaned mobile-only persistence. (Audited 2026-08-22, see Implementation Notes below — no orphaned-persistence bug found.)
5. Confirm the rate-limit table above is current; add limits to any previously-unrated route if mobile traffic volume warrants it. (`training/save`, `training/progress`, `training/challenges/save`, `session/stamp` rate-limited 2026-08-21, table refreshed to match 2026-08-23 — done.)
6. Confirm resilience behavior from file `10` (offline queue, retry UI) — shipped 2026-08-22, scoped to `training/challenges/save` only (not both write paths originally specced — `training/save`'s cumulative-write design made it unsafe to blind-retry; see file `10`'s own updated notes).
7. Sign-off: only after all of the above pass does Phase C get marked complete.

## Implementation Notes (2026-08-22) — code-level audit pass, not the human click-through

Ran the 3 code-verifiable items from the checklist above (Arena→manager propagation, orphaned-persistence sweep, real-data sweep) as a full trace/grep audit before handing the remaining device-only items to the user. No code changes made in this pass — audit only, findings below.

**Arena → manager console (checklist item 3's Scenario Training row, item 4):** traced `ArenaScreen.tsx` → `POST /api/arena/evaluate` → `recordAttempt(..., scenarioType: "roleplay")` → `syncMasteryToVenueStaff()` → `venue_staff.service_score` → `TeamsPerformancePanel.tsx`/`LeaderboardBoard.tsx` (manager UI), hop by hop. **Fully wired, no broken link.** Two things a prior session flagged as open concerns are confirmed fixed in current code: `syncMasteryToVenueStaff()` is called unconditionally after every Arena evaluate (`arena/evaluate/route.ts:126`, not dead code), and a roleplay pass does set `is_mastered = true` (`lib/mastery.ts:325-333`, mirrors the quiz gate, sticky/never-reversed). Arena is a real, non-zero 20% weight in `service_score`.

**Orphaned persistence (item 4):** every `localStorage` key under `app/mobile/` traced. One key (`sbe_challenges_completed`) is meant to sync — confirmed every write path POSTs immediately with retry-queue coverage on failure (file `10`, 2026-08-22). Everything else (`sbe-ai-portrait-draft`, `sbe-match-pairs-best-moves`, `sbe-streak-*`, `sbe-retry-queue`) is intentionally local-only, each already documented as such in its own file. `sbe-match-pairs-best-moves` specifically: confirmed no DB column or API route touches it anywhere — a device-level vanity stat matching desktop's own equivalent, not a bug.

**Real-data sweep (all 17 screens, corrected count above):** zero `TODO`/`FIXME` hits. Every "mock" string found is a comment describing a fix already made (Phase B skeleton → real data), not a live placeholder. Two intentional non-DB elements confirmed by design: Cocktail Library/Knowledge Base (static content libraries, same pattern as desktop) and the hardcoded `"medium"` confidence default on Arena/Scenario Practice (no confidence-picker UI was ever spec'd).

**Still outstanding — genuinely needs a human on a real device, not code review:** the actual click-through (steps 1-3 above), visual rendering of the new sticky jump-nav pills and offline/sync banner, touch-gesture correctness on Match Pairs, and the rate-limit table refresh noted at item 5.

## Headless Functional Checks (2026-08-22)

Ran the 3 backend flows the user asked to confirm headlessly, against a local `next dev` server before any device pass. One passed cleanly with a caveat noted; the other two hit a genuine auth blocker and are deferred to the human device pass rather than worked around.

- **Redirect check — pass, with one caveat.** `curl -D - http://localhost:3000/mobile/scenarios` (unauthenticated) returns `307 Temporary Redirect` → `location: /login`. That's `middleware.ts:122`'s `/mobile/*` auth gate firing first, before `app/mobile/scenarios/page.tsx`'s own `redirect("/mobile/learn")` ever runs — correct behavior, confirms no unauthenticated leak on the route. What this *didn't* confirm: the authenticated case (signed-in user hits `/mobile/scenarios`, gets 307 → `/mobile/learn` specifically). That needs a real session cookie past the middleware gate — fold it into the device click-through (step 3 of the checklist above already covers this route implicitly via the old-bookmark scenario).
- **Manager Sync check (Arena → `service_score`) — deferred to device pass.** `/api/arena/evaluate` checks `getUserFromRequest()` before anything else, and there's no test-user credential anywhere in this repo (checked — no seed fixtures, no documented QA account). Firing it for real would mean fabricating a live Supabase auth user, spending a real billed GPT-4o-mini call, and writing real rows to `scenario_mastery`/`venue_staff.service_score` on the production project — decided against automating that without a designated test account. The chain itself is already confirmed correct at the code level (see the Arena → manager console note above, hop-by-hop trace). Confirm live during the device pass using a real or designated test staff login.
- **Rate limit check (`training/challenges/save`) — deferred to device pass, and not meaningfully automatable without auth anyway.** Same route checks auth before the rate limiter runs (`getUserFromRequest()` → 401 gate → `rateLimit()`), so 25 *unauthenticated* rapid-fire requests would just 401 every time and never exercise the limiter — that wouldn't actually test what was being asked. Needs a signed-in session to mean anything; fold into the device pass (rapid-tap a Challenge game's completion a few times in a row and confirm a 429 surfaces as a queued retry, not a silent failure).

## Device Pass Findings (2026-08-24) — Claude Chrome click-through, account `mitch@serve-by-example.com`

- **Task 1 (frozen-scenario-text retest, commit `13f3573`) — PASS.** 4 scenarios advanced, text changed every time, no card stacking.
- **Task 2 (real-data click-through) — PASS, all sub-items.** Home recommendation, Learn Hub's 4 sections, Arena submission (score 60/100, mastery 0%→100%), Challenges, Cocktail Library, Knowledge Base, Badges, `/mobile/scenarios` redirect, no-flash re-navigation — all confirmed against real data.
- **Task 3 (Manager Sync check) — blocked, correctly.** `mitch@serve-by-example.com` joined via venue code and is a Venue team member, not a manager, so Mission Control was unreachable. **Confirmed by code audit this is intended behavior, not a bug**: both invite paths (`app/api/management/memberships/route.ts`, `app/api/management/join-venue/route.ts`) hardcode `role: "staff"` server-side — there is no request field or UI control that lets a joining/invited user self-select "manager." Manager access is gated separately, on B2B tier ownership (`isB2BTier(profile.tier)` in `app/management/dashboard/page.tsx`) or `ADMIN_EMAILS`. No security gap. The check itself is still un-run — needs an actual manager-role login on the same venue to complete.
- **Task 4 (rate-limit check) — not run via Chrome** (gameplay-based rapid-fire was too slow/expensive for the tool to execute economically). Reassigned as a manual step: fire ~20-22 rapid `POST /api/training/challenges/save` calls directly from the browser console (bypasses gameplay, tests the limiter itself), then complete one real Challenge to confirm the resulting 429 surfaces via the gold sync banner, not silently. Still outstanding — needs a human to actually run it.

## Backlog — Manager-selectable role on Staff Invite (raised 2026-08-24, not yet built)

Not a security gap (see Task 3 finding above — nothing today lets an invited/joining user grant themselves manager access). It's a **missing feature**: every invite path (manager-initiated invite in `memberships/route.ts`, and self-serve venue-code join in `join-venue/route.ts`) hardcodes `role: "staff"` unconditionally. There is currently no way for a manager to invite someone *as* a manager/co-manager through the product — manager status can only be granted by owning a paying B2B (`venue_single`/`venue_multi`) Stripe subscription, or being listed in `ADMIN_EMAILS`.

**Proposed fix (not scoped/estimated yet):** add a Staff vs. Manager selector to the "Invite Staff" flow in Mission Control. On selecting Manager, the invite would need to grant `platform_role`/equivalent access to management modules rather than (or in addition to) the `organization_members`/`venue_staff` staff row — the exact mechanism needs design, since today "manager" access is entirely tier-derived, not role-derived, and there's no column that grants management UI access independent of a Stripe subscription. Flag for scoping before building — this is a genuine access-model change, not a one-line addition.

**Status: built 2026-08-24.** Migration `20260824_duty_manager_role.sql` applied live (widens `profiles.platform_role` CHECK to include `duty_manager`; formalizes `organization_members.role` to `('staff','duty_manager')`, which had drifted unconstrained in production). New `platform_role = "duty_manager"`: full Mission Control access (Staff, Teams, Roles, Compliance, Analytics, Reports, Leaderboards, Ask AI Coach) **except** Settings (Billing, venue setup, account) — owner-level only, enforced both in nav visibility and a direct-URL redirect guard in `ManagerControlCenter.tsx`. Two ways to grant it, both owner-level-only (server-checked, not just UI-hidden):
1. **At invite time** — `StaffDirectoryTable.tsx`'s Invite Staff form gets an "Access level" selector (Staff / Duty Manager), wired through `POST /api/management/memberships`. New signups get promoted on first login via `session/stamp/route.ts`'s reconciliation check; existing accounts get promoted immediately.
2. **On an existing staff member** — the same file's inline Edit-staff control gets a second "Access level" select alongside the existing name/job-title fields, wired through the new `PATCH /api/management/memberships` (keyed by email, requires the caller to already be owner-level, only ever flips a `staff`/`duty_manager` row — never an owner/admin's). Shows a "Duty Manager" badge on promoted rows. Only works for staff with an email on file (self-serve venue-code joins and legacy no-email rows have no membership row to match against — no-ops silently rather than erroring).

`lib/session.ts` gained `hasManagerConsoleAccess()` / `isOwnerLevelRole()` as the single source of truth, threaded through `app/management/dashboard/page.tsx`'s gate and `app/auth/page.tsx`'s post-signup routing.
