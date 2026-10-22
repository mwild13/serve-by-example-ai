# Marketing Imagery Plan: venue photos and new device mockups

October 2026. The last main job before the marketing site is shared across Australia. Two parts: real venue photography on the marketing pages, and new product mockups now that the staff desktop and staff mobile have been redesigned.

---

## 1. What the research says

- **There is no solid study proving "photos convert better".** Most published figures (for example "faces lift conversion 38%") are vendor claims with no test behind them. The one consistent finding across real A/B tests: **authentic, relevant photos beat generic stock**, and generic "happy people" stock can lose to no photo at all.
- **What the best hospitality software sites actually do:**
  - **Toast** (pos.toasttab.com): full-width hero photo of a real cook mid-service, warm and dark, slightly motion-blurred, headline in white on the dark side, their screen visible inside the photo. The single clearest model for us.
  - **Lightspeed AU**: a real person in an apron with the product layered in front of them. Person plus product in one picture.
  - **Typsy** (our closest competitor, hospitality training): photos of hotel reception, restaurant, bartender and chef tiles for "who it's for", product screenshots for features.
  - **7shifts, Tanda, Deputy**: product UI only. Fine for software people; cold for a venue owner.
- **The lesson for SBE:** the photo's job is recognition ("that's my venue, that's my staff"). The screenshot's job is proof ("this is real software"). The pages need both, and right now we only have the second.

## 2. The rules for every photo

### Style

- **Mid-service, not posed.** People working: pouring, carrying, briefing. Nobody smiling at the camera.
- **Warm and low-key.** Tungsten and amber light, timber, brass, dark greens, bottles catching light. Evening, not midday.
- **Australian.** Pubs with tiled bar fronts and schooner glasses, beer gardens, hotel bars, a wine bar. Not American diners, not neon nightclubs.
- **Faces not the subject.** Hands, backs, side-on, shallow focus. Safer for model releases and keeps the "faceless brand" rule.
- **Room for text.** Subject in the right third, calm dark space on the left.

### Avoid

- Bright white daylight cafe shots, cold blue light, nightclub neon.
- Readable alcohol brands or venue logos.
- Shots, drunk guests, anything that looks like irresponsible service. We sell RSA-aware training.
- Anything that implies a named venue is our customer. No customer proof exists yet, so photos are atmosphere only, never captioned as a client.

### Colour

- Our palette is bottle green, cream and brass. Pick photos with **warm ambers, deep greens, timber browns and black**. Those sit under a green tint without looking muddy.
- I will put the same treatment on every photo (a bottle-green scrim and a slight desaturate) so photos from different sources look like one set. Don't worry about exact matches; worry about warm light.

### Size

- **Landscape photos: at least 2400px wide**, ideally 3000px. Portrait photos: at least 1200 x 1500.
- Download the largest JPG. I resize and convert to AVIF/WebP, so pages stay fast.

### Where they come from

**A real shoot at one venue, with a photographer (decided 2026-10-22).** The brief, the message to the venue, the releases and the shot order are in `To_do_list.md` section 1, "Venue photo shoot". No Vecteezy: its Free licence needs a credit line on the site and Pro was not wanted. Unsplash or Pexels (free, no credit line) can fill a gap the shoot misses, choosing shots where faces aren't identifiable, since neither gives model releases.

## 3. Where each photo goes

The shoot covers these slots. The solutions pages (7 to 10) can reuse shoot photos or take Unsplash fill-ins.

| # | File name | Where it goes | Shot | Shape | Search terms |
|---|-----------|---------------|------|-------|--------------|
| 1 | `home-hero.jpg` | Home hero, behind the headline, with the device mockup in front | Bartender mid-pour at a busy back bar at night, side-on, bottles glowing out of focus, warm amber light, dark space on the left | Landscape, 3000px+ | bartender pouring busy bar night, back bar bottles bokeh, pub bar service warm light |
| 2 | `duo-staff.jpg` | Home "Staff side" panel | Staff member carrying plates or a tray through a dining room, back or side to camera | Portrait 4:5 | waiter carrying plates restaurant, server tray motion, hospitality staff service |
| 3 | `duo-manager.jpg` | Home "Manager side" panel | Manager at the pass or end of the bar checking a phone or tablet before service | Portrait 4:5 | restaurant manager tablet, bar manager checking phone, hospitality manager before service |
| 4 | `path-briefing.jpg` | Home "Mastery Path" dark band, very faint behind the three steps | Pre-shift huddle: four to six staff in aprons around the bar, listening | Landscape, 2400px+ | staff briefing restaurant, pre-shift meeting team, hospitality team huddle |
| 5 | `cta-band.jpg` | Final "Get your next hire floor-ready" band | Empty bar set up before opening: polished glasses, stools, late-afternoon light | Landscape, 2400px+ | empty bar before opening, bar stools golden hour, pub interior empty |
| 6 | `between-shifts.jpg` | How It Works hero; "On their phone" row | A staff member on a break out the back, on a keg or step, looking at their phone, apron on | Landscape or 4:5 | waiter on break phone, hospitality worker break smartphone, chef break phone |
| 7 | `solutions-pub-groups.jpg` | /solutions/pub-groups hero | Classic Australian pub: tiled bar, beer taps, schooners, or a beer garden at dusk | Landscape | australian pub interior, pub beer taps, beer garden dusk |
| 8 | `solutions-hotel-fb.jpg` | /solutions/hotel-fb hero | Hotel lobby bar or room service trolley, polished and calm | Landscape | hotel lobby bar, hotel bartender, hotel restaurant service |
| 9 | `solutions-fine-dining.jpg` | /solutions/fine-dining hero | Sommelier pouring wine, or chef's hands plating | Landscape | sommelier pouring wine, fine dining plating hands |
| 10 | `solutions-franchise.jpg` | /solutions/franchise-systems hero | Busy casual-dining counter, several staff working the same line | Landscape | busy restaurant counter staff, fast casual kitchen line team |
| 11 | `for-venues.jpg` | /for-venues hero | Wide shot of a full venue mid-service, staff moving | Landscape | busy restaurant interior evening, crowded bar service wide |

**Phone in hand:** shot 2 of the shoot, a staff member's hand holding a phone square to the lens with a plain white screen. The app's real screen is put into it.

## 4. Mockups

Made by `scripts/device-mockups.mjs`, no stock files.

- **Frames:** phone and laptop frames are drawn in CSS by the script and rendered with a transparent background. No credit line, sharp at any size.
- **Screens:** `node scripts/device-mockups.mjs capture` against `npm run dev`. Staff screens use the QA session (`docs/LIVE_APP_TESTING.md`). Console screens and Live Guest use a manager session saved by `node scripts/device-mockups.mjs login-manager` to `tests/e2e/.auth/manager-state.json` (gitignored), since the QA account has no console and its one free Live Guest conversation is spent. Phone at 390 x 797 at 3x (the script draws the iPhone status bar), desktop at 1440 x 900 at 2x.
- **What is left out on purpose:** the QA account has no training history and the demo venue's training is over 30 days old, so staff progress screens and the console Overview (which show zeros) are not used. Retake those once there is recent activity.
- **Names:** the script swaps the QA account's name for "Sam Taylor" and hides the demo staff's internal email addresses just before each capture, so no fake records go into the database and no platform numbers change.
- **Live Guest:** the reply is typed in and not sent, so no AI call is made and a local server without an OpenAI key works.
- **Output:** `node scripts/device-mockups.mjs compose` writes WebP files to `public/shots/`: `hero-devices`, `phone-*` (framed) and `console-*` / `desktop-*` (plain; the page's `.sbe-shot` class adds the radius and shadow).

### Where each mockup is used (replaced 2026-10-23)

| File | Used on |
|---|---|
| `hero-devices.webp` | Home hero: console Staff list on a laptop, Live Guest and Home on phones |
| `console-staff.webp` | /platform (Overview row), /login |
| `console-gaps.webp` | Home (Manager view), franchise-systems |
| `console-gaps-compact.webp` | /how-it-works |
| `console-teams.webp` | pub-groups |
| `console-compliance.webp` | hotel-fb |
| `console-reports.webp` | /for-venues |
| `console-coach.webp` | /platform (AI Coach row) |
| `desktop-today.webp` | Home (Staff view) |
| `desktop-modules.webp` | Home, /platform |
| `phone-home.webp` | Home |
| `phone-learn.webp` | /how-it-works |
| `phone-cocktails.webp` | /platform, fine-dining |
| `phone-challenge-*.webp` (3) | /platform/challenges |

When the venue photos arrive, the hero mockup goes over `home-hero.jpg` as in section 5.

## 5. How photos go on the page

- **Behind text:** photo full-bleed, a bottle-green scrim at roughly 90% over the text side fading to 55% on the far side, so headline contrast passes WCAG AA. Checked with axe after the build.
- **Faint backgrounds** (Mastery Path band): photo at 10 to 15% under the existing dark band.
- **Portrait panels:** photo as an object with the standard screenshot radius.
- **Mobile:** each photo gets its own focal point so the subject isn't cropped out on a phone; the hero text sits on solid green above the photo.
- **Speed:** the hero photo becomes the largest paint on the page, so it is preloaded, AVIF first, under 250 KB. Everything else lazy-loads.
- **Design standard:** `docs/Pages-Redesign.md` sections 2.5 and 2.7 currently say "real product over decoration" and "no decorative gradients". They are updated in the same change to allow venue photography and the photo scrim, with these rules.

## 6. Other changes worth making while we're here

Ranked by likely effect on a venue owner deciding.

1. **Hero shows the venue and the product together** (sections 3 and 4). Biggest single change.
2. **A short silent loop of Live Guest** (8 to 12 seconds, a guest reply arriving and the mood meter moving) in the "Apply it under real pressure" step. It is the one thing no competitor has; a still undersells it. I can record it with Playwright.
3. **Make "Australian" visible beyond the eyebrow:** prices in AUD with GST stated, RSA named, Australian photos. Typsy and 7shifts read as global; local is our edge.
4. **An honest early-venue offer instead of fake proof.** For example founding-venue pricing for the first set of Australian venues. Your call on whether and what.
5. **Measure it:** note the home page's trial-start rate for two weeks before and after (`docs/FUNNEL_METRICS.md`). Traffic is too low for a proper A/B test yet.
