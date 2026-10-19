# Image style sheet

Every picture in the app is built from parts drawn to these rules, so a schooner in a Learn card and a schooner in a quiz look like the same glass. The parts are SVG code (`lib/pictures/`, drawn by `components/pictures/Picture.tsx`), not image files.

## What we draw

- **Objects and hands only. No faces, no people, no logos or real brand labels.**
- Australian venue equipment as it really looks: the schooner, pot, middy and pint, the jigger, the speed rail, the ice well, the beer tap.
- **Accuracy beats polish.** A bartender should never be able to say "that's not what a schooner looks like". Shapes, fill levels and garnishes follow the approved Learn cards and questions.

## The look

- **Flat, with clean outlines.** No gradients, no shadows, no 3D. One highlight stroke on glass, to read as glass.
- **Side-on, at eye level.** That's how staff check a pour (Learn card: "read the meniscus at eye level"), and it keeps fill levels honest.
- **One drawing grid:** each picture is 120 × 160 units, with the ground line at 150. Glasses keep their real proportions to each other: a pot is shorter than a schooner, and a schooner shorter than a pint.
- **Lines:** 2.25 units, round ends and corners, in the outline colour. Small details (ice edges, fruit segments) use 1.5.
- **Detail:** only what the question needs. A lime wedge has a rind and two segment lines, not a texture.

## Colour

All colours are CSS variables (`--pic-*`), defined once in `app/globals.css` and adjusted for dark mode in `app/styles/staff.css`, so the same picture works on light desktop and dark mobile.

| Part | Variable | Notes |
|---|---|---|
| Outline | `--pic-line` | Deep green on light; warm cream on dark |
| Glass | `--pic-glass` | A pale tint, so the glass reads against the page |
| Highlight | `--pic-shine` | One soft stroke on the left of the glass |
| Lager, stout, foam | `--pic-lager`, `--pic-stout`, `--pic-foam` | Real drink colours, not brand colours |
| Wines | `--pic-red-wine`, `--pic-white-wine`, `--pic-rose`, `--pic-sparkling` | |
| Spirits and mixers | `--pic-clear`, `--pic-amber`, `--pic-cola`, `--pic-coffee`, `--pic-cream`, `--pic-spritz`, `--pic-pink` | |
| Ice | `--pic-ice` | White, partly see-through |
| Garnish | `--pic-lime`, `--pic-lemon`, `--pic-orange`, `--pic-mint`, `--pic-cherry`, `--pic-olive` | |
| Metal | `--pic-copper`, `--pic-steel` | Mugs and bar tools |

Brand colours (green, gold, parchment) carry the outline and the page around the picture. The drinks keep their real colours, because a staff member is judging a real pour.

## Every picture

- Has alt text, written from what it shows ("A schooner of lager with a thin head"). Screen readers read it, and it's the fallback if the picture can't show.
- Is described by a short spec, not drawn by hand: the glass, the drink, how full, the head, the ice, the garnish. The same spec always draws the same picture.

## Checking

You check each part and each sample picture on the review page before it's used anywhere, the same way you checked the questions.

---

## Making the pictures in Claude Design (parked 2026-10-20)

The pictures are parked until you have time to draw them in Claude Design yourself. This section is everything you need to do that without coming back here first.

### How to work, so it doesn't burn credits

1. **Start each session by pasting the brief below**, and upload `pictures/schooner-full.svg` (in this folder) as the style to match. Change the brief as you like; it's yours to tweak.
2. **Draw parts, not whole pictures.** One glass, one drink colour, one garnish at a time. The app puts the parts together, so a lime wedge drawn once is used in every drink that has one.
3. **One family per session:** glasses one day, garnishes the next. Approve one part in a family before asking for the rest, the same way we did the schooner.
4. **Ask for SVG code only**, with no explanation, to keep replies short.
5. **Save each part as its own file** in `docs/Rich Update/pictures/`, named as in the lists below (`pint.svg`, `lime-wedge.svg`). When a family is done, tell Claude Code "the glasses are in the pictures folder" and it turns them into parts in `lib/pictures/`, wires them in and builds the review page.

You don't need to draw the Learn card or question pictures by hand. Once the parts exist, almost all of them are put together from parts in code. The few scenes that need their own drawing are marked **(scene)**.

### The brief to paste

```
You are drawing parts for a picture library in an Australian hospitality
training app. Bartenders will judge these, so accuracy beats polish.

SUBJECT
- Objects and hands only. No faces, no people, no logos, no brand labels,
  no readable text on bottles.
- Australian venue equipment as it really looks (schooner 425 ml, pot or
  middy 285 ml, pint 570 ml; NSW names).

STYLE
- Flat, with clean outlines. No gradients, no shadows, no 3D, no texture.
- Side-on, at eye level. Never from above or at an angle, unless the
  part is a scene I ask for.
- One soft white highlight stroke on the left inside wall of any glass.
- Only the detail the picture needs. A lime wedge is a rind and two
  segment lines.

GRID AND LINES
- SVG, viewBox="0 0 120 160". Ground line at y = 150; the object stands on it.
- Real proportions between objects: 1 unit is about 1.27 mm, so a 155 mm
  tall schooner is 122 units tall. A pot is shorter than a schooner, a
  schooner shorter than a pint.
- Outline stroke 2.25, fine detail 1.5. Round line caps and joins.
- Glasses: give the outside shape AND the inside (bowl) as two separate
  closed paths, so liquid can be clipped to the inside.

COLOURS (use exactly these)
- Outline        #1f4e37
- Glass tint     rgba(31, 78, 55, 0.07)
- Highlight      rgba(255, 255, 255, 0.9), stroke width 3
- Lager #e3a92f   Foam #f8edcf   Bubbles rgba(255, 255, 255, 0.7)
- Stout #2b1d14   Red wine #7a1f2b   White wine #ecd98a   Rosé #f2a7a0
- Sparkling #f1dd8f   Clear spirit rgba(220, 235, 240, 0.55)
- Amber spirit #b8701f   Cola #4a2414   Coffee #5a3620   Cream #efe2c6
- Spritz orange #f2701d   Pink #e86a8a
- Ice rgba(255, 255, 255, 0.75) with a 1.5 outline at 50% opacity
- Lime #7cb342   Lemon #f2d33b   Orange #f08a24   Mint #4f9a5a
- Cherry #b3122e   Olive #7d8a3a   Copper #c4703a   Steel #a9b4b8

OUTPUT
- One SVG per part, nothing else in the reply.
- No embedded images, no filters, no fonts.
```

### Colours in the app

The brief uses fixed colours so Claude Design can show them. In the app each one becomes a `--pic-*` variable (table above), so the parts also work on dark mobile, where the outline turns white (`#ffffff`), the glass tint `rgba(255, 255, 255, 0.1)` and the highlight `rgba(255, 255, 255, 0.55)`. The drink and garnish colours stay the same on both. The first six colours are already in the app; the rest are suggestions, and you can change any of them.

---

## Pictures to create

### A. Parts

These are drawn in Claude Design. Everything in B and C is built from them.

**Glasses** (outside shape plus inside bowl, real sizes)

| File | Part | Notes |
|---|---|---|
| `schooner.svg` | Schooner, 425 ml | **Drafted:** `pictures/schooner-full.svg` |
| `pot.svg` | Pot or middy, 285 ml | Same family as the schooner, shorter |
| `pint.svg` | Pint, 570 ml | Slight bulge near the top (nonic) |
| `highball.svg` | Highball | Straight sided, tall |
| `collins.svg` | Collins | Taller and narrower than a highball |
| `rocks.svg` | Rocks (old fashioned) | Short, heavy base |
| `shot.svg` | Shot glass, 30 ml | |
| `coupe.svg` | Coupe | Wide, shallow bowl on a stem |
| `martini.svg` | Martini glass | V-shaped bowl on a stem |
| `nick-and-nora.svg` | Nick & Nora | Small, rounded bowl on a stem |
| `margarita.svg` | Margarita glass | Stepped bowl |
| `red-wine.svg` | Red wine glass | Larger bowl than white |
| `white-wine.svg` | White wine glass | |
| `flute.svg` | Flute | |
| `copa.svg` | Copa or balloon | Gin & tonic and spritz |
| `hurricane.svg` | Hurricane | |
| `irish-coffee.svg` | Irish coffee glass | Handle, short stem |
| `copper-mug.svg` | Copper mug | Moscow Mule; uses Copper |
| `tiki-mug.svg` | Tiki mug | Plain carved bands, no face |
| `heat-safe-mug.svg` | Heat-safe glass mug | Hot Toddy |
| `water-glass.svg` | Tumbler for water | |
| `coffee-cup.svg` | Coffee cup and saucer | Cappuccino and flat white |
| `latte-glass.svg` | Latte glass | |
| `espresso-cup.svg` | Espresso cup | Macchiato |

**Drinks and fills** (colours only; the app fills any glass to any level)

- Lager with head, stout with head, red, white, rosé, sparkling (with bubbles), clear spirit, amber spirit, cola, coffee, cream layer, Aperol spritz, pink (Cosmopolitan), green (Japanese Slipper).
- `foam-cocktail.svg`: a foam layer for sours, with bitters dots.
- `milk-foam.svg`: microfoam for coffee, in three depths (macchiato dash, flat white thin, cappuccino thick).

**Ice**

- `ice-cube.svg`, `ice-large-cube.svg` (rocks), `crushed-ice.svg`, `ice-well.svg` (side-on, full).

**Garnishes**

- `lime-wedge.svg`, `lime-wheel.svg`, `lemon-wheel.svg`, `lemon-wedge.svg`, `lemon-twist.svg`, `orange-slice.svg`, `orange-peel.svg`, `grapefruit-wedge.svg`
- `mint-sprig.svg`, `rosemary-sprig.svg`, `cherry.svg`, `green-cherry.svg`, `olive-pick.svg`, `coffee-beans.svg` (three), `passionfruit-half.svg`, `pineapple-wedge.svg`, `pineapple-leaf.svg`, `jalapeno-slice.svg`, `cinnamon-stick.svg`, `nutmeg-dust.svg`
- `salt-rim.svg` (full and half), `peach-slice.svg`

**Bar tools**

- `jigger.svg` (30 ml / 15 ml, Japanese style), `jigger-meniscus.svg` (close-up, for the "read the meniscus" card)
- `shaker.svg` (tin on tin), `mixing-glass.svg`, `bar-spoon.svg`, `strainer.svg`, `muddler.svg`
- `ice-scoop.svg`, `scoop-holder.svg`, `waiters-friend.svg` (with its two-step lever), `pourer.svg`, `soda-gun.svg`, `tray.svg` (round drinks tray, side-on)

**Bar equipment and objects**

- `beer-tap.svg` (font and tap handle), `drip-tray.svg`, `keg.svg` (50 L), `coupler.svg` (handle up and handle down), `gas-bottle.svg`, `glass-washer.svg` (with steam), `speed-rail.svg` (with plain bottles, one empty slot)
- `wine-bottle.svg` (plain label), `sparkling-bottle.svg`, `cork.svg`, `foil.svg`
- `coffee-machine-group.svg`, `steam-wand.svg`, `milk-jug.svg`, `thermometer.svg`
- `docket.svg` (blank), `pos-screen.svg`, `phone.svg`, `clipboard-checklist.svg`, `wet-floor-sign.svg`, `mop-bucket.svg`, `bar-towel.svg`, `cleaning-spray.svg`, `chopping-boards.svg` (with a separate colour-coded board), `tongs.svg`, `fridge-shelves.svg`, `label-date.svg`, `blue-band-aid.svg`, `safe.svg`, `alarm-keypad.svg`, `bottle-bin.svg`, `fire-exit-sign.svg` (symbol only), `assembly-point-sign.svg` (symbol only), `id-card.svg` (blank photo ID, no face), `water-jug.svg`, `plate.svg`, `dessert-menu.svg`

**Hands** (one flat skin tone family, no rings or nails detail)

- `hand-hold-base.svg` (holding a glass by the base), `hand-hold-stem.svg`, `hand-tray.svg` (fingertips under a tray), `hand-pinch.svg` (three glasses by the base), `hand-wave.svg`, `hand-nod-thumbs-up.svg`, `hand-raised.svg`, `hand-wash.svg` (under a tap with soap)

### B. Learn card pictures

One per card, by module. Each is a spec built from the parts above unless marked **(scene)**. A few cards are about manner or tone, where objects can't carry the idea; they're marked **(no picture)** and work as text, as they do now.

**1 Beer Pouring**
1. Start with a cold glass: a schooner with steam lines rising, next to a glass washer.
2. Tilt, then open the tap fully: a hand holding a schooner at 45 degrees under an open tap. **(scene)**
3. The tap never touches the beer: tap nozzle above a filling schooner, a clear gap marked.
4. A schooner and its head: a full schooner of lager with a 1.2 cm head. **Drafted.**
5. Don't let it overflow: a schooner with beer running down the outside into the drip tray.
6. Buttery beer means a dirty line: a beer tap with a cleaning brush and a "line clean" clipboard.

**2 Wine Service**
1. Shiraz isn't served fridge-cold: a red wine glass beside a thermometer reading 16 to 18 °C.
2. Know your pour: a 750 ml bottle and five 150 ml glasses in a row.
3. Show the label first: a hand presenting a wine bottle, label facing out (blank label).
4. Corked means tainted: a red wine glass and a pulled cork with a small damp patch. **(no picture if it looks unclear)**
5. Open sparkling quietly: a hand holding the cork in a towel, bottle at 45 degrees, a small hiss mark.
6. Styles and glasses: a red wine glass and a white wine glass side by side, the red bowl larger.

**3 Cocktail Fundamentals**
1. Measure the spirit: a jigger filled to 30 ml.
2. Stir a Martini: a mixing glass with a bar spoon, next to a martini glass.
3. Syrup and mint: a muddler resting on mint in a highball, leaves whole.
4. Fresh coffee for an Espresso Martini: an espresso cup next to a shaker and a coupe with three beans.
5. Classic specs, right glass: a Negroni in a rocks glass with orange peel, three equal jigger measures above.
6. Never scoop with a glass: an ice scoop in an ice well, and a glass in the well crossed out.

**4 Barista Basics**
1. Don't boil the milk: a milk jug and thermometer stopping below 65 °C.
2. Shot time and roast: an espresso pouring from the group head, a "25 to 30 s" timer.
3. Know the Aussie menu: macchiato, flat white and cappuccino side-on, foam depths showing.
4. Purge the wand, flush the group head: steam wand with a short puff of steam.
5. Plant milks need a gentler touch: a milk jug with a lower temperature mark.

**5 Tray Carrying**
1. Eyes up: a tray carried level, with an arrow forward. **(no picture if it looks unclear)**
2. Heavy glasses in the middle: a tray from the side with schooners centred, wine glasses at the edges.
3. One hand under, one hand free: a hand under a tray on its fingertips.
4. Drinks trays carry drinks: a tray with a dirty plate on it, crossed out.
5. Never by the rim: a hand holding a wine glass by the stem.
6. Unload evenly: a tray with glasses removed from both outer edges.

**6 Sanitation Basics**
1. Wash your hands after cash: hands under a tap with soap, banknotes to one side.
2. Protect the ice well: a cleaning spray near the ice well, crossed out.
3. Bathroom gear stays out: a mop and bucket outside the bar, crossed out behind it.
4. Sign every spill: a wet floor sign over a puddle.
5. Sanitise, don't just rinse: a spray bottle marked "food-grade" on a prep bench.
6. Drip trays and towels: a drip tray being flushed, and a fresh bar towel.

**7 Bar-Back Efficiency**
1. Cool, unstacked glasses: glasses on a rack, not stacked inside each other.
2. Spirits and ice come first: a full speed rail and a full ice well.
3. Cut the gas before a keg change: a coupler with its handle up.
4. Clear the bar, rotate the juice: two juice bottles, the older one in front.
5. Call it out: **(no picture)**, or a speech bubble with "Behind you".

**8 The Greeting**
1. Acknowledge straight away: `hand-wave.svg`.
2. Eyes up while you pour: a schooner filling under a tap, an arrow up and out.
3. Don't shout across the room: **(no picture)**
4. Smile, and say you'll be right there: a speech bubble with "I'll be right with you".
5. Never look past waiting guests: **(no picture)**
6. A real welcome builds regulars: **(no picture)**

**9 Table Dynamics**
1. Clear when everyone's finished: a table from above with one plate still being eaten from. **(scene)**
2. From the right, never empty-handed: a hand taking an empty glass from the right of a plate.
3. Let the table set the pace: a bill folder held back, not on the table.
4. Check back after the first bites: a plate with a few bites taken.
5. Talk to the whole table: **(no picture)**
6. Kids' meals first: a small plate served before larger ones.

**10 Anticipatory Service**
1. Refill before they ask: a glass a third full and a water jug beside it.
2. Watch without hovering: **(no picture)**
3. Solve it before it's a problem: a plate of wings with napkins and wet wipes.
4. Anticipate needs, not orders: water jug and cutlery set down.
5. Remember your regulars: a schooner set down with a "the usual" bubble.
6. Dessert menu as plates clear: a cleared plate and a dessert menu.

**11 Guest Complaints**
1. Listen, then apologise: **(no picture)**
2. Own it, don't argue: **(no picture)**
3. Fix it properly: a plate going back through the kitchen pass, a microwave crossed out.
4. Follow up: a plate with a tick.
5. Tell the manager: a docket with a "manager" note.

**12 Suggestive Selling**
1. Suggest a step up: a schooner and a pint side by side, an arrow to the pint.
2. Suggest what goes with it: a main plate with a side bowl.
3. Help, don't push: **(no picture)**
4. Drinks while they read the menu: an open menu with a cocktail beside it.
5. Know the menu: an open menu.

**13 VIP Management**
1. The law applies to everyone: a clock past closing and a glass crossed out.
2. A short grace period: a "reserved" card and a clock.
3. Every guest counts: a drink at the bar for a waiting guest.
4. Use their name: a booking sheet with one name circled.
5. Don't double-seat a section: a floor plan with three tables seated at once, crossed out. **(scene)**
6. Look after people at the door: a glass of water held out.

**14 Phone Etiquette**
1. Answer promptly, name the venue: a ringing phone.
2. Warn before you hang up: a phone with a speech bubble and a hand over the end-call button.
3. Get the details right: a booking pad with name, number and time.
4. Book the time, not the table: a booking with "window if possible" noted.
5. Don't leave callers waiting: a note with a name and number to call back.
6. Smile on the phone: **(no picture)**

**15 RSA Compliance**
1. Refuse when intoxicated: a glass pushed back, a glass of water offered.
2. Know the signs: **(no picture)**
3. Minors and ID: a blank government photo ID card (no face, no real design).
4. Free water, always: a water jug and glasses at the bar.
5. Point to the law: **(no picture)**

**16 Food Safety**
1. Coeliac means separate gear: a separate colour-coded board and knife.
2. Keep raw meat apart: fridge shelves with raw chicken on the bottom shelf.
3. Out of the danger zone: a thermometer with 5 °C to 60 °C shaded.
4. Twenty seconds: hands washing with a "20 s" timer.
5. Label and date: a container with a date label.
6. Blue band-aids: a blue band-aid.

**17 Conflict De-escalation**
1. Open body, safe distance: **(no picture)**; faces and bodies are out of style.
2. Calm voice, no shouting match: **(no picture)**
3. Away from the crowd: a floor plan with an arrow to a quiet corner. **(scene)**
4. Address the behaviour: **(no picture)**
5. Threats go to security: a phone or radio.

**18 Evacuation Protocols**
1. Know your assembly point: an assembly point sign.
2. Leave everything behind: a drink left on a table, an exit arrow.
3. Stairs, not lifts. Exits clear: a fire exit sign with chairs stacked in front, crossed out.
4. Follow the fire warden: a warden's hi-vis vest on a hook.
5. Walk, don't run: an exit sign and walking-pace arrows.

**19 Opening & Closing**
1. Count the float at opening: a till drawer with notes and coins.
2. The coffee machine is the venue's call: the coffee machine with a venue checklist.
3. Wipe the taps, dry the wells: a plugged tap and a dry ice well.
4. Mop so it dries: a mop and bucket with a clock showing close.
5. Lock the safe, set the alarm: a safe and the alarm keypad.
6. Bottle bins in the allowed hours: a bottle bin and a clock.

**20 Inventory Control**
1. Measure every pour: a jigger over a glass.
2. Free drinks need approval: a POS screen with a manager key.
3. Log waste, count everything: a broken bottle and the wastage log.
4. First in, first out: milk cartons, oldest at the front.
5. Never pour it back: wine from a glass poured into a bottle, crossed out.

**21 Call Behind**
1. Call "Behind!" every time: a speech bubble with "Behind!" and a tray.
2. Call "Corner!": a corner on a floor plan with "Corner!".
3. Never push or run: **(no picture)**
4. Coming through: a speech bubble with "Coming through!".
5. Everyone makes the calls: **(no picture)**

**22 Ice Well Burn**
1. Melt it all: a broken glass in an ice well.
2. Hot water burns the well: hot water poured over the ice in a well.
3. Burn it straight away: a broken glass in the well and a clock at now.
4. Scoop, then a clean holder: the scoop back in its holder.
5. Plan for the time it takes: an empty, draining well marked "out of service".

**23 The Swivel Head**
1. Spot the dead soldiers: a table with empty glasses.
2. No tunnel vision: **(no picture)**
3. Read the cues: an open menu and `hand-raised.svg`.
4. Sweep and acknowledge: **(no picture)**
5. Everyone reads the room: **(no picture)**

**24 Ice Is Food**
1. Ice is food: ice cubes on a plate.
2. Scoop only: a scoop in ice; a hand and a glass crossed out.
3. Handle up, damaged scoops out: a scoop with its handle up, and a chipped scoop crossed out.
4. Lid shut, machine clean: an ice machine with its lid closed.
5. Moving ice between wells: a scoop and a clean ice bucket.

**25 Allergy Shield**
1. Mark the ticket, tell the kitchen: a docket with "ALLERGY: NUTS" marked.
2. Ask with every order: a docket and a question mark.
3. Traces matter: a chopping board with a few crumbs.
4. You pass it on: a docket handed through the pass.
5. Check before it goes out: a plate held at the pass with a question mark.

**26 Soda Gun Speed**
1. Know your gun by feel: a soda gun with its buttons.
2. Rinse with water, clean the nozzle: a soda gun nozzle with a cleaning brush.
3. Run the first pour to waste: the gun pouring into the drip tray.
4. Know where the spare syrup is: a bag-in-box syrup.
5. Wrong button, new drink: a glass tipped out and a fresh one.

**27 Two-Handed Flow**
1. Both hands working: one hand holding a glass, the other the soda gun. **(scene)**
2. Move less, not faster: **(no picture)**
3. Prep garnishes first: a garnish tray of limes, lemons and mint.
4. No wasted trips: a tray of empties heading back.
5. Practise when it's quiet: **(no picture)**

**28 Mid-Shift Reset**
1. Everything in its place: a tidy station: speed rail, garnish tray, ice well.
2. Restock in the lulls: a bottle going into the speed rail.
3. Never run out of garnish: a full garnish tray.
4. Ask for cover: **(no picture)**
5. Top up the ice: an ice bucket tipping into a well.

**29 Docket Reading**
1. Know your docket codes: a docket with "M/R" and "G/F".
2. No note isn't a guarantee: a docket with an unclear handwritten note.
3. Keep dockets in order: three dockets in a rail, in printed order.
4. 86 means it's gone: a docket with "86".
5. Call the table at the pass: a plate at the pass with "Table 7 away!".

**30 Beating the Weed**
1. Everyone gets in the weed: a docket rail full of dockets.
2. Slow down and keep talking: a speech bubble with "With you in a moment".
3. Pause, then work in order: dockets numbered 1, 2, 3.
4. Call for help early: **(no picture)**
5. Keep the stress off the floor: **(no picture)**

**31 Jigger Precision**
1. Jigger every pour: a jigger over a glass.
2. Small over-pours add up: one jigger slightly over, and a 1 litre bottle.
3. Read the meniscus: a close-up of a jigger at eye level, the curve showing.
4. The jigger backs you up: a jigger and a tick.
5. No "bit extra": a jigger topped over the line, crossed out.

**32 Wine Opener Mastery**
1. A clean foil cut: a bottle neck with the foil cut below the second lip.
2. Two steps, not one pull: a waiter's friend on its first step, then its second. **(two-panel)**
3. Keep it quiet: a cork easing out, no pop.
4. Hold the bottle still: a hand on the bottle and the corkscrew turning.
5. Present the cork, every bottle: a cork on a small plate.

**33 Cellar & Kegs**
1. Fobbing means a problem: a schooner of mostly foam under a tap.
2. Disengage, then pour off the air: a coupler handle up, a tap pouring a foamy glass.
3. No gas, no beer: a gas bottle with an empty gauge.
4. Slide, don't lift: a keg sliding on the floor with an arrow.
5. Right coupler, regular cleaning: two coupler types.

**34 Tray & Glass Grip**
1. Hands off the rim: a hand holding a glass by the base, the rim crossed out.
2. Don't stack glasses: two glasses stacked, crossed out.
3. Use the pinch: `hand-pinch.svg` holding three glasses.
4. Stems for wine: a hand on a wine glass stem.
5. Heavy in the middle, dry before carrying: a tray with schooners centred.
6. Plates and glasses apart: a plate and a glass in one hand, crossed out.

**35 The Clean Close**
1. Close for the morning crew: a clean, stocked back bar.
2. Backflush the group heads: the group head with a blind basket.
3. Speed rail and glassware: polished glasses on a rack.
4. Floors and mop water: an empty mop bucket.
5. Sign the checklist: a closing checklist with a signature line.

**36 Two-Minute Check**
1. After the first bite: a steak with one bite taken, a "2 min" timer.
2. Every table, every dish: **(no picture)**
3. Ask a specific question: a speech bubble with "How's the steak cooked for you?".
4. Catch it while it can be fixed: a plate going back to the pass.
5. A quick check is good service: **(no picture)**

**37 The Out-of-Stock Pivot**
1. Always offer an alternative: an empty wine bottle and a second bottle beside it.
2. Recommend, don't console: two bottles, an arrow to the closer match.
3. Know what's similar: two similar glasses of red.
4. One apology is enough: **(no picture)**
5. Everyone knows what's 86'd: a whiteboard with "86" items.

**38 Clearing Dead Soldiers**
1. Clear dead soldiers: an empty glass and bottle on a table.
2. Pre-bus as you go: a side plate being cleared while mains stay.
3. Never walk back empty-handed: a full tray of empties.
4. A clean table feels cared for: a cleared, reset table.

**39 Bar-Back Synergy**
1. Keep the bartender supplied: a full speed rail and ice well.
2. Go where you're needed: a tray of glasses and an ice bucket.
3. Call out, come from behind: a speech bubble with "Ice coming".
4. Don't wait to be asked: a speed rail with one empty slot being filled.
5. Talk all through the rush: **(no picture)**

**40 Natural Upselling**
1. Name the product: a speech bubble with "With Hendrick's?" (spoken name only, no label drawn).
2. Recommend a specific side: a plate of chicken and a bowl of sweet potato fries.
3. Enthusiasm, not pressure: **(no picture)**
4. Know your pairings: a steak and a red wine glass.
5. Right time, every guest: a dessert menu by a cleared plate.

### C. Question pictures

These are made in code from the parts, and drawn fresh each time with a different glass, level or garnish, so they don't repeat. Nothing here is drawn by hand.

**Which glass** (show the drink without its glass, or four glasses to choose from)

| Drink | Right glass | Garnish to draw |
|---|---|---|
| Espresso Martini | Coupe | Three coffee beans |
| Margarita | Coupe or Margarita glass | Lime wheel, half salt rim |
| Mojito | Highball | Mint sprig, lime wheel |
| Old Fashioned | Rocks | Orange peel |
| Aperol Spritz | Wine glass | Orange slice |
| Gin & Tonic | Copa or Highball | Rosemary sprig or citrus wheel |
| Whiskey Sour | Coupe | Lemon wheel, bitters on foam |
| Negroni | Rocks | Orange peel |
| Pornstar Martini | Coupe | Passionfruit half |
| Classic Daiquiri | Coupe | Lime wheel |
| Cosmopolitan | Coupe | Lime wheel |
| Long Island Iced Tea | Highball | Lemon wedge |
| Moscow Mule | Copper mug | Lime wheel |
| Lemon, Lime & Bitters | Highball | Lemon and lime wheels |
| Paloma | Highball | Grapefruit wedge, salt rim |
| Sidecar | Coupe | Orange peel |
| Gimlet | Coupe | Lime wheel |
| Pisco Sour | Coupe | Bitters on foam |
| Dry Martini | Martini glass or Coupe | Lemon twist or olive |
| Manhattan | Coupe | Cherry |
| Sazerac | Rocks | Lemon peel |
| Tom Collins | Collins | Lemon wheel, cherry |
| Dark & Stormy | Highball | Lime wheel |
| Hugo Spritz | Wine glass | Mint sprig, lemon wheel |
| Pina Colada | Hurricane | Pineapple wedge, cherry |
| Singapore Sling | Hurricane | Pineapple leaf, cherry |
| Bellini | Flute | Peach slice |
| Mimosa | Flute | Orange wheel |
| Japanese Slipper | Coupe | Green cherry |
| Irish Coffee | Irish coffee glass | Cream layer |
| Hot Toddy | Heat-safe mug | Cinnamon stick, lemon wheel |
| Schooner, pot, pint | The glass itself | "Which glass holds 425 ml?" |
| Red or white wine | Red or white wine glass | |
| Flat white, cappuccino, macchiato | Cup or glass with the foam depth | |

**Spot the mistake** (one thing wrong; the app chooses the glass and level)

- Beer: head too big; no head; short pour; beer down the outside; tap nozzle in the beer; fobbing pour.
- Wine: overpoured (well past 150 ml); red in a white glass; sparkling in a rocks glass.
- Cocktails: wrong glass for the drink; wrong garnish (Negroni with a lime wedge); Martini with ice cubes in the glass; Mojito with ground-up mint.
- Jigger: filled below the line; over the line; read from above instead of eye level.
- Ice: a glass in the ice well; the scoop buried handle down; broken glass in the well.
- Hygiene: cleaning spray next to the ice well; raw chicken on the top shelf; the same tongs for raw and cooked; no date label.
- Carrying: glasses stacked inside each other; held by the rim; schooners at the tray edge; plates on a drinks tray.
- Coffee: milk thermometer past 65 °C; cappuccino with flat-white foam.
- Kegs: coupler handle down during a keg change; empty gas gauge.
- Safety: chairs in front of a fire exit; no sign on a wet floor.

**Number questions**

- How full is this jigger? (15, 20, 30 ml)
- How many standard glasses in this bottle? (750 ml bottle, five glasses)
- How tall is this head? (0.5, 1.2, 3 cm)
- What does this thermometer read? (milk, red wine, the fridge)
