# Handoff: October 2026, Week 4: Applicant Testing

Work from 2026-10-26 to 2026-10-27. The earlier week 4 work (2026-10-17 to 18) is in `docs/handoff/2026-10-week4-handoff.md`. The spec, kept current, is `docs/APPLICANT_TESTING.md`; this file is the record of what was built and decided. Open items are in `To_do_list.md`.

## Status

- **Built and finished.** All four roles (bar, floor, kitchen, management) can be sent. The owner tested every part on the preview on 2026-10-27 and signed it off.
- **Released to production on 2026-10-27** (`main` at `33e4c4a`, pushed after CI passed on `preview/applicant-testing`).
- **Migrations, both run on production and checked:** `20261104_applicant_testing.sql` (tables, functions, the 12 month clean-up) and `20261105_applicant_marking_cron.sql` (the 5 minute marking sweep). Until release, the sweep's calls to production are a harmless 404.
- **Checks on the last commit:** 463 unit tests, typecheck, lint (3 old warnings, none new), CSS token and unused-class checks, knip, production build, CI on the preview.

## What it is

A **Hiring** group in the Manager Console, below Performance, with one tab, **Applicant Testing**. A manager emails a job applicant a link to a test of about 30 minutes for their role. The applicant needs no account. The manager gets a report: scores, every answer in full, how each answer was produced, and an AI summary with questions for the interview.

| Part | Items | Weight | Marked by |
|---|---|---|---|
| Hospitality basics | 10 multiple choice | 25% | Answer key |
| Knowledge for the role | 8 multiple choice | 25% | Answer key |
| First things first | 2 ordering tasks | 10% | Rule, part marks by distance |
| What would you do? | 4 written situations | 40% | AI: process, guest care, safety, judgement, 1 to 5 each |

No timer is shown and there is no time limit. The answer signals (time per answer from the server, pastes, time away, typing speed, quick answers, return visits) are shown as things to ask about, never as a fail.

## Decisions, and why

| Decision | Why |
|---|---|
| About 30 minutes, no timer, no time limit (owner) | Fewer people drop out; time is recorded instead of enforced |
| Signals shown as information, never a fail (owner) | They can be innocent (a pasted note, a phone call); the manager asks about them |
| Hiring group below Performance, venue plans only (owner) | A reason to move up from Pro |
| Applicants have no account and are kept apart from staff (owner) | No seats used, nothing in staff numbers |
| **No Live Guest** (owner, on Claude's advice) | Each conversation differs, so it can't be compared fairly or defended in a hiring decision; it costs the most AI and is awkward on a phone. Replaced by a fourth written situation |
| Floor added as a fourth role beside bar, kitchen and management | Floor staff aren't bartenders |
| Kitchen's core quiz drops RSA, the ice well, the ice scoop and greeting | A chef isn't tested on bar work |
| Role banks split into topics, each its own source | One source would have given a chef about 3 kitchen questions out of 8 |
| Allowances: Boutique 10 a month, Commercial 40, Enterprise 200, trial 2 (Claude, owner can change) | `lib/applicant/allowance.ts`, one line each |
| Duty managers can send, resend and withdraw; only owners delete | Duty managers often hire for the floor; deleting data is the owner's call |
| No Turnstile on the applicant's Start | The 256-bit link is the key, with rate limits; Turnstile had a CSP clash on `/login` |
| Answers are not held in the browser until the end; the next item is sent ahead instead | Keeps the server's timing and loses nothing if the tab closes, while the next question shows at once |
| Batches 2 and 4 approved by Claude at the owner's direction (2026-10-27) | The owner approved batches 1 and 3 and delegated the rest |

## Content

| Batch | What | Review sheet | Approved |
|---|---|---|---|
| 1 | 12 written situations, bar and floor | `docs/Applicant Testing/written-batch-1.md` | Owner, 2026-10-26 |
| 2 | 12 written situations, kitchen and management | `written-batch-2.md` | Claude for the owner, 2026-10-27 |
| 3 | 34 kitchen questions in 4 topics | `kitchen-bank-batch-3.md` | Owner, 2026-10-27 |
| 4 | 31 management questions in 4 topics | `management-bank-batch-4.md` | Claude for the owner, 2026-10-27 |

The quizzes and ordering tasks otherwise come from the reviewed module questions (no True/False). Sheets are written from the code: `npm run applicant:review` (written), `npm run applicant:review -- --bank kitchen` or `--bank management`. Food safety facts follow the Food Standards Code and FSANZ guidance; liquor law questions test what every state shares; pay deductions follow the Fair Work Act.

## How it works

**Files**

| Where | What |
|---|---|
| `lib/applicant/blueprint.ts` | Tracks, sections, weights, item keys, `drawTest()`, `progressAt()` |
| `lib/applicant/content.ts` | What each track draws from (`trackSources()`), `findSourceQuestion()` |
| `lib/applicant/questions/` | `written.ts`, `kitchen.ts`, `management.ts` |
| `lib/applicant/scoring.ts`, `integrity.ts` | Scores and bands; answer signals and their wording (thresholds in `SIGNAL_THRESHOLDS`) |
| `lib/applicant/service.ts` | Serving, answering, finishing, marking, the report, the manager email |
| `lib/applicant/marking.ts`, `summary.ts`, `after-response.ts` | The AI marker, the summary, running work after the response (`waitUntil`) |
| `lib/applicant/token.ts`, `public-route.ts`, `allowance.ts`, `emails.ts`, `client.ts`, `use-answer-signals.ts` | Link tokens, the applicant route guard, plan allowances, the two emails, browser types and calls, signal capture |
| `app/api/management/applicants/` | Console: list, send, resend, withdraw, delete, and the report (`[id]`) |
| `app/api/applicant/[token]/` | Applicant: `start`, `next`, `answer` |
| `app/api/cron/applicant-marking/` | The sweep |
| `app/apply/[token]/`, `components/applicant/ApplicantTest.tsx`, `app/styles/applicant.css` | The applicant's pages |
| `components/mission-control/ApplicantTestingPanel.tsx` | The console tab |

**The flow**

1. **Send:** the console POST checks the track can be dealt, refuses a second open test for one email, takes one test from the month's allowance (`claim_applicant_test`), deals the test, and emails the link through Brevo from "[Venue] via Serve By Example", replies to the manager.
2. **Open:** the page changes nothing (mail scanners), shows the welcome and the collection notice. Start records consent.
3. **Answer:** one item at a time, each sent with the next so it shows at once. An answer is saved only if `position` hasn't moved; moving on starts the next item's clock. Three database calls an answer.
4. **Mark:** each written answer is marked in the background. The last one, the summary and the manager's email run after the final answer.
5. **Safety net:** opening a report finishes anything left; so does the 5 minute sweep.

**Limits:** at most 10 AI calls a test (`claim_applicant_ai_call`); the manager email is claimed once (`manager_notified_at`); everything is deleted 12 months after the invite.

## Also changed in this work

- **Drag to reorder everywhere** (`lib/use-drag-reorder.ts`, `lib/reorder.ts`): the staff quiz "Put in order" questions (`components/quiz/QuizRun.tsx`, desktop and mobile), the mobile Recipe Order challenge, and the applicant ordering tasks. A mouse drags the row, a finger the grip; arrows stay for keyboards and screen readers. The staff desktop has no other ordering screen, so nothing was left for later.
- **Email links on a preview open the preview** (`emailLinkOrigin()` in `lib/site-url.ts`), for this project's `*.serve-by-example-ai.pages.dev` hosts only.
- **`requireManager()` returns `onTrial`**, and `lib/notifications/brevo.ts` has `sendTransactionalEmail()`.
- **Geo-block:** `/apply/` is open from every country (`publicPrefixes` in `lib/geo-config.ts`).
- **Public pages:** plan cards, the comparison table and `/roadmap` list Applicant Testing; `/privacy` has section 12 for applicants.

## Cost and scale

About 9,000 input and 1,000 output tokens a test, measured from the prompts: about US$0.0014 a test at the third party listed `gpt-6-luna` price, US$0.003 at the 10 call cap. It grows in a straight line and the allowance caps it: 500 Commercial venues sending every test is about US$28 a month. Marking never sits on the applicant's path; OpenAI rate limits only delay a report. Cloudflare scales out; Supabase is the part to watch.

## Marketing pages (2026-10-27, after release)

Applicant Testing went onto the public site the same day, following the claims rule in `docs/MARKETING_SITE.md` §3.

| Where | What |
|---|---|
| `/applicant-testing` (new) | Landing page for searches such as "hospitality pre-employment test" and "bartender skills test": the report and phone mockup, the four parts, the four roles, the report, how it works, fairness, and an FAQ with FAQPage JSON-LD. The example situation on it was written for the page and is not in the test. In `app/sitemap.ts`, `public/llms.txt`, the footer and the marketing e2e routes |
| Home | A third "For hiring" item in the dark panel, linking to the page, and one FAQ |
| `/platform` | A Hiring media row (report with the ordering task on a phone), with a sub-nav entry |
| `/how-it-works` | A Hiring ruled list before the closing band |
| `/for-venues`, the four `/solutions` pages, `/vs-generic-lms` | One line each, and a Hiring row in the comparison |

**Mockups** in `public/shots/`: `console-applicant-report`, `phone-applicant-order`, `phone-applicant-written`, and `applicant-devices` (laptop and two phones, not on a page yet, kept for socials and the sales sheet). Made from a test sent to the QA address as "Jordan Lee". `scripts/device-mockups.mjs` gained an `applicant <link>` command (the owner takes the test by hand and presses Enter to capture), a `console-applicant-report` capture, and a visible browser that uses installed Chrome without the automation flag, because Cloudflare's human check (Turnstile error 600010) failed in Playwright's Chromium.

**Fixed along the way**
- **Book-a-call button on the applicant's test.** The floating "Book a free 15-min call" button showed on `/apply/[token]` in production. It is now hidden on `/apply` and `/notifications` (`components/FloatingBookCallButton.tsx`).
- **Sign-in loop.** A session ended on the server (its refresh token revoked) kept a valid access token for up to an hour. `middleware.ts` trusts `getClaims()`, so `/login` sent it into the app, whose pages call `getUser()`, refuse it and send it back to `/login`: the browser bounced until the token expired. `/login` now confirms with `getUser()` before forwarding a signed-in visitor and, if Auth refuses, signs the browser out locally and shows the form. One Auth call, on `/login` only.
- **`robots.ts`** now names the AI search crawlers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot) instead of GPTBot and ClaudeBot, matching Cloudflare's AI Crawl Control, which blocks the AI training crawlers on purpose (checked 2026-10-27: Googlebot 158 of 159 requests allowed).
- **`/solutions/pub-groups`** said managers "are alerted before anything lapses". Certificate expiry emails aren't built, so it now says each certificate's expiry date sits on the Compliance tab.

## Known limits

- A determined applicant can block the browser's paste and time-away counts; the server's time per answer can't be changed. That's why they're signals.
- The privacy policy doesn't list Brevo in its main sharing section (it's named in the applicant section only). Older gap, not from this work.
- The AI summary and marks have only been tried on the owner's own tests so far.
- No automated end to end test of the applicant flow yet.

## Open items (in `To_do_list.md`)

- Marketing plan artifacts for Applicant Testing (the marketing pages are done).
- An end to end test of the applicant flow.
