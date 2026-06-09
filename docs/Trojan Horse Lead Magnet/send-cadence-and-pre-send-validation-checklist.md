# Send cadence and pre-send validation checklist

---

## Daily send cadence

### Batch 1 — SA warm network

Warm contacts get personal outreach first (SMS, WhatsApp, or LinkedIn DM). Email is the fallback if no response after 5 days.

**Day 1–2:** Send all warm DMs and SMS. No daily cap — this is personal, not bulk.
**Day 6–7:** Anyone who didn't respond gets Email 1 from the cold sequence, lightly edited to acknowledge the relationship (e.g., "Hey [First Name], putting this in your inbox in case the DM got buried…").
**No further automated follow-up for warm contacts.** If Email 1 gets no response, a single personal follow-up call or voice note is more appropriate than Email 2 or 3.

---

### Batch 1 — SA cold

| Week | Daily volume | Days active | Total contacts |
|---|---|---|---|
| Week 1 | 20–25 sends | Tue–Thu | ~60–75 |
| Week 2 | 20–25 sends | Tue–Thu | ~60–75 |

Start conservative in Week 1 even on a mature domain. Email 2 and Email 3 follow-ups stack behind the initial sends — by Week 2 you are running three threads simultaneously (new E1s + E2 follow-ups from Week 1 + early E3s). 20–25 new contacts per day keeps the daily total manageable.

**Best send window:** 8:30–10:30am ACST. Operators check email before service, not during it. Avoid Monday (inbox recovery) and Friday (wind-down). Tuesday through Thursday is the highest-response window.

---

### Batch 2 — NSW and VIC cold

Start Batch 2 only after Batch 1 SA cold is complete. This keeps the data clean — SA performance informs whether to adjust copy or subject lines before scaling.

| Week | Daily volume | Days active | Weekly total |
|---|---|---|---|
| Weeks 3–4 (NSW) | 40–50 sends | Mon–Thu | ~160–200 |
| Weeks 5–6 (VIC) | 40–50 sends | Mon–Thu | ~160–200 |

Send window for NSW/VIC: 8:30–10:30am AEDT/AEST. Same reasoning — catch operators before the floor opens.

**Thread management rule:** The moment a contact replies, remove them from the sequence. Do not send Email 2 or 3 to anyone who has replied, regardless of whether the reply was positive, neutral, or a brush-off. Reply = live conversation. Treat it as one.

---

## Weekly rhythm

Each week has three distinct tasks running in parallel once Batch 2 starts:

1. **Source and prep** (Monday): Build the next week's contact list, verify emails, write personalisation lines. Never send to a contact you prepped the same day.
2. **Send** (Tuesday–Thursday): New Email 1s and scheduled follow-up threads.
3. **Review** (Friday): Check click data in UTM reports, Loops open rates, Supabase opt-in count. Flag anything that looks off before the next week's sends.

---

## Pre-send validation checklist

Run this once before the first contact in Batch 1 receives anything. Takes 15 minutes.

### 1. Funnel chain test
- [ ] Open a private/incognito browser window
- [ ] Go to `servebyexample.co/toolkit?utm_source=email&utm_medium=cold&utm_campaign=outreach-jun26&utm_content=e1-oo`
- [ ] Complete the form with a test email address (use a personal Gmail or similar)
- [ ] Confirm the success screen loads and the Notion link is visible
- [ ] Confirm Email 1 arrives in the test inbox within 2 minutes
- [ ] Confirm the Notion link in Email 1 resolves to the correct page and is accessible without a Notion login

### 2. UTM tracking verification
- [ ] After the test form submission, check Supabase `toolkit_leads` table — confirm `utm_source`, `utm_medium`, `utm_campaign` columns populated correctly
- [ ] If using Plausible or Google Analytics, confirm the page view on `/toolkit` shows the UTM parameters in the source report

### 3. Role-conditional email check
- [ ] Submit a second test lead using role = `ops_manager`
- [ ] Confirm Email 1 body contains the ops_manager role hook (RSA log / multi-site / gaps between venues language), not the owner_operator hook
- [ ] Repeat for `venue_manager` role if time permits

### 4. Email 1 format check
- [ ] Forward the test Email 1 to mitch@servebyexample.co and open it on both desktop and mobile
- [ ] Confirm plain text rendering — no broken HTML, no stray tags
- [ ] Confirm the toolkit URL is a live hyperlink, not broken text
- [ ] Confirm the unsubscribe link is present and functional

### 5. Sending domain check
- [ ] Send a test email from mitch@servebyexample.co to a Gmail address
- [ ] Open Gmail → click the three dots → "Show original" → confirm: SPF = Pass, DKIM = Pass, DMARC = Pass
- [ ] Confirm the email does not land in the Promotions or Spam tab

### 6. Reply routing
- [ ] Send a reply from the test Gmail to mitch@servebyexample.co
- [ ] Confirm the reply lands in Mitch's inbox correctly
- [ ] Confirm the reply-to address on outbound emails is mitch@servebyexample.co (not a no-reply)

### 7. First contact spot-check
- [ ] Pull the first 5 contacts from the Batch 1 warm list
- [ ] Confirm each has: first name, verified email, personalisation note written
- [ ] Read each Email 1 draft aloud — if any line sounds like a template, rewrite the personalisation line

All green: you're clear to send.
