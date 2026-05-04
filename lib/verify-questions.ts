export type VerifyQuestion = {
  prompt: string;
  answer: "true" | "false";
  explanation: string;
};

export const VERIFY_QUESTIONS: Record<number, VerifyQuestion[]> = {
  1: [
    {
      prompt: "A warm glass from the dishwasher ruins the beer's carbonation.",
      answer: "true",
      explanation: "Heat kills the CO2 in draught beer, resulting in a flat pour with excessive, unmanageable foam.",
    },
    {
      prompt: "You should dip the tap nozzle into the beer.",
      answer: "false",
      explanation: "Dipping the nozzle spreads bacteria and violates health codes. The tap must never touch the glass or the beer.",
    },
    {
      prompt: "A standard schooner glass holds exactly 425ml of liquid.",
      answer: "true",
      explanation: "In most Australian states (excluding SA), a schooner is the standard 425ml draught pour.",
    },
    {
      prompt: "Pouring draught beer slowly prevents excess foam from forming.",
      answer: "false",
      explanation: "Taps are designed for flow dynamics; you must open the tap fully and sharply to prevent foaming.",
    },
    {
      prompt: "The ideal head on a schooner is roughly 1.5 cm.",
      answer: "true",
      explanation: "A 1–1.5 cm head preserves the beer's carbonation and aroma without short-changing the guest on liquid.",
    },
    {
      prompt: "A dirty beer line makes the beer taste like butter.",
      answer: "true",
      explanation: "Diacetyl buildup in uncleaned draught lines creates a distinct, unpleasant buttery flavor in the beer.",
    },
    {
      prompt: "You should always hold the glass at a 45-degree angle.",
      answer: "true",
      explanation: "Starting the pour at a 45-degree angle allows the beer to flow down the side, controlling the head.",
    },
    {
      prompt: "Overflowing the beer down the sides of the glass is standard.",
      answer: "false",
      explanation: "This wastes expensive product, hits the venue's GP, and leaves a sticky glass for the guest to hold.",
    },
  ],
  2: [
    {
      prompt: "Australian Shiraz is best served chilled from the fridge.",
      answer: "false",
      explanation: "Full-bodied reds like Shiraz should be served at room temperature, ideally between 16°C and 18°C.",
    },
    {
      prompt: "A standard glass of wine is usually 150ml in Australia.",
      answer: "true",
      explanation: "A standard venue pour is 150ml, which equates to roughly 1.4 to 1.6 standard drinks.",
    },
    {
      prompt: "You must always present the bottle label to the guest.",
      answer: "true",
      explanation: "Presenting the label allows the guest to confirm they are receiving the correct vintage and varietal they ordered.",
    },
    {
      prompt: "Corked wine means there are pieces of cork in it.",
      answer: "false",
      explanation: "A corked wine suffers from TCA taint, smelling like damp cardboard or a wet dog.",
    },
    {
      prompt: "Sauvignon Blanc from Marlborough is a very dry, crisp white.",
      answer: "true",
      explanation: "This is a staple in Aussie venues, known for its high acidity and dry, passionfruit-forward profile.",
    },
    {
      prompt: "You should pop a sparkling wine cork loudly for effect.",
      answer: "false",
      explanation: "A proper sparkling opening should be a silent 'hiss' to maintain carbonation and professionalism in the dining room.",
    },
    {
      prompt: "A standard wine bottle holds exactly 750ml of liquid.",
      answer: "true",
      explanation: "The global standard for a wine bottle is 750ml, yielding exactly five 150ml glasses.",
    },
    {
      prompt: "Red wine glasses generally have larger bowls than white glasses.",
      answer: "true",
      explanation: "The larger bowl exposes more surface area to oxygen, helping bold red wines open up and release aromatics.",
    },
  ],
  3: [
    {
      prompt: "A standard spirit pour in an Australian venue is 30ml.",
      answer: "true",
      explanation: "The standard measured jigger pour across Australian bars is 30ml for a base spirit.",
    },
    {
      prompt: "You must shake a Martini to make it perfectly clear.",
      answer: "false",
      explanation: "Stirring a Martini ensures it remains crystal clear and prevents harsh ice dilution and air bubbles.",
    },
    {
      prompt: "Simple syrup is made of equal parts sugar and water.",
      answer: "true",
      explanation: "This 1:1 ratio is the fundamental sweetener used to balance acidity in almost all classic cocktails.",
    },
    {
      prompt: "Muddling mint too hard makes a Mojito taste very bitter.",
      answer: "true",
      explanation: "Crushing the mint stems releases chlorophyll, which introduces a harsh, bitter flavor to the drink.",
    },
    {
      prompt: "An Espresso Martini requires fresh hot espresso to froth properly.",
      answer: "true",
      explanation: "The oils from hot espresso interact with the shaking process to create the cocktail's signature thick crema.",
    },
    {
      prompt: "You should scoop ice using the glass to save time.",
      answer: "false",
      explanation: "Scooping with glassware is a massive WHS risk; a chip will result in burning the entire ice well.",
    },
    {
      prompt: "A classic Negroni contains gin, Campari, and sweet vermouth.",
      answer: "true",
      explanation: "This classic Italian aperitif is built using equal parts of these three specific ingredients.",
    },
    {
      prompt: "All cocktails must be served in a tall highball glass.",
      answer: "false",
      explanation: "Glassware dictates the drink's profile; coupes, rocks, and highballs all serve entirely different functional purposes.",
    },
  ],
  4: [
    {
      prompt: "Milk for a flat white should be boiled past 75°C.",
      answer: "false",
      explanation: "Milk burns and loses its natural sweetness above 65°C. Boiling it ruins the coffee entirely.",
    },
    {
      prompt: "A standard single espresso shot takes about 25 to 30 seconds.",
      answer: "true",
      explanation: "This extraction window ensures the coffee oils are balanced, preventing the shot from becoming sour or bitter.",
    },
    {
      prompt: "An Australian macchiato is just a shot with a dash of milk.",
      answer: "true",
      explanation: "A traditional Aussie macchiato is a single or double shot simply 'stained' with a dash of textured milk.",
    },
    {
      prompt: "You must purge the steam wand before and after texturing milk.",
      answer: "true",
      explanation: "Purging clears condensation before steaming and blows out trapped milk residue afterward for hygiene.",
    },
    {
      prompt: "Dark roasted beans always produce a sweeter espresso crema.",
      answer: "false",
      explanation: "Darker roasts tend to be more bitter and robust; lighter roasts generally retain more natural sweetness and acidity.",
    },
    {
      prompt: "A cappuccino has more milk foam than a flat white.",
      answer: "true",
      explanation: "A cappuccino is defined by its thick, dense layer of foam and chocolate dusting, unlike the micro-foam of a flat white.",
    },
    {
      prompt: "Soy milk textures exactly the same as full cream cow's milk.",
      answer: "false",
      explanation: "Alternative milks have lower fat and protein contents, requiring gentler aeration and lower temperatures to prevent splitting.",
    },
    {
      prompt: "The group head must be flushed between every single coffee extraction.",
      answer: "true",
      explanation: "Flushing cleans old grounds and oils from the shower screen, preventing a burnt taste in the next coffee.",
    },
  ],
  5: [
    {
      prompt: "You should always look directly at the drinks while walking.",
      answer: "false",
      explanation: "Looking at the drinks throws off your balance. Keep your eyes up to navigate through patrons safely.",
    },
    {
      prompt: "Heavy schooner glasses should be placed in the tray's center.",
      answer: "true",
      explanation: "Keeping the heaviest items in the center lowers the center of gravity, making the tray much more stable.",
    },
    {
      prompt: "Balancing the tray on your fingertips gives the most stability.",
      answer: "true",
      explanation: "Fingertips provide micro-adjustments for balance; carrying it flat on the palm makes it rigid and prone to tipping.",
    },
    {
      prompt: "Carrying three wine glasses by the rim is safe practice.",
      answer: "false",
      explanation: "Carrying by the rim is unhygienic and leaves fingerprints. Always carry stemmed glassware by the stem or base.",
    },
    {
      prompt: "You should carry a loaded drinks tray with two hands.",
      answer: "false",
      explanation: "Using two hands locks your upper body. Use your non-dominant hand to carry, leaving the other free to navigate doors.",
    },
    {
      prompt: "Clearing empty plates onto a drinks tray is highly efficient.",
      answer: "false",
      explanation: "Drinks trays are for beverages only. Mixing food scraps and glassware creates instability and hygiene cross-contamination.",
    },
    {
      prompt: "Keep your dominant hand free to open doors or guide people.",
      answer: "true",
      explanation: "A free dominant hand protects the tray from sudden bumps and allows you to move chairs in the dining room.",
    },
    {
      prompt: "Unloading a tray from one side causes it to flip.",
      answer: "true",
      explanation: "You must unload from the outside edges evenly to maintain the weight distribution and prevent the tray from catapulting.",
    },
  ],
  6: [
    {
      prompt: "You must wash your hands after handling dirty cash.",
      answer: "true",
      explanation: "Money is incredibly dirty. Handwashing prevents cross-contamination before you handle garnishes or fresh glassware.",
    },
    {
      prompt: "Spraying surface cleaner directly over the ice well is safe.",
      answer: "false",
      explanation: "Chemical spray drifts instantly. This poisons the ice and forces a mandatory melting and cleaning of the entire well.",
    },
    {
      prompt: "Broken glass in the ice well means melting the entire well.",
      answer: "true",
      explanation: "Glass in ice is invisible. The only safe WHS protocol is pouring hot water to melt the entire batch.",
    },
    {
      prompt: "Mops used in the bathrooms can be used behind the bar.",
      answer: "false",
      explanation: "This is a massive health code violation. Bathroom equipment must be color-coded and strictly separated from food/beverage areas.",
    },
    {
      prompt: "A wet floor sign must be placed over spills immediately.",
      answer: "true",
      explanation: "Slips are the number one venue injury. The hazard must be visibly marked the second it occurs.",
    },
    {
      prompt: "Warm water alone is enough to sanitize food prep areas.",
      answer: "false",
      explanation: "Warm water removes visible dirt, but food-grade chemical sanitizer is legally required to kill bacteria.",
    },
    {
      prompt: "Beer drip trays should be flushed with hot water nightly.",
      answer: "true",
      explanation: "Old beer turns into thick sludge that blocks drains and attracts fruit flies. Hot water dissolves the buildup.",
    },
    {
      prompt: "Leaving damp bar towels on the counter breeds heavy bacteria.",
      answer: "true",
      explanation: "Damp, warm cloths are perfect breeding grounds for bacteria. Towels must be rotated to the laundry frequently.",
    },
  ],
  7: [
    {
      prompt: "Glassware must be cooled before serving draught beer in it.",
      answer: "true",
      explanation: "Hot glasses from the washer cause beer to instantly foam, ruining the pour and destroying the venue's keg yield.",
    },
    {
      prompt: "Replacing empty spirit bottles is the lowest priority mid-rush.",
      answer: "false",
      explanation: "If a bartender has no base spirits, the entire bar grinds to a halt. The speed rail must remain stocked.",
    },
    {
      prompt: "Ice wells should always be filled completely to the top.",
      answer: "true",
      explanation: "Full ice wells maintain thermal mass, keeping the ice colder for longer and preventing watery cocktails.",
    },
    {
      prompt: "Changing an empty keg requires turning the gas off first.",
      answer: "true",
      explanation: "Removing a coupler under high pressure without shutting the valve can cause dangerous gas blowback or beer spray.",
    },
    {
      prompt: "Bar backs are not responsible for clearing the bar top.",
      answer: "false",
      explanation: "A bar back's job is to maintain the battlefield. Clearing dead glassware keeps the bar turning over fast.",
    },
    {
      prompt: "You should rotate fresh juices so the oldest is used first.",
      answer: "true",
      explanation: "This is First-In, First-Out (FIFO) stock rotation. It prevents fresh juice from spoiling and reduces venue wastage.",
    },
    {
      prompt: "Stacking wet glasses speeds up the drying process.",
      answer: "false",
      explanation: "Stacking wet glasses creates a vacuum seal, breaking the glass and trapping dirty moisture inside.",
    },
    {
      prompt: "Constant communication with the bartender prevents service delays.",
      answer: "true",
      explanation: "A quick 'behind you' or 'more ice coming' ensures the bartender doesn't step backwards into you during a rush.",
    },
  ],
  8: [
    {
      prompt: "You must acknowledge a new guest within three seconds.",
      answer: "true",
      explanation: "A rapid greeting, even non-verbal, tells the guest they are seen and drastically reduces their perceived wait time.",
    },
    {
      prompt: "Eye contact is not necessary if you are pouring drinks.",
      answer: "false",
      explanation: "You can easily maintain a pour while lifting your eyes to establish contact and control the bar space.",
    },
    {
      prompt: "A friendly nod counts as a valid greeting during a rush.",
      answer: "true",
      explanation: "When three-deep, a nod and a smile acknowledge the guest's presence until you are free to speak.",
    },
    {
      prompt: "You should yell a greeting across a crowded dining room.",
      answer: "false",
      explanation: "Shouting disrupts other guests' dining experience. Move closer or use polite, visible body language.",
    },
    {
      prompt: "Smiling when greeting guests sets a positive tone for service.",
      answer: "true",
      explanation: "A smile disarms frustrated guests and establishes immediate hospitality, setting the stage for a great tip.",
    },
    {
      prompt: "Ignoring waiting guests makes them think you are working hard.",
      answer: "false",
      explanation: "Ignoring guests makes them feel invisible and angry, turning a minor wait into a formal complaint.",
    },
    {
      prompt: "Saying 'I will be right with you' is highly professional.",
      answer: "true",
      explanation: "This phrase manages expectations and reassures the guest that they are next in the queue.",
    },
    {
      prompt: "A genuine welcome encourages locals to become regular patrons.",
      answer: "true",
      explanation: "Aussie pub culture is built on familiarity. A warm greeting is the first step in building a local client base.",
    },
  ],
  9: [
    {
      prompt: "You should clear entree plates while some guests are still eating.",
      answer: "false",
      explanation: "Clearing half a table makes the slower eaters feel incredibly rushed and ruins the communal dining experience.",
    },
    {
      prompt: "Approaching a table from the right side is standard practice.",
      answer: "true",
      explanation: "Traditional silver service dictates serving food from the right and clearing from the right whenever physically possible.",
    },
    {
      prompt: "Dropping the bill before the guests ask is excellent service.",
      answer: "false",
      explanation: "Unless requested, dropping the bill prematurely is a hostile move that tells the guest to get out.",
    },
    {
      prompt: "Checking back two minutes after food arrives ensures quality.",
      answer: "true",
      explanation: "This two-minute check catches undercooked steaks or missing sauces immediately, before the guest becomes angry.",
    },
    {
      prompt: "You must clear all empty glasses every time you visit the table.",
      answer: "true",
      explanation: "Consolidation is key. Never walk back to the kitchen or bar empty-handed; clear the dead wood.",
    },
    {
      prompt: "Rushing a table through their meal turns tables much faster.",
      answer: "false",
      explanation: "Guests notice when they are being rushed. It kills the tip and guarantees a negative Google review.",
    },
    {
      prompt: "Engaging with every guest at the table builds better rapport.",
      answer: "true",
      explanation: "Making eye contact with the whole table, not just the loudest person, makes everyone feel valued.",
    },
    {
      prompt: "Serving children their meals first keeps the entire table happy.",
      answer: "true",
      explanation: "Hungry kids make for stressed parents. Feeding children first ensures a peaceful dining experience for the whole table.",
    },
  ],
  10: [
    {
      prompt: "Offering a second drink before the first is empty is good.",
      answer: "true",
      explanation: "Anticipating the need prevents a break in service and boosts beverage sales effortlessly.",
    },
    {
      prompt: "You should always wait for a guest to flag you down.",
      answer: "false",
      explanation: "If a guest has to wave you over, you have already failed at anticipatory service.",
    },
    {
      prompt: "Bringing extra napkins with messy finger food is anticipatory service.",
      answer: "true",
      explanation: "Providing wet wipes or extra napkins with wings or ribs solves a messy problem before the guest asks.",
    },
    {
      prompt: "Anticipatory service means guessing what the guest wants to eat.",
      answer: "false",
      explanation: "It means anticipating their needs (water, cutlery, clearing), not forcefully dictating their meal choices.",
    },
    {
      prompt: "Recognizing a regular guest and remembering their order builds loyalty.",
      answer: "true",
      explanation: "Saying 'The usual schooner of New, mate?' makes the guest feel like a VIP and guarantees repeat business.",
    },
    {
      prompt: "You should top up water glasses without being asked.",
      answer: "true",
      explanation: "Silent, constant water top-ups are the ultimate hallmark of high-end, attentive restaurant service.",
    },
    {
      prompt: "Leaving a table alone completely ensures they enjoy their privacy.",
      answer: "false",
      explanation: "While you shouldn't hover, you must maintain visual contact to catch subtle cues that they need assistance.",
    },
    {
      prompt: "Offering a dessert menu as plates are cleared increases sales.",
      answer: "true",
      explanation: "Striking while the iron is hot captures impulse dessert or coffee sales before they decide they are too full.",
    },
  ],
  11: [
    {
      prompt: "You should instantly apologize and validate the guest's frustration.",
      answer: "true",
      explanation: "An immediate, empathetic apology diffuses anger. They need to know you are on their side to fix the problem.",
    },
    {
      prompt: "Blaming the kitchen calms the guest down much faster.",
      answer: "false",
      explanation: "Throwing chefs under the bus makes the venue look disorganized and unprofessional. Take ownership as a team.",
    },
    {
      prompt: "Offering a free drink is a good initial service recovery step.",
      answer: "true",
      explanation: "A complimentary beer or soft drink gives them something to do while waiting for a remade meal.",
    },
    {
      prompt: "Arguing with a complaining guest proves that you are right.",
      answer: "false",
      explanation: "Even if you win the argument, you lose the customer. It escalates the situation into a public scene.",
    },
    {
      prompt: "Following up after fixing the issue ensures total guest satisfaction.",
      answer: "true",
      explanation: "Checking in on a remade steak proves that you genuinely care about their experience, closing the recovery loop.",
    },
    {
      prompt: "A cold parmy should be microwaved and given straight back.",
      answer: "false",
      explanation: "Microwaving ruins the food quality. A cold main meal must be completely refired by the kitchen.",
    },
    {
      prompt: "Listening actively without interrupting diffuses most angry guest situations.",
      answer: "true",
      explanation: "Often, guests just want to be heard. Let them finish venting before you offer a concrete solution.",
    },
    {
      prompt: "You must tell the manager about all serious food complaints.",
      answer: "true",
      explanation: "Managers must be aware of food quality trends so they can address systemic issues with the Head Chef.",
    },
  ],
  12: [
    {
      prompt: "Suggesting a premium local gin instead of house pour is up-selling.",
      answer: "true",
      explanation: "Moving a guest from a standard item to a higher-margin, premium product is the definition of up-selling.",
    },
    {
      prompt: "Up-selling means forcing the guest to buy the most expensive item.",
      answer: "false",
      explanation: "Hard-selling ruins trust. Up-selling should be conversational and enhance their experience, not manipulate their wallet.",
    },
    {
      prompt: "Asking if they want fries with their steak is suggestive selling.",
      answer: "true",
      explanation: "Suggesting complementary side dishes to attach to a main order is classic, effective suggestive selling.",
    },
    {
      prompt: "You should never suggest a wine pairing for a meal.",
      answer: "false",
      explanation: "Recommending a bold Shiraz with a ribeye elevates the meal and significantly increases the table's spend.",
    },
    {
      prompt: "Offering a larger size beer is an easy up-sell technique.",
      answer: "true",
      explanation: "Asking 'Make that a pint?' instead of assuming a schooner is the easiest revenue boost in a pub.",
    },
    {
      prompt: "Up-selling increases both venue revenue and your potential tips.",
      answer: "true",
      explanation: "Higher total bills naturally lead to higher percentage-based tips while keeping the venue highly profitable.",
    },
    {
      prompt: "Suggesting a cocktail while they read the menu wastes time.",
      answer: "false",
      explanation: "Getting a round of pre-dinner drinks on the table fast keeps them happy and boosts the final bill.",
    },
    {
      prompt: "Knowing the menu thoroughly makes up-selling feel natural.",
      answer: "true",
      explanation: "You can't up-sell a craft beer if you don't know what it tastes like. Product knowledge is power.",
    },
  ],
  13: [
    {
      prompt: "VIP guests can legally stay past the venue's licensed trading hours.",
      answer: "false",
      explanation: "Liquor licensing laws apply equally to everyone. No VIP is worth risking a massive council fine.",
    },
    {
      prompt: "Holding a reserved table for 15 minutes is standard practice.",
      answer: "true",
      explanation: "A 15-minute grace period allows for traffic or parking delays before you give the table to walk-ins.",
    },
    {
      prompt: "You should kick regular diners out to seat a walk-in VIP.",
      answer: "false",
      explanation: "Evicting seated guests causes a massive scene and terrible reviews. Offer the VIP a drink at the bar instead.",
    },
    {
      prompt: "Remembering a VIP's name provides a premium hospitality experience.",
      answer: "true",
      explanation: "Personal recognition is the currency of VIP service. It makes high-spenders feel deeply valued.",
    },
    {
      prompt: "Double-seating a section overwhelms the staff and ruins service.",
      answer: "true",
      explanation: "Seating 20 people at once in one section destroys the kitchen docket flow and overwhelms the bartender.",
    },
    {
      prompt: "You can ignore walk-ins if you have VIPs in the venue.",
      answer: "false",
      explanation: "Every guest must receive baseline hospitality. Ignoring standard diners builds a toxic, elitist venue reputation.",
    },
    {
      prompt: "Offering complimentary water while guests wait for tables is expected.",
      answer: "true",
      explanation: "It pacifies the guest, gives them something to do, and proves your service starts before they even sit down.",
    },
    {
      prompt: "A fully booked venue should still manage the door politely.",
      answer: "true",
      explanation: "Turning people away with a smile and an alternative suggestion protects the brand for their next visit.",
    },
  ],
  14: [
    {
      prompt: "You should answer the venue phone within three rings.",
      answer: "true",
      explanation: "Prompt phone answering is professional and prevents the ringing from annoying guests seated near the host stand.",
    },
    {
      prompt: "Hanging up on a rude caller without warning is acceptable.",
      answer: "false",
      explanation: "You must remain professional. Warn them politely that you will disconnect if the language continues, then hang up.",
    },
    {
      prompt: "Taking a name and number is essential for a waitlist.",
      answer: "true",
      explanation: "Without contact details, you cannot recall them when a table frees up, leading to empty tables and lost revenue.",
    },
    {
      prompt: "You must read back the booking details to confirm accuracy.",
      answer: "true",
      explanation: "Confirming the date, time, and pax prevents disastrous double-bookings or guests showing up on the wrong night.",
    },
    {
      prompt: "Promising a specific booth is risky on a busy Saturday night.",
      answer: "true",
      explanation: "Table tetris changes constantly. Note their preference, but guarantee the booking, not the specific physical table.",
    },
    {
      prompt: "You should put callers on hold for over five minutes.",
      answer: "false",
      explanation: "If you are slammed, take their name and number and promise to call them back when the rush dies down.",
    },
    {
      prompt: "Smiling while speaking makes your tone sound much warmer.",
      answer: "true",
      explanation: "The physical act of smiling changes the shape of your vocal cords, making you sound audibly friendlier over the phone.",
    },
    {
      prompt: "You should always state the venue name when answering.",
      answer: "true",
      explanation: "A standard greeting confirms they called the right place and immediately establishes a professional first impression.",
    },
  ],
  15: [
    {
      prompt: "You can serve an intoxicated person if they order food.",
      answer: "false",
      explanation: "By law, food does not override intoxication. An unduly intoxicated patron must be refused service and removed.",
    },
    {
      prompt: "Slurring words and loss of coordination are clear signs of intoxication.",
      answer: "true",
      explanation: "These are classic physical signs that a patron has consumed too much alcohol and must be cut off.",
    },
    {
      prompt: "A minor can legally drink alcohol if their parent buys it.",
      answer: "false",
      explanation: "Secondary supply to a minor on licensed premises carries massive legal fines for the venue and the bartender.",
    },
    {
      prompt: "Offering free water is a mandatory RSA requirement in Australia.",
      answer: "true",
      explanation: "All licensed Australian venues must provide free, accessible drinking water to patrons at all times.",
    },
    {
      prompt: "You must legally refuse service to any unduly intoxicated patron.",
      answer: "true",
      explanation: "Failing to refuse service risks massive fines, loss of your personal RSA certificate, and venue closure.",
    },
    {
      prompt: "A heavily swaying patron is fine for one last beer.",
      answer: "false",
      explanation: "There is no 'one more.' The moment they show clear signs of undue intoxication, service ceases immediately.",
    },
    {
      prompt: "Blaming the law is a great way to de-escalate a refusal.",
      answer: "true",
      explanation: "Saying 'I could lose my job and face a massive fine' shifts the blame from you to the government.",
    },
    {
      prompt: "You can accept a university ID card as proof of age.",
      answer: "false",
      explanation: "Only government-issued ID (Driver's License, Passport, Keypass) is legally acceptable for age verification in Australia.",
    },
  ],
  16: [
    {
      prompt: "A coeliac allergy requires entirely separate preparation equipment.",
      answer: "true",
      explanation: "Even a microscopic crumb of gluten on a shared cutting board can hospitalize a guest with true coeliac disease.",
    },
    {
      prompt: "Chicken can be safely stored on the top fridge shelf.",
      answer: "false",
      explanation: "Raw poultry must always be stored on the bottom shelf to prevent deadly salmonella juices from dripping onto cooked food.",
    },
    {
      prompt: "Food must be kept out of the temperature danger zone.",
      answer: "true",
      explanation: "The danger zone (5°C to 60°C) is where bacteria multiply rapidly. Hot food must stay hot, and cold food cold.",
    },
    {
      prompt: "You can use the same tongs for raw and cooked meat.",
      answer: "false",
      explanation: "This is severe cross-contamination. Raw meat tongs must never touch a steak that is ready to be plated.",
    },
    {
      prompt: "Washing your hands takes a minimum of twenty seconds.",
      answer: "true",
      explanation: "A rapid rinse does nothing. Hot water, soap, and 20 seconds of friction are required to kill pathogens.",
    },
    {
      prompt: "It is safe to defrost raw prawns on the bench overnight.",
      answer: "false",
      explanation: "Bench defrosting leaves the outside of the seafood in the temperature danger zone for hours. Thaw under running cold water.",
    },
    {
      prompt: "Date labels ensure a strict first-in, first-out stock rotation.",
      answer: "true",
      explanation: "Labeling prepped food ensures older ingredients are used first, reducing venue waste and preventing food poisoning.",
    },
    {
      prompt: "Blue band-aids must be worn over cuts in the kitchen.",
      answer: "true",
      explanation: "Blue is the only color that does not naturally occur in food, making the band-aid instantly visible if it falls off.",
    },
  ],
  17: [
    {
      prompt: "Crossing your arms shows authority when dealing with an angry patron.",
      answer: "false",
      explanation: "Crossed arms scream defensive aggression. Keep open, relaxed body language to avoid escalating the conflict physically.",
    },
    {
      prompt: "Keeping a calm and steady voice helps lower the guest's anger.",
      answer: "true",
      explanation: "People naturally mirror tone. If you stay calm and speak quietly, an aggressive guest will often subconsciously lower their volume.",
    },
    {
      prompt: "You should stand aggressively close to an intoxicated angry patron.",
      answer: "false",
      explanation: "Invading personal space triggers the fight-or-flight response. Keep a safe, two-arm-length distance.",
    },
    {
      prompt: "Moving a dispute away from the main crowd is good practice.",
      answer: "true",
      explanation: "Removing the 'audience' stops the patron from feeling the need to show off and keeps the dining room peaceful.",
    },
    {
      prompt: "Arguing back loudly proves to the crowd that you are right.",
      answer: "false",
      explanation: "Getting into a shouting match compromises your professionalism and can quickly trigger a physical altercation.",
    },
    {
      prompt: "Addressing the bad behavior rather than the person diffuses tension.",
      answer: "true",
      explanation: "Targeting the action, not the ego, de-personalizes the conflict and reduces the patron's need to fight back.",
    },
    {
      prompt: "You must notify security or a manager if threats are made.",
      answer: "true",
      explanation: "Verbal threats are a strict red line. Staff safety is paramount; radio management or security immediately to intervene.",
    },
    {
      prompt: "Offering a simple apology can instantly de-escalate a heated complaint.",
      answer: "true",
      explanation: "Saying 'I am so sorry that happened' validates their feelings and takes the wind entirely out of their aggressive sails.",
    },
  ],
  18: [
    {
      prompt: "The main emergency assembly point is always located inside the venue.",
      answer: "false",
      explanation: "Assembly points must be a safe distance away from the building structure, usually in a carpark or adjacent street.",
    },
    {
      prompt: "You must instruct patrons to leave their drinks behind during evacuation.",
      answer: "true",
      explanation: "Drinks spill, causing slip hazards in stairwells, and holding glasses prevents people from using handrails safely.",
    },
    {
      prompt: "Elevators are the safest way to evacuate a burning building.",
      answer: "false",
      explanation: "Elevators can lose power or open directly onto a fire floor. Always use the emergency fire stairs.",
    },
    {
      prompt: "The fire warden holds total authority during an emergency evacuation.",
      answer: "true",
      explanation: "The designated fire warden outranks the general manager during an emergency. All staff must follow their sweeping commands.",
    },
    {
      prompt: "You should check the bathrooms quickly to ensure no one remains.",
      answer: "true",
      explanation: "Bathrooms are loud and closed off; intoxicated patrons often miss alarms. Staff must clear these areas on the way out.",
    },
    {
      prompt: "Gathering your personal belongings is the top priority during a fire.",
      answer: "false",
      explanation: "Bags and jackets are replaceable; human life is not. Evacuate the second the primary alarm sounds.",
    },
    {
      prompt: "Fire exits must never be blocked by chairs or stock boxes.",
      answer: "true",
      explanation: "A blocked fire exit is a severe WHS violation and can cause a lethal crush situation in a panicked evacuation.",
    },
    {
      prompt: "Running out of the building causes dangerous crowd panic.",
      answer: "true",
      explanation: "Staff must project calm authority. Walk swiftly and purposefully, and loudly instruct guests to do the same.",
    },
  ],
  19: [
    {
      prompt: "Counting the till float exactly is the first opening duty.",
      answer: "true",
      explanation: "If you don't verify the float in the morning, you will be blamed for any cash discrepancies from the night shift.",
    },
    {
      prompt: "You can leave the coffee machine on overnight to save time.",
      answer: "false",
      explanation: "Boilers left running overnight pose a fire risk and massively burn out the internal heating elements over time.",
    },
    {
      prompt: "Wiping down beer taps prevents fruit flies from breeding overnight.",
      answer: "true",
      explanation: "Sugary beer residue is a magnet for bar flies. Taps must be wiped and plugged every single night.",
    },
    {
      prompt: "Mopping the floors is best done right before the doors open.",
      answer: "false",
      explanation: "Wet floors as guests walk in is a massive slip hazard. Mopping must be done at closing or early morning so it dries.",
    },
    {
      prompt: "All ice must be melted and the wells wiped dry nightly.",
      answer: "true",
      explanation: "Stagnant water sitting overnight breeds bacteria. Dry wells ensure a sanitary start for the morning crew.",
    },
    {
      prompt: "You should leave the safe unlocked for the morning manager.",
      answer: "false",
      explanation: "This is a fireable offense. The safe must be locked, spun, and secured every single night without exception.",
    },
    {
      prompt: "Emptying the glass bins at 2 AM is quiet and respectful.",
      answer: "false",
      explanation: "Smashing glass bins at 2 AM violates residential noise ordinances. They must be emptied in the morning.",
    },
    {
      prompt: "Setting the security alarm is the final step of closing.",
      answer: "true",
      explanation: "Once the till is secured and the doors are locked, setting the alarm secures the building for the night.",
    },
  ],
  20: [
    {
      prompt: "Over-pouring spirits costs the venue thousands of dollars in lost GP.",
      answer: "true",
      explanation: "A heavy hand ruins the 30ml yield. Over-pouring just 5ml every drink destroys the bar's gross profit margin.",
    },
    {
      prompt: "Giving free drinks to friends is totally fine in Australian pubs.",
      answer: "false",
      explanation: "Unauthorized comps are legally considered theft. All free drinks must be approved and logged in the POS by a manager.",
    },
    {
      prompt: "Recording a dropped bottle in the wastage log is mandatory.",
      answer: "true",
      explanation: "Logging waste ensures the stocktake balances at the end of the month, explaining exactly where the lost inventory went.",
    },
    {
      prompt: "First-in, first-out means using the oldest stock before the newest.",
      answer: "true",
      explanation: "This FIFO principle ensures perishables like milk, juice, and kegs are used before they expire and become waste.",
    },
    {
      prompt: "You can pour leftover wine back into the bottle to save money.",
      answer: "false",
      explanation: "This is a severe health violation. Once a liquid has touched a guest's glass, it must be poured down the drain.",
    },
    {
      prompt: "Accurate stocktakes depend on counting every single item in the venue.",
      answer: "true",
      explanation: "From the coolroom kegs to the half-empty bottles on the speed rail, every drop must be accounted for monthly.",
    },
    {
      prompt: "Using a jigger ensures exact measurements and perfect stock control.",
      answer: "true",
      explanation: "Free-pouring is inaccurate and often illegal depending on the venue policy. Jiggers guarantee a 30ml pour every time.",
    },
    {
      prompt: "Throwing away half-full kegs is a standard weekly procedure.",
      answer: "false",
      explanation: "Kegs have a long shelf life. Throwing away a half keg is a massive financial loss and indicates terrible stock management.",
    },
  ],
};
