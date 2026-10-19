# Staff Learning Upgrade: Research and Proposal

Written 2026-10-19. Research only, no code has changed. Covers the staff app on mobile and desktop. The aim is the last product update before paid marketing starts.

The question: our first paid tester (Richie, 20 years managing venues) called training repetitive and said the app is forgotten once staff finish it. How do we make training worth paying for every month, in a way no other hospitality training platform in Australia offers?

---

## 1. The short answer

Competitors sell a **library**: hundreds of generic videos (Typsy), or a course builder (SC Training, formerly EdApp; MAPAL Flow). We can't win a library race, and we shouldn't try.

Our edge should be **practice that feels like a shift at your own venue**:

1. **A guest who talks back.** The AI Arena becomes a short live conversation (typed, then spoken) with a guest who reacts to what you say. Today it is one written answer that nobody replies to.
2. **Your menu, this week.** The manager adds this season's drinks, specials and 86'd items, and staff get drills on them the same day. A video library can't do this.
3. **Ready before the shift.** A three-minute drill built for the next shift, and a streak that counts shifts rather than calendar days, because casual staff don't work every day.
4. **Hospitality is trade-offs.** Scenarios score four things at once (guest, speed, money, safety) instead of right or wrong. That's how a shift really works, and it gives every scenario more than one sensible answer.

Underneath those four, the quiz engine has to be rebuilt. That is where most of the repetition comes from (section 2), and nothing else will feel new while it stays as it is.

---

## 2. Why it feels repetitive: what the code shows

Richie is right, and the cause is mostly mechanical, not a lack of video.

| Surface | What it does today | Why it repeats |
|---|---|---|
| **Module quiz** (`lib/verify-questions.ts`, `lib/verify-quiz.ts`) | 296 True/False statements, about 7 to 8 per module. One run cycles through the same bank **3 times**, shuffled. 5 right in a row masters the module. | You see the same sentence again within a minute, with its answer already shown. True/False is a coin flip, so a pass can be luck. Nothing is taught before the test. |
| **Scenario Training** (`trainer/trainer-data.ts`) | 40 scenarios (10 bar, 10 sales, 20 management). Every one has 2 good options and 1 bad one. | **All 40** use the same shape, and the bad option is always a strawman ("let service collapse", "serve the shots anyway"). After three or four, you can spot it without reading. |
| **AI Arena** (`lib/arena-scenarios.ts`, `/api/arena/evaluate`) | One scenario per module. Type a paragraph, get a score. | The guest never answers back. Typing a paragraph on a phone is the hardest task in the app, so it feels like homework. |
| **Challenges** (`docs/CHALLENGES.md`) | 5 games, each with **one** fixed question. | Once done, there is nothing new. The database caps it at 5. |
| **Content in general** | The same for every venue and every level. Text only, apart from cocktail photos. | An experienced bartender starts at the same basics as a first-week glassie. Nothing changes from week to week, which is the "forgotten" problem. |

**From the live database (2026-10-19, small sample):** 87 accounts, 6 people have started a module quiz, 22 quiz runs. **11 of the 22 runs were started and never finished.** It's too small to prove anything, but it fits the "repetitive" feedback: people quit partway through.

Part of what Richie felt is also **level mismatch**. A 20-year manager doing True/False on schooner sizes will find anything repetitive. The planned skill check (To_do_list.md, onboarding section) fixes this, and it belongs in this update.

---

## 3. What the research says

### Competitors (Australia first)

| Platform | What they sell | Where they're strong | The gap we can use |
|---|---|---|---|
| **Typsy** (Melbourne) | 1,000 to 1,800 short video courses with quizzes; managers assign training; subtitles in 20+ languages; about US$120 per member per year | A big studio library, awards, 4.7 on Trustpilot | Generic content, the same for every venue. Reviewers say the videos are long for frontline staff to fit into a shift, and the mobile app is weak. Watching, not practising. |
| **SC Training (formerly EdApp)** (Sydney, owned by SafetyCulture) | General mobile microlearning, hospitality courses, turns a training manual into micro-lessons | Mobile, a free tier, and SafetyCulture's distribution | Built for every industry, not for hospitality. A course builder; the manager does the work. |
| **MAPAL Flow Learning** (UK, sells into AU groups) | A hospitality LMS with video, audio, quizzes and gamification | Sells into large groups alongside the rest of MAPAL's suite | Built for enterprise groups, not small venues. Nothing found on AI practice. |
| **etrainu, Allara Global** (AU) | Compliance and onboarding courses linked to Deputy and Tanda; Allara can stop a new starter being rostered until training is done | Roster integration, compliance | Compliance boxes to tick. Little practice and little fun. |
| **Attensi RealTalk, Magpie, Strivr** (global) | AI voice roleplay and simulations; Magpie targets hotels | Spoken roleplay is real and it works | Enterprise sales and pricing. Hotels and call centres, not Australian pubs and bars. Nothing found built for small Australian venues. |

**Takeaway:** no competitor we found combines (a) Australian pub and bar content, (b) a guest who talks back, (c) the venue's own menu and (d) small-venue pricing. Each one exists somewhere on its own. Together they don't.

### Learning science we can rely on

- **Retrieval practice works.** Quizzing improves learning by about half a standard deviation (Hedges' g = 0.50 in classroom and lab meta-analyses). So keep the quizzing. The problem is the bank and the format, not testing itself.
- **Interleaving works.** Mixing topics beats doing one topic at a time (g = 0.42 across studies; d = 0.83 in a large classroom trial). Today's quiz is the opposite: one module's 8 questions, three times over. A drill that mixes beer, RSA and greetings, a few questions each, is both less repetitive and better for memory.
- **Varied practice beats the same item repeated.** Asking about the same fact in a new way (a different guest, a different drink, a different format) makes the learner recall it rather than recognise the sentence. That is the core fix for "I've seen this one".
- **Caveat:** most of this evidence comes from schools and universities, not workplaces. It's the best we have, but it isn't proof for hospitality staff.

### Engagement

- **Streaks work, and forgiveness helps.** Duolingo says letting people hold two streak freezes raised daily users without making them skip more. Busuu saw 15% more sessions in the month after adding a streak.
- **Hospitality twist:** a calendar-day streak punishes a casual who works Friday to Sunday. A streak that counts shifts (or "trained before your last 3 shifts") fits the job and isn't copied from anyone.
- **Gaming the habit:** making it easier to keep a streak raised returns but lowered real learning. So the streak should reward completing the drill, not opening the app.

### Australian rules that make training worth paying for

- **Respect@Work positive duty:** since 12 December 2023 the Human Rights Commission can enforce it, and it covers harassment of staff by **customers**. Hospitality is a high-risk industry. A module on handling harassment from guests, and the manager's record of it, is a real reason to pay.
- **Food Safety Standard 3.2.2A** (from December 2023): food handlers at Category 1 and 2 businesses must have done food safety training covering safe handling, contamination, cleaning and sanitising, and personal hygiene. FSANZ doesn't require an accredited course; councils advise keeping evidence of who has done it. **Check with a food safety adviser before we claim that any module meets the standard.**
- **NSW Responsible Gambling Officers:** since July 2024, venues with more than 20 gaming machines need one on duty. That supports the gaming module already planned in Stage 3 of "Major update".
- These sit with the certificate tracker already planned. They are less exciting than the rest of this plan, but they are what makes a manager **keep** paying.

---

## 4. The proposal

Six pieces in three phases. Each phase can ship by itself.

### Phase A. Fix the repetition (do first; no new AI costs)

**A1. New question engine for modules.**
- Replace "8 True/False × 3 rounds" with a bank of about 20 to 25 items per module in **six formats**:
  - pick the best line to say to the guest
  - multiple choice with believable wrong answers
  - put the steps in order
  - spot the mistake (in a spec, a docket or a photo)
  - a number (ml, standard drinks, temperature, dollars)
  - which glass or garnish (from a photo)
- Keep True/False for a small share only.
- **Mastery needs the right answers across at least three formats**, not five in a row from the same eight. A question you got right doesn't come back in the same run; a question you got wrong comes back later in a new form.
- Content cost: about 40 modules × 20 items = 800 items. The AI drafts the variants from each module's existing statements and explanations; **you check every one** before it goes live (it's your expertise, and AI output on RSA and food safety must be checked). About 15 to 20 hours of review.

**A2. Teach before you test: "Learn cards".**
- Each module opens with 4 to 6 swipeable cards: one rule per card, why it matters (to the guest, to the GP, to safety), and an image.
- **Images without a film crew:** one consistent illustration style for technique cards, plus real photos where we have them (the 38 cocktail photos already exist). No video in this update.
- It gives staff a reason to open a module that isn't a test, and makes a failed answer feel like "I learnt that" rather than "I got caught out".

**A3. Skill check and test-out.**
- The 5-to-8-question placement check already planned in To_do_list.md, setting each module's starting level.
- **Test-out:** any module can be mastered straight away with a short, hard mixed quiz. An experienced bartender clears the basics in one evening and moves on to the material that's new to them.

**A4. Fix the strawman scenarios.**
- Rewrite the bad option in all 40 Scenario Training items so it's something a real staff member might do (it sounds fine but costs GP, or breaks a rule quietly).
- Vary the number of options (2 to 4) and how many are right, so the pattern can't be learnt.

### Phase B. The signature experiences (what people will talk about)

**B1. "Live Guest": the Arena becomes a conversation.**
- The guest talks back. 3 to 6 turns. The guest has a hidden mood that rises or falls with what you say: deflect and they get louder; own the problem and they calm down.
- **After the conversation, show what the guest was thinking at each turn.** That reveal is the teaching moment and the part people will screenshot. We found no one else doing it.
- **Text first** (it works with today's model and routes; one call per turn, under the existing daily AI limit), **voice second.**
- **Voice:** OpenAI's realtime voice models cost roughly US$0.02 to US$0.05 a minute on the smaller model (third-party estimates; check OpenAI's pricing page before building). A two-minute call is about 5 to 10 cents. A 15-person venue doing 3 calls each a week costs about US$2 to US$5 a week, against a $79-a-month plan. It needs its own minutes cap, and its own model constant next to `CHAT_MODEL_PARAMS` in `lib/openai.ts`.
- **Why voice matters here:** on a phone, speaking is easier than typing a paragraph. Practising out loud is also how staff actually build confidence for a refusal or a complaint. And many Australian venues hire international staff, so practising English with a guest before a first shift is real value. Use the 19 languages for feedback and keep the guest in English.
- **Risks:** noise in the venue, so it needs a text fallback; a microphone permission prompt; voice recordings are personal information, so don't store audio, only the transcript and the score, and say so in the privacy policy.

**B2. "Saturday Rush": a timed service game.**
- Dockets arrive, the queue grows, the bar is three deep. You choose what to make first, what to say to the person waiting, when to call the bar-back. Scored on the four dials (B3).
- Builds on the existing Sequence Sort and Docket Reading content. **No AI cost**, works offline, can be replayed with randomised dockets, so it never runs out.
- The "game" Richie's staff would actually play on a break.

**B3. "The four dials" for every scenario.**
- Every choice moves four meters: **Guest, Speed, Money (GP), Safety and compliance.**
- Comping a drink saves the guest but costs money. Refusing service protects safety and might upset the guest. A good answer balances them; there's rarely a single right one. That gets rid of the strawman problem for good.
- Scenarios become 2 to 4 decisions that branch, so the same scenario can play out differently. One scenario written this way replaces several written the old way.
- **Money in dollars:** "a 5 ml heavy pour on 200 spirits a night is about $X a week". Managers care about GP, and it gives staff a reason that isn't "because I said so".

### Phase C. The reason to keep paying every month

**C1. Venue content: "Your menu, this week."**
- Already on the to-do list; this plan makes it central. The manager adds a spec, a special, a new tap or an 86'd item, or photographs the cocktail menu. The AI drafts 3 to 5 drill items in the new formats. **The manager approves them before staff see them** (recommended; it keeps the manager responsible for their own content).
- Staff get them in the next pre-shift drill. **Photos the manager takes are the venue's own images**, at no production cost to us.
- This is Richie's main point, and the clearest difference from a video library.

**C2. "Ready for your shift": the pre-shift drill and shift streak.**
- One button on mobile Home: a 3-minute mixed drill built from reviews due, the venue's new items and one quick scenario. It ends with "You're ready for tonight".
- **Shift streak:** counts drills done before shifts (to start, staff say when their next shift is; later, read it from Deputy or Tanda). Two freezes, so a missed week doesn't wipe it.
- Needs the reminder step already in the to-do list ("When should we remind you?"), and web push on the installed app.

**C3. Team, without the shaming.**
- No individual leaderboard ranking staff by score. It embarrasses the people who most need training, and managers in small venues won't want it.
- Instead:
  - a **venue goal** for the week (for example 300 correct answers between us)
  - a **"scenario of the week"** that the manager sends to the whole team
  - a one-page **briefing card** for the manager's pre-shift meeting: what the team got wrong this week and one line to say about it
- Training becomes something talked about on the floor, not just done on a phone.

### Not in this update

- **A video library.** Typsy has over 1,000 videos; we would lose that race and it would cost months. Manager-recorded clips can come later through C1.
- **Individual leaderboards**, for the reasons in C3.
- **3D or VR simulations** (Strivr, Attensi). Expensive, enterprise only, and they don't run on a staff member's phone between tables.
- **Certificate courses** (RSA, RCG, RSG, Food Safety Supervisor). Unchanged from "What not to build" in To_do_list.md.
- **Role paths** (Bartender, Kitchen, Gaming). Still after this work, as the "Major update" plan says. The new engine (A1, B3) makes them much cheaper to write.

---

## 5. Order, size and how we'll know it worked

| Phase | Pieces | Rough size for one developer with Claude | Main cost |
|---|---|---|---|
| A | Question engine, Learn cards, skill check and test-out, scenario rewrite | 2 to 3 weeks | Your review time for about 800 items |
| B | Live Guest (text, then voice), Saturday Rush, four dials | 3 to 4 weeks | Writing branching scenarios; voice minutes |
| C | Venue content, pre-shift drill and shift streak, team layer | 2 to 3 weeks | Web push setup |

**Suggested order for launch:** A, then B1 (text) and B3, then C1 and C2. Voice, Saturday Rush and C3 can follow the start of marketing. That puts the four headline ideas from section 1 in front of paying venues in roughly 6 to 8 weeks.

**Decide the measures before building** (record them in `docs/FUNNEL_METRICS.md`):
- Share of quiz runs finished, starting from today's baseline of 11 of 22.
- Days with training per active staff member per week.
- Share of staff still training in week 4.
- Venue content items added per venue per month (the "forgotten" problem, measured).
- **Richie does the same modules again and no longer calls them repetitive**, and at least one more venue manager agrees before we build Phase B in full (as To_do_list.md already says for big builds).

---

## 6. Research still to do before code

1. **Show it to venue managers before we build.** Make clickable mock-ups of four screens (Live Guest with the guest-thought reveal, the four dials, the pre-shift drill, venue content approval). Show them to Richie and 2 or 3 other managers. Ask which one they would pay more for, and what's missing.
2. **Price test.** Richie suggested $10 to $20 per user per month; today is about $4 to $5. Live Guest and venue content are the features that could justify a higher price. Test on new sign-ups only, as the to-do list already says.
3. **Voice in a real venue.** Try a voice prototype on a phone in a noisy bar before committing to it.
4. **Legal and compliance check** on any claim about Food Safety Standard 3.2.2A or Respect@Work before it appears on the site.
5. **Event tracking.** Add the few events the measures in section 5 need, so the first paid venues give us real numbers.

---

## 7. Decisions for you

1. **Live Guest: text first then voice (recommended), or go straight to voice?**
2. **Question review:** are you willing to spend about 15 to 20 hours checking AI-drafted items? If not, the bank has to be smaller.
3. **Images:** one illustration style made for us (recommended), photos only, or both?
4. **Venue content:** does the manager approve AI-drafted items before staff see them? (Recommended: yes.)
5. **Pricing:** should Live Guest and venue content be on every plan, or used to justify a higher price?

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
