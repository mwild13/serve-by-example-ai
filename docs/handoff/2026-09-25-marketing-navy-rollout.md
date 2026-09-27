# Handoff: Marketing site navy dark-frame rollout

- **Date:** 2026-09-25
- **Branch:** `preview/navy-tokens-rollout` (merged to `main` as `7df4ded`, pushed to production)
- **Scope:** Public marketing site only (landing page and sub pages). No dashboard, API or database changes.
- **Source plan:** "Design Critique: Marketing site dark-theme rollout" (external critique, pasted into the session)

## Summary

The marketing site had two competing darks: navy in the navbar and hero, and six different greens everywhere else. The decision was "dark frame, light body with ONE dark colour":

- Navy (`--bg-dark`, `--bg-dark-soft`) for navbar, heroes, key conversion bands and footer.
- Parchment for reading-heavy content (FAQ, founder story, forms, legal, screenshots).
- Green kept only as an accent. Gold (`--gold-warm`) is the primary CTA on dark.

## What shipped

| Area | Change |
|---|---|
| Dark surfaces | Footer, logo marquee, CTA bands, metrics strip, mastery band, founding section, feature card and `.cta-box` moved from greens to navy. |
| `PageHero` | Variants are now `default / solution / dark / light`. Everything renders navy except explicit `light` (privacy, terms, cookies). Breadcrumb key fixed to include the index. |
| `CTABand` | `background` is `navy | green | gold | neutral`, default `navy`. `green` is a deprecated alias for navy. |
| Homepage | Mid-page navy bands, merged the duplicate guarantee block, ROI card re-skinned to brand tokens. |
| `/how-it-works` | Consoles band and end CTA moved to navy. |
| `/platform/challenges` | Inline hero and CTA replaced with `PageHero` and `CTABand`. |
| `/toolkit/success` | Now wrapped in Navbar and Footer. |
| Lint | `sbe-design/no-hardcoded-hex` gained a `colorFunctions` option that flags `rgb()/rgba()/hsl()/hsla()` in marketing TSX. `var(--x, rgba(...))` fallbacks are stripped before matching. |
| Tokens | `--border` defined as `var(--line)`. All `--mkt-*` colour tokens removed and mapped to root tokens. `--mkt-duration` kept (timing, not colour). |
| Screenshots | `.sbe-shot` class and `--shadow-shot` token for light-section product shots. |
| Dead CSS | Removed `.hero`, `.inner-hero` (and their media overrides), `.brand-subtitle`, `.nav-demo-btn`, `.bento-card*`, `.hero-cta-tile*`. |
| Compare panel | Microcopy lifted from the faint to the muted on-dark token for AA contrast. |
| Copy | "5★" stat on `/solutions` is now "5-star". Privacy "Last updated" is 25 September 2026 (web page and mobile screen). |

## Bugs fixed during review

1. **Platform white strip under navbar.** Cause: the sticky `.section-subnav` was hidden with a transform but still occupied layout height. Fix: `position: fixed`.
2. **Platform 1px white line (after fix 1).** Cause: the `.section-subnav-sentinel` div (1px, in flow). Fix: absolutely positioned.
3. **`/demo` layout broken under the navy hero.** Cause: `.demo-dual-pane` was forced to `100dvh - nav-height` with `overflow: hidden`, from when the hero was short, so the right pane clipped. Fix: natural flow, top spacing, right column `position: sticky`.
4. **`/resources/sop-toolkit` venue tile wrapped.** The 780px tile cap was too narrow for the "Cafe or Brunch Venue" line. Cap raised to 920px. Mobile unaffected (rows still wrap).

## Commits (newest first, on `main`)

- `7df4ded` Merge `preview/navy-tokens-rollout` into `main`
- `05ad3ca` demo layout, SOP tile width, privacy date
- `6ee8848` `lib/fal.ts` and new AI mobile pictures
- `3ee4b1b` subnav sentinel, shared layout on challenges/success, `--mkt-*` folded into root tokens
- `e4a8937` platform subnav gap, `--border`, how-it-works navy, legacy hero CSS purge
- `0cdecf6` marketing token cleanup, rgba lint rule, screenshot elevation
- `01fda57`, `0ceeceb`: earlier homepage navy bands and darks unification

## Verification status

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass |
| `npx eslint app components` | Pass |
| `npm run build` | Pass (76 static pages) |
| Full `npm run lint` | 15 pre-existing errors, all in `.agents/skills/impeccable/scripts/live-browser.js` (third-party, tracked). Not from this work. |
| Visual checks on preview | Done by the owner. All pages passed except `/demo` (since fixed) and the SOP tile (since fixed). |
| Accessibility follow-up items | Owner signed off. |
| Post-fix visual check | `/demo` confirmed in a local render. SOP tile width was calculated (about 815px needed vs 920px cap), not visually confirmed. |

## Open items and follow-ups

- **Confirm the SOP tile** ("BYO licensing edge cases...") is on one line on desktop in production.
- **Floating "Book a free 15-min call" button** overlaps the solution links at the bottom of the `/demo` right pane. Pre-existing. Move or hide it on `/demo` if it matters.
- **Privacy date** was changed with no policy text change. Revert if the date is treated as a legal record. Cookies date left at 3 July 2026.
- **Not done, by decision or scope:**
  - Logo marquee shows venue categories, not real logos, so it is not social proof.
  - No customer proof near the final CTA. Project rule: no testimonials, logos or unsourced stats until real ones exist.
  - Contrast ratios in the source plan were hand-estimated. Only spot-verified.
  - `/demo` footer and `.sbe-dark` leakage into marketing on client-side navigation were reviewed in the plan but never fully tested. `DashboardShell` removes `sbe-dark` on unmount (line ~556).
- **Not caught by lint:** raw `rgba()` in CSS files. The rule only covers TSX.
- **Legacy CSS check:** `.hero` removal was verified by grep only. Watch `/demo` (`demo-inner-hero` classes were left alone).

## Gotchas for the next person

- `next start` does not work here (`output: standalone`). To test locally after a build: copy `.next/static` and `public` into `.next/standalone`, then run `node .next/standalone/server.js`.
- Geo-block middleware redirects local requests to `/restricted` unless you send a `cf-ipcountry: AU` header.
- macOS `sed -i` needs `sed -i ''`.
- The `preview/navy-unification` branch is an older local, unpushed copy of part of this work. Safe to delete.
- Branch flow used: preview branch, Cloudflare preview review, then merge to `main`. Confirm the branch name before any push.

## Where to look

- `app/globals.css`: tokens (top), `.sbe-mkt-ctaband-*`, `.sbe-mkt-pagehero-*`, `.section-subnav*`, `.demo-*`
- `components/marketing/PageHero.tsx`, `components/marketing/CTABand.tsx`
- `eslint.config.mjs`: `no-hardcoded-hex` and the `colorFunctions` option
- `app/dashboard/_components/DashboardShell.tsx`: `sbe-dark` add and remove
