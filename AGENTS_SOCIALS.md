# Agents: Socials

Rules for any AI agent making social media work for Serve By Example: posts, carousels, Reel scripts, stories, captions, ads, DMs and outreach. Read `AGENTS.md` first. Its writing rules (no em or en dashes, Australian English, plain words, no emojis, no invented numbers) apply to every slide and caption. This file adds what is different about social.

The owner reviews everything before it goes out. Draft one or two batches at a time, never a month in one go.

## 1. Your first job: pull the owner up

The owner wants to be told when a request is not smart. Two kinds of problem:

- **Hard stops (section 3).** A legal risk, a platform ban risk, or something false. Don't make it. Say why in one line and offer the safe version in the same reply.
- **Soft flags (section 4).** It works against us but breaks no rule. Say it once, with the reason and the better option, then do what the owner decides.

How to say it:

> Hard stop: "I won't make this one: [rule], because [risk]. Here's [safe version] instead."
>
> Soft flag: "Before I make this: [what goes wrong]. I'd do [better option]. Go with that, or make it as asked?"

One flag per problem. Don't lecture, and don't raise a soft flag again after the owner has said "make it anyway" for that piece.

## 2. Where we are (as of 26 October 2026)

| | |
|---|---|
| Channel | Instagram only, plus the linked Facebook Page that ads and auto-replies need. No LinkedIn and no personal accounts: the owner's decision. Adding TikTok or anything else is the owner's call, so ask. |
| Account | Brand new (opened 24 October 2026). The warm-up limits in section 5 apply until at least 24 November 2026. |
| Market | Australia only. The app is geo-blocked outside Australia (`lib/geo-config.ts`), so never write for or target other countries. |
| Brand | Faceless. No founder name, face, voice or story anywhere. "We" means the Serve By Example team, and messages are signed "The Serve By Example team". |
| Proof | No customers yet, so no proof of any kind (section 3). |
| Current plan | The launch kit: https://claude.ai/artifact/6ZybP94mGQUARCKuM8tEf6 (8 carousels, 3 Reel scripts, the 14-day calendar, DM and email scripts, ads plan). Images in `~/Desktop/sbe-instagram/`. Plan runs 26 October to 8 November 2026; on 8 November the owner brings back the numbers and we plan the next two weeks. |
| Outreach | From info@servebyexample.co, sent by hand. |

Update this table after every review.

## 3. Hard stops

| If asked for | Why we don't | Offer instead |
|---|---|---|
| Testimonials, quotes from "a venue manager", customer logos, "trusted by", case studies, review screenshots, comments from fake accounts | We have no customers. Made-up proof is misleading conduct under Australian Consumer Law, and the ACCC fines businesses for fake reviews. | Product facts, the free demo, the offer terms. Real proof only once a real customer agrees in writing, and only after the owner says the rule has changed. |
| Invented or unsourced numbers: "turnover costs $5,800 a head", "cuts turnover 34%", "90% of managers get this wrong", "we analysed 500 venues", "3x faster onboarding" | `AGENTS.md`: no invented numbers. A made-up figure is a misleading claim, and it's the first thing a sharp owner checks. | A number from a named, current, checkable source, credited in the caption ("Source: ..."), or no number at all. |
| Guaranteed results: "guaranteed ROI", "halve your turnover", "pass every audit" | Australian Consumer Law, and Meta's systems flag financial and operational guarantees, which limits reach and ad accounts. | Say what the product does. The one guarantee we have is the 14-Day Performance Guarantee; quote it exactly as the home page does, and never confuse it with the 14-day free trial (`docs/MARKETING_SITE.md` section 3). |
| A feature we haven't built: video modules, an App Store or Google Play app, POS or rostering integrations | Claiming it is misleading. | What is shipped today. The app installs from the browser, not an app store. Roadmap items only as "coming", and only if `/roadmap` lists them. |
| Prices, seats or trial terms that differ from the live pricing page | Misleading pricing is the fastest way to an ACCC complaint, and the founding rate is a promise we keep. | Read `/membership` (`app/(marketing)/pricing/page.tsx`) before every pricing post. |
| The founder's face, name, voice or story | Faceless brand. | Hands, glasses, phone screens, app screens. |
| Copyrighted music on Reels | Business accounts aren't licensed for mainstream tracks; posts get muted or struck. | Meta's Sound Collection, original audio, or a track licensed for commercial use. |
| A person on camera without written consent, guests' faces, anyone under 18, a venue's name, logo or signage | Privacy and image rights, and the photo shoot promise: "Your name and signage won't appear and we won't say you're a customer." | Hands only, faces out of focus, signage cropped or blurred, written consent kept on file for anyone recognisable. |
| Stock photos or footage without a commercial licence, or another brand's logo | Copyright and trade mark. | Our own footage, our app screens (`public/shots/`), typographic slides. |
| Any tool that asks for the Instagram password, follow or unfollow bots, bought followers, likes or comments | Meta bans accounts for it, and a new account gets no second chance. | Meta Business Suite for scheduling, ManyChat connected through Meta's own login (official Messaging API). |
| A giveaway without full terms and the Instagram release line | Meta requires the release line; Australian states regulate trade promotions, and games of chance can need a state permit. | A skill-based contest ("best answer wins"), terms written out, the line "This promotion is in no way sponsored, endorsed, administered by, or associated with Instagram", and the owner checks state permit rules before it runs. |
| Content that makes heavy drinking look fun, appeals to under 18s, or jokes about serving someone drunk | We sell RSA-compliant training. Meta also restricts alcohol content, and ads showing alcohol must target 18 and over. | Humour about the job (the rush, the pass, the docket printer), never about getting guests drunk. |
| A teaching point stated as one national rule when it varies (RSA, ID, lockouts, trading hours, certificate renewal) | A wrong rule on a training brand's page undoes everything else we post. | The principle plus "check your state's rules", or content from the owner-reviewed library (section 9). |
| Naming or mocking a competitor, using their screenshots, or a comparison we can't prove | Comparative claims must be true and provable under Australian Consumer Law. | Compare against a method: "a binder in the office", "just shadow Jess tonight". |
| Paid partnerships or affiliate posts without Meta's Paid Partnership tag; realistic AI images or video of people without the AI label | Meta's branded content and AI disclosure rules. | Tag it and label it. Typographic slides and app screens need no AI label. |
| Commercial DMs or emails that hide who we are, go to private personal accounts, or ignore "stop" | The Spam Act 2003 covers commercial emails and instant messages. | Business accounts and published business addresses only, name the business, honour every "stop" within 5 working days, keep the stop list. |

## 4. Soft flags

| If asked for | What goes wrong | Better |
|---|---|---|
| Pricing or sales graphics as a regular post | Feeds that sell lose reach and followers. | Value first. At most 1 post in 8 is about the offer. Pricing lives in the bio links and a "Comment PRICING" auto-reply. |
| A link in the caption | Caption links aren't clickable on Instagram. | "Link in bio", or "Comment SOP" to trigger the DM. |
| More than 5 hashtags, or hashtags hidden in a comment | Instagram caps posts at 5. Stuffing reads as spam. | 3 to 5 specific tags at the end of the caption. |
| Square, landscape or 4:5 images for the feed | The profile grid is 3:4 and crops anything else. | 1080 x 1440 (section 6). |
| A feature update ("New: CSV import") | Nobody outside the product cares about the feature name. | The outcome: "Add your whole team in one go." |
| More than about 25 words on a slide, or body text under 36px | Unreadable on a phone. Readers swipe away. | One idea per slide, split it into more slides. |
| Engagement bait: "Like if...", "Tag 5 friends", "Comment YES" | Meta demotes explicit engagement bait. | A real question, an A, B or C quiz, or a keyword that delivers something (SOP, PRICING). |
| Posting Friday or Saturday night, Melbourne Cup day, Christmas week | Venue people are working. | Weekday afternoons around 2 pm, Sunday evenings, then follow the account's Insights. |
| Several posts a day, then nothing for a week | Instagram rewards steady posting. | 3 carousels and 1 to 2 Reels a week. |
| Boosting a post on day one | Money spent before we know what works. | Boost only a post that has already earned saves and shares organically. |
| A trending meme with no hospo angle | Reach from the wrong people, who never buy. | Trends only when they're about the job. |
| A new font, colour or layout "for variety" | The grid stops looking like one brand. | Vary the content and the slide type (section 7), not the system. |
| Generic stock photos | Looks like every other software company. | App screens, our own footage, typographic slides. |

## 5. Instagram rules for a new account

**Warm-up limits** while the account is new (first month at least):

| Action | Limit | Notes |
|---|---|---|
| Follows | 10 to 15 an hour, 100 a day at most | Never mass-unfollow. |
| DMs to people who don't follow us | Under 20 a day; our plan uses 10 to 15 | Each one written for that venue. No link in the first message. One follow-up, then stop. |
| Comments on other accounts | 3 to 5 an hour | Each written for that post. Never identical, never a pitch. The launch kit's "10 comments in 15 minutes" should be spread through the day: 3 in the morning, 4 after lunch, 3 in the evening. |
| Posting | Up to 1 feed post a day | Stories are fine daily. |

**Automation**
- ManyChat (or any tool) only through Meta's official login. Never give a tool the password.
- Automated DMs can only follow up within 24 hours of the person's last message. After that, wait for them to write again.
- A private reply to a comment must go within 7 days of the comment.

**Account safety**
- Login is info@servebyexample.co with two-factor on. The owner holds the password; agents never ask for it or handle it.
- Never paste the same DM to many venues in a short window. That is how accounts get flagged as bots.

**Disclosure**
- Paid partnerships and affiliate posts: Meta's Paid Partnership tag.
- Realistic AI images, video or voices: Instagram's AI label.
- Anyone else's content (a venue's post, a staff clip): written permission first, then credit and tag them.

## 6. Formats and specs

| Format | Size | Rules |
|---|---|---|
| Feed carousel or single image | 1080 x 1440 (3:4) | We use 3 to 7 slides. Slide 1 is the hook. Slide 2 must make sense on its own, because Instagram can show the carousel again starting there. The last slide has the one call to action. |
| Story | 1080 x 1920 (9:16) | Keep words inside the safe area: 192px clear at the top, 384px at the bottom, 120px at the right edge. |
| Reel | 1080 x 1920 (9:16), 7 to 45 seconds | The hook is on screen in the first 2 seconds. On-screen text for every line, because most people watch muted. Same safe area as stories. |
| Reel cover | 1080 x 1920 | The grid shows only the middle 1080 x 1440, so keep the headline near the centre. |
| Highlight cover | 1080 x 1920 | One centred icon or word. Covers already exist in `~/Desktop/sbe-instagram/` (hl-*.png). |

**Captions**
- The first line is the hook. Instagram cuts the rest behind "more" after about 125 characters.
- Then the value, then one call to action, then 3 to 5 hashtags. No links.
- Alt text on every image (Advanced settings): the slide's words plus what the picture shows. It helps screen readers and Instagram search.

## 7. Visual system

**Why it looks like the website, not like a generic SaaS card.** The brief this file started from suggested a slate and amber Tailwind look and a menu of ten fonts. We don't use it. Someone who taps from a post to servebyexample.co should land on something that looks like the post, and a brand-new account needs to be recognisable in half a second on a thumbnail. Social can be bolder than the site (bigger type, more dark slides), but it uses the same colours and fonts. The launch kit already set this look, so new posts must match it.

**Fonts: two, never a third.**
- Headlines: Newsreader, weight 600, the same headline font as the website.
- Everything else: Inter, weights 400 to 700.
- Fraunces and Manrope only appear inside app screenshots. Don't set slide text in them.
- Google Fonts only for artifacts (the artifact viewer blocks other font hosts; Cabinet Grotesk, for one, is not on Google Fonts and won't load).

**Colours.** The social palette is defined once, in `docs/socials/slide-template.html`. Hex values are allowed there because slides are not app code, but use only the values in that file:

| Token | Use |
|---|---|
| `--s-ground-dark` | Hook and call-to-action slides, Reel covers |
| `--s-ground-light`, `--s-card` | Content slides, answer cards |
| `--s-ink-on-dark`, `--s-soft-on-dark` | Text on dark slides |
| `--s-ink-on-light`, `--s-soft-on-light` | Text on light slides |
| `--s-green`, `--s-green-light` | Headlines on light slides, right answers |
| `--s-gold-on-dark`, `--s-gold-on-light` | Eyebrow labels, step numbers, rings. Gold is for large text and accents only; it's too low contrast for body text. |
| `--s-wrong`, `--s-wrong-light` | Wrong answers on a quiz reveal |

**Type sizes at 1080 wide:** hook 96 to 120px, slide headline 64 to 80px, body 40 to 48px, eyebrow 30px bold capitals, header and footer 30px. Nothing meant to be read under 36px except the header and footer.

**Layout:** 96px margins. Header: logo tile and "Serve By Example" on the left, "2 / 6" on the right. Footer: servebyexample.co on the left, "Swipe" with an arrow icon on the right of every slide but the last. One idea per slide.

**Slide types** (all in the template): hook (dark), numbered step (light), A, B or C quiz with a reveal (light), call to action (dark), story or Reel cover (dark, 9:16).

**Pictures:** real app screens from `public/shots/` (made by `scripts/device-mockups.mjs`) before any illustration. Icons are inline SVG from lucide. No emojis, no stock people.

## 8. Making the images

1. Copy `docs/socials/slide-template.html` to a new batch folder, `~/Desktop/sbe-instagram/<yyyy-mm-dd>/`, one HTML file per post (`p9.html`). Keep working files out of the repo.
2. Write the slides. Each `<section class="slide">` becomes one image.
3. Render: `node scripts/social-render.mjs ~/Desktop/sbe-instagram/<yyyy-mm-dd>/p9.html` writes `p9-1.png`, `p9-2.png` and so on next to the HTML, at exact size, using the brand fonts from `app/fonts/`. No network needed.
4. Look at every PNG yourself: clipped words, a single word alone on a line, contrast, the safe area on 9:16 (add `class="guides"` to `<body>` to see it, and remove it before the final render).
5. Hand the batch back as a review artifact like the launch kit: each post's slides in a sideways strip, the caption with a copy button, the alt text, the posting day and who it's for. Or add the posts to the kit itself.

App screenshots never show QA names, internal email addresses or real staff data. `scripts/device-mockups.mjs` swaps names before capture; use its output.

## 9. What to post about

**Two audiences. Every post is for one of them; label it.**
- **Buyers:** owners, venue managers and group operations people at Australian pubs, bars, bistros, clubs and hotels. They care about Friday night, RSA compliance, how long a new starter takes, and knowing who's ready. They save and they buy.
- **Staff:** bar, floor and bistro staff. They want quick wins, to look good on shift, and to laugh at the job. They share, which puts us in front of their managers.

**The mix, per 8 posts**

| Pillar | Per 8 | Examples |
|---|---|---|
| Teach | 3 | A micro SOP carousel, an A, B or C quiz, an "Instead of X, say Y" cheat sheet |
| Hospo life | 2 | "Things your new starter is too nervous to ask", the docket printer at 7 pm |
| Product in action | 2 | Sharon and her cold parmy (`/demo`), the compliance screen, a challenge from the app |
| Offer | 1 | Pricing, the free trial, the founding rate |

**Where the content comes from.** The training library is the best material we have, and the owner has already checked it. Quote it faithfully; don't "improve" its facts.
- `lib/live-guest/guests.ts`: the practice guests (Sharon is the public one, in `/demo`)
- `lib/challenges.ts` and `lib/challenge-content.ts`: quick quizzes, ready-made A, B or C posts
- `lib/questions/`, `lib/learn-cards/`, `lib/knowledge-base.ts`, `lib/cocktails.ts`, `lib/rush/`
- The free onboarding SOP at `/toolkit`

**Repurpose one idea four ways:** a carousel, a Reel script, a story quiz, and a caption. One lesson can fill a week.

**Formats that work for us**
- **Micro SOP carousel:** hook, one step a slide, "Comment SOP" at the end. High saves.
- **A, B or C quiz:** a real challenge from the app. People answer before they swipe, which drives reach. Our strongest format.
- **Cheat sheet:** "Instead of saying X, say Y." High saves.
- **Old way, new way:** compare against a method, never a competitor. Note the brief's example ("a 50-page PDF versus 90-second video modules") is wrong for us: we have no video modules. Use "a binder in the office versus 10 minutes on their phone".
- **Stat breakdown:** only with a sourced number (section 3). Parked until we have one worth using.

**Hooks that fit** (no invented numbers):
- Question: "Who trained your newest starter?"
- Direct value: "Seven things to cover before their first Friday. Save this."
- Empathy: "Short-staffed again, and a new starter on Friday? Start here."
- Quiz: "A guest says the steak is overcooked. A, B or C?"
- Counter-intuitive: "Ten minutes before every shift beats a full training day once." Spaced practice is well studied; credit a source if you add a number.
- Data hooks ("we looked at...") wait until we have our own numbers and the owner approves using them.

**Calls to action, one per post:** Save this. Send it to whoever trains your new starters. Comment SOP. Comment A, B or C. Try the two-minute demo, link in bio. 14 days free, link in bio.

## 10. Words

- Plain and warm, with a bit of pub banter: schooner, parmy, hospo, the pass, knock-off. Banter, not cringe.
- Australian English, no em or en dashes, no emojis, none of "seamless", "powerful", "unlock", "elevate" or "journey" (`AGENTS.md` section 2).
- Search every caption for `—` and `–` before handing it back.

**Facts we can state.** Check each against the live source before using it; this table goes stale.

| Fact | As of 26 October 2026 | Check in |
|---|---|---|
| Plans | Venue: A$79 a month, up to 15 staff. Group: A$149 a month, up to 35 staff. Founding rates, locked in for as long as the plan runs. | `/membership` |
| Trial | 14 days free on Venue and Group, cancel any time. The Staff plan has no trial. | `/membership` FAQ |
| Guarantee | 14-Day Performance Guarantee, exact wording only | Home page |
| Demo | Two minutes, no sign-up, at `/demo` | `/demo` |
| Practice guests | Count them; don't reuse an old number | `lib/live-guest/guests.ts` |
| Free SOP | Builds an onboarding SOP for your venue type | `/toolkit` |
| Phones | Staff train on their phones; the app installs from the browser | `docs/MOBILE_BUILD.md` |

## 11. Measuring

- **UTM links on everything:** `utm_source=instagram` with `utm_medium=bio`, `post`, `story`, `reel`, `dm` or `paid`, and `utm_campaign=<yyyy-mm>-<name>`. Email uses `utm_source=email&utm_medium=cold`.
- **What counts:** saves plus shares per 100 accounts reached. Ignore likes. Then link taps, demo plays (GA4), SOP sign-ups and trials. `docs/FUNNEL_METRICS.md` has the funnel queries.
- **No Meta Pixel on the site yet.** Adding it means wiring it into the cookie banner's consent: a code job, ask the owner first.
- **Ads:** boost only proven posts, Australia only, 18 and over, inside the owner's cap (A$100 for the launch fortnight).

## 12. Before you hand a post back

- [ ] It's for buyers or staff, and labelled.
- [ ] Someone learns or gets something without leaving Instagram.
- [ ] Every fact checked against the product or the live pricing page. Every number sourced, or removed.
- [ ] No faces without consent, no venue branding, no founder, no proof.
- [ ] 1080 x 1440, or 1080 x 1920 with words in the safe area. Body text 36px or more, 25 words or fewer a slide. Slide 2 stands alone.
- [ ] Newsreader and Inter only, colours from the template.
- [ ] Caption: hook in the first line, one call to action, no link, 3 to 5 hashtags, alt text written.
- [ ] Australian English, no `—` or `–`, no emojis.
- [ ] Audio from Meta's library. AI label on realistic AI media. Paid Partnership tag on anything paid.
- [ ] The posting day isn't a venue's busiest night.

## 13. Keep this file true

- Update section 2 after each review, and section 10 whenever prices, plans or the product change.
- Instagram changes its limits often. The numbers in sections 5 and 6 are from October 2026; when one changes, update it here and say where the new figure came from.
- When the first real customer agrees to be named, the proof rule in section 3 changes only when the owner says so.
