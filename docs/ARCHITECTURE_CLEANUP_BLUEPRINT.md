# SBE Architecture Cleanup Blueprint

**Status:** Planning phase — no code changes yet  
**Date:** 2026-07-13  
**Objective:** Migrate from a bloated global `components/` directory to Next.js route colocation, decompose monolithic components, and align domain terminology with database schema.

---

## 1. COLOCATION MAPPING

### 1.1 Current State: Global `components/` Sprawl

```
components/
  ├── DashboardShell.tsx              ← Main staff shell (used by app/dashboard)
  ├── HeroSection.tsx                 ← Homepage marketing
  ├── Navbar.tsx                      ← Global nav (homepage + marketing)
  ├── Footer.tsx                      ← Global footer (homepage + marketing)
  ├── ErrorLogger.tsx                 ← Global error boundary
  ├── LanguageRuntimeTranslator.tsx   ← Global language runtime
  ├── SectionSubNav.tsx               ← Reusable section nav
  ├── VenueMarquee.tsx                ← Marketing carousel
  │
  ├── learning-engine/                ← 17 files: staff dashboard views
  │   ├── PreShiftHome.tsx            (860 lines)
  │   ├── DynamicModuleNav.tsx        (208 lines)
  │   ├── ModuleVerify.tsx            (270 lines)
  │   ├── RapidFirePage.tsx           (307 lines)
  │   ├── RapidFireQuiz.tsx           (271 lines)
  │   ├── ArenaPage.tsx               (574 lines)
  │   ├── ChallengesPage.tsx          (1255 lines) ← BLOATED
  │   ├── DiagnosticFlow.tsx          (306 lines)
  │   ├── DashboardTrainer.tsx        (1025 lines) ← BLOATED
  │   ├── ProgressOverview.tsx        (1045 lines) ← BLOATED
  │   ├── BadgeStreakSection.tsx
  │   ├── BadgeProgressRing.tsx
  │   ├── BadgesView.tsx              (308 lines)
  │   ├── RecommenderCard.tsx
  │   ├── MobileDashboardV3.tsx       (758 lines)
  │   ├── MobileLearnHub.tsx          (214 lines)
  │
  ├── mission-control/                ← 8 files: manager dashboard views
  │   ├── ManagerControlCenter.tsx    (3743 lines) ← MONOLITH
  │   ├── StaffRosterPanel.tsx        (537 lines)
  │   ├── CoachingDrawer.tsx          (153 lines)
  │   ├── ActionDrawer.tsx            (119 lines)
  │   ├── ManagementTopbar.tsx        (137 lines)
  │   ├── WorkspaceHeader.tsx
  │   ├── manager-ui.tsx              (227 lines) ← UI primitives
  │   ├── manager-types.ts
  │   └── compliance/
  │       ├── ComplianceHub.tsx
  │       └── helpers.ts
  │
  ├── knowledge-base/                 ← 2 files: lazy-loaded reference
  │   ├── CocktailLibrary.tsx
  │   └── KnowledgeBase.tsx
  │
  ├── toolkit/                        ← 2 files: SOP generator
  │   ├── SopGeneratorPreview.tsx
  │   └── SopPreviewDocument.tsx
  │
  └── ui/                             ← 8 files: genuinely shared
      ├── CompareMatrix.tsx
      ├── DashboardMockup.tsx
      ├── LanguageSwitcher.tsx        (shared across dashboard + homepage)
      ├── ROICalculator.tsx           (marketing pages)
      ├── SectionHeading.tsx          (marketing pages)
      ├── SessionRefresher.tsx        (staff dashboard)
      ├── SignOutButton.tsx           (staff + manager dashboards)
      └── Skeletons.tsx               (loading states across app)
```

### 1.2 Target State: Route Colocation with `_components/`

**Principle:** Each route owns its own UI components. A component moves to `_components/` in its route folder if it's:
- Only used by that route's page or other `_components/` in that route
- Not referenced by sibling routes
- Not part of marketing/shared experience

**Files that stay global** (in `components/ui/`):
- `SignOutButton.tsx` — used by staff dashboard + manager dashboard
- `SessionRefresher.tsx` — used by staff dashboard + manager dashboard
- `LanguageSwitcher.tsx` — used by staff dashboard + marketing pages
- `Skeletons.tsx` — loading skeletons used across routes
- `SectionHeading.tsx` — used by marketing pages only (can optionally move to `app/(marketing)/_components/`)

**Files that move to route-specific `_components/`:**

#### Staff Dashboard Route (`app/dashboard/_components/`)
All files from `components/learning-engine/` move here:
- `PreShiftHome.tsx` — home tab
- `DynamicModuleNav.tsx` — module browser
- `ModuleVerify.tsx` — verification quiz
- `RapidFirePage.tsx` — rapid-fire quiz wrapper
- `RapidFireQuiz.tsx` — quiz engine
- `ArenaPage.tsx` — AI Arena
- `ChallengesPage.tsx` → will be decomposed (see §2)
- `DiagnosticFlow.tsx` — onboarding diagnostic
- `DashboardTrainer.tsx` → will be decomposed (see §2)
- `ProgressOverview.tsx` → will be decomposed (see §2)
- `BadgeStreakSection.tsx`
- `BadgeProgressRing.tsx`
- `BadgesView.tsx`
- `RecommenderCard.tsx`
- `MobileDashboardV3.tsx`
- `MobileLearnHub.tsx`
- **Plus:** The main `DashboardShell.tsx` moves to `app/dashboard/_components/DashboardShell.tsx`

#### Staff Dashboard Knowledge Base Sub-route (`app/dashboard/_components/knowledge-base/`)
- `CocktailLibrary.tsx`
- `KnowledgeBase.tsx`

#### Manager Dashboard Route (`app/management/dashboard/_components/`)
All files from `components/mission-control/` move here:
- `ManagerControlCenter.tsx` → will be decomposed (see §2)
- `StaffRosterPanel.tsx`
- `CoachingDrawer.tsx`
- `ActionDrawer.tsx`
- `ManagementTopbar.tsx`
- `WorkspaceHeader.tsx`
- `manager-ui.tsx` → **stays as shared UI primitives within mission-control**
- `manager-types.ts` → **stays as shared types within mission-control**
- `compliance/ComplianceHub.tsx`
- `compliance/helpers.ts`

#### SOP Toolkit Route (`app/toolkit/_components/`)
- `SopGeneratorPreview.tsx`
- `SopPreviewDocument.tsx`

#### Homepage & Marketing Pages (`app/_components/` or route-specific)
- `HeroSection.tsx` → `app/_components/HeroSection.tsx`
- `Navbar.tsx` → `app/_components/Navbar.tsx` (or `(marketing)/_components/`)
- `Footer.tsx` → `app/_components/Footer.tsx` (or `(marketing)/_components/`)
- `LanguageRuntimeTranslator.tsx` → `app/_components/LanguageRuntimeTranslator.tsx`
- `ErrorLogger.tsx` → `app/_components/ErrorLogger.tsx`
- `VenueMarquee.tsx` → `app/_components/VenueMarquee.tsx`
- `SectionSubNav.tsx` → Can move to `app/(marketing)/_components/` if only used by marketing pages

---

### 1.3 Import Path Changes (Examples)

**Before:**
```typescript
import DashboardShell from "@/components/DashboardShell";
import PreShiftHome from "@/components/learning-engine/PreShiftHome";
import ManagerControlCenter from "@/components/mission-control/ManagerControlCenter";
```

**After:**
```typescript
// In app/dashboard/page.tsx
import DashboardShell from "@/app/dashboard/_components/DashboardShell";
import PreShiftHome from "@/app/dashboard/_components/PreShiftHome";

// In app/management/dashboard/page.tsx
import ManagerControlCenter from "@/app/management/dashboard/_components/ManagerControlCenter";
```

---

## 2. MONOLITH DECOMPOSITION

### 2.1 Bloated File Analysis

Three files exceed 1000 lines and mix concerns:

| File | Lines | Current Concerns | Decomposition Target |
|------|-------|------------------|---------------------|
| `ManagerControlCenter.tsx` | 3743 | Overview + Staff + Teams + Roles + Compliance + Analytics + Reports + Leaderboards + AI Coach + Settings | 8–10 focused files |
| `ChallengesPage.tsx` | 1255 | 5 tap-based game formats in one monolith | 6 files (1 wrapper + 5 game types) |
| `ProgressOverview.tsx` | 1045 | Progress tracking + streak visualization + mastery grids | 4 files (1 main + 3 sub-views) |

---

### 2.2 ManagerControlCenter.tsx Decomposition Plan

**Current responsibility:** Manager dashboard — 15 sections across 5 categories.

**Decomposition strategy:** Split by **feature area** (not by data type). Each section becomes a dedicated, dumb component that receives props and calls API routes.

#### Proposed file structure:
```
app/management/dashboard/_components/
├── ManagerControlCenter.tsx          ← Routes logic, layout shell, section dispatch
├── ManagerNavigation.tsx             ← Left sidebar nav + quick actions
├── ManagerTopbar.tsx                 ← Header (workspace name, plan badge)
├── sections/
│   ├── OverviewSection.tsx           ← Overview tab (KPIs, sparklines)
│   ├── StaffManagementSection.tsx    ← Staff roster + add staff drawer
│   ├── TeamsSection.tsx              ← Teams management
│   ├── RolesSection.tsx              ← Roles & permissions
│   ├── ComplianceSection.tsx         ← RSA, food safety, emergency protocols
│   ├── AnalyticsSection.tsx          ← Charts, trends, cohort analysis
│   ├── ReportsSection.tsx            ← Reports download, email
│   ├── LeaderboardsSection.tsx       ← Leaderboards + rankings
│   ├── AiCoachSection.tsx            ← Ask AI Coach + conversation
│   └── SettingsSection.tsx           ← Venue settings, integrations
├── shared-components/
│   ├── ComplianceRing.tsx            ← Compliance pie chart (extracted)
│   ├── TrendBadge.tsx                ← Trend indicator badge
│   ├── OpsKpiCard.tsx                ← KPI card (move from manager-ui)
│   ├── MasteryMicroGrid.tsx          ← Module mastery grid (move from manager-ui)
│   └── StaffTierBadge.tsx            ← Tier badge
└── manager-types.ts                  ← Type definitions (stays here)
```

#### Extraction rules:
- `OverviewSection.tsx`: Extract `ComplianceRing`, helper mock data generators
- `StaffManagementSection.tsx`: Extract `StaffRosterPanel`, action drawer logic
- `AiCoachSection.tsx`: Extract lazy-loaded `CoachingDrawer`
- `shared-components/`: Move UI primitives from `manager-ui.tsx` that are specific to manager dashboard

#### Data fetching pattern:
```typescript
// Before: All data fetched in ManagerControlCenter, big useState juggling
const [staffList, setStaffList] = useState<StaffMember[]>([]);
const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
// ... 50+ state vars

// After: Each section fetches its own data via API routes
export async function ManagerControlCenter() {
  const snapshot = await fetch("/api/management/snapshot").then(r => r.json());
  return (
    <ManagerNavigation activeSection={activeSection} />
    {activeSection === "overview" && <OverviewSection snapshot={snapshot} />}
    {activeSection === "staff" && <StaffManagementSection />}
    // ... etc
  );
}

// Each section component:
export function AnalyticsSection() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/management/analytics").then(r => r.json()).then(setData);
  }, []);
  return <div>...</div>;
}
```

---

### 2.3 ChallengesPage.tsx Decomposition Plan

**Current structure:** One monolithic component with 5 tap-based game formats hardcoded.

**Issue:** Each game type (Tap Series, Tap Sequence, Tap Speed, Tap Memory, Tap Pattern) is ~250 lines mixed into one file.

#### Proposed file structure:
```
app/dashboard/_components/
├── ChallengesPage.tsx                ← Route dispatcher, nav, game selection
├── challenges/
│   ├── TapSeriesGame.tsx             ← Tap Series format
│   ├── TapSequenceGame.tsx           ← Tap Sequence format
│   ├── TapSpeedGame.tsx              ← Tap Speed format
│   ├── TapMemoryGame.tsx             ← Tap Memory format
│   ├── TapPatternGame.tsx            ← Tap Pattern format
│   ├── ChallengeScoreBoard.tsx       ← Results/scoring display
│   └── challenge-types.ts            ← Shared types for all games
```

#### Pattern for each game:
```typescript
// Before: monolithic, 250 lines per game type mixed in one file
export function ChallengesPage() {
  const [gameType, setGameType] = useState("tap-series");
  const [gameState, setGameState] = useState<GameState>({...});
  
  if (gameType === "tap-series") {
    // 250 lines of Tap Series logic
  } else if (gameType === "tap-sequence") {
    // 250 lines of Tap Sequence logic
  } // ... 5 more
}

// After: Each game is a focused component
export function TapSeriesGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<TapSeriesState>({...});
  // Just Tap Series logic (250 lines → 180 lines with clarity)
  return <div>...</div>;
}

// Main dispatcher:
export function ChallengesPage() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [scores, setScores] = useState<Record<GameType, number>>({});
  
  if (activeGame === "tap-series") return <TapSeriesGame onComplete={...} />;
  if (activeGame === "tap-sequence") return <TapSequenceGame onComplete={...} />;
  // etc.
  
  return <ChallengesHub gameList={...} onSelectGame={...} />;
}
```

---

### 2.4 ProgressOverview.tsx Decomposition Plan

**Current structure:** 1045 lines mixing progress dashboard, streak tracking, mastery visualization.

#### Proposed file structure:
```
app/dashboard/_components/
├── ProgressOverview.tsx              ← Layout & data aggregation
├── progress/
│   ├── ProgressSummary.tsx           ← Key stats (modules completed, avg score, etc.)
│   ├── StreakTracker.tsx             ← Streak display + animations
│   ├── MasteryGrid.tsx               ← 20-module mastery grid
│   └── ProgressChart.tsx             ← Time-series progress chart
```

#### Benefit:
- Each component is <300 lines, testable independently
- Easier to refactor chart library or streak animation later
- Clear data flow: ProgressOverview fetches data, distributes to sub-components

---

## 3. SUPABASE & DOMAIN ALIGNMENT

### 3.1 Current Domain Language (CLAUDE.md)

From project instructions:
```
| Nav ID | Label | Description |
|--------|-------|-------------|
| home | Home | Daily dashboard |
| module | Modules | 40 modules: Bartending, Sales, Management |
| stage4 | Scenario Training | Written scenario practice |
| scenarios | AI Arena | GPT-4o-mini live roleplay evaluation |
| challenges | Challenges | 5 tap-based interactive mini-games |
| cocktails | Cocktail Library | 38-cocktail reference |
| knowledge | 101 Knowledge Base | Quick-reference knowledge base |
| progress | Me / How I'm improving | Personal stats and mastery overview |
```

### 3.2 Database Schema Reality

From `supabase/migrations/`:
```sql
-- scenarios table (created in 20260421_2_create_scenarios.sql)
CREATE TABLE scenarios (
  id UUID PRIMARY KEY,
  module_id INT NOT NULL,
  scenario_index INT NOT NULL,
  scenario_type TEXT NOT NULL 
    CHECK (scenario_type IN ('quiz', 'descriptor_l2', 'descriptor_l3', 'roleplay')),
  prompt TEXT NOT NULL,
  content JSONB NOT NULL,  -- type-dependent structure
  difficulty INT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(module_id, scenario_index)
);
```

### 3.3 Terminology Mapping

**What the domain language says:**
- "Modules" = 40 training modules (Module 1–40)
- "Scenarios" = individual questions within modules (quiz, descriptor, roleplay)
- "AI Scenarios" (Arena) = roleplay scenarios evaluated by GPT-4o-mini
- "Challenges" = 5 tap-based games (NOT scenarios)

**What the database actually stores:**
- `modules` table: 40 modules
- `scenarios` table: All ~800+ questions across all modules, distinguished by `scenario_type`
  - `scenario_type = 'quiz'` → Quiz/rapid-fire question (L1)
  - `scenario_type = 'descriptor_l2'` → Pick N of 5 (L2)
  - `scenario_type = 'descriptor_l3'` → Advanced pick N of 5 (L3)
  - `scenario_type = 'roleplay'` → AI-evaluated roleplay (L4 / Arena)
- `user_challenges` table: Only challenge metadata (scores, completions)
- **No "challenge_scenarios"** — challenges are separate from scenarios

### 3.4 Discrepancy & Safety Strategy

**Issue:** The database is actually correct and well-structured. There's no real alignment problem — the terminology is just distributed:
1. Marketing says "AI Scenarios" but internal code calls it "Arena"
2. Challenges are never called "scenarios" in the database (correct)
3. Internal "Scenarios" map cleanly to database `scenario_type` enum

**Action plan (SAFE):**
1. **No migration rewrites** — Keep historical migrations as-is
2. **Create translation layer** → New file `lib/domain-types.ts`:

```typescript
// lib/domain-types.ts
// Translation layer: domain language ↔ database schema

/**
 * User-facing domain language:
 * - Module = a 40-item learning unit
 * - Scenario = a question/exercise within a module
 * - AI Scenario (Arena) = roleplay scenario evaluated by AI
 * - Challenge = tap-based mini-game
 * - Quiz = rapid-fire true/false questions
 * - Descriptor = pick-N-of-5 questions
 */

export type DomainScenarioType = 
  | 'quiz'            // L1: rapid-fire true/false
  | 'descriptor_l2'   // L2: pick 2 of 5
  | 'descriptor_l3'   // L3: pick 3 of 5
  | 'ai_roleplay';    // L4: AI Arena evaluation (maps to DB 'roleplay')

export type DomainNavigation = 
  | 'home'
  | 'module'          // Modules browser
  | 'rapid-fire'      // Rapid-fire quiz mode
  | 'stage4'          // Scenario training (descriptors)
  | 'scenarios'       // AI Arena (ai_roleplay)
  | 'challenges'      // Tap games
  | 'cocktails'
  | 'knowledge'
  | 'progress'
  | 'badges'
  | 'settings';

// Safe mapping functions (no DB changes, just type translation)
export function mapDbScenarioTypeToUi(dbType: string): DomainScenarioType {
  if (dbType === 'roleplay') return 'ai_roleplay';
  return dbType as DomainScenarioType;
}

export function mapUiScenarioTypeToDb(uiType: DomainScenarioType): string {
  if (uiType === 'ai_roleplay') return 'roleplay';
  return uiType;
}

// Comment in code:
// Database uses 'roleplay' to save space; internally we map to 'ai_roleplay'
// to clarify that this is AI-evaluated. No schema change needed.
```

3. **Update type references** → Use `DomainScenarioType` in `lib/modules.ts`:

```typescript
// Current (lib/modules.ts):
export type ScenarioType = 'quiz' | 'descriptor_l2' | 'descriptor_l3' | 'roleplay';

// Updated (with comment explaining mapping):
export type ScenarioType = 'quiz' | 'descriptor_l2' | 'descriptor_l3' | 'roleplay';
// Note: The database calls AI-evaluated scenarios 'roleplay'.
// Internal code may reference 'ai_roleplay' for clarity, but always
// translate back to 'roleplay' for DB queries.
```

4. **Document in comments** — Add a mapping table in `CLAUDE.md` § Learning Engine Structure to clarify:

```markdown
### Terminology Clarification

| Domain Term | Database Term | Usage |
|-------------|---------------|-------|
| Module | modules.id | 40 training modules (1–40) |
| Scenario | scenarios.* | Any question in scenarios table |
| Quiz | scenarios where scenario_type = 'quiz' | L1 rapid-fire |
| Descriptor | scenarios where scenario_type IN ('descriptor_l2', 'descriptor_l3') | L2/L3 pick-N-of-5 |
| AI Scenario (Arena) | scenarios where scenario_type = 'roleplay' | L4 AI-evaluated |
| Challenge | user_challenges table | Tap-based mini-games (separate from scenarios) |

**No database renames needed.** The schema is logically correct.
```

### 3.5 Benefits of This Approach

✓ **Zero breaking changes** — No migration rewrites, no production risk  
✓ **Clear documentation** — Translation layer makes terminology explicit  
✓ **Type safety** — `DomainScenarioType` prevents misuse  
✓ **Future-proof** — If database is ever refactored, translation layer is the only file to change  

---

## 4. THE EXECUTION LOOP

### 4.1 Step-by-Step Procedure

**Before moving ANY file:**
1. Run `npx tsc --noEmit` → baseline TypeScript check (should pass)
2. Create a checklist of 40+ file moves (see detailed list below)

**For each file move:**

| # | Action | Command | Expected Result |
|---|--------|---------|-----------------|
| 1 | Move single file | `mv components/learning-engine/PreShiftHome.tsx app/dashboard/_components/` | File relocated |
| 2 | Update imports in moved file | Edit `PreShiftHome.tsx` — change `@/components/...` → `@/app/dashboard/_components/...` | Self-references updated |
| 3 | Find all importers | `grep -r "from.*components/learning-engine/PreShiftHome" . --include="*.tsx"` | List all affected files |
| 4 | Update all importers | Edit each file that imported from old location | All imports point to new location |
| 5 | Type check | `npx tsc --noEmit` | **STOP if errors** — diagnose before proceeding |
| 6 | Manual smoke test | Open affected route in browser if applicable | No obvious breakage |
| 7 | Commit | `git add . && git commit -m "refactor: colocate PreShiftHome to app/dashboard/_components"` | Progress checkpoint |
| 8 | Move next file | Repeat 1–7 for next file | Incremental progress |

### 4.2 Detailed File Migration Order

**Rationale:** Migrate in **dependency order** (files with fewest dependencies first, then their dependents).

#### Phase 1: Leaf components (no other component imports them)
```
1. app/dashboard/_components/BadgeProgressRing.tsx
2. app/dashboard/_components/RecommenderCard.tsx
3. app/dashboard/_components/BadgeStreakSection.tsx
4. app/dashboard/_components/knowledge-base/CocktailLibrary.tsx
5. app/dashboard/_components/knowledge-base/KnowledgeBase.tsx
6. app/toolkit/_components/SopPreviewDocument.tsx
```

#### Phase 2: Leaf + intermediate (depended on by other components)
```
7. app/dashboard/_components/RapidFireQuiz.tsx
8. app/dashboard/_components/ModuleVerify.tsx
9. app/dashboard/_components/DiagnosticFlow.tsx
10. app/dashboard/_components/ArenaPage.tsx
11. app/dashboard/_components/BadgesView.tsx
12. app/dashboard/_components/MobileLearnHub.tsx
13. app/management/dashboard/_components/WorkspaceHeader.tsx
14. app/management/dashboard/_components/ActionDrawer.tsx
15. app/management/dashboard/_components/ManagementTopbar.tsx
16. app/management/dashboard/_components/CoachingDrawer.tsx
17. app/toolkit/_components/SopGeneratorPreview.tsx
```

#### Phase 3: Primary route components (heavy dependencies)
```
18. app/dashboard/_components/RapidFirePage.tsx
19. app/dashboard/_components/DynamicModuleNav.tsx
20. app/dashboard/_components/PreShiftHome.tsx
21. app/dashboard/_components/MobileDashboardV3.tsx
22. app/management/dashboard/_components/StaffRosterPanel.tsx
```

#### Phase 4: Main shell + decomposition (largest, most critical)
```
23. app/dashboard/_components/DashboardShell.tsx
24. Decompose ProgressOverview → Phase 4a–4c
25. Decompose ChallengesPage → Phase 4d–4i
26. Decompose ManagerControlCenter → Phase 4j–4s
```

#### Phase 4a–4c: ProgressOverview decomposition
```
24a. app/dashboard/_components/progress/ProgressChart.tsx (new)
24b. app/dashboard/_components/progress/MasteryGrid.tsx (new)
24c. app/dashboard/_components/progress/StreakTracker.tsx (new)
24d. app/dashboard/_components/progress/ProgressSummary.tsx (new)
24e. app/dashboard/_components/ProgressOverview.tsx (refactored to orchestrator)
```

#### Phase 4d–4i: ChallengesPage decomposition
```
25a. app/dashboard/_components/challenges/challenge-types.ts (new)
25b. app/dashboard/_components/challenges/ChallengeScoreBoard.tsx (new)
25c. app/dashboard/_components/challenges/TapSeriesGame.tsx (new)
25d. app/dashboard/_components/challenges/TapSequenceGame.tsx (new)
25e. app/dashboard/_components/challenges/TapSpeedGame.tsx (new)
25f. app/dashboard/_components/challenges/TapMemoryGame.tsx (new)
25g. app/dashboard/_components/challenges/TapPatternGame.tsx (new)
25h. app/dashboard/_components/challenges/ChallengesNav.tsx (new)
25i. app/dashboard/_components/ChallengesPage.tsx (refactored to dispatcher)
```

#### Phase 4j–4s: ManagerControlCenter decomposition
```
26a. app/management/dashboard/_components/ManagerNavigation.tsx (new)
26b. app/management/dashboard/_components/ManagerTopbar.tsx (new, distinct from ManagementTopbar)
26c. app/management/dashboard/_components/sections/OverviewSection.tsx (new)
26d. app/management/dashboard/_components/sections/StaffManagementSection.tsx (new)
26e. app/management/dashboard/_components/sections/TeamsSection.tsx (new)
26f. app/management/dashboard/_components/sections/RolesSection.tsx (new)
26g. app/management/dashboard/_components/sections/ComplianceSection.tsx (new)
26h. app/management/dashboard/_components/sections/AnalyticsSection.tsx (new)
26i. app/management/dashboard/_components/sections/ReportsSection.tsx (new)
26j. app/management/dashboard/_components/sections/LeaderboardsSection.tsx (new)
26k. app/management/dashboard/_components/sections/AiCoachSection.tsx (new)
26l. app/management/dashboard/_components/sections/SettingsSection.tsx (new)
26m. app/management/dashboard/_components/shared-components/ComplianceRing.tsx (extracted)
26n. app/management/dashboard/_components/shared-components/TrendBadge.tsx (extracted)
26o. app/management/dashboard/_components/shared-components/OpsKpiCard.tsx (moved from manager-ui)
26p. app/management/dashboard/_components/shared-components/MasteryMicroGrid.tsx (moved from manager-ui)
26q. app/management/dashboard/_components/shared-components/StaffTierBadge.tsx (extracted)
26r. app/management/dashboard/_components/ManagerControlCenter.tsx (refactored to router)
```

#### Phase 5: Homepage & marketing (lower priority)
```
27. app/_components/HeroSection.tsx
28. app/_components/Navbar.tsx
29. app/_components/Footer.tsx
30. app/_components/LanguageRuntimeTranslator.tsx
31. app/_components/ErrorLogger.tsx
32. app/_components/VenueMarquee.tsx
```

### 4.3 TypeScript Verification Gates

After each file move, **MUST pass:**
```bash
npx tsc --noEmit
```

If errors:
1. **Do not proceed** to the next file
2. Diagnose the error (usually a stale import path)
3. Fix all affected files
4. Re-run `npx tsc --noEmit`
5. Only then commit and move to the next file

### 4.4 Commit Message Template

```
refactor: colocate {component} to app/{route}/_components/

- Move {Component}.tsx from components/{category}/ to app/{route}/_components/
- Update all import paths (XX files)
- npx tsc --noEmit passes
- No functional changes
```

Example:
```
refactor: colocate PreShiftHome to app/dashboard/_components/

- Move PreShiftHome.tsx from components/learning-engine/ to app/dashboard/_components/
- Update 3 import paths (DashboardShell.tsx, app/dashboard/page.tsx, tests)
- npx tsc --noEmit passes
- No functional changes
```

### 4.5 Decomposition Commit Template

```
refactor: decompose {Monolith} into {N} focused components

- Extract {Section1}, {Section2}, … from {Monolith}.tsx (was {LineCount} lines)
- Create {Route}/_components/{SubfoldernName}/ with {N} new files
- {Monolith}.tsx now acts as router/dispatcher (reduced to ~{NewLineCount} lines)
- npx tsc --noEmit passes
- No behavioral changes, tests still pass
```

Example:
```
refactor: decompose ManagerControlCenter into 12 focused sections

- Extract OverviewSection, StaffManagementSection, TeamsSection, etc.
- Create app/management/dashboard/_components/sections/ with 10 new files
- ManagerControlCenter.tsx now acts as router (~400 lines, down from 3743)
- npx tsc --noEmit passes
- All tests still pass
```

### 4.6 Safety Checklist Before Each Commit

- [ ] `npx tsc --noEmit` passes (zero errors)
- [ ] No import paths use old `components/` location
- [ ] File moved (not copied) to new location
- [ ] All importers updated to new path
- [ ] No `@` aliases broken (all paths start with `@/app/`)
- [ ] Commit message follows template
- [ ] Visual smoke test in browser (if applicable)

---

## 5. DOMAIN TERMINOLOGY ACTION PLAN

### 5.1 Create Translation Layer

**File:** `lib/domain-types.ts` (NEW)

```typescript
/**
 * Domain Terminology Translation Layer
 * 
 * Bridges user-facing domain language with database schema.
 * The database schema is correct and well-designed; this layer
 * ensures internal code and external documentation use consistent terminology.
 * 
 * NO DATABASE CHANGES REQUIRED.
 */

/**
 * Scenario type: What kind of exercise is this?
 * Maps 1:1 to database scenarios.scenario_type enum.
 */
export type DbScenarioType = 'quiz' | 'descriptor_l2' | 'descriptor_l3' | 'roleplay';

/**
 * User-facing domain terminology for scenario types.
 * This is what marketing, docs, and comments refer to.
 */
export type DomainScenarioType =
  | 'quiz'            // L1: rapid-fire true/false
  | 'descriptor_l2'   // L2: pick 2 of 5
  | 'descriptor_l3'   // L3: pick 3 of 5
  | 'ai_roleplay';    // L4: AI-evaluated roleplay scenario

/**
 * Convert database scenario_type to domain terminology.
 * Safe to call on any DB value; maps unknown types back to DB name.
 */
export function mapDbToUi(dbType: DbScenarioType): DomainScenarioType {
  if (dbType === 'roleplay') return 'ai_roleplay';
  return dbType as DomainScenarioType;
}

/**
 * Convert domain terminology to database column value.
 * Always use this when storing/querying scenarios.
 */
export function mapUiToDb(uiType: DomainScenarioType): DbScenarioType {
  if (uiType === 'ai_roleplay') return 'roleplay';
  return uiType as DbScenarioType;
}

/**
 * Navigation sections in the staff dashboard.
 * Used by DashboardShell to dispatch to the right view.
 */
export type DomainNavigation =
  | 'home'            // PreShiftHome: daily dashboard
  | 'module'          // DynamicModuleNav: browse 40 modules
  | 'rapid-fire'      // RapidFirePage: quiz mode (quiz scenarios)
  | 'stage4'          // DiagnosticFlow: scenario training (descriptor scenarios)
  | 'scenarios'       // ArenaPage: AI Arena (ai_roleplay scenarios)
  | 'challenges'      // ChallengesPage: tap-based games (NOT scenarios)
  | 'cocktails'       // CocktailLibrary: reference
  | 'knowledge'       // KnowledgeBase: reference
  | 'progress'        // ProgressOverview: stats + mastery view
  | 'badges'          // BadgesView: achievement gallery
  | 'settings';       // StaffSettingsPanel: profile + preferences

/**
 * Component grouping comment for code clarity:
 * 
 * Staff Learning Dashboard Structure:
 * - home: daily recommendations + progress summary
 * - module: module browser; spawns rapid-fire on selection
 * - rapid-fire: quiz scenarios (scenario_type = 'quiz')
 * - stage4: descriptor scenarios (scenario_type IN ('descriptor_l2', 'descriptor_l3'))
 * - scenarios (Arena): ai_roleplay scenarios (scenario_type = 'roleplay')
 * - challenges: tap-based games (user_challenges table, NOT scenarios)
 * - cocktails, knowledge: static reference content
 * - progress: aggregated stats from scenario_mastery table
 * - badges: achievements from badges table
 * - settings: profile, notifications, venue join
 */
```

### 5.2 Update CLAUDE.md Documentation

Add this section to the Learning Engine Structure:

```markdown
## Terminology Reference

### Database vs. Domain Language

The database schema is logically correct. Internal terminology maps cleanly:

| Domain Concept | Database Table | Database Column | Notes |
|----------------|---|---|---|
| Module | modules | id (1–40) | Training module identifier |
| Quiz (L1) | scenarios | scenario_type = 'quiz' | Rapid-fire true/false |
| Descriptor (L2) | scenarios | scenario_type = 'descriptor_l2' | Pick 2 of 5 |
| Descriptor (L3) | scenarios | scenario_type = 'descriptor_l3' | Pick 3 of 5 |
| AI Scenario (Arena) | scenarios | scenario_type = 'roleplay' | AI-evaluated roleplay |
| Challenge | user_challenges | * | Tap-based game; separate from scenarios |
| Scenario (generic) | scenarios | * | Any question in the scenarios table |

**Code reference:** `lib/domain-types.ts` contains mapping functions and type definitions.

```

### 5.3 Add Inline Code Comments

When scenario_type is used in code, add a clarifying comment:

```typescript
// Current (unclear):
scenario.scenario_type === 'roleplay'

// Updated (clear):
// 'roleplay' = AI-evaluated scenario (Arena / AI Scenarios in marketing language)
scenario.scenario_type === 'roleplay'

// Or using domain types:
import { mapDbToUi } from '@/lib/domain-types';
const domainType = mapDbToUi(scenario.scenario_type); // 'ai_roleplay'
```

---

## 6. SUMMARY & DELIVERABLES

### What This Blueprint Covers

✓ **Colocation Mapping** — Detailed plan to move 40+ components to route-specific `_components/` folders  
✓ **Monolith Decomposition** — Break down 3 bloated files (3743 + 1255 + 1045 lines) into 25+ focused components  
✓ **Domain Alignment** — Safe translation layer for terminology with zero database risk  
✓ **Execution Loop** — Step-by-step procedure with TypeScript validation gates and commit templates  

### Files That Will Exist After Execution

```
app/
  dashboard/
    _components/
      DashboardShell.tsx
      PreShiftHome.tsx
      DynamicModuleNav.tsx
      ModuleVerify.tsx
      RapidFirePage.tsx
      RapidFireQuiz.tsx
      ArenaPage.tsx
      ChallengesPage.tsx
      DiagnosticFlow.tsx
      DashboardTrainer.tsx
      ProgressOverview.tsx
      BadgeStreakSection.tsx
      BadgeProgressRing.tsx
      BadgesView.tsx
      RecommenderCard.tsx
      MobileDashboardV3.tsx
      MobileLearnHub.tsx
      progress/
        ProgressSummary.tsx (new)
        StreakTracker.tsx (new)
        MasteryGrid.tsx (new)
        ProgressChart.tsx (new)
      challenges/
        ChallengesNav.tsx (new)
        TapSeriesGame.tsx (new)
        TapSequenceGame.tsx (new)
        TapSpeedGame.tsx (new)
        TapMemoryGame.tsx (new)
        TapPatternGame.tsx (new)
        ChallengeScoreBoard.tsx (new)
        challenge-types.ts (new)
      knowledge-base/
        CocktailLibrary.tsx
        KnowledgeBase.tsx
  management/
    dashboard/
      _components/
        ManagerControlCenter.tsx
        ManagerNavigation.tsx (new)
        ManagerTopbar.tsx (new)
        StaffRosterPanel.tsx
        CoachingDrawer.tsx
        ActionDrawer.tsx
        ManagementTopbar.tsx
        WorkspaceHeader.tsx
        manager-types.ts
        sections/
          OverviewSection.tsx (new)
          StaffManagementSection.tsx (new)
          TeamsSection.tsx (new)
          RolesSection.tsx (new)
          ComplianceSection.tsx (new)
          AnalyticsSection.tsx (new)
          ReportsSection.tsx (new)
          LeaderboardsSection.tsx (new)
          AiCoachSection.tsx (new)
          SettingsSection.tsx (new)
        shared-components/
          ComplianceRing.tsx (extracted)
          TrendBadge.tsx (extracted)
          OpsKpiCard.tsx (moved from manager-ui)
          MasteryMicroGrid.tsx (moved from manager-ui)
          StaffTierBadge.tsx (extracted)
        compliance/
          ComplianceHub.tsx
          helpers.ts
  toolkit/
    _components/
      SopGeneratorPreview.tsx
      SopPreviewDocument.tsx
  _components/  (marketing & global)
    HeroSection.tsx
    Navbar.tsx
    Footer.tsx
    LanguageRuntimeTranslator.tsx
    ErrorLogger.tsx
    VenueMarquee.tsx

components/
  ui/  (genuinely shared across routes)
    SignOutButton.tsx
    SessionRefresher.tsx
    LanguageSwitcher.tsx
    Skeletons.tsx
    SectionHeading.tsx    (optional: move to app/_components/)
    CompareMatrix.tsx     (optional: move to marketing routes)
    DashboardMockup.tsx   (optional: move to marketing routes)
    ROICalculator.tsx     (optional: move to marketing routes)

lib/
  domain-types.ts (NEW - translation layer)
  ... (no other changes)
```

### Success Metrics

After execution:
- ✓ **Zero broken imports** — `npx tsc --noEmit` passes
- ✓ **40+ files moved** without changing behavior
- ✓ **3 monoliths reduced** from 5043 → ~2500 combined lines (50% reduction)
- ✓ **10 new focused components** created from decomposition
- ✓ **Domain terminology** clarified with translation layer
- ✓ **All routes still work** — no functional changes, only organization

---

**This blueprint is complete and ready for implementation.**  
**Next step:** Proceed with Phase 1 (leaf component migration) per §4.2.
