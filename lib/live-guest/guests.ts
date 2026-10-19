// Live Guest briefs (Rich update, Phase 6): who each guest is, what they
// want, and what calms them or sets them off. Server-only: the hidden parts
// (wants, calms, setsOff, twist, mustDo) are what the conversation tests, and
// the staff member only sees them in the reveal afterwards. The browser gets
// publicGuest() of each.
//
// The first eight guests (Phase 6) were written from the approved module
// statements, so the conversation tests what the cards and quiz teach.
// Phase 7 turns the Scenario Training and Arena scenarios into briefs in the
// same shape, a batch at a time; `source` says which scenario each came from.
// The person can be a colleague (a chef, another bartender) when the scenario
// is about the team. Review copy: docs/Rich Update/live-guest-briefs.md and
// the guest-briefs-batch-* sheets, built with `npm run guests:review`.
import "server-only";

/** 1 fuming, 2 annoyed, 3 neutral, 4 happy, 5 delighted. */
export type Mood = 1 | 2 | 3 | 4 | 5;

/** A dial level, 1 to 5. Speed: 1 stalled, 5 flying. Safety: 1 unsafe, 5 safe. */
export type DialLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Something that can happen in the conversation, with what it does to the
 * venue's money. Anything given away or made again counts at cost (negative);
 * an extra sale counts at menu price (positive). Rough Australian figures.
 */
type MoneyItem = { id: string; label: string; dollars: number };

/** The dials this situation puts at stake, besides the guest's mood. */
type Stakes = {
  /** Whether the pace of service matters here. The speed dial starts at 3. */
  speed: boolean;
  /** The safety dial at the start, or null when nothing is at risk. */
  safety: DialLevel | null;
  /** Empty when money isn't at stake. */
  money: MoneyItem[];
  /** When every item is a rate, not a one-off, such as "a week". */
  moneyPer?: string;
  /** The bigger number, shown in the reveal. */
  moneyNote?: string;
};

export type GuestBrief = {
  /** Stable: stored on each conversation. Never reuse one for a different guest. */
  id: string;
  /** The module this guest practises. A pass counts for that module. */
  moduleId: number;
  name: string;
  /** Shown on the guest's card. */
  title: string;
  /** Shown before the conversation: where, when, and what the staff member can see. */
  setting: string;
  /** The guest's first line. */
  opening: string;
  startMood: Mood;
  /** 1 a gentle start, 3 hard. */
  level: 1 | 2 | 3;
  // Hidden until the reveal.
  /** Who the guest is and how they talk. */
  who: string;
  wants: string;
  calms: string[];
  setsOff: string[];
  /** Something new the guest brings in on their 2nd or 3rd reply. */
  twist: string;
  /** A standard that can't be broken. Breaking it fails the conversation whatever the mood. */
  mustDo?: string;
  goodEnding: string;
  /** The scenario this brief was written from. */
  source: string;
  stakes: Stakes;
  /** Owner has checked it. Unreviewed guests are never offered. */
  reviewed: boolean;
};

export const GUEST_BRIEFS: GuestBrief[] = [
  {
    id: "flat-schooner",
    moduleId: 1,
    name: "Dave",
    title: "The flat schooner",
    setting: "Friday, 6:30pm. The front bar is busy but moving. Dave, a regular, comes back to the bar holding a schooner that's mostly head.",
    opening: "Mate, this one's all froth and it tastes flat. Can you sort it out?",
    startMood: 2,
    level: 1,
    who: "Dave, a tradie in his 50s and a regular for years. Friendly by nature, short sentences, Aussie slang. He doesn't like a fuss and just wants a decent beer.",
    wants: "A properly poured fresh schooner, quickly, without having to argue or pay again.",
    calms: [
      "A simple apology and a fresh one poured straight away",
      "Mentioning a cold glass or pouring it properly",
      "Being quick and friendly, a bit of easy banter",
      "Using his name once he's given it",
    ],
    setsOff: [
      "Saying the beer is fine, or that's just how it pours",
      "Making him wait, or asking him to pay again",
      "Blaming the keg, the glass washer or another staff member",
      "A long technical explanation",
    ],
    twist: "Once a fresh beer is offered, he mentions his mate's beer from the same tap was the same a minute ago and asks if the keg's on its way out.",
    goodEnding: "Dave has a good fresh schooner, his mate's beer is sorted too, and he knows someone will check that tap or tell the manager.",
    source: "AI Arena, module 1",
    stakes: {
      speed: true,
      safety: null,
      money: [
        { id: "fresh-schooner", label: "A fresh schooner, on the house", dollars: -3 },
        { id: "mates-schooner", label: "His mate's beer replaced too", dollars: -3 },
      ],
    },
    reviewed: true,
  },
  {
    id: "birthday-shots",
    moduleId: 15,
    name: "Jess",
    title: "One more round",
    setting: "Saturday, 11:40pm, a busy bar. Jess has been here with friends for hours. Her speech is slurred and she bumped a bar stool getting up. She waves you over.",
    opening: "Heyyy, can we get six tequilas? It's my birthday! Come on, just one more round.",
    startMood: 4,
    level: 3,
    who: "Jess, 26, celebrating her birthday with friends. Cheerful and persuasive. She's embarrassed and then cranky if she's refused in front of her friends, but softens if she's treated with respect.",
    wants: "Shots for the group, and not to be embarrassed in front of her friends.",
    calms: [
      "Being refused kindly and quietly, without a lecture",
      "Happy birthday wishes, warmth",
      "Pointing to the law or the venue's licence, not a personal judgement of her",
      "Offering water, food, a soft drink or a mocktail",
      "Helping her friends get her home safely, such as a taxi or a ride",
    ],
    setsOff: [
      "Being called drunk loudly or in front of her friends",
      "Lecturing or sarcasm",
      "Giving in partly, such as \"just one then\"",
      "Vague answers that sound like maybe",
    ],
    twist: "After she's refused, she says her friend will order the round instead and she'll only have one.",
    mustDo: "Jess is unduly intoxicated. No alcohol can be served to her, and staff can't agree to her friend buying a drink for her. Water, food and soft drinks are fine.",
    goodEnding: "Jess accepts water or a soft drink, feels respected, and nobody serves her more alcohol.",
    source: "Scenario Training, bartending 9",
    stakes: {
      speed: false,
      safety: 2,
      money: [{ id: "soft-drinks", label: "Soft drinks or mocktails for the group instead", dollars: 30 }],
      moneyNote: "Serving an intoxicated guest can bring fines in the thousands of dollars, for the staff member and the venue, and puts the venue's licence at risk.",
    },
    reviewed: true,
  },
  {
    id: "cold-parmy",
    moduleId: 11,
    name: "Sharon",
    title: "The cold parmy",
    setting: "Thursday dinner in the bistro, steady. Sharon has just been served a chicken parmy. She's cut into it and waves you down. Her husband is already eating his meal.",
    opening: "Excuse me. This parmy's cold in the middle. I've waited 40 minutes for this.",
    startMood: 2,
    level: 2,
    who: "Sharon, in her 40s, polite but firm. She thinks the wait was too long and hates being fobbed off. She warms up when someone takes her seriously.",
    wants: "To be listened to, a hot replacement quickly, and some acknowledgement of the wait.",
    calms: [
      "Letting her finish, then a sincere apology",
      "Taking it straight back for a fresh one to be cooked",
      "Giving her an honest idea of how long it will be",
      "Thinking about her husband eating alone, and offering something sensible",
      "Checking with a manager before offering anything free",
    ],
    setsOff: [
      "Blaming the kitchen",
      "Arguing about the 40 minutes",
      "Saying it can be heated up or microwaved",
      "A sorry with nothing done about it",
      "Promising something the venue may not allow",
    ],
    twist: "She points out her husband will have finished by the time hers arrives, and asks what you're going to do about that.",
    goodEnding: "A fresh parmy is on its way with a time given, her husband's meal is handled thoughtfully, and she feels taken seriously.",
    source: "AI Arena, module 11",
    stakes: {
      speed: true,
      safety: 4,
      money: [
        { id: "fresh-parmy", label: "A fresh parmy cooked", dollars: -7 },
        { id: "on-the-house", label: "A drink or dessert on the house, approved by a manager", dollars: -4 },
      ],
    },
    reviewed: true,
  },
  {
    id: "nut-allergy",
    moduleId: 25,
    name: "Tom",
    title: "Is the pesto safe?",
    setting: "Saturday lunch, a busy restaurant. Tom is ordering for himself. The satay chicken on the menu says \"contains peanuts\". The pesto pasta has no allergy note.",
    opening: "I've got a severe nut allergy, like EpiPen severe. Is the pesto pasta okay for me?",
    startMood: 3,
    level: 3,
    who: "Tom, in his 30s, calm and precise. He's had staff guess before and it went badly, so he gets worried when staff sound unsure.",
    wants: "A straight, safe answer, and for the kitchen to actually know about his allergy.",
    calms: [
      "Not guessing: saying they'll check with the chef before confirming",
      "Knowing pesto often contains nuts",
      "Marking it on the docket and telling the kitchen directly",
      "Taking cross-contact seriously",
      "Coming back with a clear answer and a safe choice the chef has confirmed",
    ],
    setsOff: [
      "\"It should be fine\" or any guess",
      "\"The menu would say\"",
      "Asking him to tell the kitchen himself",
      "Brushing off shared equipment",
      "Rushing him",
    ],
    twist: "He asks whether the pans or the fryer are shared with the satay chicken.",
    mustDo: "Never tell Tom a dish is safe without checking with the chef. His allergy has to go to the kitchen. If the staff member says they've checked with the chef, accept what they report, as long as it's a clear answer.",
    goodEnding: "Tom knows his allergy is on the docket and the chef has been told, and he orders a dish the chef has confirmed is safe.",
    source: "AI Arena, module 25",
    stakes: { speed: false, safety: 2, money: [] },
    reviewed: true,
  },
  {
    id: "no-booking",
    moduleId: 13,
    name: "Mark",
    title: "No booking, Friday night",
    setting: "Friday, 7:30pm. The restaurant is fully booked until 9pm. Mark and his wife arrive at the host stand. There are two seats free at the bar.",
    opening: "Hi, table for two? We didn't book, but we come here all the time.",
    startMood: 3,
    level: 2,
    who: "Mark, in his 60s, comes in every month or so. Used to getting in, a little entitled but decent. His wife is hungry and he wants to look after her.",
    wants: "To eat here tonight, soon.",
    calms: [
      "Real warmth and recognising them as regulars",
      "Honesty about the wait",
      "Real options: the bar seats, a waitlist with his name and number, a later time, a drink at the bar while they wait",
      "Offering water while they decide",
    ],
    setsOff: [
      "A flat \"we're full\"",
      "Promising a table that doesn't exist",
      "Moving guests who have booked",
      "Leaving them standing with no information",
    ],
    twist: "He says he knows the owner and asks you to just squeeze them in.",
    goodEnding: "They take a real option (the bar, the waitlist or a later booking) and feel welcome, and no booked guest is bumped.",
    source: "AI Arena, module 13",
    stakes: {
      speed: false,
      safety: null,
      money: [
        { id: "bar-dinner", label: "Dinner for two at the bar tonight", dollars: 120 },
        { id: "bar-drinks", label: "Drinks at the bar while they wait", dollars: 25 },
      ],
    },
    reviewed: true,
  },
  {
    id: "out-of-shiraz",
    moduleId: 37,
    name: "Priya",
    title: "The Shiraz is gone",
    setting: "Wednesday dinner, quiet. Priya and her partner ordered a bottle of the Barossa Shiraz with their steaks. You've just found out it's sold out. Other reds on your list: a McLaren Vale Grenache, a Coonawarra Cabernet Sauvignon, a Yarra Valley Pinot Noir and the house Shiraz Cabernet.",
    opening: "Hi, just checking on that bottle of Shiraz? Our steaks will be out any minute.",
    startMood: 3,
    level: 1,
    who: "Priya, in her 30s, friendly, knows a bit about wine. Polite, and easy to win over with a good suggestion.",
    wants: "A red she'll enjoy with steak, without a fuss.",
    calms: [
      "One quick apology, then a specific alternative straight away",
      "Describing the alternative like a recommendation, not a consolation",
      "Asking what they liked about the Shiraz",
      "Knowing which wine on the list is closest",
    ],
    setsOff: [
      "Just \"we're out\" with nothing else",
      "Over-apologising",
      "Steering her to the cheapest bottle",
      "Not knowing the list, or vague answers",
    ],
    twist: "She mentions it's their anniversary, and the Shiraz is what they had on their first date.",
    goodEnding: "They happily choose a recommended alternative and feel looked after on their anniversary.",
    source: "AI Arena, module 37",
    stakes: {
      speed: true,
      safety: null,
      money: [
        { id: "similar-bottle", label: "Another bottle at a similar price", dollars: 75 },
        { id: "house-red", label: "The house red instead", dollars: 40 },
      ],
    },
    reviewed: true,
  },
  {
    id: "phone-booking",
    moduleId: 14,
    name: "Claire",
    title: "A booking for tonight",
    setting: "Saturday, 6pm, and the restaurant is filling up. The phone rings at the host stand. Tonight you can seat 8 at 7:30pm, or up to 10 at 8:15pm. The big window booth is already booked.",
    opening: "Hi, is that the restaurant? I'd like to book for tonight, eight people, around 7:30, and we'd love the big booth by the window.",
    startMood: 3,
    level: 1,
    who: "Claire, organising her sister's 40th. Chatty, a bit stressed, and wants it right.",
    wants: "A confirmed booking with the right details, and the booth if possible.",
    calms: [
      "A warm answer that names the venue",
      "Taking her name and number",
      "Reading the details back: day, time and number of people",
      "Being honest that the booth can't be promised, and noting the request",
      "Asking about the occasion or any dietary needs",
    ],
    setsOff: [
      "Promising the booth",
      "Putting her on hold for a long time",
      "Not taking her details",
      "Rushing her off the phone",
      "Getting the details wrong",
    ],
    twist: "Partway through she changes the booking to ten people, and mentions one guest is coeliac.",
    goodEnding: "The booking is confirmed at a time that fits ten, the details are read back, the coeliac guest is noted for the kitchen, and the booth request is handled honestly.",
    source: "AI Arena, module 14",
    stakes: {
      speed: true,
      safety: null,
      money: [{ id: "booking-confirmed", label: "The booking confirmed for tonight, about $60 a head", dollars: 600 }],
    },
    reviewed: true,
  },
  {
    id: "pushed-in",
    moduleId: 17,
    name: "Kyle",
    title: "Someone pushed in",
    setting: "Saturday, 10:30pm, a packed bar. Kyle is red-faced and loud, pointing at a guest who has just been served. He doesn't seem drunk, just angry.",
    opening: "Oi! That bloke just pushed in. I've been waiting ten minutes. You gonna do something or what?",
    startMood: 2,
    level: 3,
    who: "Kyle, in his 20s, frustrated and feeling disrespected. Loud but not violent at first. He calms down when he feels heard and gets worse when he's dismissed or confronted.",
    wants: "To be served, and to feel someone is being fair to him.",
    calms: [
      "A calm, steady tone",
      "Acknowledging his wait and apologising for it",
      "Not taking sides about the other guest",
      "Serving him next, or telling him exactly when",
      "Talking about the behaviour, not about him",
    ],
    setsOff: [
      "Arguing with him",
      "Telling him to calm down",
      "Threatening to throw him out straight away",
      "Ignoring him",
      "Siding with the other guest in front of him",
    ],
    twist: "On his 2nd or 3rd reply he says he'll sort the bloke out himself if nothing happens.",
    mustDo: "A threat to hurt someone must be taken seriously: the staff member calmly says they'll get security or a manager involved. Ignoring the threat, or encouraging it, is a breach.",
    goodEnding: "Kyle is served or knows he's next, the threat is handed to security or a manager calmly, and he settles down.",
    source: "AI Arena, module 17",
    stakes: { speed: true, safety: 3, money: [] },
    reviewed: true,
  },

  // ── Phase 7, batch 1: safety, compliance and money ──────────────────────
  {
    id: "glass-by-the-toilets",
    moduleId: 6,
    name: "Lou",
    title: "Glass by the toilets",
    setting: "Saturday, 8pm, a busy bistro. You're the only one on the floor, carrying three drinks to a table. A glass has smashed in a spilt drink by the entrance to the toilets. Lou is walking towards it with her young son.",
    opening: "Careful, there's glass all over the floor there. Can we get through? He's busting.",
    startMood: 3,
    level: 1,
    who: "Lou, in her 30s, out for dinner with her family. Practical and friendly, but protective of her son, who's about five and wearing thongs.",
    wants: "To get her son to the toilet safely, right now.",
    calms: [
      "Stopping them walking through the glass",
      "Putting the drinks down and marking the spill straight away, with a wet floor sign or a chair",
      "A safe way round, or another toilet they can use",
      "Calling for help or a dustpan and brush without leaving the spill unmarked",
      "Staying calm and friendly",
    ],
    setsOff: [
      "Telling her to just step around it",
      "Finishing the drinks run first",
      "Picking the glass up by hand in front of her",
      "Ignoring how urgent it is for her son",
    ],
    twist: "As you deal with it, she points out that the people at the next table are waving at you for their drinks.",
    mustDo: "The glass and the spill have to be marked or blocked off before anything else, and nobody can be told to walk through or step around it. Finishing the drinks run first is a breach.",
    goodEnding: "The spill is marked and blocked, Lou and her son get to a toilet safely, and the glass is cleaned up with a dustpan and brush before the drinks go out.",
    source: "AI Arena, module 6",
    stakes: { speed: true, safety: 2, money: [] },
    reviewed: false,
  },
  {
    id: "last-schooner",
    moduleId: 15,
    name: "Gaz",
    title: "Just one more, mate",
    setting: "Friday, 11:30pm, the public bar. Gaz, a regular, stumbles up and leans heavily on the bar. His speech is slurred. Other regulars are watching. He slaps a $50 note down.",
    opening: "Mate, just give us one more schooner of New and a shot of JD. I'm fine, I promise.",
    startMood: 3,
    level: 3,
    who: "Gaz, in his 50s, a regular for twenty years who knows everyone's name. Usually good-natured and proud. He turns sulky and loud if he feels shamed in front of the other regulars, but listens to someone who treats him with respect.",
    wants: "One more drink, and to keep his pride in front of his mates.",
    calms: [
      "Refusing quietly and respectfully, without making a scene",
      "Pointing to the law: staff can't serve him, and it isn't personal",
      "Water, a soft drink or something to eat",
      "Helping him get home safely, such as a taxi, a rideshare or a mate",
      "Making it clear he's welcome back another day",
    ],
    setsOff: [
      "Calling him drunk in front of the other regulars",
      "Lecturing him, or bringing up other nights",
      "Taking his money, or saying maybe",
      "Arguing about whether he's fine",
    ],
    twist: "Once he's refused, he asks for a light beer instead, saying it barely counts.",
    mustDo: "Gaz is unduly intoxicated. No alcohol can be served to him, light beer included, and nobody else can buy him one. Water, food and soft drinks are fine.",
    goodEnding: "Gaz has a water or a soft drink, has a safe way home, and leaves without a scene, knowing he's welcome back.",
    source: "AI Arena, module 15",
    stakes: {
      speed: false,
      safety: 2,
      money: [{ id: "soft-drink-food", label: "A soft drink and something to eat instead", dollars: 12 }],
      moneyNote: "Serving an intoxicated guest can bring fines in the thousands of dollars, for the staff member and the venue, and puts the venue's licence at risk.",
    },
    reviewed: false,
  },
  {
    id: "gf-burger",
    moduleId: 16,
    name: "Marco",
    title: "The gluten-free burger",
    setting: "Sunday lunch, and the bistro is slammed. You're about to run table 12's food when you see the gluten-free burger is on the same plate as a regular bun. Table 12 told you one of them is coeliac. Marco, the head chef, is at the pass.",
    opening: "What's the hold-up? That's twelve, it's all there. Take it, I've got six more plates going.",
    startMood: 2,
    level: 2,
    who: "Marco, the head chef, in his 40s. Good at his job and under pressure, so he's short and blunt in a rush. He respects staff who are clear and calm, and gets prickly if he feels blamed.",
    wants: "Plates off the pass and no fuss.",
    calms: [
      "Saying clearly and quietly what's wrong, and that the guest is coeliac",
      "Asking for the burger to be made again from scratch on separate equipment",
      "Not blaming him or the kitchen",
      "Offering to tell table 12 there'll be a short wait, so he can get on with it",
      "Asking how long it'll be, so the table gets an honest time",
    ],
    setsOff: [
      "Running the plate anyway",
      "Shouting about it across the kitchen",
      "Blaming him in front of the team",
      "Being vague about what's wrong",
    ],
    twist: "He tells you to just take the regular bun off and put a gluten-free one on, because they've only been touching for a second.",
    mustDo: "That plate can never go to the coeliac guest. The burger has to be made again from scratch with separate equipment. Taking the bun off, swapping it or wiping the plate is a breach.",
    goodEnding: "The burger is being made again from scratch on separate equipment, Marco is on side, and the staff member knows how long to tell table 12.",
    source: "AI Arena, module 16",
    stakes: {
      speed: true,
      safety: 2,
      money: [{ id: "remake", label: "The burger made again from scratch", dollars: -7 }],
    },
    reviewed: false,
  },
  {
    id: "fire-alarm-bag",
    moduleId: 18,
    name: "Bec",
    title: "Just grabbing my bag",
    setting: "Friday, 9pm, a busy function room upstairs. The fire alarm has just gone off and the fire warden is directing people to the fire stairs. Bec is heading back to her table, where her bag and drink are.",
    opening: "Is this a real one? I'm just grabbing my bag and finishing my wine, two secs.",
    startMood: 3,
    level: 2,
    who: "Bec, in her 20s, at a work function. Relaxed and a bit sceptical; she thinks it's probably a false alarm. She follows clear, calm instructions but argues with vague ones.",
    wants: "Her bag and phone, and not to make a fuss over what's probably nothing.",
    calms: [
      "Short, clear, calm instructions: leave everything and go now",
      "Pointing her to the fire stairs and the assembly point",
      "Treating the alarm as real",
      "A reason that makes sense: bags can be replaced, people can't",
    ],
    setsOff: [
      "Saying it's probably a false alarm",
      "Letting her go back for her things",
      "Shouting or panicking",
      "Long explanations while the alarm is going",
    ],
    twist: "She says her friend Amy went to the toilets a few minutes ago and might not have heard the alarm.",
    mustDo: "Bec has to leave now, without her bag or drink, by the fire stairs and never the lift. Nobody goes back for belongings. Someone who may be missing is reported to the fire warden; the staff member doesn't go looking alone unless the warden says to.",
    goodEnding: "Bec is on her way down the fire stairs to the assembly point without her bag, and the fire warden knows Amy may still be in the toilets.",
    source: "AI Arena, module 18",
    stakes: { speed: true, safety: 2, money: [] },
    reviewed: false,
  },
  {
    id: "till-short",
    moduleId: 19,
    name: "Sam",
    title: "A hundred short",
    setting: "2am, after close. You've done the final till count and it's $100 short. The safe isn't locked yet and the alarm isn't set. Sam, your housemate and your lift home, has come to the door.",
    opening: "You done? I've been out there twenty minutes. Can we go?",
    startMood: 3,
    level: 2,
    who: "Sam, your housemate, in his 20s. Tired and keen to get home, and he's never worked in hospitality. He means well, and comes round once he understands why it matters.",
    wants: "To go home now.",
    calms: [
      "An honest reason he has to wait a few minutes",
      "A rough time, such as ten minutes",
      "Recounting, and checking the dockets, refunds, voids and EFTPOS total",
      "Writing it up and letting the manager know before leaving",
      "Staying friendly with him",
    ],
    setsOff: [
      "No idea how long it'll take",
      "Getting snappy with him",
      "Ignoring him while he waits",
    ],
    twist: "He suggests you just put in $100 of your own money so you can both go.",
    mustDo: "The shortfall can't be ignored or hidden. The staff member recounts and checks, records it and tells the manager before leaving, then locks the safe and sets the alarm last. Covering it with their own money, or leaving with the cash or the safe unsecured, is a breach.",
    goodEnding: "The till is recounted, the shortfall is recorded and reported to the manager, the safe is locked and the alarm set, and Sam is happy to wait a few minutes.",
    source: "AI Arena, module 19",
    stakes: { speed: false, safety: 3, money: [] },
    reviewed: false,
  },
  {
    id: "mates-rates",
    moduleId: 20,
    name: "Jordo",
    title: "Drinks for his mates",
    setting: "Tuesday, after close. For a few weeks you've seen Jordo, another bartender, pour drinks for his mates without ringing them up. The manager has said the bar's numbers are down. You've asked him for a quick word.",
    opening: "Yeah, what's up? Make it quick, I'm meeting the boys.",
    startMood: 3,
    level: 3,
    who: "Jordo, in his late 20s, a popular bartender who's been at the venue for years. Easy-going, but defensive if he feels accused. He thinks a few drinks for mates is harmless.",
    wants: "To keep things easy and stay out of trouble.",
    calms: [
      "Raising it privately and calmly, with what was actually seen",
      "Why it matters: it's the venue's stock, and it shows in the numbers",
      "That free drinks need a manager's approval and go through the POS",
      "Being honest that it has to go to the manager",
      "Keeping it about the drinks, not about him as a person",
    ],
    setsOff: [
      "Calling him a thief straight away",
      "Threats",
      "Vague hints he can brush off",
      "Promising to keep it between the two of them",
    ],
    twist: "He says everyone does it and the manager knows anyway.",
    mustDo: "The staff member can't agree to keep it quiet or cover for him. Free drinks that keep going unrecorded have to reach the manager.",
    goodEnding: "Jordo knows what was seen and why it matters, agrees to ring up every drink, and knows it's going to the manager, ideally with him there.",
    source: "AI Arena, module 20",
    stakes: {
      speed: false,
      safety: null,
      money: [{ id: "rings-up", label: "Jordo rings up every drink from now on", dollars: 240 }],
      moneyPer: "a week",
      moneyNote: "Six unrung $10 drinks a shift, four shifts a week, is $240 a week, or about $12,500 a year.",
    },
    reviewed: false,
  },
  {
    id: "blind-corridor",
    moduleId: 21,
    name: "Ash",
    title: "Round the corner",
    setting: "Saturday, 7:45pm. You're carrying a tray of hot soup down the narrow corridor by the kitchen. Ash, a new food runner, steps backwards out of the kitchen door into your path. You both stop just in time.",
    opening: "Whoa! Sorry, sorry, I didn't see you there.",
    startMood: 3,
    level: 1,
    who: "Ash, 19, a new food runner in their second week. Keen, a bit flustered, and quick to feel told off.",
    wants: "Not to be in trouble, and to get on with service.",
    calms: [
      "Checking they're okay first",
      "Owning your part: you didn't call out either",
      "Explaining the calls simply: \"Behind!\" and \"Corner!\"",
      "Agreeing you'll both call out from now on",
      "Keeping it short and kind, then getting on with service",
    ],
    setsOff: [
      "Blaming them",
      "A long lecture in the corridor while the soup goes cold",
      "Snapping or swearing",
      "Acting as if the calls are only for new staff",
    ],
    twist: "They point out that you didn't call out either.",
    goodEnding: "Nobody's hurt, Ash knows the calls and why they matter, you both agree to call out every time, and the soup gets to the table hot.",
    source: "AI Arena, module 21",
    stakes: { speed: true, safety: 3, money: [] },
    reviewed: false,
  },
  {
    id: "glass-in-the-ice",
    moduleId: 22,
    name: "Tash",
    title: "Glass in the ice well",
    setting: "Friday, 10pm, and the bar is three deep. You've just heard a schooner glass shatter in the ice well. Tash, another bartender, is reaching for the scoop to fill a round of eight drinks from that well.",
    opening: "What? I'll scoop around it, it's fine. I've got eight drinks waiting.",
    startMood: 2,
    level: 2,
    who: "Tash, in her 30s, a fast, experienced bartender. Focused on the queue and impatient in a rush. She listens to a clear reason, said quickly.",
    wants: "To get her round out.",
    calms: [
      "Stopping her straight away, clearly and calmly",
      "A quick reason: shards can't be seen in ice",
      "Clean ice from another well or the machine, moved with the clean ice bucket",
      "Taking charge of burning the well yourself",
      "Helping with her round",
    ],
    setsOff: [
      "Arguing at length while the queue grows",
      "Agreeing to pick out the big pieces",
      "Saying it can wait until close",
      "Making a scene in front of the guests",
    ],
    twist: "She admits she poured two vodka sodas from that well just after the crunch, and they've gone out to a guest.",
    mustDo: "Nobody scoops from that well again. The whole well is burned with hot water straight away, and drinks poured from it after the glass broke are taken back and made again. Picking out pieces, or leaving it until close, is a breach.",
    goodEnding: "The well is being burned, the two vodka sodas are taken back and made again, and Tash's round goes out with clean ice.",
    source: "AI Arena, module 22",
    stakes: {
      speed: true,
      safety: 2,
      money: [{ id: "remade-drinks", label: "Two vodka sodas taken back and made again", dollars: -6 }],
    },
    reviewed: false,
  },
  {
    id: "glass-for-a-scoop",
    moduleId: 24,
    name: "Mia",
    title: "A glass for a scoop",
    setting: "Saturday, 9pm, a busy bar. You're the senior bartender. Mia, a new casual on her second shift, is scooping ice into a jug with a schooner glass because she can't find the scoop.",
    opening: "I couldn't find the scoop, so I'm using this. That's fine, right?",
    startMood: 3,
    level: 1,
    who: "Mia, 18, on her second shift. Eager to help and worried about getting things wrong. She remembers a reason better than a rule.",
    wants: "To keep up with the rush and not look silly.",
    calms: [
      "Stopping her kindly and quietly, away from the guests",
      "A simple reason: glass chips disappear into ice, and ice is food",
      "Showing her where the scoop lives, in its clean holder",
      "Checking the glass for chips, and burning the well if it's chipped",
      "Encouragement, then back to service",
    ],
    setsOff: [
      "Telling her off in front of guests",
      "\"It's just the rule\" with no reason",
      "Taking over without explaining",
      "Letting it go because it's busy",
    ],
    twist: "She asks whether she can just use her hand with a glove on instead.",
    mustDo: "Mia can't keep scooping with the glass, or with her hand, gloved or not. If the glass is chipped, the well has to be burned.",
    goodEnding: "Mia is using the scoop, knows why glass and hands never go in the ice, and the glass has been checked for chips.",
    source: "AI Arena, module 24",
    stakes: { speed: true, safety: 3, money: [] },
    reviewed: false,
  },
  {
    id: "heavy-hand",
    moduleId: 31,
    name: "Lachie",
    title: "A heavy hand",
    setting: "Thursday, 11pm, and the rush has just eased. All night you've watched Lachie, another bartender, free-pour spirits about 10 to 15ml over each time. The manager has said liquor costs are up and nobody knows why.",
    opening: "You've been watching me pour all night. Something wrong?",
    startMood: 3,
    level: 2,
    who: "Lachie, in his 20s, a confident bartender who learnt to free-pour at his last venue and is proud of it. Friendly, but touchy about his skills.",
    wants: "To keep pouring his way and keep the regulars happy.",
    calms: [
      "Raising it privately, without making it about his skill",
      "Real numbers: a few ml over each drink adds up to litres a night",
      "The jigger protects him too, if a guest says they were short-poured",
      "That it's venue policy, and any extra needs a manager's approval",
      "Offering to raise the costs with the manager together",
    ],
    setsOff: [
      "Accusing him of stealing",
      "Telling him he's a bad bartender",
      "Going over his head without saying anything to him first",
      "Vague hints",
    ],
    twist: "He says the regulars love his pours and tip him well for them.",
    goodEnding: "Lachie agrees to use the jigger for every pour, understands what the over-pours cost, and knows it isn't about his skill.",
    source: "AI Arena, module 31",
    stakes: {
      speed: false,
      safety: null,
      money: [{ id: "jigger", label: "Lachie uses the jigger for every pour", dollars: 500 }],
      moneyPer: "a week",
      moneyNote: "12ml over on 200 drinks a night is 2.4 litres of spirit, about $100 at cost. Over five nights, that's about $500 a week.",
    },
    reviewed: false,
  },
];

export function findGuest(id: string): GuestBrief | undefined {
  return GUEST_BRIEFS.find((g) => g.id === id && g.reviewed);
}
