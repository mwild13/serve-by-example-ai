# Staff Desktop Redesign: Research and Plan

Written 2026-10-21. Covers the desktop staff learning area at `/dashboard`. The mobile app (`/mobile`) and the Manager Console (`/management`) are out of scope.

**Superseded on 2026-10-21.** After review the owner chose a cream default with a bottle green sidebar and green accents (no gold), Manrope throughout, and the dark green look as dark mode. The standard that replaced section 4 and 5 of this plan is `docs/STAFF_APP.md` section 8. The research in section 3 still stands.

**Earlier status, 2026-10-21.** The owner chose bottle green, brass and cream, Badges folded into My progress, desktop shift reminders, and one first release. Phases 1 to 7 are built on branch `preview/staff-desktop` and not yet on main. The standard now lives in `docs/STAFF_APP.md` section 8. Still owed: the owner's look on preview with a real account, the marketing screenshots in `public/shots/`, and desktop screenshot baselines in the e2e suite (section 8, Phase 7). Two things from the plan were not built: the drill's "last drill's score by module" (no API returns past drills) and the activity list by day on My progress.

This is the to-do item "Redesign the desktop staff dashboard" (owner, 2026-10-20). The first step that item asks for, a short standard for the staff product, is section 5. The page plans are section 7.

---

## 1. The short answer

**Make the desktop staff area feel like the back bar at night: deep bottle green, a brass rail and a cream docket.** Green is the room, brass (gold) marks progress, and anything people read sits on a cream sheet, like a menu or a docket on the pass.

That gives each product its own look:

| Product | Look |
|---|---|
| Marketing site and Manager Console | Parchment, ink and hairlines |
| Staff mobile app | Near-black navy and amber |
| **Staff desktop (this plan)** | **Bottle green, brass and cream** |

Three changes matter more than the colour:

1. **One next step, not a menu of eleven.** Home opens on one action for tonight, picked by the app: the pre-shift drill, the next module, a review that's due or a Live Guest. Today the main action ("Start Module 1") sits at the bottom of the page, under six other blocks.
2. **The three levels from the Rich update become the structure.** Learn, Drill and Live Guest is how the product is sold and how the research says people learn. The sidebar becomes Today, Learn, Practise, Look it up and Me, not eleven equal links.
3. **The first day is the demo.** A manager trialling the product signs up and sees a brand-new account full of zeros. Today that account shows "0/40", "0%", "0 of 5" and three empty achievement boxes. Every screen gets a designed first-day state, because that's the screen that sells.

---

## 2. What's wrong today

Seen on production at 1440×900 with the QA account (screens taken 2026-10-21), plus the code.

### Across every screen

- **The sidebar is a separate colour block.** A dark green column beside a parchment page, so the product reads as two halves. (An earlier draft said the sidebar stops short on long pages; that was the full-page screenshot, not the product. The sidebar is sticky and follows the page.)
- **Eleven equal links.** Home, Modules, Mixed Drill, Saturday Rush, Live Guest, Challenges, Cocktail Library, Knowledge Base, How I'm improving, Badges and Settings all carry the same weight. Five of them are ways to practise, and nothing says which one to use when. The Rich update research found the same problem on mobile (`docs/Rich Update/LEARNING_UPGRADE_RESEARCH.md`, section 2).
- **Four page openings.** Modules opens on a green gradient banner, Progress on a different green banner with a shadow, Mixed Drill and Live Guest on a plain heading, and Home on a skill bar. No two screens look like the same product.
- **Cards for everything.** White rounded shadowed cards hold modules, guests, stats, focus points and achievements. `docs/Pages-Redesign.md` section 2.7 retired exactly this on the marketing site.
- **Inline styles.** `app/dashboard/` has 345 `style={{}}` blocks, so every screen sets its own sizes and spacing. That's why the screens drift.
- **Colours that aren't the brand.** `:root` still carries blue, purple, indigo and rose families (`--status-info`, `--status-achievement`, `--color-indigo`). Few are used in the staff product, but the four mastery bands (Needs Work red, Building orange, Solid blue, Strong green) are, and blue and orange aren't Serve By Example colours.

### Home (`PreShiftHome.tsx`)

- Seven blocks compete: skill bar, welcome, Focus for today, Knowledge Base carousel, two cocktail cards, a Training Progress timeline, a stats strip and achievements.
- **The pre-shift drill and the shift streak aren't on desktop.** They were the habit at the centre of the Rich update (Phase 12) and only mobile Home shows them.
- The cocktail cards overlap their own text ("Chartreuse +2 more" prints over the ingredient).
- The Training Progress timeline says "Completed 0 of 4 Tracks" and shows three.
- "Pre-shift brief" is a pill eyebrow, which the marketing standard retired.

### Modules (`DynamicModuleNav.tsx`)

- 40 near-identical cards in a three-column grid, 3,846px tall. A new starter can't see the shape of the course: what's first, what's foundation, what's advanced, how far through they are.
- Three cards say "Recommended" and every card says "Beginner" until the bottom third.

### Mixed Drill

- A small card floats in the middle of an empty page. It doesn't say how many modules feed it, when the person last drilled or what they got.

### Live Guest

- Off a venue plan, the upgrade box comes first and the 60 guests below are greyed out. The page reads as "you can't have this" rather than "this is the best thing here, try one free".
- Every guest is the same card. Nothing is shown of the guest themselves, only the setting.

### Progress (`ProgressOverview.tsx`)

- The name appears twice: "Your Training Progress" in the banner, then "QA Playwright's Progress Hub" below it.
- Six stat boxes, four of them zero on a new account, plus a ten-step skill bar that repeats the one on Home.
- Badges is a separate page in the menu.

### Marketing screenshots

`public/shots/` is the product as the marketing site sells it. "Modules View" still shows Scenario Training and AI Scenarios in the sidebar, both retired in the Rich update. When the redesign ships, these screenshots have to be retaken, and the new staff screens become the strongest image on the site (section 6).

---

## 3. What the research says

### What buyers weigh

- **The learner experience is what buyers rank first.** eLearning Industry's 2026 buyer benchmark puts user experience first, named by about 70% of buyers, ahead of price (63%) and integrations (59%). AI features came in at about 30%. It's a vendor-linked publication, so read the numbers as a direction, not a fact. The direction fits what we know: a manager judges a training product by whether their staff will open it.
- **Buyers decide on a trial, not on claims.** Buyer guides tell managers to shortlist on a pilot. For us that means the first-day account is the sales pitch.

### What the best learning products do

- **Duolingo replaced a choose-your-own tree with one path (2022).** Its stated reasons: learners "weren't sure they were using Duolingo the correct way", and they rarely went back to practise. The path decides the order, mixes review into it ("practice is also forward progress"), and a floating arrow takes you back to where you are. Users complained loudly at launch, and Duolingo published no engagement figures for the change. The lesson for us is to **recommend one next step, but keep everything open.** Our staff are adults with varied experience, and the skill check already places them.
- **Axonify, the frontline training leader, opens on one priority item a day**, a few minutes long, chosen by the system from the person's confidence and accuracy. That's the model for Home: the app picks tonight's step.
- **Brilliant puts a course map and "what's next" on every course page**, and redesigned in version 5 for "less scrolling" and clearer progress. That's the model for Modules: a map, not a grid.
- **Linear's 2024 redesign aimed to cut visual noise without losing density.** It did that by giving elements unequal weight, using fewer and smaller icons, dropping coloured icon backgrounds, and softening dividers ("structure should be felt, not seen"). It's the same thinking as our marketing standard, applied to a product.

### Competitors

From the Rich update research (2026-10-19): Typsy sells a library of 2,000+ videos, and SC Training (EdApp) and MAPAL Flow sell course builders. None has a guest who talks back, the venue's own menu, or a streak that counts shifts. Typsy publishes no learner-dashboard screenshots and has almost no independent reviews of its learner screens. **There is no strong learner screen to copy in Australian hospitality training, which is the opening.** A staff screen that looks like it belongs in a good venue, not in an HR system, is something no local competitor shows.

### Colour

Checked against WCAG with the existing tokens (no new colours needed):

| Text on deep green (`--green-deep` / `--ip-green`) | Contrast | Use |
|---|---|---|
| `--nav-cream` | 13.6 to 13.9:1 | Body and headings |
| `--gold-light` | 12.6:1 | Soft figures |
| `--gold-warm` (brass) | 5.7:1 | Progress, small text allowed (AA) |
| `--gold` | 4.1:1 | Large text and lines only |

`--gold-warm` on the lighter `--green` is only 3.6:1, so brass text sits on the deep green, never on the mid greens. On the cream sheet, `--text` (14.2:1) and `--gold-deep` (6.0:1) do the work, as they do on the marketing site.

---

## 4. The look: "The back bar"

### Why dark green and not something else

| Option | For | Against |
|---|---|---|
| **A. Bottle green, brass and cream (recommended)** | It's the brand green at full strength. In marketing it stands apart from the parchment console screenshot, so "two views, one platform" reads at a glance. It feels like a venue, not an office. | Long reading on dark tires the eyes. Solved by putting reading on cream sheets (below). |
| B. Parchment with green accents | Easy, and matches the console | It's the console's look, so staff and manager screens would blur together in marketing. The owner asked for something different. |
| C. Keep today's green sidebar and parchment main area | Least work | This is what "looks flat" today. |
| D. A new colour (navy, terracotta) | Fresh | Navy is the mobile app. Anything else is off-brand and needs new tokens. |

### How it's built

- **The room:** the whole page, sidebar included, is `--green-deep`. The sidebar is one step darker (`--ip-green`), separated by a hairline, not a different colour block. 
- **The brass rail:** `--gold-warm` means progress and nothing else: the progress line on the path, the streak, a mastered tick, the active nav marker. If it's brass, it moved forward.
- **The docket:** reading surfaces (Learn cards, quiz questions, Knowledge Base articles, the cocktail recipe, the Live Guest conversation) sit on a cream sheet (`--surface`) with `--text`. They're the one object on the screen with a radius and a shadow, because a docket is an object (`docs/Pages-Redesign.md` section 2.1).
- **One alarm colour:** red means a safety breach (Live Guest must-do, Saturday Rush breach) and nothing else, as in the console.
- **Mastery bands lose blue and orange.** Four steps in one family: an outline, a quarter-filled brass ring, a half ring, and a full brass ring for Strong. Words carry the meaning ("Building", "Solid"), not hue.
- **Photos earn their place.** The 38 cocktail photos and the guest pictures (Phase 9, when they come) are the only imagery. They sit full-bleed in their space, not in a padded card.

### Type

- **Fraunces** for display: the page title, the one big next step, figures that are the point (streak, score). Fraunces has more character than Newsreader, which is why it suits the staff side.
- **Manrope** for everything else, including small capitals labels in place of pills.
- **Figures** in Manrope with tabular numerals, except the single hero figure on a screen, which may be Fraunces.

---

## 5. The standard (draft for `docs/STAFF_APP.md`, new section)

To be added to `docs/STAFF_APP.md` once Phase 1 proves it on a real screen, in the same shape as `docs/MANAGER_CONSOLE.md` section 6.

**Look**
- Room `--green-deep`, sidebar `--ip-green`, reading on `--surface` sheets. Brass is progress only. Red is a safety breach only. No tinted pills, chips or banners.
- **Tokens:** a `--sd-*` block in the `:root` of `app/globals.css`, every one an alias of a brand token (as `--mc-*` is for the console). No new hex values.
- **Classes:** prefix `sd-` (staff desktop), in `app/styles/staff.css` under one "STAFF DESKTOP" heading. New screens use `sd-` parts and no inline styles except for values computed at runtime (a progress width).

**Type and density**
- Fonts through `--font-heading` and `--font-body` inside `.sbe-app-type`, as now.
- **Readability floor:** body 16px, nothing below 14px, controls at least 44px tall. Staff are on the floor, often older, often tired; this is looser than the console's 13px and 40px on purpose.
- **Line length:** reading text capped at 68 characters, so the cream sheet is narrower than the room.

**Structure**
- **Shell:** grouped sidebar (section 7.0), collapsible to a 64px rail, an account menu on the avatar. Same mechanics as the console so the code is shared where it can be.
- **Every screen:** one `PageHead` (small caps label, Fraunces title, one plain sentence), then the content. **One primary button per screen.**
- **Lists, not card grids.** Several things of the same kind (modules, guests, badges) are rows divided by hairlines, with the one recommended item given room above them.
- **Every screen has a designed first-day state** that shows what's coming, not a row of zeros.

**Motion**
- CSS only, small, caused by the person: a module row opening, the progress line drawing once on arrival, a tick landing. All of it off under `prefers-reduced-motion`.

**Do not ship**
- A grid of bordered, rounded, shadowed cards as the answer to "here are several things".
- Gradient banners as page headers.
- Pill eyebrows, icon tiles, emojis or unicode glyphs as icons.
- Stat boxes that show zero to a new person.
- Blue, orange or purple anywhere in the staff product.

---

## 6. Why this sells to managers

The staff screens do three jobs for a manager, and the plan is built around them:

1. **In the trial.** A manager signs up and looks at what their staff will get. The first-day Home says what tonight's step is and shows the path ahead, instead of zeros. This is the most important screen in the product and it currently has the weakest design.
2. **On the marketing site.** The homepage's "Two views" section and `/platform` show staff and manager screens side by side. A bottle-green staff screen beside the parchment console screenshot reads instantly as two products for two people, and looks like nothing a competitor shows.
3. **When staff talk about it.** A manager will ask the team "do you actually use it?". Staff who open it before a shift because it's one tap and three minutes give a yes. That's the shift streak and the pre-shift drill brought to the front of Home.

What we will **not** do to sell: invented stats, testimonials, leaderboards that name people (the team card shows team totals only, by design), or confetti and mascots. The product is for adults at work.

---

## 7. The pages

### 7.0 Shell and navigation

| Group | Items | Notes |
|---|---|---|
| (none) | **Today** | Was Home |
| Learn | **Modules** | The path, section 7.2 |
| Practise | **Mixed Drill**, **Live Guest**, **Saturday Rush**, **Challenges** | In order of how often to use them |
| Look it up | **Cocktails**, **Knowledge Base** | Reference, not training |
| Me | **My progress** | Badges folds in here (section 7.6) |

Settings and Sign out move to the account menu on the avatar, as in the console. Plan status and the venue name sit under the logo. Locked items show a small lock and stay clickable, so the upgrade prompt explains itself on arrival.

Keep: `?nav=` links and the `RETIRED_NAV` redirects (`?nav=home`, `?nav=badges` and `?nav=progress` must still work). The nav ids don't change; only labels and grouping do.

### 7.1 Today (Home)

**Job:** tell me the one thing to do now, and show I'm getting somewhere.

Top to bottom:

1. **Tonight.** One large step on the green, set in Fraunces, with one brass button. It's picked by a rule (a new function, tested like `lib/drill.ts`):
   - shift day and today's pre-shift drill not done: **pre-shift drill** (six questions, about three minutes)
   - a module started and not finished: **carry on with that module**
   - mastered modules due for review: **review**
   - otherwise: **the next module on the path**, or a Live Guest once five modules are mastered.

   One quiet text link beside it offers the second choice.
2. **Shift streak.** Shifts in a row, freezes left, the shift days picker. Same data as mobile (`/api/training/shift-streak`). The desktop gets reminders too, since web push already works on desktop browsers.
3. **This week at the venue.** `TeamWeekCard` restyled: team goal line and the guest of the week. Hidden until the manager sets something, as now.
4. **Your path.** One horizontal line in brass showing Learn, Drill and Live Guest, how far along each is, and the next module on it. Replaces the three-ring timeline, the stats strip and the skill bar.
5. **For the bar tonight.** The cocktail of the day, photo-led, and one Knowledge Base fact. One row, not a carousel and two cards.

Removed from Home: the achievements row (moves to My progress), the duplicate skill bar, the "Focus for today" box (its three points become the module's own Learn cards).

**First day:** "Tonight" offers the skill check (`DiagnosticFlow`) or module 1, and the path shows all three levels ahead, unlit, with one line on what each is. No zeros.

### 7.2 Modules

**Job:** show the whole course and where I am on it.

- **A path, not a grid.** Modules listed by area (Behind the bar, Service and sales, Safety and compliance) as ruled rows: number, title, one line, a mastery ring, and the time it takes. Foundations first, then intermediate and advanced, with a hairline and a small caps label between them.
- **Where you are** is a brass marker on the current row, and a "Back to where I am" link appears once the person scrolls past it (the Duolingo arrow).
- **Recommended** is one row, lifted above the list with room around it and the reason ("Your skill check put you here"), not a pill on three cards.
- **Filter** by area as plain text tabs, and a search box. 40 rows fit in about two screens at 1440×900, against nearly five today.
- **Opening a module** (`ModuleVerify`, `LearnCards`, `QuizRun`): the Learn cards and the quiz sit on the cream docket in the middle of the green room, at reading width. The quiz's light theme (`.qz--light`) becomes the docket.

### 7.3 Mixed Drill

**Job:** a quick mixed round, and proof it's working.

- PageHead, then the drill on the docket from the first click: no separate intro card.
- Beside it, on the green: which modules this drill draws on (as a short list), and the last drill's score by module.
- Locked state (fewer than three modules started): a three-step line showing how many to go, with the next module as the button.
- The summary screen keeps its "go over the one you missed most" link, styled as the next step.

### 7.4 Live Guest

**Job:** the best thing in the product. Make people want to talk to a guest.

- **Lead with the guest, not the paywall.** The guest of the week, or the suggested guest, first and large: the setting in a line, who they are, how patient they'll be, and "Talk to them". The free taster guest is the lead off a venue plan.
- **The upgrade line moves below**, one sentence and a text link ("Live Guest comes with every venue plan. See plans"). It isn't a box at the top.
- **All guests** become rows grouped by area: title, setting, difficulty as a word. Locked rows look normal with a small lock, not faded.
- **The conversation** on the docket, the four dials on the green to the right, the reveal laid out as a timeline of the guest's mood. Voice keeps its current controls.

### 7.5 Saturday Rush and Challenges

- Rush is already a self-contained game screen. It moves onto the green room with its meters in brass, red kept for a breach. No structural change.
- Challenges: the five games as rows with a done tick, not a card grid. The games themselves keep their frames, since they're objects.

### 7.6 My progress (was How I'm improving and Badges)

**Job:** show me I'm getting better, in a form I could show my manager.

- **One figure that matters** large in Fraunces: modules mastered out of 40, with the path line beneath.
- **Three short ledgers** (`<dl>` rows, as on the marketing site): Learn (modules mastered, reviews due), Drill (drills done, best score), Live Guest (conversations, passes, best guest).
- **Mastery by area:** the 40 modules as a compact grid of rings, grouped by area. That's where the current Mastery Grid works well; it keeps its shape.
- **Badges** as a section here, earned first, the next one to earn shown with what it takes.
- **Activity** as a ruled list by day.
- Tabs (Overview, Modules, Activity) go. One page, in that order.

**First day:** "Your first module will show here" with the module's name and button, not six zeros.

### 7.7 Cocktails and Knowledge Base

- Cocktails: photo-led rows or a photo grid (photos are objects, so a grid is right here), recipe on the docket. Keep bookmarks and search.
- Knowledge Base: the article on the docket at reading width, the index as a ruled list beside it.

### 7.8 Settings

Moves to the account menu and becomes `.sd-setting` rows (heading and note left, control right), as `.mc-setting` does in the console. No cards. Delete account stays at the foot.

---

## 8. Phases

One branch, `preview/staff-desktop`, cut from main. Each phase ships to preview, then main, the usual way. Mobile is untouched throughout.

| Phase | What | Done when |
|---|---|---|
| **1. Standard and shell** | `--sd-*` tokens, `sd-` base parts (PageHead, ledger, ruled list, docket, ring, button), the grouped sidebar with rail and account menu, Every existing screen renders inside the new shell unchanged. | All 11 nav ids work, `?nav=` links work, no horizontal scroll at 1280, 1440 and 1920. |
| **2. Today** | The "tonight" rule (`lib/next-step.ts` with tests), pre-shift drill and shift streak on desktop, path line, reference row, first-day state. | The owner signs off Today on preview, as a new account and as the QA account. |
| **3. Modules and the module run** | The path list, the docket for Learn cards and quiz. | 40 modules in two screens; quiz and Learn cards readable at 68 characters. |
| **4. Practise** | Mixed Drill, Live Guest, Rush, Challenges on the standard. | Live Guest leads with a guest on every plan. |
| **5. My progress** | One page, badges folded in, first-day state. | `?nav=badges` opens the badges section. |
| **6. Look it up and Settings** | Cocktails, Knowledge Base, Settings rows. | Nothing in `app/dashboard/` uses `ops-*`, `card`, `grid-2` or the old banner. |
| **7. Clean-up and marketing** | Delete the old `psh-`, progress-hub and command-bar rules; move `docs/STAFF_APP.md` onto the new standard; retake the staff screenshots in `public/shots/`; add desktop baselines to the e2e suite. | `npm run lint:css` and `lint:css:unused` counts go down; the marketing pages show the new screens. |

**Checks every phase:** `npx tsc --noEmit`, `npx eslint` on changed files, `npm run lint:css` (count not rising), `npm test`, and a look at 1280, 1440 and 1920 with a new account and a well-used one.

**Size:** Phases 1 and 2 are the big ones. 3 to 6 reuse the parts from Phase 1 and are mostly markup and CSS. Nothing needs a database migration. The one new piece of logic is the "tonight" rule in Phase 2.

---

## 9. Decisions for the owner

1. **The look.** Bottle green, brass and cream (recommended), or parchment with green accents. Everything else in this plan works either way.
2. **Merge Badges into My progress.** Recommended: yes. One fewer menu item, and badges are progress.
3. **Desktop shift reminders.** Recommended: yes, using the same web push as mobile. Desktop staff are fewer, but it's the same code.
4. **Phase 1 to 2 as the first release.** Recommended: ship the shell and Today together, so the first thing anyone sees is the new Today, not a new frame around the old screens.

---

## Sources

- Duolingo, [The new Duolingo home screen design](https://blog.duolingo.com/new-duolingo-home-screen-design/)
- Reception of the path: [PiunikaWeb, Duolingo path UI backlash](https://piunikaweb.com/2022/10/17/duolingo-app-update-with-path-ui-faces-backlash-from-users/)
- Axonify: [product](https://axonify.com/product/), [app listing](https://apps.apple.com/app/id599679030), [ATD demo day](https://www.td.org/videos/atd-demo-day-axonify)
- Brilliant: [release notes 5.0.0](https://www.apkmirror.com/apk/brilliant-org/brilliant/brilliant-5-0-0-release), [4.6.1](https://www.apkmirror.com/apk/brilliant-org/brilliant/brilliant-4-6-1-release/)
- Linear: [How we redesigned the Linear UI](https://linear.app/blog/how-we-redesigned-the-linear-ui), [Behind the latest design refresh](https://linear.app/blog/behind-the-latest-design-refresh), [changelog 2024-03-20](https://linear.app/changelog/2024-03-20-new-linear-ui)
- Buyer priorities: [eLearning Industry, LMS selection criteria](https://elearningindustry.com/lms-selection-criteria), [Raccoon Gang, how to choose an LMS](https://raccoongang.com/blog/how-choose-best-lms/)
- Typsy: [features](https://public.typsy.com/features), [HotelTechReport comparison](https://hoteltechreport.com/compare/typsy-vs-wisetail-lms)
- Empty states: [Userpilot, progressive disclosure](https://userpilot.com/blog/progressive-disclosure/)
- Earlier competitor and learning-science research: `docs/Rich Update/LEARNING_UPGRADE_RESEARCH.md`, section 3
