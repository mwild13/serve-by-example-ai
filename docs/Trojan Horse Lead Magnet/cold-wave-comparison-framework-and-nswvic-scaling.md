# Cold wave comparison framework and NSW/VIC scaling protocol

---

## Part 1 — Live comparison framework

Populate this table as Cold SA data comes in. Do not fill in projections — only real numbers.

**Read window:** Pull Cold SA data at 24h, 48h, and 72h post-send. The 72h read is the stable number to carry into the NSW/VIC decision.

### Batch comparison table

| Metric | Batch 1 warm SA (n=24) | Batch 1 cold SA (n=50) | Delta | Signal |
|---|---|---|---|---|
| Delivery rate | 96% (23/24) | — | — | — |
| Email 1 click rate | 45.8% (11/24) | — | — | — |
| Landing page opt-in rate | 54.5% (6/11) | — | — | — |
| End-to-end send → opt-in | 25% (6/24) | — | — | — |
| Reply rate | 12.5% (3/24) | — | — | — |
| Hard bounces | 0 | — | — | — |
| Soft bounces | 1 | — | — | — |

**Note:** Warm SA had no credibility anchor. Cold SA has the anchor. Click rate is the primary diagnostic — it isolates the anchor's effect on cold trust. Opt-in rate (clicks → form) should hold similar across both batches because the landing page copy is unchanged.

### What each cold SA outcome means

| Cold SA Email 1 click rate | Interpretation | Action before NSW |
|---|---|---|
| > 12% | Anchor working above projection. High confidence in current cold sequence. | Scale NSW/VIC without further changes. |
| 8–12% | Anchor working within projection. Solid baseline. | Scale NSW/VIC as planned. Monitor Email 2/3 open rates. |
| 5–8% | Anchor working at floor projection. Acceptable but watch carefully. | Test one subject line variant in first NSW batch before full scale. |
| < 5% | Below floor. Anchor alone insufficient. | Hold NSW. Review Email 1 structure — likely a subject line or sender recognition problem, not the body copy. |

### Email 4 maturation tracker

The SA warm opt-ins (n=6) hit Day 9 on: **[Date of first SA warm opt-in + 9 days]**

| Contact | Opt-in date | Email 4 scheduled | Email 4 clicked | Converted |
|---|---|---|---|---|
| — | — | — | — | — |
| — | — | — | — | — |
| — | — | — | — | — |
| — | — | — | — | — |
| — | — | — | — | — |
| — | — | — | — | — |

This table answers the most important open question in the funnel: does Email 4 convert at all? Do not scale NSW until at least 3 of these 6 contacts have been through the full sequence.

---

## Part 2 — NSW/VIC high-density scaling protocol

### Timing

Start NSW list build in parallel with Cold SA sending — do not wait for SA data to begin sourcing. Wait for the 72h Cold SA read before opening the NSW send queue.

| Activity | Timing |
|---|---|
| NSW/VIC list build and enrichment | Parallel with Cold SA (start now) |
| Cold SA 72h data review | Day 3 post-first-send |
| Email 4 maturation read | Day 9 from first SA warm opt-in |
| NSW send queue opens | After both reads are in |
| VIC send queue opens | After NSW Week 1 data is in |

---

### NSW sourcing workflow

**Target:** 150–200 contacts. Split: ~60% OO, ~40% GOM.

**Source 1 — Liquor & Gaming NSW register**
URL: https://www.liquorandgaming.nsw.gov.au/resources/applications-and-licences/check-a-licence

Search by suburb. Priority order for Sydney Metro:
- CBD / Haymarket / The Rocks
- Surry Hills / Darlinghurst
- Newtown / Glebe
- Paddington / Woollahra
- Pyrmont / Ultimo
- Parramatta (outer metro — strong independent venue density)

Do not attempt regional NSW in this batch. Stick to Metro Sydney where venue density is highest and LinkedIn enrichment success rate is best.

**Source 2 — LinkedIn (GOM contacts specifically)**

NSW has a higher proportion of multi-venue groups than SA. Source GOM contacts directly from LinkedIn rather than inferring from venue registers.

Search parameters:
- Title: "Operations Manager" + "Hospitality" + Greater Sydney Area
- Title: "Group Operations" + "Food and Beverage" + NSW
- Title: "Director of Operations" + Restaurants + Sydney
- Company size: 11–200 employees (filters out solo operators and large chains)

For each LinkedIn GOM contact: confirm current role, note group name and number of venues, assign GOM sequence, write personalisation note from their profile (state coverage, group size, or recent post).

**Source 3 — AHA NSW**
URL: https://www.ahansw.com.au/find-a-member

Member directory covers pub-hotel operators. Strong OO and GOM archetype match. Cross-reference with LinkedIn for contact name where the directory only lists the venue.

---

### VIC sourcing workflow

**Target:** 100–150 contacts. Split: ~50% OO, ~50% GOM (Melbourne has higher group density than Sydney).

**Source 1 — VCGLR register**
URL: https://www.vcglr.vic.gov.au/licences-permits/liquor/check-licence-permit

Priority suburbs for Melbourne Metro:
- CBD / Southbank / Docklands
- Fitzroy / Collingwood / Abbotsford
- Richmond / South Yarra / Prahran
- St Kilda / Elwood
- Brunswick / Coburg (strong independent density)

**Source 2 — LinkedIn GOM search**
Same parameters as NSW but filtered to Greater Melbourne Area.

Melbourne-specific: search "Venue Group" + "Operations" — Melbourne has a strong culture of branded venue groups (e.g., Traders in the Night, Sand Hill Road, Merivale equivalents) that won't surface in the VCGLR register under a group name.

**Source 3 — AHA VIC**
URL: https://www.aha-vic.com.au/members/find-a-member

---

### Enrichment at scale

Hunter.io Starter (approved) covers 500 searches/month. NSW + VIC combined at 350 contacts = 350 Hunter searches. This fits within the monthly allowance with ~150 searches remaining for re-attempts and edge cases.

Batch the Hunter enrichment by suburb, not alphabetically. Processing suburb by suburb means you can stop mid-batch without losing your place.

Expected Hunter success rate at this scale: 60–70%. For the remaining 30–40%, fallback order:
1. Check venue website contact page directly
2. LinkedIn "Contact info" (only visible to connections — DM them instead if not connected)
3. Apollo.io (second enrichment source for Hunter failures)
4. Flag as `channel = linkedin_dm` and switch to DM script

---

### NSW/VIC send cadence

| Week | State | Daily sends | Mon–Thu | Weekly total |
|---|---|---|---|---|
| Week 3 | NSW | 40–50 | 4 days | 160–200 |
| Week 4 | NSW overflow + VIC start | 40–50 | 4 days | 160–200 |
| Week 5 | VIC | 40–50 | 4 days | 160–200 |

Email 2 and Email 3 follow-ups stack behind Week 3 sends by Day 3 and Day 7. By Week 4, you are running three threads simultaneously. Do not increase the daily new-contact volume beyond 50 to keep reply management sustainable.

---

### NSW/VIC personalisation notes — quick reference

Cold SA contacts had the CBS register as a fallback personalisation source. NSW/VIC contacts have richer signals available:

| Signal type | Personalisation line |
|---|---|
| LinkedIn: multi-state group | "Noticed [Group] is running venues across NSW and VIC." |
| LinkedIn: recent post | "Saw your post about [topic] — figured this would be relevant." |
| VCGLR/LG NSW: suburb context | "Came across [Venue] when pulling together a list of [Suburb] operators." |
| AHA member | "Found [Venue] through the AHA directory." |
| Google Maps: recent reviews | "Saw [Venue] has been busy on [Google / Instagram] lately." |

NSW and VIC are cold contacts only. No warm network signal applies. The credibility anchor in Email 1 carries the trust work.

---

### Pre-NSW send gate

Before the NSW queue opens:

- [ ] Cold SA 72h click rate reviewed and within acceptable range (see table above)
- [ ] At least 3 of the 6 SA warm opt-ins have received Email 4 (Day 9 maturation)
- [ ] At least 1 Email 4 CTA click recorded (or decision made on what to do if zero)
- [ ] NSW list fully enriched (150+ contacts, all minimum viable rows complete)
- [ ] Cold Email 1 templates confirmed current (credibility anchor present, UTM campaign tag updated)
- [ ] Batch comparison table updated with final Cold SA numbers

All green: NSW queue opens.
