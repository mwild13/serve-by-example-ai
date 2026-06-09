# Day 1 send execution and response triage

---

## Part 1 — Day 1 send execution routine

### Before you open a single compose window

1. Open your tracking CSV or Airtable base. Sort by `temperature = warm` first. These 20–40 contacts send before any cold contacts.
2. Open `servebyexample.co/toolkit` in a separate browser tab. Confirm it loads. Confirm the form is live.
3. Open the cold email sequence document. Keep it visible alongside your inbox — you will be copying from it, not from memory.
4. Set Gmail to plain text mode: **Compose → Format menu (bottom toolbar, looks like an underlined A) → Plain text.** Do this once. Gmail remembers the setting per compose window but resets on each new compose — check it every time.
5. Turn off Gmail's smart compose and autocorrect for this session: **Settings → See all settings → General → Smart Compose → Off**. Autocorrect has broken personalisation tokens mid-send before.

---

### The per-email dispatch routine (repeat for each contact)

**Time budget: 3–4 minutes per email. 25 emails = ~90 minutes. Do not rush.**

**Step 1:** Open your tracking sheet. Read the full row for the contact: name, venue, archetype, sequence (OO or GOM), personalisation note.

**Step 2:** Open a new Gmail compose window. Immediately check: Format → Plain text is active. If not, switch it before typing anything.

**Step 3:** Paste the correct Email 1 template (OO or GOM version) into the body. Do not type it from scratch.

**Step 4:** Replace every token manually:
- `[First Name]` → their first name, exactly as you know them (not how LinkedIn has it if it's wrong)
- `[Personalisation line]` → paste from your personalisation_note column
- Confirm the UTM link is intact — do not retype it, do not let Gmail auto-link it to something else

**Step 5:** Read the full email aloud before sending. One read. This catches: wrong name, wrong venue, broken link, token left unreplaced.

**Step 6:** Fill in the Subject line last — this prevents accidental early sends.

**Step 7:** Send.

**Step 8:** Immediately update your tracking sheet: `email_1_sent` = today's date. Do not batch-update at the end of the session. Update after each send.

---

### Send timing rules

- Send warm contacts between **9:00am and 11:30am ACST.** Opens are highest in this window for SA operators.
- Do not send more than 25 contacts in a single session.
- If you finish the warm list in one session and still have cold SA contacts queued, stop. Cold contacts start the following day.
- If a contact has a personalisation note referencing a recent post or event, check the post is still live before sending. A reference to something deleted or wrong is worse than no reference.

---

### After the session

- Count total sends. Confirm it matches the number of `email_1_sent` dates added to your tracking sheet.
- Check your Sent folder. Spot-check three random emails: plain text confirmed, tokens replaced, UTM link intact.
- Leave Gmail open. Replies from warm SA contacts can arrive within the hour.

---

## Part 2 — Response handling triage matrix

**Universal rule:** The moment any reply arrives, open the tracking sheet and set `replied = TRUE` for that contact. This stops Email 2 and 3 from going to them. Do this before composing your response.

**Response SLA on Day 1:** Reply within 2 hours during 9am–5pm ACST. A warm reply that sits unanswered overnight loses temperature.

---

### Triage matrix

| Reply type | Signals | Response action | Next step | Tracking update |
|---|---|---|---|---|
| **Positive — downloading now** | "Just grabbed it", "thanks for this", "looks useful" | Reply same thread: "Great — work through the friction counters in Section 7, that's where most people get the finding. Let me know what comes up." No pitch. | Monitor for Supabase opt-in. If they don't opt in within 48 hours, send a plain follow-up: "Did the Notion link come through OK?" | `replied = TRUE`, `notes` = positive |
| **Positive — wants to know more about SBE** | "What is Serve By Example?", "tell me more about the product" | Reply same thread: brief, direct. "It's a micro-learning platform for Aus venues — RSA and onboarding modules staff complete on their phone. Compliance record updates automatically. Single venue is $49/month. Worth a look: servebyexample.co/pricing" | This is a high-intent lead. Follow up in 3 days if no further response. | `replied = TRUE`, `notes` = SBE inquiry, `clicked` = update when confirmed |
| **Referral — wrong person** | "You should talk to [Name]", "I'll pass this to our ops manager" | Reply: "Thanks — appreciate it. Who's the best person to reach out to directly?" Get a name and email if possible. | Add the referred contact to your list as `source = referral`, `temperature = warm`, personalisation note = "I was speaking with [Referrer Name] at [Group] and they suggested you'd be the right person for this." | `replied = TRUE`, `notes` = referred to [Name] |
| **Soft no — not right now** | "Flat out at the moment", "maybe in a few months", "not a priority right now" | Reply: "No problem — I'll leave it with you." Nothing more. | Add a calendar reminder for 6 weeks. Re-contact then with a single plain email: "Checking back in — the toolkit is still live at [link] if it's a better time now." | `replied = TRUE`, `notes` = not now, re-contact [date] |
| **Hard no — not interested** | "Not for us", "we've got this covered", "please remove me" | Reply: "Understood — won't follow up again." One line. No pitch. No asking why. | Remove from all sequences. Mark `replied = TRUE`, `notes` = not interested. Do not re-contact. | `replied = TRUE`, `notes` = hard no — do not re-contact |
| **Out of office** | Auto-reply with return date | No response needed. Note their return date. | Re-send Email 1 on their first day back. Set a calendar reminder. | `notes` = OOO, back [date] — resend E1 |
| **Out of office — no return date** | Auto-reply, no date given | No response needed. | Re-send Email 1 in 7 days. | `notes` = OOO no date — resend E1 in 7 days |
| **Hard bounce** | Delivery failure: user unknown / domain not found / address rejected | Email address is invalid. Do not retry. | Switch to LinkedIn DM. Update `channel = linkedin_dm`. Use the cold DM script from the outreach note. | `notes` = hard bounce — switched to LinkedIn DM |
| **Soft bounce** | Delivery failure: mailbox full / server temporarily unavailable | Retry the same email in 24 hours. One retry only. | If second attempt bounces: treat as hard bounce, switch to LinkedIn DM. | `notes` = soft bounce — retry [date] |
| **No subject reply / confused** | "Who is this?", "how did you get my email?" | Reply honestly and briefly: "Hi [Name] — I'm Mitch, I build compliance tools for Aus hospitality venues. Found your details through [LinkedIn / AHA SA / CBS register]. If you'd prefer not to hear from me, just say the word and I'll stop." | If they confirm they don't want contact: hard no process. If they engage: continue as positive. | `notes` = identity query — responded [date] |
| **Question about the toolkit content** | "What's in it?", "which states does it cover?", "is it really free?" | Reply directly: "Covers all eight states for the RSA log, NSW/VIC/QLD/SA are the most detailed. Onboarding SOP is generic enough to work for any venue type. Free, no catch — just grab it at [link]." | This is a warm signal. They're considering it. | `replied = TRUE`, `notes` = toolkit question |

---

### End-of-day Day 1 review

Before closing your inbox:

1. Count: total replies received vs. total sent. Note the ratio.
2. Count: opt-ins in Supabase `toolkit_leads` table that have `utm_source = email`. These are the first real funnel entries.
3. Any reply left unanswered? Handle it before closing.
4. Any hard bounces? Switch those contacts to LinkedIn DM before tomorrow.

This review takes 10 minutes and gives you the first real signal from the funnel.
