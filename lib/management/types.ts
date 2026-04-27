export type ManagerSection =
  | "overview"
  | "staff"
  | "roles"
  | "teams"
  | "training"
  | "scenarios"
  | "menu"
  | "inventory"
  | "compliance"
  | "analytics"
  | "reports"
  | "leaderboards"
  | "notifications"
  | "aicoach"
  | "predictive"
  | "settings"
  | "billing"
  | "integrations"
  | "sign-out";

export type StaffRole =
  | "Bartender"
  | "Floor"
  | "Supervisor"
  | "Manager"
  | "New Staff";

export type StaffStatus = "on-track" | "attention" | "inactive";

export type StaffMember = {
  id: string;
  venueId: string;
  name: string;
  email?: string;
  role: StaffRole;
  progress: number;
  serviceScore: number;
  salesScore: number;
  productScore: number;
  lastActive: string;
  status: StaffStatus;
  strengths: string[];
  improvements: string[];
  // Mastery engine fields (optional — absent until mastery_schema.sql is run)
  masteryStatus?: string;
  eloRating?: number;
  knowledgeDecayRisk?: boolean;
  highConfidenceIncorrectRatio?: number;
  scenariosMastered?: number;
  scenariosAttempted?: number;
  // Connection linkage — set when staff member has signed in and linked their account
  staffUserId?: string | null;
};

export type Venue = {
  id: string;
  name: string;
  venueCode?: number;
  completionRate: number;
  avgScenarioScore: number;
  upsellRate: number;
  activeStaff: number;
  venueType?: string;
  staffLimit?: number;
  managerPermissions?: string;
};

export type TrainingProgram = {
  id: string;
  venueId: string;
  name: string;
  roleTarget: string;
  description: string;
  completion: number;
  dayPlan: string[];
};

export type InventoryCategory = {
  venueId: string;
  name: string;
  products: string[];
};

export type MenuKnowledgeItem = {
  name: string;
  count: number;
  note: string;
};

export type ScenarioCategory = {
  name: string;
  attempts: number;
  avgScore: number;
  failed: string;
};

export type ManagementCapabilities = {
  databaseConnected: boolean;
  staffCrud: boolean;
  inventoryCrud: boolean;
  trainingProgramsCrud: boolean;
};

export type ManagementSnapshot = {
  source: "seed" | "database";
  notices: string[];
  capabilities: ManagementCapabilities;
  venues: Venue[];
  staff: StaffMember[];
  trainingPrograms: TrainingProgram[];
  inventory: InventoryCategory[];
  menuKnowledge: MenuKnowledgeItem[];
  scenarioCategories: ScenarioCategory[];
  reportSummaries: Array<{
    title: string;
    summary: string;
  }>;
  enabledModules: string[];
};

export type NewStaffPayload = {
  name: string;
  role: StaffRole;
  email?: string;
  sendInvite?: boolean;
  venueId?: string;
};

export type NewInventoryPayload = {
  category: string;
  name: string;
  venueId?: string;
};

export type NewTrainingProgramPayload = {
  name: string;
  roleTarget: string;
  description: string;
  dayPlan: string[];
  venueId?: string;
};

export type NewVenuePayload = {
  name: string;
};

export type StaffInvitePayload = {
  email: string;
  name?: string;
};

export type InviteResult = {
  invited: boolean;
  message: string;
};