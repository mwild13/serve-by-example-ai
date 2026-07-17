# Conversion UI Skill

You have been invoked via `/conversion-ui`. Load these instructions fully before touching any code or file.

---

## What This Skill Is For

Any time a section of the product needs to be improved — not just conversion moments, but any UI slot that is thin, generic, or not living up to the quality of the surrounding product.

The trigger is: "this section could be doing more." The output is: a specific list of improvements, then implementation using the project's visual language.

---

## The Protocol: Look → Research → List → Implement

### 1. LOOK — Read before touching anything

- Read the existing component or slot fully, even if it is just 3 lines
- Identify what is currently rendered and what data is already in scope in the parent
- Identify the design tokens in use — never invent new ones, never hardcode hex values
- Note the visual hierarchy (or absence of it) — size, weight, spacing, color

Never propose improvements to something you have not read.

### 2. RESEARCH — Understand the gap

- What should this section make a user feel or do?
- What data is already available in the parent/scope that is not being shown?
- What are neighboring sections doing visually — are there consistency cues to follow?
- What is the gap between what exists and what is possible given the data and design system?

### 3. LIST — Present before building

Write a specific, prioritised list of additions with a reason for each one. Get alignment before implementing. This is where the session value is — a clear list prevents building the wrong thing.

For each item, state:
- What it is
- Why it improves the section
- What data it uses (and confirm that data exists)

### 4. IMPLEMENT — Build using the project's visual system

- Use only existing design tokens — never invent hex values
- Source data already in scope — do not add new fetches if the data is available
- Apply a single state toggle (`isUrgent`, `isEmpty`, `isActive`) wired through all color/background decisions
- Extract to a standalone component if the output exceeds ~60 lines or has 3+ derived values
- TypeScript clean before done

---

## Data Sourcing — Non-Negotiable Rules

**Verify the chain all the way to the DB before trusting a value.**

The most common failure mode: a field exists, has a value, looks like the right thing — but is actually demo/seed data that falls back when real data is absent, or measures something different from what the label says.

Before using any value as a "live stat":
1. Trace it back to its source query — what table, what column?
2. Confirm it is scoped to the correct entity (the user's org, venue, or account — not global data)
3. Confirm it is not a fallback — check if there is a `if (!data.length) return FALLBACK` branch upstream
4. Confirm the field name matches what it actually measures — an `attempts` field that counts staff members is not "attempts"

**Real numbers only.** If a stat cannot be confirmed as real and scoped, do not show it. An empty stat ("0 scenarios run") is always better than a plausible-looking wrong number. A wrong number destroys trust the moment the user notices.

---

## Visual and UX Rules

### Hierarchy through contrast
- Large numbers for impact (`1.5–1.8rem`, bold, serif heading font if available)
- Short uppercase label beneath (`0.7rem`, muted, tracking)
- Supporting subline below that (even more muted)
- Never bury a key number in prose

### Color carries meaning, not decoration
- Only use color when it signals something: urgency, success, locked state, active
- A single state boolean (`isUrgent`, `isActive`, `isLocked`) should drive all color decisions — not scattered per-element conditionals
- Neutral/muted is the default; color is earned

### Grid layouts for scannable data
- 2–4 column stat rows with dividers between cells
- Users scan stat grids in under a second — they do not read prose for numbers

### Progress and state indicators
- Progress bars when there is a timeline or completion state (trial days, module completion)
- Pill/badge for current status (labeled, colored by state)
- These establish "where the user is" before any ask is made

### Icon language
- Inline SVG only — no emoji, no icon libraries that aren't already in the project
- Consistent size within a component (8–12px for inline indicators)
- Use shape + color together, not color alone (accessible)

### Surface and card treatment
- Use the project's existing surface/background tokens to differentiate sections within a component
- `background: var(--surface)` for cards, `var(--bg-alt)` for inset sections, `var(--gold-light)` or equivalent for urgent tint
- Borders (`var(--line)`) to separate sections — not shadow stacking

### Spacing consistency
- Use the project's radius tokens for all rounded corners
- Consistent padding within a section — pick one value and repeat it (e.g. `24px` outer, `12px` inner)
- Gap between elements should feel intentional — tighter within a group, looser between groups

---

## Conversion-Specific Rules (when the section is a conversion moment)

- **Consequences over features** — state what the user loses, not what they gain. Loss aversion is the mechanic.
- **One primary CTA** — if two buttons are competing, one of them is wrong
- **Urgency only when earned** — only apply urgent color/styling when the state genuinely warrants it (≤ 3 days, expired, limit hit). Never style as urgent by default.
- **CTA footer is load-bearing** — keep it clean: one headline (the outcome they keep), one subline (remove the main objection), one button
- **Copywriting: outcomes not actions** — "Keep your team's training running" beats "Upgrade now." Verb + object for button text: "Add billing details" not "Continue."

---

## Component Architecture

**Extract to a standalone component when:**
- Output exceeds ~60 lines
- 3+ derived values computed from props
- Contains its own internal state
- The parent component is already large (>500 lines)

**Name by what it does, not where it lives:**
- `TrialBillingSection.tsx` — not `BillingTabContent.tsx`
- `UpgradePrompt.tsx` — not `RightPanelSection.tsx`

**Props shape:** pass raw data, compute display logic inside the component.

---

## Validation Checklist (Before Reporting Complete)

- [ ] Read the existing slot before writing anything
- [ ] All stats traced to their DB source and confirmed scoped + real (no fallback data)
- [ ] Single state toggle wired through all color/background decisions
- [ ] No hardcoded hex values — only design tokens
- [ ] No invented data — if a number cannot be confirmed, it is not shown
- [ ] One primary CTA if this is a conversion moment
- [ ] Component extracted if >60 lines or 3+ derived values
- [ ] TypeScript passes clean
