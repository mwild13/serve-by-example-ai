# Deleted Features

## Integrations (deleted May 2026)

**Planned scope:** POS & Payments (Lightspeed, Square, SwiftPOS, Ordermate, Zeller),
Order & Table Management (me&u, Doshii), and Workforce Management (Tanda, Deputy)
were listed across the platform page, pricing page, and manager dashboard as
"coming in V2 / late 2026."

**Decision:** Removed all references pre-launch to avoid setting expectations we are
not yet ready to fulfil. Will be re-introduced as a proper roadmap item when
development begins.

**Locations updated:**
- `app/platform/page.tsx` — Integrations section removed (was lines 332–378)
- `app/pricing/page.tsx` — "Management & POS Integrations" roadmap feature removed
- `components/ui/DashboardMockup.tsx` — "Integrations" removed from ADMIN sidebar mock
- `components/mission-control/ManagerControlCenter.tsx` — Integrations tab, SECTION_META entry, and render block removed
- `app/globals.css` — `.integrations-category-grid`, `.integrations-category`, `.integrations-logo-row`, `.integration-logo-chip` CSS rules removed
- `lib/management/types.ts` — `"integrations"` removed from `ManagerSection` union type

---

## Careers (deleted May 2026)

**Planned scope:** A /careers page for job listings.

**Decision:** The footer Company column linked to `/careers` but no page existed.
Removed the link until a real careers page and active job listings are ready to publish.

**Locations updated:**
- `components/Footer.tsx` — Careers link removed from Company column
