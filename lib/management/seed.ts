import type {
  InventoryCategory,
  ManagementSnapshot,
  MenuKnowledgeItem,
  ScenarioCategory,
  StaffMember,
  TrainingProgram,
  Venue,
} from "@/lib/management/types";

const SEED_VENUES: Venue[] = [
  {
    id: "seed-cbd-bar",
    name: "CBD Bar",
    completionRate: 76,
    avgScenarioScore: 81,
    upsellRate: 64,
    activeStaff: 10,
    staffLimit: 25,
    managerPermissions: "2 managers, 1 supervisor admin",
  },
  {
    id: "seed-rooftop-lounge",
    name: "Rooftop Lounge",
    completionRate: 68,
    avgScenarioScore: 77,
    upsellRate: 59,
    activeStaff: 8,
    staffLimit: 20,
    managerPermissions: "2 managers",
  },
  {
    id: "seed-cocktail-room",
    name: "Cocktail Room",
    completionRate: 82,
    avgScenarioScore: 84,
    upsellRate: 71,
    activeStaff: 7,
    staffLimit: 18,
    managerPermissions: "1 manager, 1 lead bartender",
  },
];

const SEED_STAFF: StaffMember[] = [
  {
    id: "seed-sarah",
    venueId: "seed-cbd-bar",
    name: "Sarah",
    role: "Bartender",
    progress: 94,
    serviceScore: 93,
    salesScore: 88,
    productScore: 95,
    lastActive: "Today",
    status: "on-track",
    strengths: ["Customer service", "Cocktail consistency", "Guest communication"],
    improvements: ["Premium spirit language during peak service"],
  },
  {
    id: "seed-josh",
    venueId: "seed-cbd-bar",
    name: "Josh",
    role: "Floor",
    progress: 89,
    serviceScore: 90,
    salesScore: 81,
    productScore: 78,
    lastActive: "Today",
    status: "on-track",
    strengths: ["Table pacing", "Menu recommendations"],
    improvements: ["Second-drink recommendations"],
  },
  {
    id: "seed-alex",
    venueId: "seed-cbd-bar",
    name: "Alex",
    role: "Supervisor",
    progress: 87,
    serviceScore: 85,
    salesScore: 80,
    productScore: 84,
    lastActive: "Yesterday",
    status: "on-track",
    strengths: ["Shift communication", "Complaint handling"],
    improvements: ["Delegation speed in understaffed scenarios"],
  },
  {
    id: "seed-emily",
    venueId: "seed-rooftop-lounge",
    name: "Emily",
    role: "New Staff",
    progress: 34,
    serviceScore: 68,
    salesScore: 52,
    productScore: 58,
    lastActive: "4 days ago",
    status: "attention",
    strengths: ["Guest tone", "Basic order handling"],
    improvements: ["Upselling confidence", "Product knowledge retention"],
  },
  {
    id: "seed-ryan",
    venueId: "seed-rooftop-lounge",
    name: "Ryan",
    role: "Bartender",
    progress: 46,
    serviceScore: 63,
    salesScore: 59,
    productScore: 62,
    lastActive: "2 days ago",
    status: "attention",
    strengths: ["Build speed"],
    improvements: ["Premium recommendation structure", "Guest recovery language"],
  },
  {
    id: "seed-tom",
    venueId: "seed-cocktail-room",
    name: "Tom",
    role: "Floor",
    progress: 22,
    serviceScore: 57,
    salesScore: 49,
    productScore: 54,
    lastActive: "7 days ago",
    status: "inactive",
    strengths: ["Basic service workflow"],
    improvements: ["Training consistency", "Scenario completion cadence"],
  },
];

const SEED_TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: "seed-bartender-program",
    venueId: "seed-cbd-bar",
    name: "New Bartender Program",
    roleTarget: "Bartenders",
    description: "Structured onboarding for speed, consistency and premium recommendations.",
    completion: 76,
    dayPlan: ["Day 1: Bar basics", "Day 2: Classic cocktails", "Day 3: Upselling drills"],
  },
  {
    id: "seed-floor-program",
    venueId: "seed-rooftop-lounge",
    name: "Floor Staff Program",
    roleTarget: "Floor",
    description: "Service flow, menu language and guest recovery routines.",
    completion: 63,
    dayPlan: ["Day 1: Service flow", "Day 2: Menu language", "Day 3: Guest recovery scenarios"],
  },
  {
    id: "seed-supervisor-program",
    venueId: "seed-cocktail-room",
    name: "Supervisor Program",
    roleTarget: "Supervisor",
    description: "Delegation, complaint handling and rush-hour decision making.",
    completion: 43,
    dayPlan: ["Day 1: Delegation", "Day 2: Complaint handling", "Day 3: Rush-hour decisions"],
  },
];

const SEED_INVENTORY: InventoryCategory[] = [
  { venueId: "seed-cbd-bar", name: "Vodka", products: ["Smirnoff", "Grey Goose", "Belvedere"] },
  { venueId: "seed-cbd-bar", name: "Gin", products: ["Bombay Sapphire", "Hendrick's", "Tanqueray"] },
  { venueId: "seed-rooftop-lounge", name: "Whisky", products: ["Jameson", "Jack Daniel's", "Maker's Mark"] },
  { venueId: "seed-cocktail-room", name: "Rum", products: ["Bacardi", "Sailor Jerry", "Diplomatico"] },
];

const SEED_MENU_KNOWLEDGE: MenuKnowledgeItem[] = [
  { name: "Cocktails", count: 24, note: "Core classics + venue signatures" },
  { name: "Beer", count: 14, note: "Tap + bottled selections" },
  { name: "Wine", count: 18, note: "By-glass and bottle list" },
  { name: "Spirits", count: 32, note: "House + premium upgrade range" },
];

const SEED_SCENARIO_CATEGORIES: ScenarioCategory[] = [
  { name: "Customer Service", attempts: 128, avgScore: 79, failed: "Intoxicated guest" },
  { name: "Sales", attempts: 92, avgScore: 72, failed: "Suggesting second drinks" },
  { name: "Operations", attempts: 104, avgScore: 68, failed: "Understaffed shift" },
];

export function buildSeedManagementSnapshot(): ManagementSnapshot {
  return {
    source: "seed",
    notices: [
      "Management tables are not connected yet. The console is running on seeded product data.",
      "Run supabase/management_schema.sql in Supabase to unlock staff, inventory and training persistence.",
    ],
    capabilities: {
      databaseConnected: false,
      staffCrud: false,
      inventoryCrud: false,
      trainingProgramsCrud: false,
    },
    venues: SEED_VENUES,
    staff: SEED_STAFF,
    trainingPrograms: SEED_TRAINING_PROGRAMS,
    inventory: SEED_INVENTORY,
    menuKnowledge: SEED_MENU_KNOWLEDGE,
    scenarioCategories: SEED_SCENARIO_CATEGORIES,
    reportSummaries: [
      {
        title: "Weekly manager summary",
        summary: "Training completion, scenario weaknesses, inactive staff and upsell performance.",
      },
      {
        title: "Monthly venue performance",
        summary: "Revenue impact model, benchmark comparison and training quality trends.",
      },
    ],
    enabledModules: [
      "Bartending training",
      "Sales training",
      "Management modules",
      "Scenario categories",
      "Mobile training mode",
    ],
  };
}