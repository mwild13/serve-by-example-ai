# Handoff: the staff mobile rebuild and one-device sign-in, 22 October 2026

Work from 2026-10-21 to 2026-10-22 is recorded here. Earlier work is in `docs/handoff/2026-10-21-staff-desktop-handoff.md`. Open items are in `To_do_list.md`.

Everything below is on `main` (last commit `46d737b`). It was built on `preview/staff-mobile`, checked by CI there, then fast-forwarded to `main`.

- **How the mobile app looks and works now:** `docs/STAFF_APP.md` section 9 (the standard) and `docs/MOBILE_BUILD.md` (routes, data, the ui kit).
- **The plan it was built from:** `docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md`, with the approved Version 2 mock-up linked at the top.
- **Testing signed in:** `docs/LIVE_APP_TESTING.md`.

## What changed for staff on phones (`/mobile`)

**The look**
- Warm paper cream, bottle green anchors, gold only for streaks, goals and finished drills. Never small gold text on cream.
- Manrope throughout, iPhone type sizes, soft card shadows, a drawn flame instead of an emoji.
- **Dark mode:** bottle green (`.sm-dark` on `<html>`), follows the phone, with a switch in Settings saved per device.
- **Tokens:** `--sm-*` in `app/globals.css`. The old `--*-mobile`, `--fs-mobile-*` and `--space-mobile-*` names are gone.

**The shell**
- Four tabs: Home, Learn, Practise, Me. The tabs prefetch their pages.
- A small ui kit in `app/mobile/_components/ui/`: `Screen`, `TabBar`, `Sheet` (a native `<dialog>` bottom sheet) and the parts in `parts.tsx` (Section, Group, Row, Card, Pill, ProgressRing, Avatar and more).
- `app/mobile/loading.tsx` shows a skeleton in the mobile style.

**The screens, by commit**

| Phase | Commit | What |
|---|---|---|
| 1 | `bafd3ec` | Home as a feed |
| 2 | `cf73acb` | Drill screens and the pre-shift celebration |
| 3 | `49359ee` | Add to Home Screen guide and prompts, the onboarding install step, the desktop QR code |
| 4 | `e5a156e` | Learn as a path, module and skill check screens |
| 5 | `80606bb` | Practise, Saturday Rush, Live Guest and challenges |
| 6 | `b76af90` | Me, Settings, badges and help. Badge logic shared with the desktop in `lib/badges.ts` |
| 7 | `ee9acdf` | Cocktail library (photo grid) and Knowledge Base, each with a bottom sheet |
| 8 | `69cdff0`, `341cfdb` | Old tokens removed, e2e covers the new screens light and dark, 91 baselines |

**After release, from the owner's first look (`8139cad`)**
- **Sign out** at the foot of Me (and in Settings), with "Signed in as" the email.
- **Help:** the Live Arena question removed; added "The four tabs", "Where to find it" and "What the marks mean".
- **Speed:** `middleware.ts` uses `getClaims()` (checks the token locally against the ES256 keys) instead of calling Supabase Auth on every request, and skips the one-device check on prefetches. Phones go straight to `/mobile/home` after sign-in. The mobile layout reads the session and profile together.

## One device at a time: the newest sign-in wins (`692f639`)

The "Session active on another device" page and its Resume button are gone.

- Signing in makes that device the account's active one (`profiles.current_session_id` and the `sbe_session_id` cookie).
- The next time the older device opens a page, `middleware.ts` signs it out and sends it to `/login?signedout=elsewhere`, which says why in one line.
- A signed-in visitor who opens `/login` goes straight on: phones to `/mobile/home`, computers to `/dashboard`. A `?join=` invite link still goes through `/dashboard`.
- `/session-conflict` only forwards to `/login?signedout=elsewhere`, so old links still work.
- **Bug fixed:** Google sign-in never set `sbe_session_id`, so drills and quizzes refused a Google account. `app/auth/callback/route.ts` now records the session and sets the cookie.
- API refusals (drill, verify, Live Guest, voice, management) now say "You're signed in on another device. Sign in again to use this one."

## Public site navbar (`46d737b`)

Signed-in visitors no longer see "Go to Dashboard". They see the same Login button, filled green (`.nav-login-btn--in` in `app/globals.css`), and `/login` sends them on to the app.

## Not yet checked

- **The new sign-in flow has not been run end to end.** The dev server was off. The owner is testing it on their devices: sign in on the laptop, then the phone, then go back to the laptop. Google sign-in then a drill.
- **E2E baselines for Help, Me and Settings** are out of date after the Sign out and Help changes. To regenerate, with the dev server running (`docs/LIVE_APP_TESTING.md` section 6):
  ```
  npx playwright test tests/e2e/mobile-screens.spec.ts --update-snapshots --workers=1 -g "help|me renders|settings"
  ```
- An end-to-end test of the sign-in flow signs the QA session in `tests/e2e/.auth/state.json` out. The next e2e global setup makes a fresh one.

## Lessons

- **Releasing:** main is protected and needs the GitHub "checks" job on the exact commit. The Cloudflare Pages preview finishing first is not the same thing. Check once, push main when it passes, and don't sit in a wait loop.
- **Speed on Cloudflare:** a warm page is fast locally (about 0.4s). Most remaining slowness live is cold starts and the Turnstile wait, not the app.
