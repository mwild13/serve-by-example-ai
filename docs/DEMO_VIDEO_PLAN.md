# Demo Video: The Plan and the Steps

How we make the Serve By Example demo video: a product walkthrough in MacBook and iPhone frames, on cream, with a soft Australian man's voice. Written for the owner, who has never made one before. Claude does almost all of the work; you make the choices.

**Status (7 November 2026):** made and on the site. Voice ID `SoaRWikKz4NlziP1avV9`, music option 2. The files are in `public/video/` (main 59s, 30s cut, 13s loop, poster, captions, email picture and GIF); the vertical cut for Reels is only in `~/Desktop/sbe-demo-video/out/final/`. On the site: a section under the home page hero (`DemoVideoLoop` in `components/marketing/DemoVideo.tsx`), the top of `/how-it-works`, and `/watch` for emails. Analytics events: `demo_video_open` (home, with sound) and `demo_video_play` (`/watch`, `/how-it-works`). To remake it, the Remotion project and the recording scripts are in `~/Desktop/sbe-demo-video/`.

Not the interactive click-through demo. That one is for `/demo` and is in `To_do_list.md` under **Upgrades, Interactive demo on `/demo`**.

---

## 1. What you end up with

| Version | Length | Shape | Where it goes |
|---|---|---|---|
| **Main video** | about 75 seconds | 16:9 (landscape) | The marketing page, with sound on click |
| **Email cut** | about 30 seconds | 16:9 | The link in your emails and outreach |
| **Loop** | about 15 seconds, no voice | 16:9 | Plays silently on the page, like a moving picture |
| **Vertical cut** | about 15 seconds | 9:16 (phone) | Instagram Reels and Stories |
| **Email picture** | a still and a short GIF | | The thing people click in an email |

All of them come from the same recordings and the same voice, so once the main video is done, the rest take minutes.

**The look:** the real app, never a mock-up of it. Cream background (the brand `--bg` parchment), a MacBook frame for the Manager Console and an iPhone frame for the staff app, slow zooms onto the part that matters, captions at the bottom, quiet music under the voice. No people, no AI-made footage, no stock video.

---

## 2. How it works, in one picture

```
 Script (Claude writes, you approve)
    |
 Voice (ElevenLabs reads the script in the voice you picked)
    |
 Screens (Claude drives the real app with Playwright and captures every scene)
    |
 Video (Claude builds it in Remotion: frames, cream, zooms, captions, music, timed to the voice)
    |
 You watch a preview in your browser and say what to change
    |
 Claude renders the final files and puts them on the site
```

The order matters. **The voice comes before the pictures.** Every scene is exactly as long as its line of voice, so nothing has to be squeezed to fit later.

---

## 3. Who does what

| Job | Claude | You |
|---|---|---|
| Write the script, all four versions | Yes | Read it, say yes or what to change |
| Choose the voice | Gives you a shortlist method and test lines | Listen to a few and pick one (15 minutes) |
| Make the voice files | Yes, through the ElevenLabs API | Make the ElevenLabs account and paste one key into your terminal |
| Get the demo venue looking real | Checks what's on screen, fills the gaps, asks before any change to the database | Say yes |
| Sign the app in | | Run 6 lines in the terminal (`docs/LIVE_APP_TESTING.md` section 6), leave it open |
| Record every scene | Yes, with Playwright | Nothing |
| Build the video | Yes, in Remotion | Nothing |
| Captions | Yes, from the script, timed word by word | Nothing |
| Music | Finds the right feel and fits it under the voice | Choose a track from 3 options, or say "you pick" |
| Review | Makes every change | Watch, and send notes (section 9) |
| Render, compress, put on the site, email picture | Yes | Say "push to production" when happy |

**Your total time:** about 3 to 4 hours, spread over 3 or 4 short sittings. Most of it is watching and choosing.

---

## 4. The tools, and why these

You only need **one new account: ElevenLabs.** Everything else is free and already set up, or Claude installs it.

### Claude Code (you have it)
Does the writing, the recording, the video building and the website changes.

### Playwright (already in the repo)
A tool that drives a web browser on its own: clicks, types, scrolls, takes pictures. The repo already uses it to make the mockups in `public/shots/` (`scripts/device-mockups.mjs`). That script already draws the iPhone and laptop frames, the iPhone status bar, and swaps the QA account's name for a believable one ("Sam Taylor") so no test names show. Claude builds the video recording on top of it.

**Why not record the screen by hand?** A script clicks in exactly the same place every time, never hesitates, never shows a notification, and can be run again in two minutes when the app changes.

### Remotion (free, Claude installs it)
A tool that makes videos out of code. Claude writes the code; you never open it. You watch a live preview in your browser (Remotion Studio), and every change is "tell Claude, refresh, watch". It does the cream background, the device frames, the zooms, the captions and the music, and renders the MP4 files.

- **Licence:** free for a person or a company of up to 3 people. Serve By Example qualifies.
- **Where it lives:** in its own folder, `~/Desktop/sbe-demo-video/`, outside this repo, so it can never break the website's build.

### ElevenLabs (new account, paid plan)
The AI voice. It has the most natural Australian voices available and can return the exact time of each word, which is how the captions line up perfectly.

- **Plan:** Starter (US$1 for the first month, then US$6, as of November 2026). Its 30,000 credits a month cover the whole voiceover many times over: one credit is about one character, and every version of the script together is under 2,000 characters. **The free plan does not allow commercial use**, and a marketing video is commercial use. One month is enough; cancel after if you like. The licence to use what you made stays.
- **Music:** ElevenLabs also makes music, which keeps it to one account. Check that your plan's licence covers music for commercial use. If not, Claude will suggest a licensed library track instead.

### What we're not using, and why
- **Higgsfield, Veo, Runway, Kling (AI video):** they invent the screen, and an invented app looks wrong. We have the real one.
- **Screen Studio, CapCut, Rotato:** good tools, but each is one more thing to learn. Playwright and Remotion do their jobs and Claude drives both. Keep Screen Studio in mind only as a backup (section 11).

---

## 5. The script

Draft one. Claude will tighten it with you in Step 1. A soft voice reads about 2.2 words a second, so 75 seconds is about 160 words.

### Main video (about 75 seconds, about 155 words)

| # | Time | Device | On screen | Voice |
|---|---|---|---|---|
| 1 | 0 to 9s | iPhone | Live Guest on `/demo`: Sharon's opening line appears | "It's Thursday night. Sharon's parmy is cold, and the person serving her started on Tuesday." |
| 2 | 9 to 22s | iPhone | A reply goes in, Sharon answers, her mood moves | "With Serve By Example, your new starter has already met Sharon. On their phone, before the shift. She talks back, and she gets more annoyed if they don't give her what she needs." |
| 3 | 22 to 30s | iPhone | The reveal: her thoughts, the score, the money at stake | "Every reply is scored, with what they missed and what it would have cost the venue." |
| 4 | 30 to 40s | iPhone | Three quick cuts: pre-shift drill, Saturday Rush, the modules path | "Six questions before each shift. A Saturday rush to practise under pressure. Forty modules across the bar, sales and management." |
| 5 | 40 to 50s | MacBook | Console Overview, then a zoom onto an RSA notice | "On your side, the Manager Console shows who's ready for the floor, and whose RSA is about to run out." |
| 6 | 50 to 58s | MacBook | Venue Content: a new cocktail is added, the questions appear | "Add a new cocktail or tonight's special, approve the questions it drafts, and your team is quizzed on it in their next drill." |
| 7 | 58 to 66s | MacBook | Applicant Testing report | "Hiring? Send applicants a short test before the trial shift, and see how they think." |
| 8 | 66 to 75s | Both | Laptop and phone side by side, logo, web address | "Serve By Example. Try it free for fourteen days at serve by example dot co." |

**Why this order:** the strongest moment (a guest who talks back) is first, while people are still deciding whether to keep watching. Then what the staff do every week, then what the manager gets, then the hiring tool as a second reason to buy. It ends on one action.

### Email cut (about 30 seconds, about 55 words)
Scenes 1, 2, 5 and 8, with the voice trimmed:

> "It's Thursday night. Sharon's parmy is cold, and the person serving her started on Tuesday. With Serve By Example, they've already met Sharon, on their phone, before the shift. And you can see who's ready for tonight. Serve By Example. Try it free for fourteen days at serve by example dot co."

### Loop and vertical cut (about 15 seconds)
No voice. Music and captions only, so it works with the sound off:

> "Sharon's parmy is cold." / "Your new starter has already handled her." / "Serve By Example."

### Rules the script follows
- Australian English, no em or en dashes (also in the captions).
- No numbers that aren't true of the product. "Six questions", "forty modules" and "fourteen days" are all real. No "saves X hours", no results we can't prove.
- No prices, so the video doesn't date when the founding rate ends.
- Plain words, no "seamless", "powerful" or "unlock" (`AGENTS.md` section 2).
- Numbers and the web address are written the way they're said ("fourteen", "dot co"), so the voice reads them right. The captions show them normally ("14", "servebyexample.co").

---

## 6. Choosing the voice: a soft, likeable Australian man

The voice is the brand's personality here, since there's no face. You want someone who sounds like a good venue manager on a quiet afternoon: warm, unhurried, a little smile in it. Not a radio announcer, not a sales ad.

### Find a shortlist (about 15 minutes)
1. Log in to elevenlabs.io and open **Voices**, then **Voice Library** (sometimes called Explore).
2. Set the filters:
   - **Language:** English
   - **Accent:** Australian
   - **Gender:** Male
   - **Age:** Middle aged first, then try Young
   - **Use case:** Narrative and Story, or Conversational (avoid "Advertisement", which tends to be pushy)
3. Type one of these into the search box, one at a time: `warm`, `calm`, `soft`, `friendly`, `gentle`.
4. Press play on the sample of each. Skip anyone who sounds like a movie trailer, a phone menu, or very broad ("ocker").
5. Add your 3 favourites to **My Voices** (the plus or "Add" button).

### Audition the 3 (about 10 minutes)
Open **Text to Speech**, pick each voice in turn, and paste this test line. It has the hard words in it:

> "It's Friday night. Sharon's parmy is cold, and the person serving her started on Tuesday. On your side, you can see whose RSA is about to run out. Try it free for fourteen days at serve by example dot co."

Listen for:
- **Does he say "parmy" naturally?** (PAR-mee.) A real Australian voice will.
- **"RSA"** as three letters, not a word.
- **Does he sound like he's talking to one person,** or announcing to a crowd? You want one person.
- **Would you trust him with your venue?** That's the real test.

### Settings to start from
On the right of Text to Speech, under the voice settings:

| Setting | Start at | If it sounds wrong |
|---|---|---|
| Model | Eleven Multilingual v2 | If a newer model (like v3) is offered, try it too, but go back to v2 if it starts acting or over-emoting |
| Stability | 55% | Lower if flat and robotic; higher if it wobbles or changes mood between lines |
| Similarity | 75% | Leave it |
| Style exaggeration | 10% | Keep low. Higher makes it theatrical |
| Speaker boost | On | |
| Speed | 0.95 | Slightly slower reads as softer and more confident |

### Hand it to Claude
On your chosen voice, open the three-dot menu and **Copy voice ID**. Paste it to Claude in chat. A voice ID is not a secret. The API key (Step 3) is, and never goes in chat.

---

## 7. The steps

Each step says what you do and what to tell Claude. Copy the bold lines straight into Claude Code.

### Step 0. Accounts (10 minutes, once)
1. Sign up at elevenlabs.io and take the Starter plan (section 4).
2. That's it. Nothing else to buy.

### Step 1. Approve the script (15 minutes)
Tell Claude:
> **"Read docs/DEMO_VIDEO_PLAN.md and tighten the script in section 5 with me. Check every claim against the app."**

Claude checks each line against the real product (for example, that pre-shift really is six questions), suggests tighter wording, and shows the word count against the time. Read it out loud once yourself: if a sentence makes you run out of breath, it's too long.

### Step 2. Pick the voice (25 minutes)
Do section 6. Paste the voice ID to Claude.

### Step 3. Give Claude the voice key (5 minutes)
Claude makes the voice files itself, one per scene, through ElevenLabs. It needs an API key, which works like a password.

1. In ElevenLabs, open your profile (bottom left), then **API Keys**, then **Create API Key**.
2. If it offers limits, allow **Text to Speech** only and set a small credit limit. Name it `sbe-demo-video`.
3. Copy the key. **Do not paste it into the chat.**
4. In the VS Code terminal (**Terminal**, then **New Terminal**), paste this line and press Enter:
   ```
   read -rs "ELEVENLABS_API_KEY?Paste the ElevenLabs key, then press Enter: " && export ELEVENLABS_API_KEY && echo " Key set"
   ```
5. Paste the key at the prompt and press Enter. It won't show on screen and isn't saved. It's gone when you close the terminal.
6. Claude can't see a key set in your terminal (that's the point), so you run Claude's voice script in that same terminal:
   ```
   node ~/Desktop/sbe-demo-video/voice/make-voice.mjs
   ```
   The lines and voice settings are in `~/Desktop/sbe-demo-video/voice/scenes.json`, which Claude keeps up to date. A retake of only some scenes: add their numbers, as in `node ~/Desktop/sbe-demo-video/voice/make-voice.mjs 2 5`.

It makes one file per scene, plus `full-voice.mp3` of the whole voice to listen to. If a word is wrong ("parmy" said like "palmy"), tell Claude which word; it fixes the spelling it sends, or uses ElevenLabs' pronunciation rules, and remakes only that line.

**Doing it by hand instead:** if you'd rather not use a key, paste each scene's line into Text to Speech yourself, download each as `scene-1.mp3`, `scene-2.mp3` and so on, and drop them in `~/Desktop/sbe-demo-video/voice/`. Claude takes it from there. Slower, same result, and the captions will be timed a little less exactly.

### Step 4. Sign the app in (10 minutes)
Claude needs to see the signed-in app to record it. Follow `docs/LIVE_APP_TESTING.md` section 6, steps 1 to 6 (copy and paste, one line at a time). Leave that terminal open. Then tell Claude:
> **"The app is running on localhost:3000 with the QA session. Check the demo venue has everything the video scenes need, and tell me what's missing before you change anything."**

Claude walks through every scene and reports what's empty or looks wrong. What each scene needs:

| Scene | Needs |
|---|---|
| 1 to 3 | Nothing. Sharon on `/demo` is scripted, has no AI call, and looks the same every time |
| 4 | A few modules started on the QA account, so the pre-shift drill and modules path aren't empty |
| 5 | Staff on the demo venue with recent training, and one RSA date a few days away |
| 6 | One Venue Content item (a new cocktail), with drafted questions |
| 7 | One finished applicant test report |

Claude fills gaps by **using the app as the QA account** (doing drills, adding the cocktail, sending a test to the QA address) wherever it can, so the data is real activity. For anything that needs a database change, like an RSA date, it shows you the exact change and waits for your yes. Names on screen are swapped as the mockups already do, so no internal or test names show.

### Step 5. Record the scenes (you wait, about 30 to 60 minutes)
Tell Claude:
> **"Record every scene for the demo video."**

Claude writes a recording script next to `scripts/device-mockups.mjs`, then for each scene:
- opens the right screen at iPhone size (390 wide, at 3 times sharpness) or laptop size,
- takes sharp captures of every step, plus short motion clips where something moves (Sharon's reply arriving, the Rush clock, the mood dial),
- types like a person types (not instantly), and never shows a cursor jumping.

Raw files go to `.playwright-mcp/video-raw/`, which git ignores. You don't need to watch.

### Step 6. Build the first cut (you wait, about 1 hour)
Tell Claude:
> **"Build the demo video in Remotion from the recordings and voice. Open the preview when it's ready."**

Claude sets up `~/Desktop/sbe-demo-video/`, builds the video, and starts the preview. It gives you a link like `http://localhost:3001`. Open it in Chrome: there's a play button, a timeline, and a list of the versions on the left.

### Step 7. Review (2 or 3 rounds, about 20 minutes each)
Watch the main video twice: once with sound, once muted (most people watch muted). Then send notes as in section 9. Claude changes it, you refresh, watch again. Two rounds is normal. Three is fine.

### Step 8. Music (10 minutes)
Tell Claude:
> **"Give me 3 music options for the demo video."**

Claude makes or finds 3 short options (warm, light, unhurried, like a café on a quiet morning, not a gym playlist), lays each under the voice, and you pick by number. Or say "you pick". The music sits well below the voice and dips further while he speaks.

### Step 9. Render every version (you wait, about 20 minutes)
Tell Claude:
> **"Render all versions and the email pictures."**

You get, in `~/Desktop/sbe-demo-video/out/`:
- `sbe-demo-75s.mp4`, `sbe-demo-30s.mp4`, `sbe-demo-loop-15s.mp4`, `sbe-demo-vertical-15s.mp4`
- `sbe-demo-poster.jpg` (the still shown before the video plays)
- `sbe-demo-email.jpg` and `sbe-demo-email.gif` (section 10)
- `sbe-demo-captions.vtt` (captions as a file, for accessibility)

Each MP4 is compressed to load fast (the 75-second one around 8 to 12 MB).

### Step 10. Put it on the site (Claude, then you say go)
Tell Claude:
> **"Add the demo video to the marketing site and make the /watch link for emails."**

Claude:
- copies the videos into `public/video/` (well under Cloudflare's 25 MB a file limit, so no video host is needed),
- adds the silent loop to the page, playing quietly with captions, with a "Watch with sound" button that opens the full 75-second video,
- respects people who've asked their device for less motion (they see the poster and a play button instead),
- makes `servebyexample.co/watch`, a simple page with the 30-second video and the trial button, tagged so Analytics shows which email or post sent each viewer, like the `/ig/` links,
- runs the tests, and releases it the usual way when you say **"push to production"**.

---

## 8. The look, scene by scene

So you know what "good" looks like when you review.

- **Background:** brand cream, with a very soft shadow under each device so it sits on the page rather than floating.
- **Devices:** the same frames as the mockups in `public/shots/`, drawn in CSS, so the video matches the website pictures exactly.
- **Camera:** one slow move per scene at most. A slow push in towards the thing being talked about, held while he says it, then out. Never spinning, never bouncing.
- **Zooms:** onto the one thing the voice is talking about (Sharon's mood dial, the RSA notice). If he says it, we see it.
- **Typing:** replies type in at a believable speed, so it reads as a real person using it.
- **Cuts:** a short, soft slide or fade between scenes (about a third of a second). The switch from phone to laptop at scene 5 gets a slightly longer move, because that's the turn from "your staff" to "you".
- **Captions:** centred at the bottom, white on a soft dark band, brand body font, no more than about 6 words on screen at once, appearing in time with his voice.
- **End card:** logo, "Try it free for 14 days", and `servebyexample.co`, held for 3 seconds of silence plus music so people can read it.

---

## 9. How to give feedback that works

Good notes are small and exact. In the preview, the timeline shows the time; use it.

| Instead of | Say |
|---|---|
| "It feels off" | "At 0:23 the zoom is too fast, slow it down" |
| "The voice is weird" | "At 0:41 he says RSA like 'rissa', make it R S A" |
| "Too long" | "Cut the modules shot in scene 4" |
| "Make it pop" | "The end card should stay up 2 seconds longer" |

One message with all your notes is better than one note at a time. If you can't say what's wrong, say where it is ("something about 0:30 to 0:35"), and Claude will offer two or three fixes.

**A check worth doing:** show it to one person who's never seen the product, with the sound off. Ask them afterwards "what does it do?" If they can say it in a sentence, it works.

---

## 10. Using it in emails

**Emails can't play video.** Gmail, Outlook and Apple Mail all block it. So every "video in an email" is really a picture that links to a page with the video. That's what `sbe-demo-email.jpg` and `.gif` are for.

- **The picture:** a frame from scene 1 (Sharon on the phone, on cream) with a round play button on it and "Watch the 30 second demo" underneath. People click play buttons.
- **The GIF:** the same picture with 3 seconds of movement (Sharon's line appearing). Under 1 MB. Outlook on Windows only shows the first frame, which is why the first frame is the still picture.
- **The link:** `servebyexample.co/watch` with campaign tags, so you can see in Analytics which emails got clicks, for example `https://servebyexample.co/watch?utm_source=email&utm_medium=cold&utm_campaign=2026-11-demo-video`.
- **The picture files:** `https://servebyexample.co/video/sbe-demo-email.jpg` and `https://servebyexample.co/video/sbe-demo-email.gif`, for the image in an email.
- **Alt text** (what shows if pictures are blocked): "Watch: Serve By Example in 30 seconds".

**Lines to use above the picture** (Claude can write more for each audience):
- "Thirty seconds on how your new starters can handle a complaint before their first shift."
- "Here's what your team would see on their phone, and what you'd see on yours."

**Subject lines to test:**
- "Your new starter, before their first shift"
- "30 seconds: training that happens before the rush"
- "What if Sharon's cold parmy wasn't their first complaint?"

### The outreach email (written 2026-11-07)

For venues on the outreach list, sent by hand from info@servebyexample.co. The `{...}` parts are filled in per venue. Two emails at most: this one, and the follow-up about four days later in the same thread. Then stop.

**Subject:** Your new starter, before their first shift
(Others to try: "Saw {Venue} is hiring", "Training that happens before the rush")

> Hi {first name},
>
> Saw {Venue} is hiring a {role}, so this might be good timing.
>
> Serve By Example is staff training built for Australian venues. New starters practise on their phone before their first shift, including talking to a guest whose parmy came out cold. You see who's ready for the floor and whose RSA is about to run out. And before you hire, you can send applicants a short test and see how they think.
>
> Here's 30 seconds of it:
>
> [the email GIF, linked to the /watch link]
>
> If it looks useful, you can try it free for 14 days at servebyexample.co.
>
> Cheers,
> The Serve By Example team
> servebyexample.co
>
> You're getting this because {Venue}'s business email is published on {where you found it}. Not for you? Reply "stop" and we won't email again.

**Follow-up** (about four days later, reply in the same thread):

> Hi {first name},
>
> Just in case this got buried: the 30 second video is here, {/watch link}. Or try the practice guest yourself, about a minute and no sign-up: {/demo link}
>
> Cheers,
> The Serve By Example team
>
> Not for you? Reply "stop" and we won't email again.

- **Links:** `https://servebyexample.co/watch?utm_source=email&utm_medium=cold&utm_campaign=2026-11-demo-video`, and the same tags on `/demo` in the follow-up.
- **The picture in Gmail:** Insert photo, then Web address (URL), paste `https://servebyexample.co/video/sbe-demo-email.gif`, then select the picture and add the /watch link to it.
- **Rules (Spam Act 2003, `AGENTS_SOCIALS.md`):** published business addresses only, the business is named, every "stop" honoured within 5 working days and added to the stop list.
- **"Hiring" line:** only for venues found through a current job ad; otherwise start at "Serve By Example is...".

---

## 11. If something goes wrong

| Problem | Fix |
|---|---|
| The voice sounds robotic | Lower Stability to 45%, or try the next voice on your shortlist |
| The voice wobbles or sounds different between scenes | Raise Stability to 65% and ask Claude to remake all scenes in one go |
| He says a word wrong | Tell Claude the word and how it should sound; it remakes just that line |
| Claude says the QA session has expired | Run step 5 of `docs/LIVE_APP_TESTING.md` section 6 again |
| A screen in the recording is empty or shows zeros | That's Step 4's check. Tell Claude which scene and it fixes the data or swaps the shot |
| A scene looks stiff | Ask Claude to use a motion clip instead of stills for that scene. Backup: record that one scene yourself in Screen Studio (Mac app) and Claude drops it in |
| The video is too long | Cut scene 4 to two shots, then trim scene 7. Never cut scenes 1 to 3 |
| The preview link won't open | Ask Claude to restart the Remotion preview |
| You ran out of ElevenLabs credits | The Starter plan has plenty for this; if it happens, it's usually many retakes. Wait for the monthly reset or top up |

---

## 12. Beginner tips

- **Lock the script before anything else.** Changing a line after the voice is made means remaking that line. Changing it after the edit means re-timing a scene. Cheap early, dearer later.
- **Watch it muted.** If it doesn't make sense with no sound, the captions or the pictures need work, not the voice.
- **The first 3 seconds decide everything.** That's why Sharon is first.
- **Shorter is nearly always better.** If you're unsure about a shot, cut it.
- **Don't chase perfect.** A good video live this week beats a perfect one next month. You can remake it in an afternoon once the app changes, because Claude can run the whole recording again.
- **Keep everything.** The voice files, recordings and Remotion project stay in `~/Desktop/sbe-demo-video/`, so a new version later is a few prompts, not a new project.

---

## 13. Words you'll hear

| Word | Means |
|---|---|
| **Render** | Turning the preview into a finished video file |
| **MP4** | The standard video file that plays everywhere |
| **16:9 / 9:16** | Landscape (laptop, website) / portrait (phone, Reels) |
| **Voiceover (VO)** | The voice you hear but don't see |
| **Poster** | The still picture shown before a video plays |
| **Cut** | A shorter version of the same video, or the switch between two shots |
| **Captions** | The words on screen as he speaks |
| **API key** | A password that lets Claude use your ElevenLabs account from the terminal |
| **Voice ID** | The name tag of a voice in ElevenLabs. Not secret |
| **Playwright** | The tool that drives the browser by itself to record the app |
| **Remotion** | The tool that builds the video from code |
| **Remotion Studio** | The preview page in your browser where you watch drafts |
| **Ducking** | The music getting quieter while the voice speaks |
| **UTM tags** | Labels on a link that tell Analytics where a visitor came from |

---

## 14. Ideas for later

- **One video per audience.** Same footage, a different first line: a hotel group ("Five venues, one standard"), a bar owner, a hiring manager (lead with Applicant Testing).
- **A Live Guest-only cut** for Instagram: just Sharon, 20 seconds.
- **Re-run it every few months.** When the app changes, "re-record and re-render the demo video" is one prompt.
- **Stills for social.** Any frame of the video exported as a post, so the website, the video and Instagram all look the same.
- **Captions in other languages** later, from the same script, if venues with multilingual staff ask.
