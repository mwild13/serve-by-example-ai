# Batch 2 — cold SA sourcing sprint and tracking schema

---

## Part 1 — CBS register sourcing sprint

**Target:** 50 cold SA licensed venues, enriched and staged, ready for morning send.
**Time budget:** 90 minutes total.

---

### Step 1 — CBS register extraction (25 min)

**URL:** https://www.cbs.sa.gov.au/licences/liquor

Navigate to Licence Search. Search by suburb, one suburb at a time. Use Licence Type = Hotel / Restaurant / Club to filter out bottle shops and wholesalers.

Work through Adelaide metro suburbs in this order — highest venue density first:

1. Adelaide CBD (postcode 5000)
2. Norwood (5067)
3. Unley / Hyde Park (5061)
4. Glenelg (5045)
5. North Adelaide (5006)
6. Hindmarsh / Bowden (5007)
7. Port Adelaide (5015)
8. Semaphore (5019) — stop here if you have 60+ venue names

For each result:
- Copy venue name and address into a staging sheet (Venue Name | Address | Suburb | Postcode)
- Skip venues with "Pty Ltd" only and no trading name — harder to personalize and often stale
- Skip venues that appeared in Batch 1 warm list

Target: 60–70 raw venue names. You will lose ~20% at the enrichment step, leaving ~50 sendable contacts.

---

### Step 2 — Website resolution (20 min)

For each venue name, open Google and search `"[Venue Name]" [Suburb] site:` to find their website domain.

Paste the domain into your staging sheet. If no website exists: flag as `no_website` and move to LinkedIn-only enrichment.

Realistic outcome: ~80% of venues will have a website. ~20% will be Facebook-only or no web presence — these go to the LinkedIn DM fallback.

---

### Step 3 — Hunter.io enrichment (25 min)

**Note:** Hunter.io free plan covers 25 searches/month. For 50 contacts you need the Starter plan ($34 AUD/month). This is a one-month cost — worth it for the Batch 2 NSW/VIC scale that follows.

For each venue with a website:
1. Go to Hunter.io → Domain Search
2. Enter the venue domain
3. Hunter returns all emails found at that domain, with confidence scores
4. Look for: owner@, manager@, info@, or first-name@
5. Take the highest confidence result with a recognisable role signal

**Accept:** 80%+ confidence score. First name + last name visible in the result.
**Reject:** Generic `info@` or `admin@` with no name attached — unusable for personalisation.
**Fallback:** If Hunter returns no usable result, note `hunter_failed` and attempt LinkedIn search.

Paste the enriched email and contact name into your staging sheet.

---

### Step 4 — Role and personalisation pass (20 min)

For each contact with a verified email, open their LinkedIn profile or venue website.

Assign:
- `archetype` — OO, GOM, or VM
- `sequence` — OO or GOM
- `personalisation_note` — one line, 20 seconds maximum per contact

For cold SA contacts where LinkedIn shows limited information, use the venue-based observation:
> "Came across [Venue Name] in the CBS register when pulling together a list of SA operators."

This is the lowest-specificity personalisation option but it is honest and does not fabricate a connection. It is preferable to a generic opener with no reference.

---

### Step 5 — Import and stage (5 min)

Paste all enriched contacts into your master tracking sheet using the CSV schema below. Set `temperature = cold`, `batch = 1-SA-cold`, `email_1_sent` = blank.

Sort by archetype: GOM contacts first, then OO. GOM contacts in cold SA are lower volume but higher MRR per conversion — they send first within each daily batch.

Final quality gate before staging: confirm every row has `first_name`, `email` (verified), `archetype`, `sequence`, `personalisation_note`. Remove any row missing these. Do not send tomorrow with incomplete rows.

---

## Part 2 — Wave 1 diagnostic tracking schema

This schema sits alongside the existing contact tracking sheet. It produces the Batch 1 vs Batch 2 comparison automatically as data comes in.

---

### Master tracking columns (full schema)

```
id,batch,first_name,last_name,email,venue_name,archetype,state,sequence,
temperature,credibility_anchor,personalisation_note,
email_1_sent,email_1_bounced,email_1_replied,email_1_clicked,
email_2_sent,email_2_replied,email_2_clicked,
email_3_sent,email_3_replied,email_3_clicked,
opted_in,opted_in_date,email_4_sent,email_4_clicked,
converted,converted_date,notes
```

### Key field definitions

| Column | Values | Notes |
|---|---|---|
| `id` | Integer (auto-increment) | Unique row identifier |
| `batch` | `1-SA-warm` / `1-SA-cold` / `2-NSW` / `2-VIC` | Enables batch-level aggregation |
| `credibility_anchor` | `TRUE` / `FALSE` | FALSE for all Batch 1 warm sends. TRUE for all cold sends. This is the isolation variable |
| `email_1_clicked` | `TRUE` / `FALSE` | Set TRUE when UTM data shows a visit to `/toolkit` from this contact's email |
| `opted_in` | `TRUE` / `FALSE` | Set TRUE when confirmed in Supabase `toolkit_leads` |
| `email_4_clicked` | `TRUE` / `FALSE` | Set TRUE when contact clicks the pricing CTA in Email 4 |
| `converted` | `TRUE` / `FALSE` | Set TRUE on confirmed paid or waitlist signup |

---

### Diagnostic comparison view

Create a second tab called `Batch comparison`. Populate it with COUNTIF formulas against the master sheet. Update it weekly.

| Metric | Batch 1 warm | Batch 1 SA cold | Batch 2 NSW | Batch 2 VIC |
|---|---|---|---|---|
| Sent | — | — | — | — |
| Delivered | — | — | — | — |
| Email 1 click rate | — | — | — | — |
| Landing page opt-in rate | — | — | — | — |
| End-to-end conversion rate | — | — | — | — |
| Reply rate | — | — | — | — |
| Email 4 CTA click rate | — | — | — | — |
| Paid / waitlist conversion | — | — | — | — |

**The diagnostic question this table answers:** Does the credibility anchor (`TRUE` vs `FALSE`) improve Email 1 click-through rate in cold outreach? Compare Batch 1 warm (no anchor, warm trust) vs Batch 1 SA cold (anchor, cold trust). If the SA cold click rate comes in above 12% — above the upper bound of the cold projection — the anchor is doing work and carries into NSW/VIC.

---

### Weekly review trigger points

| Condition | Action |
|---|---|
| SA cold Email 1 click rate < 5% after 25 sends | Revisit Email 1 subject line before scaling to NSW |
| SA cold opt-in rate < 30% of clicks | Landing page may need a headline test |
| Email 4 CTA click rate < 15% | Nurture sequence needs a review before NSW volume goes through it |
| Any batch reply rate > 5% | Strong signal — investigate what's driving it and amplify |
| Zero Email 4 clicks after first 6 SA warm contacts hit Day 9 | Escalate immediately — Email 4 is the conversion gate |
