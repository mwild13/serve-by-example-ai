# 4-part email nurture sequence — copy

**Templating note:** Role-conditional blocks are handled server-side. When building each email string in Node.js, select the block matching the lead's `role` field (`ops_manager` | `owner_operator` | `venue_manager`) and interpolate it into the base copy. These are not Liquid/Handlebars templates — they are plain-text strings assembled at send time.

Email 1 fires immediately via `/api/toolkit-capture`. Emails 2–4 require a scheduled send mechanism (cron, Loops.so drip, or Supabase pg_cron) — covered in Phase 5 implementation.

---

## Email 1 — Toolkit delivery
**Timing:** Immediate on capture
**Subject:** Your free compliance and onboarding toolkit
**Preview:** Duplicate it. Don't read it.

---

```
Hi [First Name],

Here's your free Australian Hospitality Compliance & Onboarding Toolkit:

[Toolkit URL]

This is a working document — not a guide to read, a tool to fill out.
Duplicate it into your Notion workspace and work through it at your venue.

--- [ops_manager] ---
Start with the RSA Incident Log. There's a section for each state — run
the compliance checklist across your sites separately. The gaps between
venues is the finding.

Look for the friction counter at the end of each section. Fill in your
actual numbers across all sites.
--- [/ops_manager] ---

--- [owner_operator] ---
Start with Section 7 of the onboarding SOP — the annual cost summary.
Fill in the friction counters as you go through each section, then carry
the totals forward. By the end, you'll have an exact number for what this
process costs you per year.

The number is always larger than people expect.
--- [/owner_operator] ---

--- [venue_manager] ---
Work through the onboarding SOP as if you were inducting a new hire right
now. Pay attention to the sections you can't fill in — the procedures that
only exist verbally, the knowledge that lives in one person's head.

What you can't complete is the gap.
--- [/venue_manager] ---

More on what to do with what you find in a few days.

Mitch
Serve By Example
servebyexample.co

---
You're receiving this because you downloaded the free toolkit at
servebyexample.co/toolkit.
Unsubscribe: [Unsubscribe URL]
```

---

## Email 2 — RSA compliance pain
**Timing:** Day 3
**Subject:** If a licensing officer walked in tonight...
**Preview:** What would you hand them?

---

```
Hi [First Name],

--- [ops_manager] ---
Three venues. Three different log formats. One of them is a spreadsheet
that hasn't been updated since February.

If a licensing investigation is triggered by an incident at any one site,
that register is what stands between you and a show-cause notice.
--- [/ops_manager] ---

--- [owner_operator] ---
You explained RSA to them on the first shift. Verbally, in a five-minute
walk-through before service. Nothing written down. No sign-off.

If a patron incident from that shift ends up in front of a licensing
officer, that conversation didn't happen.
--- [/owner_operator] ---

--- [venue_manager] ---
Your FOH staff from last month completed the onboarding verbally. The RSA
section was covered. But it wasn't signed. It wasn't dated.

There's no record that it happened — which means, legally, it didn't.
--- [/venue_manager] ---

The RSA Incident Log in your toolkit handles this. Section 4a of the
onboarding SOP captures the sign-off.

Most venues manage this with a paper log and goodwill. The Asset 1
checklist shows you exactly where that system breaks under inspection.

Serve By Example automates the training record side of this — module
completion, sign-off, timestamp. One thing worth knowing: the single-venue
plan is $49/month for founding members. That rate doesn't hold
indefinitely.

Mitch
Serve By Example
servebyexample.co

---
You're receiving this because you downloaded the free toolkit at
servebyexample.co/toolkit.
Unsubscribe: [Unsubscribe URL]
```

---

## Email 3 — Onboarding cost pain
**Timing:** Day 6
**Subject:** The number most operators don't want to calculate
**Preview:** 70–80% annual turnover. Here's what it costs.

---

```
Hi [First Name],

Australian hospitality runs at 70–80% annual staff turnover.

That's not a general statistic. That's the number of times your venue
repeats this process — from scratch, on your time — every single year.

--- [ops_manager] ---
Across a group of five venues at average turnover, you're running parallel
onboarding cycles at multiple sites every month. Each site uses a different
format. Each manager delivers it differently. The training investment walks
out with the person every time.

There's no institutional memory. There's only the next conversation.
--- [/ops_manager] ---

--- [owner_operator] ---
Section 7 of your onboarding SOP has an annual cost summary. If you've
filled in the friction counters — time per hire, hires per year, your
loaded hourly rate — you now have the exact figure.

Not an estimate. The actual annual cost of doing this manually, at your
venue, at your turnover rate.

Most operators see that number and feel two things: surprise, then quiet
recognition that they already knew it.
--- [/owner_operator] ---

--- [venue_manager] ---
Most staff who leave do it in the first four weeks. Not because the venue
was bad — because they didn't feel like they knew what they were doing.

The Week 3–4 review in Section 6 of your SOP exists because that
conversation, consistently run, is one of the lowest-cost retention tools
in hospitality. Research consistently links it to reduced 90-day attrition.

Most venues never run it.
--- [/venue_manager] ---

The manual SOP gives you the structure. The problem is consistency —
whether it happens every time, with every hire, regardless of how busy
the venue is that week.

That's the gap Serve By Example closes. Worth knowing: the founding rate
is still $49/month. Future rate is $79.

Mitch
Serve By Example
servebyexample.co

---
You're receiving this because you downloaded the free toolkit at
servebyexample.co/toolkit.
Unsubscribe: [Unsubscribe URL]
```

---

## Email 4 — Conversion
**Timing:** Day 9
**Subject:** Why most venues stop using the manual system after three weeks
**Preview:** You've got the paper version. Here's the problem with it.

---

```
Hi [First Name],

You've had the toolkit for nine days.

If you've worked through it, you've done something most operators don't:
you've quantified the problem. You have a number for what manual onboarding
costs. You have a checklist that shows exactly where your compliance record
fails under inspection.

Most venues stop here. Not because the manual system doesn't work — it
does. But because it depends entirely on one person having the time and
the discipline to use it consistently, every single time.

--- [ops_manager] ---
In a multi-site operation, that breaks at the second venue, or when a
site manager changes, or when one location gets slammed during a busy
period and the paperwork slides. The manual system requires perfect
execution across every site, every time.

That's not how venues operate.
--- [/ops_manager] ---

--- [owner_operator] ---
For an owner-operator, it breaks on a Friday. You're behind the bar,
you're short-staffed, and the new casual who started at 5pm has had a
verbal rundown at best. The template is still on your desk on Monday.
--- [/owner_operator] ---

--- [venue_manager] ---
For a venue manager, it breaks the moment you delegate. Once the
onboarding checklist moves from your hands to a senior staff member's,
the sign-offs stop happening consistently, the reviews get skipped, and
within six weeks it's back to "we do this verbally."
--- [/venue_manager] ---

The tool works. The process doesn't hold without a system behind it.

That's what Serve By Example is. Staff complete onboarding modules on
their phone before their first shift. RSA training is tracked
automatically. The compliance record updates without the clipboard.

The single-venue plan is AUD $49/month for founding members — locked for
life, regardless of future pricing. The rate moves to $79/month when early
access closes.

Month-to-month. Cancel anytime.

Lock in your founding rate → servebyexample.co/pricing

Mitch
Serve By Example
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

The generic copy in the current `sendEmail1` function should be replaced with the role-conditional version above. Add a `role` switch before building the body string:

```typescript
function getRoleHook(role: string, firstName: string): string {
  switch (role) {
    case 'ops_manager':
      return `Start with the RSA Incident Log. There's a section for each state — run the compliance checklist across your sites separately. The gaps between venues is the finding.\n\nLook for the friction counter at the end of each section. Fill in your actual numbers across all sites.`;
    case 'owner_operator':
      return `Start with Section 7 of the onboarding SOP — the annual cost summary. Fill in the friction counters as you go through each section, then carry the totals forward. By the end, you'll have an exact number for what this process costs you per year.\n\nThe number is always larger than people expect.`;
    case 'venue_manager':
      return `Work through the onboarding SOP as if you were inducting a new hire right now. Pay attention to the sections you can't fill in — the procedures that only exist verbally, the knowledge that lives in one person's head.\n\nWhat you can't complete is the gap.`;
    default:
      return `Work through the templates at your venue and fill in your actual numbers.`;
  }
}
```

Inject `getRoleHook(role, first_name)` into the Email 1 body string in place of the current generic middle paragraph.
