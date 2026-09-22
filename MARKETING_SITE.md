# Marketing Site — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers the public-facing marketing routes in `app/` (everything outside `/dashboard`, `/management`, and the auth/utility routes).

## 1. Scope — Marketing Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/platform` | Platform overview |
| `/platform/challenges` | Interactive Challenges marketing page |
| `/solutions` | Solutions by venue type |
| `/solutions/fine-dining` | Fine dining vertical |
| `/solutions/franchise-systems` | Franchise systems vertical |
| `/solutions/hotel-fb` | Hotel F&B vertical |
| `/solutions/multi-venue` | Multi-venue groups vertical |
| `/solutions/pub-groups` | Pub groups vertical |
| `/for-venues` | Venue operator landing |
| `/pricing` | Pricing (Stripe checkout) — see §2, same page component as `/membership` |
| `/membership` | Re-exports `/pricing`'s page component with its own metadata (title "Membership Plans", "Founding Member" framing) — **missing from prior docs entirely** despite being the link target most marketing CTAs actually point to |
| `/vs-generic-lms` | Comparison page — **also missing from prior docs entirely** |
| `/demo` | Public AI demo |
| `/demo/complaint-master` | Complaint handling demo |
| `/how-it-works` | How It Works |
| `/roi` | ROI Calculator |
| `/resources` | Resources hub |
| `/resources/sop-toolkit` | Free SOP toolkit lead magnet |
| `/toolkit` | SOP toolkit landing page |
| `/toolkit/success` | Post-toolkit-download success page |
| `/roadmap` | Public product roadmap |
| `/security` | Security & Safety |
| `/about` | About |
| `/contact` | Contact |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/cookies` | Cookie Policy |

## 2. Canonical URLs & Routing Rules

**`/pricing` vs `/membership`**: `app/membership/page.tsx` is a one-line re-export — `export { default } from "@/app/pricing/page";` — same component, different `layout.tsx` metadata. Both pages set their own self-referential SEO canonical:

```ts
// app/pricing/layout.tsx
alternates: { canonical: "/pricing" }
// app/membership/layout.tsx
alternates: { canonical: "/membership" }
```

Both are listed separately in `app/sitemap.ts`. This is a duplicate-content SEO issue — two canonical URLs for identical content. `/membership` is the link target used almost everywhere across marketing pages ("View Pricing" CTAs on `/roi`, `/solutions/*`, `/for-venues`, `/how-it-works`, `/resources`, `/roadmap`, `/demo/*`, the homepage), while `/pricing` is the route most historically documented. Recorded as current state in Known Gaps below — not fixed here.

**Geo-blocking** (source: `lib/geo-config.ts`) — Australia-only platform:
- `shouldApplyGeoBlock(pathname, country)` no-ops entirely outside `NODE_ENV=production` (local dev/build never geo-blocks).
- Country resolved from Cloudflare's `cf.country` / the `cf-ipcountry` header. Unknown, missing, or `XX` is **denied by default** (`isCountryAllowed` strict default-deny).
- `restrictedRoutes`: `/login`, `/signup`, `/onboarding`, `/dashboard`, `/management`.
- `marketingRoutes` is **deliberately empty** — all marketing/hero content is AU-only too. A comment in the config explains why: this list used to include `/pricing`, `/for-venues`, `/demo`, `/platform`, which created a bypass (`/restricted` → `/privacy` (public) → Navbar → `/pricing` (then-allowed) → full site). That bypass was closed by emptying this list.
- `publicRoutes` (accessible to all countries): `/restricted`, `/geo-block`, `/privacy`, `/terms`, `/cookies`, `/contact`.
- `geoBlockPath` is `/restricted` — **this is the actual redirect target**, not `/geo-block`. `/geo-block` is a real, separate page (own `"Australia Only – For Now"` messaging, `robots: noindex`) that sits in `publicRoutes` (so it's reachable if linked to directly) but the middleware's redirect never routes there — it always sends blocked visitors to `/restricted` instead.

## 3. Brand Voice & Copy Rules

| Say this | Not this | Where confirmed |
|---|---|---|
| Manager Console | ~~Mission Control~~ | Navbar, Footer, homepage feature card, `/how-it-works`, `/solutions`, `/pricing`, `/privacy`, `/vs-generic-lms`, `components/ui/CompareMatrix.tsx` |
| 14-Day Performance Guarantee | — | `app/page.tsx:460-486`, a dedicated section: *"If training engagement doesn't measurably increase within your first 14 days, you won't be charged. No questions asked."* |

**Be precise about which "14-day" claim is being referenced** — two distinct claims share the same number and both appear across marketing copy:
1. **14-day free trial** (trial length) — reused on `/pricing`, `/terms`, `HeroSection.tsx`, `CompareMatrix.tsx`, `lib/trial.ts`.
2. **14-Day Performance Guarantee** (money-back guarantee, conditional on engagement) — `app/page.tsx:460-486` only.

These are not interchangeable — don't use "14-day" copy from one context to justify wording in the other.

"Manager Console" is the correct term for **marketing copy** (this doc's scope, `app/(marketing)` routes). It does still leak as "Mission Control" in a few real user-facing strings on the authenticated product surface (`/management/dashboard`'s `<title>`, its error page, some role-picker option labels) — that's a product-surface naming drift, not a marketing-copy violation, and is documented in `docs/MANAGER_CONSOLE.md`'s Known Gaps, not here.

## 4. Component Usage

**`components/marketing/`** — an entire directory not previously documented anywhere, and the real answer to "which component for feature cards / metric strips / CTA bands":

| Component | Role | Used in |
|---|---|---|
| `PageHero.tsx` | Replaces every hand-coded `.inner-hero` block | ~24 pages: `/demo`, `/demo/complaint-master`, `/contact`, `/roi`, `/vs-generic-lms`, `/privacy`, `/security`, `/roadmap`, `/resources`, `/resources/sop-toolkit`, `/platform`, `/terms`, `/solutions` + all 5 verticals, `/for-venues`, `/about`, `/how-it-works`, `/pricing`, `/toolkit`, `/cookies` |
| `FeatureGrid.tsx` | Feature/benefit grid; variants `'default' \| 'dark' \| 'stat'`; replaces `bento-grid`/`sol-feature-grid`/`benefit-grid` markup; icons from `components/icons/MarketingIcons.tsx` | Homepage, `/vs-generic-lms`, `/roi`, `/security`, `/roadmap`, `/resources/sop-toolkit`, `/platform`, all `/solutions/*`, `/for-venues`, `/about`, `/how-it-works` |
| `MetricsStrip.tsx` | Horizontal stat-row band; enforces an "honesty rule" — no fabricated outcome numbers | Individual marketing pages — check usage before assuming a page has one |
| `CTABand.tsx` | End-of-page CTA band: one primary action + optional secondary text link | Across marketing pages per `docs/Pages-Redesign.md` §6.3 |
| `LogoMarquee.tsx` | Logo marquee (blocked on real customer logos) | Homepage |

**`components/ui/`** — for pricing-table and comparison content specifically:

| Component | Purpose |
|---|---|
| `CompareMatrix.tsx` | Full feature-comparison matrix (Staff/Venue/Group/Franchise columns); docstring targets the `/membership` page | `app/pricing/page.tsx`, `app/for-venues/page.tsx` |
| `SectionHeading.tsx` | `eyebrow`/`title`/`copy`/`align` props, **defaults to `align: 'left'`** per `docs/Pages-Redesign.md` §2.2's rule against centering every section | ~13 pages |
| `ROICalculator.tsx` | Interactive ROI calculator widget | Homepage, `/roi`, `/pricing` |
| `PricingIcons.tsx` | SVG icon set (`IncludedIcon`, `ExcludedIcon`, `TreeConnector`) for the pricing/membership matrix | `CompareMatrix.tsx` |

**Note**: `components/ui/` does not contain `BrowserMockup.tsx`, `DashboardMockup.tsx`, or `WaitlistSection.tsx` — if you've seen these referenced elsewhere, they no longer exist; don't import them.

## Known Gaps / Drift

- **`/pricing` and `/membership` duplicate-canonical SEO issue** (§2) — recorded as fact, not fixed.
- **`/geo-block` is a real, reachable page that the geo-block middleware never redirects to** (§2) — the actual redirect target is `/restricted`. Possibly stale/orphaned; not resolved here.
- **"Mission Control" leaks into a few user-facing strings outside marketing copy** on the authenticated product surface (§3) — see `docs/MANAGER_CONSOLE.md` for the specifics; out of scope for this doc since it only governs `app/(marketing)`.

## Related Docs

- `docs/Pages-Redesign.md` — full visual/structural marketing redesign spec (default left-aligned headers, no generic gradients, vary feature-list presentation, scope-limited to marketing pages) — this doc does not duplicate it
- `docs/SBE-Marketing-Audit-July2026.md` — historical point-in-time audit
- `docs/pricing-membership-overhaul.md` — historical background on the `/pricing` vs `/membership` split
