# Day 1 performance analysis and Batch 2 optimization

---

## Day 1 metrics — raw

| Metric | Raw | Rate |
|---|---|---|
| Sent | 25 | — |
| Delivered | 24 | 96% |
| Tracking clicks (landing page) | 11 | 45.8% of delivered |
| Supabase opt-ins | 6 | 54.5% of clicks / 25% of delivered |
| Inbox replies | 3 | 12.5% of delivered |
| Clicked but did not opt in | 5 | 45.5% of clicks |

---

## What the numbers actually mean

### The 25% end-to-end conversion

The user is measuring 6/25 sent = 24% opt-in velocity. The more useful framing is the two-step rate: 45.8% click-through from Email 1, then 54.5% landing page opt-in.

Both steps are performing above the funnel targets (5–8% cold click target; 35% landing page target). But this is warm data. These are people Mitch knows, or knows of, who received a personalised email from a recognisable sender. That trust is doing significant work and it will not transfer to cold contacts.

The honest read: the offer is strong, the landing page is converting, and the warm network is responding well. The 25% velocity figure is real but it is a warm baseline, not a cold projection.

### The 54.5% landing page conversion

This is the cleanest signal in the data. It tells us the landing page copy and form are not the problem. A cold visitor who arrives with curiosity will convert at a similar rate — the page does its job.

### The 5 who clicked but did not opt in

These are the most interesting contacts on Day 1. They saw the Email 1 offer, were curious enough to click, arrived at the landing page, and left without submitting. Possible reasons: form friction, distracted mid-session, not ready to give an email address. None of these are messaging failures. They are warm contacts — worth a direct follow-up in 48 hours asking simply whether the page loaded correctly. At least one will convert.

### The 12.5% reply rate

This is the strongest single signal from Day 1. A 12.5% reply rate from cold email would be exceptional. From warm outreach it confirms the framing (toolkit offer, no pitch, no ask) is not triggering defensiveness. Contacts are responding like it's a useful thing from someone they trust — which is the exact goal.

### The GOM referral

The highest-value outcome of the batch. A Group Ops Manager referral from a warm contact means: (a) the pain narrative is landing at the group operations level, and (b) the referrer trusted the offer enough to put their own name behind it. That referred contact enters the sequence as the warmest possible cold lead. Process it immediately using the referral row from the triage matrix.

---

## What Batch 2 cold numbers will look like

Set this expectation before Batch 2 starts. Cold outreach will not replicate warm performance.

Realistic cold projections based on Day 1 warm data:

| Metric | Warm actual | Cold projection |
|---|---|---|
| Click-through (Email 1) | 45.8% | 5–12% |
| Landing page opt-in | 54.5% | 45–55% (page converts regardless of traffic source) |
| End-to-end send → opt-in | 25% | 2.5–6% |
| Reply rate | 12.5% | 1–3% |

At 350 cold contacts in Batch 2 at a 4% end-to-end conversion, that is 14 additional opt-ins. Combined with SA warm opt-ins and Email 2/3 follow-up conversions, the realistic pipeline into the nurture sequence before Batch 2 completes is 25–40 contacts.

That is enough volume to get a clear read on Email 4 conversion (the waitlist/pricing CTA) and whether the nurture sequence closes. It is not enough to guarantee $1K MRR from outreach alone — the paid conversion rate on Email 4 is the unknown that Batch 2 will begin to answer.

---

## The single Batch 2 optimization

**What to change:** Add a one-line credibility anchor to cold Email 1, immediately after the personalisation opener.

**Why this one:** The Day 1 warm data shows the offer and the landing page are not the problem. The only structural difference between warm and cold Email 1 is that warm contacts already know Mitch exists. Cold contacts receive an email from an unknown sender offering a free tool. The first question they answer before clicking is: *why should I trust this person?* The current cold Email 1 does not answer it.

**The fix — add this line after the personalisation opener in both OO and GOM cold Email 1 versions:**

> I've spent 15+ years managing training across Aus hospitality venues — built this because I kept seeing the same compliance gaps across different operators.

This line goes between the personalisation observation and the toolkit description. It does three things: establishes lived-experience credibility, signals the toolkit was built by a practitioner not a software company, and pre-empts the trust barrier before it forms.

**What not to change:** Do not touch Email 2 or Email 3. Do not change the subject lines. Do not add more content to Email 1. One change, cleanly isolated, so Batch 2 data tells you specifically whether the credibility anchor improved click-through in cold outreach.

---

## Updated cold Email 1 — with credibility anchor

### Version A — Owner-Operator (cold)

```
Hi [First Name],

[Personalisation line.]

I've spent 15+ years managing training across Aus hospitality venues —
built this because I kept seeing the same compliance gaps across different
operators.

Put together a free Notion toolkit for Aus venue operators — state-by-state
RSA incident logs, staff onboarding SOPs, and a time-cost calculator that
shows you what manual training admin is actually costing per year.

servebyexample.co/toolkit?utm_source=email&utm_medium=cold&utm_campaign=outreach-jun26&utm_content=e1-oo

Mitch
Serve By Example
servebyexample.co
```

### Version B — Group Ops Manager (cold)

```
Hi [First Name],

[Personalisation line.]

I've spent 15+ years managing training across Aus hospitality venues —
built this because I kept seeing the same compliance gaps across different
operators.

Put together a free Notion toolkit for multi-venue operators — state-by-state
RSA incident logs with per-site audit checklists, and onboarding SOPs built
to roll out consistently across locations.

servebyexample.co/toolkit?utm_source=email&utm_medium=cold&utm_campaign=outreach-jun26&utm_content=e1-gom

Mitch
Serve By Example
servebyexample.co
```

---

## Decision gate before Batch 2

Before sending the first cold contact, confirm:

- [ ] Cold Email 1 templates updated with the credibility anchor
- [ ] Day 1 warm replies fully triaged (all three replied contacts actioned)
- [ ] GOM referral added to list and ready to send as first priority
- [ ] 5 warm non-converters followed up (plain one-liner: "Did the page load OK?")
- [ ] Supabase shows 6 opt-ins with correct UTM source = email
- [ ] Loops shows all 6 contacts entered the Day 3 nurture queue

All green: Batch 2 cold SA starts tomorrow morning.
