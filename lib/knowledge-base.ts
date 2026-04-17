/**
 * knowledge-base.ts — 101 Knowledge Base content data
 *
 * Categories: Spirits, Beer, Wine, Cocktails, Non-Alcoholic
 * Used by the KnowledgeBase component for the 101 Library.
 */

export type KBCategory = "spirits" | "beer" | "wine" | "cocktails" | "non-alcoholic";

export type KBSubCategory = {
  label: string;
  slug: string;
};

export type KBEntry = {
  title: string;
  category: KBCategory;
  subCategory: string; // slug
  content: string;
  keyFacts: string[];
  tags: string[];
};

export const KB_CATEGORIES: Record<KBCategory, { label: string; description: string; color: string; subCategories: KBSubCategory[] }> = {
  spirits: {
    label: "Spirits 101",
    description: "Base spirits, production methods, and flavour profiles every bartender and sales professional must know.",
    color: "#c68642",
    subCategories: [
      { label: "Vodka", slug: "vodka" },
      { label: "Gin", slug: "gin" },
      { label: "Rum", slug: "rum" },
      { label: "Tequila & Mezcal", slug: "tequila" },
      { label: "Bourbon", slug: "bourbon" },
      { label: "Scotch", slug: "scotch" },
      { label: "Rye Whiskey", slug: "rye" },
      { label: "Brandy & Cognac", slug: "brandy" },
      { label: "Liqueurs", slug: "liqueurs" },
    ],
  },
  beer: {
    label: "Beer 101",
    description: "Styles, serving temperatures, glassware, and flavour families for the major beer categories.",
    color: "#d4a017",
    subCategories: [
      { label: "Lagers", slug: "lagers" },
      { label: "Pale Ales & IPAs", slug: "pale-ales" },
      { label: "Stouts & Porters", slug: "stouts" },
      { label: "Wheat Beers", slug: "wheat-beers" },
      { label: "Sours & Wild Ales", slug: "sours" },
      { label: "Belgian Styles", slug: "belgian" },
    ],
  },
  wine: {
    label: "Wine 101",
    description: "Grape varieties, regions, serving, and pairing fundamentals for confident wine service.",
    color: "#8b1a1a",
    subCategories: [
      { label: "Red Wines", slug: "reds" },
      { label: "White Wines", slug: "whites" },
      { label: "Rosé", slug: "rose" },
      { label: "Sparkling", slug: "sparkling" },
      { label: "Fortified", slug: "fortified" },
      { label: "Wine Service", slug: "wine-service" },
    ],
  },
  cocktails: {
    label: "Cocktails 101",
    description: "Families, techniques, tools, and the building blocks of cocktail craft.",
    color: "#2e7d32",
    subCategories: [
      { label: "Sours Family", slug: "sours" },
      { label: "Spirit-Forward", slug: "spirit-forward" },
      { label: "Highballs", slug: "highballs" },
      { label: "Technique", slug: "technique" },
      { label: "Tools & Glassware", slug: "tools" },
      { label: "Garnish & Presentation", slug: "garnish" },
    ],
  },
  "non-alcoholic": {
    label: "Non-Alcoholic 101",
    description: "Zero-proof drinks, mocktails, premium soft drinks, and inclusive service.",
    color: "#1976d2",
    subCategories: [
      { label: "Mocktails", slug: "mocktails" },
      { label: "Premium Soft Drinks", slug: "premium-soft" },
      { label: "Coffee & Tea", slug: "coffee-tea" },
      { label: "Inclusive Service", slug: "inclusive-service" },
    ],
  },
};

export const KB_ENTRIES: KBEntry[] = [
  // ─── SPIRITS: Vodka ───────────────────────────────────────
  {
    title: "What is Vodka?",
    category: "spirits",
    subCategory: "vodka",
    content: "Vodka is a neutral spirit typically distilled from grains (wheat, rye, corn) or potatoes. Its defining characteristic is clean, neutral flavour with minimal residual taste. Quality vodka achieves smoothness through multiple distillations and filtration. It is the world's most versatile base spirit for cocktails because it lets other ingredients shine.",
    keyFacts: [
      "Typically distilled to 40% ABV (80 proof)",
      "Can be made from any fermentable material: grain, potato, grape, even milk whey",
      "Multiple distillations remove congeners for a cleaner taste",
      "Russia and Poland both claim origin, dating to the 8th-9th century",
      "Serve chilled or at room temperature; quality is evident neat",
    ],
    tags: ["spirits", "vodka", "fundamentals", "neutral-spirit"],
  },
  {
    title: "Premium vs Well Vodka",
    category: "spirits",
    subCategory: "vodka",
    content: "The difference between a well vodka and a premium expression lies in raw materials, distillation count, and filtration. Premium vodkas (Belvedere, Grey Goose, Ketel One) typically have smoother mouthfeel and less harsh finish. In mixed drinks, the difference is most noticeable in simple serves like a vodka soda where the spirit has nowhere to hide.",
    keyFacts: [
      "Well vodka: cost-effective, higher congener level, works in complex cocktails",
      "Premium vodka: smoother finish, better in simple serves (soda, martini)",
      "Upselling tip: describe the improvement in the exact drink they ordered",
      "A specific recommendation ('Try the Ketel One — it's noticeably smoother') beats a generic ask",
    ],
    tags: ["spirits", "vodka", "premiumisation", "upselling"],
  },

  // ─── SPIRITS: Gin ─────────────────────────────────────────
  {
    title: "What is Gin?",
    category: "spirits",
    subCategory: "gin",
    content: "Gin is a juniper-flavoured spirit made by redistilling a neutral base spirit with botanical ingredients. Juniper berries must be the dominant flavour. Beyond juniper, distillers add citrus peels, coriander, angelica root, orris root, and many other botanicals to create distinctive house styles.",
    keyFacts: [
      "London Dry: no added sugar after distillation, juniper-dominant (not geographically restricted)",
      "Plymouth: slightly sweeter, earthy, legally protected geographical indication",
      "New Western / Contemporary: juniper present but other botanicals take the lead",
      "Old Tom: slightly sweetened style, historical link to the Tom Collins",
      "Navy Strength: 57% ABV, originally so gunpowder would still light if doused",
    ],
    tags: ["spirits", "gin", "botanicals", "london-dry"],
  },

  // ─── SPIRITS: Rum ─────────────────────────────────────────
  {
    title: "What is Rum?",
    category: "spirits",
    subCategory: "rum",
    content: "Rum is distilled from sugarcane juice or molasses. It ranges from light and crisp (white rum) to dark, rich, and funky (Jamaican pot still). Ageing in oak adds colour, vanilla, and caramel notes. Rum is the backbone of tiki and tropical cocktails but also excels in spirit-forward drinks.",
    keyFacts: [
      "White/Silver: unaged or lightly filtered, clean for Daiquiris and Mojitos",
      "Gold/Aged: oak-aged, richer flavour, works in Old Fashioned variations",
      "Dark/Black: heavily aged or coloured, strong molasses character",
      "Rhum Agricole: made from fresh sugarcane juice (French Caribbean), grassy and vegetal",
      "Overproof: above 50% ABV, used as a float or for tiki drinks",
    ],
    tags: ["spirits", "rum", "sugarcane", "tiki"],
  },

  // ─── SPIRITS: Tequila ─────────────────────────────────────
  {
    title: "What is Tequila?",
    category: "spirits",
    subCategory: "tequila",
    content: "Tequila is made exclusively from blue Weber agave, primarily in the Jalisco region of Mexico. 100% agave tequilas are labelled as such; mixto tequilas can contain up to 49% non-agave sugars. Mezcal is the broader category — tequila is technically a type of mezcal, but mezcal can use any agave variety and often has a smoky character from pit-roasting.",
    keyFacts: [
      "Blanco/Silver: unaged, pure agave flavour, best for Margaritas",
      "Reposado: 2-12 months in oak, balanced agave and wood notes",
      "Añejo: 1-3 years in oak, smoother, sipper or premium cocktail base",
      "Extra Añejo: 3+ years, ultra-smooth, sip neat",
      "Mezcal: broader category, any agave, often pit-roasted for smokiness (espadin is most common)",
    ],
    tags: ["spirits", "tequila", "agave", "mezcal"],
  },

  // ─── SPIRITS: Bourbon ─────────────────────────────────────
  {
    title: "What is Bourbon?",
    category: "spirits",
    subCategory: "bourbon",
    content: "Bourbon is an American whiskey made from a mash bill of at least 51% corn. It must be aged in new charred American oak barrels and produced in the United States. The high corn content gives Bourbon its characteristic sweetness — notes of vanilla, caramel, and toffee are hallmarks.",
    keyFacts: [
      "Must be at least 51% corn in the mash bill",
      "Aged in new charred American oak barrels (no minimum age unless labelled 'straight')",
      "Straight Bourbon: aged at least 2 years; if under 4 years, age must be stated",
      "Not required to be made in Kentucky, though ~95% is",
      "Typical tasting notes: vanilla, caramel, oak, with sweetness from corn",
    ],
    tags: ["spirits", "bourbon", "whisky", "american-whiskey"],
  },

  // ─── SPIRITS: Scotch ──────────────────────────────────────
  {
    title: "What is Scotch Whisky?",
    category: "spirits",
    subCategory: "scotch",
    content: "Scotch whisky must be made in Scotland and aged in oak casks for a minimum of 3 years. It ranges from light and fruity (Lowland, Speyside) to heavily peated and smoky (Islay). Single malt Scotch uses 100% malted barley from one distillery. Blended Scotch combines malt and grain whiskies for consistency.",
    keyFacts: [
      "Single Malt: 100% malted barley, one distillery",
      "Blended: mix of malt and grain whiskies for a consistent house style",
      "Regions: Speyside (fruity/sherry), Highland (diverse), Islay (peaty/smoky), Lowland (light), Campbeltown (briny)",
      "Minimum 3 years ageing in oak, often much longer",
      "Peat smoke comes from drying malted barley over peat fires",
    ],
    tags: ["spirits", "scotch", "whisky", "single-malt"],
  },

  // ─── SPIRITS: Rye ─────────────────────────────────────────
  {
    title: "What is Rye Whiskey?",
    category: "spirits",
    subCategory: "rye",
    content: "American rye whiskey must contain at least 51% rye grain in the mash bill, giving it a spicier, drier character than Bourbon. Rye is essential in classic cocktails like the Manhattan, Sazerac, and Old Fashioned. Its peppery kick stands up well to sweet and bitter modifiers.",
    keyFacts: [
      "At least 51% rye grain in the mash bill",
      "Spicier and drier than Bourbon's corn sweetness",
      "Essential in: Manhattan, Sazerac, Vieux Carré",
      "High-rye Bourbons (e.g. Bulleit) bridge the gap between Bourbon and Rye",
      "Canadian whisky is often called 'rye' but may not meet the 51% requirement",
    ],
    tags: ["spirits", "rye", "whisky", "spice"],
  },

  // ─── SPIRITS: Brandy & Cognac ──────────────────────────────
  {
    title: "Brandy and Cognac Basics",
    category: "spirits",
    subCategory: "brandy",
    content: "Brandy is distilled from wine or fermented fruit juice. Cognac is brandy from the Cognac region of France, double-distilled in copper pot stills and aged in French oak. VS (Very Special) is aged at least 2 years, VSOP at least 4, and XO at least 10. Brandy is versatile in cocktails (Sidecar, Brandy Alexander) and as a digestif.",
    keyFacts: [
      "Cognac: must be from the Cognac AOC region, double pot-distilled",
      "VS: 2+ years, VSOP: 4+ years, XO: 10+ years ageing",
      "Armagnac: single-distilled French brandy, often more rustic than Cognac",
      "Pisco: South American grape brandy (Peru/Chile), essential for Pisco Sour",
      "Calvados: apple brandy from Normandy, France",
    ],
    tags: ["spirits", "brandy", "cognac", "digestif"],
  },

  // ─── SPIRITS: Liqueurs ────────────────────────────────────
  {
    title: "Essential Liqueurs",
    category: "spirits",
    subCategory: "liqueurs",
    content: "Liqueurs are sweetened spirits flavoured with fruits, herbs, spices, or cream. They are essential modifiers in cocktails, adding depth, sweetness, and complexity. Key categories include orange liqueurs (triple sec, Cointreau, Grand Marnier), herbal (Chartreuse, Benedictine), coffee (Kahlúa), and nut (Frangelico, Amaretto).",
    keyFacts: [
      "Triple Sec / Cointreau: essential orange liqueur for Margaritas, Sidecars, Cosmopolitans",
      "Chartreuse: herbal liqueur made by monks; Green (55%) is stronger than Yellow (40%)",
      "Amaretto: almond-flavoured, key in Amaretto Sour",
      "Kahlúa: coffee liqueur, essential for Espresso Martini and White Russian",
      "Campari: bitter aperitif, cornerstone of Negroni and Americano",
    ],
    tags: ["spirits", "liqueurs", "modifiers", "cocktails"],
  },

  // ─── BEER ─────────────────────────────────────────────────
  {
    title: "Lager Styles",
    category: "beer",
    subCategory: "lagers",
    content: "Lagers are bottom-fermented at cooler temperatures, producing clean, crisp beers. They range from light and refreshing (Pilsner, Helles) to darker and maltier (Dunkel, Schwarzbier). Lagers make up the vast majority of global beer sales and are the starting point for most beer service knowledge.",
    keyFacts: [
      "Pilsner: crisp, hoppy, golden — the world's most popular beer style",
      "Helles: Munich-style, malt-forward, less hoppy than Pilsner",
      "Dunkel: dark lager, toasty, bready, not as heavy as a stout",
      "Serve temperature: 3-5°C for Pilsners, 6-8°C for darker lagers",
      "Clean glass is critical — residue kills head retention and aroma",
    ],
    tags: ["beer", "lagers", "pilsner", "service"],
  },
  {
    title: "Pale Ales and IPAs",
    category: "beer",
    subCategory: "pale-ales",
    content: "Pale ales and IPAs (India Pale Ales) are top-fermented with prominent hop character. American-style IPAs emphasise citrus, pine, and tropical hop aromas. New England IPAs (hazy/juicy) are softer, less bitter, and opaque. West Coast IPAs are drier, clearer, and more bitterly assertive.",
    keyFacts: [
      "Pale Ale: balanced malt-hop, lower ABV (4-5.5%), approachable",
      "American IPA: assertive hops, citrus/pine, 5.5-7.5% ABV",
      "New England / Hazy IPA: juicy, low bitterness, opaque appearance",
      "West Coast IPA: clear, dry, bitter, resinous hop character",
      "Double/Imperial IPA: higher ABV (7.5-10%+), more intense hop flavour",
    ],
    tags: ["beer", "pale-ales", "ipa", "hops"],
  },
  {
    title: "Stouts and Porters",
    category: "beer",
    subCategory: "stouts",
    content: "Stouts and porters are dark ales using roasted malts and barley. Porters tend to be slightly lighter and more chocolatey; stouts are fuller-bodied with coffee, roast, and dark chocolate notes. Styles range from sessionable dry stouts (Guinness) to rich imperial stouts aged in bourbon barrels.",
    keyFacts: [
      "Dry Stout (Guinness): light-bodied despite colour, roasty, 4-4.5% ABV",
      "Milk/Sweet Stout: lactose adds body and residual sweetness",
      "Oatmeal Stout: oats add silky texture",
      "Imperial Stout: high ABV (8-12%+), intense flavours, often barrel-aged",
      "Serve temperature: 8-12°C for stouts to let roast flavours open up",
    ],
    tags: ["beer", "stouts", "porters", "roasted"],
  },
  {
    title: "Wheat Beers",
    category: "beer",
    subCategory: "wheat-beers",
    content: "Wheat beers use a significant proportion of wheat alongside barley, creating hazy, refreshing beers with a soft mouthfeel. German Hefeweizen is yeast-forward with banana and clove notes. Belgian Witbier features coriander and orange peel. Both are excellent warm-weather recommendations.",
    keyFacts: [
      "Hefeweizen: German, unfiltered, banana and clove from yeast esters",
      "Witbier: Belgian, brewed with coriander and orange peel, light and citrusy",
      "Serve in a tall wheat beer glass to showcase the haze and head",
      "Low bitterness makes wheat beers approachable for non-beer-drinkers",
      "Best served at 5-7°C",
    ],
    tags: ["beer", "wheat-beers", "hefeweizen", "witbier"],
  },

  // ─── WINE ─────────────────────────────────────────────────
  {
    title: "Key Red Wine Grapes",
    category: "wine",
    subCategory: "reds",
    content: "Understanding the major red grape varieties gives you the ability to make confident pairings and recommendations. Cabernet Sauvignon (bold, tannic), Merlot (softer, plummy), Pinot Noir (light, elegant), Shiraz/Syrah (peppery, full), and Malbec (juicy, velvety) cover 80%+ of red wine service.",
    keyFacts: [
      "Cabernet Sauvignon: full-bodied, black fruit, firm tannins — pairs with red meat",
      "Merlot: medium-full, plum, soft tannins — pairs with roasts, pasta",
      "Pinot Noir: light, red fruit, low tannin — pairs with duck, salmon, mushroom",
      "Shiraz/Syrah: bold, pepper, dark fruit — pairs with BBQ, charcuterie, game",
      "Malbec: medium-full, juicy, velvety — the go-to Argentine steak wine",
    ],
    tags: ["wine", "reds", "grapes", "food-pairing"],
  },
  {
    title: "Key White Wine Grapes",
    category: "wine",
    subCategory: "whites",
    content: "The major white grapes are Chardonnay (versatile, oaked or unoaked), Sauvignon Blanc (crisp, herbaceous), Riesling (aromatic, sweet to bone-dry), Pinot Grigio (light, neutral), and Gewürztraminer (aromatic, lychee). Knowing these lets you guide guests confidently through any wine list.",
    keyFacts: [
      "Chardonnay: ranges from lean/mineral (Chablis) to rich/buttery (oaked/New World)",
      "Sauvignon Blanc: crisp, gooseberry, herbaceous — Marlborough NZ is the benchmark",
      "Riesling: highly aromatic, ranges from bone-dry to lusciously sweet, ages beautifully",
      "Pinot Grigio/Gris: light and neutral (Italy) or richer and spicy (Alsace)",
      "Serve whites at 8-12°C — too cold kills aroma, too warm dulls acidity",
    ],
    tags: ["wine", "whites", "grapes", "service"],
  },
  {
    title: "Sparkling Wines",
    category: "wine",
    subCategory: "sparkling",
    content: "Champagne, Prosecco, and Cava are the three pillars of sparkling wine service. The production method determines the quality and style. Méthode traditionnelle (Champagne) creates fine, persistent bubbles; Charmat/tank method (Prosecco) creates fruitier, softer sparkling wines.",
    keyFacts: [
      "Champagne: only from Champagne region, méthode traditionnelle, complex and toasty",
      "Prosecco: Italian (Veneto), Charmat method, fruity and approachable",
      "Cava: Spanish, méthode traditionnelle, great value alternative to Champagne",
      "Brut: dry (<12g/L sugar), Extra Brut (<6g/L), Brut Nature (0-3g/L)",
      "Serve at 6-8°C in a tulip or flute to preserve bubbles and focus aroma",
    ],
    tags: ["wine", "sparkling", "champagne", "prosecco"],
  },
  {
    title: "Wine Service Fundamentals",
    category: "wine",
    subCategory: "wine-service",
    content: "Professional wine service builds guest confidence. Present the bottle label, confirm the selection, open cleanly, pour a taste for the host, and proceed once approved. Serve whites before reds, light before full. Know your glassware: larger bowls for reds, narrower for whites, flutes or tulips for sparkling.",
    keyFacts: [
      "Present the label to the host, confirm vintage and producer",
      "Cut foil cleanly below the lip of the bottle",
      "Pour a small taste for the host; wait for approval before serving the table",
      "Standard pour: ~150ml (5oz) for a glass, ~6 glasses per bottle",
      "Decanting: young, tannic reds benefit from 30-60 minutes; old wines decant briefly",
    ],
    tags: ["wine", "service", "glassware", "technique"],
  },

  // ─── COCKTAILS ────────────────────────────────────────────
  {
    title: "The Sours Family",
    category: "cocktails",
    subCategory: "sours",
    content: "Sours are the largest and most important cocktail family. The formula: spirit + fresh citrus + sweetener. Master the 2:1:1 ratio (spirit : citrus : sweetener), and you can build almost any sour on the fly. Key examples: Daiquiri, Margarita, Whiskey Sour, Gimlet.",
    keyFacts: [
      "Core ratio: 60ml spirit, 30ml citrus, 15-22ml sweetener (adjust to taste)",
      "Always use fresh juice — bottled citrus destroys the drink",
      "Shake hard with ice for 10-15 seconds for proper dilution and chill",
      "Egg white (Silver Sour variant) adds texture but not flavour",
      "Strain into a chilled coupe or serve over ice in a rocks glass",
    ],
    tags: ["cocktails", "sours", "technique", "ratio"],
  },
  {
    title: "Spirit-Forward Cocktails",
    category: "cocktails",
    subCategory: "spirit-forward",
    content: "Spirit-forward drinks let the base spirit shine, modified by vermouth, bitters, or liqueurs and always stirred — never shaken. The Martini, Manhattan, Negroni, and Old Fashioned define this category. Technique is everything: proper stirring achieves silky dilution without the aeration and cloudiness of shaking.",
    keyFacts: [
      "Stir for 20-30 seconds with good ice to achieve correct dilution",
      "Chill the glass beforehand — temperature is critical",
      "Vermouth freshness matters enormously (refrigerate after opening)",
      "Old Fashioned: spirit + sugar + bitters (the original cocktail format)",
      "Negroni: equal parts gin, Campari, sweet vermouth — a perfect bitter balance",
    ],
    tags: ["cocktails", "spirit-forward", "stirred", "technique"],
  },
  {
    title: "Cocktail Technique Essentials",
    category: "cocktails",
    subCategory: "technique",
    content: "Shaking vs stirring is the most fundamental technique decision. Shake drinks with citrus, dairy, or egg. Stir spirit-forward drinks. Ice quality affects everything — wet, melted ice creates over-dilution. Build highballs directly in the glass. Muddle gently for herbs (no bitter compounds) and firmly for fruit.",
    keyFacts: [
      "Shake: drinks with citrus, cream, egg; produces aeration, chill, and froth",
      "Stir: spirit-forward drinks; produces silky clarity and elegant dilution",
      "Build: highballs and long drinks assembled directly in the serving glass",
      "Muddle herbs gently (just press to release oils); muddle fruit more firmly",
      "Fine-strain (double strain) shaken drinks to catch ice chips and pulp",
    ],
    tags: ["cocktails", "technique", "shaking", "stirring", "muddling"],
  },
  {
    title: "Essential Bar Tools",
    category: "cocktails",
    subCategory: "tools",
    content: "The right tools make cocktails consistent and efficient. A Boston shaker or cobbler, a Hawthorne strainer, a bar spoon (for stirring and measuring), a jigger (for accuracy), and a muddler cover 95% of builds. Quality tools and muscle memory separate a fast, confident bartender from a slow, uncertain one.",
    keyFacts: [
      "Jigger: non-negotiable for consistency. Free-pouring is inaccurate under pressure",
      "Boston shaker: two-piece tin/glass, industry standard for speed",
      "Hawthorne strainer: fits tin mouth, used after shaking",
      "Julep strainer: fits mixing glass, used after stirring",
      "Bar spoon: 30cm+ long for stirring; bowl = ~5ml (1 tsp) for measuring small amounts",
    ],
    tags: ["cocktails", "tools", "equipment", "bar-setup"],
  },

  // ─── NON-ALCOHOLIC ────────────────────────────────────────
  {
    title: "Building Great Mocktails",
    category: "non-alcoholic",
    subCategory: "mocktails",
    content: "A good mocktail must stand on its own merit — it cannot just be a cocktail with the spirit removed. The key is building complexity through acid (citrus, shrubs), sweetness (syrups, juices), bitterness (non-alcoholic bitters, tonic), and texture (soda, egg white, cream). Present mocktails in proper cocktail glassware with full garnish.",
    keyFacts: [
      "Balance the same way as cocktails: tart + sweet + bitter + texture",
      "Use quality ingredients: fresh citrus, house-made syrups, premium tonics",
      "Non-alcoholic spirits (Lyre's, Seedlip) provide a familiar base",
      "Serve in proper glassware — never a water glass — to elevate the experience",
      "Name them compellingly on the menu; avoid 'virgin' as a prefix (dated and exclusionary)",
    ],
    tags: ["non-alcoholic", "mocktails", "inclusive-service"],
  },
  {
    title: "Premium Soft Drinks",
    category: "non-alcoholic",
    subCategory: "premium-soft",
    content: "The premium soft drink market has expanded dramatically. Fever-Tree tonics, natural sodas, craft ginger beers, and botanical drinks give non-drinking guests interesting options (and venues higher margins). Knowing this range lets you recommend confidently when a guest says 'I'm not drinking tonight.'",
    keyFacts: [
      "Fever-Tree: market leader in premium tonics and mixers",
      "Craft ginger beers vary significantly — spicy vs sweet, cloudy vs clear",
      "Kombucha: fermented tea, tangy, low sugar, appeals to health-conscious guests",
      "Botanical drinks (Strange Love, Capi) offer complex flavours without alcohol",
      "Premium soft drinks command 2-3x the margin of standard soft drinks",
    ],
    tags: ["non-alcoholic", "premium-soft", "margins", "service"],
  },
  {
    title: "Coffee and Tea Service",
    category: "non-alcoholic",
    subCategory: "coffee-tea",
    content: "Coffee service is a high-frequency touchpoint with significant upsell opportunity. Know the difference between espresso, long black, flat white, and latte. Tea service should include proper temperature (not boiling for green/white teas), loose-leaf where possible, and clear steeping guidance.",
    keyFacts: [
      "Espresso: ~30ml, concentrated, 25-30 second extraction",
      "Flat white: double shot + micro-foam milk, less volume than a latte",
      "Long black: hot water + double espresso (crema on top, not an Americano)",
      "Green tea: 70-80°C water, 2-3 min steep — boiling water makes it bitter",
      "Upselling tip: pair espresso with a small dessert for a natural add-on",
    ],
    tags: ["non-alcoholic", "coffee", "tea", "service"],
  },
  {
    title: "Inclusive Drink Service",
    category: "non-alcoholic",
    subCategory: "inclusive-service",
    content: "Not drinking is increasingly common and should always be supported without judgement. Never ask 'Why aren't you drinking?' Instead, offer the non-alcoholic range with the same confidence and enthusiasm as the cocktail list. Great venues treat NA options as a feature, not an afterthought.",
    keyFacts: [
      "Never draw attention to a guest's choice not to drink",
      "Present NA options proactively and enthusiastically",
      "Offer mocktails by name, not as 'virgin [cocktail]'",
      "Ensure the NA menu has equal care in presentation and pricing strategy",
      "Staff training on inclusive service prevents awkward or exclusionary moments",
    ],
    tags: ["non-alcoholic", "inclusive-service", "hospitality", "culture"],
  },
];
