// Written "what would you do, and why" scenarios for applicant tests
// (docs/APPLICANT_TESTING.md §3), six per track; a test draws four, no two on
// one concept. The rubric and red flags are for the AI marker only
// (lib/applicant/marking.ts). Only reviewed prompts are used.
//
// Every scenario has to hold in any Australian venue: a pub, a hotel bar, a
// small bar, a restaurant, a national group. Where venues differ (who can
// approve a free drink, which ID is accepted, how an incident is written up),
// the rubric asks for the principle and credits following the venue's own
// procedure. Review sheet: `npm run applicant:review`.
import type { WrittenPrompt } from "@/lib/applicant/blueprint";

export const WRITTEN_PROMPTS: WrittenPrompt[] = [
  // ── Bar ────────────────────────────────────────────────────
  {
    id: "bar-round-of-shots",
    tracks: ["bar"],
    concept: "rsa-refusal",
    setting: "Friday, 10:30pm. A regular you get on well with comes to the bar to order a round of shots for his group of six. He is slurring, holding the bar to stay steady, and has trouble getting his card out.",
    prompt: "What do you do and say, and why?",
    rubric: [
      "Recognises the signs that he is intoxicated and that serving him is against the law, whoever he is",
      "Refuses him alcohol clearly and politely, without embarrassing him, and offers water, a soft drink or food",
      "Does not serve the round to his friends to pass to him, and watches for a mate buying on his behalf",
      "Tells the manager or duty manager and the rest of the bar team, so nobody else serves him",
      "Thinks about his safety: getting home, a friend to look after him, staying calm if he pushes back",
      "Follows the venue's procedure for recording a refusal or incident",
    ],
    redFlags: [
      "Serves him one more because he is a regular or seems harmless",
      "Serves the round to the group knowing some of it is for him",
      "Refuses in a way that shames him in front of the group, or argues with him",
    ],
    reviewed: false,
  },
  {
    id: "bar-glass-in-the-ice",
    tracks: ["bar"],
    concept: "glass-in-ice",
    setting: "Saturday night, the bar is three deep. Reaching for a glass, a colleague knocks a highball against the ice well and it chips. You can't tell if any pieces went in.",
    prompt: "Walk us through what happens next.",
    rubric: [
      "Stops anyone using that ice straight away and warns the team",
      "Treats the whole well as contaminated: empties or melts all of it, never just fishes out the visible pieces",
      "Cleans and checks the well before refilling it with fresh ice",
      "Keeps service going safely in the meantime, such as another well or a bucket of fresh ice, and tells waiting guests about a short delay",
      "Gets rid of the broken glass safely, and checks any drinks just made from that well",
    ],
    redFlags: [
      "Picks out the pieces they can see and keeps serving",
      "Carries on because the bar is too busy to stop",
    ],
    reviewed: false,
  },
  {
    id: "bar-alone-and-busy",
    tracks: ["bar"],
    concept: "pressure-priorities",
    setting: "You're alone on the bar for ten minutes while a colleague is on break. Three groups are waiting to order, a floor staff member has a docket for a table's drinks, and the bar phone starts ringing.",
    prompt: "How do you handle the next few minutes, and in what order?",
    rubric: [
      "Acknowledges everyone waiting quickly, with eye contact or a word, so they know they've been seen",
      "Serves in a fair order, by who arrived first, not the loudest or a friend",
      "Works efficiently: groups similar drinks, makes several at once, keeps their station stocked",
      "Agrees timing with the floor staff member so the table's drinks aren't forgotten",
      "Doesn't leave the bar for the phone, or asks someone else to take it",
      "Calls for help from the manager or a colleague if it keeps building, and keeps standards like measures and cleanliness",
    ],
    redFlags: [
      "Serves friends or the loudest group first",
      "Skips measuring or cutting corners on safety to go faster",
    ],
    reviewed: false,
  },
  {
    id: "bar-no-id",
    tracks: ["bar"],
    concept: "proof-of-age",
    setting: "A group in their early twenties comes to the bar. One of them looks young to you and can't produce ID. He says he left his wallet in the car, that he's 26, and that his friends can vouch for him.",
    prompt: "What do you do and say?",
    rubric: [
      "Asks for acceptable proof of age, following the law in their state and the venue's policy on which ID counts",
      "Politely declines to serve him alcohol without it, whatever his friends say",
      "Doesn't serve his friends a drink for him, and keeps an eye on the group",
      "Stays friendly and calm, offers a soft drink, and invites him back with ID",
      "Involves the manager or security if he pushes back, and applies the same rule to everyone",
    ],
    redFlags: [
      "Serves him because he seems confident or his friends vouch for him",
      "Lets a friend buy him a drink",
      "Accepts a reason or a photo of ID that the venue doesn't accept",
    ],
    reviewed: false,
  },
  {
    id: "bar-drink-you-dont-know",
    tracks: ["bar"],
    concept: "honest-knowledge",
    setting: "A guest orders a classic cocktail you've never made and don't know the recipe for. The bar is busy and the guest is clearly a cocktail fan.",
    prompt: "What do you do?",
    rubric: [
      "Is honest rather than guessing or bluffing",
      "Checks the venue's recipe or spec, or asks a colleague who knows it",
      "Talks to the guest: what they like about the drink, how long it will be, or offers something close if it can't be made",
      "Makes it properly once they know it: measured, to spec",
      "Learns it afterwards so they can make it next time",
    ],
    redFlags: [
      "Makes something up and serves it as the real thing",
      "Brushes the guest off or makes them feel awkward for asking",
    ],
    reviewed: false,
  },
  {
    id: "bar-too-weak",
    tracks: ["bar"],
    concept: "drink-complaint",
    setting: "A guest brings back a mixed drink and says it's far too weak. You made it, and you measured the spirit exactly as the venue's standard says.",
    prompt: "How do you handle it, and why?",
    rubric: [
      "Listens and stays friendly, without arguing or suggesting the guest is wrong",
      "Finds out what they'd like instead: less mixer, a different drink, or a double they pay for",
      "Keeps to standard measures rather than free pouring extra to please them, for responsible service and cost",
      "Offers a remake or a swap within what they're allowed to do, and checks with a manager before giving anything free",
      "Leaves the guest feeling looked after",
    ],
    redFlags: [
      "Argues that they poured it correctly",
      "Adds extra spirit for free to keep the guest happy",
    ],
    reviewed: false,
  },

  // ── Floor and front of house ──────────────────────────────
  {
    id: "floor-nut-allergy",
    tracks: ["floor"],
    concept: "allergy-order",
    setting: "A guest tells you she has a severe nut allergy and asks whether the pasta with pesto is safe for her. You're not sure what's in the pesto.",
    prompt: "What do you do and say, from now until her meal arrives?",
    rubric: [
      "Takes it seriously and doesn't guess or reassure her before checking",
      "Checks with the chef or kitchen and the venue's ingredient information, including the risk of contact with nuts in the kitchen",
      "Tells her honestly what they found, including when the venue can't guarantee a dish is safe, and suggests safe options",
      "Puts the allergy clearly on the order and tells the kitchen in person, following the venue's allergy procedure",
      "Makes sure the right plate reaches her, such as carrying it themselves or checking with the runner",
      "Knows what to do if she reacts: get help straight away and follow the venue's first aid procedure",
    ],
    redFlags: [
      "Says it should be fine without checking",
      "Suggests picking the nuts off or swapping the sauce without telling the kitchen about the allergy",
    ],
    reviewed: false,
  },
  {
    id: "floor-late-mains",
    tracks: ["floor"],
    concept: "service-delay",
    setting: "A table of six ordered their mains 40 minutes ago. The kitchen is behind, and the person who booked keeps looking around the room for you.",
    prompt: "What do you do, and what do you say to the table?",
    rubric: [
      "Goes to the table before being called, rather than avoiding it",
      "Gets a real update from the kitchen first, and gives an honest time, not a guess",
      "Apologises sincerely without blaming the kitchen or making excuses",
      "Offers something to help the wait within their authority, and checks with the manager before giving anything free",
      "Tells the manager, keeps checking on the table, and follows up after the meal",
    ],
    redFlags: [
      "Avoids the table until the food is ready",
      "Blames the chef or the kitchen to the guests",
      "Promises a time they don't know, or gives food or drink away without the authority to",
    ],
    reviewed: false,
  },
  {
    id: "floor-wrong-steak",
    tracks: ["floor"],
    concept: "own-mistake",
    setting: "You take a steak to a table. The guest says she ordered it rare, and it's medium. When you check the docket, you see you put it through as medium.",
    prompt: "How do you put it right?",
    rubric: [
      "Owns the mistake to the guest and apologises, without blaming anyone",
      "Takes it back and gets a fresh one cooked as she ordered it, with the kitchen told clearly that it's a priority",
      "Thinks about the rest of the table: whether they wait or start, and keeps them updated",
      "Tells the manager, who may want to offer something, rather than deciding a free item themselves",
      "Checks back once the new steak arrives",
    ],
    redFlags: [
      "Argues with the guest or tells her she ordered medium",
      "Blames the kitchen",
      "Asks her to keep it",
    ],
    reviewed: false,
  },
  {
    id: "floor-five-tables",
    tracks: ["floor"],
    concept: "section-priorities",
    setting: "Saturday, 7:45pm. In your section: a table has just been seated, one wants the bill, one is waving for more drinks, mains for another are sitting at the pass, and a fifth table is waiting for dessert menus.",
    prompt: "What do you do first, second and third, and why?",
    rubric: [
      "Gets the hot food from the pass to the table first, because it spoils and the kitchen needs the pass clear",
      "Greets or acknowledges the new table quickly, even just to say they'll be right back",
      "Moves the bill along quickly, since it frees a table and a waiting guest is unhappy",
      "Handles drinks and dessert menus in passing, or asks a colleague to help",
      "Uses the team: asks for help, lets the manager know they're stretched",
      "Keeps scanning the whole section rather than working one table at a time",
    ],
    redFlags: [
      "Leaves food sitting at the pass while they do other jobs",
      "Ignores tables without acknowledging them",
    ],
    reviewed: false,
  },
  {
    id: "floor-loud-table",
    tracks: ["floor"],
    concept: "rsa-dining",
    setting: "A table of four in the dining room has been drinking steadily. One guest is now very loud, slurring, and swearing, and the tables nearby are uncomfortable. He orders another bottle of red.",
    prompt: "What do you do, and why?",
    rubric: [
      "Recognises the signs of intoxication and that the law on responsible service applies in a dining room too",
      "Doesn't bring the bottle, and declines politely and discreetly, offering water, coffee or food",
      "Tells the manager or duty manager straight away and lets them lead if needed",
      "Thinks about the other guests' comfort and everyone's safety, including how he gets home",
      "Stays calm and respectful, avoids an argument at the table, and follows the venue's procedure for recording it",
    ],
    redFlags: [
      "Brings the bottle because the table is spending",
      "Confronts him loudly in front of the room",
    ],
    reviewed: false,
  },
  {
    id: "floor-full-tonight",
    tracks: ["floor"],
    concept: "booking-full",
    setting: "A regular rings at 4pm asking for a table for eight at 7:30 tonight. The booking system shows you're full from 6:30 to 9.",
    prompt: "How does the call go?",
    rubric: [
      "Is warm and uses their name, and checks the system properly before saying no",
      "Offers real alternatives: an earlier or later time, bar or lounge seating, splitting the group, a waitlist or another night",
      "Checks with the manager if there's any flexibility for a regular, without promising before they know",
      "Takes and reads back the details for whatever is agreed: name, number, time, numbers, any needs",
      "Ends the call with them feeling looked after even if there's no table",
    ],
    redFlags: [
      "Just says no and ends the call",
      "Promises a table that isn't there",
    ],
    reviewed: false,
  },
];
