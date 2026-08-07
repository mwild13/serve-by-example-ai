# Serve By Example — Feature & Data Audit

Compiled directly from source (components, `lib/mastery.ts`, `lib/badges.ts`, `lib/management/types.ts`) rather than the tree file, which wasn't present in the repo. Confidence is high for anything with a component read below; a few Management sections are typed but not fully read (flagged inline) — verify those before quoting numbers externally.

---

## SECTION 1: STAFF DASHBOARD

### Pre-Shift Home (`PreShiftHome.tsx`)
**What it does:** The staff landing tab. Shows a skill-level header, a "Focus for today" coaching card driven by the user's weakest category, a rotating 101 Knowledge fact carousel, two daily-rotating cocktail spotlight cards, a 4-track horizontal progression bar (Challenges / Modules / Scenarios / Live Scenarios), a stats strip, and a recent-badges row.

**Data tracked:** Skill level (1–10, derived server-side), day streak (localStorage-based consecutive-day counter), category mastery % per track (technical/service/compliance, computed from `moduleProgress`), modules complete vs. total, scenarios started, Arena (live scenario) modules passed, challenges completed (of 5), average mastery %, badges earned + 3 most recent.

**Manager value:** This is the retention/habit-formation surface — the "focus for today" logic auto-targets the user's single weakest category so undertrained staff get nudged without a manager manually assigning it. The streak and progression bar are what turn training into a daily habit rather than a one-off onboarding chore.

---

### Modules — 3-Stage Mastery Path (`DynamicModuleNav.tsx`, `RapidFireQuiz.tsx`, `ModuleVerify.tsx`)
**What it does:** 20 structured modules (7 technical/bartending, 7 service, 6 compliance — see `V3_MODULE_CATEGORIES`). Each module runs a rapid-fire true/false quiz requiring 5 correct answers in a row to clear, with keyboard shortcuts (T/F), a speed bonus (<3s response), and a streak-pop animation at 3+ in a row. `ModuleVerify` gates final mastery with a verification quiz.

**Data tracked:** Consecutive-correct streak per session, per-scenario `mastery_level` (0–3, via Elo-backed spaced repetition engine in `lib/mastery.ts`), Elo rating per scenario (K=32, starts at 1200), `next_review_at` spaced-repetition date (exponential backoff: 1/4/9/16 days by mastery level), `consecutive_fails` (2+ triggers "bridge" logic to serve an easier follow-up scenario), binary `is_mastered` flag written by the verify-quiz gate.

**Manager value:** This is the actual skill signal the rest of the platform (readiness score, predictive gaps, leaderboards) is built on. The Elo + spaced-repetition design means "mastered" isn't just "answered once correctly" — it decays if unreviewed, which is what lets Compliance/Predictive later flag "knowledge decay risk" instead of trusting a stale one-time pass.

---

### Scenario Training / Stage 4 (`DashboardTrainer.tsx`)
**What it does:** Written scenario practice — staff read a situational prompt and type a free-text response, evaluated for mastery progression (distinct from the AI-scored Arena).

**Data tracked:** Module progress %, module mastery %, per-scenario mastery level, mastery-engine feedback object per attempt (level, level change, Elo delta, "is bridge" flag, confidence-accuracy classification).

**Manager value:** Bridges rote quiz recall into applied, written responses — a proxy for how staff would actually phrase things on the floor, before they're evaluated live in the AI Arena.

---

### AI Arena / Live Scenarios (`ArenaPage.tsx`)
**What it does:** 20 GPT-4o-mini-scored roleplay scenarios (one per module) — realistic, high-friction hospitality situations (RSA refusal, VIP conflict, fire alarm, till discrepancy, etc.). Staff write a full response to a Situation/Context/Task prompt and receive a 0–100 score plus "what you did well" / "room for improvement" from the model.

**Data tracked:** Attempts per scenario, best score, pass/fail (per module), aggregate "X of 20 complete."

**Manager value:** This is the closest the platform gets to a live-service simulation, and it's the 20% weight in the computed `service_score` (`computedServiceScore = overallProgress*0.8 + roleplayProgress*0.2` in `lib/mastery.ts`) — i.e. quiz mastery alone caps a staff member's readiness score unless they've also proven it under a roleplay scenario.

---

### Interactive Challenges (`ChallengesPage.tsx`)
**What it does:** 5 tap-based mini-games, no typing: Sequence Sort, Fill the Blank, Match Pair, Spot the Error, Multiple Choice. Runs as a 5-step wizard with a summary screen and review mode.

**Data tracked:** Per-challenge completion (synced to server + cached in localStorage), error count per session, final score (5 − errors), personal best (localStorage).

**Manager value:** Lowest-friction on-ramp for staff who won't engage with longer-form quiz/scenario content — useful for casual daily engagement and for identifying quick knowledge gaps without the commitment of a full module.

---

### Cocktail Library (`CocktailLibrary.tsx`, `lib/cocktails.ts`)
**What it does:** Reference library of cocktails across 10 categories (sours, spirit-forward, ancestral, highballs, fizz, tiki, duos/trios, sparkling, hot, flips/nogs), each with ingredients, method, glass, garnish, and a bartender tip. A featured "Top 15 Most Common" subset and an "Australian Originals" tag exist in the data model.

**Data tracked:** No mastery/progress tracking — this is a lookup reference, surfaced contextually via the daily-rotating spotlight cards on the home tab.

**Manager value:** Reduces "what do I make this?" friction on the floor without needing a manager or a paper binder; standardizes recipe/method across staff so drinks come out consistent regardless of who's behind the bar.

---

### 101 Knowledge Base (`KnowledgeBase.tsx`, `lib/knowledge-base.ts`)
**What it does:** Quick-reference facts across Spirits, Beer, Wine, Cocktails, and Non-Alcoholic categories, each with key facts and tags. Surfaced via a rotating carousel on the home tab (auto-advances every 20s) as well as a full browsable library.

**Data tracked:** No mastery tracking — reference-only, same role as the Cocktail Library but for product knowledge rather than recipes.

**Manager value:** Same as Cocktail Library — a standing reference that reduces reliance on senior staff for basic product questions during service.

---

### Progress / "Me" (`ProgressOverview.tsx`)
**What it does:** Personal stats hub with three tabs — Overview (summary + bar/radar charts of category scores), Modules (expandable mastery grid by category with per-category certification status), Activity (scenario stats + Arena history log).

**Data tracked:** Modules mastered/total, best module mastery %, weakest category, total sessions, badges earned/total, review-queue size (spaced-repetition items due), category certification status (all modules in a category mastered = "certified"), per-category avg scores (bartending/sales/management scores mapped to technical/service/compliance).

**Manager value:** This is the self-serve version of what a manager sees in Mission Control for one person — gives staff visibility into exactly what's gating their next certification, which reduces "why haven't I been given more shifts" friction.

---

### Badges & Achievements (`BadgesView.tsx`, `lib/badges.ts`)
**What it does:** Tiered badge system — 4 tiers per category (Starter/Skilled/Expert/Master at 0%/50%/80%/95% avg mastery) across Technical, Service, Compliance, plus streak badges (3/7/30-day) and two special badges: "Pro" (25 correct answers in a row across any module) and "SBE Elite" (80%+ of all modules mastered platform-wide, numbered per-user).

**Data tracked:** Per-badge earned/locked state with progress bars showing current vs. required (e.g. "62 / 80% avg mastery"), best correct-answer streak, SBE Elite sequence number.

**Manager value:** Gamification layer that converts the underlying mastery data into recognizable milestones — "SBE Elite #3" is a shareable, ego-driven marker that's more motivating on shift than a raw percentage, and it's cheap distribution/word-of-mouth signal for the platform itself.

---

### Onboarding Diagnostic (`DiagnosticFlow.tsx`)
**What it does:** First-login modal — a short question set used to establish a starting skill baseline before regular training begins.

**Data tracked:** Per-question correctness rolled up into category scores (`onComplete(categoryScores)`).

**Manager value:** Avoids force-feeding fundamentals to staff who already know them and flags real gaps in staff who claim experience but test weak — sets the initial weakest-category target the "Focus for today" card uses from day one.

---

## SECTION 2: MANAGEMENT DASHBOARD (Mission Control)

### Overview — Venue Health & Shift Readiness Score
**What it does:** Landing view computing two composite scores from live staff data: a Venue Health Score and an "Rf" (shift readiness) score for tonight's shift.

**Data tracked:**
- Venue Health Score = `avgCompletion×0.35 + avgScenarioScore×0.35 + salesSkill×0.2 + (activeThisWeek/totalStaff)×100×0.1`
- Rf Score (per staff, averaged across the first 8 "tonight's shift" staff) = `0.50×Compliance + 0.30×Training progress + 0.20×Availability`, where Compliance is binary (RSA not expired), Training is module progress %, Availability is 1.0 if shift-confirmed, 0.8 if on-track status, else 0.4.
- "Needs attention" flags: never started (0 activity), inactive 14+ days, zero progress despite activity, or any non-"on-track" status.

**Manager value:** This is a genuine leading indicator, not a vanity metric — it explicitly weights RSA compliance at 50% of shift readiness, meaning a fully-trained but RSA-lapsed staffer scores as under-ready. That's the single most legally consequential thing a venue manager in Australia needs surfaced before service starts.

---

### Staff Directory & Coaching Drawer (`ManagerControlCenter.tsx` staff table → `CoachingDrawer.tsx`)
**What it does:** Roster view of all staff (name, role, readiness, progress, action), each opening a slide-out coaching profile with per-person metrics, connection status, and module mastery.

**Data tracked (per `StaffMember` type):** progress %, service/sales/product scores, last active, status (on-track/attention/inactive), strengths/improvements, mastery-engine fields (mastery status, Elo rating, knowledge-decay-risk flag, high-confidence-incorrect ratio, scenarios mastered/attempted), account connection state (invited/connected/no account), compliance record (RSA state + jurisdiction + expiry, FSS expiry + on-site copy flag, shift-confirmed), days-inactive, junior/supervised flag, manager notes.

**Manager value:** One record ties training data, compliance data, and account-linkage state together per employee — a manager can see in one drawer whether someone is under-trained, RSA-lapsed, or simply hasn't linked their account yet (three very different problems that look similar from the outside).

---

### Predictive Skill Gaps (`PredictivePanel.tsx`)
**What it does:** Rule-based (not ML) flag generator: scans every staff member's scores against fixed thresholds and produces a ranked list of skill gaps with a suggested remediation action, plus a "systemic gap" rollup across the whole roster.

**Data tracked / thresholds:** Sales score <70% → high risk; Service score <65% → medium; Product score <60% → medium; Training completion <40% (and not inactive) → high; knowledge-decay-risk flag → high; high-confidence-incorrect ratio >30% → medium ("confidence mismatch" — staff who are wrong while sure they're right, a specific and dangerous failure mode in hospitality). Exportable as a CSV "training plan."

**Manager value:** Converts raw scores into prioritized, actionable line items before they become a floor incident — the confidence-mismatch flag in particular catches a risk pattern a simple low-score filter would miss entirely (overconfident-and-wrong staff often don't show up as "low performers" until something breaks).

---

### Compliance Hub (`ComplianceHub.tsx`)
**What it does:** RSA/FSS certification registry for all staff, with Australian state-specific guidance (expiry rules, refresher requirements, grace periods) for all 8 states/territories, plus a custom-certification tracker for anything outside RSA/FSS (First Aid, Barista cert, Liquor Licence, etc.) and an FSS on-site physical-copy checklist.

**Data tracked:** RSA on file / valid count, FSS on file count, certs expiring ≤30 days, per-cert expiry date + days remaining + status level (0=valid, 1–2=warning, 3=expired), NSW-specific 28-day full-recourse rule, FSS grace-period countdown, custom cert name/number/expiry/notes per staff member. Exportable as CSV.

**Manager value:** This is direct legal/liability risk management — RSA and FSS lapses carry real regulatory exposure in Australian hospitality, and the state-by-state guidance (NSW's harsher 28-day re-enrolment rule vs. states with no formal RSA expiry) means the tool encodes jurisdiction-specific compliance knowledge managers would otherwise need to look up manually per state.

---

### Leaderboards (`LeaderboardBoard.tsx`)
**What it does:** Three ranked views (training progress, scenario score, "on track" recency) with a podium for top 3 and a plain-English points breakdown per person (e.g. "44 training + 18 scenario").

**Data tracked:** Points = `progress×1.2 + avgScenarioScore×0.8`, per-person breakdown of which component dominates their score.

**Manager value:** Turns training data into a visible, low-cost recognition/competition mechanism a manager can point to on the floor ("Recognise" action built in) — cheap morale lever that doesn't require budget, just visibility.

---

### Reports, Analytics, Training Programs, Inventory, AI Coach, Roles/Teams, Notifications
**Lower confidence — typed but not fully read.** Per `lib/management/types.ts` and the app route map, these exist as distinct Mission Control sections:
- **Reports** (`ReportsPanel.tsx`) — includes a schedulable recurring report (day-of-month + enable toggle, per the `reportScheduleEnabled/Day` state in `ManagerControlCenter.tsx`), built on `reportSummaries: { title, summary }[]`.
- **Analytics** — team performance snapshot, likely backed by `app/api/management/snapshot/`.
- **Training Programs** (`TrainingProgram` type) — named, role-targeted, day-plan-based programs with a completion %; CRUD via `app/api/management/training-programs/`.
- **Inventory** (`InventoryCategory`, `MenuKnowledgeItem` types) — venue-specific product/category linkage tied to menu knowledge, via `app/api/management/inventory/`.
- **AI Coach** — coaching message generation via `app/api/management/coach/` (separate from the per-staff CoachingDrawer).
- **Roles/Teams/Notifications** — present as `ManagerSection` nav entries; no component detail confirmed in this pass.

**Manager value:** Directionally the same pattern as the rest of the suite (structured data → actionable manager view), but I'd verify the actual UI and data shape against the live components before quoting specifics on these six to a market-research model — everything above them in this doc is verified against source.
