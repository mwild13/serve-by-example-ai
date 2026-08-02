# Staff Dashboard UX Audit — Modules, Scenarios, Live Scenarios

Research only. No code was changed. Every claim below is traced to a specific file/line so it can be checked independently.

**Scope:** the three staff-facing nav items you asked about, mapped to their actual components:

| Sidebar label | `NavItem` id | Component | File |
|---|---|---|---|
| Modules | `module` | `DynamicModuleNav` | `app/dashboard/_components/DynamicModuleNav.tsx` |
| Scenarios | `stage4` | `DashboardTrainer` → `ModuleSelectGrid` | `app/dashboard/_components/DashboardTrainer.tsx`, `.../trainer/ModuleSelectGrid.tsx` |
| Live Scenarios | `scenarios` | `ArenaPage` | `app/dashboard/_components/ArenaPage.tsx` |

Note: `CLAUDE.md` maps `stage4` to `DiagnosticFlow.tsx`. That's stale — `DashboardShell.tsx:816-821` actually routes `stage4` to `DashboardTrainer`. `DiagnosticFlow` only ever renders as the first-login onboarding modal (`DashboardShell.tsx:756-765`), not as a nav destination. Worth fixing the doc separately.

**Update (this revision):** incorporates two decisions made after the first pass — (1) staff will no longer see their ELO tier anywhere in the UI, you've moved away from that metric; (2) the AI Coach panel and welcome-text redundancy on the Scenarios page are confirmed for removal/consolidation rather than left as open questions. Sections below are revised accordingly. A separate, non-visual document (`staff-dashboard-codebase-audit.md`) now covers where ELO/mastery logic actually lives in the code, since "staff shouldn't see it" and "the system shouldn't compute or store it" turned out to be two different questions once I checked.

---

## 1. What's actually on each page, and why

### Modules (`DynamicModuleNav.tsx`)

Every card is built from **fully inline `style={{}}` props** — there is no shared CSS class for the card container (lines 111–198). Each card renders, top to bottom:

1. **"★ Recommended" badge** — conditional on `module.recommended` (line 145). This is not decorative: `lib/module-navigator.ts:228-238` sorts all modules by ELO ascending and marks the **lowest 3** as recommended, every time, for every user. It is a real "these are your 3 weakest areas" signal, not a static label. *(Note: the sorting math still uses ELO internally even after the badge below is removed — see "what this decision does and doesn't change" below.)*
2. **ELO tier badge** ("Solid" in your screenshot) — one of 4 tiers computed in `getEloDisplay()` (lines 65-70): Needs Work / Building / Solid / Strong, driven by `--status-critical/warning/info/success`. **Confirmed for removal** — you've told me staff no longer need to see ELO. One thing worth knowing before this is built: the tier chip's hover `title` attribute literally contains the word "ELO" and a numeric threshold (`"ELO below 1100, needs more practice on this module"`, line 67) — this is currently the *only* place in the entire staff- or manager-facing UI where the word "ELO" or a raw ELO number is exposed anywhere (confirmed via a full codebase pass — see the companion codebase audit, §"Where ELO is still visible"). Removing this one badge fully satisfies the decision on the UI side.
3. Title + description.
4. **Mastery progress bar + %** — a second, separate skill metric (`module.mastery_pct`). With the ELO badge gone, this becomes the card's single skill metric rather than one of two.
5. **Recommendation reason** — italic text, only rendered when recommended (line 177-181), e.g. "Next challenge: improve your technical skills." Also real, computed per-module in `lib/module-navigator.ts:241-249` based on ELO band. Worth knowing: the reason text itself is phrased in ELO terms internally even though it never says "ELO" out loud — that's fine to keep since the copy is already staff-friendly, just flagging that the *logic* generating it hasn't gone anywhere.
6. **5-dot difficulty ladder** — `title` attribute only (line 186). No visible label, no ARIA text beyond the wrapper `aria-label`. On a touch device (which this staff app is built for — see mobile bottom nav) a `title` tooltip never fires. This is effectively invisible data on mobile.
7. CTA text that changes by state: Selected / Review / Continue / Start (line 195).

**What the ELO decision does and doesn't change on this card:** it removes signal #2 outright (one fewer badge, one fewer color system on the card) and leaves #4 as the sole skill metric — no merging needed, since there's only one metric left once ELO is gone. It does **not** touch #1 or #5: the recommended-3 sort and the reason text both still run on ELO under the hood (`lib/module-navigator.ts`), they just never say so. That's a fine outcome for this page — "give me my 3 weakest modules" is a reasonable thing to keep computing via ELO even if the number itself is never shown — but it means "moved away from ELO" is true for the *UI* and not yet true for the *engine*. The companion codebase audit maps every other place ELO is computed, stored, or passed through so you can decide deliberately whether any of that needs to go too, rather than it just being scattered infrastructure nobody remembers is there.

With the ELO badge removed, a single card now carries **one skill metric (mastery %), two "why this" signals (recommended badge + reason text), and one inaccessible metric (difficulty dots)** — down from five data points to four. Better, but the difficulty-dot accessibility gap and the reason-text placement (see audit below) are still worth fixing on their own merits.

### Scenarios (`DashboardTrainer.tsx` → `ModuleSelectGrid.tsx`)

This page is structurally different from the other two — it's a **router with 3 destinations**, not a catalog. Top to bottom:

1. Command bar: "Scenario Training / Practice real hospitality situations / Scored roleplay across Bartending, Service & Management" (`TrainerCommandBar.tsx:24-32`).
2. `"Welcome back, {name}."` + `"Choose a module to pick up where you left off, or follow the recommendation above."` (`ModuleSelectGrid.tsx:25-26`) — this is a second headline/subhead pair, stacked directly under the first, saying something close to the same thing.
3. Three `.dash-card`s (Bartending/Sales/Management), each with **two stacked progress bars** — completion % (green/gold) and mastery % (purple, `--color-indigo-light`) — plus a "Next: X" line.
4. An "AI Coach" panel (`.chat-box`) with static copy — `"AI Coach: Use the recommendation above, or pick a module to begin a scored scenario session"` — and **3 pill buttons that call the exact same `onSelectModule()` handler as the 3 cards two inches above them** (lines 69-73). There is no live coaching logic here; `SCENARIOS` and `SCENARIO_INSIGHTS` are static constants in `trainer-data.ts`.

### Live Scenarios (`ArenaPage.tsx`)

Grid of 20 `.arena-card`s (lines 240-278), each with:

1. Category tag (technical/service/compliance, lowercase, `--color-mastery-*`).
2. **One** status badge, 2-state: Passed or Attempted (vs. Modules' 4-state ELO badge).
3. Title.
4. Score bar + "Best: X/100" — **only rendered if the user has attempted it** (`{prog && (...)}`, line 251).
5. Footer: status text + single CTA (Start/Retry/Retake).

That's it. No difficulty indicator, no dual metrics, no separate "why" line.

**This directly answers your framing question:** Live Scenarios doesn't look cleaner because it's better crafted — it's built from the same primitives (badge, bar, footer CTA) as the other two. It looks cleaner because **its data model gives it 2-3 signals per card where Modules now has 4 (after dropping the ELO badge, per your decision below) and Scenarios has 4 (2 bars + next-line + duplicate coach panel).** Matching that visual weight fully means deciding which of the remaining signals to cut or merge — you've already made that call for ELO; the rest (below) are now decided too.

Also worth flagging: `ArenaPage.tsx:17-38` hardcodes its own `MODULE_META` (titles, categories) for modules 1-20, completely separate from whatever `DynamicModuleNav` pulls from `/api/training/modules` → `lib/module-navigator.ts`. Titles currently match (e.g. "Wine Knowledge & Service" appears in both), but there is no shared source of truth — if someone renames a module in one place, the other silently goes stale. Not a visual finding, but it's a real risk to the "clean build" goal you mentioned.

---

## 2. Conversion-UI audit (per page)

Ran via `/conversion-ui`. All three pages classify as **Utility & Management Mode** (staff training console, not a paywall/checkout moment).

### Modules

**Overall UX Assessment:** Management mode. Decided: the ELO tier badge is going away, which removes the card's biggest source of competing signals — it and the Recommended badge previously shared a row and fought for the same "first thing you read" position. What's left is a cleaner but still-imperfect hierarchy: one metric (mastery %), one badge (Recommended), one reason line placed below the fold, and one inaccessible metric (difficulty dots).

**Suggested Deletions:**
- **The ELO tier badge, in full** — chip, color logic (`getEloDisplay()`, lines 65-70), and the `title` tooltip that names "ELO" explicitly. Decided, not a suggestion at this point — including it here so it's in the same document as everything else for whoever builds it. Nothing else on this card gets deleted: the Recommended badge and reason text are both wired to real per-user data (`lib/module-navigator.ts`) and remain load-bearing.

**Suggested Additions:**
- **Visible difficulty label:** the 5-dot ladder currently only exposes its meaning via a `title` tooltip, which never fires on touch. Add a short visible label ("Beginner"/"Advanced") sourced from the same `module.difficulty_level` already in scope — no new data fetch needed.

**Suggested Modifications:**
- **Promote the recommendation reason.** It's the actual answer to "why is this recommended," but sits in muted italic near the bottom of the card, below the fold of visual attention. Move it adjacent to the badge that triggers it — see the mockup, where badge and reason now sit on the same line.
- **Stop inline-styling the card.** Every value here is a `style={{}}` prop (DynamicModuleNav.tsx:111-198) instead of the `.dash-card`/`.arena-card` pattern used on the other two pages — see §3 below.

### Scenarios

**Overall UX Assessment:** Management mode. Confirmed: the real clutter here isn't badges, it's a **duplicate action path** — the AI Coach panel's 3 pills do exactly what the 3 cards above them already do, and the panel's copy is static (no data behind "AI Coach" here despite the name). This is now a decided cleanup, not an open question.

**Suggested Deletions:**
- **The AI Coach panel's 3 duplicate pills.** As built (`ModuleSelectGrid.tsx:63-76`) they add a full card's worth of vertical space to say "click one of the three things you can already see." Whether the panel *shell* stays as a placeholder for a real future feature is a separate call the codebase audit flags for you (§ "The AI Coach panel") — either way, the pill row that duplicates the cards should go.
- **One of the two stacked headlines.** The command bar ("Practice real hospitality situations") and the welcome block ("Choose a module to pick up where you left off...") say near-adjacent things back to back before any content appears — merge into one line.

**Suggested Additions:**
- **Real personalization in the coach copy**, if the panel is kept as a placeholder: `moduleProgress` and `moduleMastery` are already computed in `DashboardTrainer.tsx` state and currently unused by the coach panel. It could say "You're weakest in Sales — start there" instead of generic copy, using data that's already in scope.

**Suggested Modifications:**
- **Re-map the mastery bar's color.** It's the only place in this 3-page flow using `--color-indigo-light` (purple) — unrelated to the green/gold semantics everywhere else, and unrelated to the mastery-category colors (`--color-mastery-technical/service/compliance`) used one click away on Live Scenarios.

### Live Scenarios

**Overall UX Assessment:** Management mode. This card is already close to a minimum viable signal set (category, status, optional score, CTA) — it's the reference point for what "clean" looks like in this flow precisely because it doesn't try to do more than one job per element.

**Suggested Deletions:** None.

**Suggested Additions:**
- **A "why this scenario" signal**, mirroring Modules' recommended badge, is genuinely missing here. The grid gives no prioritization cue on first view — the "Up next" tile only appears after finishing a scenario (`ArenaPage.tsx:420-453`). If a shared card component gets built (see below), this is the one thing Live Scenarios could reasonably borrow from Modules.

**Suggested Modifications:**
- **Category label casing.** Lowercase ("technical") reads less finished next to Modules' title-cased "★ Recommended." Minor, but it's part of why the pages don't feel like siblings.

---

## 3. The structural reason these three pages don't feel unified

Not badge overload — **token and component fragmentation** that all three pages inherited independently. Concrete evidence, not a stylistic opinion:

**Four different "muted text" tokens exist in `app/globals.css`, used interchangeably across these three pages:**

| Token | Value | Used in |
|---|---|---|
| `--text-muted` | `#577067` | `.arena-card-status`, `.arena-card-score-label` (Live Scenarios) |
| `--color-text-muted` | `#6b7280` | `DynamicModuleNav.tsx` inline styles (Modules) |
| `--ops-text-soft` | `#6b7280` | explicitly commented "fallback for manager dashboard" |
| `--color-text-subtle` | `#737373` | extended gray scale, unused in these 3 pages currently but adjacent |

`--text-muted` and `--color-text-muted` are **different colors** (`#577067` green-grey vs `#6b7280` blue-grey) doing the same visual job on the same screen. That's the kind of thing that reads as "close but not quite matching" without anyone being able to point at why.

**Three separate card containers, three different paddings and radii, for what is conceptually the same "training item card":**

| Page | Pattern | Padding | Radius |
|---|---|---|---|
| Modules | inline `style={{}}`, no shared class | `1.4rem 1.5rem` (~22×24px) | `14px` |
| Scenarios | `.dash-card` | `22px 20px` | `20px` (`--radius-lg`) |
| Live Scenarios | `.arena-card` | `1.1rem 1.25rem 1rem` (~18×20×16px) | `14px` (`--radius-md`) |

**Three parallel "status color" systems, all live in the same 3-page flow:**
- ELO tiers (Modules): `--status-critical/warning/info/success` — **retired from this card** with the ELO badge removal above, so this flow drops to two color systems.
- Mastery categories (Live Scenarios card accents, result screen labels): `--color-mastery-technical/service/compliance`
- Pass/fail semantics (Live Scenarios result banner): `--green`/`--gold-warm` via `--status-good`/`--status-warn`

None of these are wrong in isolation — each was presumably added for a real reason at the time. A staff member moving Modules → Scenarios → Live Scenarios in one session will now cross two card shapes and two color grammars instead of three — better, though `--status-critical/warning/info/success` doesn't disappear from the codebase, it's just no longer rendered here. The companion codebase audit lists where else it's still used so it isn't orphaned dead code you forget about.

---

## 4. What I'd prioritize, in order — none of this is built yet

1. **Define one shared training-item card component** (padding, radius, badge slot, metric-bar slot, CTA slot) and re-skin all three pages onto it. This is the single highest-leverage fix — it's what makes the pages feel like siblings, independent of any content decisions.
2. **Pick one muted-text token and one status-color language** and retire the duplicates. Pure design-system cleanup, zero product risk.
3. **Remove the ELO tier badge from Modules** (chip + color logic + the tooltip that names "ELO") — decided, straightforward, and it's the biggest single density reduction available on that card.
4. **Remove the AI Coach panel's duplicate pills on Scenarios**, and merge its double headline into one — decided, unambiguous redundancy.
5. **Fix the difficulty-dot accessibility gap** (invisible on touch) — small, low-risk, real usability bug independent of everything else here.

Items 1 and 2 alone would likely close most of the remaining "why doesn't this feel as tight as Live Scenarios" gap — Live Scenarios reads clean partly *because* it doesn't have the fragmentation problem as visibly, not just because it has less content. Items 3-5 are now decided rather than open, per your feedback.

---

## 5. Open questions for you before anyone touches code

- Should Live Scenarios gain a "recommended" signal to match Modules, or is the current no-priority-cue grid intentional? (Worth a quick look at actual usage/drop-off data if you have it, rather than deciding from this report alone.)
- If the AI Coach panel shell stays as a placeholder for a future dynamic feature, who owns deciding what it eventually says? Leaving it static-but-present is a fine interim state, just flagging it needs an owner so it doesn't quietly become permanent.
- The ELO decision resolved the UI question, but the codebase audit (companion doc) surfaces a separate, code-hygiene-only question: several ELO fields are computed and piped through components that never render them (dead props, not user-facing). Worth a quick read of that doc's "Where ELO is still visible" section before assigning any of this to a developer, so nobody re-adds an ELO number by accident while wiring up something else.

A companion mockup file (`staff-dashboard-ux-mockups.html`) shows the current card patterns side by side with the ELO-free proposed treatment, built from the actual tokens above — nothing invented. A second companion document, `staff-dashboard-codebase-audit.md`, maps the mastery/ELO engine and the staff dashboard file tree for whoever picks this up next — that one's about code organization, not visuals.
