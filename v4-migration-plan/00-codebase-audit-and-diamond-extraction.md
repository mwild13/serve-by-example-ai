# 00 — Codebase Audit & Diamond Extraction Index

## Primary Goal & UI Targets

This file is the master index for the whole `v4-migration-plan/` set. It doesn't own any single V4 screen — it cross-references all 13 screens in `app/mobile/_components/` and points to which of files `01`–`11` harvests which part of the existing V3 backend. Read this file first; read the numbered file for the screen you're about to wire.

**Strategy recap ("Diamond Extraction"):** V3 (`app/dashboard/_components/`, `lib/`, `app/api/`) has 8+ months of battle-tested mastery math, AI prompts, and DB schema. V4 (`app/mobile/_components/`) is a static, Figma-accurate UI skeleton with zero backend wiring (Phase B, complete — see Phase B.5 plan for the navigation layer, also complete). Phase C's job is to attach V3's real logic to V4's real screens — reusing, not rebuilding, except where flagged below as genuinely net-new.

## V3 Source Files Touched, by Downstream Plan File

| V3 file / table | What it is | Harvested by |
|---|---|---|
| `lib/supabase-server.ts`, `lib/supabase.ts`, `lib/supabase-admin.ts` | Auth clients (server/browser/admin) | `01` |
| `app/dashboard/page.tsx` (auth-gate sequence) | Server-side auth + tier-resolution gate pattern | `01` |
| `lib/session.ts` | Tier access (`resolveAccess`), session displacement (`stampSession`/`validateSession`) | `01`, `09` |
| `app/api/session/stamp/route.ts` | Session-stamp cookie endpoint | `01` |
| `lib/mastery.ts` | Elo/mastery engine — `recordAttempt`, `markModuleMastered`, `getMasteryProgress`, `getReviewQueue`, `getScenarioMasteryDetails`, `syncMasteryToVenueStaff` | `02`, `04`, `09` |
| `lib/module-navigator.ts` / `lib/modules.ts` | Module catalog + tier-resolved availability | `03` |
| `app/api/training/modules/[moduleId]/route.ts`, `.../scenarios/route.ts` | Orphaned-but-functional per-module/scenario reads | `03` |
| `app/api/training/save/route.ts`, `app/api/training/progress/route.ts` | Canonical write/read for attempts + progress | `02`, `09` |
| `app/api/arena/evaluate/route.ts` | Single-shot Arena roleplay scoring (0-100 rubric) + its own hand-rolled mastery upsert | `04`, `09` |
| `app/api/evaluate/route.ts`, `app/api/demo/evaluate/route.ts` | 5-criteria 0-25 scenario evaluation (auth'd + public demo twin) | `04` |
| `app/api/coach/route.ts`, `app/api/management/coach/route.ts` | Staff / manager AI coaching prompts | (reference only — no V4 screen owns this yet) |
| `app/api/translate/route.ts` | Runtime translation | (reference only — not in scope for any of the 13 screens) |
| `app/api/demo/generate-drills/route.ts` | Menu-grounded drill generation (frontend deleted, API intact) | (reference only) |
| `app/api/training/challenges/save/route.ts` | Challenge completion upsert | `05` |
| `lib/cocktails.ts`, `lib/knowledge-base.ts` | Static reference content (38 cocktails, 31 KB entries) | `06` |
| `lib/badges.ts` | `computeBadges()` pure function | `07` |
| `lib/diagnostic-engine.ts` | 10-question Elo placement diagnostic | `08` |
| `lib/management/service.ts::getManagementSnapshot()` | Manager-console read path | `09` |
| `lib/rate-limit.ts` | Fixed-window in-memory limiter | `11` |
| `components/ErrorLogger.tsx` | Console-only client error logger (no retry/offline layer exists) | `10` |

## Architecture Debt Found During This Audit — Do Not Replicate

1. **Arena's hand-rolled Elo upsert** (already flagged in `CLAUDE.md`'s "Mastery Engine Rules"). `app/api/arena/evaluate/route.ts` writes directly to `scenario_mastery` instead of calling `recordAttempt()` — different scale (0-100 vs 0-25), different mastery-level logic (binary ternary vs. the real streak state machine), no spam guard. **File `04` scopes closing this, not copying it forward.**
2. **No shared OpenAI client factory** (newly found this audit). All 7 AI routes (`arena/evaluate`, `evaluate`, `coach`, `management/coach`, `translate`, `demo/evaluate`, `demo/generate-drills`) each redeclare an identical local `getOpenAIClient()` helper. **File `04` proposes a single `lib/openai.ts` factory** — small win, kills 7x duplication, matches the project's "single source of truth" philosophy already applied to `lib/mastery.ts`.

## Locked Decisions (from Plan Mode review — restated here for quick reference)

| # | Screen | V4 mock implies | V3 reality | Decision |
|---|---|---|---|---|
| 1 | `AiProfilePhotoScreen` | AI-generated profile photo | **Zero image-gen code exists anywhere in the repo** | **Build new** — net-new `openai.images.generate` route, prompts, storage. Real per-call cost. See `08`. |
| 2 | `ArenaScreen` | Live back-and-forth chat | Single-shot: one scenario, one response, one score | Wire to the real single-shot endpoint; UI is a chat *shell* around one exchange, not real multi-turn. See `04`. |
| 3 | `LearnHubScreen` | Per-module "locked" badges | One global gate: `free` = 0 modules, any paid tier = all 40 | Cosmetic-only lock driven by `access.allowedModules`, not per-module rules. See `03`. |
| 4 | `ProgressScreen` | "XP" number + 9 skill rings | No XP concept anywhere; only 3 real categories (technical/service/compliance) | Remap UI to real `mastery`/`elo_rating`/streak fields, 3-category breakdown. See `02`, `03`. |

## Other V4-mock-vs-V3-reality Mismatches Found (not decision points — just facts to design around)

- **Knowledge Base "101"**: nav label and `lib/knowledge-base.ts`'s own header comment say "101," but `KB_ENTRIES` has **31 confirmed entries**. Not resolved in this plan — flagged for the user to decide (rename the label vs. author ~70 more entries) before file `06` is executed as code.
- **`HomeScreen`'s "Today's Hot Picks" / "Pre-Shift Warmup"**: no single V3 endpoint composes this payload today. Closest building blocks are `getAvailableModules()`'s lowest-Elo recommendation (`lib/module-navigator.ts`) and `getReviewQueue()` (`lib/mastery.ts`) — these would need to be composed into a new lightweight "today" read, which is small integration work, not net-new domain logic.
- **`OnboardingDiagnosticScreen`'s self-report levels**: the V4 mock is a simple "pick Beginner/Intermediate/Advanced" UI with no scoring. It has no relationship to V3's real 10-question, category-scored `diagnostic-engine.ts` placement flow. File `08` proposes replacing the self-report with the real question flow rather than porting the fake picker forward.
- **`MatchPairsScreen`'s own file comment** already scopes it to "no click handlers, no game logic" for Phase B — worth remembering going into `05`, since V3's challenge games are themselves entirely client-local state (no server-side game logic exists to extract either).

## Canonical Naming — Hard Constraints for Every File Below

Per `CLAUDE.md`'s "Mastery Engine Rules," every file in this plan (and any code written from it) must use:
- `elo_rating` — never `current_elo` / `eloRating` / `avgElo`
- `mastery` — never `mastery_pct` / `mastery_status`
- Module metadata sourced through `lib/module-navigator.ts` or `/api/training/modules` — never a new hardcoded module list per screen (V4's 13 screens currently violate this in several places; each downstream file calls out where).

## How to Use This Plan Set

Read files in roughly this order during Phase C: `01` (auth, cross-cutting first) → `02` (mastery engine, the shared foundation) → `03`–`08` (per-screen, any order) → `09` (manager sync, verify after each screen) → `10` (resilience, apply as a cross-cutting pass) → `11` (final QA, last).
