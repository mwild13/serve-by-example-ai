# 11 — Final QA & Launch Readiness

## Primary Goal & UI Targets

All 13 `app/mobile/_components/` screens. "Done" = a single end-to-end integration checklist confirming every screen's real data path works (not just navigation, which the earlier Phase B.5 plan already covers), every rate limit is accounted for, and the codebase passes the same type/lint/style bar the rest of the project holds.

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
| `training/save`, `training/progress`, `training/challenges/save`, `session/stamp` | — | **none** — existing V3 gap, not a regression V4 introduces |

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
   - Learn Hub → confirm real modules, real lock state per tier, real mastery badges.
   - Scenario Training → Start Simulation → Arena → submit a response → confirm real score, confirm `elo_rating` updates, confirm manager console reflects it (file `09`).
   - Challenges → Match Pairs → complete → confirm `user_challenges` upsert, confirm Progress screen's challenge count increments.
   - Cocktail Library / Knowledge Base → confirm real 38/31-entry data, confirm search and filters work.
   - Badges → confirm real computed badge states, not the "14/52" mock.
   - Onboarding Diagnostic → confirm the real 10-question flow (not the self-report picker) produces correct category Elo and seeds `scenario_mastery`.
   - AI Profile Photo → confirm generation, save, and persistence (if file `08`'s net-new build has shipped by this point — otherwise confirm it's clearly marked as not-yet-available rather than silently broken).
4. Confirm every mobile write path traces to an existing V3 API route per file `09`'s audit — no orphaned mobile-only persistence.
5. Confirm the rate-limit table above is current; add limits to any previously-unrated route if mobile traffic volume warrants it.
6. Confirm resilience behavior from file `10` (offline queue, retry UI) on at least the two idempotent write paths.
7. Sign-off: only after all of the above pass does Phase C get marked complete.
