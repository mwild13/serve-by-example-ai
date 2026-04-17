/**
 * scaffolded-questions.ts — Level 1-3 question and descriptor data
 *
 * Level 1: Rapid-Fire Quiz — "True or False" / "This or That" style
 * Level 2: Descriptor Selection — pick 2 of 5 correct descriptors
 * Level 3: Advanced Descriptors — pick 3 of 5, shuffled every attempt
 *
 * Each module (bartending, sales, management) has its own question banks.
 * Level 1 requires 5 consecutive correct to advance.
 * Level 2 requires 8/10 correct selections to advance.
 * Level 3 requires 10/12 correct selections to advance.
 */

export type Module = "bartending" | "sales" | "management";

// ── Level 1: Rapid-Fire Quiz ─────────────────────────────────

export type QuizQuestion = {
  question: string;
  answer: boolean; // true = correct statement, false = incorrect
  explanation: string;
  tags: string[]; // for recommender matching
};

export const LEVEL1_QUESTIONS: Record<Module, QuizQuestion[]> = {
  bartending: [
    { question: "A Daiquiri is traditionally made with vodka.", answer: false, explanation: "A classic Daiquiri uses white rum, lime juice, and simple syrup.", tags: ["cocktails", "rum", "sours"] },
    { question: "Vermouth should be refrigerated after opening.", answer: true, explanation: "Vermouth is a fortified wine that oxidises quickly. Refrigerate and use within 4-6 weeks.", tags: ["spirits", "vermouth", "storage"] },
    { question: "A Martini should be shaken, not stirred, for the best result.", answer: false, explanation: "Spirit-forward cocktails like Martinis should be stirred to maintain clarity and silky texture.", tags: ["cocktails", "technique", "martini"] },
    { question: "The Guinness should be poured first when serving it alongside a Mojito and Chardonnay.", answer: true, explanation: "Guinness needs time to settle. Start it first, build the Mojito while it settles, then pour wine.", tags: ["beer", "workflow", "sequencing"] },
    { question: "An Old Fashioned is a sour-style cocktail.", answer: false, explanation: "An Old Fashioned is an ancestral cocktail: spirit, sugar, bitters, and dilution. No citrus.", tags: ["cocktails", "ancestral", "old-fashioned"] },
    { question: "ABV stands for Alcohol By Volume.", answer: true, explanation: "ABV is the standard measurement of alcohol content in a beverage.", tags: ["spirits", "fundamentals"] },
    { question: "You can substitute Scotch directly into a Margarita without changing the flavour profile.", answer: false, explanation: "Scotch's smokiness fundamentally changes the drink. Suggest a Penicillin or Whisky Sour instead.", tags: ["cocktails", "substitution", "whisky"] },
    { question: "A Sazerac uses an absinthe rinse on the glass.", answer: true, explanation: "The Sazerac is rinsed with absinthe (or Herbsaint), then built with rye/cognac, sugar, and Peychaud's bitters.", tags: ["cocktails", "technique", "sazerac"] },
    { question: "Bourbon must be made from at least 51% corn.", answer: true, explanation: "By law, Bourbon must have a mash bill of at least 51% corn and be aged in new charred oak barrels.", tags: ["spirits", "bourbon", "whisky"] },
    { question: "Rye whiskey is typically sweeter than Bourbon.", answer: false, explanation: "Rye is spicier and drier than Bourbon. Bourbon's higher corn content makes it sweeter.", tags: ["spirits", "rye", "bourbon"] },
    { question: "Shaking a cocktail adds more dilution than stirring.", answer: true, explanation: "Shaking introduces air and more ice contact, creating greater dilution and a frothy texture.", tags: ["technique", "shaking", "dilution"] },
    { question: "Triple Sec and Cointreau are the same product.", answer: false, explanation: "Cointreau is a premium brand of triple sec. Triple sec is a category of orange liqueur; quality varies widely.", tags: ["spirits", "liqueurs", "orange"] },
    { question: "London Dry Gin must be made in London.", answer: false, explanation: "London Dry is a production method (no added sugar post-distillation), not a geographic requirement.", tags: ["spirits", "gin", "production"] },
    { question: "Egg white in a cocktail adds foam and body but no flavour.", answer: true, explanation: "Egg white creates a velvety foam texture. It's flavour-neutral when properly shaken.", tags: ["technique", "egg-white", "texture"] },
    { question: "A Highball is typically served in a rocks glass.", answer: false, explanation: "A Highball is served in a tall (highball/collins) glass with ice and a carbonated mixer.", tags: ["cocktails", "glassware", "highball"] },
    { question: "Bitters are used in dashes, not full pours.", answer: true, explanation: "Bitters are highly concentrated flavouring agents. A few dashes is standard.", tags: ["spirits", "bitters", "technique"] },
    { question: "Prosecco and Champagne are the same type of wine.", answer: false, explanation: "Champagne comes from the Champagne region of France and uses méthode champenoise. Prosecco is Italian and uses the Charmat method.", tags: ["wine", "sparkling", "champagne"] },
    { question: "Muddling should always be aggressive to extract maximum flavour.", answer: false, explanation: "Gentle muddling releases oils and flavour. Over-muddling herbs like mint creates bitter compounds.", tags: ["technique", "muddling", "herbs"] },
    { question: "A standard shot in Australia is 30ml.", answer: true, explanation: "A standard nip/shot in Australia is 30ml. This differs from US (44ml) and UK (25ml) standards.", tags: ["fundamentals", "measurement", "standards"] },
    { question: "Tequila is made from blue agave.", answer: true, explanation: "100% Tequila is made exclusively from blue Weber agave, grown primarily in Jalisco, Mexico.", tags: ["spirits", "tequila", "agave"] },
  ],
  sales: [
    { question: "The best time to suggest an appetiser is after guests have ordered mains.", answer: false, explanation: "Suggest starters early while guests are settling in, framing them as easy to share while deciding.", tags: ["upselling", "timing", "appetisers"] },
    { question: "Offering a taste of a premium wine reduces the guest's decision risk.", answer: true, explanation: "Sampling lets the guest experience the upgrade themselves, which is more persuasive than description alone.", tags: ["upselling", "sampling", "wine"] },
    { question: "Telling a guest their first choice is not good is an effective upsell technique.", answer: false, explanation: "Never dismiss the guest's choice. Anchor their selection, then describe a premium upgrade with a clear benefit.", tags: ["upselling", "technique", "respect"] },
    { question: "A table of four ordering individual glasses should always be offered a bottle.", answer: true, explanation: "Show the value comparison and frame it as a better shared experience, not just a cheaper option.", tags: ["upselling", "wine", "bottle-sell"] },
    { question: "Pairing a dessert suggestion with an espresso order is a strong add-on opportunity.", answer: true, explanation: "Coffee moments are natural pairing opportunities — a small dessert feels easy and complementary.", tags: ["upselling", "pairing", "dessert"] },
    { question: "Saying 'everything is good' is an effective answer when asked for a recommendation.", answer: false, explanation: "Be specific. Recommend one standout dish and explain why it's performing well tonight.", tags: ["sales-technique", "recommendations", "specificity"] },
    { question: "Acknowledging a celebration provides a natural upsell opportunity.", answer: true, explanation: "Occasion-based selling feels genuine when the suggestion matches the emotion at the table.", tags: ["upselling", "occasions", "champagne"] },
    { question: "Pushing the full dessert menu to a full table is more effective than suggesting one to share.", answer: false, explanation: "Reduce commitment — frame it as 'a few bites to share' rather than a full extra course.", tags: ["upselling", "dessert", "technique"] },
    { question: "A premium spirit upsell should explain the taste difference in the specific drink ordered.", answer: true, explanation: "Keep the upsell relevant — describe how the premium spirit changes their exact serve.", tags: ["upselling", "spirits", "premiumisation"] },
    { question: "Speed of service has no impact on average spend.", answer: false, explanation: "Efficient, attentive service creates comfort and trust, leading to more orders and higher spend.", tags: ["service", "spend", "efficiency"] },
    { question: "It is better to recommend two starters for the table than leave guests to browse the menu alone.", answer: true, explanation: "Leading the table with a recommendation creates momentum and lifts average spend.", tags: ["upselling", "starters", "leadership"] },
    { question: "Describing a dish as 'popular tonight' is more persuasive than 'you should try this'.", answer: true, explanation: "Social proof ('other guests are loving it') is less pushy and more credible than a direct command.", tags: ["sales-technique", "social-proof", "language"] },
    { question: "You should always upsell every guest at every opportunity.", answer: false, explanation: "Read the table. Over-selling damages trust. The best upsells feel helpful, not mechanical.", tags: ["sales-technique", "timing", "reading-guests"] },
    { question: "Framing an upsell as 'for the table' reduces individual decision pressure.", answer: true, explanation: "Shared recommendations feel lower-commitment and let the table decide collectively.", tags: ["upselling", "technique", "group-sell"] },
    { question: "Menu knowledge is more important than sales technique.", answer: false, explanation: "Both matter equally. Product knowledge provides credibility; technique provides opportunity.", tags: ["fundamentals", "balance", "knowledge"] },
    { question: "Guests who say they are 'too full' can never be sold dessert.", answer: false, explanation: "A small shared dessert for a celebration, or a light option, can work when framed correctly.", tags: ["upselling", "dessert", "objection-handling"] },
    { question: "The phrase 'would you like anything else?' is an effective closing technique.", answer: false, explanation: "It's too passive. Suggest something specific: 'Can I get you a coffee or a small tiramisu to finish?'", tags: ["sales-technique", "closing", "specificity"] },
    { question: "Describing a wine by region, grape, and one tasting note is more effective than a paragraph.", answer: true, explanation: "Keep descriptions concise and confident. One clear benefit beats information overload.", tags: ["wine", "description", "brevity"] },
    { question: "Seasonality is irrelevant to food and drink recommendations.", answer: false, explanation: "Seasonal suggestions feel more relevant, fresher, and show genuine product knowledge.", tags: ["recommendations", "seasonality", "knowledge"] },
    { question: "Pre-shift briefings on specials improve the team's ability to sell.", answer: true, explanation: "When staff know what to sell and why, recommendations become confident and specific.", tags: ["preparation", "briefing", "team-sell"] },
  ],
  management: [
    { question: "Written progression plans improve staff retention.", answer: true, explanation: "Clear career paths and milestone check-ins keep staff engaged and reduce attrition.", tags: ["retention", "progression", "development"] },
    { question: "The best way to develop a reluctant leader is to give them a formal title immediately.", answer: false, explanation: "Give them small leadership moments first to build confidence before a formal title change.", tags: ["leadership", "coaching", "development"] },
    { question: "Pre-shift huddles should be longer than 10 minutes to be effective.", answer: false, explanation: "5-minute focused huddles work best. Keep it tight: wins, priorities, and the service goal.", tags: ["operations", "huddles", "communication"] },
    { question: "When a strong staff member resigns, it is usually only about money.", answer: false, explanation: "Resignations often signal deeper issues: feeling undervalued, lack of growth, or poor communication.", tags: ["retention", "feedback", "culture"] },
    { question: "Peer recognition systems should require mandatory participation.", answer: false, explanation: "Forced recognition feels inauthentic. Keep it voluntary with manager support to normalise it.", tags: ["culture", "recognition", "motivation"] },
    { question: "Work-life balance directly affects long-term service quality.", answer: true, explanation: "Sustainable rosters protect the people delivering service, which protects standards.", tags: ["rostering", "wellbeing", "sustainability"] },
    { question: "Financial literacy in managers should focus only on top-line revenue.", answer: false, explanation: "Focus on metrics managers can influence: labour %, margin, and average spend per cover.", tags: ["finance", "management-skills", "literacy"] },
    { question: "A 'regulars file' system is too invasive and should be avoided.", answer: false, explanation: "Done respectfully — names, favourite orders, harmless preferences — it deepens service warmth.", tags: ["service", "regulars", "personalisation"] },
    { question: "During a crisis, the person who takes charge should be the longest-tenured staff member.", answer: false, explanation: "Choose the person others naturally follow under pressure, not just the most senior.", tags: ["crisis", "leadership", "delegation"] },
    { question: "Structured development programs need individual goals, not a one-size-fits-all plan.", answer: true, explanation: "People buy in when they can choose goals relevant to their own career aspirations.", tags: ["development", "individualisation", "buy-in"] },
    { question: "Micromanaging former peers after promotion is a natural phase that resolves itself.", answer: false, explanation: "It must be actively addressed. Delegate with clear outcomes and guardrails, not step-by-step control.", tags: ["leadership", "delegation", "promotion"] },
    { question: "Weekly reflection practices should be modelled by the manager first.", answer: true, explanation: "When the manager shares first, it normalises the practice and makes it feel safe.", tags: ["culture", "reflection", "leading-by-example"] },
    { question: "Visa sponsorship conversations should start well before the deadline.", answer: true, explanation: "Early conversations build trust and give both sides time to plan realistically.", tags: ["compliance", "sponsorship", "planning"] },
    { question: "Cross-department conflict should be resolved by backing the department you trust most.", answer: false, explanation: "Reset both teams around shared guest outcomes instead of defending departments.", tags: ["conflict", "teamwork", "communication"] },
    { question: "Responsible service training is only the responsibility of senior staff.", answer: false, explanation: "All staff must understand responsible service obligations. Use real situations to teach in context.", tags: ["compliance", "training", "responsibility"] },
    { question: "Purpose-led onboarding is less effective than task-based onboarding.", answer: false, explanation: "Explaining the 'why' behind standards helps new staff internalise values, not just memorise rules.", tags: ["onboarding", "culture", "purpose"] },
    { question: "A strong culture investment is difficult to justify financially.", answer: false, explanation: "Tie culture spend to retention, recruitment cost, and operational stability for clear ROI.", tags: ["culture", "finance", "roi"] },
    { question: "Coaching should always address what went wrong before what went right.", answer: false, explanation: "Leading with strengths builds psychological safety. Then address the growth area constructively.", tags: ["coaching", "feedback", "technique"] },
    { question: "Performance issues should always be treated the same regardless of cause.", answer: false, explanation: "Diagnose whether the issue is capability (coach) or commitment (accountability) before responding.", tags: ["performance", "coaching", "discipline"] },
    { question: "Transparent team communication reduces gossip and uncertainty.", answer: true, explanation: "Clear, honest communication from management prevents information vacuums that breed rumour.", tags: ["communication", "transparency", "culture"] },
  ],
};

// ── Level 2/3: Descriptor Selection ──────────────────────────

export type DescriptorQuestion = {
  prompt: string;
  descriptors: string[]; // exactly 5 options
  correctIndices: number[]; // L2: 2 correct, L3: 3 correct
  explanation: string;
  tags: string[];
};

export const LEVEL2_DESCRIPTORS: Record<Module, DescriptorQuestion[]> = {
  bartending: [
    {
      prompt: "A guest says they want something 'refreshing but not too sweet'. Which two descriptors best guide your recommendation?",
      descriptors: ["Citrus-forward", "Sugar-heavy", "Herbaceous", "Creamy", "Bitter-dry"],
      correctIndices: [0, 4],
      explanation: "Citrus-forward and bitter-dry profiles deliver refreshment without excessive sweetness.",
      tags: ["flavour-profiling", "guest-reading", "recommendations"],
    },
    {
      prompt: "When building a classic Daiquiri, which two elements are most critical to get right?",
      descriptors: ["Fresh lime juice", "Blue curaçao", "Correct rum-to-citrus ratio", "Chocolate bitters", "Crushed ice"],
      correctIndices: [0, 2],
      explanation: "A Daiquiri depends on fresh citrus and precise spirit-to-acid balance.",
      tags: ["cocktails", "sours", "technique"],
    },
    {
      prompt: "Your vermouth Martini tastes flat and lifeless. Which two factors are most likely the cause?",
      descriptors: ["Stale vermouth", "Incorrect olive", "Insufficient dilution", "Wrong gin brand", "Too much ice"],
      correctIndices: [0, 2],
      explanation: "Oxidised vermouth and inadequate stirring (dilution) are the most common Martini killers.",
      tags: ["cocktails", "martini", "troubleshooting"],
    },
    {
      prompt: "When explaining Bourbon vs Rye to a guest, which two differences are most important to highlight?",
      descriptors: ["Sweetness vs spice", "Colour difference", "Mash bill composition", "Country of origin", "Bottle shape"],
      correctIndices: [0, 2],
      explanation: "The flavour profile (sweet vs spicy) and the legal mash bill requirements are the key distinctions.",
      tags: ["spirits", "bourbon", "rye", "education"],
    },
    {
      prompt: "A guest orders a Sazerac. Which two preparation steps are unique to this cocktail?",
      descriptors: ["Absinthe rinse", "Muddled fruit", "Lemon peel expression", "Shaken with ice", "Served in a coupe"],
      correctIndices: [0, 2],
      explanation: "The absinthe (or Herbsaint) rinse and expressed lemon peel (discarded) are Sazerac signatures.",
      tags: ["cocktails", "sazerac", "technique"],
    },
    {
      prompt: "When declining service to an intoxicated guest, which two approaches protect both the guest and the venue?",
      descriptors: ["Polite but firm refusal", "Ignore the situation", "Offer water and food alternatives", "Serve lighter drinks", "Ask other guests to decide"],
      correctIndices: [0, 2],
      explanation: "A clear, respectful refusal combined with alternative care (water, food) protects everyone.",
      tags: ["responsible-service", "compliance", "communication"],
    },
    {
      prompt: "What two factors most affect the texture of a shaken cocktail?",
      descriptors: ["Ice quality and size", "Glass temperature", "Shake duration and vigour", "Garnish type", "Spirit proof"],
      correctIndices: [0, 2],
      explanation: "Ice quality affects dilution rate while shake technique controls aeration and temperature.",
      tags: ["technique", "shaking", "texture"],
    },
    {
      prompt: "A guest wants a 'strong but smooth' cocktail. Which two qualities should guide your recommendation?",
      descriptors: ["High ABV spirit base", "Citrus acidity", "Rich mouthfeel or sweetness", "Carbonation", "Egg white"],
      correctIndices: [0, 2],
      explanation: "Spirit-forward with softening elements (sugar, fat-wash, syrup) balances strength with smoothness.",
      tags: ["recommendations", "flavour-profiling", "spirit-forward"],
    },
    {
      prompt: "When sequencing three orders (Mojito, Guinness, Chardonnay), which two actions ensure the best workflow?",
      descriptors: ["Pour Guinness first (settle time)", "Make Mojito first (most complex)", "Set up all glassware before starting", "Pour Chardonnay first (fastest)", "Build all three simultaneously"],
      correctIndices: [0, 2],
      explanation: "Starting the Guinness first uses its settle time. Pre-setting glassware prevents mid-build chaos.",
      tags: ["workflow", "sequencing", "efficiency"],
    },
    {
      prompt: "Which two signs indicate a cocktail was over-diluted?",
      descriptors: ["Watery flavour, weak spirit presence", "Excessive foam", "Loss of colour intensity", "Too much garnish", "Glass sweating heavily"],
      correctIndices: [0, 2],
      explanation: "Weak taste and faded colour signal too much ice contact or melting during the build.",
      tags: ["technique", "dilution", "troubleshooting"],
    },
  ],
  sales: [
    {
      prompt: "A table hasn't opened the food menu yet. Which two approaches best introduce a starter?",
      descriptors: ["Suggest a specific pairing with their drinks", "Recite the full appetiser menu", "Frame it as something easy to share", "Wait for them to ask", "Bring a sample without asking"],
      correctIndices: [0, 2],
      explanation: "Linking the suggestion to their drinks + framing as low-commitment drives natural add-ons.",
      tags: ["upselling", "starters", "timing"],
    },
    {
      prompt: "Which two elements make a premium wine upsell feel natural rather than pushy?",
      descriptors: ["One clear tasting benefit", "Listing every premium option", "Offering a taste to reduce risk", "Mentioning the higher price first", "Comparing it to beer"],
      correctIndices: [0, 2],
      explanation: "One specific benefit + a free taste lets the guest experience the value, not just hear about cost.",
      tags: ["upselling", "wine", "sampling"],
    },
    {
      prompt: "A guest orders a well vodka soda. Which two techniques best upsell to premium?",
      descriptors: ["Name a specific premium vodka", "Say 'do you want premium?'", "Describe how it changes the drink's finish", "Mention the price difference", "Suggest switching to gin instead"],
      correctIndices: [0, 2],
      explanation: "A specific recommendation with a sensory difference description is more compelling than a generic ask.",
      tags: ["upselling", "spirits", "premiumisation"],
    },
    {
      prompt: "A table is celebrating a birthday. Which two actions turn the occasion into a genuine upsell?",
      descriptors: ["Acknowledge warmly and suggest one dessert to share", "Push the Champagne immediately", "Position the dessert as part of the celebration", "Offer a discount on the bill", "Ignore it until they mention it again"],
      correctIndices: [0, 2],
      explanation: "Personal warmth + milestone positioning makes the suggestion feel celebratory, not transactional.",
      tags: ["occasion-selling", "celebrations", "desserts"],
    },
    {
      prompt: "When recommending tonight's special, which two things make the recommendation land?",
      descriptors: ["One confident dish with a reason (e.g. 'selling really well tonight')", "Reading the full specials list", "A concrete beverage pairing attached", "Mentioning it's the most expensive option", "Leaving the decision entirely to the table"],
      correctIndices: [0, 2],
      explanation: "Specificity + a pairing lifts both confidence and average spend per cover.",
      tags: ["recommendations", "specials", "pairing"],
    },
    {
      prompt: "Which two language patterns help close an upsell without pressure?",
      descriptors: ["'Other guests tonight have been loving…'", "'You really should get…'", "'Would you like to try a taste?'", "'It's our most expensive option'", "'I don't know, what do you think?'"],
      correctIndices: [0, 2],
      explanation: "Social proof ('others love it') and sampling ('try a taste') lower pressure and build trust.",
      tags: ["sales-technique", "language", "closing"],
    },
    {
      prompt: "A guest orders an espresso. Which two add-on suggestions work best?",
      descriptors: ["A small dessert as a classic pairing", "A cocktail recommendation", "A petit four or biscotti", "Another main course", "A glass of water"],
      correctIndices: [0, 2],
      explanation: "Coffee naturally pairs with small sweets. Low-friction add-ons feel natural at this stage.",
      tags: ["pairing", "coffee", "dessert", "add-ons"],
    },
    {
      prompt: "Four guests order four different wines by the glass. Which two arguments support a bottle recommendation?",
      descriptors: ["Bottle is better value than four individual glasses", "Bottles look more impressive", "A shared bottle creates a better table experience", "It's less work for you", "The glasses might run out"],
      correctIndices: [0, 2],
      explanation: "Value comparison + shared experience. The recommendation should feel generous, not lazy.",
      tags: ["wine", "bottle-sell", "value", "experience"],
    },
    {
      prompt: "When is it appropriate NOT to upsell?",
      descriptors: ["Guest clearly in a hurry and has decided", "Guest orders something mid-range", "Guest seems interested in the menu", "Guest asks 'what do you recommend?'", "Guest signals they want to be left alone"],
      correctIndices: [0, 4],
      explanation: "Reading the room is key. Rushed or disengaged guests respond poorly to additional suggestions.",
      tags: ["sales-technique", "reading-guests", "timing"],
    },
    {
      prompt: "Which two metrics are most influenced by effective table-side selling?",
      descriptors: ["Average spend per cover", "Kitchen speed", "Guest return rate / satisfaction", "Staff rostering costs", "Venue cleanliness"],
      correctIndices: [0, 2],
      explanation: "Good selling directly lifts average spend and, when done well, improves overall satisfaction.",
      tags: ["metrics", "business-impact", "sales"],
    },
  ],
  management: [
    {
      prompt: "A junior staff member feels stuck. Which two actions most effectively build a progression path?",
      descriptors: ["Set clear next skills and milestone check-ins", "Leave them to figure it out", "Explain how attitude leads to expanded responsibility", "Promote them immediately", "Reduce their current duties"],
      correctIndices: [0, 2],
      explanation: "Visible milestones + reinforcing that consistency leads to progression keeps them engaged.",
      tags: ["development", "retention", "progression"],
    },
    {
      prompt: "Which two pre-shift huddle elements have the most impact on service quality?",
      descriptors: ["Recognise yesterday's wins", "Read out the entire booking list", "Set the service goal for this shift", "Discuss rosters for next week", "Review financial reports"],
      correctIndices: [0, 2],
      explanation: "Quick recognition + a focused service goal creates energy and alignment without dragging.",
      tags: ["operations", "huddles", "communication"],
    },
    {
      prompt: "When introducing a development program, which two approaches get buy-in from skeptical staff?",
      descriptors: ["Connect it to pay growth and future opportunities", "Make it mandatory immediately", "Let each person choose individual goals", "Skip explanation and assign tasks", "Only apply it to new hires"],
      correctIndices: [0, 2],
      explanation: "Relevance to personal upside + individual goal-setting converts skeptics into participants.",
      tags: ["development", "buy-in", "change-management"],
    },
    {
      prompt: "After a strong performer resigns, which two actions should you take first?",
      descriptors: ["Review recognition and career progression patterns", "Assume they left for money only", "Hold retention conversations with remaining key staff", "Do nothing until someone else leaves", "Lower your hiring standards to fill the gap quickly"],
      correctIndices: [0, 2],
      explanation: "One resignation is system feedback. Act on it before others follow the same path.",
      tags: ["retention", "feedback", "culture"],
    },
    {
      prompt: "Which two qualities should define the person you empower during a crisis?",
      descriptors: ["Calm under pressure", "Longest tenure on the team", "Trusted by the rest of the team", "Loudest voice in the room", "Most technically skilled"],
      correctIndices: [0, 2],
      explanation: "Calm influence + peer trust matters more than seniority or volume under pressure.",
      tags: ["crisis", "leadership", "delegation"],
    },
    {
      prompt: "When coaching a newly promoted manager who micromanages, which two corrections are most important?",
      descriptors: ["Teach outcome-based delegation with guardrails", "Tell them to stop caring about quality", "Accept that some variation is part of development", "Take tasks back from them", "Reassign their team"],
      correctIndices: [0, 2],
      explanation: "Clear delegation framework + accepting learning variation prevents control-driven burnout.",
      tags: ["leadership", "delegation", "coaching"],
    },
    {
      prompt: "Which two approaches make financial literacy training stick for junior managers?",
      descriptors: ["Focus on a few metrics they can actually influence", "Expose full P&L detail immediately", "Translate numbers into operational choices", "Quiz them on accounting principles", "Wait until they are promoted to senior roles"],
      correctIndices: [0, 2],
      explanation: "Actionable metrics + operational translation make numbers feel relevant, not overwhelming.",
      tags: ["finance", "management-skills", "development"],
    },
    {
      prompt: "Front-of-house and kitchen are blaming each other. Which two interventions help most?",
      descriptors: ["Reset both teams around shared guest outcomes", "Pick the department you trust more", "Agree clearer call times and escalation rules", "Separate the teams completely", "Add more meetings"],
      correctIndices: [0, 2],
      explanation: "Shared purpose + practical fixes (clearer processes) resolves blame loops.",
      tags: ["conflict", "teamwork", "communication"],
    },
    {
      prompt: "A junior staff member fails to act during a responsible service situation. Which two actions are appropriate?",
      descriptors: ["Step in immediately to handle the situation", "Wait until the next shift to address it", "Use it as a real-time teaching moment afterward", "Publicly reprimand the staff member", "Ignore it if no harm was done"],
      correctIndices: [0, 2],
      explanation: "Protect compliance first, then teach in context so the learning sticks.",
      tags: ["compliance", "coaching", "responsible-service"],
    },
    {
      prompt: "Which two elements make purpose-led onboarding effective?",
      descriptors: ["Explain the service philosophy behind everyday decisions", "Only cover task lists and rules", "Use real venue examples of great service", "Show a generic company video", "Focus on penalties for mistakes"],
      correctIndices: [0, 2],
      explanation: "Philosophy context + concrete examples help new staff understand the 'why' behind standards.",
      tags: ["onboarding", "culture", "purpose"],
    },
  ],
};

// Level 3 uses the same structure but requires 3 correct selections per question
export const LEVEL3_DESCRIPTORS: Record<Module, DescriptorQuestion[]> = {
  bartending: [
    {
      prompt: "A guest says 'surprise me — I like gin but I'm tired of G&T.' Which three of these steps build the best recommendation?",
      descriptors: ["Ask about their flavour preference (citrus, herbal, bitter, sweet)", "Make any gin cocktail without asking questions", "Suggest one specific drink and explain why it fits", "Check what gin brands you have in stock first", "Describe the drink's flavour before making it"],
      correctIndices: [0, 2, 4],
      explanation: "Clarify taste → recommend with reason → set flavour expectations. The full guest-reading flow.",
      tags: ["guest-reading", "recommendations", "gin"],
    },
    {
      prompt: "Building a proper Sazerac requires which three critical steps?",
      descriptors: ["Absinthe rinse the chilled glass", "Add soda water to lengthen the drink", "Use Peychaud's bitters specifically", "Express a lemon peel then discard it", "Shake vigorously with ice"],
      correctIndices: [0, 2, 3],
      explanation: "Absinthe rinse, Peychaud's bitters, and expressed lemon peel are the Sazerac's non-negotiables.",
      tags: ["cocktails", "sazerac", "technique"],
    },
    {
      prompt: "It's 10 minutes to close and a group orders six cocktails. Which three actions protect service quality?",
      descriptors: ["Acknowledge warmly and explain realistic options", "Accept everything silently", "Split prep tasks across the team", "Offer a streamlined recommendation", "Tell them the bar is closed"],
      correctIndices: [0, 2, 3],
      explanation: "Warm acknowledgement + team coordination + realistic/streamlined options balance hospitality with practicality.",
      tags: ["workflow", "closing", "team-communication"],
    },
    {
      prompt: "Curating a bourbon-vs-rye whiskey flight requires which three elements?",
      descriptors: ["One approachable bourbon (e.g. Maker's Mark)", "A Scotch for comparison", "One high-rye bourbon (e.g. Bulleit)", "One straight rye (e.g. Rittenhouse)", "A blended whisky"],
      correctIndices: [0, 2, 3],
      explanation: "Three distinct points on the sweetness-spice spectrum: pure bourbon → high-rye bourbon → straight rye.",
      tags: ["spirits", "whisky", "flights", "education"],
    },
    {
      prompt: "When a guest's drink needs improving, which three factors should you diagnose first?",
      descriptors: ["Dilution level (over/under stirred or shaken)", "Freshness of modifiers (vermouth, juices)", "Temperature of the glass and liquid", "The colour of the garnish", "Whether the ice looks pretty"],
      correctIndices: [0, 1, 2],
      explanation: "Dilution, ingredient freshness, and temperature are the three levers that most affect drink quality.",
      tags: ["technique", "troubleshooting", "quality-control"],
    },
    {
      prompt: "Responsible service when declining an intoxicated guest requires which three actions?",
      descriptors: ["Polite but firm refusal", "Involve a manager or security if needed", "Offer water, food, or transport alternatives", "Serve one more to avoid conflict", "Step away and let another staff handle it alone"],
      correctIndices: [0, 1, 2],
      explanation: "Clear refusal + backup support + duty of care alternatives protect staff, guest, and venue licence.",
      tags: ["responsible-service", "compliance", "duty-of-care"],
    },
    {
      prompt: "Which three fundamentals define a well-executed spirit-forward cocktail?",
      descriptors: ["Stirred, never shaken", "Proper dilution through technique", "Premium or well-chosen base spirit", "Heavy citrus for balance", "Served over crushed ice"],
      correctIndices: [0, 1, 2],
      explanation: "Spirit-forward drinks require stirring for clarity, measured dilution, and quality spirit selection.",
      tags: ["cocktails", "spirit-forward", "technique"],
    },
    {
      prompt: "Setting up proper mise-en-place before service includes which three priorities?",
      descriptors: ["Pre-cut all garnishes and prep citrus", "Check vermouth and perishable modifier freshness", "Pre-chill glassware for key serves", "Count the cash register", "Decide tonight's playlist"],
      correctIndices: [0, 1, 2],
      explanation: "Garnish prep, modifier freshness checks, and glassware temperature are the bartender's pre-game.",
      tags: ["workflow", "mise-en-place", "preparation"],
    },
    {
      prompt: "Which three mistakes commonly ruin a Mojito?",
      descriptors: ["Over-muddling the mint (releases bitter compounds)", "Using granulated sugar instead of simple syrup", "Flat or low-quality soda water", "Using white rum instead of dark", "Too much ice"],
      correctIndices: [0, 1, 2],
      explanation: "Bitter mint, undissolved sugar, and flat soda are classic Mojito execution failures.",
      tags: ["cocktails", "mojito", "troubleshooting"],
    },
    {
      prompt: "When a guest requests a substitution that fundamentally changes a cocktail, which three steps handle it professionally?",
      descriptors: ["Explain how the substitution shifts the flavour profile", "Refuse the request outright", "Suggest a better-fit alternative cocktail", "Offer a compromise riff with clear expectations", "Make it without comment"],
      correctIndices: [0, 2, 3],
      explanation: "Educate on impact → suggest alternatives → offer a compromise. The guest feels heard and guided.",
      tags: ["guest-management", "substitutions", "communication"],
    },
  ],
  sales: [
    {
      prompt: "A table of eight is indecisive. Which three actions help you lead them to a starter order?",
      descriptors: ["Recommend two specific crowd-pleasers", "Read the full appetiser menu aloud", "Explain why they work for sharing", "Frame starters as something to enjoy while deciding on mains", "Wait for someone to take charge"],
      correctIndices: [0, 2, 3],
      explanation: "Specific recommendation + sharing frame + buying time makes the suggestion irresistible.",
      tags: ["upselling", "tables", "starters", "group-sell"],
    },
    {
      prompt: "Upselling a sirloin to ribeye requires which three elements?",
      descriptors: ["Explain the richer marbling and eating experience", "Tell them the sirloin isn't worth it", "Keep the guest in control of the decision", "Describe a specific flavour difference", "Mention it's more expensive first"],
      correctIndices: [0, 2, 3],
      explanation: "Sensory value + guest autonomy + specific difference. Never dismiss their original choice.",
      tags: ["upselling", "food", "premiumisation"],
    },
    {
      prompt: "Building a wine-by-the-glass to wine-by-the-bottle upsell uses which three strategies?",
      descriptors: ["Show the price comparison (bottle vs 4 glasses)", "Tell them individual glasses taste worse", "Frame the bottle as a better shared experience", "Let the table decide without pressure", "Suggest the most expensive bottle available"],
      correctIndices: [0, 2, 3],
      explanation: "Value maths + experience framing + low pressure. The recommendation should feel generous.",
      tags: ["wine", "bottle-sell", "group-sell"],
    },
    {
      prompt: "Which three techniques help a guest trade up from a well spirit to premium?",
      descriptors: ["Name one specific premium brand", "Say 'would you like premium?' generically", "Describe the flavour improvement in their exact drink", "Offer to let them taste the difference", "Mention only the price difference"],
      correctIndices: [0, 2, 3],
      explanation: "Specific brand + flavour in context + sampling option. Make the upgrade tangible.",
      tags: ["upselling", "spirits", "premiumisation", "sampling"],
    },
    {
      prompt: "When you overhear a celebration at a table, which three actions create a genuine opportunity?",
      descriptors: ["Acknowledge the occasion warmly and personally", "Push the most expensive Champagne immediately", "Make one tailored drink or dessert suggestion", "Position the suggestion as part of the celebration (not a sale)", "Wait for them to order something celebratory themselves"],
      correctIndices: [0, 2, 3],
      explanation: "Personal warmth + one tailored suggestion + celebratory framing. Let the moment do the selling.",
      tags: ["occasion-selling", "celebrations", "personalisation"],
    },
    {
      prompt: "Which three behaviours build guest trust during the ordering process?",
      descriptors: ["Showing genuine product knowledge with confidence", "Recommending what earns the most commission", "Reading the table's mood and pace", "Describing options concisely and clearly", "Rushing through recommendations to save time"],
      correctIndices: [0, 2, 3],
      explanation: "Confidence + social awareness + clear communication. Trust is the foundation of every upsell.",
      tags: ["trust", "service", "communication"],
    },
    {
      prompt: "What three factors make an espresso-and-dessert pairing suggestion work?",
      descriptors: ["Link the coffee naturally to a complementary sweet item", "Offer the most expensive dessert", "Keep the suggestion small and low-commitment", "Suggest it as a classic finishing combination", "Bring the dessert without asking"],
      correctIndices: [0, 2, 3],
      explanation: "Natural pairing + low friction + classic framing. It should feel like the perfect natural ending.",
      tags: ["pairing", "coffee", "dessert", "closing"],
    },
    {
      prompt: "Pre-shift preparation for effective selling includes which three actions?",
      descriptors: ["Know tonight's specials and why they're good", "Memorise every price on the menu", "Taste or understand any new products", "Prepare one food-and-drink pairing recommendation", "Count the total number of bookings"],
      correctIndices: [0, 2, 3],
      explanation: "Product knowledge + tasting experience + prepared pairings arm you for confident recommendations.",
      tags: ["preparation", "specials", "product-knowledge"],
    },
    {
      prompt: "Which three signs tell you a table is NOT receptive to upselling right now?",
      descriptors: ["They have already decided quickly and firmly", "They are looking at the menu with interest", "They show closed body language or seem rushed", "They ask 'what do you recommend?'", "They have signalled they want to be left alone"],
      correctIndices: [0, 2, 4],
      explanation: "Quick deciders, rushed body language, and 'please leave us' signals all mean back off.",
      tags: ["reading-guests", "timing", "emotional-intelligence"],
    },
    {
      prompt: "Which three metrics does effective table-side selling most directly improve?",
      descriptors: ["Average spend per cover", "Kitchen prep speed", "Guest satisfaction and return likelihood", "Items per transaction", "Staff overtime costs"],
      correctIndices: [0, 2, 3],
      explanation: "Good selling lifts spend, satisfaction, and items per transaction simultaneously.",
      tags: ["metrics", "business-impact", "sales-outcomes"],
    },
  ],
  management: [
    {
      prompt: "Building a progression path for a junior staff member requires which three elements?",
      descriptors: ["Clear next skills to develop", "A formal pay rise immediately", "Scheduled milestone check-ins", "Explanation of how consistency leads to expanded opportunity", "Reduce their current responsibilities"],
      correctIndices: [0, 2, 3],
      explanation: "Skill targets + check-in cadence + motivational context. Visible progress prevents stagnation.",
      tags: ["development", "retention", "progression"],
    },
    {
      prompt: "An effective 5-minute pre-shift huddle includes which three elements?",
      descriptors: ["Recognise specific wins from the previous shift", "Review the full P&L for the week", "Set a clear, focused service goal", "Include a brief energy/connection moment", "Read the entire reservations list"],
      correctIndices: [0, 2, 3],
      explanation: "Recognition + goal + energy. Keep it tight and service-focused, not admin-heavy.",
      tags: ["operations", "huddles", "team-alignment"],
    },
    {
      prompt: "Resolving conflict between front-of-house and kitchen requires which three steps?",
      descriptors: ["Reset both teams around shared guest outcomes", "Pick a side based on who you trust", "Agree on clearer call times and escalation rules", "Conduct post-service debriefs to build understanding", "Penalise the department at fault"],
      correctIndices: [0, 2, 3],
      explanation: "Shared purpose + practical process fixes + ongoing debriefs resolve blame cycles.",
      tags: ["conflict", "teamwork", "communication", "operations"],
    },
    {
      prompt: "When a staff member froze during a crisis, which three factors should inform your response?",
      descriptors: ["Ask what they saw, thought, and attempted before judging", "Issue a warning immediately", "Distinguish between capability gap and disengagement", "Match the coaching response to the actual cause", "Treat all failure the same way"],
      correctIndices: [0, 2, 3],
      explanation: "Diagnose before responding. Capability gets coaching; disengagement gets accountability.",
      tags: ["crisis", "coaching", "performance-management"],
    },
    {
      prompt: "Making the business case for culture investment requires which three arguments?",
      descriptors: ["Connect culture spend to measurable retention improvements", "Argue it's just nice to have", "Show how it reduces recruitment and training costs", "Demonstrate impact on service consistency", "Focus only on team happiness"],
      correctIndices: [0, 2, 3],
      explanation: "Retention ROI + cost reduction + service consistency. Build the case in business language.",
      tags: ["culture", "finance", "roi", "stakeholder-management"],
    },
    {
      prompt: "Introducing financial literacy to junior managers should include which three approaches?",
      descriptors: ["Start with metrics they can directly influence (labour %, margin)", "Show full P&L immediately", "Translate numbers into operational decisions", "Build confidence gradually with practical examples", "Wait until they've been in role for a year"],
      correctIndices: [0, 2, 3],
      explanation: "Actionable metrics + operational relevance + graduated learning. Numbers should feel useful, not overwhelming.",
      tags: ["finance", "management-skills", "development"],
    },
    {
      prompt: "Supporting a reluctant leader into a management role requires which three strategies?",
      descriptors: ["Name the leadership qualities you already see in them", "Give them a manager title right away", "Provide small, supported leadership opportunities first", "Reduce the perceived leap from peer to leader", "Ask them to figure it out on their own"],
      correctIndices: [0, 2, 3],
      explanation: "Affirm strengths + staged opportunities + reduced perceived risk. Confidence grows through experience.",
      tags: ["leadership", "coaching", "development"],
    },
    {
      prompt: "Building a 'regulars file' system for junior staff should prioritise which three things?",
      descriptors: ["Track useful service notes: names, favourite orders, preferences", "Record personal/private information about guests", "Explain how it helps deliver warmer service", "Keep it simple enough to maintain consistently", "Make it optional to discourage participation"],
      correctIndices: [0, 2, 3],
      explanation: "Useful, respectful data + clear purpose + practical simplicity. Never cross into invasive details.",
      tags: ["service", "regulars", "personalisation", "training"],
    },
    {
      prompt: "When restructuring rosters to protect work-life balance, which three changes have the most impact?",
      descriptors: ["Rotate tough shifts rather than loading the same people", "Just hire more staff (quickest fix)", "Identify fatigue risks before they become burnout", "Communicate how sustainable rosters improve service long-term", "Reduce all shifts to minimum staffing"],
      correctIndices: [0, 2, 3],
      explanation: "Fair rotation + early fatigue detection + communication about the 'why' creates sustainable change.",
      tags: ["rostering", "wellbeing", "sustainability", "communication"],
    },
    {
      prompt: "Purpose-led onboarding for new staff should include which three elements?",
      descriptors: ["Explain the service philosophy behind everyday decisions", "Only cover task checklists and rules", "Use real examples of great service from your venue", "Connect standards to the 'why' so they're easier to internalise", "Focus on penalties for mistakes first"],
      correctIndices: [0, 2, 3],
      explanation: "Philosophy context + real examples + purpose-driven standards create engaged, values-led staff.",
      tags: ["onboarding", "culture", "purpose", "values"],
    },
  ],
};

// ── Utility: Shuffle descriptors for Level 3 ─────────────────

export function shuffleDescriptors(question: DescriptorQuestion): DescriptorQuestion {
  const indices = question.descriptors.map((_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledDescriptors = indices.map((i) => question.descriptors[i]);
  const newCorrectIndices = question.correctIndices.map((ci) => indices.indexOf(ci));
  return { ...question, descriptors: shuffledDescriptors, correctIndices: newCorrectIndices };
}

// ── Level unlock thresholds ──────────────────────────────────

export const LEVEL_THRESHOLDS = {
  /** Level 1 → Level 2: consecutive correct answers needed */
  level1ConsecutiveRequired: 5,
  /** Level 2 → Level 3: correct answers out of total questions */
  level2CorrectRequired: 8,
  level2TotalQuestions: 10,
  /** Level 3 → Level 4: correct answers out of total questions */
  level3CorrectRequired: 10,
  level3TotalQuestions: 10, // uses all 10 descriptors, shuffled
} as const;
