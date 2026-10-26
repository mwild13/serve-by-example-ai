# Applicant Testing: Serve By Example

Companion to `CLAUDE.md`, not a replacement. Where the two conflict, `CLAUDE.md` wins. Status on 2026-10-26: **Phases 1 to 6 built** (migration `20261104_applicant_testing.sql`, run 2026-10-26; engine, console API, emails, the applicant's pages, AI marking and the summary). Phases 7 and 8 done too: plan cards, comparison table and roadmap list it, and the privacy policy covers applicants. Not yet: tried end to end on the preview, and the kitchen and management content. Bar and floor written scenarios approved 2026-10-26 (`docs/Applicant Testing/written-batch-1.md`), so **bar and floor tests can be sent**. No track can be sent until its content exists (§6a). This file is the spec each build phase works from. Update it as each phase lands.

## 1. What it is

A tab in the Manager Console where a manager emails a job applicant a link to a test of about 30 minutes. The test is built from SBE's own training engine: module quiz questions, an order-of-operations task, and written scenarios scored by AI. The manager gets a report with scores, the applicant's reasoning in their own words, and how each answer was produced.

- **Who it's for:** chefs, bar staff, floor staff and managers applying for a hospitality job in Australia.
- **Where it works:** any venue type (hotel, bar, restaurant, dive bar, national group). Only content that is true in every venue is used.
- **Nav:** a **Hiring** group below Performance, item **Applicant Testing**, section id `applicants`.
- **Plans:** Boutique (`venue_single`) and Commercial (`venue_multi`), with a monthly allowance. Pro sees the tab with an upgrade panel.
- **Applicants are not users.** No Supabase Auth account, no `profiles` row, no seat, nothing in staff counts, leaderboards or analytics.

## 2. The applicant's experience

1. An email from "[Venue] via Serve By Example", reply-to the manager. The manager's intro, a Start button, the expiry date (14 days), and one line on what is collected and why.
2. **Welcome screen:** venue name, intro, "This takes about 30 minutes. There is no time limit, so take the time you need to show how you think." Consent checkbox with the collection notice. No Turnstile: the link's 256-bit token is the key, and the routes are rate limited per link, per IP and overall.
3. **One item per screen.** A quiet progress line ("Part 2 of 5: Knowledge for the role · Question 3 of 8"). No timer, no score, no going back.
4. They can close the page and come back to the same link until they submit or it expires.
5. **Finished screen:** "Thanks. [Venue] will be in touch." No results are shown to the applicant.

Default intro, editable by the manager per invite:

> Thank you for your interest in joining [Venue]. We'd like to see how you approach the work: how you think through a busy service, look after guests and keep people safe. This takes about 30 minutes, and there is no time limit. There are no trick questions. Answer the way you would on shift. It helps us get to know your strengths before we meet.

## 3. Tracks and sections

Four tracks: `bar`, `floor`, `kitchen`, `management`. Each test is drawn from a pool (`drawTest(track, seed)`), so no two applicants see the same set.

| # | Section | Content | Scored by | About |
|---|---|---|---|---|
| 1 | Core hospitality | 10 multiple choice from modules 8, 11, 15, 16, 17, 18, 21, 22, 24, 25. Kitchen: 11, 16, 17, 18, 21, 25 (no RSA, ice well, ice scoop or greeting) | Answer key | 6 min |
| 2 | Role knowledge | 8 multiple choice. Bar: 1, 3, 26, 31, 33. Floor: 9, 10, 23, 29, 36, 38. Kitchen: new bank. Management: new bank plus 19, 20 | Answer key | 5 min |
| 3 | Order of operations | 2 tasks, put 5 or 6 actions in order, from the reviewed `order_steps` questions in the track's modules (role modules first) | Rule (partial credit by distance) | 3 min |
| 4 | Written scenarios | 4 "what would you do, and why" prompts | AI against a rubric: process, guest care, safety, judgement | 12 min |

Weights: core 25, role 25, order 10, written 40.

**No Live Guest** (owner decision, 2026-10-26). A guest that answers back gives each applicant a different conversation, judged by AI, which is hard to compare fairly or defend in a hiring decision. It also doesn't stop copied answers, costs the most AI per test, and is awkward on a phone for someone new to it. The written scenarios show reasoning on the same footing for everyone. It may come back later as an optional second stage for a shortlist.

**Content rules**
- Only ids listed in `lib/applicant/content.ts` (flagged generic). No brand content, no Venue Content, no single venue's practice.
- Where practice differs between venues (schedules, pour sizes, layouts, sign-off rules), test the principle, not one number.
- Every item has a stable id. Never reuse an id for different content.
- New content to write: about 40 kitchen questions, 40 management questions, and 24 scenario prompts (6 per track) with rubrics. The owner reviews them one or two batches at a time.

## 4. Scoring and the report

**Marking written answers** (`lib/applicant/marking.ts`). One AI call per answer. The marker gets the scenario and the prompt's marking guide (ours, in the system message) and the applicant's answer (fenced as untrusted). It marks process, guest care, safety and judgement from 1 to 5, lists which guide points the answer covered, and writes a line on what was strong, what was missing, and a question for the interview. The score is worked out in code (`scoreFromMarks()`: all 1s is 0, all 5s is 100), never taken from the model. A red flag caps safety or judgement at 2. The marker is told never to mark down spelling, grammar or English as a second language, that length earns nothing, and to credit any reasonable approach that meets the principle.

**When it runs.** Each written answer is marked after the response has gone (`afterResponse()`, Cloudflare `waitUntil`), so the applicant never waits on AI. The last one is marked with the summary once the test is finished, then the manager is emailed. `completeTest()` does whatever is left and is safe to run twice; opening a report (`GET /api/management/applicants/[id]`) runs it if anything is unmarked or the summary is missing. Every AI call is taken from the test's budget first (`claim_applicant_ai_call`, `AI_CALL_CAP` = 10: 4 marks, 1 summary, room for retries). The manager email is claimed on `manager_notified_at`, so it goes once.

**The summary** (`lib/applicant/summary.ts`): up to three strengths, three things to explore and three interview questions, from the section scores, the written answers with the marker's notes, and the quiz questions missed. It never sees the answer signals, and is told to write about the work, never the person, and never to say whether to hire.

- Section scores 0 to 100, then an overall score from section weights (kept in `lib/applicant/scoring.ts`), shown as a band: Strong, Solid, Developing, Not yet.
- On submit, one AI call writes 3 strengths, 3 things to explore and 3 suggested interview questions, drawn only from the answers. `AU_WRITING_RULES`, `capText()`, `plainDashes()`, model from `CHAT_MODEL_PARAMS`.
- The report shows every answer in full: quiz picks, the order given and the written answers.
- The report states that it supports the manager's decision and doesn't make it. There is no automatic reject.

## 5. Answer signals

What the manager sees beside each answer, and how it's collected:

| Signal | Source |
|---|---|
| Time to answer | Server: `served_at` and `answered_at`. Can't be changed by the browser |
| Time on the page and time away | Browser: `visibilitychange` and `blur` |
| Pastes and characters pasted | Browser: `paste` event. Pasted text is still accepted |
| Typing time against answer length | Browser: first and last keystroke |
| Gaps between sessions | Server: a return to the link after closing it |

- Thresholds live in one place (`lib/applicant/integrity.ts`). Starting points: a written answer in under 4 seconds, a paste over 80 characters, more than 60 seconds away from the page.
- Flags are plain sentences ("Pasted 410 characters", "Away from the page for 4 minutes"), plus one overall line ("Most answers typed, 1 paste, typical pace").
- No "cheating" verdict anywhere. The wording says these are things to ask about in the interview, not proof.
- Answer keys and rubrics never reach the browser. Each item comes with the one after it (the question only), so the browser shows the next item the moment an answer is given while the answer saves in the background, in order, with retries. The next item's clock starts when that answer reaches the server, so time per answer stays the server's. Each answer costs three database calls: the token lookup, the insert, and the move on (which returns the row).

## 6. Data model

Migration `supabase/migrations/20261104_applicant_testing.sql` (rollback in `supabase/rollbacks/`). All tables: RLS on, no client access, written only by API routes on the service role (see `docs/DATABASE_SCHEMA.md` §5).

- `applicant_tests`: one per invite. `org_id`, `venue_id` (cascade), `created_by`, `applicant_name`, `applicant_email`, `track`, `intro_message`, `token_hash` (unique), `status` (`invited`/`started`/`submitted`/`expired`/`withdrawn`), `run_state`, `position`, `consent_at`, `sent_at`, `started_at`, `submitted_at`, `expires_at`, `report`.
- `applicant_answers`: one per item. `test_id` (cascade), `item_key`, `section`, `answer`, `correct`, `score`, `evaluation`, `served_at`, `answered_at`, `active_ms`, `away_ms`, `away_count`, `paste_count`, `pasted_chars`, `typing_ms`. Unique (`test_id`, `item_key`).
- `applicant_test_usage`: tests sent per paying account (the venue's `owner_user_id`, stored as `account_id`) per Sydney month. `claim_applicant_test(account, month, limit)` takes one atomically and returns false once the allowance is used. A deleted test is never given back.
- `applicant_tests.current_served_at` is when the current item was sent; it is copied onto the answer, so time to answer is the server's.
- Kept 12 months from the invite, then deleted by the pg_cron job `trim-applicant-tests`. A venue deletes one applicant's data with a DELETE on `applicant_tests`, which cascades.

## 6a. Engine (`lib/applicant/`)

| File | Does |
|---|---|
| `blueprint.ts` | Tracks, sections and weights, item keys (`core:15:mc3`, `written:<id>`), `drawTest()`, `progressAt()` |
| `content.ts` | Which modules, banks and prompts each track draws from (`trackSources()`), and `findSourceQuestion()` for grading. Server only |
| `questions/kitchen.ts` | Kitchen role bank: 34 questions in four topics (cooking and cooling, storage and deliveries, the line and the pass, safety and hygiene), each its own source so a chef's role quiz is spread across them. Drafted, `reviewed: false`. Review sheet: `npm run applicant:review -- --bank kitchen` |
| `questions/management.ts` | Management role bank, same shape. **Not drafted yet** |
| `questions/written.ts` | Written scenarios. Bar and floor, six each, approved. Review sheet: `npm run applicant:review` |
| `marking.ts`, `summary.ts`, `after-response.ts` | AI marking, the summary, and running them after the response |
| `scoring.ts` | `scoreQuizItem()` (ordering gets part marks), `sectionScores()`, `overallScore()`, `bandFor()` |
| `integrity.ts` | `readSignals()` (trims the browser's report to the server's times), `answerFlags()`, `summaryLine()`, all thresholds in `SIGNAL_THRESHOLDS` |
| `token.ts` | Link tokens: 32 random bytes, SHA-256 hash stored |

Quizzes never ask True/False (a coin toss). The role quiz must mix at least 3 sources. `drawTest()` refuses a test with any section short, so a track can't be offered until its content exists.

**Readiness today:** Bar and Floor are ready (a test checks this). Kitchen needs batch 2 (its written scenarios) and batch 3 (its question bank) approved. Management needs batch 2; its own bank is optional and not drafted yet.

## 7. Routes

**Console** (`app/api/management/applicants/`), each starting with `requireManager()`. Tests belong to the venue owner's account (`account_id`), and every read and write filters on it.
- `GET ?venueId=`: the venue's tests, newest first, the month's allowance (`lib/applicant/allowance.ts`), which tracks are ready, and the default intro. `{ setupNeeded: true }` until the migration is run.
- `POST { venueId, applicantName, applicantEmail, track, introMessage? }`: refuses a track that can't be dealt yet (`TRACK_NOT_READY`) and a second open test for the same email (`ALREADY_INVITED`), then takes one from the allowance (`ALLOWANCE_USED`), deals the test, and emails the link. Limit 10 a minute.
- `PATCH { id, action }`: `resend` makes a new link (only the hash is kept, so the old one stops working) with 14 fresh days, keeping answers so far; `withdraw` closes the test.
- `DELETE ?id=`: owners only. Erases the test, its answers and its conversation.
- `GET /api/management/applicants/[id]`: the report. Scores are worked out from the answers each time (`computeReport()`), so AI scores that land later show without a second save. `reportItems()` gives each answer as text: the question, what was given, the right answer, the time and the signals.
- Duty managers can list, invite, resend and withdraw.

**Emails** (`lib/applicant/emails.ts`, sent with `sendTransactionalEmail()` in `lib/notifications/brevo.ts`): the invite, from "[Venue] via Serve By Example" with replies to the manager; and a note to the manager who sent it when the applicant finishes, linking to `/management/dashboard?tab=applicants&test=<id>` (the tab is Phase 6).

**Applicant** (`app/api/applicant/[token]/`), no sign-in. Every route starts with `openApplicantTest()` (`lib/applicant/public-route.ts`): limits per IP, overall and per link, the token's shape, then the lookup by hash.
- `start { consent: true }`: records consent and serves the first item.
- `next`: the item on screen now, for a return visit. A POST, because serving starts the item's clock and counts a visit after a break of 15 minutes or more.
- `answer { position, answer, signals }`: quiz and ordering items are scored here; written answers are saved with no score and marked in the background. The answer after the last item finishes the test and stores the report.
- Page `/apply/[token]` (`app/apply/`, `components/applicant/ApplicantTest.tsx`, `app/styles/applicant.css`): `noindex`, `no-referrer`. Opening the link changes nothing, so a mail scanner can't start a test. Open from any country (`publicPrefixes` in `lib/geo-config.ts`).
- Signals are measured by `useAnswerSignals()` (`lib/applicant/use-answer-signals.ts`). Pasting still works; it is only counted.
- At most 10 AI calls per test (4 marks and 1 summary normally), counted against the test, not the manager's daily AI allowance.

## 7a. Scale and cost (checked 2026-10-26)

- **AI:** about 9,000 input and 1,000 output tokens a test (4 marks, 1 summary), measured from the prompt sizes. At third party listed `gpt-6-luna` prices (US$0.10 and US$0.50 a million) that is about US$0.0014 a test, US$0.003 at the 10 call cap. It grows in a straight line with tests sent, and the plan allowance caps tests: 500 Commercial venues sending every test is 20,000 tests, about US$28 a month.
- **Bursts:** marking is off the applicant's path. If OpenAI rate limits a burst, the SDK retries twice, and anything still unmarked is finished when the report is opened.
- **Database:** three calls an answer, all on indexed keys. Cloudflare Workers scale out on their own; Supabase is the part to watch at high volume.

## 8. Privacy and fairness

- Collection notice and consent at start (Australian Privacy Principle 5): who collects it (the venue, through SBE), why, how long it's kept, how to ask for it to be deleted.
- No questions about age, background, health, family or other personal details.
- SBE does not use applicant answers to train AI.
- The privacy policy has an applicant section (section 12 of `/privacy`, added 2026-10-26), and the retention schedule and OpenAI lines mention applicant tests.

## 8a. Security review (2026-10-26)

| Risk | How it's handled |
|---|---|
| Guessing a link | 256-bit random token, only its SHA-256 hash stored; limits per IP, per link and overall (`public-route.ts`) |
| Replaying or double-sending an answer | Saved only if `position` hasn't moved; (`test_id`, `position`) unique |
| Seeing answers ahead | One item at a time; answer keys and marking guides never leave the server |
| Prompt injection | Answers fenced as untrusted; scores computed in code (`scoreFromMarks()`); the summary never sees signals |
| AI cost | `claim_applicant_ai_call` caps each test at 10 calls; tests are capped by the plan allowance |
| Email abuse | Venue plans only, monthly allowance, 10 invites a minute, every typed value escaped |
| Cross-venue reads | Every console query filters on `account_id`; delete is owners only |
| Mail scanners | Opening the link changes nothing; starting needs the consent tick |
| Link leaking | `no-referrer`, `noindex` |

**Known limit:** the browser's paste and away-from-page counts can be blocked by a determined applicant. The server's time per answer can't. That is why the report presents them as signals to ask about, never as proof.

## 9. Build phases

0. Spec (this file) and content for owner review. Spec done; content not started.
1. Migration. Run 2026-10-26 and checked.
2. Test engine in `lib/applicant/`, unit tested. Done.
3. Console API and emails. Done.
4. Applicant pages and public API. Done.
5. AI marking of written answers and the written summary. Done. Not yet tried against the live model.
6. Console tab. Done: the Hiring group, `ApplicantTestingPanel.tsx`.
7. Plan allowances, pricing and features copy. Done: `PricingPlans.tsx`, `CompareMatrix.tsx`, `/roadmap`.
8. Privacy policy, security review. Done (§8, §8a).
9. Release.

Full plan with reuse notes: `/Users/mitchellwildman/.claude/plans/claude-someone-came-polymorphic-engelbart.md`.

## 10. Open decisions

- Monthly allowance numbers (suggested Boutique 10, Commercial 40, trial 2).
- Final nav and page wording ("Applicant Testing" or "New Applicant Testing").
