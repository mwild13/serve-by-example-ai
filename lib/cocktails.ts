export type Category =
  | "sours"
  | "spirit-forward"
  | "ancestral"
  | "highballs"
  | "fizz"
  | "tiki"
  | "duos-trios"
  | "sparkling"
  | "hot"
  | "flips-nogs";

export type Cocktail = {
  name: string;
  category: Category;
  ingredients: string[];
  method: string;
  glass: string;
  garnish: string;
  tip: string;
  featured: boolean;
  featuredOrder: number;
  origin?: string;
};

export const CATEGORIES: Record<Category, { label: string; description: string; color: string }> = {
  sours: {
    label: "Sours",
    description: "The backbone of modern cocktail making. Spirit + fresh citrus + sweetener in balance. Master the ratio and you can build almost any sour on the fly.",
    color: "#f5a623",
  },
  "spirit-forward": {
    label: "Spirit-Forward",
    description: "The spirit is the star. Blended with vermouth or fortified wine and always stirred, never shaken, to preserve a silky, clear texture.",
    color: "#4a90d9",
  },
  ancestral: {
    label: "Ancestral / Old Fashioned",
    description: "One of the oldest formats in cocktail history. Spirit, sugar, bitters and dilution. Nothing extra. Precision and restraint define this style.",
    color: "#8b5e3c",
  },
  highballs: {
    label: "Highballs & Collins",
    description: "Spirit over ice in a tall glass, topped with a carbonated mixer. Refreshing, versatile and among the most-ordered drinks in any venue.",
    color: "#5cb85c",
  },
  fizz: {
    label: "Fizz",
    description: "A sour extended with soda water, served without ice. Silver Fizz adds egg white for a creamy foam top. Technique-driven and highly satisfying to execute well.",
    color: "#9b59b6",
  },
  tiki: {
    label: "Tiki & Tropical",
    description: "Bold, layered and theatrical. Typically rum-based with fruit juices, spices and syrups. Often served in oversized or decorative glassware.",
    color: "#e74c3c",
  },
  "duos-trios": {
    label: "Duos & Trios",
    description: "A Duo is spirit plus liqueur. Add cream and it becomes a Trio. Simple builds where the quality and ratio of each ingredient determines everything.",
    color: "#1abc9c",
  },
  sparkling: {
    label: "Champagne & Sparkling",
    description: "Champagne or sparkling wine as a key component. Light, celebratory and versatile. Technique is gentle, always add sparkling last to preserve the bubbles.",
    color: "#f39c12",
  },
  hot: {
    label: "Hot Cocktails",
    description: "Served warm, these drinks provide comfort and richness. Temperature management and glassware preparation are the most important techniques.",
    color: "#e67e22",
  },
  "flips-nogs": {
    label: "Flips & Nogs",
    description: "Rich, indulgent drinks built around whole eggs or egg components, dairy and sweetener. A vigorous shake emulsifies everything into something deeply satisfying.",
    color: "#7f8c8d",
  },
};

export const COCKTAILS: Cocktail[] = [
  // TOP 15 MOST COMMON

  {
    name: "Espresso Martini",
    category: "duos-trios",
    ingredients: ["50ml vodka", "30ml fresh espresso (hot)", "15ml coffee liqueur (Mr Black)", "5ml sugar syrup"],
    method: "Shake all ingredients hard with ice for 10 seconds until frothy. Double strain into chilled coupe.",
    glass: "Coupe",
    garnish: "3 coffee beans floating on top",
    tip: "Fresh espresso is non-negotiable, cold brew or instant ruins the crema. Shake harder than you think to get that signature foam layer. Mr Black is an Australian coffee liqueur worth recommending.",
    featured: true,
    featuredOrder: 1,
  },

  {
    name: "Margarita",
    category: "sours",
    ingredients: ["50ml tequila (blanco)", "25ml fresh lime juice", "20ml orange liqueur (Cointreau)", "5ml agave syrup"],
    method: "Shake with ice and strain into glass with salted rim (if requested).",
    glass: "Coupe or Margarita glass",
    garnish: "Lime wheel on rim. Salt rim (half-salted recommended)",
    tip: "Never use bottled lime juice. The salt rim is optional, always ask first. Half-salt the rim so guests choose with every sip. Spicy Margarita with jalapeño is an easy upsell.",
    featured: true,
    featuredOrder: 2,
  },

  {
    name: "Mojito",
    category: "highballs",
    ingredients: ["50ml white rum (Bundaberg)", "25ml fresh lime juice", "20ml sugar syrup", "6-8 fresh mint leaves", "Soda water (to top)"],
    method: "Gently muddle mint with lime juice and syrup in glass. Add rum, fill with crushed ice, churn. Top with soda. Do NOT over-muddle (bitter mint).",
    glass: "Highball",
    garnish: "Mint sprig and lime wheel",
    tip: "Slap the mint sprig between your palms before garnishing to release oils. Gentle pressing only, bruised mint turns bitter. Bundaberg Rum pairs beautifully here.",
    featured: true,
    featuredOrder: 3,
  },

  {
    name: "Old Fashioned",
    category: "ancestral",
    ingredients: ["60ml bourbon or rye whisky", "5ml sugar syrup", "2 dashes Angostura bitters"],
    method: "Stir ingredients with ice in mixing glass. Pour over one large ice cube in rocks glass.",
    glass: "Rocks glass",
    garnish: "Orange zest expressed over glass",
    tip: "Never muddle fruit into an Old Fashioned. Zest is the only fruit allowed. Starward Whisky brings an Australian terroir to this timeless drink.",
    featured: true,
    featuredOrder: 4,
  },

  {
    name: "Aperol Spritz",
    category: "sparkling",
    ingredients: ["60ml prosecco", "40ml Aperol", "20ml soda water"],
    method: "Build in wine glass over large ice. Stir gently once.",
    glass: "Wine glass",
    garnish: "Orange slice",
    tip: "The ratio is 3:2:1 (prosecco:Aperol:soda). Don't over-stir, you'll lose the bubbles. Perfect for Australian summer venues.",
    featured: true,
    featuredOrder: 5,
  },

  {
    name: "Gin & Tonic",
    category: "highballs",
    ingredients: ["50ml gin (Four Pillars or Archie Rose)", "150ml quality tonic water (Fever-Tree)"],
    method: "Fill glass with large ice cubes. Pour gin, then tonic. Stir gently once. Never pour tonic over dry ice, pour down the side.",
    glass: "Balloon or Highball",
    garnish: "Rosemary sprig, juniper berries, or citrus wheel (depending on gin)",
    tip: "Ice quality matters, cloudy ice melts faster. Use clear, large cubes. Four Pillars is one of Australia's finest gins. The botanicals shine when paired with quality tonic.",
    featured: true,
    featuredOrder: 6,
  },

  {
    name: "Whiskey Sour",
    category: "sours",
    ingredients: ["60ml bourbon or rye", "25ml fresh lemon juice", "20ml sugar syrup", "1 egg white (optional)"],
    method: "Dry shake (no ice) if using egg white. Add ice, shake hard. Double strain into coupe.",
    glass: "Coupe",
    garnish: "Lemon wheel and 3-4 dashes Angostura bitters swirled on foam",
    tip: "The dry shake is essential for egg white foam, 10 seconds without ice, then 10 seconds with ice. Starward Whisky is an outstanding Australian alternative to bourbon.",
    featured: true,
    featuredOrder: 7,
  },

  {
    name: "Negroni",
    category: "spirit-forward",
    ingredients: ["30ml gin", "30ml Campari", "30ml sweet vermouth"],
    method: "Stir with ice, strain over one large cube.",
    glass: "Rocks glass",
    garnish: "Orange peel expressed over glass",
    tip: "Equal parts, memorise 1:1:1. Don't shake it. Stirring keeps it clear and silky. Use Four Pillars Gin for an outstanding Australian take.",
    featured: true,
    featuredOrder: 8,
  },

  {
    name: "Pornstar Martini",
    category: "sours",
    ingredients: ["50ml vanilla vodka", "25ml passionfruit liqueur", "15ml fresh lime juice", "10ml sugar syrup", "½ fresh passionfruit"],
    method: "Shake all ingredients with ice. Double strain into coupe. Serve with a shot of prosecco on the side.",
    glass: "Coupe",
    garnish: "Half passionfruit on rim",
    tip: "The prosecco shot on the side is traditional, guests can sip or pour in. Fresh passionfruit pulp makes the difference. Top 5 most ordered in Australian venues.",
    featured: true,
    featuredOrder: 9,
    origin: "UK (top 5 in Australia)",
  },

  {
    name: "Classic Daiquiri",
    category: "sours",
    ingredients: ["60ml white rum", "25ml fresh lime juice", "15ml sugar syrup"],
    method: "Shake hard with ice and double strain into a chilled glass.",
    glass: "Coupe",
    garnish: "Lime wheel on the rim",
    tip: "Fresh lime only, never bottled. The 2:1:¾ ratio is your baseline; adjust sweetness daily based on the lime's acidity. Bundaberg Rum is a natural Australian choice here.",
    featured: true,
    featuredOrder: 10,
  },

  {
    name: "Cosmopolitan",
    category: "sours",
    ingredients: ["40ml vodka", "15ml Cointreau", "25ml fresh cranberry juice", "10ml fresh lime juice"],
    method: "Shake hard with ice and double strain into a chilled coupe.",
    glass: "Coupe",
    garnish: "Lime wheel on the rim",
    tip: "Citrus balance is critical, adjust lime juice based on cranberry acidity. This 1980s classic defined a generation of bartending. Use Archie Rose Vodka for an Australian touch.",
    featured: true,
    featuredOrder: 11,
  },

  {
    name: "Long Island Iced Tea",
    category: "highballs",
    ingredients: ["15ml vodka", "15ml white rum", "15ml gin", "15ml tequila", "15ml Cointreau", "25ml fresh lemon juice", "15ml sugar syrup", "Top with cola"],
    method: "Shake all spirits, lemon, and syrup with ice. Strain into highball over fresh ice. Top with a splash of cola for colour.",
    glass: "Highball",
    garnish: "Lemon wedge",
    tip: "The cola is for colour only, not flavour. This drink is stronger than guests expect. Serve with a warning. Teach portion control, it's easy to over-pour.",
    featured: true,
    featuredOrder: 12,
  },

  {
    name: "Moscow Mule",
    category: "highballs",
    ingredients: ["50ml vodka", "120ml spicy ginger beer", "15ml fresh lime juice"],
    method: "Build in copper mug over ice. Stir gently once.",
    glass: "Copper mug",
    garnish: "Lime wheel",
    tip: "The copper mug is traditional and affects the drinking experience, cold to the touch. Ginger beer quality matters. Use Archie Rose Vodka for an Australian version.",
    featured: true,
    featuredOrder: 13,
  },

  {
    name: "Lemon, Lime & Bitters",
    category: "highballs",
    ingredients: ["20ml fresh lemon juice", "20ml fresh lime juice", "15ml sugar syrup", "4 dashes Angostura bitters", "Top with soda water"],
    method: "Build in highball over ice. Add citrus and syrup. Top with soda. Float bitters on top.",
    glass: "Highball",
    garnish: "Lemon and lime wheel",
    tip: "The quintessential Australian soft cocktail, served in every pub, RSL, and golf club. The bitters float creates the signature aroma. Non-alcoholic if bitters are removed (but traditional recipe includes them).",
    featured: true,
    featuredOrder: 14,
    origin: "Australia (nationwide staple)",
  },

  {
    name: "Paloma",
    category: "highballs",
    ingredients: ["50ml tequila", "90ml fresh grapefruit juice", "15ml fresh lime juice", "10ml sugar syrup", "Top with soda water"],
    method: "Shake tequila, juices, and syrup with ice. Strain into salt-rimmed highball over fresh ice. Top with soda.",
    glass: "Highball",
    garnish: "Grapefruit wedge, salt rim (half optional)",
    tip: "Mexico's answer to the Margarita. Fresh grapefruit juice is non-negotiable, bottled is too bitter. The salt rim enhances the citrus-bitter balance. Very popular in Australian summer.",
    featured: true,
    featuredOrder: 15,
  },

  // REMAINING COCKTAILS

  {
    name: "Sidecar",
    category: "sours",
    ingredients: ["50ml Cognac", "20ml Cointreau", "25ml fresh lemon juice"],
    method: "Shake hard with ice and double strain into a chilled coupe, optionally sugar-rimmed.",
    glass: "Coupe",
    garnish: "Orange peel or lemon twist",
    tip: "A pre-Prohibition classic. Cognac sourcing sets quality apart. The 2:1:1 ratio teaches bartenders how spirit richness changes sweet/sour balance.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Gimlet",
    category: "sours",
    ingredients: ["50ml gin", "25ml fresh lime juice", "5ml sugar syrup"],
    method: "Shake with ice and double strain into a chilled coupe.",
    glass: "Coupe",
    garnish: "Lime wheel",
    tip: "A naval tradition from the Royal Navy. Fresh lime juice is essential. Four Pillars Gin makes this Australian. Simple, balanced, and elegant.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Chilli Margarita",
    category: "sours",
    ingredients: ["50ml tequila (blanco)", "25ml fresh lime juice", "20ml orange liqueur", "5ml agave syrup", "2-3 slices fresh jalapeño"],
    method: "Muddle jalapeño gently in shaker. Add remaining ingredients. Shake with ice. Double strain into glass. Salt rim optional.",
    glass: "Coupe or Rocks",
    garnish: "Lime wheel and jalapeño slice",
    tip: "Australian bars are embracing spicy cocktails. Control the heat by removing jalapeño seeds. Ask guests their spice preference first. Great for upselling.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Pisco Sour",
    category: "sours",
    ingredients: ["60ml Pisco", "25ml fresh lime juice", "20ml sugar syrup", "20ml egg white"],
    method: "Dry shake egg white first, then add ice and remaining ingredients. Shake hard and double strain.",
    glass: "Coupe",
    garnish: "Three dashes of Angostura bitters on foam",
    tip: "This South American classic showcases how different spirits tell different stories. The acidity of fresh lime is critical, adjust daily.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Dry Martini",
    category: "spirit-forward",
    ingredients: ["60ml gin", "10ml dry vermouth", "2 dashes orange bitters (optional)"],
    method: "Stir with ice for 10 seconds and strain into a chilled coupe.",
    glass: "Coupe or Martini glass",
    garnish: "Lemon twist or olive",
    tip: "Simplicity is deception. This drink demands perfect technique and premium ingredients. Four Pillars Gin makes this Australian. Vermouth quality is underestimated.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Manhattan",
    category: "spirit-forward",
    ingredients: ["60ml rye whiskey", "30ml sweet vermouth", "2 dashes Angostura bitters"],
    method: "Stir with ice for 10 seconds and strain into a chilled coupe.",
    glass: "Coupe",
    garnish: "Cherry",
    tip: "An 1870s New York classic. Proper stirring technique is essential, teaches bartenders why dilution and temperature matter. Starward Whisky brings an Australian character.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Sazerac",
    category: "ancestral",
    ingredients: ["60ml rye whiskey", "¼ tsp Peychaud's bitters", "¼ tsp Absinthe rinse"],
    method: "Rinse a chilled rocks glass with absinthe, discard excess. Stir whiskey and bitters with ice, strain into glass.",
    glass: "Rocks glass",
    garnish: "Lemon peel expressed over surface",
    tip: "The 1823 New Orleans classic. This drink is pure spirit, minimal dilution, and technique-focused. Try using Starward Whisky for an Australian spin.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Vieux Carré",
    category: "ancestral",
    ingredients: ["30ml rye whiskey", "30ml Cognac", "30ml sweet vermouth", "1 dash Angostura bitters", "1 dash Peychaud's bitters"],
    method: "Stir with ice for 10 seconds and strain into a rocks glass with a large ice cube.",
    glass: "Rocks glass",
    garnish: "Lemon peel and cherry",
    tip: "A New Orleans classic using three spirits. The bitters balance complexity. Teaches layering and moderation. A teaching drink for understanding spirit interactions.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Tom Collins",
    category: "highballs",
    ingredients: ["50ml gin", "25ml fresh lemon juice", "15ml sugar syrup", "Top with soda water"],
    method: "Shake gin, lemon, and syrup with ice. Strain into glass over fresh ice. Top with soda.",
    glass: "Collins glass",
    garnish: "Lemon wheel and cherry",
    tip: "An 1876 classic. The Collins format is the spirit-lemon-sugar-soda template. Four Pillars Gin is outstanding here. Teaches the Collins family variations.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Dark & Stormy",
    category: "highballs",
    ingredients: ["50ml dark rum", "120ml spicy ginger beer", "15ml fresh lime juice"],
    method: "Build in a rocks glass with ice. Stir gently.",
    glass: "Highball",
    garnish: "Lime wheel",
    tip: "Ginger beer is essential, never use ginger ale. This drink has protected terms in Bermuda. Bundaberg Rum is ideal here. Great teaching drink for understanding spirit-mixer ratios.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Hugo Spritz",
    category: "sparkling",
    ingredients: ["60ml prosecco", "40ml elderflower syrup", "20ml soda water", "Fresh mint leaves"],
    method: "Build in wine glass over ice. Add elderflower syrup, then prosecco, then soda. Gently stir. Slap mint to release oils and add last.",
    glass: "Wine glass",
    garnish: "Mint sprig and lemon wheel",
    tip: "Overtook Aperol Spritz in some Australian venues (2025-26). Lighter, less bitter, very approachable. The elderflower syrup quality matters, use a good brand.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Mai Tai",
    category: "tiki",
    ingredients: ["40ml aged rum", "15ml orange Curaçao", "25ml fresh lime juice", "10ml sugar syrup", "2 dashes Angostura bitters"],
    method: "Shake hard with crushed ice. Strain into a rocks glass filled with fresh crushed ice.",
    glass: "Rocks or Tiki mug",
    garnish: "Lime wheel and mint sprig",
    tip: "The most imitated drink in the world. Complexity comes from layering flavours carefully. Explore Australian rum alternatives like Bundaberg for venue differentiation.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Pina Colada",
    category: "tiki",
    ingredients: ["50ml white rum", "90ml pineapple juice", "60ml coconut cream"],
    method: "Blend with crushed ice until smooth. Pour into a chilled glass.",
    glass: "Tiki mug or Hurricane glass",
    garnish: "Pineapple wedge and cherry",
    tip: "A 1950s tropical classic. Blending technique matters, consistent texture is key. This is a high-profit, high-volume drink. Teach bartenders to master blending consistency.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Jungle Bird",
    category: "tiki",
    ingredients: ["45ml dark rum", "30ml Campari", "40ml pineapple juice", "15ml fresh lime juice"],
    method: "Shake hard with ice and double strain over fresh crushed ice.",
    glass: "Rocks or Tiki mug",
    garnish: "Pineapple leaf and lime wheel",
    tip: "A 1960s Tiki classic from Malaysia. The Campari-pineapple combination is unexpected but balanced. Teaches bartenders to think beyond traditional ratios. Use Bundaberg Rum.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Singapore Sling",
    category: "tiki",
    ingredients: ["30ml gin", "15ml cherry liqueur", "15ml Cointreau", "15ml Benedictine", "90ml pineapple juice", "15ml fresh lime juice", "5ml sugar syrup", "1 dash Angostura bitters"],
    method: "Shake all ingredients with ice. Strain into a hurricane glass filled with fresh ice.",
    glass: "Hurricane or Tiki glass",
    garnish: "Pineapple leaf and cherry",
    tip: "A complex, layered Tiki classic from Raffles Hotel (1915). Many ingredients, teach mise en place and speed. The pineapple juice must be fresh for best results.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Bellini",
    category: "sparkling",
    ingredients: ["100ml prosecco", "40ml fresh white peach purée"],
    method: "Pour peach purée into flute. Gently add prosecco. Stir once very gently.",
    glass: "Flute",
    garnish: "Peach slice (optional)",
    tip: "An Italian classic from Harry's Bar Venice (1948). Fresh peach purée is essential, canned or sweetened syrup ruins it. Brunch staple in Australia.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Mimosa",
    category: "sparkling",
    ingredients: ["75ml prosecco or champagne", "75ml fresh orange juice"],
    method: "Pour orange juice into flute. Gently add sparkling wine. Do not stir.",
    glass: "Flute",
    garnish: "Orange wheel (optional)",
    tip: "The ratio can vary 1:1 or 2:1 sparkling to juice. Fresh-squeezed orange juice makes a dramatic difference. Never stir, you'll lose the bubbles.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Japanese Slipper",
    category: "sours",
    ingredients: ["30ml Midori", "30ml Cointreau", "30ml fresh lemon juice"],
    method: "Shake hard with ice and double strain into a chilled coupe.",
    glass: "Coupe",
    garnish: "Green cherry or lime wheel",
    tip: "Invented in Melbourne at Mietta's (1984). Equal parts melon, orange, and citrus. Bright green colour is iconic. Guests ask for this by name in Australian venues.",
    featured: false,
    featuredOrder: 0,
    origin: "Melbourne, 1984",
  },

  {
    name: "Sunnyboy",
    category: "sours",
    ingredients: ["50ml butter-washed rum", "25ml passionfruit purée", "20ml fresh lime juice", "15ml vanilla syrup"],
    method: "Shake hard with ice. Double strain into rocks glass over one large cube.",
    glass: "Rocks",
    garnish: "Passionfruit half and mint sprig",
    tip: "Created at The Gresham, Brisbane (2013). Named after the Australian frozen ice pop. The butter-washed rum is signature, rich, savoury, tropical. Advanced technique.",
    featured: false,
    featuredOrder: 0,
    origin: "Brisbane, The Gresham (2013)",
  },

  {
    name: "Death Flip",
    category: "flips-nogs",
    ingredients: ["30ml tequila", "15ml Yellow Chartreuse", "15ml Jägermeister", "1 whole egg", "Fresh nutmeg"],
    method: "Dry shake egg first. Add spirits. Shake hard with ice. Double strain into coupe.",
    glass: "Coupe",
    garnish: "Freshly grated nutmeg on top",
    tip: "Created at Black Pearl, Melbourne (2010). Cult classic in craft bars. Whole egg creates rich, silky texture. For advanced bartenders only, not a volume drink.",
    featured: false,
    featuredOrder: 0,
    origin: "Melbourne, Black Pearl (2010)",
  },

  {
    name: "Irish Coffee",
    category: "hot",
    ingredients: ["40ml Irish whiskey", "120ml hot strong coffee", "10ml brown sugar", "30ml heavy cream (lightly whipped)"],
    method: "Dissolve sugar in hot coffee. Add whiskey. Float cream over the back of a hot spoon.",
    glass: "Irish coffee glass or heat-safe mug",
    garnish: "Cream layer",
    tip: "The iconic hot cocktail. Cream floating is an art, practice the spoon technique. Teaches bartenders that presentation matters as much as flavour. Never stir after cream is added.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Hot Toddy",
    category: "hot",
    ingredients: ["50ml bourbon or whisky", "150ml hot water", "15ml honey", "10ml fresh lemon juice", "1 cinnamon stick", "2 cloves"],
    method: "Dissolve honey in hot water. Add whiskey and lemon juice. Stir gently. Add spices.",
    glass: "Heat-safe mug",
    garnish: "Cinnamon stick and lemon wheel with cloves",
    tip: "A classic winter warmer in Australia. Temperature management is key, never boil. Starward Whisky brings Australian character. Teaches bartenders comfort-drink culture.",
    featured: false,
    featuredOrder: 0,
  },

  {
    name: "Eggnog",
    category: "flips-nogs",
    ingredients: ["40ml aged rum", "30ml bourbon", "20ml whole egg", "40ml crème fraîche or cream", "10ml sugar syrup", "Fresh nutmeg"],
    method: "Dry shake egg first. Add remaining ingredients and shake hard with ice. Strain into a rocks glass.",
    glass: "Rocks or mug",
    garnish: "Freshly grated nutmeg",
    tip: "A festive classic. Whole egg provides richness. This teaches egg white/yolk usage. Seasonal sales potential in Australian winter (June-August). Can be prepared as batches in advance.",
    featured: false,
    featuredOrder: 0,
  },
];
