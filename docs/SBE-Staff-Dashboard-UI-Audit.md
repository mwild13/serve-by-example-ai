# Serve By Example — Staff Dashboard UI Audit
**Date:** 2026-07-19  
**Screens audited:** HOME · LEARN · CHALLENGES · ME (4 main nav tabs)  
**Method:** Live screenshots via iPhone Mirroring + Conversion-UI Framework

---

## Part 1 — Raw Observations (What I Saw)

### HOME Tab
**What's there:**
- Dark green header card with "Good morning, Alex", 3 inline stats: 110 sessions · 40/40 modules · Mixologist level
- Two small gold/green pill badges top-right (showing "6" and "2") — no visible label
- A "REVIEW MODE" banner (dark green, cocktail glass icon) directly below the header
- A white card: "Pouring the Perfect Beer — 40 of 40 modules mastered" with a full gold progress bar
- "THIS WEEK'S FOCUS" 2×2 grid of 4 module cards, each with a cocktail glass icon and a "3 min" chip on the top 2 only

**What's missing or broken:**
- "REVIEW MODE" is a dead banner — no CTA, no explanation of what mode this is or how to exit/use it
- The featured card is for a 100% completed module — surfacing something already mastered as the "next" action is a motivational dead end
- The 4 focus cards are visually identical (same icon, same layout) — zero differentiation or completion state
- The "6" and "2" badge numbers have no context. Are they streaks? Achievements? Days? The user has to guess
- No single primary CTA — the user lands here and has 6 competing elements with no clear "start here"
- Bottom 2 focus cards have no time estimate (the top 2 do) — inconsistent

---

### LEARN Tab (Training Hub)
**What's there:**
- Dark green header: "TRAINING / Training Hub"
- 4 list items in white cards with small icons:
  1. Training Modules — "40 modules across bartending, service and management"
  2. Scenario Training — "Written practice scenarios based on real service situations"
  3. Live Scenarios — "Live roleplay evaluation powered by AI"
  4. Challenges — "Interactive tap-based mini-games, always free"
- Large empty whitespace below

**What's missing or broken:**
- No progress context on any item — I can see what each section IS but not where I am in it
- All 4 items carry identical visual weight — Training Modules (the main product) looks the same as Challenges (a free mini-game). No hierarchy
- "Always free" is tagged on Challenges but other items give no signal of what's gated — a free user reading this list has no guidance
- The empty whitespace below the 4th item is significant — the page looks unfinished
- No entry prompt or recommended next step — this hub is purely a directory, not a launch pad

---

### CHALLENGES Tab
**What's there:**
- Dark green header: "INTERACTIVE CHALLENGES / Test your knowledge / 5 questions · tap-based · no typing required"
- White card listing 5 numbered game types: Sequence Sort, Fill the Blank, Match Pair, Spot the Error, Multiple Choice
- Single dark green "Start Challenges" CTA button
- Whitespace below

**Strongest screen of the four.** The single CTA is clean and the format explanation is useful.

**What's missing or broken:**
- The 5 game types are plain text with no visual preview or icon — all 5 look the same
- No personalisation or streak context — "Your best: 4 in a row" or "Last played 2 days ago" is missing
- No time estimate — how long does one round take? Users on a break need to know this
- The "5 questions" header could create the wrong impression — it implies it ends after 5. The experience should communicate replay value

---

### ME Tab (Your Training Progress)
**What's there:**
- Dark green header: "ME / Your Training Progress / Track mastery, scores and certifications across all 40 modules"
- Sub-tabs: Overview | Modules | Activity
- "Alex's Progress Hub" with a 10-dash level bar: Skill Level 10 / 10 · Master
- 2×2 stat grid:
  - Modules Mastered: 40/40
  - Best Module Mastery: 100%
  - Focus Area: Technical (weakest category)
  - Sessions Completed: 110
- Partially visible at bottom: 13/14 badges and Level 10 Master chips

**What's missing or broken:**
- 13/14 badges earned is the single most compelling re-engagement hook on this entire app — and it's buried below the fold with no CTA. A user at 13/14 is 93% done. That's a FOMO moment that deserves front-and-centre placement
- The user has completed 40/40 modules with 100% mastery. The ME page celebrates this but offers no "what's next?" — no share moment, no next goal, no new challenge unlocked
- "Technical — weakest category" is a rich data point but there's no adjacent "Fix this" or "Train Technical" action linked to it
- Sub-tabs (Overview / Modules / Activity) are present but the inactive tabs are very muted — could easily be missed
- No session streak visible — 110 total sessions is great, but a current streak would drive daily return behaviour

---

## Part 2 — Conversion-UI Framework Audit

### Mode Classification
All 4 tabs are **Utility/Management Mode** — this is a staff training tool, not a checkout flow. The exceptions are:
- Any locked/premium gating state a free user would hit (Conversion Mode)
- The 13/14 badges hook (Engagement Re-conversion)

---

### HOME — Framework Audit

**Overall UX Assessment**  
Utility mode. The home tab has good information architecture in the header but fails at the most critical job of a dashboard: giving the user one clear thing to do. There are too many competing elements with equal visual weight and no hierarchy directing attention to the next meaningful action.

**Suggested Deletions**
- **"REVIEW MODE" banner (current state):** This banner takes significant vertical real estate but has no interactive purpose. It should either be removed or converted into an actionable card with a clear CTA ("Continue Review →"). A label with no action adds noise.
- **Repeated cocktail glass icons on all focus cards:** When all 4 cards show the exact same icon, the icon stops carrying information. Either differentiate icons by content type or remove them and use the freed space for progress data.

**Suggested Additions**
- **Primary CTA button on the featured card:** The card for "Pouring the Perfect Beer" shows 100% mastery but has no action. Change this to the user's next non-mastered module with a "Begin →" button, or if fully mastered, show "Revisit for streak" with a streak counter.
- **Badge status chip in header:** Surface the "13/14 badges" right inside the header card where the "6" and "2" pills already are. Label them: "Streak: 6" and "Badges: 13/14". One clear label eliminates confusion instantly.
- **Completion indicators on focus cards:** Each card needs a micro status — a green dot (mastered), a gold bar (in progress), or a lock icon (premium) — so the user can scan the grid in under a second.

**Suggested Modifications**
- **Featured module card:** Never surface a 100% complete module as the primary recommendation. The algorithm should surface the next unmastered module or the weakest category module (Technical, per the ME tab data). This is a data logic fix as much as a UI one.
- **"THIS WEEK'S FOCUS" label:** Upgrade to show a progress count: "THIS WEEK'S FOCUS — 2 of 4 complete" so the grid feels like a checklist, not just a list.
- **Time estimates:** Make time chips consistent — all 4 cards should show a "3 min" (or actual) estimate. Missing chips on the bottom 2 cards is an oversight.

---

### LEARN — Framework Audit

**Overall UX Assessment**  
Utility mode. The Training Hub is a clean directory but it's functionally inert — it tells users what exists, but gives them no signal of where they are, what's recommended, or what's available to them on their tier. The whitespace below the 4 items signals an unfinished layout.

**Suggested Deletions**
- **None structurally.** The 4-item list is the right shape. The problem is what's missing, not what exists.

**Suggested Additions**
- **Progress state on each row:** Each list item should include an inline progress indicator. "Training Modules" should show "32/40 complete" or a small progress bar. "Scenario Training" should show "14 scenarios attempted." This turns a directory into a dashboard.
- **Premium/free signal on locked items:** For free users, Training Modules and Scenario Training should show a subtle lock badge (not intrusive, but present). For paid users, a small green "Included" chip. Removes ambiguity.
- **"Continue where you left off" shortcut:** A sticky or top-of-list card that resumes the user's last session. This is the single highest-ROI UX pattern for a returning user in a learning app.

**Suggested Modifications**
- **Visual hierarchy between items:** Training Modules should visually lead — slightly larger card, bolded title, more prominent icon. It's the core product. Challenges (the free mini-game) should sit visually subordinate, matching its "always free" positioning.
- **Fill the whitespace:** Below the 4 items, surface a contextual card — "Your weakest area: Technical" with a "Train it now →" CTA, drawing from the same data that powers the ME tab. Dead space is wasted motivation.

---

### CHALLENGES — Framework Audit

**Overall UX Assessment**  
Utility mode. The strongest screen in the app. Single CTA, clear format explanation, clean layout. The main gaps are personalisation and replay signal.

**Suggested Deletions**
- **None.** The layout is fundamentally correct.

**Suggested Additions**
- **Personal streak/record chip:** Directly beneath the header, add a chip: "Best streak: 4 · Last played 3 days ago." This is a re-engagement hook drawn from existing user data. Absence creates a generic experience; presence creates personal investment.
- **Time estimate in header:** "~5 minutes per round" beneath the challenge count. Users on a break need to know this fits.

**Suggested Modifications**
- **Numbered list items → icon-differentiated rows:** Give each of the 5 challenge types a unique small SVG icon (e.g., arrows for Sequence Sort, a blank field for Fill the Blank). Currently they're identical text rows — visual differentiation increases recall and anticipation.
- **"Start Challenges" → "Start Round" or "Play Now":** The current label is fine but "Play Now" has slightly higher energy for a game-mode CTA. Low-priority change.

---

### ME — Framework Audit

**Overall UX Assessment**  
Utility mode with a buried engagement conversion opportunity. The 4-stat grid is clean and the personalization is strong, but the screen peaks with completion data (40/40, 100%) and then offers no forward path. A fully completed user hitting this page has no reason to return, which is a retention failure for what should be the app's stickiest screen.

**Suggested Deletions**
- **"Your Training Progress" header subtitle:** "Track mastery, scores and certifications across all 40 modules" is too long for a header subline and describes the obvious. Replace with a dynamic state line: "Master · 40/40 complete · 13/14 badges."

**Suggested Additions**
- **Badge completion card — above the fold:** 13/14 badges is 93% completion. This is the single highest-leverage engagement hook in the app. Promote it to the very top of the ME tab, above the stat grid: a card showing the unearned badge's name, what's needed to unlock it, and a CTA to the relevant activity.
- **"What's next" section for completed users:** When all 40 modules are mastered, surface a new goal. Options: challenge leaderboard position, daily streak target, revisit Technical weak area with harder questions. Without this, a 40/40 user has no reason to reopen the app.
- **Streak counter in header card:** Replace one of the less impactful stats (or add below) with a "Current streak: X days" counter. This is the primary daily return driver for learning apps and it's absent.

**Suggested Modifications**
- **"Focus Area: Technical" stat card:** Add a tappable "→ Train it" link inside the card. Right now it surfaces a weakness with no action path — that's friction without resolution.
- **Sub-tab contrast:** Overview/Modules/Activity tab states are too similar. The active tab should have noticeably more visual weight — e.g., full green background pill vs. ghost on inactive.
- **Stat card label sizing:** "MODULES MASTERED" at 0.7rem tracked-wide is correct per the framework. The number size (large) contrasted against the small label creates the right hierarchy — keep this. But "verified across all categories" below is unnecessary copy — trim to just the label.

---

## Part 3 — Combined Priority List

### P0 — Fix First (Highest Impact, Lowest Effort)

| # | Screen | Issue | Fix |
|---|--------|-------|-----|
| 1 | HOME | Featured card shows 100% complete module as "next action" | Surface next unmastered or weakest-category module instead |
| 2 | HOME | "6" and "2" badges have no label | Label them explicitly: "Streak: 6" · "Badges: 13/14" |
| 3 | ME | 13/14 badge hook buried below fold | Promote to top of ME tab as a named CTA card |
| 4 | HOME | "REVIEW MODE" banner has no action | Add CTA or remove entirely |
| 5 | LEARN | No progress context on any item | Add inline progress state to each of the 4 hub rows |

### P1 — High Value (Requires Design/Dev)

| # | Screen | Issue | Fix |
|---|--------|-------|-----|
| 6 | HOME | Focus cards visually identical, no completion state | Add micro status dot/bar to each card (green/gold/lock) |
| 7 | ME | 40/40 complete users have no next goal | Add "What's next" section: streak target, leaderboard, Technical drills |
| 8 | LEARN | Empty whitespace below 4 items | Add contextual "weakest area" card with Train CTA |
| 9 | ME | "Technical" focus area has no action link | Add "→ Train it" tap target inside the stat card |
| 10 | CHALLENGES | 5 challenge types are plain text rows | Differentiate with unique SVG icon per type |

### P2 — Polish (Nice to Have)

| # | Screen | Issue | Fix |
|---|--------|-------|-----|
| 11 | HOME | Bottom 2 focus cards missing time estimate | Add "3 min" chip consistently on all 4 cards |
| 12 | HOME | "THIS WEEK'S FOCUS" label has no progress count | Change to "THIS WEEK'S FOCUS — X of 4 complete" |
| 13 | ME | Active sub-tab not distinct enough | Increase visual weight: full green pill active, ghost inactive |
| 14 | CHALLENGES | No personal streak or last-played context | Add chip: "Best streak: 4 · Last played X days ago" |
| 15 | LEARN | Training Modules and Challenges have equal visual weight | Elevate Modules (larger/bolder), demote Challenges visually |

---

## Summary Verdict

The design system is **excellent** — the green/gold palette, typography hierarchy, and warm parchment backgrounds create a premium, distinctive product. The foundations are strong.

The core problem is not aesthetics — it's **motivational dead ends**. Three separate screens (HOME, LEARN, ME) have data available that could drive the user's next action, but instead surface that data passively with no forward path. A user at 13/14 badges, 40/40 modules, and a "Technical weakness" flag has three obvious next actions waiting — none of which the UI currently surfaces.

The fix is not a redesign. It's wiring existing data to existing UI patterns that are already in the codebase (progress bars, CTAs, chips) and placing them where the user's eye already lands.

**Effort-to-impact ratio:** P0 fixes are all copy/data logic changes — likely 1–2 days of dev. P1 fixes are component-level additions — 3–5 days. This is a high-ROI pass.
