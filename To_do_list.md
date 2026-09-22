# To Do — Mobile Responsive Fix (Phase 6 follow-ups)

Deferred items from the Phase 6 mobile-responsive workstream (`preview/mobile-responsive-fix`). Plan file: `~/.claude/plans/hi-claude-how-do-swirling-wave.md`.

## Blocking — needed to actually run the new test suite

- [ ] **Create a dedicated QA staff test account** in Supabase for Playwright:
  - Must have `onboarding_completed = true` and real module access (`allowedModules`), so `/mobile/*` screens render actual content instead of empty states or an `/onboarding` redirect.
  - Set `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` as env vars, then run `npm run e2e`.
  - `tests/e2e/global-setup.ts` will throw a clear error naming what's missing if either the env vars or the onboarding flag aren't set.

## Not blocking — explicitly deferred during Phase 6 planning

- [ ] iOS Safari's bottom-toolbar overlap (content briefly covered until the page is nudged) — known `100dvh`/WebKit quirk, left as-is per decision.
- [ ] Routing tablets into `/mobile` via `middleware.ts` — staying desktop-first for tablets; the wider Phase 4 frame remains a fallback improvement for direct links only.
- [ ] Extend Playwright visual-regression coverage beyond the initial 4 screens (Home, LearnHub, Settings, Contact) + landscape overlay to the remaining ~20 `/mobile` screens — pattern is a copy-paste of one `test(...)` block in `tests/e2e/mobile-screens.spec.ts`.
- [ ] Real-hardware Android pass — this round only covered iPhone (Safari + Chrome) on real hardware; Android was Chrome DevTools emulation only.
- [ ] `next.config.ts`'s `images.deviceSizes` still assumes `390` as the minimum (affects `next/image` srcset generation, not layout) — add `360, 375`.
- [ ] `sbe-design/no-hardcoded-mobile-px` ESLint rule (mirroring `sbe-design/no-hardcoded-hex`) to guard against regressing back to raw px in `/mobile` — worth adding once the token set (`--mobile-frame-max`, `--fs-mobile-*`, `--space-mobile-*`) has proven stable for longer.
