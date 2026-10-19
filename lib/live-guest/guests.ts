// Live Guest briefs (Rich update, Phase 6): who each guest is, what they
// want, and what calms them or sets them off. Server-only: the hidden parts
// (wants, calms, setsOff, twist, mustDo) are what the conversation tests, and
// the staff member only sees them in the reveal afterwards. The browser gets
// publicGuest() of each.
//
// The first eight guests, written from the approved module statements so the
// conversation tests what the cards and quiz teach. Phase 7 turns the 80
// Scenario Training and Arena scenarios into briefs in the same shape.
// Review copy: docs/Rich Update/live-guest-briefs.md.
import "server-only";

/** 1 fuming, 2 annoyed, 3 neutral, 4 happy, 5 delighted. */
export type Mood = 1 | 2 | 3 | 4 | 5;

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
    reviewed: true,
  },
];

export function findGuest(id: string): GuestBrief | undefined {
  return GUEST_BRIEFS.find((g) => g.id === id && g.reviewed);
}
