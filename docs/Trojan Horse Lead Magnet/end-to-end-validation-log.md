# End-to-end validation log

**Test date:** _______________
**Tester:** _______________
**Test email used:** _______________
**Test role selected:** _______________
**Environment:** production / staging

---

## Pre-flight checklist

| # | Check | Status |
|---|---|---|
| 1 | `SUPABASE_URL` set in `.env.local` | [ ] |
| 2 | `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local` | [ ] |
| 3 | `LOOPS_API_KEY` set in `.env.local` | [ ] |
| 4 | `NOTION_TOOLKIT_URL` set to live bundle URL | [ ] |
| 5 | `APP_URL` set to `https://servebyexample.co` | [ ] |
| 6 | `toolkit_leads` table exists in Supabase | [ ] |
| 7 | Email sequence tracking columns exist (`email_2/3/4_sent_at`) | [ ] |
| 8 | RLS policy active on `toolkit_leads` | [ ] |
| 9 | `servebyexample.co` sender domain verified in Resend | [ ] |
| 10 | Next.js build passes (`next build`) with no errors | [ ] |

---

## Step 1 — Form submission

Navigate to `servebyexample.co/toolkit` in a private/incognito window.

| Check | Expected | Result |
|---|---|---|
| Page loads without errors | No console errors | |
| All three form fields render | First name, email, role dropdown | |
| Role dropdown shows all three options | Owner or operator / Venue manager / Group or multi-venue ops manager | |
| Submit with empty fields | Inline validation prevents submit | |
| Submit with invalid email | Inline error: "A valid email address is required." | |
| Submit with role unselected | Inline error: "Please select your role." | |
| Valid submit — button state | Button changes to "Sending…" | |

---

## Step 2 — Success page

After valid form submission:

| Check | Expected | Result |
|---|---|---|
| Redirects to `/toolkit/success` | URL contains `?role=&lead_id=` | |
| `lead_id` present in URL | UUID format | |
| "Your toolkit is ready." heading visible | ✓ | |
| Email confirmation copy visible | "Check for an email from Mitch…" | |
| "Open the Notion toolkit" button renders | Points to `/api/toolkit-open?id=…` | |
| Role hint card visible | Matches selected role | |

---

## Step 3 — Supabase record

Check the `toolkit_leads` table in Supabase dashboard:

| Check | Expected | Result |
|---|---|---|
| Row inserted | 1 row with test email | |
| `first_name` correct | As entered | |
| `email` lowercase | Normalised correctly | |
| `role` correct | Matches dropdown selection | |
| `utm_source` / `utm_medium` / `utm_campaign` | Null (no UTM on test URL) | |
| `toolkit_delivered` | `false` (not yet clicked) | |
| `email_sequence_started` | `false` (pre-email send) | |
| `consent_marketing` | `true` | |
| `consent_at` | Timestamp close to submission time | |

---

## Step 4 — Email 1 delivery

Check the test inbox (allow up to 60 seconds):

| Check | Expected | Result |
|---|---|---|
| Email arrives | Subject: "Your free compliance and onboarding toolkit" | |
| From address | `mitch@servebyexample.co` | |
| Greeting | "Hi [First Name]," — correct name | |
| Toolkit URL | Links to `/api/toolkit-open?id=…` | |
| Role-specific hook present | Correct block for selected role | |
| Unsubscribe link present | Links to `/api/unsubscribe?id=…` | |
| No SBE pitch or pricing in email | ✓ | |
| `email_sequence_started` in Supabase | `true` after email fires | |

---

## Step 5 — Notion redirect

Click the toolkit link in Email 1 (or the button on the success page):

| Check | Expected | Result |
|---|---|---|
| `/api/toolkit-open` redirects | Opens Notion bundle URL | |
| Notion page loads | Both assets visible | |
| `toolkit_delivered` in Supabase | `true` after click | |

---

## Step 6 — Unsubscribe

Click the unsubscribe link in Email 1:

| Check | Expected | Result |
|---|---|---|
| Renders unsubscribe confirmation page | "You've been removed…" message | |
| `consent_marketing` in Supabase | `false` | |
| `unsubscribed_at` in Supabase | Timestamp set | |

---

## Step 7 — Duplicate email handling

Re-submit the form with the same email address:

| Check | Expected | Result |
|---|---|---|
| No error shown to user | Redirects to success page silently | |
| No duplicate row in `toolkit_leads` | Single row for email | |

---

## Step 8 — UTM tracking

Re-test with UTM parameters appended to the URL:
`/toolkit?utm_source=linkedin&utm_medium=dm&utm_campaign=outreach-jun26`

| Check | Expected | Result |
|---|---|---|
| `utm_source` in Supabase | `linkedin` | |
| `utm_medium` in Supabase | `dm` | |
| `utm_campaign` in Supabase | `outreach-jun26` | |

---

## Step 9 — Secondary entry point

Navigate to `servebyexample.co` (homepage):

| Check | Expected | Result |
|---|---|---|
| Secondary CTA block visible | "Not ready to sign up yet?" section | |
| CTA link points to `/toolkit` | ✓ | |

---

## Issues log

| # | Step | Description | Status |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

---

## Sign-off

All checks passed: **Yes**

Signed off by: Mitch
Date: 9 June 2026

**Phase 5 notes:** Resend replaced by Loops fire-and-forget. Duplicate guard confirmed silent. Email 1 role-conditional hook parsed correctly. Loops contact shows all five custom properties. Emails 2–4 queued in Loop execution view.
