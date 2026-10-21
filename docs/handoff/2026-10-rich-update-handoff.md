# Handoff: the Rich update, October 2026

Work from 2026-10-19 to 2026-10-20 is recorded here. Earlier work is in `docs/handoff/2026-10-week4-handoff.md`. Open items are in `To_do_list.md`.

The Rich update is the 16-phase learning upgrade that came from Richie's tester feedback ("repetitive"). It was built on `preview/rich-update` and released to `main` in stages; everything below is on `main` from 2026-10-20.

- **The plan:** `docs/Rich Update/LEARNING_UPGRADE_RESEARCH.md`.
- **The record of each phase, with the decisions:** `docs/Rich Update/the-rich-update-10-26.md`.
- **The owner's checklist and the human test:** `docs/Rich Update/launch-check.md`.
- **How each part works:** `docs/STAFF_APP.md`, `docs/MANAGER_CONSOLE.md`, `docs/DATABASE_SCHEMA.md`, `docs/MASTERY_ENGINE.md`.

## What staff and managers have now

Three levels: **Learn** (modules), **Drill** (mixed practice), **Live Guest** (conversations).

| # | Phase | What it is | State |
|---|---|---|---|
| 1 | Groundwork | Measures and queries (`LEARNING_METRICS.md`, `supabase/queries/learning.sql`) | Done |
| 2 | Question engine | Six question formats, variants of the same fact, a wrong answer comes back later | Live |
| 3 | Questions | Written and reviewed by the owner in six batches | Live |
| 4 | Learn cards | Short cards before each module quiz | Live |
| 5 | Skill check and test-out | Skip what you already know | Live |
| 6, 7 | Live Guest | 60 guests in conversation, the four dials (guest, speed, money, safety), difficulty that follows progress | Live |
| 8 | Plans and retiring old screens | Live Guest on venue plans only; Scenario Training and the Arena retired, their results kept | Live |
| 9 | Pictures | Style sheet and picture list written; drawing parked for the owner in Claude Design (`image-style-sheet.md`) | Parked |
| 10 | Mixed drills | Ten questions across started modules, never two in a row from one module | Live |
| 11 | Venue content | Managers add specs, specials and 86'd items (typed or from a menu photo); the AI drafts questions; approved ones go into drills | Live |
| 12 | Pre-shift drill and shift streak | Six questions before a shift, a streak that counts shifts with two freezes, web push reminders on shift days | Live |
| 13 | Launch check | Privacy policy, the Dan taster conversation for Pro and free, marketing copy fixed | Done |
| — | Live Guest tune-up | Strangers are "Guest" until they give a name; 3 or 4 replies; each guest line opens a door to a help not yet found; the reveal ticks off the helps | Live |
| 14 | Live Guest voice | Push to talk: speak, check the words, send; each guest read aloud in their own Australian voice. No audio stored | Live |
| 15 | Saturday Rush | A timed Saturday night shift in twelve calls, a bar-back to call, scored on the four dials. No AI | Live |
| 16 | Team features | Manager Console "This Week": a team goal, a guest of the week, a printable briefing card. Team totals only | Live |

## Migrations

All in `supabase/migrations/`, each with a rollback in `supabase/rollbacks/`. Every one is additive, and the code works before it is run.

| Migration | State |
|---|---|
| `20261020_question_engine.sql` to `20261028_saturday_rush.sql` | Run (the last four confirmed 2026-10-20) |
| `20261029_team_week.sql` | Run (confirmed 2026-10-21) |

## Settings and scheduled jobs

- **Cloudflare secrets** (Production and Preview): `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_JWK`, set 2026-10-20, made with `node scripts/vapid-keys.mjs`. `VAPID_SUBJECT` is optional (defaults to `mailto:info@servebyexample.co`). Push reminders reuse `NOTIFICATIONS_SECRET`.
- **AI models** are set once in `lib/openai.ts`: `CHAT_MODEL_PARAMS` for text, `VOICE_MODELS` for transcription and speech.
- **pg_cron jobs:**
  - `send-shift-reminders`, every 15 minutes, calls `/api/cron/reminders`.
  - `trim-quiz-answer-log`, nightly, deletes answers older than 180 days (from `20261029`).
  - The weekly digest and reminder emails, as before.

## Cost

- A Live Guest text conversation costs about US$0.001 to US$0.002. A voice conversation costs about 1.5 US cents.
- Saturday Rush, drills, the shift streak and team features cost nothing in AI.
- **Caps:**
  - The daily AI allowance (30 a day free, 300 paid).
  - 80 voice clips a person a day (`voice_usage_daily`).
  - 12 Live Guest conversations an hour.
- **Worst case:** a 15-person venue using Live Guest an hour a day each costs about US$7 a month, against the A$79 plan. Realistic use is under A$2.

## Checks done by Claude Code

- 268 unit tests. Lint shows only the four old warnings. Also clean: knip, the CSS lints and the production build.
- **Played in a browser** on throwaway pages with sample data, at desktop and phone width, light and dark:
  - Saturday Rush.
  - The This Week panel, its printed card, and the Home card.
- **Saturday Rush balance**, from 3,000 simulated shifts per playing style:

  | Playing style | Typical score |
  |---|---|
  | Best calls | 86 |
  | Sensible calls | 69 |
  | Random calls | 33 |
  | Worst calls | 9 |

## Not tested against the live services

These need a real phone, the live OpenAI key or real team data. They are the owner's human checks, listed in `launch-check.md`.

1. **Live Guest voice** on an iPhone and an Android phone, in a noisy bar: recording, the words written out, the guest's voice.
2. **Menu photo reading** in Venue Content: it needs the chat model to accept images.
3. **Push reminders** on the installed app: pick a time a little ahead, check the notification arrives and opens the pre-shift drill.
4. **Live Guest tune-up:** talk to Linh (the shouted coffee order) again. She should be "Guest" until you ask her name, stop repeating herself, and give you openings for the helps.
5. **This Week**, once `20261029` is run: set a goal and a guest as a manager; check the Home card and Live Guest as staff. Get the same question wrong on two staff accounts, then check it appears on the briefing card.
6. **The human test:** one venue manager or staff member who hasn't seen it does the staff list in one sitting (`launch-check.md`).

## Open after the update

- **Phase 9 pictures:** drawn by the owner in Claude Design from `docs/Rich Update/image-style-sheet.md`, then built in as SVG parts.
- **Redesign the desktop staff dashboard:** done 2026-10-21, see `docs/handoff/2026-10-21-staff-desktop-handoff.md`.
- **Show the manager who has shift reminders on** (`To_do_list.md`).
- **Record what each AI call costs, and set an OpenAI spending limit** (`To_do_list.md`, Code next up).
- **Role-based paths:** Stages 1 and 2 of that plan (less repetition, venue content) are what this update did. Stage 3 waits on the human test.
