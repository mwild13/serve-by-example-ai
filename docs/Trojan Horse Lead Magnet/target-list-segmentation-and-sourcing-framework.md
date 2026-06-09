# Target list — segmentation and sourcing framework

---

## Segmentation model

Every contact gets four tags before outreach starts:

| Field | Options |
|---|---|
| Archetype | `owner_operator` / `ops_manager` / `venue_manager` |
| Batch | `1-SA` / `2-NSW` / `2-VIC` |
| Temperature | `warm` / `cold` |
| Sequence | `OO` / `GOM` |

Sequence assignment: Owner-Operators and Venue Managers receive the OO sequence. Group Ops Managers receive the GOM sequence. Venue Managers at independent single venues are OO. Venue Managers at multi-site groups are GOM.

---

## Contact record fields

One row per contact in a spreadsheet (Airtable, Notion database, or plain CSV):

| Field | Notes |
|---|---|
| First name | Required for personalisation |
| Last name | |
| Email | Required before sending |
| LinkedIn URL | Required for DM channel |
| Venue / Group name | As it appears publicly |
| Role title | As listed on LinkedIn or website |
| Archetype | OO / GOM / VM |
| State | SA / NSW / VIC |
| Venue type | Pub-hotel / Restaurant / Bar / Club / Cafe |
| Source | How the contact was found (see below) |
| Temperature | Warm / Cold |
| Sequence | OO / GOM |
| Personalisation note | One-line observation for Email 1 opener |
| Email 1 sent | Date |
| Email 2 sent | Date |
| Email 3 sent | Date |
| Replied | Y / N |
| Clicked | Y / N |
| Opted in | Y / N |
| Notes | Manual field |

---

## Batch 1 — South Australia

**Archetype skew:** SA hospitality is predominantly owner-operator and independent. Multi-venue groups exist (Australian Venue Co has SA sites, some local groups) but are outnumbered. Expect Batch 1 to be 70–80% OO sequence, 20–30% GOM sequence.

**Target size:** 60–100 contacts total. Warm segment first, then cold to fill the batch.

### Warm segment (Mitch's network — do first)

These contacts do not get the cold email sequence. They get a personal outreach first — SMS, WhatsApp, or LinkedIn DM using the warm script from the outreach note. If no response after 5 days, follow up with Email 1 from the cold sequence (lightly edited to acknowledge the existing relationship).

**How to build the warm list:**
- Export LinkedIn connections, filter by: Location = South Australia + Hospitality / Food & Beverage / Venue Management
- Scroll phone contacts, flag anyone in the industry
- Former colleagues, supplier contacts, people met at AHA SA events or industry nights
- Anyone who's commented on Mitch's LinkedIn posts in the last 12 months

Realistic warm list: 20–40 contacts. If fewer, that's fine — quality over coverage here.

### Cold segment — SA sourcing methods

**Source 1: CBS SA liquor licensing register (highest priority)**
- URL: https://www.cbs.sa.gov.au/licences/liquor/types
- The public register lists all licensed premises in SA by venue name and address
- Cross-reference venue name with LinkedIn to find the licensee or manager
- This gives you every licensed venue in SA — filter by Adelaide metro first, then regional

**Source 2: LinkedIn search**
- Search: "venue manager" + "South Australia" + Hospitality
- Search: "operations manager" + "Adelaide" + Hospitality
- Search: "licensee" + "South Australia"
- Filter: Current role, Hospitality industry
- Do not connect until you have their email — use LinkedIn for research, email as primary channel

**Source 3: Google Maps**
- Search: "pub Adelaide CBD", "restaurant group Adelaide", "licensed venue North Adelaide", "hotel bar Adelaide"
- Work suburb by suburb: CBD → North Adelaide → Norwood → Unley → Glenelg → Port Adelaide
- Each venue: find the operator name via website About page, Google My Business, or Facebook page

**Source 4: AHA SA member directory**
- Australian Hotels Association SA publishes a member directory
- URL: https://www.ahasa.asn.au
- Members are typically pub-hotel operators — strong OO and GOM archetype match

**Source 5: SA hospitality Facebook groups**
- Groups: "Adelaide Hospitality Industry", "Hospitality Jobs Adelaide"
- Don't source emails here — use it to identify active operators and then find contact details via LinkedIn or venue website

**Do not use:** General business directories (Yellow Pages, True Local). Contact quality is too low and data is often stale.

---

## Batch 2 — NSW and VIC

**Target size:** 200–400 contacts across both states. Build in parallel, send sequentially (NSW first, VIC second, or interleaved).

**Archetype skew:** Both states have a higher density of multi-venue groups than SA. Expect 50–60% OO sequence, 40–50% GOM sequence, especially in Sydney CBD, Melbourne CBD, and inner suburbs.

### Sourcing methods — NSW

**Source 1: Liquor & Gaming NSW public register**
- URL: https://www.liquorandgaming.nsw.gov.au
- Full public register of licensed premises in NSW
- Filter by: venue type (hotel, restaurant, club), region (Sydney Metro first)
- Cross-reference venue name with LinkedIn for contact

**Source 2: LinkedIn Sales Navigator (recommended at this scale)**
- Title search: "Operations Manager" + Hospitality + NSW
- Title search: "Group Operations" + Food and Beverage + Greater Sydney
- Title search: "Venue Manager" + Restaurants + NSW
- Company search: filter by Hospitality industry, 10–50 employees (independent/small group), NSW

**Source 3: AHA NSW**
- URL: https://www.ahansw.com.au
- Member directory covers pub-hotel operators across NSW
- Strong GOM archetype match for multi-venue members

**Source 4: Restaurant & Catering NSW**
- URL: https://www.restaurantcater.asn.au
- Members skew toward independent restaurants and small groups — strong OO match

### Sourcing methods — VIC

**Source 1: VCGLR public register**
- Victorian Commission for Gambling and Liquor Regulation
- URL: https://www.vcglr.vic.gov.au
- Public register of all licensed venues in VIC
- Same cross-referencing process as NSW

**Source 2: LinkedIn**
- Same title/industry search as NSW but filtered to Greater Melbourne
- VIC inner suburbs with high venue density: CBD, Fitzroy, Collingwood, Richmond, South Yarra, St Kilda, Prahran

**Source 3: AHA VIC**
- URL: https://www.aha-vic.com.au
- Covers hotel/pub operators; strong for GOM archetype

---

## Batch sizing and cadence

| Batch | Contacts | Daily send cap | Duration |
|---|---|---|---|
| 1 — SA warm | 20–40 | No cap (personal outreach) | Days 1–3 |
| 1 — SA cold | 40–60 | 30–40/day | ~2 weeks |
| 2 — NSW | 150–200 | 30–40/day | ~6 weeks |
| 2 — VIC | 100–150 | 30–40/day | ~4 weeks |

The 30–40/day cap is a deliverability constraint, not a choice. Exceeding it from a new or low-volume sending domain triggers spam filters. If sending from an established domain with history, cap can move to 50–60/day.

---

## Priority order within each batch

Within Batch 1 SA cold: prioritise contacts where a specific personalisation line is available (recent post, multi-state signal, known connection). Generic observation contacts go last.

Within Batch 2: prioritise GOM contacts first. They are harder to source but represent higher MRR per conversion ($49/month with multi-venue upgrade path). OO volume fills the remainder.

---

## Email finding tools

For contacts where the email isn't on the website:
- **Hunter.io** — find professional emails by name + domain. Free tier: 25 searches/month
- **Apollo.io** — broader database, stronger for LinkedIn-sourced contacts. Free tier: 50 emails/month
- **Snov.io** — alternative to Apollo, similar capability
- **LinkedIn direct message** — fallback if email can't be found; use the cold DM script from the outreach note
