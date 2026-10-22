# 4-part email nurture sequence: copy

**Current copy, revised 2026-10-23.** This file is the source for the toolkit emails. Older planning docs in this folder (the Loops checklist, the Phase 5 blueprint, the Email 4 contingency vectors, the landing page plan) quote earlier drafts; where they differ, this file wins.

What changed on 2026-10-23, so it doesn't creep back:

- **No "RSA Incident Log" or "Asset 1".** The toolkit is one Notion page, the onboarding SOP. A separate state-by-state incident log was planned but never built. The SOP's Section 4a covers the RSA sign-off, and the venue's own incident register records what happens after.
- **Prices are the live ones:** Boutique A$79 a month for up to 15 staff, Commercial A$149 a month for up to 35 across several venues. The $49 founding price is gone. The founding promise on `/membership` still stands: every plan is a founding rate, and the price you start on is the price you keep.
- **Links go to `/membership`**, not `/pricing` (a redirect).
- **No unsourced figures:** no "70 to 80% turnover", no "research consistently links", no "most staff leave in the first four weeks".
- **Signed "The Serve By Example team"**, not a person, as the live Email 1 is (faceless brand since 2026-10-13).
- **No em or en dashes** (`AGENTS.md`).

**Templating note:** Role-conditional blocks are handled server-side. When building each email string in Node.js, select the block matching the lead's `role` field (`ops_manager` | `owner_operator` | `venue_manager`) and interpolate it into the base copy. These are not Liquid/Handlebars templates; they are plain-text strings assembled at send time.

Email 1 fires immediately via `/api/toolkit-capture`. Emails 2 to 4 need a scheduled send (cron, Loops.so drip, or Supabase pg_cron), covered in the Phase 5 blueprint.

---

## Email 1: Toolkit delivery
**Timing:** Immediate on capture
**Subject:** Your free compliance and onboarding toolkit
**Preview:** Duplicate it. Don't just read it.

---

```
Hi [First Name],

Here's your free Australian Hospitality Compliance & Onboarding Toolkit:

[Toolkit URL]

This is a working document, not a guide to read. Duplicate it into your
Notion workspace and work through it at your venue.

--- [ops_manager] ---
Start with Section 4a, RSA and responsible service. Run it at each of your
sites separately. The gaps between venues are the finding.

Look for the friction counter at the end of each section. Fill in your
actual numbers across all sites.
--- [/ops_manager] ---

--- [owner_operator] ---
Start with Section 7, the annual cost summary. Fill in the friction
counters as you go through each section, then carry the totals forward.
By the end, you'll have an exact number for what this process costs you
per year.

The number is usually larger than people expect.
--- [/owner_operator] ---

--- [venue_manager] ---
Work through the SOP as if you were inducting a new hire right now. Pay
attention to the sections you can't fill in: the procedures that only
exist verbally, the knowledge that lives in one person's head.

What you can't complete is the gap.
--- [/venue_manager] ---

More on what to do with what you find in a few days.

The Serve By Example team
servebyexample.co

---
You're receiving this because you downloaded the free toolkit at
servebyexample.co/toolkit.
Unsubscribe: [Unsubscribe URL]
```

---

## Email 2: RSA compliance pain
**Timing:** Day 3
**Subject:** If a licensing officer walked in tonight...
**Preview:** What would you hand them?

---

```
Hi [First Name],

--- [ops_manager] ---
Three venues. Three different ways of recording RSA training. One of them
is a spreadsheet that hasn't been updated since February.

If an incident at any one site leads to a licensing investigation, that
record is the first thing you'll be asked for.
--- [/ops_manager] ---

--- [owner_operator] ---
You explained RSA to them on the first shift. Verbally, in a five-minute
walk-through before service. Nothing written down. No sign-off.

If a patron incident from that shift ends up in front of a licensing
officer, you have no record that the conversation happened.
--- [/owner_operator] ---

--- [venue_manager] ---
Your FOH staff from last month completed their onboarding verbally. The
RSA section was covered. But it wasn't signed, and it wasn't dated.

There's no record that it happened.
--- [/venue_manager] ---

Section 4a of your toolkit fixes the record: who was trained, on what,
and when, signed and dated. Your venue's incident register then records
what happens on shift.

Serve By Example keeps the training record for you. Every module, quiz
and Live Guest conversation is timestamped, and RSA and Food Safety
Supervisor certificates sit in one place with their expiry dates.

See a Live Guest conversation in two minutes, no sign-up:
servebyexample.co/demo

The Serve By Example team
servebyexample.co

---
You're receiving this because you downloaded the free toolkit at
servebyexample.co/toolkit.
Unsubscribe: [Unsubscribe URL]
```

---

## Email 3: Onboarding cost pain
**Timing:** Day 6
**Subject:** The number most operators don't want to calculate
**Preview:** Turnover is the multiplier. Here's what it costs.

---

```
Hi [First Name],

Every time someone leaves, this whole process starts again: from scratch,
on your time. In hospitality, that happens a lot.

--- [ops_manager] ---
Across a group of venues, you're running onboarding at several sites
every month. Each site uses a different format. Each manager delivers it
differently. The training walks out with the person every time.

There's no shared memory. There's only the next conversation.
--- [/ops_manager] ---

--- [owner_operator] ---
Section 7 of your toolkit has an annual cost summary. If you've filled in
the friction counters (time per hire, hires per year, your loaded hourly
rate), you now have the figure.

Not an estimate. The actual annual cost of doing this by hand, at your
venue, at your turnover.

Most operators see that number and feel two things: surprise, then quiet
recognition that they already knew it.
--- [/owner_operator] ---

--- [venue_manager] ---
Plenty of new staff leave early. Not because the venue was bad, but
because they never felt they knew what they were doing.

The week 3 and 4 review in Section 6 exists for that. It takes ten
minutes, and it tells a new hire their work has been noticed.

Most venues never run it.
--- [/venue_manager] ---

The toolkit gives you the structure. The problem is consistency: whether
it happens every time, with every hire, however busy the venue is that
week.

That's the gap Serve By Example closes. Boutique is A$79 a month for up
to 15 staff, and every plan is a founding rate: the price you start on is
the price you keep.

The Serve By Example team
servebyexample.co

---
You're receiving this because you downloaded the free toolkit at
servebyexample.co/toolkit.
Unsubscribe: [Unsubscribe URL]
```

---

## Email 4: Conversion
**Timing:** Day 9
**Subject:** Why most venues stop using the manual system after three weeks
**Preview:** You've got the paper version. Here's the problem with it.

---

```
Hi [First Name],

You've had the toolkit for nine days.

If you've worked through it, you've done something most operators don't:
you've measured the problem. You have a number for what onboarding by
hand costs, and a checklist that shows where your training record has
gaps.

Most venues stop here. Not because the manual system doesn't work. It
does. But it depends on one person having the time and the discipline to
use it, every single time.

--- [ops_manager] ---
In a multi-site group, that breaks at the second venue, or when a site
manager changes, or when one location gets slammed and the paperwork
slides. The manual system needs perfect execution across every site.

That's not how venues run.
--- [/ops_manager] ---

--- [owner_operator] ---
For an owner-operator, it breaks on a Friday. You're behind the bar,
you're short-staffed, and the new casual who started at 5pm has had a
verbal rundown at best. The template is still on your desk on Monday.
--- [/owner_operator] ---

--- [venue_manager] ---
For a venue manager, it breaks the moment you delegate. Once the
checklist moves from your hands to a senior staff member's, the sign-offs
stop happening, the reviews get skipped, and within six weeks it's back
to "we do this verbally".
--- [/venue_manager] ---

The tool works. The process doesn't hold without a system behind it.

That's what Serve By Example is. Staff complete short modules on their
phone before their first shift, then practise with Live Guest: real
service moments with a guest who answers back. Every result lands in your
Manager Console as it happens. RSA and Food Safety Supervisor
certificates are tracked with their expiry dates.

Boutique: A$79 a month for up to 15 staff at one venue.
Commercial: A$149 a month for up to 35 staff across several venues.

Every plan is a founding rate. The price you start on is the price you
keep, whatever happens to pricing later. 14-day free trial, cancel
anytime.

Start your free trial: servebyexample.co/membership
Or try the two-minute demo first: servebyexample.co/demo

The Serve By Example team
servebyexample.co

---
You're receiving this because you downloaded the free toolkit at
servebyexample.co/toolkit.
Unsubscribe: [Unsubscribe URL]
```

---

## Sending schedule

| Email | Trigger | Condition |
|---|---|---|
| 1 | Immediate | On successful insert to `toolkit_leads` |
| 2 | +3 days | `consent_marketing = true` AND `email_sequence_started = true` |
| 3 | +6 days | `consent_marketing = true` AND email 2 sent |
| 4 | +9 days | `consent_marketing = true` AND email 3 sent |

Add `email_2_sent_at`, `email_3_sent_at`, `email_4_sent_at` timestamptz columns to `toolkit_leads` to track send state and prevent re-sends.

## Update to Email 1 in `/api/toolkit-capture`

To make Email 1 role-conditional, add a `role` switch before building the body string:

```typescript
function getRoleHook(role: string): string {
  switch (role) {
    case 'ops_manager':
      return `Start with Section 4a, RSA and responsible service. Run it at each of your sites separately. The gaps between venues are the finding.\n\nLook for the friction counter at the end of each section. Fill in your actual numbers across all sites.`;
    case 'owner_operator':
      return `Start with Section 7, the annual cost summary. Fill in the friction counters as you go through each section, then carry the totals forward. By the end, you'll have an exact number for what this process costs you per year.\n\nThe number is usually larger than people expect.`;
    case 'venue_manager':
      return `Work through the SOP as if you were inducting a new hire right now. Pay attention to the sections you can't fill in: the procedures that only exist verbally, the knowledge that lives in one person's head.\n\nWhat you can't complete is the gap.`;
    default:
      return `Work through the template at your venue and fill in your actual numbers.`;
  }
}
```

Inject `getRoleHook(role)` into the Email 1 body string in place of the current generic middle paragraph.
