# Batch 1 — SA warm list extraction protocol and CSV template

---

## Part 1 — LinkedIn extraction protocol

### Step 1: Request your data export (do this first — takes up to 48 hours)

1. Log into LinkedIn → click your profile photo → **Settings & Privacy**
2. Left sidebar → **Data Privacy** → **Get a copy of your data**
3. Select **"Want something in particular? Select the data files you're most interested in"**
4. Tick **Connections** only
5. Click **Request archive**
6. LinkedIn emails a download link within 10 minutes to 48 hours

The Connections CSV contains: First Name, Last Name, Email Address, Company, Position, Connected On.

**Critical note:** LinkedIn removes email addresses for most connections. Expect 70–90% of the Email Address column to be blank. The export still gives you Name + Company + Position — enough to identify targets and find emails separately.

---

### Step 2: Filter the connections CSV

Open the downloaded `Connections.csv` in Google Sheets or Excel.

Add a helper column called `keep` and use this logic to flag SA hospitality contacts:

**Filter pass 1 — Position keywords (column C):**
Mark `keep = 1` if the Position field contains any of:
- owner, operator, licensee, director, founder, proprietor
- venue manager, operations manager, ops manager, general manager, GM
- manager, F&B manager, food and beverage

**Filter pass 2 — Company keywords (column B):**
Confirm or elevate `keep = 1` if Company contains any of:
- hotel, pub, bar, restaurant, café, cafe, bistro, tavern, club, venue, hospitality, group, dining

**Filter pass 3 — Location inference:**
LinkedIn does not include location in the Connections export. You must infer SA from memory or company name recognition. Mark a third column `state_likely` = SA for contacts you know are Adelaide-based.

If uncertain: open their LinkedIn profile directly to confirm current location before including.

**Output:** A filtered sheet of likely SA hospitality contacts with Name, Company, Position. This is your research list — not yet your send list.

---

### Step 3: Enrich — find emails and LinkedIn URLs

For each filtered contact:

1. **LinkedIn URL:** Go to their profile, copy the URL (e.g., `linkedin.com/in/username`). Paste into `linkedin_url` column.
2. **Email:** Try in order —
   - Check their LinkedIn profile "Contact info" section (some connections share email)
   - Check the venue website About or Contact page
   - Use Hunter.io: enter their domain → search by name
   - Use Apollo.io as a fallback
3. **Skip if email cannot be found.** Do not guess. Move them to the LinkedIn DM sequence instead (flag as `channel = linkedin_dm`).

---

## Part 2 — Phone contact extraction protocol

### Step 1: Export phone contacts

**iPhone:**
1. Open a browser → go to `contacts.icloud.com`
2. Sign in with Apple ID
3. Select all contacts (Cmd+A or Edit → Select All)
4. Export as vCard (.vcf)
5. Import the .vcf into Google Contacts at `contacts.google.com`
6. From Google Contacts: More → Export → Google CSV format

**Android / Google Contacts:**
1. Go to `contacts.google.com`
2. More → Export → Export as Google CSV

---

### Step 2: Filter phone contacts

Open the exported CSV. This will be messy — unstructured names, mixed formats, missing fields. Work through it manually. It is faster than it looks.

Scan for: anyone whose name, company field, or note field suggests hospitality or venues in SA. Flag with `keep = 1`.

Be aggressive here. Include anyone you're 70% sure about — you'll confirm before sending. The phone list is high quality because these are people whose number you have. Even a list of 15–20 from here is valuable.

---

### Step 3: Deduplicate against LinkedIn list

Copy phone contacts into the same sheet as LinkedIn contacts. Sort by last name. Remove anyone who appears in both lists, keeping the row with the most complete data.

---

## Part 3 — Personalisation pass

Before importing, write a one-line personalisation note for every contact. This is the opening line of Email 1.

Work through the filtered list. For each contact, open their LinkedIn profile and their venue's Google Maps or website. Spend 20–30 seconds maximum per contact. Pick the most specific observation available:

| Signal available | Personalisation line |
|---|---|
| Recent LinkedIn post | "Saw your post about [topic] last week." |
| Multi-state venues | "Noticed [Group] is across SA and [State]." |
| Long-standing venue | "Looks like [Venue] has been running in [Suburb] for a while." |
| Recent opening or rebrand | "Saw [Venue] just opened in [location]." |
| Shared connection or event | "Think we crossed paths at [AHA event / industry night]." |
| Nothing specific available | "Came across [Venue Name] when looking at SA operators." |

Write the personalisation line directly into the `personalisation_note` column. Do not send any contact without a note in this column.

---

## Part 4 — CSV import template

Use these exact column headers. Case-sensitive. No spaces. Import directly into your tracking spreadsheet or Airtable base.

```
first_name,last_name,email,linkedin_url,venue_name,role_title,archetype,state,venue_type,source,temperature,sequence,channel,personalisation_note,email_1_sent,email_2_sent,email_3_sent,replied,clicked,opted_in,notes
```

### Field definitions and accepted values

| Column | Type | Accepted values / format |
|---|---|---|
| first_name | Text | As it appears on LinkedIn |
| last_name | Text | As it appears on LinkedIn |
| email | Text | Verified email address. Leave blank if not found — do not guess |
| linkedin_url | Text | Full URL: `https://linkedin.com/in/username` |
| venue_name | Text | Venue or group name as publicly listed |
| role_title | Text | Their actual title, verbatim |
| archetype | Enum | `owner_operator` / `ops_manager` / `venue_manager` |
| state | Enum | `SA` / `NSW` / `VIC` |
| venue_type | Enum | `pub_hotel` / `restaurant` / `bar` / `club` / `cafe` |
| source | Enum | `linkedin_connection` / `phone_contact` / `referral` |
| temperature | Enum | `warm` / `cold` |
| sequence | Enum | `OO` / `GOM` |
| channel | Enum | `email` / `linkedin_dm` / `sms` — set `linkedin_dm` or `sms` if no email found |
| personalisation_note | Text | One-line observation. Must be populated before sending |
| email_1_sent | Date | YYYY-MM-DD. Blank until sent |
| email_2_sent | Date | YYYY-MM-DD. Blank until sent |
| email_3_sent | Date | YYYY-MM-DD. Blank until sent |
| replied | Boolean | `TRUE` / `FALSE`. Default: FALSE |
| clicked | Boolean | `TRUE` / `FALSE`. Default: FALSE — update from UTM data |
| opted_in | Boolean | `TRUE` / `FALSE`. Default: FALSE — update from Supabase |
| notes | Text | Free field — log replies, call notes, context |

### Minimum viable row before sending

A contact is ready to send when all of these columns are populated:
`first_name`, `email`, `archetype`, `state`, `sequence`, `temperature`, `personalisation_note`

Do not send to any row missing these six fields.

---

## Realistic Batch 1 output

| Source | Expected contacts |
|---|---|
| LinkedIn connections (SA hospitality, filtered) | 15–30 |
| Phone contacts (SA hospitality, manually flagged) | 10–20 |
| After deduplication | 20–40 |

If the combined list comes in under 20, do not pad it with low-confidence contacts. Quality of personalisation matters more than volume at this stage. The first 20 sends will generate the first real signal.
