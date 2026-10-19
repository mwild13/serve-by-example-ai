# Staff Learning Upgrade: Research and Proposal

Written 2026-10-19 and revised twice the same day after review. Everything for this update lives in `docs/Rich Update/`: this plan, the progress file `the-rich-update-10-26.md` and `LEARNING_METRICS.md`. Every decision is now made, and section 5 breaks the work into phases. No code has changed yet. It covers the staff app on mobile and desktop, and is meant to be the last product update before paid marketing starts.

The question: our first paid tester, Richie, has managed venues for 20 years. He called training repetitive and said staff forget the app once they finish it. How do we make training worth paying for every month, in a way no other hospitality training platform in Australia offers?

---

## 1. The short answer

Competitors sell a **library**: hundreds of generic videos (Typsy), or a course builder (SC Training, formerly EdApp; MAPAL Flow). We can't win a race to build a bigger library, and we shouldn't try.

Our edge should be **practice that feels like a shift at your own venue**:

1. **A guest who talks back.** Live Guest is a short conversation, typed first and spoken later, with a guest who reacts to what you say. It replaces the AI Arena, where you write one answer and nobody replies.
2. **Your menu, this week.** The manager adds this season's drinks, specials and 86'd items, and staff drill on them the same day. A video library can't do this.
3. **Ready before the shift.** A three-minute drill built for the next shift, with a streak that counts shifts rather than calendar days, because casual staff don't work every day.
4. **Hospitality is trade-offs.** During a Live Guest conversation, four dials move: guest, speed, money and safety. That's how a real shift works, and it means there's rarely one right answer.

### The new shape: three levels

| Level | What it is | What staff feel |
|---|---|---|
| **1. Learn** (beginner) | Modules: Learn cards, then a quiz on the new question engine | "I'm learning the basics" |
| **2. Drill** (intermediate) | Mixed quizzes across modules, the pre-shift drill, and the venue's own menu items | "I'm ready for tonight" |
| **3. Live Guest** (the headline feature) | A conversation with a guest who talks back. The four dials move as you talk, then you see what the guest was thinking | "That felt like a real shift" |

**Live Guest is on every venue plan (Boutique, Commercial, Enterprise), including venue trials and staff sponsored by a venue. It is not on Pro.** It's a reason to move from Pro to a venue plan.

**Scenario Training and the AI Arena are retired as screens.** Their content isn't thrown away: the 40 scenarios become Live Guest's guests, and the four dials move into the conversation (section 4).

The question engine is not a level of its own. It's what runs the quiz at Levels 1 and 2. The old True/False quiz is where most of the repetition comes from (section 2), so it can't stay in front of beginners, who are the first thing a new paying user sees.

---

## 2. Why it feels repetitive: what the code shows

Richie is right, and the cause is mostly mechanical. It isn't a lack of video.

| Surface | What it does today | Why it repeats |
|---|---|---|
| **Module quiz** (`lib/verify-questions.ts`, `lib/verify-quiz.ts`) | 320 True/False statements, 8 per module. One run cycles through the same bank **3 times**, shuffled. 5 right in a row masters the module. | You see the same sentence again within a minute, after its answer has been shown. True/False is a coin flip, so a pass can be luck. Nothing is taught before the test. |
| **Scenario Training** (`trainer/trainer-data.ts`) | 40 scenarios (10 bar, 10 sales, 20 management). Every one has 2 good options and 1 bad one. | **All 40** have the same shape, and the bad option is always an obvious wrong answer ("let service collapse", "serve the shots anyway"). After three or four, you can spot it without reading. |
| **AI Arena** (`lib/arena-scenarios.ts`, `/api/arena/evaluate`) | One scenario per module. Type a paragraph, get a score. | The guest never answers back. Typing a paragraph on a phone is the hardest task in the app, so it feels like homework. |
| **Challenges** (`docs/CHALLENGES.md`) | 5 games, each with **one** fixed question. | Once you've done them, there's nothing new. The database allows only 5. |
| **Content in general** | The same for every venue and every level. Text only, apart from cocktail photos. | An experienced bartender starts at the same basics as a first-week glassie. Nothing changes from week to week, which is why staff forget the app. |
| **The menu itself** | Modules, Rapid Fire, Scenario Training, AI Arena and Challenges sit side by side. | Most staff can't tell five practice screens apart, so none of them feels special. |

**From the live database (2026-10-19, small sample):** 87 accounts, 6 people have started a module quiz, 22 quiz runs. **11 of the 22 runs were started and never finished.** The sample is too small to prove anything, but it fits the "repetitive" feedback: people quit partway through.

Part of what Richie felt is also **level mismatch**. A manager with 20 years' experience doing True/False on schooner sizes will find anything repetitive. The skill check already planned in To_do_list.md (onboarding section) fixes this, and it belongs in this update.

---

## 3. What the research says

### Competitors (Australia first)

| Platform | What they sell | Where they're strong | The gap we can use |
|---|---|---|---|
| **Typsy** (Melbourne) | 1,000 to 1,800 short video courses with quizzes; managers assign training; subtitles in 20+ languages; about US$120 per member per year | A big studio library, awards, 4.7 on Trustpilot | Generic content, the same for every venue. Reviewers say the videos are too long to fit into a frontline shift, and the mobile app is weak. Staff watch rather than practise. |
| **SC Training (formerly EdApp)** (Sydney, owned by SafetyCulture) | General mobile microlearning, hospitality courses, turns a training manual into micro-lessons | Mobile, a free tier, and SafetyCulture's distribution | Built for every industry, not for hospitality. A course builder; the manager does the work. |
| **MAPAL Flow Learning** (UK, sells into AU groups) | A hospitality learning platform with video, audio, quizzes and gamification | Sells into large groups alongside the rest of MAPAL's suite | Built for enterprise groups, not small venues. We found nothing on AI practice. |
| **etrainu, Allara Global** (AU) | Compliance and onboarding courses linked to Deputy and Tanda; Allara can stop a new starter being rostered until training is done | Roster integration, compliance | Compliance boxes to tick. Little practice and little fun. |
| **Attensi RealTalk, Magpie, Strivr** (global) | AI voice roleplay and simulations; Magpie targets hotels | Spoken roleplay is real and it works | Enterprise sales and pricing. Built for hotels and call centres, not Australian pubs and bars. We found nothing built for small Australian venues. |

**Takeaway:** no competitor we found combines (a) Australian pub and bar content, (b) a guest who talks back, (c) the venue's own menu and (d) small-venue pricing. Each exists somewhere on its own, but not together.

### Learning science we can rely on

- **Retrieval practice works.** Quizzing improves learning by about half a standard deviation (Hedges' g = 0.50 in classroom and lab meta-analyses). So keep the quizzing. The problem is the question bank and the format, not testing itself.
- **Interleaving works.** Mixing topics beats doing one topic at a time (g = 0.42 across studies; d = 0.83 in a large classroom trial). Today's quiz does the opposite: one module's 8 questions, three times over. A drill that mixes beer, RSA and greetings, a few questions each, is less repetitive and better for memory. This is what Level 2 is for.
- **Varied practice beats repeating the same item.** Asking about the same fact in a new way (a different guest, a different drink, a different format) makes the learner recall the answer rather than recognise the sentence. That's the core fix for "I've seen this one".
- **Caveat:** most of this evidence comes from schools and universities, not workplaces. It's the best we have, but it isn't proof for hospitality staff.

### Engagement

- **Streaks work, and forgiveness helps.** Duolingo says letting people hold two streak freezes raised daily users without making them skip more. Busuu saw 15% more sessions in the month after it added a streak.
- **The hospitality twist:** a calendar-day streak punishes a casual who works Friday to Sunday. A streak that counts shifts (or "trained before your last 3 shifts") fits the job and isn't copied from anyone.
- **The streak can be gamed:** when keeping a streak got easier, people came back more often but learnt less. So the streak should reward finishing the drill, not opening the app.

### Australian rules that make training worth paying for

- **Respect@Work positive duty:** since 12 December 2023 the Australian Human Rights Commission can enforce it, and it covers harassment of staff by **customers**. Hospitality is a high-risk industry. A module on handling harassment from guests, with a record of it for the manager, is a real reason to pay.
- **Food Safety Standard 3.2.2A** (from December 2023): food handlers at Category 1 and 2 businesses must have done food safety training covering safe handling, contamination, cleaning and sanitising, and personal hygiene. FSANZ doesn't require an accredited course; councils advise keeping evidence of who has done it. **Check with a food safety adviser before we claim that any module meets the standard.**
- **NSW Responsible Gambling Officers:** since July 2024, venues with more than 20 gaming machines need one on duty. That supports the gaming module already planned in Stage 3 of "Major update".
- These sit alongside the certificate tracker already planned. They're less exciting than the rest of this plan, but they're what makes a manager **keep** paying.

---

## 4. The proposal

Three levels, plus what we retire. Each part can ship on its own.

### Level 1. Learn (beginner): modules, kept and improved

The 40 modules stay as the beginner layer. What's in them is good; the quiz is what has to change.

**1a. New question engine.**
- Replace "8 True/False × 3 rounds" with a bank of about 20 to 25 questions per module in **six formats**:
  - pick the best line to say to the guest
  - multiple choice with believable wrong answers
  - put the steps in order
  - spot the mistake (in a spec, a docket or a photo)
  - a number (ml, standard drinks, temperature, dollars)
  - which glass or garnish (from a photo)
- True/False stays, but only as a small share of the questions.
- **Each question has a difficulty.** Beginners see the easier formats first (pick the line, multiple choice). Ordering steps, spotting mistakes and numbers come in as staff improve, and at full difficulty in Level 2.
- **To master a module, you need correct answers in at least three formats**, not five in a row from the same eight. A question you got right doesn't come back in the same run. A question you got wrong comes back later in a different form.
- **Content cost:** about 40 modules × 20 questions = 800. The AI drafts the variants from each module's existing statements and explanations, and **you check every one** before it goes live. It's your expertise, and AI output on RSA and food safety has to be checked. That's about 15 to 20 hours of review.

**1b. Teach before you test: Learn cards.**
- Each module opens with 4 to 6 swipeable cards. Each card has one rule, why it matters (to the guest, to the GP, to safety), and an image.
- **Images come later, in their own phase** (see "Images" below). Cards work without them until then. No video in this update.
- The cards give staff a reason to open a module that isn't a test, and they make a wrong answer feel like "I learnt that" rather than "I got caught out".

**1c. Skill check and test-out.**
- The placement check of 5 to 8 questions already planned in To_do_list.md, which sets where each person starts.
- **Test-out:** any module can be mastered straight away with a short, hard, mixed quiz. An experienced bartender clears the basics in one evening and moves on to what's new to them.

### Level 2. Drill (intermediate): mixed practice for tonight's shift

**2a. Mixed drills.**
- Short quizzes on the same engine, mixing questions from every module the person has started or mastered, at full difficulty.
- This takes over from Rapid Fire. Mixing topics is what the research supports (section 3), and it's the opposite of today's one-module loop.

**2b. "Your menu, this week": venue content.**
- This is already on the to-do list, and this plan makes it central. The manager adds a spec, a special, a new tap or an 86'd item, or photographs the cocktail menu. The AI drafts 3 to 5 questions in the new formats. **The manager approves them before staff see them** (recommended: it keeps managers responsible for their own content).
- Staff get them in their next drill. **Photos the manager takes are the venue's own images**, so they cost us nothing to produce.
- This answers Richie's main point, and it's the clearest difference from a video library.

**2c. "Ready for your shift": the pre-shift drill and shift streak.**
- One button on mobile Home starts a 3-minute drill built from reviews that are due, the venue's new items and one short Live Guest moment. It ends with "You're ready for tonight".
- **Shift streak:** counts drills done before shifts. To start with, staff tell us when their next shift is; later we can read it from Deputy or Tanda. Two freezes, so a missed week doesn't wipe the streak.
- It needs the reminder step already on the to-do list ("When should we remind you?") and web push notifications on the installed app.

**2d. Later: "Saturday Rush", a timed service game.**
- Dockets arrive, the queue grows, the bar is three deep. You choose what to make first, what to say to the person waiting, and when to call the bar-back. Scored on the four dials.
- It builds on the existing Sequence Sort and Docket Reading content. **There's no AI cost**, it works offline, and the dockets can be randomised, so it never runs out.
- It can follow the start of marketing.

### Level 3. Live Guest: the headline feature

**3a. A conversation, not a write-up.**
- The guest talks back, over 3 to 6 turns. The guest has a hidden mood that rises or falls with what you say: deflect and they get louder; own the problem and they calm down.
- **After the conversation, show what the guest was thinking at each turn.** That reveal is the teaching moment, and the part people will screenshot. We found no one else doing it.

**3b. The four dials move during the conversation.**
- Each reply moves four meters: **Guest, Speed, Money (GP), and Safety and compliance.**
- Comping a drink saves the guest but costs money. Refusing service protects safety but might upset the guest. A good conversation balances them, and there's rarely a single right answer.
- **Money in dollars:** for example, "a 5 ml heavy pour on 200 spirits a night is about $X a week". Managers care about GP, and it gives staff a reason that isn't "because I said so".

**3c. The 40 scenarios become the guests.**
- Each Scenario Training situation ("an intoxicated guest wants shots", "a regular complains about a flat beer") becomes a guest brief: who the guest is, what they want, what calms them and what sets them off.
- The 40 Arena scenarios become guest briefs the same way. Nothing has to be written from scratch.

**3d. Open from day one; the guest gets harder as you improve.**
- **On the plans that include it, Live Guest is not locked behind Level 1.** A venue on a free trial should try it within its first ten minutes, because it's what sells the product.
- **Plans:** Boutique, Commercial and Enterprise, venue trials, and staff sponsored by a venue. Not Pro. Pro and free users see Live Guest in the menu with an upgrade prompt.
- Difficulty follows progress. A beginner gets a friendly guest with a simple request; someone who has mastered modules gets the angry regular at 11 pm.

**3e. Text first, then voice (decided).**
- **Text first.** It works with today's model and routes: one call per turn, within the existing daily AI limit.
- **Voice second.** OpenAI's realtime voice models cost roughly US$0.02 to US$0.05 a minute on the smaller model (third-party estimates; check OpenAI's pricing page before building). A two-minute call costs about 5 to 10 cents. A 15-person venue doing 3 calls each a week costs about US$2 to US$5 a week, against a $79-a-month plan. Voice needs its own cap on minutes, and its own model setting next to `CHAT_MODEL_PARAMS` in `lib/openai.ts`.
- **Why voice matters here:**
  - On a phone, speaking is easier than typing a paragraph.
  - Practising out loud is how staff build confidence for a refusal or a complaint.
  - Many Australian venues hire international staff, so practising English with a guest before a first shift is real value. Give the feedback in the person's own language (we already support 19) and keep the guest in English.
- **Risks:**
  - Venues are noisy, so voice needs a text fallback.
  - Staff have to accept a microphone permission prompt.
  - Voice recordings are personal information. Don't store audio, only the transcript and the score, and say so in the privacy policy.

**3f. The manager's numbers keep working.**
- Today the Manager Console's service score is 80% quiz mastery and 20% AI Arena passes (`syncMasteryToVenueStaff()`, `docs/MASTERY_ENGINE.md`). Live Guest passes take the Arena's place in that score, so managers don't lose anything.
- Live Guest attempts are recorded through `recordAttempt()`, like the Arena's today, so reviews and the weekly digest keep counting them.

### Images: their own phase, after the questions are written

**Why after the questions:** the questions and Learn cards tell us exactly which pictures are needed. While you review the questions, every one that needs a picture gets a short image brief ("a schooner, filled 1 cm short of the line"). Drawing before then would waste work.

**Recommendation: one illustration library, built from parts.**

- **Style:** flat illustrations with clean outlines in the brand colours (green, gold, parchment). Specific to Australian bars: schooner, pot, middy, jigger, speed rail, beer tap, ice well. Not cartoon, and not stock photos.
- **Objects and hands, no faces.**
  - It fits the faceless brand.
  - It avoids staff in one venue feeling the pictures aren't about people like them.
  - Faces are what AI image tools get most visibly wrong, and pictures of people date quickly.
  - Live Guest guests are characters in text, with a small icon at most.
- **Built from parts, as SVG code rather than picture files.** A glass, a liquid level, ice, a garnish, a label. About 60 to 80 parts combine into thousands of pictures. This is the edge:
  - **Picture questions never repeat.** The app can draw "spot the mistake" or "is this pour right?" with a different glass, level or garnish each time, so the six formats don't run out of pictures.
  - **One set of art works everywhere.** Colours come from the CSS variables, so the same picture suits the light desktop app and the dark mobile app.
  - **Tiny files**, so pages stay fast on weak venue wifi.
- **Real photos where they're better:** the 38 existing cocktail photos, and each venue's own photos through venue content (2b).
- **Accuracy matters more than polish.** A bartender will spot a schooner drawn the wrong shape straight away, so you check every part, the same way you check the questions.
- **Who draws the parts (decided): AI-drafted.** An illustrator would cost too much and take too long. The AI drafts each part, we redraw or correct it as clean SVG, and you check it. To keep the style consistent, we write a short style sheet first (line weight, colours, angle, how much detail) and draft every part against it.

### What we retire

- **Scenario Training (`stage4`) and the AI Arena (`scenarios`) as screens.** Their content moves into Live Guest (3c).
- **Rapid Fire** becomes part of Level 2's mixed drills (2a).
- **Existing progress is kept.** Old Scenario Training and Arena attempts stay in the database and still count where they count today. We hide the screens; we don't delete the data. Any migration that drops something is handed over only after the new screens are live.
- **Challenges stay as they are in this update.** They're the free taster for people who haven't paid. We'll revisit them after launch.

### Not in this update

- **A video library.** Typsy has over 1,000 videos; we'd lose that race and it would take months. Manager-recorded clips can come later through venue content (2b).
- **Individual leaderboards.** They embarrass the people who most need training, and managers of small venues won't want them.
- **3D or VR simulations** (Strivr, Attensi). Expensive, enterprise only, and they don't run on a staff member's phone between tables.
- **Certificate courses** (RSA, RCG, RSG, Food Safety Supervisor). Unchanged from "What not to build" in To_do_list.md.
- **Role paths** (Bartender, Kitchen, Gaming). These still come after this work, as the "Major update" plan says. The new question engine and Live Guest make them much cheaper to write.

### After launch: team features, without shaming anyone

- a **venue goal** for the week (for example, 300 correct answers between us)
- a **guest of the week** that the manager sends to the whole team in Live Guest
- a one-page **briefing card** for the manager's pre-shift meeting: what the team got wrong this week, and one line to say about it

These make training something staff talk about on the floor, not just something they do on a phone.

---

## 5. The phases

There are 13 phases to launch, then 3 after marketing starts. Each phase goes out on its own through the preview branch, as releases do now. Phases 3 and 9 are mostly your time, so they run alongside the build phases.

| # | Phase | Level | Rough size | Starts after |
|---|---|---|---|---|
| 1 | Groundwork: measures and event tracking | — | 2 to 3 days | — |
| 2 | Question engine | Learn | 1 to 1.5 weeks | 1 |
| 3 | Writing and reviewing the questions | Learn | 3 to 4 weeks of your time, in batches | 2 |
| 4 | Learn cards (text) | Learn | 3 to 4 days | 2 |
| 5 | Skill check and test-out | Learn | 3 to 4 days | 2, and the first batch from 3 |
| 6 | Live Guest conversation (text) | Live Guest | 1 to 1.5 weeks | 1 |
| 7 | Guest briefs, four dials and difficulty | Live Guest | 1 week | 6 |
| 8 | Plans, manager score and retiring the old screens | Live Guest | 3 to 4 days | 7 |
| 9 | Image style and library | Learn | 2 to 3 weeks | 3 |
| 10 | Mixed drills | Drill | 3 to 4 days | 3 |
| 11 | Venue content | Drill | 1 to 1.5 weeks | 2 |
| 12 | Pre-shift drill and shift streak | Drill | 1 to 1.5 weeks | 10 and 11 |
| 13 | Launch check | All | 3 to 5 days | Everything above |
| 14 | Live Guest voice | After marketing starts | 1.5 to 2 weeks | 13 |
| 15 | Saturday Rush | After marketing starts | 1 to 1.5 weeks | 13 |
| 16 | Team features | After marketing starts | 1 week | 13 |

**Time to launch:** about 10 to 12 weeks for one developer with Claude. That's longer than the 6 to 8 weeks in the earlier draft, because question review and images now have their own phases. The biggest variable is how fast the review in Phase 3 goes.

### Phase 1. Groundwork (done 2026-10-19)
- No new tracking code was needed. `verify_attempts` already records every quiz run, and `training_activity_daily` records one row per person per day trained. The queries are in `supabase/queries/learning.sql`.
- The measures and today's numbers are in `LEARNING_METRICS.md`, in this folder.
- Live Guest and venue content get their measures in the phases that build them (6 and 11), from the rows those features write.
- **Done when** today's numbers are written down, so we can tell later whether the upgrade worked.

### Phase 2. Question engine (built 2026-10-19; record in `the-rich-update-10-26.md`)
- The six formats, a difficulty on every question, and grading on the server one answer at a time, as today. The answer key stays in server-only code.
- The new mastery rule: correct answers across at least three formats. A question you got right doesn't come back in the same run; one you got wrong comes back later in another form.
- It starts with the existing 320 statements, so no module is ever empty while Phase 3 runs. The flow is the same on desktop and mobile.
- Modules people have already mastered stay mastered.
- The two picture formats (which glass or garnish; spot the mistake in a photo) are built but stay switched off until Phase 9.
- **Done when** a module can be mastered under the new rule on both desktop and mobile.

### Phase 3. Writing and reviewing the questions
- The AI drafts 20 to 25 questions per module from that module's existing statements and explanations.
- You review one category at a time (Bartending, Sales, Management), and each batch goes live once you've approved it.
- Every question is tagged with its format and difficulty. Any question that needs a picture gets a short image brief, ready for Phase 9.
- About 15 to 20 hours of your review, spread over 3 to 4 weeks.
- **Done when** every module has its full bank of questions and you've checked all of them.

### Phase 4. Learn cards
- 4 to 6 cards per module, written from the same content as the questions and checked by you.
- Each card leaves space for an image, and works without one until Phase 9.
- **Done when** every module opens with its cards on desktop and mobile.

### Phase 5. Skill check and test-out
- A placement check of 5 to 8 questions sets each person's starting difficulty.
- A short, hard test-out quiz for every module.
- **Done when** an experienced bartender can clear the basics in one evening.

### Phase 6. Live Guest conversation (text)
- 3 to 6 turns, the guest's hidden mood, and the reveal of what the guest was thinking at each turn.
- One AI call per turn, within the existing daily AI limit, using the model in `CHAT_MODEL_PARAMS`.
- Start with 6 to 8 guests and tune how they behave before writing the rest.
- Attempts are recorded through `recordAttempt()`.
- **Done when** Richie can play a full conversation on his phone and it feels like a real guest.

### Phase 7. Guest briefs, four dials and difficulty
- Turn the 40 Scenario Training situations and the 40 Arena scenarios into guest briefs, and you check each one.
- Add the four dials (Guest, Speed, Money, Safety), with the money dial shown in dollars.
- The guest gets harder as the person's mastery grows.
- **Done when** every guest brief is live and the dials move in a way you agree with.

### Phase 8. Plans, manager score and retiring the old screens
- Live Guest is on Boutique, Commercial and Enterprise, on venue trials, and for staff sponsored by a venue. Pro and free users get an upgrade prompt, and later one taster conversation (chosen in Phase 13).
- Live Guest passes replace AI Arena passes in the manager's service score.
- Scenario Training and the AI Arena are hidden on desktop and mobile, and the menu is tidied up. Their data is kept. Any migration that drops something is handed over only after the new screens are live.
- The pricing page and plan cards show Live Guest on the plans that have it.
- **Done when** nobody can reach the old screens and the manager's numbers still add up.

### Phase 9. Image style and library
- The style sheet and the base set of 60 to 80 parts, then the code that combines them. See "Images" in section 4.
- Pictures are added to Learn cards and to every question with an image brief. You check them for accuracy.
- The two picture formats are switched on.
- **Done when** every image brief from Phase 3 has its picture.

### Phase 10. Mixed drills
- Short quizzes that mix questions from every module the person has started or mastered, at full difficulty.
- They replace Rapid Fire.
- **Done when** a drill mixes at least three modules and doesn't repeat questions from the previous drill.

### Phase 11. Venue content
- The manager adds a spec, a special, a new tap or an 86'd item, or photographs the menu. The AI drafts 3 to 5 questions about it.
- **The manager approves every question before staff see it** (decided). Approval happens in the Manager Console.
- Venue plans only, since it needs a venue.
- **Done when** a manager can add an item in the evening and staff get it in their next drill.

### Phase 12. Pre-shift drill and shift streak
- One button on mobile Home: a 3-minute drill built from reviews that are due, the venue's new items and one short Live Guest moment. It ends with "You're ready for tonight".
- A shift streak with two freezes, the "When should we remind you?" step, and web push notifications on the installed app.
- **Done when** a casual who works Friday to Sunday can keep a streak going.

### Phase 13. Launch check
- Richie does the modules again, and at least one other venue manager tries the whole upgrade.
- Read the measures against the Phase 1 numbers.
- Choose which guest is the taster conversation for Pro and free users. Pick the one that best shows what a venue plan adds, based on how the guests play in testing.
- Update the privacy policy for Live Guest transcripts. Update the marketing site copy, without customer quotes or outcome figures we don't have yet.
- **Done when** Richie no longer calls it repetitive. Then marketing spend starts.

### After marketing starts
- **Phase 14, Live Guest voice:** as in 3e, on the same plans as Live Guest, with a cap on minutes. Test it on a phone in a noisy bar first.
- **Phase 15, Saturday Rush:** see 2d.
- **Phase 16, team features:** see "After launch" in section 4.

### How we'll know it worked

Recorded in `LEARNING_METRICS.md` in Phase 1:
- Share of quiz runs finished, starting from today's baseline of 11 of 22.
- Share of new venue trials where someone tries Live Guest in the first session.
- Days with training per active staff member per week.
- Share of staff still training in week 4.
- Venue content items added per venue per month (this measures the "forgotten" problem).
- Richie does the modules again and no longer calls them repetitive, and at least one more venue manager agrees (Phase 13).

---

## 6. Research to do alongside the build

1. **Show it to venue managers as it's built.** No mock-ups (decided 2026-10-19). Richie and 2 or 3 other managers try the real screens on the preview site as each phase ships.
2. **Price test.** Richie suggested $10 to $20 per user per month; today it's about $4 to $5. Live Guest and venue content are the features that could justify a higher price. Test on new sign-ups only, as the to-do list already says.
3. **Voice in a real venue,** before Phase 14.
4. **Legal and compliance check** on any claim about Food Safety Standard 3.2.2A or Respect@Work before it appears on the site.
5. **An image style sheet,** before Phase 9: line weight, colours, angle and level of detail for the AI-drafted parts.

---

## 7. Decisions

### Decided (2026-10-19)

- Three levels: **Learn** (modules), **Drill** (mixed practice and venue content), **Live Guest** (the headline feature).
- Modules stay as the beginner layer, on the new question engine.
- Scenario Training and the AI Arena are retired as screens; their content becomes Live Guest's guests.
- The four dials live inside Live Guest, not on a separate screen.
- Live Guest is open from day one on the plans that include it, and gets harder with progress instead of being locked.
- **Live Guest is text first, then voice.** Voice comes after marketing starts (Phase 14).
- **The question review is its own phase** (Phase 3), done by you.
- **Images are their own phase** (Phase 9), after the questions are written, in one illustration style built from parts.
- **The venue manager approves AI-drafted venue questions** before staff see them.
- **Live Guest is on every venue plan and not on Pro.**

- **Pro and free users get one Live Guest taster conversation.** Which guest is chosen in Phase 13, once every guest has been tested.
- **Image parts are AI-drafted**, then corrected as SVG and checked by you. No illustrator.
- **No mock-ups for Richie.** He and other managers try the real screens as each phase ships.

Nothing is open. Progress is tracked in `the-rich-update-10-26.md`, in this folder.

---

## Sources

- Typsy: [Hospitality Net supplier page](https://www.hospitalitynet.org/supplier/17023396/typsy), [Capterra AU](https://www.capterra.com.au/software/1077321/Typsy), [FitGap pricing](https://us.fitgap.com/products/typsy), [Trustpilot reviews](https://www.trustpilot.com/review/www.typsy.com?page=2)
- SC Training / EdApp: [SC Training hospitality](https://training.safetyculture.com/industry/hospitality), [acquisition report](https://news.elearninginside.com/safetyculture-acquires-edapp-for-29-million-in-bid-to-dominate-online-training-market/)
- MAPAL Flow: [Flow Learning platform](https://mapal-os.com/en/solutions/flow-learning/platform), [MAPAL blog](https://mapal-os.com/en/resources/blog/mapal-and-flow-hospitality-training-lms-a-new-era-of-workforce-development-in-hospitality)
- Roster-linked training: [Deputy and Allara Global](https://www.deputy.com/au/blog/deputy-allara-integration), [etrainu](https://etrainu.com/online-hospitality-training)
- AI roleplay: [Attensi RealTalk](https://attensi.com/products/impact/realtalk/ai-roleplay-training/), [Magpie for hotels](https://www.talktomagpie.ai/voice-ai-for-hotels), [Training Industry on AI roleplay](https://trainingindustry.com/articles/sales/why-ai-powered-role-play-is-the-future-of-sales-and-service-training/)
- Voice pricing (third-party, verify): [Forasoft](https://www.forasoft.com/article/openai-realtime-api-pricing), [aireiter](https://aireiter.com/blog/openai-realtime-api-pricing)
- Learning science: [Interleaving and retrieval review (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10950551), [Retrieval, distributed and interleaved practice in the classroom](https://research.ou.nl/en/publications/retrieval-distributed-and-interleaved-practice-in-the-classroom-a/), [Systematic review of interleaving](https://strathprints.strath.ac.uk/75711)
- Streaks: [Duolingo streak research](https://blog.duolingo.com/duolingo-streak-research/), [Sensor Tower on streaks](https://sensortower.com/blog/duolingo-streak-feature-app-engagement-growth)
- Food safety: [FSANZ food handler training](https://www.foodstandards.gov.au/business/food-safety/food-handler-training), [Brisbane City Council on 3.2.2A](https://brisbane.qld.gov.au/laws-and-permits/laws-and-permits-for-businesses/food-business-licence/food-safety/food-safety-standard-322a)
- Respect@Work: [MinterEllison](https://www.minterellison.com/articles/respect-at-work-positive-duty-guidance-launched), [DLA Piper](https://consumer.dlapiper.com/post/102ipte/australias-respect-work-act-retail-sector-in-the-spotlight)
- NSW gaming: [Liquor & Gaming NSW RGO paper](https://www.liquorandgaming.nsw.gov.au/documents/publications/Responsible-Gambling-Officer-position-paper.pdf), [NSW compliance blitz](https://www.nsw.gov.au/departments-and-agencies/dciths/departmental-media-releases/compliance-blitz-to-ensure-venues-meet-new-gaming-harm-minimisation-measures)
