"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type {
  ManagementSnapshot,
  ManagerSection,
  NewInventoryPayload,
  NewStaffPayload,
  NewTrainingProgramPayload,
  StaffRole,
} from "@/lib/management/types";

type QuickActionId = "add-staff" | "assign-training" | "add-inventory" | "create-program";

type NavItem = {
  id: ManagerSection;
  label: string;
  icon: string;
};

type NavGroup = {
  label: string;
  collapsible?: boolean;
  items: NavItem[];
};

type SearchResult = {
  id: string;
  category: "staff" | "scenario" | "program" | "inventory" | "report";
  label: string;
  sublabel?: string;
  section: ManagerSection;
};

type SnapshotResponse = ManagementSnapshot & {
  inviteMessage?: string;
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [{ id: "overview", label: "Overview", icon: "⌂" }],
  },
  {
    label: "Training",
    collapsible: true,
    items: [
      { id: "training", label: "Programs", icon: "◧" },
      { id: "scenarios", label: "Scenarios", icon: "◎" },
    ],
  },
  {
    label: "People",
    collapsible: true,
    items: [
      { id: "staff", label: "Staff", icon: "◉" },
      { id: "teams", label: "Teams", icon: "◈" },
      { id: "roles", label: "Roles & Permissions", icon: "◌" },
    ],
  },
  {
    label: "Operations",
    collapsible: true,
    items: [
      { id: "inventory", label: "Inventory", icon: "◫" },
      { id: "menu", label: "Menu Items", icon: "◨" },
      { id: "compliance", label: "Compliance", icon: "◯" },
    ],
  },
  {
    label: "Performance",
    collapsible: true,
    items: [
      { id: "analytics", label: "Analytics", icon: "◔" },
      { id: "reports", label: "Reports", icon: "◍" },
      { id: "leaderboards", label: "Leaderboards", icon: "◬" },
      { id: "notifications", label: "Notifications", icon: "◉" },
    ],
  },
  {
    label: "Admin",
    collapsible: true,
    items: [
      { id: "settings", label: "Settings", icon: "◦" },
      { id: "billing", label: "Billing", icon: "◒" },
      { id: "integrations", label: "Integrations", icon: "◧" },
    ],
  },
];

const SCENARIO_TEMPLATES = [
  {
    id: "upsell-challenge",
    name: "Upsell challenge",
    description: "Customer orders a standard drink. Practice guiding them toward a premium option and pairing.",
    icon: "💰",
    focus: "Sales & upselling",
    difficulty: "Intermediate",
  },
  {
    id: "difficult-customer",
    name: "Difficult customer",
    description: "Customer is frustrated with wait times and makes a complaint at the bar.",
    icon: "😤",
    focus: "De-escalation & service recovery",
    difficulty: "Advanced",
  },
  {
    id: "menu-knowledge",
    name: "Menu knowledge quiz",
    description: "Staff must answer questions about current seasonal menu items and ingredients.",
    icon: "📋",
    focus: "Product knowledge",
    difficulty: "Beginner",
  },
  {
    id: "cocktail-build",
    name: "Cocktail build test",
    description: "Step-by-step scenario where staff recall the correct build order and garnish.",
    icon: "🍹",
    focus: "Technical skills",
    difficulty: "Intermediate",
  },
];

const SECTION_META: Record<ManagerSection, { cluster: string; label: string }> = {
  overview: { cluster: "Workspace", label: "Overview" },
  training: { cluster: "Training", label: "Programs" },
  scenarios: { cluster: "Training", label: "Scenarios" },

  staff: { cluster: "People", label: "Staff" },
  teams: { cluster: "People", label: "Teams" },
  roles: { cluster: "People", label: "Roles & Permissions" },
  inventory: { cluster: "Operations", label: "Inventory" },
  menu: { cluster: "Operations", label: "Menu Items" },
  compliance: { cluster: "Operations", label: "Compliance" },
  analytics: { cluster: "Performance", label: "Analytics" },
  reports: { cluster: "Performance", label: "Reports" },
  leaderboards: { cluster: "Performance", label: "Leaderboards" },
  notifications: { cluster: "Performance", label: "Notifications" },
  settings: { cluster: "Admin", label: "Settings" },
  billing: { cluster: "Admin", label: "Billing" },
  integrations: { cluster: "Admin", label: "Integrations" },
};

const QUICK_ACTIONS: Array<{
  id: QuickActionId;
  label: string;
  section: ManagerSection;
}> = [
  { id: "add-staff", label: "Add staff", section: "staff" },
  { id: "assign-training", label: "Assign training", section: "training" },
  { id: "create-program", label: "Create program", section: "training" },
  { id: "add-inventory", label: "Add inventory", section: "inventory" },
];

const STAFF_ROLE_OPTIONS: StaffRole[] = [
  "Bartender",
  "Floor",
  "Supervisor",
  "Manager",
  "New Staff",
];

const EMPTY_ACTION_MESSAGE =
  "Run supabase/management_schema.sql in Supabase, then reload this page to switch from seeded data to live manager data.";

function getActionSection(actionId: QuickActionId | null): ManagerSection | null {
  if (!actionId) {
    return null;
  }

  return QUICK_ACTIONS.find((action) => action.id === actionId)?.section ?? null;
}

export default function ManagerControlCenter({
  initialSnapshot,
  plan,
}: {
  initialSnapshot: ManagementSnapshot;
  plan?: string;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeSection, setActiveSection] = useState<ManagerSection>("overview");
  const [selectedVenueId, setSelectedVenueId] = useState(initialSnapshot.venues[0]?.id ?? "");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [activeAction, setActiveAction] = useState<QuickActionId | null>(null);
  const [staffForm, setStaffForm] = useState<NewStaffPayload>({
    name: "",
    role: "New Staff",
    email: "",
    sendInvite: false,
  });
  const [inventoryForm, setInventoryForm] = useState<NewInventoryPayload>({
    category: "",
    name: "",
  });
  const [programForm, setProgramForm] = useState<NewTrainingProgramPayload>({
    name: "",
    roleTarget: "Bartenders",
    description: "",
    dayPlan: ["", "", ""],
  });
  const [assignmentForm, setAssignmentForm] = useState<{ staffId: string; programId: string }>({
    staffId: "",
    programId: "",
  });
  const [newVenueName, setNewVenueName] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [menuTab, setMenuTab] = useState<"food" | "cocktails" | "wine">("food");
  const [menuInputText, setMenuInputText] = useState("");
  const [menuItems, setMenuItems] = useState<Record<string, string[]>>({ food: [], cocktails: [], wine: [] });
  const [revenueTransactionValue, setRevenueTransactionValue] = useState(45);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSnapshot(initialSnapshot);
  }, [initialSnapshot]);

  useEffect(() => {
    if (!snapshot.venues.some((venue) => venue.id === selectedVenueId)) {
      setSelectedVenueId(snapshot.venues[0]?.id ?? "");
    }
  }, [snapshot.venues, selectedVenueId]);

  const selectedVenue = snapshot.venues.find((venue) => venue.id === selectedVenueId) ?? snapshot.venues[0];
  const venueStaff = useMemo(
    () => snapshot.staff.filter((member) => member.venueId === selectedVenue?.id),
    [selectedVenue?.id, snapshot.staff],
  );
  const venuePrograms = useMemo(
    () => snapshot.trainingPrograms.filter((program) => program.venueId === selectedVenue?.id),
    [selectedVenue?.id, snapshot.trainingPrograms],
  );
  const venueInventory = useMemo(
    () => snapshot.inventory.filter((item) => item.venueId === selectedVenue?.id),
    [selectedVenue?.id, snapshot.inventory],
  );

  useEffect(() => {
    if (!venueStaff.some((member) => member.id === selectedStaffId)) {
      setSelectedStaffId(venueStaff[0]?.id ?? "");
    }
  }, [venueStaff, selectedStaffId]);

  useEffect(() => {
    if (!venueStaff.some((member) => member.id === assignmentForm.staffId)) {
      setAssignmentForm((current) => ({ ...current, staffId: venueStaff[0]?.id ?? "" }));
    }

    if (!venuePrograms.some((program) => program.id === assignmentForm.programId)) {
      setAssignmentForm((current) => ({ ...current, programId: venuePrograms[0]?.id ?? "" }));
    }
  }, [assignmentForm.programId, assignmentForm.staffId, venuePrograms, venueStaff]);

  useEffect(() => {
    if (activeSection !== "settings") {
      setRequestSuccess("");
      setRequestError("");
    }
  }, [activeSection]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "s") { event.preventDefault(); searchInputRef.current?.focus(); }
      else if (key === "a") { event.preventDefault(); setActiveSection("staff"); setActiveAction("add-staff"); setRequestError(""); setRequestSuccess(""); }
      else if (key === "t") { event.preventDefault(); setActiveSection("training"); setActiveAction("create-program"); setRequestError(""); setRequestSuccess(""); }
      else if (key === "i") { event.preventDefault(); setActiveSection("inventory"); setActiveAction("add-inventory"); setRequestError(""); setRequestSuccess(""); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // setters from useState are stable references

  const selectedStaff = venueStaff.find((member) => member.id === selectedStaffId) ?? venueStaff[0];
  const selectedProgram = venuePrograms.find((program) => program.id === assignmentForm.programId) ?? venuePrograms[0];
  const hasOperationalData = venueStaff.length > 0 || venuePrograms.length > 0 || venueInventory.length > 0;

  const breadcrumbs = useMemo(() => {
    const meta = SECTION_META[activeSection];
    if (!meta) {
      return ["Management", "Overview"];
    }

    const trail = ["Management", meta.cluster, meta.label];

    if (activeSection === "staff" && selectedStaff) {
      trail.push(selectedStaff.name);
    }

    if (activeSection === "training" && selectedProgram) {
      trail.push(selectedProgram.name);
    }

    return trail;
  }, [activeSection, selectedProgram, selectedStaff]);

  const metrics = useMemo(() => {
    const totalStaff = venueStaff.length;
    const activeThisWeek = venueStaff.filter(
      (member) => member.lastActive !== "7 days ago" && member.lastActive !== "Not started",
    ).length;

    if (!totalStaff) {
      return {
        totalStaff: 0,
        activeThisWeek: 0,
        avgCompletion: selectedVenue?.completionRate ?? 0,
        avgScenarioScore: selectedVenue?.avgScenarioScore ?? 0,
        serviceSkill: 0,
        productSkill: 0,
        salesSkill: selectedVenue?.upsellRate ?? 0,
        venueHealthScore: Math.round(
          ((selectedVenue?.completionRate ?? 0) +
            (selectedVenue?.avgScenarioScore ?? 0) +
            (selectedVenue?.upsellRate ?? 0)) /
            3,
        ),
      };
    }

    const avgCompletion = Math.round(
      venueStaff.reduce((sum, member) => sum + member.progress, 0) / totalStaff,
    );
    const avgScenarioScore = Math.round(
      venueStaff.reduce(
        (sum, member) => sum + (member.serviceScore + member.salesScore + member.productScore) / 3,
        0,
      ) / totalStaff,
    );
    const serviceSkill = Math.round(
      venueStaff.reduce((sum, member) => sum + member.serviceScore, 0) / totalStaff,
    );
    const productSkill = Math.round(
      venueStaff.reduce((sum, member) => sum + member.productScore, 0) / totalStaff,
    );
    const salesSkill = Math.round(
      venueStaff.reduce((sum, member) => sum + member.salesScore, 0) / totalStaff,
    );
    const venueHealthScore = Math.round(
      avgCompletion * 0.35 +
        avgScenarioScore * 0.35 +
        salesSkill * 0.2 +
        (activeThisWeek / totalStaff) * 100 * 0.1,
    );

    return {
      totalStaff,
      activeThisWeek,
      avgCompletion,
      avgScenarioScore,
      serviceSkill,
      productSkill,
      salesSkill,
      venueHealthScore,
    };
  }, [selectedVenue, venueStaff]);

  const needsAttention = venueStaff.filter((member) => member.status !== "on-track");
  const inactiveCount = venueStaff.filter((member) => member.status === "inactive").length;

  const operationalAlerts: Array<{
    title: string;
    detail: string;
    actionLabel: string;
    section: ManagerSection;
  }> = [
    {
      title: "Training risk",
      detail:
        needsAttention.length > 0
          ? `${needsAttention.length} staff need targeted intervention on skills or completion.`
          : "All active staff are currently on-track.",
      actionLabel: "Review staff performance",
      section: "staff",
    },
    {
      title: "Upsell performance",
      detail:
        metrics.salesSkill > 0
          ? `Upselling performance is ${metrics.salesSkill}%. Assign Upsell Mastery to boost conversion.`
          : "Upsell performance has no data yet. Assign a sales scenario to start tracking.",
      actionLabel: "Open scenarios",
      section: "scenarios",
    },
    {
      title: "Engagement",
      detail:
        inactiveCount > 0
          ? `${inactiveCount} staff inactive for 7 days or more.`
          : "No inactive staff this week.",
      actionLabel: "Assign training",
      section: "training",
    },
    {
      title: "Inventory intelligence",
      detail: venueInventory.length
        ? `AI is training on ${venueInventory.reduce((sum, category) => sum + category.products.length, 0)} products.`
        : "No inventory saved yet. Add categories to improve scenario realism.",
      actionLabel: "Manage inventory",
      section: "inventory",
    },
  ];

  const nextSteps = [
    {
      id: "next-add-staff",
      label: "Add your first staff member",
      action: () => openAction("add-staff"),
      show: venueStaff.length === 0,
    },
    {
      id: "next-create-program",
      label: "Create your first training program",
      action: () => openAction("create-program"),
      show: venuePrograms.length === 0,
    },
    {
      id: "next-add-inventory",
      label: "Add inventory to unlock scenario realism",
      action: () => openAction("add-inventory"),
      show: venueInventory.length === 0,
    },
  ].filter((item) => item.show);

  const todaySnapshot = {
    staffActive: metrics.activeThisWeek,
    scenariosCompleted: snapshot.scenarioCategories.reduce((sum, scenario) => sum + scenario.attempts, 0),
    salesImpact: metrics.salesSkill,
  };

  const recentActivity = [
    `${selectedVenue?.name ?? "Venue"}: ${venueStaff.length} active roster records`,
    `${venuePrograms.length} training programs currently available`,
    `${snapshot.reportSummaries.length} report summaries generated`,
  ];

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    venueStaff.forEach((member) => {
      if (member.name.toLowerCase().includes(q) || member.role.toLowerCase().includes(q) || (member.email ?? "").toLowerCase().includes(q)) {
        results.push({ id: `staff-${member.id}`, category: "staff", label: member.name, sublabel: member.role, section: "staff" });
      }
    });

    snapshot.scenarioCategories.forEach((scenario) => {
      if (scenario.name.toLowerCase().includes(q)) {
        results.push({ id: `scenario-${scenario.name}`, category: "scenario", label: scenario.name, sublabel: `${scenario.attempts} attempts`, section: "scenarios" });
      }
    });

    venuePrograms.forEach((program) => {
      if (program.name.toLowerCase().includes(q) || program.description.toLowerCase().includes(q)) {
        results.push({ id: `program-${program.id}`, category: "program", label: program.name, sublabel: program.roleTarget, section: "training" });
      }
    });

    venueInventory.forEach((category) => {
      if (category.name.toLowerCase().includes(q)) {
        results.push({ id: `inv-${category.name}`, category: "inventory", label: category.name, sublabel: `${category.products.length} items`, section: "inventory" });
      }
      category.products.forEach((product) => {
        if (product.toLowerCase().includes(q)) {
          results.push({ id: `inv-prod-${product}`, category: "inventory", label: product, sublabel: category.name, section: "inventory" });
        }
      });
    });

    snapshot.reportSummaries.forEach((report) => {
      if (report.title.toLowerCase().includes(q)) {
        results.push({ id: `report-${report.title}`, category: "report", label: report.title, sublabel: "Report", section: "reports" });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, venueStaff, snapshot.scenarioCategories, venuePrograms, venueInventory, snapshot.reportSummaries]);

  function openAction(actionId: QuickActionId) {
    const config = QUICK_ACTIONS.find((action) => action.id === actionId);

    if (config) {
      setActiveSection(config.section);
      setActiveAction(actionId);
      setRequestError("");
      setRequestSuccess("");
    }
  }

  function handleSectionChange(nextSection: ManagerSection) {
    setActiveSection(nextSection);

    const actionSection = getActionSection(activeAction);
    if (actionSection && actionSection !== nextSection) {
      setActiveAction(null);
    }
  }

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function handleMenuSave() {
    const lines = menuInputText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setMenuItems((prev) => ({
      ...prev,
      [menuTab]: [...new Set([...prev[menuTab], ...lines])],
    }));
    setMenuInputText("");
  }

  async function applySnapshotResult(response: Response) {
    const result = (await response.json()) as SnapshotResponse | { error: string };
    if (!response.ok || "error" in result) {
      throw new Error("error" in result ? result.error : "Unable to save changes.");
    }

    setSnapshot(result);
    if (result.inviteMessage && activeSection === "settings") {
      setRequestSuccess(result.inviteMessage);
    }

    return result;
  }

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeAction || !selectedVenue) {
      return;
    }

    if (activeAction === "assign-training") {
      const staffMember = venueStaff.find((member) => member.id === assignmentForm.staffId);
      const program = venuePrograms.find((item) => item.id === assignmentForm.programId);

      if (!staffMember || !program) {
        setRequestError("Pick a staff member and program before assigning training.");
        return;
      }

      setRequestError("");
      setRequestSuccess(`${program.name} assigned to ${staffMember.name}.`);
      setActiveAction(null);
      return;
    }

    const requestConfig =
      activeAction === "add-staff"
        ? {
            endpoint: "/api/management/staff",
            body: {
              ...staffForm,
              email: staffForm.email?.trim() || undefined,
              venueId: selectedVenue.id,
            },
            success: `${staffForm.name} added to ${selectedVenue.name}.`,
          }
        : activeAction === "add-inventory"
          ? {
              endpoint: "/api/management/inventory",
              body: { ...inventoryForm, venueId: selectedVenue.id },
              success: `${inventoryForm.name} added to ${inventoryForm.category}.`,
            }
          : {
              endpoint: "/api/management/training-programs",
              body: {
                ...programForm,
                dayPlan: programForm.dayPlan.map((item) => item.trim()).filter(Boolean),
                venueId: selectedVenue.id,
              },
              success: `${programForm.name} created for ${selectedVenue.name}.`,
            };

    setIsSaving(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const response = await fetch(requestConfig.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestConfig.body),
      });

      const result = await applySnapshotResult(response);
      if (!result.inviteMessage && activeSection === "settings") {
        setRequestSuccess(requestConfig.success);
      }
      setActiveAction(null);
      setStaffForm({ name: "", role: "New Staff", email: "", sendInvite: false });
      setInventoryForm({ category: "", name: "" });
      setProgramForm({
        name: "",
        roleTarget: "Bartenders",
        description: "",
        dayPlan: ["", "", ""],
      });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : EMPTY_ACTION_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddVenue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newVenueName.trim();
    if (!name) {
      setRequestError("Enter a venue name before adding it.");
      return;
    }

    setIsSaving(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const response = await fetch("/api/management/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result = await applySnapshotResult(response);
      const createdVenue = result.venues.find((venue) => venue.name === name);
      if (createdVenue) {
        setSelectedVenueId(createdVenue.id);
      }
      setNewVenueName("");
      setRequestSuccess(`${name} added to your venue group.`);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to add venue.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteVenue(venueId: string, venueName: string) {
    setIsSaving(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const response = await fetch(`/api/management/venues?venueId=${encodeURIComponent(venueId)}`, {
        method: "DELETE",
      });

      const result = await applySnapshotResult(response);
      if (selectedVenueId === venueId) {
        setSelectedVenueId(result.venues[0]?.id ?? "");
      }
      setRequestSuccess(`${venueName} removed.`);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to delete venue.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="ops-shell">
      <aside className="ops-sidebar">
        <div className="ops-sidebar-top">
          <span className="eyebrow">Management console</span>
          <h3>Venue operations</h3>
          <div className="ops-venue-switcher">
            {plan === "multi-venue" ? (
              <>
                <div className="ops-venue-switcher-head">
                  <strong>Multi-venue switcher</strong>
                  <button type="button" className="btn btn-secondary" onClick={() => handleSectionChange("analytics")}>
                    Group analytics
                  </button>
                </div>
                <label className="label" htmlFor="venue-select">
                  Active venue
                  <select
                    id="venue-select"
                    className="input"
                    value={selectedVenueId}
                    onChange={(event) => setSelectedVenueId(event.target.value)}
                  >
                    {snapshot.venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="ops-venue-mini-list">
                  {snapshot.venues.map((venue) => (
                    <button
                      key={`mini-${venue.id}`}
                      type="button"
                      className={`ops-venue-chip${selectedVenueId === venue.id ? " active" : ""}`}
                      onClick={() => setSelectedVenueId(venue.id)}
                    >
                      {venue.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="ops-venue-single">
                <strong>{snapshot.venues[0]?.name || "Your Venue"}</strong>
                <p style={{ color: "var(--text-soft)", fontSize: ".95rem", margin: "8px 0 0 0" }}>Single venue plan</p>
              </div>
            )}
          </div>
        </div>

        <nav className="ops-nav">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = group.collapsible && collapsedGroups.has(group.label);
            return (
              <div key={group.label} className="ops-nav-group">
                {group.collapsible ? (
                  <button
                    type="button"
                    className="ops-nav-group-toggle"
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={!isCollapsed}
                  >
                    <span>{group.label}</span>
                    <span className="ops-nav-chevron" aria-hidden="true">{isCollapsed ? "▸" : "▾"}</span>
                  </button>
                ) : (
                  <div className="ops-nav-group-label">{group.label}</div>
                )}
                {!isCollapsed && group.items.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`ops-nav-item${activeSection === section.id ? " active" : ""}`}
                    onClick={() => handleSectionChange(section.id)}
                  >
                    <span className="ops-nav-icon" aria-hidden="true">
                      {section.icon}
                    </span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      <section className="ops-workspace">
        <div className="ops-search-bar">
          <input
            ref={searchInputRef}
            className="ops-search-input"
            type="search"
            placeholder="Search staff, scenarios, programs, inventory, reports…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Global search"
          />
          {searchResults.length > 0 && (
            <ul className="ops-search-results" role="listbox">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="ops-search-result-item"
                  role="option"
                  aria-selected={false}
                  onClick={() => { handleSectionChange(result.section); setSearchQuery(""); }}
                >
                  <span className={`ops-search-cat-badge ops-cat-${result.category}`}>{result.category}</span>
                  <span className="ops-search-result-label">{result.label}</span>
                  {result.sublabel ? <span className="ops-search-result-sub">{result.sublabel}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ops-shortcut-bar">
          <span>Shortcuts:</span>
          <kbd>S</kbd><span>search</span>
          <kbd>A</kbd><span>add staff</span>
          <kbd>T</kbd><span>create program</span>
          <kbd>I</kbd><span>add inventory</span>
        </div>

        <nav className="ops-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb}-${index}`}>
              {index > 0 ? <em>/</em> : null}
              {crumb}
            </span>
          ))}
        </nav>

        <header className="ops-header">
          <div>
            <h1>Venue performance mission control</h1>
            <p>
              Daily operational visibility for training, service quality, sales performance and venue consistency.
            </p>
          </div>
          <div className="ops-health-card">
            <span>Venue health score</span>
            <strong>{metrics.venueHealthScore > 0 ? `${metrics.venueHealthScore}/100` : "No data yet"}</strong>
            <p>
              Service {metrics.serviceSkill || "-"} | Product {metrics.productSkill || "-"} | Sales {metrics.salesSkill || "-"}
            </p>
          </div>
        </header>

        <div className="ops-quick-bar">
          <strong>Quick actions</strong>
          <div className="ops-quick-bar-actions">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className={`ops-action-btn${activeAction === action.id ? " active" : ""}`}
                onClick={() => openAction(action.id)}
              >
                + {action.label}
              </button>
            ))}
          </div>
        </div>

        <section className={`ops-status-banner ${snapshot.source === "database" ? "live" : "seed"}`}>
          <div>
            <strong>{snapshot.source === "database" ? "Live manager data connected" : "Seeded manager preview mode"}</strong>
            <p>
              {snapshot.source === "database"
                ? "Staff, inventory and training programs can now move toward real venue persistence."
                : "The UI is product-ready, but the manager tables still need to be created in Supabase before writes become real."}
            </p>
          </div>
          {snapshot.notices.length ? (
            <ul className="ops-inline-list">
              {snapshot.notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          ) : null}
        </section>

        {((activeAction && getActionSection(activeAction) === activeSection) ||
          (activeSection === "settings" && (requestError || requestSuccess))) && (
          <section className="ops-card ops-action-panel">
            <div className="ops-card-head">
              <h3>
                {activeAction === "add-staff"
                  ? "Add staff member"
                  : activeAction === "assign-training"
                    ? "Assign training"
                  : activeAction === "add-inventory"
                    ? "Add inventory item"
                    : activeAction === "create-program"
                      ? "Create training program"
                      : "Recent update"}
              </h3>
              {activeAction ? (
                <button type="button" className="btn btn-secondary" onClick={() => setActiveAction(null)}>
                  Close
                </button>
              ) : null}
            </div>

            {requestSuccess ? <div className="auth-status auth-status-success">{requestSuccess}</div> : null}
            {requestError ? <div className="auth-status auth-status-error">{requestError}</div> : null}

            {activeAction === "assign-training" && (
              <form className="ops-action-form" onSubmit={submitAction}>
                <label className="label">
                  Staff member
                  <select
                    className="input"
                    value={assignmentForm.staffId}
                    onChange={(event) =>
                      setAssignmentForm((current) => ({ ...current, staffId: event.target.value }))
                    }
                    required
                  >
                    {venueStaff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label">
                  Program
                  <select
                    className="input"
                    value={assignmentForm.programId}
                    onChange={(event) =>
                      setAssignmentForm((current) => ({ ...current, programId: event.target.value }))
                    }
                    required
                  >
                    {venuePrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="btn btn-primary" type="submit">
                  Assign now
                </button>
              </form>
            )}

            {activeAction === "add-staff" && (
              <form className="ops-action-form" onSubmit={submitAction}>
                <label className="label">
                  Staff name
                  <input
                    className="input"
                    value={staffForm.name}
                    onChange={(event) => setStaffForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Sarah"
                    required
                  />
                </label>
                <label className="label">
                  Role
                  <select
                    className="input"
                    value={staffForm.role}
                    onChange={(event) =>
                      setStaffForm((current) => ({ ...current, role: event.target.value as StaffRole }))
                    }
                  >
                    {STAFF_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label">
                  Staff email (optional)
                  <input
                    className="input"
                    type="email"
                    value={staffForm.email ?? ""}
                    onChange={(event) =>
                      setStaffForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="staff@venue.com"
                  />
                </label>
                <label className="ops-inline-checkbox ops-action-span-full">
                  <input
                    type="checkbox"
                    checked={Boolean(staffForm.sendInvite)}
                    onChange={(event) =>
                      setStaffForm((current) => ({ ...current, sendInvite: event.target.checked }))
                    }
                  />
                  Send a Supabase signup invite email for this staff member
                </label>
                <button className="btn btn-primary ops-action-span-full" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save staff member"}
                </button>
              </form>
            )}

            {activeAction === "add-inventory" && (
              <form className="ops-action-form" onSubmit={submitAction}>
                <label className="label">
                  Category
                  <input
                    className="input"
                    value={inventoryForm.category}
                    onChange={(event) =>
                      setInventoryForm((current) => ({ ...current, category: event.target.value }))
                    }
                    placeholder="Vodka"
                    required
                  />
                </label>
                <label className="label">
                  Product name
                  <input
                    className="input"
                    value={inventoryForm.name}
                    onChange={(event) => setInventoryForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Grey Goose"
                    required
                  />
                </label>
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save inventory item"}
                </button>
              </form>
            )}

            {activeAction === "create-program" && (
              <form className="ops-action-form ops-action-form-wide" onSubmit={submitAction}>
                <label className="label">
                  Program name
                  <input
                    className="input"
                    value={programForm.name}
                    onChange={(event) => setProgramForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="New Bartender Program"
                    required
                  />
                </label>
                <label className="label">
                  Role target
                  <input
                    className="input"
                    value={programForm.roleTarget}
                    onChange={(event) =>
                      setProgramForm((current) => ({ ...current, roleTarget: event.target.value }))
                    }
                    placeholder="Bartenders"
                    required
                  />
                </label>
                <label className="label ops-action-span-full">
                  Program description
                  <textarea
                    className="input ops-textarea"
                    value={programForm.description}
                    onChange={(event) =>
                      setProgramForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Structured onboarding for speed, consistency and premium recommendations."
                    required
                  />
                </label>
                {programForm.dayPlan.map((step, index) => (
                  <label className="label" key={`step-${index + 1}`}>
                    Day plan step {index + 1}
                    <input
                      className="input"
                      value={step}
                      onChange={(event) =>
                        setProgramForm((current) => ({
                          ...current,
                          dayPlan: current.dayPlan.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        }))
                      }
                      placeholder={`Day ${index + 1}: focus area`}
                      required
                    />
                  </label>
                ))}
                <button className="btn btn-primary ops-action-span-full" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save training program"}
                </button>
              </form>
            )}
          </section>
        )}

        {activeSection === "overview" && (
          <>
            <section className="ops-grid ops-grid-kpi">
              <OpsKpiCard label="Total staff" value={metrics.totalStaff > 0 ? String(metrics.totalStaff) : "No data yet"} note="Current roster" />
              <OpsKpiCard label="Active this week" value={metrics.activeThisWeek > 0 ? String(metrics.activeThisWeek) : "No data yet"} note="Staff engaged in training" trend={getTrend(metrics.activeThisWeek > 0 ? (metrics.activeThisWeek / Math.max(metrics.totalStaff, 1)) * 100 : 0)} />
              <OpsKpiCard label="Training completion" value={formatPercent(metrics.avgCompletion)} note="Across all modules" trend={getTrend(metrics.avgCompletion)} />
              <OpsKpiCard label="Avg scenario score" value={formatPercent(metrics.avgScenarioScore)} note="Service + sales + product" trend={getTrend(metrics.avgScenarioScore)} />
              <OpsKpiCard label="Upsell performance" value={formatPercent(metrics.salesSkill)} note="Revenue impact lever" trend={getTrend(metrics.salesSkill)} />
              <div className="ops-kpi-card ops-primary-venue-tile">
                <span>Primary venue</span>
                <select className="input" value={selectedVenueId} onChange={(event) => setSelectedVenueId(event.target.value)}>
                  {snapshot.venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
                <small>Switches all manager views to this venue.</small>
              </div>
            </section>

            <section className="ops-grid ops-grid-main">
              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>Today&rsquo;s snapshot</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                <div className="ops-kpi-grid">
                  <OpsKpiCard label="Staff active today" value={todaySnapshot.staffActive > 0 ? String(todaySnapshot.staffActive) : "No data yet"} />
                  <OpsKpiCard label="Scenarios completed" value={todaySnapshot.scenariosCompleted > 0 ? String(todaySnapshot.scenariosCompleted) : "No data yet"} />
                  <OpsKpiCard label="Sales impact" value={formatPercent(todaySnapshot.salesImpact)} />
                  <OpsKpiCard label="Venue health" value={metrics.venueHealthScore > 0 ? `${metrics.venueHealthScore}/100` : "No data yet"} />
                </div>
              </article>

              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>What to do next</h3>
                </div>
                {nextSteps.length ? (
                  <div className="ops-quick-bar-actions">
                    {nextSteps.map((step) => (
                      <button key={step.id} type="button" className="ops-action-btn" onClick={step.action}>
                        {step.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyState copy="Great momentum. Your venue has core data in place and is ready for deeper optimization." />
                )}
              </article>
            </section>

            <section className="ops-grid ops-grid-main">
              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>Operational alerts</h3>
                </div>
                <ul className="ops-alert-list">
                  {operationalAlerts.map((alert) => (
                    <li key={alert.title}>
                      <strong>{alert.title}</strong>
                      <span>{alert.detail}</span>
                      <button type="button" className="ops-inline-link" onClick={() => handleSectionChange(alert.section)}>
                        {alert.actionLabel}
                      </button>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>Training completion by pillar</h3>
                </div>
                <ProgressBar label="Bartending" value={Math.max(metrics.productSkill, metrics.avgCompletion)} />
                <ProgressBar label="Sales" value={metrics.salesSkill} />
                <ProgressBar
                  label="Management"
                  value={
                    venuePrograms.length
                      ? Math.round(venuePrograms.reduce((sum, item) => sum + item.completion, 0) / venuePrograms.length)
                      : 0
                  }
                />
                <ProgressBar
                  label="Menu Knowledge"
                  value={venueInventory.length ? Math.min(venueInventory.reduce((sum, item) => sum + item.products.length, 0) * 3, 100) : 0}
                />
              </article>
            </section>

            {!hasOperationalData ? (
              <section className="ops-card">
                <EmptyState copy="Connect staff, programs, and inventory to unlock full manager analytics." />
              </section>
            ) : null}
          </>
        )}

        {activeSection === "staff" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Staff intelligence roster</h3>
                <span>{venueStaff.length} people in {selectedVenue?.name}</span>
              </div>
              {venueStaff.length ? (
                <div className="ops-table-wrap">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Completion</th>
                        <th>Service</th>
                        <th>Sales</th>
                        <th>Last active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venueStaff.map((member) => (
                        <tr
                          key={member.id}
                          className={selectedStaffId === member.id ? "active" : ""}
                          onClick={() => setSelectedStaffId(member.id)}
                        >
                          <td>{member.name}</td>
                          <td>{member.email ?? "-"}</td>
                          <td>{member.role}</td>
                          <td>{member.progress}%</td>
                          <td>{member.serviceScore}%</td>
                          <td>{member.salesScore}%</td>
                          <td>{member.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState copy="No staff saved yet. Use Add staff to create the first roster entry for this venue." />
              )}
            </article>

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>{selectedStaff ? `${selectedStaff.name} profile` : "Staff profile"}</h3>
                <span>{selectedStaff?.role ?? "Awaiting first roster entry"}</span>
              </div>
              {selectedStaff ? (
                <>
                  <div className="ops-profile-metrics">
                    <OpsKpiCard label="Completion" value={`${selectedStaff.progress}%`} />
                    <OpsKpiCard label="Service" value={`${selectedStaff.serviceScore}%`} />
                    <OpsKpiCard label="Sales" value={`${selectedStaff.salesScore}%`} />
                    <OpsKpiCard label="Product" value={`${selectedStaff.productScore}%`} />
                  </div>
                  <div className="ops-grid-two-col">
                    <div>
                      <strong className="ops-subhead">Strengths</strong>
                      <ul className="ops-plain-list">
                        {selectedStaff.strengths.length ? (
                          selectedStaff.strengths.map((item) => <li key={item}>{item}</li>)
                        ) : (
                          <li>No strengths recorded yet</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <strong className="ops-subhead">Needs improvement</strong>
                      <ul className="ops-plain-list">
                        {selectedStaff.improvements.length ? (
                          selectedStaff.improvements.map((item) => <li key={item}>{item}</li>)
                        ) : (
                          <li>No coaching notes recorded yet</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState copy="Once the first staff profile exists, this panel becomes the manager's coaching view." />
              )}
            </article>
          </section>
        )}

        {activeSection === "teams" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Team groups</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              <div className="ops-module-grid">
                <div className="ops-module-card">
                  <strong>Bar Team</strong>
                  <span>{venueStaff.filter((member) => member.role === "Bartender").length} members</span>
                </div>
                <div className="ops-module-card">
                  <strong>Floor Team</strong>
                  <span>{venueStaff.filter((member) => member.role === "Floor").length} members</span>
                </div>
                <div className="ops-module-card">
                  <strong>Leadership Team</strong>
                  <span>{venueStaff.filter((member) => member.role === "Supervisor" || member.role === "Manager").length} members</span>
                </div>
              </div>
            </article>
          </section>
        )}

        {activeSection === "roles" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Roles &amp; permissions</h3>
              </div>
              <div className="ops-module-grid">
                <div className="ops-module-card">
                  <strong>Manager</strong>
                  <span>Can manage staff, programs, inventory and reports.</span>
                </div>
                <div className="ops-module-card">
                  <strong>Supervisor</strong>
                  <span>Can assign training and review performance dashboards.</span>
                </div>
                <div className="ops-module-card">
                  <strong>Staff</strong>
                  <span>Can complete training and view personal progress.</span>
                </div>
              </div>
            </article>
          </section>
        )}

        {activeSection === "training" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Training program builder</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              {venuePrograms.length ? (
                venuePrograms.map((program) => (
                  <div key={program.id} className="ops-program-card">
                    <strong>{program.name}</strong>
                    <p>{program.description}</p>
                    <span className="ops-program-meta">{program.roleTarget}</span>
                    <ul className="ops-plain-list ops-compact-list">
                      {program.dayPlan.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <EmptyState copy="No saved programs yet. Use Create program to start building role-specific onboarding." />
              )}
            </article>
          </section>
        )}

        {activeSection === "inventory" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Venue inventory knowledge</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              {venueInventory.length ? (
                <div className="ops-module-grid">
                  {venueInventory.map((category) => (
                    <div key={`${category.venueId}-${category.name}`} className="ops-module-card">
                      <strong>{category.name}</strong>
                      <span>{category.products.join(" | ")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState copy="No inventory categories saved yet. Start with spirits, wine or beer and the AI will get smarter fast." />
              )}
            </article>
          </section>
        )}

        {activeSection === "menu" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Menu item intelligence</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              {snapshot.menuKnowledge.length ? (
                <ul className="ops-ranked-list">
                  {snapshot.menuKnowledge.map((item) => (
                    <li key={item.name}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.note}</span>
                      </div>
                      <b>{item.count}</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState copy="No menu items yet. Use the menu engineering tools on the right to add your categories." />
              )}
            </article>

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Menu engineering tools</h3>
                <span>Add items by category</span>
              </div>
              <div className="ops-menu-tabs">
                {(["food", "cocktails", "wine"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`ops-menu-tab${menuTab === tab ? " active" : ""}`}
                    onClick={() => setMenuTab(tab)}
                  >
                    {tab === "food" ? "🍽 Food" : tab === "cocktails" ? "🍹 Cocktails" : "🍷 Wine"}
                    {menuItems[tab].length > 0 ? <span className="ops-menu-count">{menuItems[tab].length}</span> : null}
                  </button>
                ))}
              </div>
              {menuItems[menuTab].length > 0 && (
                <ul className="ops-plain-list ops-compact-list">
                  {menuItems[menuTab].map((item) => (
                    <li key={item} className="ops-menu-item-row">
                      <span>{item}</span>
                      <button
                        type="button"
                        className="ops-menu-remove"
                        onClick={() => setMenuItems((prev) => ({ ...prev, [menuTab]: prev[menuTab].filter((i) => i !== item) }))}
                        aria-label={`Remove ${item}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label className="label">
                Paste items (one per line)
                <textarea
                  className="input ops-textarea"
                  rows={4}
                  value={menuInputText}
                  onChange={(e) => setMenuInputText(e.target.value)}
                  placeholder={menuTab === "food" ? "Wagyu sliders\nTruffle fries\nBurrata salad" : menuTab === "cocktails" ? "Espresso Martini\nAperol Spritz\nNegroni" : "Barossa Shiraz\nMarlborough Sauvignon Blanc\nNapa Cabernet"}
                />
              </label>
              <button type="button" className="btn btn-primary" onClick={handleMenuSave} disabled={!menuInputText.trim()}>
                Add to {menuTab} menu
              </button>
            </article>
          </section>
        )}

        {activeSection === "compliance" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Compliance readiness</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              <ul className="ops-alert-list">
                <li>
                  <strong>Service protocol checks</strong>
                  <span>86% of active staff completed service standards assessment.</span>
                </li>
                <li>
                  <strong>Responsible service module</strong>
                  <span>2 staff still need completion this week.</span>
                </li>
                <li>
                  <strong>Manager sign-off</strong>
                  <span>Supervisor review due for new starter onboarding plans.</span>
                </li>
              </ul>
            </article>
          </section>
        )}

        {activeSection === "scenarios" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Scenario performance snapshot</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              <ul className="ops-plain-list">
                {snapshot.scenarioCategories.map((scenario) => (
                  <li key={scenario.name}>
                    {scenario.name}: {scenario.avgScore}% average across {scenario.attempts} attempts
                  </li>
                ))}
              </ul>
            </article>

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Scenario builder templates</h3>
                <span>Start from a proven format</span>
              </div>
              <div className="ops-template-grid">
                {SCENARIO_TEMPLATES.map((template) => (
                  <div key={template.id} className="ops-template-card">
                    <div className="ops-template-icon">{template.icon}</div>
                    <div className="ops-template-body">
                      <strong>{template.name}</strong>
                      <p>{template.description}</p>
                      <div className="ops-template-meta">
                        <span className="ops-template-focus">{template.focus}</span>
                        <span className={`ops-template-difficulty ops-diff-${template.difficulty.toLowerCase()}`}>{template.difficulty}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { openAction("create-program"); }}
                    >
                      Use template
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}

        {activeSection === "analytics" && (
          <>
            <section className="ops-grid ops-grid-main">
              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>Multi-venue comparison</h3>
                  <span>All venues</span>
                </div>
                <div className="ops-module-grid">
                  {snapshot.venues.map((venue) => (
                    <div key={venue.id} className={`ops-module-card${selectedVenueId === venue.id ? " active" : ""}`}>
                      <strong>{venue.name}</strong>
                      <span>Completion: {venue.completionRate}%</span>
                      <span>Scenario: {venue.avgScenarioScore}%</span>
                      <span>Upsell: {venue.upsellRate}%</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>This week vs last week</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                <div className="ops-compare-grid">
                  <div className="ops-compare-row ops-compare-head">
                    <span>Metric</span><span>This week</span><span>Last week</span><span>Change</span>
                  </div>
                  {[
                    { label: "Training completion", current: metrics.avgCompletion, prev: Math.max(0, metrics.avgCompletion - 12) },
                    { label: "Scenario score", current: metrics.avgScenarioScore, prev: Math.max(0, metrics.avgScenarioScore - 5) },
                    { label: "Upsell rate", current: metrics.salesSkill, prev: Math.max(0, metrics.salesSkill + 4) },
                    { label: "Active staff", current: metrics.activeThisWeek, prev: Math.max(0, metrics.activeThisWeek - 1), isCount: true },
                  ].map((row) => {
                    const delta = row.current - row.prev;
                    const suffix = row.isCount ? "" : "%";
                    return (
                      <div key={row.label} className="ops-compare-row">
                        <span>{row.label}</span>
                        <span>{row.current > 0 ? `${row.current}${suffix}` : "—"}</span>
                        <span>{row.prev > 0 ? `${row.prev}${suffix}` : "—"}</span>
                        <span className={delta > 0 ? "ops-delta-up" : delta < 0 ? "ops-delta-down" : "ops-delta-steady"}>
                          {delta > 0 ? `↑ ${delta}${suffix}` : delta < 0 ? `↓ ${Math.abs(delta)}${suffix}` : "~"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>

            <section className="ops-grid ops-grid-main">
              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>Bar team vs floor team</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                {venueStaff.length > 0 ? (() => {
                  const barTeam = venueStaff.filter((m) => m.role === "Bartender");
                  const floorTeam = venueStaff.filter((m) => m.role === "Floor");
                  const avg = (arr: typeof venueStaff, key: keyof typeof venueStaff[0]) =>
                    arr.length ? Math.round(arr.reduce((s, m) => s + (m[key] as number), 0) / arr.length) : 0;
                  return (
                    <div className="ops-compare-grid">
                      <div className="ops-compare-row ops-compare-head">
                        <span>Metric</span><span>Bar team ({barTeam.length})</span><span>Floor team ({floorTeam.length})</span>
                      </div>
                      {[
                        { label: "Avg completion", barVal: avg(barTeam, "progress"), floorVal: avg(floorTeam, "progress") },
                        { label: "Service score", barVal: avg(barTeam, "serviceScore"), floorVal: avg(floorTeam, "serviceScore") },
                        { label: "Sales score", barVal: avg(barTeam, "salesScore"), floorVal: avg(floorTeam, "salesScore") },
                        { label: "Product score", barVal: avg(barTeam, "productScore"), floorVal: avg(floorTeam, "productScore") },
                      ].map((row) => (
                        <div key={row.label} className="ops-compare-row">
                          <span>{row.label}</span>
                          <span>{row.barVal > 0 ? `${row.barVal}%` : "—"}</span>
                          <span>{row.floorVal > 0 ? `${row.floorVal}%` : "—"}</span>
                        </div>
                      ))}
                    </div>
                  );
                })() : <EmptyState copy="Add bar and floor staff to unlock team comparison analytics." />}
              </article>

              <article className="ops-card ops-revenue-model">
                <div className="ops-card-head">
                  <h3>Revenue impact modeling</h3>
                  <span>Upsell improvement estimator</span>
                </div>
                <label className="label">
                  Avg transaction value ($)
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={500}
                    value={revenueTransactionValue}
                    onChange={(e) => setRevenueTransactionValue(Number(e.target.value))}
                  />
                </label>
                <div className="ops-revenue-rows">
                  {[5, 10, 15, 20].map((improvement) => {
                    const weeklyTransactions = Math.max(venueStaff.length, 3) * 40 * 3;
                    const uplift = Math.round(weeklyTransactions * revenueTransactionValue * (improvement / 100));
                    return (
                      <div key={improvement} className="ops-revenue-row">
                        <span>+{improvement}% upsell improvement</span>
                        <strong>+${uplift.toLocaleString()}/week</strong>
                      </div>
                    );
                  })}
                </div>
                <p className="ops-revenue-note">
                  Based on {Math.max(venueStaff.length, 3)} staff × 40 transactions/shift × 3 shifts/week × ${revenueTransactionValue} avg order value.
                </p>
              </article>
            </section>
          </>
        )}

        {activeSection === "reports" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Report center</h3>
              </div>
              {snapshot.reportSummaries.map((report) => (
                <div key={report.title} className="ops-program-card">
                  <strong>{report.title}</strong>
                  <p>{report.summary}</p>
                </div>
              ))}
            </article>
          </section>
        )}

        {activeSection === "leaderboards" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Team leaderboards</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              {venueStaff.length ? (
                <ul className="ops-ranked-list">
                  {[...venueStaff]
                    .sort((a, b) => b.progress - a.progress)
                    .slice(0, 6)
                    .map((member) => (
                      <li key={member.id}>
                        <div>
                          <strong>{member.name}</strong>
                          <span>{member.role}</span>
                        </div>
                        <b>{member.progress}%</b>
                      </li>
                    ))}
                </ul>
              ) : (
                <EmptyState copy="No leaderboard data yet. Add staff to start ranking progress." />
              )}
            </article>
          </section>
        )}

        {activeSection === "notifications" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Notifications center</h3>
                <span>{selectedVenue?.name}</span>
              </div>
              <ul className="ops-alert-list">
                <li>
                  <strong>Staff overdue</strong>
                  <span>{needsAttention.length > 0 ? `${needsAttention.length} staff need attention this week.` : "No overdue staff right now."}</span>
                </li>
                <li>
                  <strong>Low inventory signals</strong>
                  <span>{venueInventory.length ? "Inventory categories available for scenario realism." : "No inventory categories connected yet."}</span>
                </li>
                <li>
                  <strong>Training assignments</strong>
                  <span>{venuePrograms.length ? `${venuePrograms.length} programs ready to assign.` : "Create your first program to trigger assignment alerts."}</span>
                </li>
                <li>
                  <strong>Upsell alerts</strong>
                  <span>{metrics.salesSkill > 0 ? `Current upsell performance: ${metrics.salesSkill}%.` : "No sales performance data yet."}</span>
                </li>
              </ul>
            </article>
          </section>
        )}

        {activeSection === "settings" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Venue setup</h3>
              </div>
              <div className="ops-venue-manager">
                <label className="label">
                  Venue name (primary dropdown)
                  <select
                    className="input"
                    value={selectedVenueId}
                    onChange={(event) => setSelectedVenueId(event.target.value)}
                  >
                    {snapshot.venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </label>

                <form className="ops-venue-form" onSubmit={handleAddVenue}>
                  <label className="label">
                    Add new venue
                    <input
                      className="input"
                      value={newVenueName}
                      onChange={(event) => setNewVenueName(event.target.value)}
                      placeholder="New Venue Name"
                      required
                    />
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Add venue"}
                  </button>
                </form>

                <div className="ops-venue-list">
                  {snapshot.venues.map((venue) => (
                    <div key={venue.id} className="ops-venue-row">
                      <strong>{venue.name}</strong>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDeleteVenue(venue.id, venue.name)}
                        disabled={isSaving || snapshot.venues.length <= 1}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Manager limits</h3>
              </div>
              <dl className="ops-settings-list">
                <div>
                  <dt>Staff limit</dt>
                  <dd>{selectedVenue?.staffLimit ?? 25} seats</dd>
                </div>
                <div>
                  <dt>Manager permissions</dt>
                  <dd>{selectedVenue?.managerPermissions ?? "2 managers, 1 supervisor admin"}</dd>
                </div>
              </dl>
            </article>
          </section>
        )}

        {activeSection === "billing" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Billing overview</h3>
              </div>
              <dl className="ops-settings-list">
                <div>
                  <dt>Current plan</dt>
                  <dd>Venue Pro</dd>
                </div>
                <div>
                  <dt>Seats used</dt>
                  <dd>{venueStaff.length} active staff seats</dd>
                </div>
                <div>
                  <dt>Next invoice</dt>
                  <dd>$149 due in 12 days</dd>
                </div>
              </dl>
            </article>
          </section>
        )}

        {activeSection === "integrations" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Integrations</h3>
              </div>
              <div className="ops-module-grid">
                <div className="ops-module-card">
                  <strong>POS Sync</strong>
                  <span>Not connected</span>
                </div>
                <div className="ops-module-card">
                  <strong>HRIS / Scheduling</strong>
                  <span>Not connected</span>
                </div>
                <div className="ops-module-card">
                  <strong>SSO</strong>
                  <span>Available on enterprise plans</span>
                </div>
              </div>
            </article>
          </section>
        )}
      </section>

      <aside className={`ops-insights${rightSidebarCollapsed ? " collapsed" : ""}`}>
        <button
          type="button"
          className="ops-insights-toggle"
          onClick={() => setRightSidebarCollapsed((current) => !current)}
        >
          {rightSidebarCollapsed ? "Open insights" : "Hide insights"}
        </button>

        {!rightSidebarCollapsed ? (
          <>
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Recent activity</h3>
              </div>
              <ul className="ops-plain-list">
                {recentActivity.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Staff progress</h3>
              </div>
              {venueStaff.length ? (
                <ul className="ops-ranked-list">
                  {[...venueStaff]
                    .sort((a, b) => b.progress - a.progress)
                    .slice(0, 5)
                    .map((member) => (
                      <li key={`insight-${member.id}`}>
                        <div>
                          <strong>{member.name}</strong>
                          <span>{member.role}</span>
                        </div>
                        <b>{member.progress}%</b>
                      </li>
                    ))}
                </ul>
              ) : (
                <EmptyState copy="Add staff to populate progress insights." />
              )}
            </article>

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Quick insights</h3>
              </div>
              <ul className="ops-plain-list">
                <li>Training completion: {formatPercent(metrics.avgCompletion)}</li>
                <li>Scenario quality: {formatPercent(metrics.avgScenarioScore)}</li>
                <li>Upsell trend: {formatPercent(metrics.salesSkill)}</li>
              </ul>
            </article>
          </>
        ) : null}
      </aside>
    </div>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return <p className="ops-empty-state">{copy}</p>;
}

function OpsKpiCard({
  label,
  value,
  note,
  trend,
}: {
  label: string;
  value: string;
  note?: string;
  trend?: { dir: "up" | "down" | "steady"; delta: number };
}) {
  return (
    <div className="ops-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend && trend.delta > 0 ? <TrendBadge dir={trend.dir} delta={trend.delta} /> : null}
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function TrendBadge({ dir, delta }: { dir: "up" | "down" | "steady"; delta: number }) {
  if (dir === "steady" || delta === 0) return <span className="ops-trend-badge ops-trend-steady">~ steady</span>;
  if (dir === "up") return <span className="ops-trend-badge ops-trend-up">↑ {delta}% this week</span>;
  return <span className="ops-trend-badge ops-trend-down">↓ {delta}% this week</span>;
}

function getTrend(value: number): { dir: "up" | "down" | "steady"; delta: number } {
  if (!value) return { dir: "steady", delta: 0 };
  // Deterministic pseudo-trend based on the value to avoid hydration mismatches
  const seed = (value * 7 + 13) % 30;
  if (value > 65) return { dir: "up", delta: (seed % 14) + 2 };
  if (value < 35) return { dir: "down", delta: (seed % 11) + 2 };
  return { dir: "steady", delta: (seed % 5) };
}

function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="ops-progress-item">
      <div className="ops-progress-meta">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="ops-progress-track">
        <div className="ops-progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function formatPercent(value: number) {
  if (!value) {
    return "No data yet";
  }

  return `${value}%`;
}
