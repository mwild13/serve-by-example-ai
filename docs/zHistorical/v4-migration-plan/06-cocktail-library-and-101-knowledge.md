# 06 — Cocktail Library & 101 Knowledge

## Primary Goal & UI Targets

Primary targets: `CocktailLibraryScreen`, `KnowledgeBaseScreen`. "Done" = both screens read from the real static content arrays instead of their current mock/inline data, with the same search/filter behavior V3 already has. This is the lowest-risk file in the whole plan — no backend, no DB, no API route needed.

## Diamond Extraction List

**`lib/cocktails.ts`** (577 lines) — exports `COCKTAILS`, confirmed **38 entries**, typed `Cocktail`, 10 `Category` values, `featuredOrder` (1–15) flagging the "Top 15 Most Common" set. No fetch, no DB — pure static data.

**`lib/knowledge-base.ts`** (555 lines) — exports `KB_ENTRIES`, confirmed **31 entries** (not 101, despite the file's own header comment and the "101 Knowledge Base" nav label used elsewhere in the app — see `00`'s mismatch table). 5 `KBCategory` values with sub-categories.

**`CocktailLibrary.tsx`** / **`KnowledgeBase.tsx`** (`app/dashboard/_components/knowledge-base/`) — both import the arrays directly, filter/search purely client-side via `useMemo` keyed on `search`, `activeCategory`, `activeSubCategory` state. Zero network calls. Lazy-loaded per `CLAUDE.md`.

**Mobile screens today:** `CocktailLibraryScreen.tsx` and `KnowledgeBaseScreen.tsx` are both explicitly commented "1:1 visually; search, filters, and category tabs are non-functional." `KnowledgeBaseScreen.tsx` currently hardcodes its own inline sample entries rather than importing `lib/knowledge-base.ts` at all.

## Architecture & Cleanup Plan

- Import `COCKTAILS`/category list directly into `CocktailLibraryScreen.tsx`, replacing whatever mock array currently backs the 4 cocktail rows and 5 category pills.
- Import `KB_ENTRIES`/`KBCategory` directly into `KnowledgeBaseScreen.tsx`, replacing its hardcoded inline sample data entirely.
- Lift the `useMemo` filter pattern from `CocktailLibrary.tsx`/`KnowledgeBase.tsx` verbatim — it's already correct and needs no adaptation beyond styling (mobile screens already use the project's CSS-variable / inline-style convention, no Tailwind to strip since V3's dashboard versions also avoid Tailwind).
- **The "101" naming discrepancy is not resolved by this file** — `KB_ENTRIES` has 31 real entries. Before wiring this screen as final production code, get an explicit call from the user: rename the nav label/screen title away from "101," or treat expanding to 101 entries as a content task tracked separately. Do not silently ship a screen titled "101 Knowledge Base" backed by 31 items without a decision.
- No API route work needed for either screen — this is the one file in the plan set where "Diamond Extraction" is genuinely just an import statement plus a lifted `useMemo` hook.

## Step-by-Step Task Checklist

1. Replace `CocktailLibraryScreen.tsx`'s mock cocktail/category data with a direct import from `lib/cocktails.ts`.
2. Port the `useMemo` search/filter logic from `CocktailLibrary.tsx` into `CocktailLibraryScreen.tsx`, wiring the existing (already-`useState`-enabled per the Phase B.5 nav plan) category pills to it.
3. Replace `KnowledgeBaseScreen.tsx`'s hardcoded inline entries with a direct import from `lib/knowledge-base.ts`.
4. Port the equivalent `useMemo` filter logic into `KnowledgeBaseScreen.tsx`, wiring its category pills (already has the reference `useState` pattern per the Phase B.5 nav plan).
5. Surface the "101 vs 31" naming question to the user before considering this screen launch-ready; record the decision here or in `00` once made.
6. Manually verify: search returns correct matches on both screens, category filters narrow correctly, entry counts on screen match the real array lengths (38 cocktails, 31 KB entries).

## Implementation Notes (Day 5 — 2026-08-18, continued)

Steps 1–4 done. Step 5 (naming decision) surfaced below, not resolved unilaterally. Step 6 still open (manual verification).

- **`CocktailLibraryScreen`** now imports `COCKTAILS`/`CATEGORIES` directly from `lib/cocktails.ts` and ports the desktop `useMemo` filter (name + ingredient search, category filter, featured-first sort) verbatim from `CocktailLibrary.tsx`. The Phase B mock's per-card `base`/`difficulty`/`locked` fields don't exist on the real `Cocktail` type and were dropped rather than faked — replaced with the real `glass` field and a `featured` ("Most Common") tag. Only 4 of 38 cocktails have dedicated photography in `/public/mobile` (Espresso Martini, Aperol Spritz, Negroni, Sazerac); every other card now falls back to the existing generic `/public/mobile/thumb-cocktail.png` rather than a broken image path. Bookmarking is wired as a real toggle, session-only state — an honest 1:1 port of desktop's own `practiceAdded` behavior, which also doesn't persist beyond the session today.
- **`KnowledgeBaseScreen`** now imports `KB_ENTRIES`/`KB_CATEGORIES` directly from `lib/knowledge-base.ts`, replacing the Phase B mock's hardcoded 6-entry `SPIRITS_101` sample array entirely. Ported the desktop `useMemo` filter (title/content/tag search, category filter, grouped-by-category display) from `KnowledgeBase.tsx`. Desktop's slide-over detail panel had no mobile equivalent (tapping a card previously did nothing), so a bottom-sheet `DetailSheet` was built for mobile — same content shape (content, key facts, tags), same interaction as `CocktailLibrary.tsx`'s existing `DetailSheet`, styled with mobile dark tokens.
- **Step 5 — the "101 vs 31" naming question is flagged, not decided.** Confirmed this isn't a decision this migration introduces: desktop's own `KnowledgeBase.tsx` already ships the literal title "101 Knowledge Base" over the same 31-entry array today, in production. Mobile now matches that pre-existing (if inconsistent) desktop behavior exactly rather than diverging from it unilaterally — same label, same real count shown directly underneath ("31 quick-reference cards..."). Whether to rename the label or expand `KB_ENTRIES` toward 101 is a product content decision still owed to the user before either screen is called launch-final; recorded here as still open, not silently resolved.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile/_components/CocktailLibraryScreen.tsx app/mobile/_components/KnowledgeBaseScreen.tsx --max-warnings=0`, and a full `npx next build` — all pass with zero errors/warnings.
- **Still open:** Step 6 — manual verification that search/filter results and displayed counts are correct on-device for both screens. Lower risk than the other files' open items since there's no backend write path here to get wrong, but not yet eyeballed in a browser.

## Implementation Notes (Day 5 — 2026-08-18, continued) — Step 5 resolved

User's final call: **rename "101 Knowledge Base"/"101" to plain "Knowledge Base" everywhere**, not expand content toward a literal 101 entries. Applied across every reference found repo-wide, not mobile-only:

- `app/mobile/_components/KnowledgeBaseScreen.tsx` — title and description ("...the 101 Series" clause dropped).
- `app/mobile/_components/HomeScreen.tsx` — Quick Access tile label.
- `app/dashboard/_components/knowledge-base/KnowledgeBase.tsx` — header title and description (same "101 Series" clause dropped).
- `app/dashboard/_components/DashboardShell.tsx` — nav label (`NAV_ITEMS`; the `"knowledge"` nav *id* is unchanged, only the display label).
- `app/dashboard/_components/PreShiftHome.tsx` — home-tab carousel eyebrow tag.
- `app/dashboard/_components/MobileLearnHub.tsx` — tile title.
- `app/dashboard/_components/RecommenderCard.tsx` — CTA link text.
- `components/ui/CompareMatrix.tsx` — marketing-site feature comparison row label. Technically outside "dashboard references" but names the same feature — left mismatched here while everywhere else says "Knowledge Base" would just relocate the inconsistency to a public marketing page, so fixed it too.
- `lib/knowledge-base.ts` — file header comment updated (not user-facing, but was the last "101" reference still describing the file's own purpose incorrectly).
- **Deliberately not touched**: `KB_CATEGORIES`' `"Spirits 101"` / `"Beer 101"` / `"Wine 101"` / `"Cocktails 101"` / `"Non-Alcoholic 101"` category labels — these use "101" as the common "basics of X" idiom, unrelated to the count-mismatch naming issue this decision resolves. Renaming those would be a different, unrequested content change.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile --max-warnings=0`, plus targeted eslint on every touched dashboard/marketing file, and a full `npx next build` — all pass with zero errors/warnings.
- **File `06` step 5 is now closed.** Step 6 (on-device search/filter eyeball check) remains open, folded into the standing combined live-browser pass.
