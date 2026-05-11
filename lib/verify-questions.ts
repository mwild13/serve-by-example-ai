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

  21: [
    {
      prompt: 'Calling "Behind!" before moving past someone in a narrow bar space is required.',
      answer: "true",
      explanation: "This is the most important vocal command in the industry. A single unannounced pass can cause a tray drop or serious burn injury.",
    },
    {
      prompt: 'You only need to call "Behind!" when carrying a full tray.',
      answer: "false",
      explanation: "The call is required any time you move through an occupied space — even empty-handed. Collisions can happen without a tray.",
    },
    {
      prompt: 'The word "Corner!" is used to warn others before stepping around a blind corner.',
      answer: "true",
      explanation: 'Blind corners are collision black spots in busy venues. "Corner!" gives oncoming traffic a split second to stop.',
    },
    {
      prompt: "It is fine to push past a colleague without warning during a rush.",
      answer: "false",
      explanation: "Physical contact without warning during a rush causes tray drops, spills, and injuries. The busier the venue, the more critical the call.",
    },
    {
      prompt: "Compressing your body sideways when moving through a crowd reduces collision risk.",
      answer: "true",
      explanation: "Turning sideways and tucking elbows in — the \"compressed walk\" — minimizes your physical footprint in a packed venue.",
    },
    {
      prompt: "Staff should run between the bar and kitchen during busy service.",
      answer: "false",
      explanation: 'Running causes collisions and spills. Walk fast with purpose and call ahead — "Coming through!" — to clear your path.',
    },
    {
      prompt: '"Coming through!" is the correct call when navigating a crowded dining room.',
      answer: "true",
      explanation: "This verbal signal tells both guests and staff to clear a path and is standard professional floor navigation.",
    },
    {
      prompt: "Vocal safety commands are only used by inexperienced staff members.",
      answer: "false",
      explanation: "Every seasoned professional uses these calls because collisions do not discriminate by experience. The habit is what keeps everyone safe.",
    },
  ],

  22: [
    {
      prompt: "If a glass breaks in the ice well, you must melt the entire well immediately.",
      answer: "true",
      explanation: "Glass shards in ice are invisible to the eye. The only safe WHS protocol is pouring hot water to melt every last cube.",
    },
    {
      prompt: "You can scoop out visible glass pieces and continue using the remaining ice.",
      answer: "false",
      explanation: "Invisible micro-shards remain embedded in the ice. Partial clearing is not safe — the entire well must be burned.",
    },
    {
      prompt: "Hot water is poured into the well to melt all ice during a Burn Protocol.",
      answer: "true",
      explanation: "Hot water is the fastest and most thorough method to melt all ice and flush potential shards down the drain safely.",
    },
    {
      prompt: "A glass breaking in the ice well only needs to be reported, not cleaned immediately.",
      answer: "false",
      explanation: "The contamination is immediate. Every drink poured from that point on is potentially dangerous — the well must be burned at once.",
    },
    {
      prompt: "Using a glass to scoop ice is the leading cause of ice well glass contamination.",
      answer: "true",
      explanation: "This is exactly why the scoop rule exists. Glass on glass creates chips that vanish into the ice instantly.",
    },
    {
      prompt: "A proper Burn Protocol can be completed in under two minutes.",
      answer: "false",
      explanation: "Melting a full ice well, draining it, and confirming it is clear takes 15–20 minutes. It is a genuine service shutdown.",
    },
    {
      prompt: "The ice scoop must be returned to a clean holder after every single use.",
      answer: "true",
      explanation: "Leaving the scoop in the ice or on the bar top risks contaminating it with bacteria or foreign objects between uses.",
    },
    {
      prompt: "You can wait until the venue closes before burning a contaminated ice well.",
      answer: "false",
      explanation: "Contaminated ice must never serve another customer. Burning the well is immediate regardless of how busy the bar is.",
    },
  ],

  23: [
    {
      prompt: 'An empty glass left on a table is known in the industry as a "dead soldier."',
      answer: "true",
      explanation: "This is the standard hospitality term for any finished vessel. Spotting dead soldiers from across the room is a core skill.",
    },
    {
      prompt: "Staff should focus exclusively on the task directly in front of them.",
      answer: "false",
      explanation: "The \"swivel head\" technique means constantly scanning the room while performing other tasks. Tunnel vision is a floor failure.",
    },
    {
      prompt: "A guest looking around the room while holding a menu likely needs a server.",
      answer: "true",
      explanation: "The \"lost look\" — open menu, scanning eyes — is one of the clearest visual cues that the guest needs assistance.",
    },
    {
      prompt: "A raised hand from a guest can wait until you have finished your current task.",
      answer: "false",
      explanation: "A raised hand means the guest has already lost patience. Drop your current task or acknowledge immediately with a nod.",
    },
    {
      prompt: "Scanning the room every 60 seconds helps prevent guests from feeling ignored.",
      answer: "true",
      explanation: "Regular visual sweeps allow you to identify needs before they become frustrations, keeping the whole room in control.",
    },
    {
      prompt: "Tunnel vision on your immediate task is the sign of an experienced server.",
      answer: "false",
      explanation: "Tunnel vision is the hallmark of an overwhelmed or inexperienced worker. Expert servers are always reading the whole room.",
    },
    {
      prompt: "Eye contact and a nod from across the room are enough to reassure a waiting guest.",
      answer: "true",
      explanation: "A visible acknowledgment resets the guest's patience clock even from 10 meters away, buying you critical time.",
    },
    {
      prompt: "Noticing empty glasses and guest needs is the floor manager's job, not the server's.",
      answer: "false",
      explanation: "Every single person on the floor shares responsibility for reading the room. Managers cannot be everywhere at once.",
    },
  ],

  24: [
    {
      prompt: "Ice is classified as a food product under Australian food safety regulations.",
      answer: "true",
      explanation: "Because ice enters food and drinks directly, contaminating it carries the same legal and health consequences as contaminating food.",
    },
    {
      prompt: "Using bare hands to transfer ice is acceptable if you are wearing food-safe gloves.",
      answer: "false",
      explanation: "Even gloved hands introduce warmth that melts ice and bacteria that can persist on glove surfaces. The scoop is non-negotiable.",
    },
    {
      prompt: "The ice scoop handle must always be kept pointing upward, out of the ice.",
      answer: "true",
      explanation: "A handle buried in ice forces the staff member to grab the scoop above the bowl, meaning their hand is directly over the ice.",
    },
    {
      prompt: "The ice machine lid can be left open during service for faster access.",
      answer: "false",
      explanation: "An open lid allows airborne contaminants, insects, and moisture to enter the machine and contaminate every batch of ice produced.",
    },
    {
      prompt: "A cracked or chipped ice scoop must be removed from service immediately.",
      answer: "true",
      explanation: "A broken scoop can shed plastic fragments into the ice well, which then enters guest drinks invisibly.",
    },
    {
      prompt: "You can use a pint glass to scoop ice in an emergency if the scoop is missing.",
      answer: "false",
      explanation: "Glass on ice causes chips and is one of the most dangerous acts behind a bar. Find the scoop or ask a colleague for one.",
    },
    {
      prompt: "Ice machines must be cleaned and sanitized on a regular scheduled cycle.",
      answer: "true",
      explanation: "Bio-film builds up inside machines and can contaminate every batch of ice produced if the machine is not sanitized regularly.",
    },
    {
      prompt: "Ice from one well can be freely transferred to another well using any clean container.",
      answer: "false",
      explanation: "Cross-well transfers must follow the same scoop-only hygiene protocol. The container must be the designated clean ice bucket.",
    },
  ],

  25: [
    {
      prompt: "A guest's allergy must be verbally relayed to the kitchen immediately after taking the order.",
      answer: "true",
      explanation: "Written tickets can be missed in a rush. A direct verbal call to the chef closes the gap and creates a verbal confirmation loop.",
    },
    {
      prompt: '"Contains nuts" printed on a menu is sufficient and requires no further staff action.',
      answer: "false",
      explanation: "Menu warnings are the starting point, not the endpoint. Staff must proactively confirm the allergy and alert the kitchen before placing the order.",
    },
    {
      prompt: "A severe nut allergy can trigger anaphylaxis from trace amounts on shared equipment.",
      answer: "true",
      explanation: "Cross-contamination on a shared cutting board or pan is enough to cause a life-threatening reaction in a sensitized guest.",
    },
    {
      prompt: "If you are busy, the guest can relay their own allergy directly to the kitchen.",
      answer: "false",
      explanation: "The serving staff are the communication bridge between guest and kitchen. This responsibility cannot be delegated to the guest.",
    },
    {
      prompt: "The POS ticket must be clearly marked with all allergy and dietary information.",
      answer: "true",
      explanation: "The ticket is the kitchen's primary instruction document. Allergy data missing from the docket is allergy data at risk.",
    },
    {
      prompt: "Asking about allergies is only required for large group bookings.",
      answer: "false",
      explanation: "Every single order taken must prompt an allergy check from the server, regardless of group size.",
    },
    {
      prompt: "Checking with the chef before serving a suspected allergen dish is mandatory.",
      answer: "true",
      explanation: "A visual and verbal double-check with the kitchen before the plate touches the table is the final safety net.",
    },
    {
      prompt: 'A guest who says they are "just a little intolerant" requires no allergy protocol.',
      answer: "false",
      explanation: "The level of sensitivity varies enormously between guests. Any declared intolerance must be treated with full allergy protocol.",
    },
  ],

  26: [
    {
      prompt: "Learning the soda gun button layout by feel allows you to pour without looking down.",
      answer: "true",
      explanation: "During a rush, your eyes must be on the guest and the glass. Muscle memory on the gun eliminates the dead second of looking down.",
    },
    {
      prompt: "The soda gun should be flushed with fresh soda after each use to keep it clean.",
      answer: "false",
      explanation: "The gun should be rinsed with clean water, not soda. Soda leaves sugar residue behind, feeding bacteria and clogging the nozzle.",
    },
    {
      prompt: 'A "warm" first pour from the soda gun is caused by syrup sitting in an unrefrigerated line.',
      answer: "true",
      explanation: "Lines warm up between uses. The first few ounces should always be dispensed to waste before serving a guest.",
    },
    {
      prompt: "Running out of bag-in-box syrup will shut down bar service for at least 30 minutes.",
      answer: "false",
      explanation: "Replacing a bag-in-box takes under two minutes. Knowing where the spare boxes are stored prevents any significant downtime.",
    },
    {
      prompt: "Pressing the wrong button on a soda gun mid-pour means the drink must be remade entirely.",
      answer: "true",
      explanation: "Accidental tonic instead of soda in a cocktail fundamentally changes the drink. It must be discarded and remade.",
    },
    {
      prompt: "The soda gun nozzle cleans itself through normal use during service.",
      answer: "false",
      explanation: "The nozzle must be manually cleaned daily to prevent syrup buildup that creates bacterial growth and flavour contamination.",
    },
    {
      prompt: "Knowing which button number maps to which syrup is essential bar knowledge.",
      answer: "true",
      explanation: "The standard order is typically Cola, Diet, Lemon, Soda, Tonic — but every bar differs. Knowing your specific gun cold is non-negotiable.",
    },
    {
      prompt: "You can top up a guest's drink with the soda gun without asking first.",
      answer: "false",
      explanation: "Topping up uninvited can change the drink's taste profile or water down a cocktail the guest is intentionally sipping slowly.",
    },
  ],

  27: [
    {
      prompt: 'Expert bartenders eliminate "dead time" by performing two complementary actions simultaneously.',
      answer: "true",
      explanation: "The core principle of two-handed service is never letting one hand sit idle while the other is working.",
    },
    {
      prompt: "Moving faster is the main difference between a novice and an expert bartender.",
      answer: "false",
      explanation: "Expert bartenders move less, not faster. They eliminate unnecessary steps through planning, not by rushing.",
    },
    {
      prompt: "Grabbing a glass with one hand while hitting the soda gun with the other is two-handed service.",
      answer: "true",
      explanation: "This simultaneous action is the textbook example of economy of motion — both hands working toward a single drink.",
    },
    {
      prompt: "Pre-building garnishes before service begins is a waste of valuable prep time.",
      answer: "false",
      explanation: "Pre-building garnishes is classic mise en place. It eliminates the deadly fumble with a knife during a live rush.",
    },
    {
      prompt: "Walking to the same destination twice because you forgot something wastes critical service time.",
      answer: "true",
      explanation: '"Two birds, one stone" thinking is core to economy of motion — never make a trip without carrying something in both directions.',
    },
    {
      prompt: "The most efficient bartenders are the ones who tackle the most tasks at once.",
      answer: "false",
      explanation: "Stacking too many tasks causes errors. Economy of motion is about deliberate double-actions, not chaotic multitasking.",
    },
    {
      prompt: "Positioning the next glass under the gun before the first is finished poured saves real time.",
      answer: "true",
      explanation: "Queuing the next glass in advance cuts the dead movement of reaching for it from scratch, compounding over hundreds of drinks a night.",
    },
    {
      prompt: "Economy of motion habits only matter during a peak rush period.",
      answer: "false",
      explanation: "Efficient movement must be practiced constantly in quiet periods so that it becomes fully automatic when pressure hits.",
    },
  ],

  28: [
    {
      prompt: "Mise en place means having everything in its correct place before service begins.",
      answer: "true",
      explanation: "This French culinary principle applies equally to the bar, floor, and kitchen. Setup determines the quality of the service.",
    },
    {
      prompt: "You should restock your station once, at the start of the shift, and that is sufficient.",
      answer: "false",
      explanation: "Stations deplete fast under pressure. Continuous reloading in the micro-gaps between service waves is essential to maintain flow.",
    },
    {
      prompt: "Running out of garnish mid-rush is a visible service failure caused by station mismanagement.",
      answer: "true",
      explanation: "A bartender visibly searching for a lime wedge mid-order telegraphs poor preparation to the entire room.",
    },
    {
      prompt: "A 3-minute reload window is impossible to achieve in a real service environment.",
      answer: "false",
      explanation: "Expert staff identify the brief lulls between waves and use them to refill citrus, ice, and glassware before the next rush arrives.",
    },
    {
      prompt: "A tidy, fully-stocked station signals professionalism to your colleagues and management.",
      answer: "true",
      explanation: "How your station looks mid-service communicates your standards. A stocked, organized station says you are in control.",
    },
    {
      prompt: "Asking a colleague to cover for 90 seconds while you restock is bad teamwork.",
      answer: "false",
      explanation: "A quick cover request is exactly how a coordinated team operates. Silent suffering until you run out is what breaks service.",
    },
    {
      prompt: "Ice levels should be checked and topped up during every available quiet moment.",
      answer: "true",
      explanation: "Running low on ice mid-rush is one of the most common avoidable disasters behind a bar. Top up constantly.",
    },
    {
      prompt: "The end of a wave is the wrong time to reset your mise en place.",
      answer: "false",
      explanation: "The brief quiet after a wave is the perfect window. You must be ready before the next wave arrives, not scrambling during it.",
    },
  ],

  29: [
    {
      prompt: '"M/R" on a POS docket means the steak must be cooked to Medium Rare.',
      answer: "true",
      explanation: "This is a universal POS abbreviation used in venues across Australia. Misreading it means an incorrect steak and an angry table.",
    },
    {
      prompt: "A docket with no special instructions confirms the table has no allergies.",
      answer: "false",
      explanation: "Guests sometimes forget to mention allergies at order time. Always confirm verbally with the server if you are unsure.",
    },
    {
      prompt: "Food tickets are prioritized by the time they are printed, not by table number.",
      answer: "true",
      explanation: "The printer queue represents order of entry. Skipping ahead by table number disrupts the entire kitchen's flow and makes some tables wait unfairly.",
    },
    {
      prompt: '"G/F" on a docket means the dish is served with a gravy-free sauce.',
      answer: "false",
      explanation: '"G/F" universally stands for Gluten Free and must trigger the kitchen\'s full allergen protocol immediately.',
    },
    {
      prompt: '"86" or "OFF" on a kitchen note means that menu item is no longer available.',
      answer: "true",
      explanation: '"86\'d" is the universal hospitality term for an item that has run out. All floor staff must be briefed on 86 items immediately.',
    },
    {
      prompt: "Runners can reorganize dockets to make carrying plates easier when food is ready.",
      answer: "false",
      explanation: "Dockets control the order of service. Reorganizing them without manager direction causes incorrect dishes to reach the wrong tables.",
    },
    {
      prompt: "Calling out a table number when placing food in the pass prevents it from sitting cold.",
      answer: "true",
      explanation: 'A clear "Table 7 away!" signals the runner to collect immediately, keeping food at serving temperature for the guest.',
    },
    {
      prompt: "Illegible handwritten additions to a docket can be ignored if they seem minor.",
      answer: "false",
      explanation: "Any handwritten addition must be clarified with the server immediately. It almost always contains allergy or modification information.",
    },
  ],

  30: [
    {
      prompt: '"Being in the weed" is the hospitality term for being completely overwhelmed during a rush.',
      answer: "true",
      explanation: "Every hospitality worker will experience being in the weed. Knowing how to escape it methodically is the defining skill.",
    },
    {
      prompt: "The best way to escape being in the weed is to speed up and stop communicating.",
      answer: "false",
      explanation: "Speeding up causes errors and silence makes guests angrier. Acknowledge everyone, breathe, and work the tickets in order.",
    },
    {
      prompt: 'Verbally acknowledging every waiting guest with "With you in a moment" prevents escalation.',
      answer: "true",
      explanation: "Being seen and verbally acknowledged resets a guest's patience, buying you critical time to work through the backlog.",
    },
    {
      prompt: "Taking on extra tables when you are already overwhelmed shows a strong work ethic.",
      answer: "false",
      explanation: "Overloading your section causes all your tables to suffer. Knowing your capacity limit and calling for help is the smarter move.",
    },
    {
      prompt: "Working tickets in the order they were received prevents reactive chaos during a rush.",
      answer: "true",
      explanation: '"Slow is smooth, smooth is fast." Orderly first-in-first-out service consistently produces better outcomes than reactive scrambling.',
    },
    {
      prompt: "Taking a deliberate 30-second pause to assess priorities during a rush is a waste of time.",
      answer: "false",
      explanation: "A conscious pause to identify the two or three most critical tasks is far more productive than 30 seconds of reactive panic.",
    },
    {
      prompt: "Asking a colleague for help when you are overwhelmed is a sign of good self-awareness.",
      answer: "true",
      explanation: "Good team members call for backup early. Waiting until you crash takes the whole team down and ruins the guest experience.",
    },
    {
      prompt: "Guests are always understanding when a staff member is visibly struggling.",
      answer: "false",
      explanation: "Guests are paying for a service experience. Visible distress from staff makes them uncomfortable and less likely to return or tip.",
    },
  ],

  31: [
    {
      prompt: "The standard single spirit measure in an Australian venue is 30ml.",
      answer: "true",
      explanation: "This is the legal standard. Venues that use a different measure must clearly display that fact to guests.",
    },
    {
      prompt: "Free-pouring spirits is just as accurate as using a jigger if you have experience.",
      answer: "false",
      explanation: "Studies consistently show that even experienced free-pourers over-deliver by 5–10ml per drink, destroying the bar's gross profit margin.",
    },
    {
      prompt: "The meniscus is the slight curve of liquid at the top of a full jigger.",
      answer: "true",
      explanation: "Reading the meniscus at eye level, not from above, ensures the pour is exactly 30ml and not a milliliter over.",
    },
    {
      prompt: "Over-pouring spirits by 5ml per drink is too small an amount to affect the venue's profit.",
      answer: "false",
      explanation: "At 200 drinks per night, 5ml over means 1 full litre of spirits given away for free daily — a devastating impact on gross profit.",
    },
    {
      prompt: "Using a jigger protects the bartender from accusations of short-changing a guest.",
      answer: "true",
      explanation: "A jigger is both a profit tool and a legal defense. If a guest claims they were under-poured, the jigger is the proof.",
    },
    {
      prompt: "The jigger is only required for cocktails, not for spirit-and-mixer drinks.",
      answer: "false",
      explanation: "Every single spirit pour, regardless of the drink's complexity, must be measured to maintain compliance and GP consistency.",
    },
    {
      prompt: "Consistent 30ml pours ensure the venue's stocktake aligns with actual sales data.",
      answer: "true",
      explanation: "If stocktake shows more spirits used than POS sales account for, over-pouring or theft is the culprit.",
    },
    {
      prompt: 'Guests who ask for "a bit extra" can be accommodated as a goodwill gesture.',
      answer: "false",
      explanation: "Unauthorized over-pours are both a compliance and a theft issue. Only a manager can authorize a complimentary extra.",
    },
  ],

  32: [
    {
      prompt: "The foil on a wine bottle should be cut below the second lip for a clean presentation.",
      answer: "true",
      explanation: "Cutting below the second lip hides the cut edge when pouring, keeping the presentation clean and professional.",
    },
    {
      prompt: "Pulling a cork out in one fast, smooth motion is the professional technique.",
      answer: "false",
      explanation: "The waiter's friend uses a two-step lever system — seat the lever halfway up the bottle lip, lift, then fully up — for a controlled extraction.",
    },
    {
      prompt: "The cork should be extracted silently rather than with a loud dramatic pop.",
      answer: "true",
      explanation: "A silent extraction maintains professionalism in the dining room and prevents carbonation loss in sparkling wines.",
    },
    {
      prompt: "The foil cutter on a waiter's friend is primarily decorative.",
      answer: "false",
      explanation: "The integrated foil cutter produces a clean, even incision without tearing the foil or leaving a jagged edge.",
    },
    {
      prompt: "Practicing the two-step lever technique prevents the cork from breaking in half.",
      answer: "true",
      explanation: "A broken cork is caused by misaligning the lever or rushing the extraction. The two-step provides mechanical control.",
    },
    {
      prompt: "You should twist the bottle when extracting the cork rather than the corkscrew.",
      answer: "false",
      explanation: "The bottle must be held perfectly steady. Only the corkscrew and lever mechanism should move during a clean extraction.",
    },
    {
      prompt: "Presenting the extracted cork to the guest allows them to check for signs of a fault.",
      answer: "true",
      explanation: "A moist, fragrant cork is a good sign. A dry, crumbly cork suggests the wine was stored upright and may be compromised.",
    },
    {
      prompt: "A waiter's friend is only necessary for expensive bottles of wine.",
      answer: "false",
      explanation: "Every corked bottle served at a table requires a professional tableside opening, regardless of its price point.",
    },
  ],

  33: [
    {
      prompt: 'A "fobbing" tap means the keg is producing excessive, undrinkable foam.',
      answer: "true",
      explanation: "Fobbing stops the bar from pouring and signals a problem — typically an empty keg, a gas issue, or a warm line.",
    },
    {
      prompt: "You should remove a keg coupler without turning off the gas first.",
      answer: "false",
      explanation: "Releasing a coupler under full gas pressure causes a dangerous blowout of gas and beer. The gas valve must always be closed first.",
    },
    {
      prompt: "Air bubbles in the beer line cause the first pours to fob heavily after a keg change.",
      answer: "true",
      explanation: "After any keg change, air must be purged from the line with a few wasted pours before clean service resumes.",
    },
    {
      prompt: "An empty gas bottle makes no noticeable difference to the pour quality.",
      answer: "false",
      explanation: "Without CO2 or mixed gas pressure, the keg cannot push beer through the line at all. An empty gas bottle kills the bar.",
    },
    {
      prompt: "A full keg weighs approximately 50kg and must be handled with correct manual lifting technique.",
      answer: "true",
      explanation: "Lifting a full keg incorrectly causes serious back and shoulder injuries. Slide it rather than lift it wherever possible.",
    },
    {
      prompt: "Kegs from different beer brands can always share the same coupler type.",
      answer: "false",
      explanation: "Different brands use different coupler types (e.g., S-type, A-type, G-type). Using the wrong coupler will damage the keg valve.",
    },
    {
      prompt: "Beer lines should be professionally cleaned at least once per week.",
      answer: "true",
      explanation: "Weekly line cleans remove yeast and bacteria buildup that creates off-flavors in the beer and can impact guest health.",
    },
    {
      prompt: "A tap that is still fobbing after 5 minutes will clear itself without investigation.",
      answer: "false",
      explanation: "Persistent fobbing indicates an ongoing gas or temperature problem that requires immediate diagnosis to restore service.",
    },
  ],

  34: [
    {
      prompt: "You should never touch the rim or inside of a glass when handling or carrying it.",
      answer: "true",
      explanation: "The rim is where the guest's mouth goes. Touching it transfers bacteria and is immediately visible as unhygienic.",
    },
    {
      prompt: "Carrying five glasses stacked inside each other is an efficient and safe technique.",
      answer: "false",
      explanation: "Stacking creates a vacuum seal that locks glasses together. Pulling them apart snaps the rims and causes breakage.",
    },
    {
      prompt: 'The "pinch" technique involves holding a glass by the base with two fingers and a thumb.',
      answer: "true",
      explanation: "This stable, rim-free grip allows for carrying multiple glasses safely in one hand without touching any contact surface.",
    },
    {
      prompt: "Glasses should always be carried individually to prevent breakage.",
      answer: "false",
      explanation: "Efficient floor service requires carrying multiple glasses by hand. The pinch and stack techniques allow safe multi-glass carrying.",
    },
    {
      prompt: "Carrying wine glasses by the stem keeps fingerprints off the bowl and maintains temperature.",
      answer: "true",
      explanation: "Body heat from holding the bowl warms chilled white wine and leaves greasy smudges that are visible to the guest.",
    },
    {
      prompt: "The heaviest glasses should be placed at the outer edge of a tray for easy access.",
      answer: "false",
      explanation: "Heavy items belong in the center of the tray. This lowers the center of gravity and dramatically improves stability.",
    },
    {
      prompt: "Wet or freshly washed glasses are significantly more likely to slip from your grip.",
      answer: "true",
      explanation: "The film of water on a clean glass dramatically reduces grip friction. Allow glasses to drain or pat dry before carrying.",
    },
    {
      prompt: "Plates and glasses can be carried together in the same hand if you are careful.",
      answer: "false",
      explanation: "Food residue from plates transfers onto glassware and creates dangerous weight imbalance between two entirely different carrying techniques.",
    },
  ],

  35: [
    {
      prompt: "A perfect close is described as the greatest gift you can give the morning shift.",
      answer: "true",
      explanation: "A clean, fully-stocked venue at close means the opening crew can begin service immediately without cleaning up the previous night first.",
    },
    {
      prompt: "Draining the coffee machine completely overnight is unnecessary if it is used again the next morning.",
      answer: "false",
      explanation: "Stale water left in the boiler overnight ruins the flavour of the first coffees and causes scale buildup in the heating element.",
    },
    {
      prompt: "The speed rail must be sanitized and wiped completely dry every single night.",
      answer: "true",
      explanation: "Sticky spirits on the speed rail breed bacteria overnight and attract fruit flies by morning — both a hygiene and pest issue.",
    },
    {
      prompt: "Restocking dry goods at close is a task that can be left for the opening shift.",
      answer: "false",
      explanation: "The closing shift is responsible for leaving the dry store in correct order. The morning team should only need to start, not clean up.",
    },
    {
      prompt: "All glassware must be polished and correctly racked before the close checklist is signed off.",
      answer: "true",
      explanation: "Spotted or dirty glasses sitting in a service rack for the next day is a mark of a poor close that embarrasses the venue.",
    },
    {
      prompt: "Leaving one mop bucket of dirty water overnight saves time for the morning shift.",
      answer: "false",
      explanation: "Dirty water left overnight grows dangerous bacteria levels and produces a foul smell that permeates the venue by morning.",
    },
    {
      prompt: "A signed-off close checklist creates accountability and confirms the venue was left in a safe condition.",
      answer: "true",
      explanation: "The checklist is both the legal record and the operational standard for every close. No checklist means no accountability.",
    },
    {
      prompt: "The floor only needs to be swept, not mopped, on quiet nights.",
      answer: "false",
      explanation: "Floor hygiene standards are constant regardless of covers. Quiet nights are in fact the easiest time to do a thorough mop.",
    },
  ],

  36: [
    {
      prompt: "The two-minute check means returning to a table approximately two minutes after food is served.",
      answer: "true",
      explanation: "Two minutes is enough time for the guest to take a first bite and discover any issue, but early enough for the kitchen to fix it.",
    },
    {
      prompt: "Checking back on a table after food is delivered is only necessary for complicated orders.",
      answer: "false",
      explanation: "Every single table requires a two-minute check, regardless of how simple the order was. Any dish can have a problem.",
    },
    {
      prompt: "The two-minute check must happen after the guest has taken their first bite.",
      answer: "true",
      explanation: "Checking before they have eaten means they cannot yet report a problem. Timing the check to the first bite is everything.",
    },
    {
      prompt: 'Asking "Is everything okay?" is the gold-standard two-minute check question.',
      answer: "false",
      explanation: '"Okay" invites a one-word dismissal. Better: "How is the steak cooked for you?" — a specific question gets a specific, useful answer.',
    },
    {
      prompt: "A cold steak discovered at the two-minute check can still be refired and saved.",
      answer: "true",
      explanation: "A cold steak caught at two minutes can be corrected before the guest becomes visibly frustrated or loses their appetite.",
    },
    {
      prompt: "A two-minute check interrupts the guest's dining experience and should be kept to a minimum.",
      answer: "false",
      explanation: "A brief, professional check enhances the experience by showing attentiveness. It is neglect, not attention, that ruins a meal.",
    },
    {
      prompt: "Missing the two-minute window means problems are discovered only when it is too late to fix them.",
      answer: "true",
      explanation: "A guest who has eaten half a cold meal before complaining cannot have their experience fully recovered. The window is everything.",
    },
    {
      prompt: "The two-minute check is only required for new or unfamiliar menu items.",
      answer: "false",
      explanation: "Every dish from every table requires this check. Kitchen errors can and do happen to the most familiar items on the menu.",
    },
  ],

  37: [
    {
      prompt: "When an item is unavailable, you must always immediately suggest a specific alternative.",
      answer: "true",
      explanation: "A direct suggestion prevents the guest from feeling stranded without a path forward.",
    },
    {
      prompt: 'Saying "Sorry, we are out of that" and moving on is professional handling of a stock-out.',
      answer: "false",
      explanation: 'Ending the conversation at "we\'re out" is a dead-end. The pivot — the alternative suggestion — is the part that saves the sale.',
    },
    {
      prompt: "The pivot technique means acknowledging unavailability and immediately offering a comparable item.",
      answer: "true",
      explanation: "Acknowledge, redirect, and present the alternative as a genuine recommendation — this three-step pivot saves almost every stock-out situation.",
    },
    {
      prompt: "Guests always prefer the cheapest alternative when their first choice is unavailable.",
      answer: "false",
      explanation: "Guests want the best equivalent experience, not the cheapest consolation. Offer the most genuinely similar product.",
    },
    {
      prompt: "Deep menu knowledge is what allows you to suggest genuine alternatives with confidence.",
      answer: "true",
      explanation: "You cannot pivot to an alternative if you do not know what is comparable on the menu. Product knowledge is the foundation.",
    },
    {
      prompt: "Apologizing excessively when an item is unavailable is the mark of good service.",
      answer: "false",
      explanation: "A single brief apology is professional. Over-apologizing draws more attention to the failure and makes guests feel worse, not better.",
    },
    {
      prompt: '"Our house red is very similar and actually pairs better with that dish" is an ideal pivot.',
      answer: "true",
      explanation: "This reframes the alternative as a positive recommendation rather than a consolation prize, keeping the guest's enthusiasm high.",
    },
    {
      prompt: "Only bartenders need to know about out-of-stock items — the floor staff can improvise.",
      answer: "false",
      explanation: "All floor staff must be briefed on 86 items at the start of every service to avoid promising unavailable items at the table.",
    },
  ],

  38: [
    {
      prompt: 'A "dead soldier" is an empty bottle or glass taking up space on a guest\'s table.',
      answer: "true",
      explanation: "This is the industry term for any finished vessel. Spotting and removing dead soldiers is a fundamental floor skill.",
    },
    {
      prompt: "You should only clear a table once the guest has completely finished their meal.",
      answer: "false",
      explanation: "Pre-bussing — removing finished glasses and side plates as they are done — is standard professional table management.",
    },
    {
      prompt: "Never walking back to the kitchen empty-handed is a core floor efficiency rule.",
      answer: "true",
      explanation: "Every trip to the back should clear dead soldiers; every trip to the floor should carry something fresh. No empty hands.",
    },
    {
      prompt: "Removing a dead soldier from a table without first asking the guest is rude.",
      answer: "false",
      explanation: "Clearing finished glasses is part of the standard service contract. It does not require the guest's permission.",
    },
    {
      prompt: "A cleared, reset table creates a psychologically cleaner environment for the guest.",
      answer: "true",
      explanation: "Accumulated empty glasses and debris subconsciously signals neglect. A clean table makes guests feel valued and comfortable.",
    },
    {
      prompt: "Pre-bussing tables signals to guests that they are being asked to leave.",
      answer: "false",
      explanation: "Pre-bussing improves comfort and cleanliness. Only dropping the bill unsolicited or hovering pressures a guest to leave.",
    },
    {
      prompt: "Carrying a full arm of cleared glassware to the glass wash in one trip is expert pre-bussing.",
      answer: "true",
      explanation: "Minimizing trips by loading up on cleared items in one pass is exactly what efficient, professional pre-bussing looks like.",
    },
    {
      prompt: "Dead soldiers should only be removed when the entire table has finished drinking.",
      answer: "false",
      explanation: "Each individual dead soldier should be removed as soon as it is available to keep the table clean throughout the experience.",
    },
  ],

  39: [
    {
      prompt: "The bar back's primary role is to ensure the bartender never runs out of essential supplies.",
      answer: "true",
      explanation: "The bar back is the invisible engine of the bar. The bartender's entire ability to serve depends on the bar back's support.",
    },
    {
      prompt: "Bar backs must stay behind the bar at all times and never cross the floor.",
      answer: "false",
      explanation: "Delivering ice, collecting dead soldiers, and restocking adjacent areas often requires moving across the floor during service.",
    },
    {
      prompt: "Calling out to a bartender before moving ice behind them during service prevents a collision.",
      answer: "true",
      explanation: "Moving silently behind a working bartender during a rush risks a serious collision with hot or heavy equipment.",
    },
    {
      prompt: "The bar back is responsible for taking guest drink orders during a rush.",
      answer: "false",
      explanation: "Taking orders is the bartender's role. The bar back handles supply and support to free the bartender to focus entirely on guests.",
    },
    {
      prompt: "Filling ice bins from the back of the bar without disrupting the bartender is a core bar-back skill.",
      answer: "true",
      explanation: "Moving ice from the back rather than reaching over the bartender mid-service is a fundamental skill of bar-back invisibility.",
    },
    {
      prompt: "A bar back who finishes their tasks early should stand by and wait to be asked for help.",
      answer: "false",
      explanation: "A proactive bar back anticipates the next need — checking ice levels, replacing glassware, pre-staging bottles — without being asked.",
    },
    {
      prompt: "The speed rail must be restocked by the bar back the moment it shows any empty slots.",
      answer: "true",
      explanation: "An empty speed rail slot forces the bartender to pause service to locate a spirit. The bar back's job is to prevent that moment.",
    },
    {
      prompt: "Bar back and bartender communication should only happen during quiet moments in service.",
      answer: "false",
      explanation: "Constant brief communication throughout the rush — a nod, a tap, a one-word call — is what keeps service flowing without interruption.",
    },
  ],

  40: [
    {
      prompt: 'The "Power of Three" means suggesting a specific premium brand rather than asking a generic question.',
      answer: "true",
      explanation: '"Would you like that with Hendrick\'s?" is more effective than "Do you want premium?" because it paints a specific, inviting picture.',
    },
    {
      prompt: "Natural upselling is about extracting maximum spend from every guest regardless of their experience.",
      answer: "false",
      explanation: "Natural upselling enhances the guest's experience. The moment it feels pushy, it destroys trust, tips, and any chance of return visits.",
    },
    {
      prompt: 'Recommending a specific complementary side dish is more effective than asking "Do you want any sides?"',
      answer: "true",
      explanation: '"The sweet potato fries are amazing with the chicken" removes decision fatigue and paints a picture. "Any sides?" invites a flat no.',
    },
    {
      prompt: 'Asking "Would you like a large?" is the gold standard for upselling a beer.',
      answer: "false",
      explanation: '"A large" is generic and transactional. "Would you like a pint of that?" names the product and sounds like a genuine suggestion.',
    },
    {
      prompt: "Knowing wine pairings transforms every upsell from a sales pitch into an expert recommendation.",
      answer: "true",
      explanation: "Product knowledge is the foundation. A confident pairing suggestion makes the guest feel cared for rather than sold to.",
    },
    {
      prompt: "The best time to suggest a dessert is after the guest has already asked for the bill.",
      answer: "false",
      explanation: "Offering the dessert menu as plates are cleared captures the impulse decision before the guest mentally checks out and says they are too full.",
    },
    {
      prompt: "Genuine enthusiasm when suggesting a premium spirit makes the upsell feel like a recommendation, not a pitch.",
      answer: "true",
      explanation: "Tone and intent determine whether a suggestion feels like care or a sales grab. Real enthusiasm is the difference.",
    },
    {
      prompt: "Upselling techniques only work on guests who are already planning to spend a lot.",
      answer: "false",
      explanation: "Casual pub guests are often the most receptive to a simple, confident suggestion from a staff member they trust. Every cover is an opportunity.",
    },
  ],
};
