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
