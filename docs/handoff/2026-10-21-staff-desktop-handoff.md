# Handoff: the staff desktop rebuild and docs clean-up, 21 October 2026

Work from the evening of 2026-10-20 to 2026-10-21 is recorded here. Earlier work is in `docs/handoff/2026-10-rich-update-handoff.md`. Open items are in `To_do_list.md`.

Everything below is on `main` (last commit `1bba84b`). It was built on `preview/staff-desktop`, checked by CI there, then fast-forwarded to `main`.

- **How the staff desktop works now:** `docs/STAFF_APP.md` section 8.
- **Challenges:** `docs/CHALLENGES.md`.
- **Writing rules for every AI agent:** `AGENTS.md`.

## What changed for staff on the desktop (`/dashboard`)

The desktop staff area was rebuilt twice on 2026-10-21. The first look (all dark green, brass accents, serif headings) was rejected the same day as "too AI". The second is what shipped.

**The look**
- Cream page, near-white panels, a bottle green sidebar, green as the only accent. No gold.
- Manrope throughout, compact panels on a 12-column grid, one solid green card per page as the focal point.
- **Dark mode:** the bottle green look, chosen in Settings or the account menu, saved per device (`sbe-sd-theme`).
- **Short screens:** fits a MacBook with the dock showing (an `@media (max-height: 820px)` rule tightens spacing). Checked at 1280×720, 1366×768, 1512×760 and 1920×1080.

**The shell**
- Sidebar grouped as Today / Learn / Practise / Look it up / Me, collapsible to an icon rail (Ctrl or Cmd+B).
- **Back and Forward:** each page is pushed to the browser history as `?nav=`, so Back stays inside the dashboard.
- **Instant page changes:** page data is cached in memory per person (`lib/staff-cache.ts`, loaders in `lib/staff-data.ts`). A return visit paints at once and refreshes behind the scenes. The shell also loads every page's data once the first screen is idle.

**The screens**

| Screen | What it is now |
|---|---|
| Today | The step for tonight (`pickNextSteps()` in `lib/next-step.ts`, tested) beside the shift streak; this week at the venue; three path figures; up next; a cocktail and a fact for the bar |
| Modules | The suggested module, then every module as rows by level, with area tabs and search. "Continue", not "Carry on" |
| Mixed Drill and pre-shift drill | A lobby: the drill on the green card, modules in your drills or your shift streak beside it, the modules it draws on below |
| Saturday Rush | A lobby: the shift on the green card, your best score beside it, how the four dials score you |
| Challenges | Ten challenges (was five): today's challenge, your record, all ten as tiles, play one or all ten in a row for a score |
| Cocktails, Knowledge Base | List on the left, card on the right. The Knowledge Base has 101 cards (was 31) |
| My progress | Four figures, mastery by area, badges with the next one to earn (Badges merged in; `?nav=badges` scrolls to them) |
| Settings | On the panel standard, with an Appearance setting for dark mode |

**Retired:**
- **Components:** `PreShiftHome`, `DynamicModuleNav`, `SharedTrainingCard`, `ProgressOverview`, `BadgesView`, `BadgeStreakSection` and `BadgeProgressRing`.
- **Other code:** the old challenge game files, `lib/modules.ts` and the old `.sbe-dark` theme.

## Challenges and the Knowledge Base

**Challenges**
- **Content:** all ten are data in `lib/challenge-content.ts`. Indexes 0 to 9 must never change, because completions are saved against them.
- **Games:** `components/challenges/ChallengeGame.tsx` plays any of them on desktop and mobile.
- **Mobile:**
  - Challenges 1 to 5 keep their original screens.
  - Challenges 6 to 10 open `/mobile/challenge/<slug>`.
  - Mobile's challenge 3 (Ingredient Match) is a different game from desktop's, as before.
- **The five new challenges:**
  - opening a bottle at the table
  - the food temperature danger zone
  - what spirits are made from
  - cutting off an intoxicated guest
  - a severe nut allergy

**Knowledge Base:** 70 new cards across spirits, beer, wine, cocktails and non-alcoholic. Australian focus, including:
- standard drinks
- state beer glass names
- Rutherglen Muscat
- native botanicals
- the coffee menu
- opening sparkling wine

When a category is chosen, the list groups by subcategory.

**Tests:** `lib/challenge-content.test.ts` checks every challenge can be answered. `lib/knowledge-base.test.ts` keeps the count at 101 and every card complete.

## No em or en dashes

- **`AGENTS.md`:** written for every AI agent, with a table of what to write instead of a dash.
- **The check:** `lib/no-dashes.test.ts` fails CI on a dash outside a comment anywhere in staff screens and teaching content.
- **What was fixed:** every dash in staff copy and content was rewritten by hand. Nine module descriptions were fixed in the database by `20261030_module_descriptions_no_dashes.sql`.
- **Still to do:** about 30 dashes remain in Manager Console code (mostly an em dash used as an empty-cell placeholder). Not covered by the test yet.

## Fixes

- **Supabase lock error in Sentry** (`b4f3be3`): the Navbar's sign-in check catches a lost auth lock, and `lib/report-error.ts` ignores the message.
  - The same commit also asks for notification permission only from a tap, and drops bar slang from copy.
- **Cloudflare build** (`d4a7e14`): OpenNext refuses Next.js 15 after its support end date, so `build:cloudflare` passes `--dangerouslyUseUnsupportedNextVersion`. It is a stopgap: the real fix is the Next.js 16 upgrade (`To_do_list.md`).

## Docs and repo clean-up

- **Brought up to date:**
  - **CLAUDE.md:** tiers, token values, fonts, the staff desktop tokens and the doc list.
  - **AGENTS.md:** added the mobile doc and a "before you hand work back" checklist.
  - **README:** rewritten.
  - **MOBILE_BUILD.md:** routes, the Learn hub, the service worker.
  - **To-do list.**
- **Moved to `docs/zHistorical/`:** finished plans and audits, `v4-migration-plan/` and `docs/Updates/`. Nothing deleted. Code comments now point at the current docs.
- **`docs/DELETED.md`** is back in `docs/` as the running log of removals.
- **Root folder:**
  - Removed `favicon_io/`, `content/quick-drills.json` and `wrangler.pages.jsonc`.
  - `.claude/settings.local.json` is no longer tracked.
  - `/payment-success` (deleted earlier) dropped from the middleware lists.
- **AI design skills:** removed nine that pushed a showy look or didn't fit the stack, `impeccable` above all. The list and reasons are in `docs/DELETED.md`.

## Migrations

All three confirmed in the database on 2026-10-21 by a read-only query:

| Migration | What | State |
|---|---|---|
| `20261029_team_week.sql` | This Week tables (from the Rich update) | Run |
| `20261030_module_descriptions_no_dashes.sql` | Nine module descriptions without dashes | Run |
| `20261031_challenges_ten.sql` | `challenge_index` allowed 0 to 9 | Run |

## Checks done by Claude Code

- **Automated:**
  - 290 unit tests.
  - Lint shows only the four old warnings.
  - knip, both CSS lints, the typecheck and the Cloudflare production build are clean.
  - CI passed on every push.
- **Checked in a browser** on throwaway local pages with sample data (deleted before committing):
  - Today, Modules and the other screens in light and dark, at the four sizes above.
  - Challenges (the list and playing match and fill-the-blanks, light and dark).
  - The Knowledge Base, a new challenge on the phone's colours, and the Saturday Rush and drill lobbies.

## Not checked with a real account

The saved QA session (`tests/e2e/.auth/state.json`) is dead. It was rotated by using it on production, and a new one needs the e2e setup with the service key. So nothing above was clicked through while signed in.

Worth a look by the owner, signed in on a laptop:
1. **Speed:** Today, then Modules, then back to Today should be instant on the return. The first visit to each page should be quick too.
2. **Back:** Back and Forward in the browser should move between pages without leaving the dashboard.
3. **Challenges:**
   - Play one, then confirm it shows "Done" and My progress counts it.
   - Play all ten in a row and check the score.
4. **Drills:** start the mixed drill and the pre-shift drill from their lobbies; the drill should open straight away, with no second intro card.
5. **Dark mode:** switch it on and look through each page.

## Open after this work

- **Owner review of the new content:** the 70 Knowledge Base cards and the five new challenges were written and fact-checked by Claude from its own knowledge, not against outside sources, and not yet read by the owner.
- **Retake `public/shots/`:** the staff screenshots still show the old desktop.
- **Desktop e2e baselines:** they need a fresh QA session first.
- **Next.js 16 upgrade:** on its own branch, with `@opennextjs/cloudflare` bumped alongside. It also removes the build flag.
- **Manager Console dashes:** about 30 left.
