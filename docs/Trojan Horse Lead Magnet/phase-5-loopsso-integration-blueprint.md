# Phase 5 — Loops.so integration blueprint

Loops replaces the Resend direct-send and the custom scheduler. A single API call on capture creates the contact, sets all segmentation properties, and fires the trigger event. Loops handles the Day 0/3/6/9 timing internally.

**Remove from `.env.local`:** `RESEND_API_KEY`
**Add to `.env.local`:** `LOOPS_API_KEY=your_loops_api_key`

---

## 1. Updated capture route

Replace `sendEmail1(...)` call and function body in `app/api/toolkit-capture/route.ts` with:

```typescript
// Fire Loops — non-blocking
sendToLoops({ first_name, email, role, lead_id: data.id, utm_source, utm_medium, utm_campaign })
  .catch((err) => console.error('[toolkit-capture] Loops error:', err));
```

```typescript
async function sendToLoops({
  first_name,
  email,
  role,
  lead_id,
  utm_source,
  utm_medium,
  utm_campaign,
}: {
  first_name: string;
  email: string;
  role: string;
  lead_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}) {
  const res = await fetch('https://app.loops.so/api/v1/events/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      eventName: 'toolkit_downloaded',
      firstName: first_name,
      role,
      lead_id,
      utm_source:   utm_source   ?? '',
      utm_medium:   utm_medium   ?? '',
      utm_campaign: utm_campaign ?? '',
    }),
  });

  if (!res.ok) {
    throw new Error(`Loops ${res.status}: ${await res.text()}`);
  }

  await db
    .from('toolkit_leads')
    .update({ email_sequence_started: true })
    .eq('id', lead_id);
}
```

The `events/send` endpoint creates the contact if it doesn't exist, applies all properties, and fires the trigger event in one call.

---

## 2. Loops dashboard — contact properties

Create these custom properties under **Settings → Contact properties**:

| Property label | API key | Type | Notes |
|---|---|---|---|
| Role | `role` | String | `owner_operator` \| `venue_manager` \| `ops_manager` |
| Lead ID | `lead_id` | String | Supabase UUID — used in toolkit and unsubscribe URLs |
| UTM Source | `utm_source` | String | Acquisition channel attribution |
| UTM Medium | `utm_medium` | String | |
| UTM Campaign | `utm_campaign` | String | |

---

## 3. Loops dashboard — Loop configuration

**Create a new Loop** under **Loops → New Loop**.

### Trigger
- Type: **Event**
- Event name: `toolkit_downloaded`

### Steps

| Step | Type | Delay from previous | Email |
|---|---|---|---|
| 1 | Send email | 0 (immediate) | Email 1 — Toolkit delivery |
| 2 | Wait | 3 days | — |
| 3 | Send email | 0 | Email 2 — RSA pain |
| 4 | Wait | 3 days | — |
| 5 | Send email | 0 | Email 3 — Onboarding cost |
| 6 | Wait | 3 days | — |
| 7 | Send email | 0 | Email 4 — Conversion |

### Exit conditions
- Contact unsubscribes (automatic)
- No additional exit rules required for MVP

---

## 4. Loops email templates — variable reference

Use these in all four email templates in the Loops editor:

| Variable | Renders |
|---|---|
| `{{contact.firstName}}` | Lead's first name |
| `{{contact.lead_id}}` | Supabase UUID |
| `{{contact.role}}` | Role string for conditionals |

**Toolkit URL** (paste into Email 1 and success page):
```
https://servebyexample.co/api/toolkit-open?id={{contact.lead_id}}
```

**Unsubscribe URL** — use Loops' built-in unsubscribe block instead of the custom `/api/unsubscribe` route. Loops satisfies the Spam Act requirement automatically.

---

## 5. Role-conditional blocks in Loops templates

Loops supports Liquid conditionals. Use this pattern for the role hook in each email:

```
{% if contact.role == "ops_manager" %}
Start with the RSA Incident Log. There's a section for each state — run the compliance checklist across your sites separately. The gaps between venues is the finding.

Look for the friction counter at the end of each section. Fill in your actual numbers across all sites.
{% elsif contact.role == "owner_operator" %}
Start with Section 7 of the onboarding SOP — the annual cost summary. Fill in the friction counters as you go through each section, then carry the totals forward. By the end, you'll have an exact number for what this process costs you per year.

The number is always larger than people expect.
{% elsif contact.role == "venue_manager" %}
Work through the onboarding SOP as if you were inducting a new hire right now. Pay attention to the sections you can't fill in — the procedures that only exist verbally, the knowledge that lives in one person's head.

What you can't complete is the gap.
{% endif %}
```

Apply the same pattern to the role-conditional hooks in Emails 2, 3, and 4 using the copy blocks from the nurture sequence document.

---

## 6. What to remove

With Loops handling all email delivery and scheduling:

- `RESEND_API_KEY` env var — no longer needed
- `sendEmail1` function — replaced by `sendToLoops`
- `getRoleHook` function — role hooks live in Loops templates
- `email_2_sent_at`, `email_3_sent_at`, `email_4_sent_at` columns — Loops owns the schedule; drop these or leave as nullable (they'll remain null unless you add Loops webhooks later)
- `/api/unsubscribe` route — Loops handles unsubscribes natively (keep the route for safety but it won't be linked from emails)

---

## 7. Validation additions for the test log

Add these checks to the end-to-end validation log after Step 4:

| Check | Expected |
|---|---|
| Contact appears in Loops dashboard | Email, firstName, role, lead_id all present |
| `toolkit_downloaded` event visible on contact timeline | ✓ |
| Loop is active and scheduled | Email 1 sent, Emails 2–4 queued |
| Email 1 received via Loops | Same subject and role-specific copy as before |
| Loops unsubscribe link in email footer | Functional |
