# Staff Dashboard Codebase Audit — Mastery, ELO & File Organization

**Purpose:** a map for whoever next builds on the staff dashboard, mastery engine, or ELO system — where things actually live, what's duplicated, where naming has drifted, and what "clean" would look like. Every claim below is traced to a file and line so it can be checked, not taken on faith.

**This is not a code-change task.** Nothing here has been touched. It's the plan you'd hand to a developer before they start, so they spend their first day reading this instead of re-discovering all of it by grepping.

**Companion document:** `staff-dashboard-ux-audit.md` covers what staff *see* on Modules/Scenarios/Live Scenarios. This document covers what the *code* actually does underneath those three pages — they overlap at exactly one point (the ELO tooltip, §3) and are otherwise about different problems: that one is about visual clutter, this one is about whether the engine underneath is telling the truth consistently.

---

## 1. The one-sentence version

There is one correct, well-built mastery engine (`lib/mastery.ts`). Around it, four other files have independently reinvented parts of what it already does — different ELO formulas, different module catalogs, different scenario content, different skill-level math — because each was written to ship a specific page rather than to extend a shared core. None of it is broken in a way a user would notice today. All of it makes the next feature harder to build correctly, because a developer has no way to know which of the 3-5 competing versions of "the module list" or "the mastery percentage" is the one to extend.

---

## 2. The mastery/ELO engine — what's canonical

`lib/mastery.ts` (577 lines) is the real engine and should be treated as the single source of truth going forward:

| Piece | What it does | Location |
|---|---|---|
| ELO formula | Standard logistic Elo, K=32: `expectedScore = 1/(1+10^((difficulty-rating)/400))`, `newElo = round(current + K*(actual-expected))` | lines 125-131 |
| Scenario difficulty | Synthetic — scaled 1000→1400 by a scenario's position within its module, not derived from any real difficulty data | lines 158-162 |
| Mastery level (0-3) | Driven by `consecutive_correct` streak; drops by 1 on a miss, floors at 0 | lines 212-235 |
| Spaced repetition | `days = max(level,1)^2` → review due in 1/4/9/16 days | lines 136-141 |
| Confidence persona | Classifies each attempt as expert / lucky-guesser / student / liability | lines 145-154 |
| Spam guard | Blocks *mastery advancement* (not score recording) within 60 min of the last attempt | lines 194-202 |
| `recordAttempt()` | The canonical write path — writes `scenario_mastery`, returns `{ masteryLevel, eloRating, eloDelta, isBridge, confidenceAccuracy, ... }` | lines 166-291 |
| `markModuleMastered()` | The V3 binary-mastery path (used by the Verify quiz) — sets `is_mastered=true`, `mastery_level=3`. **Does not touch `elo_rating` at all.** | lines 299-352 |
| `getMasteryProgress()` | Aggregate stats per module, including `avgElo` (defaults to 1200 if unattempted) | lines 356-391 |
| `syncMasteryToVenueStaff()` | The bridge to the **manager-facing** side — writes `avgElo` into `venue_staff.elo_rating` / `venue_staff.avg_module_elo`. This is the only place ELO crosses from staff data into manager data. | lines 445-576 |

If you're extending mastery/ELO logic anywhere, this file is where it should happen. Everything below is a description of what *isn't* going through it.

---

## 3. Where ELO is still visible to staff — and where it's just along for the ride

You've decided staff shouldn't see ELO. A full pass across every staff-facing component found exactly **one place it's actually visible**, and several places it's computed/passed but never shown.

**Visible today (the one to fix):**

`app/dashboard/_components/DynamicModuleNav.tsx:65-70` — the tier chip on the Modules card ("Needs Work"/"Building"/"Solid"/"Strong") is driven by ELO, and its hover tooltip literally says the word:

```js
if (elo < 1100) return { ..., tooltip: "ELO below 1100, needs more practice on this module" };
```

Rendered at lines 150-152. This is covered as a confirmed deletion in the UX audit — flagging it here too because it's the only place the two documents' findings actually touch.

**Computed and piped through, but never rendered (dead props, not a UI problem — a maintenance one):**

| Where | What happens |
|---|---|
| `app/dashboard/_components/trainer/EvaluationResult.tsx` | `MasteryFeedback.eloRating` / `.eloDelta` are typed props (lines 7-12), passed all the way from the API through `DashboardTrainer.tsx` state — but the JSX (37-136) never reads either field. Only `.level`, `.levelChanged`, `.confidenceAccuracy`, `.spamGuarded` render. |
| `app/api/training/progress/route.ts:241-245` | Returns a top-level `elo: { bartending, sales, management }` object. A repo-wide grep for consumers (`.elo`, `data.elo`, `progressData?.elo`) returns zero matches anywhere in `app/dashboard/_components/`. This field is dead API surface. |
| `PreShiftHome.tsx`, `MobileDashboardV3.tsx` | Both type and destructure `moduleProgress[id].avgElo` — neither renders it. |
| `lib/management/types.ts` / `StaffRosterPanel.tsx` | `StaffMember.eloRating` exists and is populated from the DB, but `StaffRosterPanel.tsx` never prints it. `ManagerControlCenter.tsx:3415` uses it only as a boolean presence check (`hasMasteryData`), never as a number. |

**The takeaway:** the "no ELO in UI" decision is fully satisfiable by fixing the one `DynamicModuleNav.tsx` tooltip. Everything else is inert plumbing — safe to leave for now, worth stripping opportunistically the next time someone is already touching those files, so a future developer doesn't stumble across an unused `eloDelta` prop and assume it's *supposed* to be wired up.

---

## 4. Naming drift — the same concept, different names, across files

This is the single biggest source of "which field do I use?" confusion for anyone new to this codebase. None of these are bugs individually — each file is internally consistent — but there's no shared vocabulary across files.

**Mastery percentage** — five different representations of "how good is this person at this module":

| Name | Type | Where |
|---|---|---|
| `mastery_pct` | number 0-100 | `lib/modules.ts`, `lib/module-navigator.ts` |
| `mastery` | number 0-100 | `app/api/training/progress/route.ts` (moduleProgress), `lib/mastery.ts::MasteryProgress`, `ProgressOverview.tsx`, `PreShiftHome.tsx`, `MobileDashboardV3.tsx` |
| `mastery_status` | number 0-3 | `lib/modules.ts::UserModuleProficiency` — appears unused by any component read in this audit; confirm with a repo-wide grep before removing |
| `masteryStatus` | string | `lib/management/types.ts` (manager side) |
| `is_mastered` | boolean | DB column / API, used as an override ("if true, treat as 100%") in both `module-navigator.ts:198-208` and `progress/route.ts:114-122` |

**ELO** — five names for the same number:

`elo_rating` (DB column, `lib/mastery.ts::MasteryRow`) · `current_elo` (`lib/modules.ts`, `module-navigator.ts`) · `eloRating` (`RecordAttemptResult`, `lib/management/types.ts`) · `avgElo` (`ModuleProgress`, `progress/route.ts` moduleProgress) · top-level `elo` object (`progress/route.ts` response — dead, see §3).

**Category buckets** — two vocabularies for what should be the same three groups:

`technical` / `service` / `compliance` (the actual module category, canonical — matches the DB) vs. `bartending` / `sales` / `management` (`lib/badges.ts::CategoryScores`, a legacy naming scheme). Because these don't match, three separate components manually remap one to the other by hand: `ProgressOverview.tsx:143-147`, `PreShiftHome.tsx:575-579`, `MobileDashboardV3.tsx:572-578`. Same three lines of remapping logic, copy-pasted three times, because there's no shared translation function.

**Skill level** — computed twice, with different math, producing different answers for the same person:

- Server canonical (`app/api/training/progress/route.ts:128-138`): a module counts as "mastered" if `mastery >= 80`, then `skillLevel = round((masteredModuleCount/totalModules)*10)`.
- Client reimplementation (`MobileDashboardV3.tsx:536-543`): a module counts as "mastered" if `scenariosMastered >= 1` — a much lower bar — then runs the same rounding formula on a different numerator.

These will disagree for any user who has started-but-not-mastered several modules. Whichever page you check first will tell you a different "level" than the other. This is worth fixing on its own, independent of anything else in this document — it's the one item here closest to a user-visible bug rather than a maintenance annoyance.

---

## 5. Duplicated sources of truth

Five separate places define the module catalog (id, title, category, difficulty):

1. The live `modules` DB table — canonical.
2. `lib/module-navigator.ts:274-320` — a hardcoded fallback block used if the DB call fails.
3. `app/dashboard/_components/ArenaPage.tsx:17-38` (`MODULE_META`) — the Live Scenarios page's own copy, for modules 1-20 only.
4. `lib/diagnostic-engine.ts:28-54,255-276` (`MODULE_CATEGORY_MAP` + inline title list) — the onboarding diagnostic's own copy.
5. `app/dashboard/_components/ModuleVerify.tsx:11-52` — its own title list for the verify-quiz flow.

Three separate places define scenario *content* (the actual prompts staff respond to):

1. The DB `scenarios` table — documented in `lib/domain-types.ts:60-71` as the intended source for `scenario_type = 'roleplay'` (i.e., Live Scenarios).
2. `app/dashboard/_components/trainer/trainer-data.ts:25-352` (`SCENARIOS`) — a fully static, hardcoded set used by the *Scenarios* page (bartending/sales/management practice).
3. `app/dashboard/_components/ArenaPage.tsx:46-107` (`ARENA_SEED_SCENARIOS`) — a second fully static, hardcoded set actually used by *Live Scenarios*, which bypasses the DB table `domain-types.ts` says it should use.

So the doc comment describing the intended architecture (DB-backed Live Scenarios) doesn't match the actual implementation (hardcoded Live Scenarios) — worth updating one or the other so the next developer doesn't trust the comment over the code, or vice versa.

Three separate write paths into the same `scenario_mastery` table:

1. `lib/mastery.ts::recordAttempt()` — canonical, used by the Scenarios (practice) flow.
2. `lib/mastery.ts::markModuleMastered()` — the V3 verify-quiz path, intentionally different (binary pass/fail, no ELO).
3. `app/api/arena/evaluate/route.ts:129-148` — Live Scenarios' own hand-rolled upsert, at a fixed sentinel `scenario_index = 40`, setting `mastery_level` directly rather than going through the engine's progression rules, and never touching `elo_rating`.

Two structurally-identical `Module` TypeScript interfaces, declared separately rather than one importing the other: `lib/modules.ts:13` and `lib/module-navigator.ts:10`.

---

## 6. A likely bug, found in passing

`app/api/training/save/route.ts:167` queries `.from("mastery_rows")` for SBE Elite badge eligibility. A repo-wide search of every migration under `supabase/migrations/` found no `CREATE TABLE mastery_rows` — the only other occurrences of that string are in an unrelated SQL comment and a variable name. Every other query in the codebase (correctly) targets `scenario_mastery`. This has the shape of a copy-paste/rename slip: if `mastery_rows` isn't a real table, this query either errors (and is likely being swallowed by a try/catch) or returns nothing, meaning the SBE Elite badge auto-award logic at lines 158-179 may not be firing. **Worth a developer confirming against the live Supabase schema** before treating this as fact — migrations history isn't a perfect proxy for what's actually deployed — but it's specific enough to be worth ten minutes of someone's time to check.

---

## 7. File-by-file map — staff dashboard component tree

Answering directly: are pages and their supporting files where you'd expect? Mostly yes, with two exceptions called out below.

| Nav page | Entry component | Supporting files | Size |
|---|---|---|---|
| Home | `PreShiftHome.tsx` | — | 860 lines |
| Modules | `DynamicModuleNav.tsx` → `/api/training/modules` → `lib/module-navigator.ts` → `lib/modules.ts` (types) | — | 213 / 342 / 171 lines |
| Scenarios | `DashboardTrainer.tsx` → `trainer/ModuleSelectGrid.tsx`, `trainer/TrainerCommandBar.tsx`, `trainer/ScenarioPractice.tsx`, `trainer/EvaluationResult.tsx`, `trainer/HelpModal.tsx`, `trainer/trainer-data.ts` | Well-organized — one folder, one job each | 332 / 79 / 51 / 113 / 138 / 17 / 443 lines |
| Live Scenarios | `ArenaPage.tsx` | None — everything (module list, scenario content, evaluation UI, results screen) lives in one 575-line file | 575 lines |
| Progress ("How I'm improving") | `ProgressOverview.tsx` → `progress/ActivityLog.tsx`, `progress/MasteryGrid.tsx`, `progress/ProgressChart.tsx`, `progress/ProgressSummary.tsx`, `progress/progress-types.ts` | Also well-organized, one folder | 426 / 166 / 167 / 147 / 235 / 71 lines |
| Challenges | `ChallengesPage.tsx` → `challenges/` (5 game components) | Not audited in depth this pass | — |
| Verify quiz | `ModuleVerify.tsx` | `lib/verify-questions.ts` (question bank) | 271 lines, clean single source |
| Rapid Fire | `RapidFirePage.tsx` → `RapidFireQuiz.tsx` | — | 308 / 271 lines |

**Two structural inconsistencies worth naming directly:**

- **`ArenaPage.tsx` is the one page that doesn't follow the "extract a folder" pattern** the Scenarios and Progress pages both use. At 575 lines, holding its own module catalog, its own scenario content, and all three of its screen states (select/writing/result) in one file, it's the natural candidate for the same treatment: split into `arena/ArenaModuleGrid.tsx`, `arena/ArenaScenarioWriter.tsx`, `arena/ArenaResult.tsx`, and — the bigger win — `arena/arena-data.ts` that either imports from `module-navigator.ts` or is explicitly documented as intentionally separate.
- **`lib/verify-questions.ts` is the one content file that's already exactly right** — single source, no ELO, no duplication, used only by the two components that need it. Worth using as the reference example of "what clean looks like" when explaining the target state to a developer, since it's a real example already in the codebase rather than a hypothetical.

Manager-side note (touched only briefly this pass): `lib/management/service.ts` and `lib/management/types.ts` read staff mastery/ELO data with field names (`elo_rating` → `eloRating`) that **do** match `lib/mastery.ts` correctly — no drift in that particular chain. The drift is entirely within the staff-facing side.

---

## 8. A non-code process for keeping this clean

You said this should be a plan, not a fix. In order of effort, lowest first:

1. **Write a one-page `MASTERY_ENGINE.md`** (or add a section to `CLAUDE.md`) that states, in plain language: `lib/mastery.ts` is canonical; `elo_rating`/`mastery` (not `mastery_pct`, not `avgElo`) are the field names to use in new code; the module catalog lives in the `modules` DB table via `lib/module-navigator.ts`, nowhere else. This alone would have prevented most of what's cataloged above — it's a documentation task, a few hours, zero risk.
2. **Grep-audit before any new feature touches mastery/ELO/module data.** Before adding a field or a new "recommended" style feature, search for the concept by every known alias in §4 first — the five-minute habit that stops a sixth naming variant from being born.
3. **Fold the dead ELO plumbing (§3) into whatever feature work next touches those specific files** — not a standalone cleanup sprint, just a "while you're in here" rule. `EvaluationResult.tsx`'s unused `eloRating`/`eloDelta` props, the dead `elo` object in `progress/route.ts`, and the `DynamicModuleNav.tsx` tooltip are all small, isolated, low-risk edits once someone is already in those files for another reason.
4. **When someone next needs to touch scenario content or the module catalog**, use that moment to decide, deliberately, whether the three-way (or five-way) duplication in §5 should collapse — e.g., whether `ArenaPage.tsx` should start reading from the `scenarios` table like `domain-types.ts` already claims it does. This is real work and shouldn't be scheduled as "cleanup," it should be scheduled as part of whatever feature makes it unavoidable to touch that code anyway.
5. **Fix the skill-level discrepancy (§4) and confirm/fix the `mastery_rows` query (§6) on their own tickets**, independent of everything else — both are small, both are closer to "quietly wrong" than "inconsistently named," and neither requires the bigger consolidation work above to be worth doing now.

Items 1 and 2 cost almost nothing and would have the largest effect on whether this stays clean as more gets added — the actual duplication in §5 is expensive to unwind and reasonably low-stakes to leave alone a while longer, but letting a *sixth* naming variant get added because nobody knew the first five existed is the thing worth actively preventing starting now.
