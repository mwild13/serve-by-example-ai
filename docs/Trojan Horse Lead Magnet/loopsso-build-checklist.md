# Loops.so build checklist

**Status, 2026-10-23: a plan, not built.** The site sends email through Brevo (`lib/notifications/brevo.ts`), not Resend or Loops, and every secret lives in Cloudflare Pages environment variables, never in an `.env` file (`CLAUDE.md`). Read Step 1 with that in mind.

Work through steps 1–4 in order. The Loop (Step 4) must reference the templates created in Step 3, so templates first.

---

## Step 1 — Env changes

In Cloudflare Pages environment variables (there is no `.env` file in this repo):

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

### Templates 1 to 4

Take the copy for all four emails from `4-part-email-nurture-sequence-copy.md` (revised 2026-10-23). The drafts that used to sit here promised an "RSA Incident Log" that was never built and a $49 founding price that no longer exists, so they were removed.

When pasting into Loops, swap `[First Name]` for `{{contact.firstName}}` and turn each `--- [role] ---` block into a Liquid branch:

```
{% if contact.role == "ops_manager" %}
...ops_manager block...
{% elsif contact.role == "owner_operator" %}
...owner_operator block...
{% else %}
...venue_manager block...
{% endif %}
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
