# Handoff: November 2026, Week 1

Work from 2026-11-03 to 2026-11-07: the Instagram launch was pushed back, all 8 posts were rebuilt in Canva, Facebook was added to the plan, and database Disk I/O was investigated and cut (Part 5). Earlier work is in `docs/handoff/2026-10-week4-applicant-testing-handoff.md`. Open items are in `To_do_list.md`. No app code changed this week; Part 5 changed two cron jobs with a migration. The rules for all social work are in `AGENTS_SOCIALS.md`.

## Part 1: the launch moved to Thursday 5 November

- **Date:** 2026-11-03
- **Launch kit:** https://claude.ai/artifact/6ZybP94mGQUARCKuM8tEf6 (Version 16, private to the owner). It holds the 8 carousels, 3 Reel scripts, the 14-day calendar, DM and email scripts, the ads plan and the Facebook section.

The kit assumed a Sunday 1 November start. Nothing had been posted, so every date moved:

| | |
|---|---|
| Launch | Thu 5 Nov, Posts 3, 2 and 1 at 1, 1:30 and 2 pm. Pin Post 1 first. |
| Run | Thu 5 to Wed 18 Nov. Weekdays around 2 pm, Sundays around 7 pm, nothing Friday or Saturday night, at most 1 feed post a day after launch. |
| Outreach | DMs and emails start Mon 9 Nov, from info@servebyexample.co, by hand. |
| Boost | Thu 12 to Wed 18 Nov, A$10 a day, A$100 cap, on the best post. Runs on Instagram and Facebook (Advantage+ placements). |
| Review | Thu 19 Nov: the owner brings the numbers and we plan the next two weeks. |

There is no Meta Pixel. Tracking is by utm links in GA4: `utm_source=instagram` and `utm_source=facebook` for posts, `utm_source=meta` for the boost.

## Part 2: all 8 posts rebuilt in Canva

- **Date:** 2026-11-03 to 2026-11-04
- **Canva folder:** "Serve By Example - Master Files" (`FAHZ1pd2wsc`)
- **Images:** `~/Desktop/sbe-instagram/2026-11-05/`, 45 PNGs named `p1-1.png` to `p8-5.png`, all 1080x1440. The older PNGs in `~/Desktop/sbe-instagram/` are superseded.

Every post is a copy of "MASTER - 6 Slide Carousel" (the approved Post 1 style, header and footer locked), one design per post named "Post N - name". The owner approved the copy in chat before each build and each Canva commit.

| Post | For | Slides | Canva design | Keyword |
|---|---|---|---|---|
| 1 Know who's ready | Managers | 6 | copy of `DAHZ1yAVTsw` | |
| 2 Sharon's cold parmy | Staff and managers | 6 | in folder | |
| 3 7 things before their first Friday | Managers | 6 | `DAHZ3C7FzNo` | SOP |
| 4 Lipstick on the glass | Staff | 4 | in folder | |
| 5 When did you last check every RSA? | Managers | 6 | in folder | |
| 6 Too nervous to ask | Staff | 6 | `DAHZ3ZRKif0` | SOP |
| 7 Just shadow Jess tonight | Managers | 6 | `DAHZ3s-56Rs` | SOP |
| 8 What it costs | Managers | 5 | `DAHZ3jrNgVI` | PRICING |

- Post 8's prices were checked against `/membership` (`components/marketing/PricingPlans.tsx`) on 4 Nov. Re-check them the morning it posts (Tue 17 Nov).
- **No sign-off feature exists in the app.** An early Post 7 draft claimed one; it was removed. Never claim one.
- **What the owner caught,** now in the socials rules and memory: no phrase twice on one slide ("Comment SOP." above a "Comment SOP" button was called slop; the headline now makes the offer, "Free SOP.", and only the button names the keyword), no single word alone on a line, and screenshot crops measured from the source and checked at full size.
- How the Canva connector was driven (copy, merge, edit, crop maths, upload, export) is in the Claude memory `reference_canva_mcp_workflow.md`.

## Part 3: every post also goes to Facebook

- **Date:** 2026-11-04
- **Decision (owner):** post everything to the Facebook Page as well. The owner believes buyers (venue owners and managers) are more likely on Facebook than Instagram.

**Why it is worth it, and what to expect.** Cross-posting costs almost nothing: one post in Meta Business Suite, both accounts ticked. Owners over 35 lean to Facebook, and Australian hospo owners ask each other for advice in Facebook groups. A brand-new Page reaches very few people on its own, though. The value comes from groups, from the boost running on both platforms, and from looking like a real business when a buyer searches for us.

**Added to the kit (Version 15 and 16):**

- Retitled "Instagram and Facebook Launch Kit".
- **Five new before-launch jobs:**
  - j11: set up the Page (same profile photo, cover 1640x924, the bio, username @servebyexample, categories Software and Education, a Learn more button to the demo), then link Instagram in Business Suite.
  - j12: Business Suite Instant reply and two FAQs (cost, the free SOP). This answers Messenger for free, without ManyChat.
  - j13: comment and message filters on both platforms.
  - j14: check ManyChat's free plan (Part 4).
  - j15: join 5 to 10 Australian hospo groups (Part 4).
- **A Facebook caption for every post,** with its own copy button: hashtags dropped, "link in bio" swapped for a real `utm_source=facebook` link, and "swipe" changed to "open the photos".
- **Calendar:** posts and Reels go to Facebook at the same time; group posts on Wed 11 (the Post 3 checklist) and Wed 18 (the Post 5 RSA fix); the daily routine gains 5 minutes for Facebook.
- **Numbers:** a target of 25 Facebook followers, and the 19 Nov review compares the two platforms.
- **Facebook bio** (246 of 255 characters, in the kit with a copy button):

  > Staff training for Australian bars, restaurants and hotels. Short lessons and practice guests on the phone for your team, and a console that shows managers who is ready, whose RSA is due and who to hire. Try it free for 14 days: servebyexample.co

### Limits and moderation (in the kit under "Limits and moderation")

What we can do on each platform:

| | Instagram | Facebook Page |
|---|---|---|
| Message someone first | Yes, under 20 a day while new; our plan uses 10 to 15 | **No.** A Page can't start a Messenger chat. Cold outreach stays on email. |
| Reply after they message | Freely within 24 hours of their last message | Same |
| Private reply to a comment | One, within 7 days | One, within 7 days |
| Comment on others | 3 to 5 an hour, each written for that post | As the Page on other Pages; in groups as allowed by each group |
| Posts | Up to 1 feed post a day | Same as Instagram, plus the two group posts |

What others can leave on our accounts:

- **Instagram:** Hidden Words on (offensive comments and message requests), plus a custom list of spam words.
- **Facebook:** profanity filter on Medium, Moderation Assist hides comments with links, visitor posts off.
- **Handling comments:** hide spam and abuse; never hide honest criticism; answer it once, calmly, and offer to move it to email.

## Part 4: decisions for the owner

- **ManyChat's free plan may have shrunk.** Several 2026 reviews say it dropped to 25 contacts a month in March 2026; one still says 1,000. Check manychat.com/pricing before launch. If it's 25, the first 25 SOP or PRICING requests each month are automatic and the rest are answered by hand. Triggers go on Posts 3, 6 and 7 (SOP) and Post 8 (PRICING), each set up straight after the post goes live with "a specific post or reel".
- **Groups and the faceless brand.** Many groups only let personal profiles join and post, which puts the owner's name next to the brand. Either join as yourself, or stay faceless and use only groups that accept Pages.

## Part 5: database Disk I/O cut

- **Date:** 2026-11-06 to 2026-11-07
- **Migration:** `supabase/migrations/20261106_gate_cron_http_calls.sql`, run on production by the owner at about 10:55 UTC on 6 Nov and checked. Rollback: `supabase/rollbacks/20261106_gate_cron_http_calls_rollback.sql`.

**What we found.** Only read-only queries were run on production; nothing was reset.

- **The frequent writes were cron jobs doing nothing.** Five pg_cron jobs had made 5,211 runs since 18 Oct. Most came from `applicant-marking` (every 5 minutes, 288 a day) and `send-shift-reminders` (every 15 minutes, 96 a day). Each run called the app through pg_net, which writes a queue row, a `net._http_response` row and a `cron.job_run_details` row. Every response kept was a no-op: no applicant test was waiting and nobody had a push subscription.
- **pg_stat_statements' "written" counter misses most disk writes.** The checkpointer had written about 99,000 blocks (about 773 MiB) since June, against 12 MiB in that counter. Use `pg_stat_io`, `pg_stat_wal` and `pg_stat_checkpointer` to measure writes.
- **Most historical WAL came from Supabase Auth refreshing tokens** (46%), mostly from testing. It is near idle now: 8 refreshes in the day after the change.
- **The schema reads are PostgREST reloading its schema cache** after migrations and restarts, not a table scan. The `count_estimate` calls come from the Studio table editor. Neither needs a change.
- **`scenarios` is not a problem:** 320 rows, already indexed on `module_id`. No new index or keyset pagination is needed.
- **Correction to a claim made during the investigation:** on Postgres 17, `num_timed` in `pg_stat_checkpointer` also counts skipped checkpoints, so it says nothing about activity.

**What changed.** Both jobs keep their schedules, but Postgres only calls the route when there is work: a finished applicant test still waiting to be marked (the same test as `needsCompleting()`), or someone with a reminder time who has a browser subscribed. The routes still make the final decision. About 384 HTTP calls a day are gone. pg_cron still logs every run.

**Result.**

- No pg_net call since the change, and no cron failures.
- In the 22.8 hours from the baseline (half before the change): under 0.7 MiB of WAL, 1,069 blocks (8.4 MiB) written by the checkpointer, and 172 full-page writes, against a June to November average of about 590 a day.
- This is far too little to use up a Disk I/O budget. If the dashboard still shows high Disk I/O, it comes from Supabase's own work (backups, WAL archiving every 2 minutes, logs), not the app.

**Clean baseline for later comparison** (2026-11-06 22:41:33 UTC, after the change): `wal_bytes` 171,131,215; `wal_fpi` 82,327; checkpointer `buffers_written` 100,053; checkpointer fsyncs 75,281.

```sql
select now(), w.wal_bytes, w.wal_fpi, c.buffers_written, c.num_timed
from pg_stat_wal w, pg_stat_checkpointer c;
```

**Not done, on purpose:**

- `applicant-marking` every 15 minutes instead of 5. That would halve the cron log writes, but a failed marking would wait longer.
- `cron.log_run` off. That would stop the run log, but the run history would be lost.
- Cleaning up `cron.job_run_details`, which grows by about 385 rows a day and is never trimmed. That means deleting from a Supabase-managed table; it is a storage question, not an I/O one.

## Commits

- `d018c71` docs: Instagram launch moved to 5 Nov, Canva master route and ManyChat free plan rules (`AGENTS_SOCIALS.md`).
- This handoff, with `AGENTS_SOCIALS.md` updated for Facebook (section 2 channel row and a Facebook block in section 5).
- `8f1eda9` chore: skip cron HTTP calls when there is nothing to do (the Part 5 migration, rollback, and a line each in `docs/STAFF_APP.md` and `docs/APPLICANT_TESTING.md`).
- Not pushed at the time of writing. `To_do_list.md` had changes from another session and was left out.

## Left open

- Owner jobs j1 to j15 in the kit, including the Facebook Page, filters and ManyChat check, all before Thu 5 Nov.
- Film Reel 1 by Mon 9 Nov.
- Offered, not done: a Facebook cover in Canva in the house style, and short `/fb/` redirect links like the existing `/ig/` ones.
- Disk I/O: check Reports > Database > Disk IO in the Supabase dashboard over the next week. If it spikes while the database is quiet, raise it with Supabase support.
