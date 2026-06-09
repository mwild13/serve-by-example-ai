# Loops.so build checklist

Work through steps 1–4 in order. The Loop (Step 4) must reference the templates created in Step 3, so templates first.

---

## Step 1 — Env changes

In `.env.local` (and in your Vercel environment variables):

| Action | Variable |
|---|---|
| Remove | `RESEND_API_KEY` |
| Add | `LOOPS_API_KEY=your_loops_api_key` |

---

## Step 2 — Contact properties

**Settings → Custom attributes → Add attribute**

Create all five before touching templates or the Loop.

| Label | API key | Type |
|---|---|---|
| Role | `role` | String |
| Lead ID | `lead_id` | String |
| UTM Source | `utm_source` | String |
| UTM Medium | `utm_medium` | String |
| UTM Campaign | `utm_campaign` | String |

---

## Step 3 — Email templates

**Emails → New template** for each. Use a plain-text layout (single text block). Add Loops' native unsubscribe element in the footer of every template — do not write a custom unsubscribe URL.

The `{{contact.firstName}}`, `{{contact.lead_id}}`, and `{% if %}` blocks are Loops Liquid syntax. Paste them exactly as written.

---

### Template 1 — Toolkit delivery

**Subject:** Your free compliance and onboarding toolkit
**Preview text:** Duplicate it. Don't read it.

```
Hi {{contact.firstName}},

Here's your free Australian Hospitality Compliance & Onboarding Toolkit:

https://servebyexample.co/api/toolkit-open?id={{contact.lead_id}}

This is a working document — not a guide to read, a tool to fill out.
Duplicate it into your Notion workspace and work through it at your venue.

{% if contact.role == "ops_manager" %}
Start with the RSA Incident Log. There's a section for each state — run
the compliance checklist across your sites separately. The gaps between
venues is the finding.

Look for the friction counter at the end of each section. Fill in your
actual numbers across all sites.
{% elsif contact.role == "owner_operator" %}
Start with Section 7 of the onboarding SOP — the annual cost summary.
Fill in the friction counters as you go through each section, then carry
the totals forward. By the end, you'll have an exact number for what this
process costs you per year.

The number is always larger than people expect.
{% elsif contact.role == "venue_manager" %}
Work through the onboarding SOP as if you were inducting a new hire right
now. Pay attention to the sections you can't fill in — the procedures that
only exist verbally, the knowledge that lives in one person's head.

What you can't complete is the gap.
{% endif %}

More on what to do with what you find in a few days.

Mitch
Serve By Example
servebyexample.co
```

---

### Template 2 — RSA compliance pain

**Subject:** If a licensing officer walked in tonight...
**Preview text:** What would you hand them?

```
Hi {{contact.firstName}},

{% if contact.role == "ops_manager" %}
Three venues. Three different log formats. One of them is a spreadsheet
that hasn't been updated since February.

If a licensing investigation is triggered by an incident at any one site,
that register is what stands between you and a show-cause notice.
{% elsif contact.role == "owner_operator" %}
You explained RSA to them on the first shift. Verbally, in a five-minute
walk-through before service. Nothing written down. No sign-off.

If a patron incident from that shift ends up in front of a licensing
officer, that conversation didn't happen.
{% elsif contact.role == "venue_manager" %}
Your FOH staff from last month completed the onboarding verbally. The RSA
section was covered. But it wasn't signed. It wasn't dated.

There's no record that it happened — which means, legally, it didn't.
{% endif %}

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
```

---

### Template 3 — Onboarding cost pain

**Subject:** The number most operators don't want to calculate
**Preview text:** 70–80% annual turnover. Here's what it costs.

```
Hi {{contact.firstName}},

Australian hospitality runs at 70–80% annual staff turnover.

That's not a general statistic. That's the number of times your venue
repeats this process — from scratch, on your time — every single year.

{% if contact.role == "ops_manager" %}
Across a group of five venues at average turnover, you're running parallel
onboarding cycles at multiple sites every month. Each site uses a different
format. Each manager delivers it differently. The training investment walks
out with the person every time.

There's no institutional memory. There's only the next conversation.
{% elsif contact.role == "owner_operator" %}
Section 7 of your onboarding SOP has an annual cost summary. If you've
filled in the friction counters — time per hire, hires per year, your
loaded hourly rate — you now have the exact figure.

Not an estimate. The actual annual cost of doing this manually, at your
venue, at your turnover rate.

Most operators see that number and feel two things: surprise, then quiet
recognition that they already knew it.
{% elsif contact.role == "venue_manager" %}
Most staff who leave do it in the first four weeks. Not because the venue
was bad — because they didn't feel like they knew what they were doing.

The Week 3–4 review in Section 6 of your SOP exists because that
conversation, consistently run, is one of the lowest-cost retention tools
in hospitality. Research consistently links it to reduced 90-day attrition.

Most venues never run it.
{% endif %}

The manual SOP gives you the structure. The problem is consistency —
whether it happens every time, with every hire, regardless of how busy
the venue is that week.

That's the gap Serve By Example closes. Worth knowing: the founding rate
is still $49/month. Future rate is $79.

Mitch
Serve By Example
servebyexample.co
```

---

### Template 4 — Conversion

**Subject:** Why most venues stop using the manual system after three weeks
**Preview text:** You've got the paper version. Here's the problem with it.

```
Hi {{contact.firstName}},

You've had the toolkit for nine days.

If you've worked through it, you've done something most operators don't:
you've quantified the problem. You have a number for what manual onboarding
costs. You have a checklist that shows exactly where your compliance record
fails under inspection.

Most venues stop here. Not because the manual system doesn't work — it
does. But because it depends entirely on one person having the time and
the discipline to use it consistently, every single time.

{% if contact.role == "ops_manager" %}
In a multi-site operation, that breaks at the second venue, or when a
site manager changes, or when one location gets slammed during a busy
period and the paperwork slides. The manual system requires perfect
execution across every site, every time.

That's not how venues operate.
{% elsif contact.role == "owner_operator" %}
For an owner-operator, it breaks on a Friday. You're behind the bar,
you're short-staffed, and the new casual who started at 5pm has had a
verbal rundown at best. The template is still on your desk on Monday.
{% elsif contact.role == "venue_manager" %}
For a venue manager, it breaks the moment you delegate. Once the
onboarding checklist moves from your hands to a senior staff member's,
the sign-offs stop happening consistently, the reviews get skipped, and
within six weeks it's back to "we do this verbally."
{% endif %}

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
```

---

## Step 4 — Create the Loop

**Loops → New Loop**

### Trigger
- Type: **Event**
- Event name: `toolkit_downloaded` (must match the string in the route exactly)

### Steps

| # | Type | Delay | Template |
|---|---|---|---|
| 1 | Send email | 0 (immediate) | Template 1 — Toolkit delivery |
| 2 | Wait | 3 days | — |
| 3 | Send email | 0 | Template 2 — RSA pain |
| 4 | Wait | 3 days | — |
| 5 | Send email | 0 | Template 3 — Onboarding cost |
| 6 | Wait | 3 days | — |
| 7 | Send email | 0 | Template 4 — Conversion |

### Exit conditions
- Contact unsubscribes — automatic, no configuration needed
- No other exit rules required at MVP

### Activate
Set the Loop to **Active** before testing. Loops will not fire for contacts while the Loop is in draft.

---

## Step 5 — Validation additions

After completing Steps 1–4, add these checks to the end-to-end validation log:

| Check | Expected |
|---|---|
| Contact appears in Loops dashboard after test opt-in | Email, firstName, role, lead_id all present |
| `toolkit_downloaded` event visible on contact timeline | ✓ |
| Loop is active and Email 1 sends immediately | ✓ |
| Emails 2–4 queued with correct delay | Visible in Loop execution view |
| Role-conditional block renders correctly for test role | Matches selected role |
| Loops unsubscribe link present in Email 1 footer | Functional |
| `email_sequence_started` in Supabase set to `true` | After Loops call completes |
