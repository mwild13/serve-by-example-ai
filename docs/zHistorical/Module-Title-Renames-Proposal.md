# Module Title Renames — Proposal for Review

**Goal:** shorten module titles so the Learn Hub's "All Modules" grid can go
to 2 columns and actually fit within the mobile frame (currently the grid
overflows past the 390px-wide app shell — a separate layout bug, to be
scoped once titles are locked), and so the Practice & Scenarios tiles (which
truncate to a single line) show something readable instead of "Bar-Back
Synergy: T…".

**Style:** 2–3 words, Title Case, matching the rest of the existing catalog's
casing convention. Less is best — connector words ("and", "of", "the",
"with") are dropped wherever the meaning survives without them.

**Status: implemented 2026-08-24.** All 40 titles below are approved and
live — `modules` table (Supabase, applied directly), plus the 4 duplicate
catalog files (`lib/module-navigator.ts`, `ArenaPage.tsx::MODULE_META`,
`lib/diagnostic-engine.ts`, `ModuleVerify.tsx`) and 3 further copies found in
a repo-wide sweep afterward (`app/api/training/modules/[moduleId]/route.ts`,
`components/mission-control/manager-ui.tsx`, `app/mobile/_components/
ArenaScreen.tsx`'s `DEFAULT_MODULE_TITLE`). `tsc`, `eslint`, and a full
`npm run build` all pass.

**What a rename actually touches** (once approved, not done yet): the
`modules` table row (`title` column, `UNIQUE` constraint — every title below
has been checked for collisions, none exist), plus the duplicated
module-catalog copies in `lib/module-navigator.ts`'s fallback array,
`ArenaPage.tsx::MODULE_META`, `lib/diagnostic-engine.ts`, and
`ModuleVerify.tsx` (documented tech debt in CLAUDE.md — a rename is a good
forcing function to confirm all four stay in sync, not to consolidate them
into one source, which is a bigger separate job).

---

## Modules 21–40 ("War Room" Set) — FINAL

| # | Current Title | New Title | Words |
|---|---|---|---|
| 21 | The "Behind!" Rule: Spatial Awareness & Safety | Call Behind | 2 |
| 22 | The "Glass in Well" Emergency: The Burn Protocol | Ice Well Burn | 3 |
| 23 | The Swivel Head: Identifying Needs from 10 Meters | The Swivel Head | 3 |
| 24 | Ice is Food: The Sacred Rules of the Scoop | Ice Is Food | 3 |
| 25 | The Allergy Shield: Communicating Dietary Danger | Allergy Shield | 2 |
| 26 | The Soda Gun: Muscle Memory & Troubleshooting | Soda Gun Speed | 3 |
| 27 | Economy of Motion: Two Hands, One Flow | Two-Handed Flow | 2 |
| 28 | The Mid-Shift Reload: Mise en Place Maintenance | Mid-Shift Reset | 2 |
| 29 | Deciphering the Docket: From Printer to Plate | Docket Reading | 2 |
| 30 | Taming "The Weed": Mental Fortitude Under Pressure | Beating the Weed | 3 |
| 31 | The 30ml Truth: Precision vs. Profit | Jigger Precision | 2 |
| 32 | The Waiter's Friend: Mechanical Wine Mastery | Wine Opener Mastery | 3 |
| 33 | The Cellar Sprint: Kegs, Gas, and Gurgles | Cellar & Kegs | 3 |
| 34 | Glassware Geometry: Weight, Balance, and Grip | Tray & Glass Grip | 4 |
| 35 | The Golden Standard Close: Cleaning for Tomorrow | The Clean Close | 3 |
| 36 | The Two-Minute Check: The Critical Window | Two-Minute Check | 2 |
| 37 | The Pivot: Dealing with "No" and "Out of Stock" | The Out-of-Stock Pivot | 4 |
| 38 | The Dead Soldier: Clearing & Resetting the Battlefield | Clearing Dead Soldiers | 3 |
| 39 | Bar-Back Synergy: The Lifeblood of the Front | Bar-Back Synergy | 2 |
| 40 | The Natural Upsell: Suggesting, Not Pushing | Natural Upselling | 2 |

---

## Modules 1–20 — drafted for your review

Four of these (5, 12, 14, 15) are your own picks, dropped in verbatim. The
other 16 are drafted to match that same 2-word aesthetic — mark up any row
you want changed.

| # | Current Title | New Title | Words |
|---|---|---|---|
| 1 | Pouring the Perfect Beer | Beer Pouring | 2 |
| 2 | Wine Knowledge and Service | Wine Service | 2 |
| 3 | Cocktail Fundamentals | Cocktail Fundamentals | 2 *(already tight, unchanged)* |
| 4 | Coffee and Barista Basics | Barista Basics | 2 |
| 5 | Carrying Glassware and Trays | Tray Carrying | 2 |
| 6 | Cleaning and Sanitation | Sanitation Basics | 2 |
| 7 | Bar Back Efficiency | Bar-Back Efficiency | 2 |
| 8 | The Art of the Greeting | The Greeting | 2 |
| 9 | Managing Table Dynamics | Table Dynamics | 2 |
| 10 | Anticipatory Service | Anticipatory Service | 2 *(already tight, unchanged)* |
| 11 | Handling Guest Complaints | Guest Complaints | 2 |
| 12 | Upselling and Suggestive Selling | Suggestive Selling | 2 |
| 13 | VIP and Table Management | VIP Management | 2 |
| 14 | Phone Etiquette and Reservations | Phone Etiquette | 2 |
| 15 | RSA — Responsible Service of Alcohol | RSA Compliance | 2 |
| 16 | Food Safety and Hygiene | Food Safety | 2 |
| 17 | Conflict De-escalation | Conflict De-escalation | 2 *(already tight, unchanged)* |
| 18 | Emergency Evacuation Protocols | Evacuation Protocols | 2 |
| 19 | Opening and Closing Procedures | Opening & Closing | 2 |
| 20 | Inventory and Waste Control | Inventory Control | 2 |

---

## Next steps

1. Review the Modules 1–20 table, mark up any row you want changed (21–40
   is locked in as-is).
2. I apply all 40 titles across the DB + the 4 duplicate-catalog files
   listed above in one pass.
3. Separately: fix the "All Modules" grid overflowing the mobile frame at
   2 columns (the layout bug you flagged first) — scoped as its own pass
   once titles are locked.
