# Applicant Testing: Serve By Example

Companion to `CLAUDE.md`, not a replacement. Where the two conflict, `CLAUDE.md` wins. Status on 2026-10-26: **Phases 1 and 2 built** (migration `20261104_applicant_testing.sql`, not yet run; engine in `lib/applicant/`). No routes or screens yet. This file is the spec each build phase works from. Update it as each phase lands.

## 1. What it is

A tab in the Manager Console where a manager emails a job applicant a link to a test of about 30 minutes. The test is built from SBE's own training engine: module quiz questions, an order-of-operations task, written scenarios scored by AI, and one Live Guest conversation. The manager gets a report with scores, the applicant's reasoning in their own words, and how each answer was produced.

- **Who it's for:** chefs, bar staff, floor staff and managers applying for a hospitality job in Australia.
- **Where it works:** any venue type (hotel, bar, restaurant, dive bar, national group). Only content that is true in every venue is used.
- **Nav:** a **Hiring** group below Performance, item **Applicant Testing**, section id `applicants`.
- **Plans:** Boutique (`venue_single`) and Commercial (`venue_multi`), with a monthly allowance. Pro sees the tab with an upgrade panel.
- **Applicants are not users.** No Supabase Auth account, no `profiles` row, no seat, nothing in staff counts, leaderboards or analytics.

## 2. The applicant's experience

1. An email from "[Venue] via Serve By Example", reply-to the manager. The manager's intro, a Start button, the expiry date (14 days), and one line on what is collected and why.
2. **Welcome screen:** venue name, intro, "This takes about 30 minutes. There is no time limit, so take the time you need to show how you think." Consent checkbox with the collection notice. Turnstile on Start.
3. **One item per screen.** A quiet progress line ("Section 2 of 5"). No timer, no score, no going back.
4. They can close the page and come back to the same link until they submit or it expires.
5. **Finished screen:** "Thanks. [Venue] will be in touch." No results are shown to the applicant.

Default intro, editable by the manager per invite:

> Thank you for your interest in joining [Venue]. We'd like to see how you approach the work: how you think through a busy service, look after guests and keep people safe. This takes about 30 minutes, and there is no time limit. There are no trick questions. Answer the way you would on shift. It helps us get to know your strengths before we meet.

## 3. Tracks and sections

Four tracks: `bar`, `floor`, `kitchen`, `management`. Each test is drawn from a pool (`drawTest(track, seed)`), so no two applicants see the same set.

| # | Section | Content | Scored by | About |
|---|---|---|---|---|
| 1 | Core hospitality | 10 multiple choice from modules 8, 11, 15, 16, 17, 18, 21, 22, 24, 25 | Answer key | 6 min |
| 2 | Role knowledge | 8 multiple choice. Bar: 1, 3, 26, 31, 33. Floor: 9, 10, 23, 29, 36, 38. Kitchen: new bank. Management: new bank plus 19, 20 | Answer key | 5 min |
| 3 | Order of operations | 2 tasks, put 5 or 6 actions in order, from the reviewed `order_steps` questions in the track's modules (role modules first) | Rule (partial credit by distance) | 3 min |
| 4 | Written scenarios | 3 "what would you do, and why" prompts | AI against a rubric: process, guest care, safety, judgement | 9 min |
| 5 | Live Guest | 1 conversation, 3 or 4 replies, difficulty 2, no reveal | Live Guest engine | 6 min |

Live Guest briefs per track: bar `last-schooner` or `heavy-hand`; floor `cold-parmy` or `nut-allergy`; kitchen a new colleague brief (a server bringing in a late allergy change); management `backing-the-junior` or `till-short`.

**Content rules**
- Only ids listed in `lib/applicant/content.ts` (flagged generic). No brand content, no Venue Content, no single venue's practice.
- Where practice differs between venues (schedules, pour sizes, layouts, sign-off rules), test the principle, not one number.
- Every item has a stable id. Never reuse an id for different content.
- New content to write: about 40 kitchen questions, 40 management questions, 24 scenario prompts (6 per track) with rubrics, and 1 kitchen colleague brief. The owner reviews them one or two batches at a time.

## 4. Scoring and the report

- Section scores 0 to 100, then an overall score from section weights (kept in `lib/applicant/scoring.ts`), shown as a band: Strong, Solid, Developing, Not yet.
- On submit, one AI call writes 3 strengths, 3 things to explore and 3 suggested interview questions, drawn only from the answers. `AU_WRITING_RULES`, `capText()`, `plainDashes()`, model from `CHAT_MODEL_PARAMS`.
- The report shows every answer in full: quiz picks, the order given, written answers, and the Live Guest transcript.
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
- Answer keys, rubrics and Live Guest briefs never reach the browser. The next item is sent only after the last answer is saved.

## 6. Data model

Migration `supabase/migrations/20261104_applicant_testing.sql` (rollback in `supabase/rollbacks/`). All tables: RLS on, no client access, written only by API routes on the service role (see `docs/DATABASE_SCHEMA.md` §5).

- `applicant_tests`: one per invite. `org_id`, `venue_id` (cascade), `created_by`, `applicant_name`, `applicant_email`, `track`, `intro_message`, `token_hash` (unique), `status` (`invited`/`started`/`submitted`/`expired`/`withdrawn`), `run_state`, `position`, `consent_at`, `sent_at`, `started_at`, `submitted_at`, `expires_at`, `report`.
- `applicant_answers`: one per item. `test_id` (cascade), `item_key`, `section`, `answer`, `correct`, `score`, `evaluation`, `served_at`, `answered_at`, `active_ms`, `away_ms`, `away_count`, `paste_count`, `pasted_chars`, `typing_ms`. Unique (`test_id`, `item_key`).
- `applicant_guest_sessions`: same shape as `live_guest_sessions`, keyed to the test.
- `applicant_test_usage`: tests sent per paying account (the venue's `owner_user_id`, stored as `account_id`) per Sydney month. `claim_applicant_test(account, month, limit)` takes one atomically and returns false once the allowance is used. A deleted test is never given back.
- `applicant_tests.current_served_at` is when the current item was sent; it is copied onto the answer, so time to answer is the server's.
- Kept 12 months from the invite, then deleted by the pg_cron job `trim-applicant-tests`. A venue deletes one applicant's data with a DELETE on `applicant_tests`, which cascades.

## 6a. Engine (`lib/applicant/`)

| File | Does |
|---|---|
| `blueprint.ts` | Tracks, sections and weights, item keys (`core:15:mc3`, `written:<id>`, `guest:<id>`), `drawTest()`, `progressAt()` |
| `content.ts` | Which modules, banks, prompts and guests each track draws from (`trackSources()`), and `findSourceQuestion()` for grading. Server only |
| `questions/kitchen.ts`, `questions/management.ts`, `questions/written.ts` | The new content. **Empty until the owner reviews it** |
| `scoring.ts` | `scoreQuizItem()` (ordering gets part marks), `sectionScores()`, `overallScore()`, `bandFor()` |
| `integrity.ts` | `readSignals()` (trims the browser's report to the server's times), `answerFlags()`, `summaryLine()`, all thresholds in `SIGNAL_THRESHOLDS` |
| `token.ts` | Link tokens: 32 random bytes, SHA-256 hash stored |

Quizzes never ask True/False (a coin toss). The role quiz must mix at least 3 sources. `drawTest()` refuses a test with any section short, so a track can't be offered until its content exists.

**Readiness today:** Bar and Floor can fill every section except the written scenarios. Kitchen and Management also need their role banks; Kitchen also needs its Live Guest brief.

## 7. Routes (planned)

**Console**, each starting with `requireManager()` and `assertOwnsVenue()`:
- `/api/management/applicants`: GET list, POST invite (checks the allowance), PATCH `resend`/`withdraw`/`extend`, DELETE (owners only).
- `/api/management/applicants/[id]`: GET the report.

**Applicant**, no sign-in. Each checks the token hash, status and expiry first, and is rate limited per token and per IP:
- Page `/apply/[token]` (own layout, `app/styles/applicant.css`, `noindex`).
- `/api/applicant/[token]/start`, `next`, `answer`, `guest/turn`, `submit`.
- About 9 AI calls per test at most, counted against the test, not the manager's daily AI allowance.
- `/apply` and `/api/applicant` skip the sign-in check and are open from any country, like `/notifications/unsubscribe`.

## 8. Privacy and fairness

- Collection notice and consent at start (Australian Privacy Principle 5): who collects it (the venue, through SBE), why, how long it's kept, how to ask for it to be deleted.
- No questions about age, background, health, family or other personal details.
- SBE does not use applicant answers to train AI.
- The privacy policy gets an applicant section before release.

## 9. Build phases

0. Spec (this file) and content for owner review. Spec done; content not started.
1. Migration. Written, not yet run.
2. Test engine in `lib/applicant/`, unit tested. Done.
3. Console API and emails.
4. Applicant pages and public API.
5. AI scoring, Live Guest and the report.
6. Console tab.
7. Plan allowances, pricing and features copy.
8. Privacy policy, security review.
9. Release.

Full plan with reuse notes: `/Users/mitchellwildman/.claude/plans/claude-someone-came-polymorphic-engelbart.md`.

## 10. Open decisions

- Monthly allowance numbers (suggested Boutique 10, Commercial 40, trial 2).
- Final nav and page wording ("Applicant Testing" or "New Applicant Testing").
