# Handoff: marketing pages ready to share, 22 to 23 October 2026

The last main job before sharing the marketing site across Australia. Built on `preview/marketing-mockups`, checked by CI there, then fast-forwarded to `main`.

## What shipped

| Commit | What |
|---|---|
| `df0105e`, `a14d86d` | New product mockups across the site, made by `scripts/device-mockups.mjs`; the venue photo plan |
| `b183ccb` | `/demo` rebuilt as a scripted Live Guest: Sharon and the cold parmy, no sign-up, no AI call |
| `07c932a` | Toolkit email drafts brought in line with the live toolkit, prices and brand |
| `8433365` | The demo placed where visitors decide: navbar, home hero, a home page teaser, `/platform`, the toolkit thank-you page |
| `b7f4236` | Home hero rewritten: "Know who's ready for Friday night." |
| `b83b1f5` | `/roadmap` rebuilt as shipped, now, next and later |

Outside the repo: the Notion toolkit page was refreshed in place (see below).

## 1. Product mockups

- **All 12 old screenshots in `public/shots/` are gone.** They showed the app before the October redesigns. 16 new files replace them; `docs/MARKETING_IMAGERY_PLAN.md` section 4 maps each file to its pages.
- **`scripts/device-mockups.mjs`** captures the signed-in app with Playwright and draws the phone and laptop frames in CSS, so there are no stock files and no credit line. Three commands: `login-manager` (owner signs in as a manager in a visible browser, presses Enter, the session is saved to the gitignored `tests/e2e/.auth/manager-state.json`), `capture [base-url] [name ...]`, `compose`.
- **Names on screen:** the QA account shows as "Sam Taylor"; the demo venue's internal email addresses are hidden. Nothing fake goes into the database.
- **Left out on purpose:** the QA account has no training history and the demo venue's training is over 30 days old, so the console Overview and the staff progress screens (which show zeros) are not used. Retake them once there is recent activity.
- **Fixed on the way:** `scripts/e2e/provision-qa-account.mjs` still set `profiles.manager_id`, dropped on 2026-10-12.
- **The QA account's one free Live Guest conversation is spent** (used by mistake while exploring). Live Guest captures use the manager session.

## 2. The demo (`/demo`)

- **What it is:** three turns of three replies with Sharon, a reviewed guest from the app (`cold-parmy`). The guest, speed, safety and money dials move as you go; the end shows the app's reveal, how the result lands in the Manager Console, and the trial.
- **Why scripted:** a real conversation costs well under a cent, but a public AI route invites bots. Signing up then gives the real guest who answers anything typed.
- **Not Dan:** he is the free taster every new account gets, and the reveal would give his answers away.
- **Files:** `lib/demo-guest.ts` (script, scoring, `DEMO_SHOW_ORDER`), `lib/demo-guest.test.ts` (holds it to Sharon's real brief), `app/(marketing)/demo/_components/GuestDemo.tsx`.
- **Deep link:** `/demo?reply=<0..2>` opens with that first reply already played. The home page teaser (`components/marketing/DemoTeaser.tsx`) uses it.
- **Analytics:** `demo_start` (with `entry`: `home` or `demo`) and `demo_complete` (with `score`, `passed`).
- **Removed:** the old three-scenario scoring demo and its prompts. `/api/demo/evaluate` now grades only Complaint Master's scenarios.

## 3. Where the demo appears

Navbar "Live demo" (desktop and phone menu), the home hero's secondary button, a home section after the Mastery Path with Sharon's first turn, the Live Guest feature on `/platform`, the Challenges hero (was wrongly "Book a demo"), and the toolkit thank-you page. Left off `/membership` on purpose, beside the buy buttons.

## 4. Home hero

- **Headline:** "Know who's ready for Friday night." Subhead names the staff side and the manager side.
- **Removed:** "Turn 6 Months of Onboarding Into 6 Weeks" and "3× faster onboarding", results claims with no customer evidence (Australian Consumer Law: reasonable grounds when made). Page title and description changed to match. Bring a results claim back only with real venue data.
- **Trust row:** 40 training modules, 60 practice guests, 19 languages, all checkable in the product.
- **Buttons:** "Start my free trial" (hero and phone sticky bar) and "Try the 2-minute demo". A stale text-link rule that underlined the demo button and set it out of line was removed.
- Recorded in `docs/marketing-project/SBE_MARKETING_CORE.md` and `docs/Pages-Redesign.md` 6.1.

## 5. Roadmap (`/roadmap`)

Recently shipped (six live features), then Building now, Next and Later with no dates, then what we won't build. The three "Building now" items are on the to-do list because the page promises them. The "monthly calls with founding members" promise came off this page.

## 6. Notion toolkit and email drafts

- **Notion:** the toolkit page (`37a875fdcc2d802e8a7ce81fef70467d`) is now reachable through the Notion connector, after the owner reconnected it. Refreshed in place, so emailed links still work: live prices with the founding promise from `/membership`, links to `/membership` and `/demo`, the national food safety standard (3.2.2A), unsourced figures removed, no emojis or dashes.
- **The "RSA Incident Log" (Asset 1) was never built.** The toolkit is one page, the onboarding SOP. References to it were removed from the page and the email drafts.
- **Email drafts:** `docs/Trojan Horse Lead Magnet/4-part-email-nurture-sequence-copy.md` is now the source for the four toolkit emails (signed by the team, live prices, no incident log). The Loops plan and the original landing page plan are marked historical. Nothing that sends today changed.

## 7. Venue photography

Not done yet; it's the owner's photo shoot (to-do list, section 1). `docs/MARKETING_IMAGERY_PLAN.md` has where each photo goes and how it is treated (green scrim behind text, focal points for phones, AVIF under 250 KB for the hero). `docs/Pages-Redesign.md` 2.5 and 2.7 need their photo rules when the photos go in.

## Checks

Types, lint, CSS lint, 395 unit tests, knip, all 73 marketing e2e tests and an axe scan of `/` and `/demo` passed on the preview. CI passed on every commit after `a14d86d`.
