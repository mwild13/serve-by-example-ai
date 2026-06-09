# Email 4 contingency vectors and deliverability insulation protocol

---

## Part 1 — Email 4 performance contingency vectors

Email 4 can fail at three distinct points. Diagnose the failure point before changing anything.

**How to diagnose:** Pull the first 6 SA warm contacts at Day 9+.

| Reading | Failure point | Fix vector |
|---|---|---|
| Open rate < 40% | Subject line | Vector 1 |
| Open rate > 40%, clicks = 0 | Body copy / CTA | Vector 2 |
| Clicks > 0, pricing page = 0 conversions | Offer framing or commitment gap | Vector 3 |
| Everything looks fine, still zero conversions | Volume too low to read yet | Wait for NSW data before changing anything |

Do not change more than one element at a time. A simultaneous subject line and CTA change produces unreadable data.

---

### Vector 1 — Subject line failure (open rate < 40%)

Current subject: *"Why most venues stop using the manual system after three weeks"*

This subject is 12 words and reads like a blog headline. In an inbox full of marketing email, it may pattern-match to content rather than a personal message.

Test replacements in order. Apply one to the next batch. Measure open rate against the current baseline.

**Option A — Shorter, direct:**
> Subject: The paper problem
> Preview: You've had the checklist for nine days.

**Option B — Implied conversation:**
> Subject: One thing about the toolkit
> Preview: Most people who work through it hit the same wall.

**Option C — Explicit callback:**
> Subject: Re: the compliance toolkit
> Preview: Nine days in — worth a quick note.

Option C deliberately mimics a reply thread, which increases open rate. Use it only if A and B both underperform — the implied-reply subject line is effective but aggressive.

---

### Vector 2 — Body copy failure (opens, zero clicks)

The current Email 4 body does the pain-to-SBE bridge well but lands on a single hard CTA: a pricing page link. For a contact who has passively received three emails and never replied, visiting a pricing page is a high-commitment action. Some will read to the end and stop rather than click.

**Fix: add a low-commitment alternative CTA immediately after the pricing link.**

Current closing:
```
Lock in your founding rate → servebyexample.co/pricing
```

Replace with:
```
Lock in your founding rate → servebyexample.co/pricing

Or if you'd rather see how it works before committing — reply and I'll
walk you through it. Takes about 10 minutes.
```

The reply CTA gives high-intent but commitment-averse contacts a next step that doesn't require them to make a purchase decision immediately. Replies also generate the highest-quality sales conversations.

This is the single most impactful change available to Email 4 without rewriting the sequence. Apply it if first-batch Email 4 clicks = 0.

---

### Vector 3 — Offer framing failure (clicks, zero pricing page conversions)

If contacts are clicking the pricing page link but not signing up, the problem is downstream of Email 4 — it is on the pricing page itself. This is out of scope to fix via email copy.

Two actions:

**Action 1 — Add a bridge sentence before the CTA in Email 4:**

Between the archetype block and the SBE description, insert:
```
The single-venue plan covers one venue, unlimited staff logins, RSA and
onboarding modules, and the compliance record that updates automatically.
```

This pre-loads what they'll see on the pricing page so the visit is confirmation, not discovery.

**Action 2 — Flag the pricing page for review.**

If 3+ contacts click Email 4 CTA and none convert, the pricing page needs a conversion audit. That work belongs in a separate pass — it is not an email sequence problem.

---

### Vector 4 — Structural failure (low open and click across Emails 2, 3, and 4)

If open rates on all three nurture emails are below 35%, the sequence is losing contacts between Email 1 delivery and Email 2 onwards. Possible causes:

- Contacts opted in but the toolkit didn't engage them (no Notion opens tracked)
- Emails 2 and 3 are landing in promotions or spam after Email 1 was well-received
- The 3-day interval is too short — contacts haven't opened the toolkit yet

**Fix:** Add a single trigger check before Email 2 sends. If the contact has not opened the Notion link (no `/api/toolkit-open` hit for their `lead_id`) within 72 hours of Email 1, delay Email 2 by 3 additional days. This gives non-openers time to engage with the toolkit before being hit with a pain-amplification email about it.

This requires a Supabase check on `toolkit_opened_at` before the Loops Email 2 trigger fires. Flag this for implementation if Email 2 open rates come in below 35%.

---

## Part 2 — Deliverability insulation protocol

### Daily volume architecture at NSW/VIC scale

By Week 4, new sends plus follow-ups stack simultaneously. The daily send total is not just new contacts — it is all threads in flight.

| Thread type | Week 3 daily volume | Week 4 daily volume |
|---|---|---|
| New Email 1s | 40–50 | 40–50 |
| Email 2 follow-ups (from Day -3) | 0 (SA batch, lower volume) | 40–50 |
| Email 3 follow-ups (from Day -7) | 0 | 20–30 |
| **Total daily sends** | **40–50** | **100–130** |

Do not exceed 130 total sends per day from mitch@servebyexample.co. At this volume on a primary domain, you are still well inside Gmail's sending limits (2,000/day on Google Workspace) but approaching the threshold where spam scoring becomes a real risk.

If Week 4 follow-up stacking pushes above 130/day: reduce new Email 1s to 25–30 that week, not the follow-ups. Follow-ups in a live thread carry lower spam risk than new cold outreach.

---

### Manual pacing intervals

Never send the full daily batch in a single burst. A 50-email burst within 5 minutes triggers rate-limiting at the receiving server level for high-volume recipient domains (e.g., Outlook, Google Workspace).

**Pacing rule:** Send in groups of 10–15 with a 20–30 minute gap between groups.

Practical workflow:
- 8:30am: Send contacts 1–15
- 9:00am: Send contacts 16–30
- 9:30am: Send contacts 31–45
- 10:00am: Send contacts 46–50 + any straggler follow-ups

This distributes the send across 90 minutes and mimics natural human sending behaviour. It also gives you a natural break to check for early replies before the next group goes out.

---

### Australian Spam Act compliance

Every cold email is a commercial electronic message under the Spam Act 2003. Three requirements apply:

**1. Sender identification:** Every email must clearly identify Mitch and Serve By Example. The current signature block (Mitch / Serve By Example / servebyexample.co) satisfies this.

**2. Physical address:** Add a one-line address to the signature. A business address, registered address, or P.O. Box is acceptable. A residential address is not required but a suburb and state is sufficient for compliance purposes.

Current signature:
```
Mitch
Serve By Example
servebyexample.co
```

Required signature:
```
Mitch
Serve By Example
servebyexample.co
[Suburb, SA / City, State]
```

**3. Unsubscribe mechanism:** Every cold email must include a functional way to opt out. The current cold email templates do not have this. Add one line at the bottom of every cold Email 1:

```
Not relevant? Reply and let me know — I won't follow up.
```

This is compliant, generates a positive reply signal for deliverability, and is less formal than a link-based unsubscribe. Honour every opt-out within 5 business days (in practice: remove them from the sequence the same day).

---

### Domain health monitoring

Run these checks at the start of each sending week. Takes 5 minutes.

**Check 1 — Google Postmaster Tools**
URL: https://postmaster.google.com
Sign in with the Google Workspace account for servebyexample.co. Check:
- Domain reputation: should be High or Medium. If it drops to Low, pause sending immediately.
- Spam rate: must stay below 0.10%. Above 0.08% is a warning signal.

**Check 2 — MX Toolbox blacklist check**
URL: https://mxtoolbox.com/blacklists.aspx
Enter: servebyexample.co
Run check. If the domain appears on any blacklist: pause all sends, identify the cause (usually a hard bounce spike or spam complaint), and submit a removal request.

**Check 3 — Test send to fresh Gmail**
Send a plain text email from mitch@servebyexample.co to a personal Gmail account. Open it in Gmail → three dots → Show original. Confirm: SPF = Pass, DKIM = Pass, DMARC = Pass, no promotions/spam routing.

Run this check before the first NSW send and weekly after that.

---

### Bounce rate thresholds

| Bounce type | Threshold | Action |
|---|---|---|
| Hard bounce rate in a single batch | > 3% | Pause sends. Audit the contact list for data quality. |
| Hard bounce rate cumulative | > 2% of all sends | Re-validate the enrichment source. Hunter.io results degrade for older domains. |
| Soft bounce rate | > 5% in one day | Investigate — may indicate a receiving mail server issue or a stale contact subset. |

Keep a suppression list. Any hard-bounced address goes on it permanently and is never attempted again, on any channel.

---

### Scaling tool consideration for NSW/VIC

At 40–50 manual sends per day, the per-email send routine takes approximately 3–4 minutes. Week 4 at full stacking (100+ sends) requires 6–8 hours of manual time per day. That is not sustainable for one person also managing replies.

At the point where total daily sends (new + follow-ups) exceed 80 consistently, evaluate a lightweight cold email tool:

**Options:** Instantly.ai ($37/month), Lemlist ($39/month), Woodpecker ($49/month)

These tools connect directly to mitch@servebyexample.co via Gmail API, handle thread continuity for follow-ups, stop the sequence on reply automatically, and enforce pacing intervals without manual intervention. They do not change the from address or domain — all email still originates from Mitch's inbox.

This is not required for Cold SA (50 contacts). Evaluate at the start of NSW Week 1 based on actual manual workload.
