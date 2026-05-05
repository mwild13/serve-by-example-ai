import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { buildSeedManagementSnapshot } from "@/lib/management/seed";
import type {
  InventoryCategory,
  ManagementSnapshot,
  MenuKnowledgeItem,
  NewInventoryPayload,
  NewStaffPayload,
  NewTrainingProgramPayload,
  NewVenuePayload,
  ScenarioCategory,
  StaffMember,
  StaffRole,
  StaffStatus,
  TrainingProgram,
  Venue,
} from "@/lib/management/types";

type ManagementSupabaseClient = SupabaseClient;

type QueryResult<T> = {
  data: T | null;
  missing: boolean;
};

const DEFAULT_ENABLED_MODULES = [
  "Bartending training",
  "Sales training",
  "Management modules",
  "Scenario categories",
  "Mobile training mode",
];

const FALLBACK_SCENARIOS: ScenarioCategory[] = buildSeedManagementSnapshot().scenarioCategories;
const FALLBACK_REPORTS = buildSeedManagementSnapshot().reportSummaries;

function isMissingRelation(error: PostgrestError | null) {
  return error?.code === "42P01";
}

function isMissingColumn(error: PostgrestError | null) {
  if (!error) {
    return false;
  }

  if (error.code === "42703" || error.code === "PGRST204") {
    return true;
  }

  return (
    error.message?.toLowerCase().includes("could not find") === true &&
    error.message?.toLowerCase().includes("column") === true
  );
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function formatLastActive(value: string | null) {
  if (!value) {
    return "Not started";
  }

  const lastActive = new Date(value);
  if (Number.isNaN(lastActive.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - lastActive.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

async function safeSelect<T>(
  promise: PromiseLike<{ data: T | null; error: PostgrestError | null }>,
): Promise<QueryResult<T>> {
  const { data, error } = await promise;

  if (isMissingRelation(error)) {
    return { data: null, missing: true };
  }

  if (error) {
    throw error;
  }

  return { data, missing: false };
}

function buildMenuKnowledge(inventory: InventoryCategory[]): MenuKnowledgeItem[] {
  const totalProducts = inventory.reduce((sum, category) => sum + category.products.length, 0);

  return [
    { name: "Inventory knowledge", count: totalProducts, note: "Products configured for AI scenario realism" },
    { name: "Spirits", count: totalProducts, note: "House and premium upgrade range" },
    { name: "Categories", count: inventory.length, note: "Distinct category groupings" },
  ];
}

function calculateMetrics(staff: StaffMember[]) {
  // Phase 4: Calculate metrics dynamically from real data
  if (staff.length === 0) {
    return { completionRate: 0, avgScenarioScore: 0, upsellRate: 0 };
  }

  // Training completion: average progress across all staff
  const completionRate = Math.round(
    staff.reduce((sum, member) => sum + member.progress, 0) / staff.length,
  );

  // Scenario quality: average of service and product scores
  const avgScenarioScore = Math.round(
    staff.reduce((sum, member) => sum + (member.serviceScore + member.productScore) / 2, 0) / staff.length,
  );

  // Upsell trend: average sales score
  const upsellRate = Math.round(
    staff.reduce((sum, member) => sum + member.salesScore, 0) / staff.length,
  );

  return { completionRate, avgScenarioScore, upsellRate };
}

function mapVenue(row: Record<string, unknown>, staff: StaffMember[]): Venue {
  const parsedVenueCode = Number(row.venue_code);
  const { completionRate, avgScenarioScore, upsellRate } = calculateMetrics(staff);

  return {
    id: asString(row.id, crypto.randomUUID()),
    name: asString(row.name, "Venue"),
    venueCode: Number.isFinite(parsedVenueCode) ? parsedVenueCode : undefined,
    completionRate,
    avgScenarioScore,
    upsellRate,
    activeStaff: staff.length,
    staffLimit: asNumber(row.staff_limit, 25),
    managerPermissions: asString(row.manager_permissions, "2 managers, 1 supervisor admin"),
  };
}

function mapStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: asString(row.id, crypto.randomUUID()),
    venueId: asString(row.venue_id),
    name: asString(row.name, "Unnamed staff"),
    email: asString(row.email, "") || undefined,
    role: asString(row.role, "New Staff") as StaffRole,
    progress: asNumber(row.progress),
    serviceScore: asNumber(row.service_score),
    salesScore: asNumber(row.sales_score),
    productScore: asNumber(row.product_score),
    lastActive: formatLastActive(asString(row.last_active_at, null as never)),
    status: asString(row.status, "on-track") as StaffStatus,
    strengths: asStringArray(row.strengths),
    improvements: asStringArray(row.improvements),
    // Mastery engine fields (graceful — undefined if columns don't exist yet)
    masteryStatus: typeof row.mastery_status === "string" ? row.mastery_status : undefined,
    eloRating: typeof row.elo_rating === "number" ? row.elo_rating : undefined,
    knowledgeDecayRisk: typeof row.knowledge_decay_risk === "boolean" ? row.knowledge_decay_risk : undefined,
    highConfidenceIncorrectRatio: typeof row.high_confidence_incorrect_ratio === "number" ? row.high_confidence_incorrect_ratio : undefined,
    scenariosMastered: typeof row.scenarios_mastered === "number" ? row.scenarios_mastered : undefined,
    scenariosAttempted: typeof row.scenarios_attempted === "number" ? row.scenarios_attempted : undefined,
    staffUserId: typeof row.staff_user_id === "string" ? row.staff_user_id : null,
  };
}

function mapTrainingProgram(row: Record<string, unknown>): TrainingProgram {
  return {
    id: asString(row.id, crypto.randomUUID()),
    venueId: asString(row.venue_id),
    name: asString(row.name, "Untitled program"),
    roleTarget: asString(row.role_target, "All staff"),
    description: asString(row.description, ""),
    completion: asNumber(row.completion),
    dayPlan: asStringArray(row.day_plan),
  };
}

function groupInventory(rows: Record<string, unknown>[]): InventoryCategory[] {
  const grouped = new Map<string, string[]>();
  const venueByCategory = new Map<string, string>();

  for (const row of rows) {
    const category = asString(row.category, "Uncategorized");
    const venueId = asString(row.venue_id);
    const compoundKey = `${venueId}:::${category}`;
    const current = grouped.get(compoundKey) ?? [];
    current.push(asString(row.name, "Unnamed product"));
    grouped.set(compoundKey, current);
    venueByCategory.set(compoundKey, venueId);
  }

  return Array.from(grouped.entries()).map(([compoundKey, products]) => ({
    venueId: venueByCategory.get(compoundKey) ?? "",
    name: compoundKey.split(":::")[1] ?? "Uncategorized",
    products,
  }));
}

async function getOwnedVenues(supabase: ManagementSupabaseClient, userId: string) {
  const withCodeQuery = await supabase
    .from("venues")
    .select("id, name, venue_code, staff_limit, manager_permissions, completion_rate, avg_scenario_score, upsell_rate")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true });

  if (!withCodeQuery.error) {
    return { data: withCodeQuery.data ?? [], missing: false };
  }

  if (isMissingRelation(withCodeQuery.error)) {
    return { data: null, missing: true };
  }

  if (!isMissingColumn(withCodeQuery.error)) {
    throw withCodeQuery.error;
  }

  const legacyQuery = await supabase
    .from("venues")
    .select("id, name, staff_limit, manager_permissions, completion_rate, avg_scenario_score, upsell_rate")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true });

  if (isMissingRelation(legacyQuery.error)) {
    return { data: null, missing: true };
  }

  if (legacyQuery.error) {
    throw legacyQuery.error;
  }

  return { data: legacyQuery.data ?? [], missing: false };
}

async function getNextVenueCode(supabase: ManagementSupabaseClient) {
  const { data, error } = await supabase
    .from("venues")
    .select("venue_code")
    .not("venue_code", "is", null)
    .order("venue_code", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isMissingRelation(error)) {
    throw new Error("Management schema missing: venues table not found. Run supabase/management_schema.sql first.");
  }

  if (isMissingColumn(error)) {
    throw new Error("Management schema missing: venues.venue_code not found. Add a venue_code column before using manager unlock codes.");
  }

  if (error) {
    throw error;
  }

  const highestCode = Number(data?.venue_code);
  if (!Number.isFinite(highestCode) || highestCode < 120) {
    return 120;
  }

  return Math.min(highestCode + 1, 999);
}

async function getStaffRows(
  supabase: ManagementSupabaseClient,
  venueIds: string[],
  notices: string[],
): Promise<QueryResult<Record<string, unknown>[]>> {
  const latestStaffQuery = await supabase
    .from("venue_staff")
    .select("id, venue_id, name, email, role, progress, service_score, sales_score, product_score, last_active_at, status, strengths, improvements, mastery_status, elo_rating, knowledge_decay_risk, high_confidence_incorrect_ratio, scenarios_mastered, scenarios_attempted, staff_user_id")
    .in("venue_id", venueIds)
    .order("created_at", { ascending: true });

  if (isMissingRelation(latestStaffQuery.error)) {
    return { data: null, missing: true };
  }

  if (!latestStaffQuery.error) {
    return { data: latestStaffQuery.data ?? [], missing: false };
  }

  if (!isMissingColumn(latestStaffQuery.error)) {
    throw latestStaffQuery.error;
  }

  const legacyWithEmailQuery = await supabase
    .from("venue_staff")
    .select("id, venue_id, name, email, role, last_active_at")
    .in("venue_id", venueIds)
    .order("created_at", { ascending: true });

  if (isMissingRelation(legacyWithEmailQuery.error)) {
    return { data: null, missing: true };
  }

  if (!legacyWithEmailQuery.error) {
    notices.push(
      "Your venue_staff table is using a legacy column set. Run the latest management schema update for full staff analytics fields.",
    );
    return { data: legacyWithEmailQuery.data ?? [], missing: false };
  }

  if (!isMissingColumn(legacyWithEmailQuery.error)) {
    throw legacyWithEmailQuery.error;
  }

  const legacyMinimalQuery = await supabase
    .from("venue_staff")
    .select("id, venue_id, name, role")
    .in("venue_id", venueIds)
    .order("created_at", { ascending: true });

  if (isMissingRelation(legacyMinimalQuery.error)) {
    return { data: null, missing: true };
  }

  if (legacyMinimalQuery.error) {
    throw legacyMinimalQuery.error;
  }

  notices.push(
    "Your venue_staff table is using a minimal legacy schema. Run the latest management schema update for email tracking and analytics.",
  );

  return { data: legacyMinimalQuery.data ?? [], missing: false };
}

async function resolveManagerVenueId(
  supabase: ManagementSupabaseClient,
  userId: string,
  requestedVenueId?: string,
) {
  if (!requestedVenueId) {
    return ensureManagerVenue(supabase, userId);
  }

  const venueResult = await getOwnedVenues(supabase, userId);

  if (venueResult.missing) {
    throw new Error("Management schema missing: venues table not found. Run supabase/management_schema.sql first.");
  }

  const ownedVenue = (venueResult.data ?? []).find((venue) => asString(venue.id) === requestedVenueId);
  if (ownedVenue) {
    return requestedVenueId;
  }

  // Fallback for seeded UI IDs that do not exist in DB yet.
  return ensureManagerVenue(supabase, userId);
}

export async function getManagementSnapshot(
  supabase: ManagementSupabaseClient,
  userId: string,
): Promise<ManagementSnapshot> {
  const fallbackSnapshot = buildSeedManagementSnapshot();
  const notices: string[] = [];

  const venueResult = await getOwnedVenues(supabase, userId);
  if (venueResult.missing) {
    return fallbackSnapshot;
  }

  const venueRows = venueResult.data ?? [];
  if (!venueRows.length) {
    return {
      ...fallbackSnapshot,
      notices: [
        "No venues are saved for this manager yet. Create the tables and start adding staff, inventory and programs.",
        ...fallbackSnapshot.notices,
      ],
    };
  }

  const venueIds = venueRows.map((row) => asString(row.id)).filter(Boolean);
  const [staffResult, programResult, inventoryResult] = await Promise.all([
    getStaffRows(supabase, venueIds, notices),
    safeSelect<Record<string, unknown>[]>(
      supabase
        .from("training_programs")
        .select("id, venue_id, name, role_target, description, completion, day_plan")
        .in("venue_id", venueIds)
        .order("created_at", { ascending: true }),
    ),
    safeSelect<Record<string, unknown>[]>(
      supabase
        .from("venue_inventory_items")
        .select("id, venue_id, category, name")
        .in("venue_id", venueIds)
        .order("category", { ascending: true })
        .order("name", { ascending: true }),
    ),
  ]);

  if (staffResult.missing) {
    notices.push("The venue_staff table is missing. Staff persistence is disabled until the management schema is applied.");
  }

  if (programResult.missing) {
    notices.push("The training_programs table is missing. Program builder persistence is disabled until the management schema is applied.");
  }

  if (inventoryResult.missing) {
    notices.push("The venue_inventory_items table is missing. Inventory persistence is disabled until the management schema is applied.");
  }

  const staff = (staffResult.data ?? []).map(mapStaff);
  const trainingPrograms = (programResult.data ?? []).map(mapTrainingProgram);
  const inventory = groupInventory(inventoryResult.data ?? []);
  const venues = venueRows.map((row) => {
    const venueId = asString(row.id);
    const venueStaff = staff.filter((member) => member.venueId === venueId);
    return mapVenue(row, venueStaff);
  });

  return {
    source: "database",
    notices,
    capabilities: {
      databaseConnected: true,
      staffCrud: !staffResult.missing,
      inventoryCrud: !inventoryResult.missing,
      trainingProgramsCrud: !programResult.missing,
    },
    venues,
    staff,
    trainingPrograms,
    inventory,
    menuKnowledge: inventory.length ? buildMenuKnowledge(inventory) : fallbackSnapshot.menuKnowledge,
    scenarioCategories: FALLBACK_SCENARIOS,
    reportSummaries: FALLBACK_REPORTS,
    enabledModules: DEFAULT_ENABLED_MODULES,
  };
}

export async function ensureManagerVenue(supabase: ManagementSupabaseClient, userId: string) {
  const venueResult = await getOwnedVenues(supabase, userId);

  if (venueResult.missing) {
    throw new Error("Management schema missing: venues table not found. Run supabase/management_schema.sql first.");
  }

  const existingVenue = venueResult.data?.[0];
  if (existingVenue) {
    return asString(existingVenue.id);
  }

  const venueCode = await getNextVenueCode(supabase).catch((error) => {
    if (
      error instanceof Error &&
      error.message.includes("venues.venue_code not found")
    ) {
      return null;
    }
    throw error;
  });

  const insertPayload: Record<string, unknown> = {
    owner_user_id: userId,
    name: "Primary Venue",
    staff_limit: 25,
    manager_permissions: "2 managers, 1 supervisor admin",
  };

  if (typeof venueCode === "number") {
    insertPayload.venue_code = venueCode;
  }

  let insertResult = await supabase
    .from("venues")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertResult.error && isMissingColumn(insertResult.error)) {
    const fallbackPayload = { ...insertPayload };
    delete fallbackPayload.venue_code;
    insertResult = await supabase
      .from("venues")
      .insert(fallbackPayload)
      .select("id")
      .single();
  }

  const { data, error } = insertResult;

  if (error) {
    throw error;
  }

  return asString(data.id);
}

export async function createVenue(
  supabase: ManagementSupabaseClient,
  userId: string,
  payload: NewVenuePayload,
) {
  const venueCode = await getNextVenueCode(supabase).catch((error) => {
    if (
      error instanceof Error &&
      error.message.includes("venues.venue_code not found")
    ) {
      return null;
    }
    throw error;
  });

  const insertPayload: Record<string, unknown> = {
    owner_user_id: userId,
    name: payload.name,
    staff_limit: 25,
    manager_permissions: "2 managers, 1 supervisor admin",
  };

  if (typeof venueCode === "number") {
    insertPayload.venue_code = venueCode;
  }

  let insertResult = await supabase.from("venues").insert(insertPayload).select("id").single();

  if (insertResult.error && isMissingColumn(insertResult.error)) {
    const fallbackPayload = { ...insertPayload };
    delete fallbackPayload.venue_code;
    insertResult = await supabase.from("venues").insert(fallbackPayload).select("id").single();
  }

  const { data, error } = insertResult;

  if (isMissingRelation(error)) {
    throw new Error("Management schema missing: venues table not found. Run supabase/management_schema.sql first.");
  }

  if (error) {
    throw error;
  }

  // Phase 2: Initialize new venue with helpful starter data
  const newVenueId = asString(data?.id);
  if (!newVenueId) {
    return;
  }

  // Import starter templates
  const { DEFAULT_STARTER_STAFF, DEFAULT_STARTER_PROGRAMS, DEFAULT_STARTER_INVENTORY } = await import("./seed");

  // Seed default staff roles (non-blocking, best effort)
  try {
    const staffInserts = DEFAULT_STARTER_STAFF.map((staff) => ({
      venue_id: newVenueId,
      manager_user_id: userId,
      name: staff.name,
      role: staff.role,
      progress: 0,
      service_score: 0,
      sales_score: 0,
      product_score: 0,
      status: "on-track",
      strengths: [],
      improvements: [],
    }));
    await supabase.from("venue_staff").insert(staffInserts).then();
  } catch {
    // Silently continue if staff seeding fails
  }

  // Seed default training programs (non-blocking, best effort)
  try {
    const programInserts = DEFAULT_STARTER_PROGRAMS.map((program) => ({
      venue_id: newVenueId,
      manager_user_id: userId,
      name: program.name,
      role_target: program.roleTarget,
      description: program.description,
      completion: 0,
      day_plan: program.dayPlan,
    }));
    await supabase.from("training_programs").insert(programInserts).then();
  } catch {
    // Silently continue if program seeding fails
  }

  // Seed default inventory (non-blocking, best effort)
  try {
    const inventoryInserts = DEFAULT_STARTER_INVENTORY.flatMap((category) =>
      category.products.map((product) => ({
        venue_id: newVenueId,
        manager_user_id: userId,
        category: category.category,
        name: product,
      })),
    );
    await supabase.from("venue_inventory_items").insert(inventoryInserts).then();
  } catch {
    // Silently continue if inventory seeding fails
  }
}

export async function deleteVenue(
  supabase: ManagementSupabaseClient,
  userId: string,
  venueId: string,
) {
  const venueResult = await getOwnedVenues(supabase, userId);
  if (venueResult.missing) {
    throw new Error("Management schema missing: venues table not found. Run supabase/management_schema.sql first.");
  }


  const { error } = await supabase
    .from("venues")
    .delete()
    .eq("owner_user_id", userId)
    .eq("id", venueId);

  if (error) {
    throw error;
  }
}

export async function createStaffMember(
  supabase: ManagementSupabaseClient,
  userId: string,
  payload: NewStaffPayload,
) {
  const venueId = await resolveManagerVenueId(supabase, userId, payload.venueId);
  const payloadVariants: Array<Record<string, unknown>> = [
    {
      venue_id: venueId,
      manager_user_id: userId,
      name: payload.name,
      email: payload.email ?? null,
      role: payload.role,
      progress: 0,
      service_score: 0,
      sales_score: 0,
      product_score: 0,
      status: "on-track",
      strengths: [],
      improvements: [],
    },
    {
      venue_id: venueId,
      manager_user_id: userId,
      name: payload.name,
      role: payload.role,
      progress: 0,
      service_score: 0,
      sales_score: 0,
      product_score: 0,
      status: "on-track",
      strengths: [],
      improvements: [],
    },
    {
      venue_id: venueId,
      manager_user_id: userId,
      name: payload.name,
      email: payload.email ?? null,
      role: payload.role,
    },
    {
      venue_id: venueId,
      manager_user_id: userId,
      name: payload.name,
      role: payload.role,
    },
    {
      venue_id: venueId,
      name: payload.name,
      email: payload.email ?? null,
      role: payload.role,
    },
    {
      venue_id: venueId,
      name: payload.name,
      role: payload.role,
    },
  ];

  let lastError: PostgrestError | null = null;

  for (const variant of payloadVariants) {
    const { error } = await supabase.from("venue_staff").insert(variant);

    if (!error) {
      return;
    }

    if (isMissingRelation(error)) {
      throw new Error("Management schema missing: venue_staff table not found. Run supabase/management_schema.sql first.");
    }

    lastError = error;

    if (isMissingColumn(error)) {
      continue;
    }

    throw error;
  }

  if (isMissingRelation(lastError)) {
    throw new Error("Management schema missing: venue_staff table not found. Run supabase/management_schema.sql first.");
  }

  if (lastError) {
    throw lastError;
  }
}

export async function createInventoryItem(
  supabase: ManagementSupabaseClient,
  userId: string,
  payload: NewInventoryPayload,
) {
  const venueId = await resolveManagerVenueId(supabase, userId, payload.venueId);
  const { error } = await supabase.from("venue_inventory_items").insert({
    venue_id: venueId,
    manager_user_id: userId,
    category: payload.category,
    name: payload.name,
  });

  if (isMissingRelation(error)) {
    throw new Error("Management schema missing: venue_inventory_items table not found. Run supabase/management_schema.sql first.");
  }

  if (error) {
    throw error;
  }
}

export async function createTrainingProgram(
  supabase: ManagementSupabaseClient,
  userId: string,
  payload: NewTrainingProgramPayload,
) {
  const venueId = await resolveManagerVenueId(supabase, userId, payload.venueId);
  const { error } = await supabase.from("training_programs").insert({
    venue_id: venueId,
    manager_user_id: userId,
    name: payload.name,
    role_target: payload.roleTarget,
    description: payload.description,
    day_plan: payload.dayPlan,
    completion: 0,
  });

  if (isMissingRelation(error)) {
    throw new Error("Management schema missing: training_programs table not found. Run supabase/management_schema.sql first.");
  }

  if (error) {
    throw error;
  }
}

export async function deleteInventoryItem(
  supabase: ManagementSupabaseClient,
  userId: string,
  itemId: string,
) {
  const { error } = await supabase
    .from("venue_inventory_items")
    .delete()
    .eq("id", itemId)
    .eq("manager_user_id", userId);

  if (error) {
    throw error;
  }
}

export async function deleteTrainingProgram(
  supabase: ManagementSupabaseClient,
  userId: string,
  programId: string,
) {
  const { error } = await supabase
    .from("training_programs")
    .delete()
    .eq("id", programId)
    .eq("manager_user_id", userId);

  if (error) {
    throw error;
  }
}
