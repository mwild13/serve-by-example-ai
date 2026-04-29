"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import SignOutButton from "@/components/ui/SignOutButton";
import SessionRefresher from "@/components/ui/SessionRefresher";
import {
  LayoutDashboard,
  BookOpen,
  Play,
  User,
  Users,
  ShieldCheck,
  Package,
  UtensilsCrossed,
  ClipboardList,
  BarChart2,
  FileText,
  Trophy,
  Bell,
  MessageCircle,
  Sparkles,
  Settings2,
  CreditCard,
  Plug,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  ManagementSnapshot,
  ManagerSection,
  NewInventoryPayload,
  NewStaffPayload,
  NewTrainingProgramPayload,
  StaffRole,
} from "@/lib/management/types";
import type { QuickActionId, NavItem, NavGroup, SearchResult } from "./manager-types";
import {
  EmptyState,
  OpsKpiCard,
  formatPercent,
  StaffBadges,
} from "./manager-ui";

type SnapshotResponse = ManagementSnapshot & {
  inviteMessage?: string;
  inviteLink?: string;
  emailSent?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Training",
    collapsible: true,
    items: [
      { id: "training", label: "Programs", icon: BookOpen },
      { id: "scenarios", label: "Scenarios", icon: Play },
    ],
  },
  {
    label: "People",
    collapsible: true,
    items: [
      { id: "staff", label: "Staff", icon: User },
      { id: "teams", label: "Teams", icon: Users },
      { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
    ],
  },
  {
    label: "Operations",
    collapsible: true,
    items: [
      { id: "inventory", label: "Inventory", icon: Package },
      { id: "menu", label: "Menu Items", icon: UtensilsCrossed },
      { id: "compliance", label: "Compliance", icon: ClipboardList },
    ],
  },
  {
    label: "Performance",
    collapsible: true,
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart2 },
      { id: "reports", label: "Reports", icon: FileText },
      { id: "leaderboards", label: "Leaderboards", icon: Trophy },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "AI Coach",
    items: [
      { id: "aicoach", label: "Ask AI Coach", icon: MessageCircle },
      { id: "predictive", label: "Predictive Insights", icon: Sparkles },
    ],
  },
  {
    label: "Admin",
    collapsible: true,
    items: [
      { id: "settings", label: "Settings", icon: Settings2 },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "integrations", label: "Integrations", icon: Plug },
      { id: "sign-out", label: "Sign out", icon: LogOut },
    ],
  },
];

const SCENARIO_TEMPLATES = [
  {
    id: "upsell-challenge",
    name: "Upsell challenge",
    description: "Customer orders a standard drink. Practice guiding them toward a premium option and pairing.",
    icon: "→",
    focus: "Sales & upselling",
    difficulty: "Intermediate",
  },
  {
    id: "difficult-customer",
    name: "Difficult customer",
    description: "Customer is frustrated with wait times and makes a complaint at the bar.",
    icon: "◆",
    focus: "De-escalation & service recovery",
    difficulty: "Advanced",
  },
  {
    id: "menu-knowledge",
    name: "Menu knowledge quiz",
    description: "Staff must answer questions about current seasonal menu items and ingredients.",
    icon: "≡",
    focus: "Product knowledge",
    difficulty: "Beginner",
  },
  {
    id: "cocktail-build",
    name: "Cocktail build test",
    description: "Step-by-step scenario where staff recall the correct build order and garnish.",
    icon: "◉",
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
  aicoach: { cluster: "AI Coach", label: "Ask AI Coach" },
  predictive: { cluster: "AI Coach", label: "Predictive Insights" },
  settings: { cluster: "Admin", label: "Settings" },
  billing: { cluster: "Admin", label: "Billing" },
  integrations: { cluster: "Admin", label: "Integrations" },
  "sign-out": { cluster: "Admin", label: "Sign out" },
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

// ─────────────────────────────────────────────
// Option A Overview — shared helper components
// ─────────────────────────────────────────────

function mgrMockSpark(finalValue: number, len = 10): number[] {
  if (!finalValue) return Array(len).fill(0) as number[];
  const clamp = Math.max(2, Math.min(98, finalValue));
  return Array.from({ length: len }, (_, i) => {
    const prog = i / (len - 1);
    const base = clamp * (0.6 + prog * 0.4);
    const noise = ((i * 7 + Math.round(clamp) * 3) % 9) - 4;
    return Math.max(0, Math.min(100, Math.round(base + noise)));
  });
}

function MgrSparkline({ data, w = 88, h = 28, color = "#1E5A3C" }: {
  data: number[]; w?: number; h?: number; color?: string;
}) {
  if (!data.length || data.every(v => v === 0)) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 4) - 2] as [number, number]);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <path d={area} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

function MgrHealthCard({ score, service, product, sales }: {
  score: number; service: number; product: number; sales: number;
}) {
  return (
    <div className="mcc-health-card">
      <div className="mcc-health-lbl">Venue Health Score</div>
      <div className="mcc-health-score">{score > 0 ? score : "—"}<em>/100</em></div>
      <div className="mcc-health-breakdown">
        Service <b>{service > 0 ? service : "—"}</b> · Product <b>{product > 0 ? product : "—"}</b> · Sales <b>{sales > 0 ? sales : "—"}</b>
      </div>
    </div>
  );
}

function MgrKpiCard({ label, value, sub, data, accent }: {
  label: string; value: string; sub: string; data: number[]; accent: string;
}) {
  return (
    <div className="mcc-kpi-card">
      <div className="mcc-kpi-label">{label}</div>
      <div className="mcc-kpi-value-row">
        <div className="mcc-kpi-value">{value}</div>
        <MgrSparkline data={data} color={accent} />
      </div>
      <div className="mcc-kpi-meta">
        <span className="mcc-kpi-sub">{sub}</span>
      </div>
    </div>
  );
}

function MgrRevenueChart({ trainingValue }: { trainingValue: number }) {
  const days = ["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F", "S", "S"];
  const trn = days.map((_, i) => {
    const prog = i / (days.length - 1);
    return Math.max(0, Math.min(95, Math.round(trainingValue * (0.3 + prog * 0.7))));
  });
  const revBase = [42, 48, 51, 49, 62, 78, 71, 45, 50, 53, 56, 65, 82, 76];
  const scale = trainingValue > 0 ? (trainingValue / 50 + 0.5) : 1;
  const rev = revBase.map(v => Math.min(95, Math.round(v * scale)));
  const w = 720, h = 220, pad = 36;
  const max = 100;
  const stepX = (w - pad * 2) / (rev.length - 1);
  const yScale = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const makePath = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${pad + i * stepX},${yScale(v)}`).join(" ");
  const area = `${makePath(rev)} L${pad + (rev.length - 1) * stepX},${h - pad} L${pad},${h - pad} Z`;
  if (trainingValue === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--mcc-ink-500)", fontSize: 13 }}>
        Complete training sessions to populate chart data.
      </div>
    );
  }
  return (
    <div style={{ padding: "16px 20px" }}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
          <line key={idx} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke="#EDE7D2" strokeDasharray="2 4" />
        ))}
        {days.map((d, i) => (
          <text key={i} x={pad + i * stepX} y={h - 10} fontSize="9" fill="#8A938D" textAnchor="middle">{d}</text>
        ))}
        <path d={area} fill="#1E5A3C" opacity="0.10" />
        <path d={makePath(rev)} fill="none" stroke="#14492F" strokeWidth="2" strokeLinecap="round" />
        {rev.map((v, i) => <circle key={i} cx={pad + i * stepX} cy={yScale(v)} r="2.5" fill="#14492F" />)}
        <path d={makePath(trn)} fill="none" stroke="#B98220" strokeWidth="1.6" strokeDasharray="4 3" />
        {trn.map((v, i) => <circle key={i} cx={pad + i * stepX} cy={yScale(v)} r="1.8" fill="#B98220" />)}
      </svg>
    </div>
  );
}

export default function ManagerControlCenter({
  initialSnapshot,
  plan,
  displayName,
}: {
  initialSnapshot: ManagementSnapshot;
  plan?: string;
  displayName?: string;
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
  const [pendingInviteLink, setPendingInviteLink] = useState<{ link: string; email: string; name: string; emailSent: boolean } | null>(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [testEmailResult, setTestEmailResult] = useState<{ message: string; smtpConfigured?: boolean; testLink?: string } | null>(null);
  const [openRosterSections, setOpenRosterSections] = useState<Set<string>>(new Set(["Bar Team"]));

  // ── Staff membership invite state ──
  type MembershipRow = { id: string; staff_email: string; venue_id: string | null; status: string; created_at: string };
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [membershipSeats, setMembershipSeats] = useState<{ used: number; max: number }>({ used: 0, max: 0 });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [membershipsLoaded, setMembershipsLoaded] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [menuTab, setMenuTab] = useState<"food" | "cocktails" | "wine">("food");
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Fetch the Supabase session token on mount. On Cloudflare Pages, cookies
  // are not forwarded to API routes, so we pass the JWT in the Authorization header.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Helper: fetch that always includes the Authorization header when available
  const apiFetch = useCallback((url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
    }
    return fetch(url, { ...options, headers });
  }, [sessionToken]);

  const [menuInputText, setMenuInputText] = useState("");
  const [menuItems, setMenuItems] = useState<Record<string, string[]>>({ food: [], cocktails: [], wine: [] });
  const [revenueTransactionValue, setRevenueTransactionValue] = useState(45);
  const [aiCoachInput, setAiCoachInput] = useState("");
  const [aiCoachMessages, setAiCoachMessages] = useState<Array<{ role: "user" | "coach"; content: string }>>([]);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<"progress" | "score" | "active">("progress");
  const [notifFilter, setNotifFilter] = useState<"all" | "training" | "performance" | "inventory">("all");
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
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

  const handleExportStaff = useCallback(() => {
    const rows = [
      ["Name", "Email", "Role", "Completion %", "Service %", "Sales %", "Last Active", "Status"],
      ...venueStaff.map((m) => [
        m.name,
        m.email ?? `${m.name.split(" ")[0].toLowerCase()}@sbe.io`,
        m.role,
        String(m.progress),
        String(m.serviceScore),
        String(m.salesScore),
        m.lastActive,
        m.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-export-${selectedVenue?.name ?? "venue"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [venueStaff, selectedVenue]);

  const toggleRosterSection = useCallback((label: string) => {
    setOpenRosterSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

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

  // ── Manager Insights — auto-generated action tips ──
  const managerInsights = useMemo(() => {
    const tips: { id: string; icon: string; text: string; priority: "high" | "medium" | "low" }[] = [];

    // Staff struggling with low scores
    const lowScoreStaff = venueStaff.filter((s) => {
      const avg = (s.serviceScore + s.salesScore + s.productScore) / 3;
      return avg > 0 && avg < 50;
    });
    if (lowScoreStaff.length > 0) {
      tips.push({
        id: "low-score",
        icon: "!",
        text: `${lowScoreStaff.length} staff member${lowScoreStaff.length > 1 ? "s" : ""} scoring below 50% average (${lowScoreStaff.map((s) => s.name).join(", ")}). Consider assigning targeted training.`,
        priority: "high",
      });
    }

    // Weak product knowledge across team
    if (metrics.productSkill > 0 && metrics.productSkill < 60) {
      tips.push({
        id: "product-weak",
        icon: "≡",
        text: `Team product knowledge at ${metrics.productSkill}%. Schedule a tasting or assign Spirit/Wine 101 modules.`,
        priority: "medium",
      });
    }

    // Upselling below threshold
    if (metrics.salesSkill > 0 && metrics.salesSkill < 50) {
      tips.push({
        id: "upsell-low",
        icon: "→",
        text: `Upsell performance at ${metrics.salesSkill}%. Run a sales scenario drill with the team to build recommendation confidence.`,
        priority: "medium",
      });
    }

    // Inactive staff
    if (inactiveCount > 0) {
      tips.push({
        id: "inactive",
        icon: "◉",
        text: `${inactiveCount} staff inactive for 7+ days. A quick check-in or refresher assignment can re-engage them.`,
        priority: "medium",
      });
    }

    // Positive reinforcement
    const onTrackCount = venueStaff.filter((s) => s.status === "on-track").length;
    if (onTrackCount > 0 && venueStaff.length > 0 && onTrackCount === venueStaff.length) {
      tips.push({
        id: "all-good",
        icon: "◆",
        text: "All staff are on track. Great momentum — keep the training rhythm going.",
        priority: "low",
      });
    }

    // No staff yet
    if (venueStaff.length === 0) {
      tips.push({
        id: "no-staff",
        icon: "◉",
        text: "Add staff members to start seeing performance insights and training recommendations.",
        priority: "high",
      });
    }

    return tips.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
  }, [venueStaff, metrics, inactiveCount]);

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

  const todaySnapshot = {
    staffActive: metrics.activeThisWeek,
    scenariosCompleted: snapshot.scenarioCategories.reduce((sum, scenario) => sum + scenario.attempts, 0),
    salesImpact: metrics.salesSkill,
  };

  const todayDateStr = new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
  const attentionCount = needsAttention.length + managerInsights.filter((i) => i.priority === "high").length;

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

  // ── Staff membership invite helpers ────────────────────────
  async function loadMemberships() {
    try {
      const res = await apiFetch("/api/management/memberships");
      if (!res.ok) return;
      const data = await res.json();
      setMemberships(data.memberships ?? []);
      setMembershipSeats({ used: data.seatUsage?.used ?? 0, max: data.seatUsage?.max ?? 0 });
      setMembershipsLoaded(true);
    } catch { /* silent */ }
  }

  async function handleInviteStaff(e: FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const res = await apiFetch("/api/management/memberships", {
        method: "POST",
        body: JSON.stringify({ staffEmail: inviteEmail.trim(), venueId: selectedVenueId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error ?? "Failed to invite"); return; }
      setInviteEmail("");
      await loadMemberships();
    } catch { setInviteError("Network error"); } finally { setInviteLoading(false); }
  }

  async function handleRemoveMembership(id: string) {
    try {
      const res = await apiFetch(`/api/management/memberships?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) await loadMemberships();
    } catch { /* silent */ }
  }

  // Load memberships when staff section opens
  useEffect(() => {
    if (activeSection === "staff" && !membershipsLoaded && sessionToken) {
      loadMemberships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, sessionToken]);

  function handleMenuSave() {
    const lines = menuInputText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setMenuItems((prev) => ({
      ...prev,
      [menuTab]: [...new Set([...prev[menuTab], ...lines])],
    }));
    setMenuInputText("");
  }

  async function handleAiCoachSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = aiCoachInput.trim();
    if (!question || aiCoachLoading) return;

    setAiCoachMessages((prev) => [...prev, { role: "user", content: question }]);
    setAiCoachInput("");
    setAiCoachLoading(true);

    try {
      const response = await apiFetch("/api/management/coach", {
        method: "POST",
        body: JSON.stringify({ question, venueId: selectedVenueId }),
      });
      const data = await response.json();
      if (data.error) {
        setAiCoachMessages((prev) => [...prev, { role: "coach", content: `Error: ${data.error}` }]);
      } else {
        setAiCoachMessages((prev) => [...prev, { role: "coach", content: data.answer }]);
      }
    } catch {
      setAiCoachMessages((prev) => [...prev, { role: "coach", content: "Unable to reach AI coach. Check your connection." }]);
    } finally {
      setAiCoachLoading(false);
    }
  }

  async function applySnapshotResult(response: Response) {
    const result = (await response.json()) as SnapshotResponse | { error: string };
    if (!response.ok || "error" in result) {
      throw new Error("error" in result ? result.error : "Unable to save changes.");
    }

    setSnapshot(result);
    if (result.inviteMessage) {
      setRequestSuccess(result.inviteMessage);
    }
    if (result.inviteLink) {
      setPendingInviteLink({
        link: result.inviteLink,
        email: staffForm.email ?? "",
        name: staffForm.name ?? "",
        emailSent: result.emailSent ?? false,
      });
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
      const response = await apiFetch(requestConfig.endpoint, {
        method: "POST",
        body: JSON.stringify(requestConfig.body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setRequestError(errorData.error || `Request failed (${response.status})`);
        return;
      }
      const result = await applySnapshotResult(response);
      if (!result.inviteMessage) {
        setRequestSuccess(requestConfig.success);
      }
      setActiveAction(null);
      setStaffForm({ name: "", role: "New Staff", email: "", sendInvite: false });
      // Note: pendingInviteLink intentionally left set so manager can copy it.
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
      const response = await apiFetch("/api/management/venues", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setRequestError(errorData.error || `Unable to add venue. (${response.status})`);
        return;
      }

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

  async function handleDeleteStaff(staffId: string, staffName: string) {
    if (!window.confirm(`Remove ${staffName} from the roster?`)) return;
    setIsSaving(true);
    setRequestError("");
    setRequestSuccess("");
    try {
      const response = await apiFetch(
        `/api/management/staff?staffId=${encodeURIComponent(staffId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const errorData = await response.json();
        setRequestError(errorData.error || "Unable to delete staff member.");
        return;
      }
      await applySnapshotResult(response);
      setRequestSuccess(`${staffName} removed from roster.`);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to delete staff member.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteVenue(venueId: string, venueName: string) {
    setIsSaving(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const response = await apiFetch(`/api/management/venues?venueId=${encodeURIComponent(venueId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setRequestError(errorData.error || `Unable to delete venue. (${response.status})`);
        return;
      }

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
      <SessionRefresher />
      <aside className="ops-sidebar">
        <div className="ops-sidebar-top">
          <span className="ops-sidebar-brand">Management console</span>
          {displayName && <span className="ops-sidebar-user">{displayName}</span>}
          <h3>Venue operations</h3>
          <div className="ops-venue-switcher">
            {snapshot.venues.length === 0 ? (
              <div className="ops-venue-single">
                <strong>No venues</strong>
                <p style={{ color: "var(--text-soft)", fontSize: ".95rem", margin: "8px 0 0 0" }}>Create your first venue to get started.</p>
              </div>
            ) : snapshot.venues.length === 1 && plan !== "multi-venue" ? (
              <div className="ops-venue-single">
                <strong>{snapshot.venues[0]?.name || "Your Venue"}</strong>
                <p style={{ color: "var(--text-soft)", fontSize: ".95rem", margin: "8px 0 0 0" }}>Single venue plan</p>
              </div>
            ) : (
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
                    <section.icon size={15} strokeWidth={1.5} aria-hidden="true" />
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

            {/* Invite link panel — shown after add-staff when an invite link was generated */}
            {pendingInviteLink && (
              <div className={`ops-invite-link-panel${pendingInviteLink.emailSent ? " ops-invite-link-panel--sent" : " ops-invite-link-panel--manual"}`}>
                <div className="ops-invite-link-header">
                  {pendingInviteLink.emailSent ? (
                    <><strong>Invite email sent</strong> to {pendingInviteLink.email}</>
                  ) : (
                    <><strong>Email not delivered</strong> — SMTP not configured in Supabase.</>
                  )}
                </div>
                {!pendingInviteLink.emailSent && (
                  <p className="ops-invite-link-hint">
                    Share this one-time invite link directly with {pendingInviteLink.name}. It expires in 7 days. To enable automatic email delivery, configure SMTP in <strong>Supabase Dashboard → Authentication → Emails</strong>.
                  </p>
                )}
                <div className="ops-invite-link-row">
                  <input
                    className="input ops-invite-link-input"
                    readOnly
                    value={pendingInviteLink.link}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(pendingInviteLink.link).then(() => {
                        setInviteLinkCopied(true);
                        setTimeout(() => setInviteLinkCopied(false), 2500);
                      });
                    }}
                  >
                    {inviteLinkCopied ? "Copied!" : "Copy link"}
                  </button>
                </div>
                <button
                  type="button"
                  className="ops-invite-link-dismiss"
                  onClick={() => setPendingInviteLink(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

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
                  Send a signup invite email to this staff member
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
          <div className="mcc-overview-shell">
            {/* ── Main scrollable content ── */}
            <div className="mcc-overview-main">

              {/* ── Hero ── */}
              <section className="mcc-hero-section">
                <div className="mcc-hero-inner">
                  <div>
                    <div className="mcc-hero-label">Mission Control · {selectedVenue?.name ?? "Your Venue"} · {todayDateStr}</div>
                    <h1 className="mcc-hero-h1">Venue performance<br />mission control.</h1>
                    <p className="mcc-hero-sub">
                      Operational visibility for training, service quality, sales performance and venue consistency.
                      {attentionCount > 0 && (
                        <strong style={{ color: "var(--mcc-ink-900)" }}> {attentionCount} {attentionCount === 1 ? "thing needs" : "things need"} your attention today.</strong>
                      )}
                    </p>
                    <div className="mcc-hero-actions">
                      <button className="mcc-hero-btn mcc-hero-btn-primary" onClick={() => openAction("add-staff")}>+ Add staff</button>
                      <button className="mcc-hero-btn" onClick={() => openAction("assign-training")}>+ Assign training</button>
                      <button className="mcc-hero-btn" onClick={() => openAction("create-program")}>+ Create program</button>
                      <button className="mcc-hero-btn mcc-hero-btn-ghost" onClick={() => openAction("add-inventory")}>+ Add inventory</button>
                    </div>
                  </div>
                  <MgrHealthCard
                    score={metrics.venueHealthScore}
                    service={metrics.serviceSkill}
                    product={metrics.productSkill}
                    sales={metrics.salesSkill}
                  />
                </div>
              </section>

              {/* ── KPI strip ── */}
              <section className="mcc-kpi-strip">
                <MgrKpiCard
                  label="Sales impact"
                  value={formatPercent(metrics.salesSkill)}
                  sub="Revenue impact level"
                  data={mgrMockSpark(metrics.salesSkill)}
                  accent="var(--mcc-forest-600)"
                />
                <MgrKpiCard
                  label="Avg scenario score"
                  value={formatPercent(metrics.avgScenarioScore)}
                  sub="Service · sales · product"
                  data={mgrMockSpark(metrics.avgScenarioScore)}
                  accent="var(--mcc-sage)"
                />
                <MgrKpiCard
                  label="Training completion"
                  value={formatPercent(metrics.avgCompletion)}
                  sub="Across all modules"
                  data={mgrMockSpark(metrics.avgCompletion)}
                  accent="var(--mcc-amber)"
                />
                <MgrKpiCard
                  label="Upsell performance"
                  value={formatPercent(metrics.salesSkill)}
                  sub="Last 7 days"
                  data={mgrMockSpark(metrics.salesSkill)}
                  accent="var(--mcc-terra)"
                />
              </section>

              {/* ── Primary row: Revenue & training chart + Manager insights ── */}
              <section className="mcc-primary-row">
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Revenue &amp; training, 14 days</h2>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="mcc-pill">$ Revenue</span>
                      <span className="mcc-pill">Training</span>
                      <span className="mcc-card-meta">{selectedVenue?.name}</span>
                    </div>
                  </div>
                  <MgrRevenueChart trainingValue={metrics.avgCompletion} />
                </div>

                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Manager insights</h2>
                    <span className="mcc-card-meta">Auto-generated</span>
                  </div>
                  <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {managerInsights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className={`mcc-insight${insight.priority === "low" ? " good" : ""}`}>
                        <div className="mcc-insight-title">→ {insight.text}</div>
                        {insight.priority === "high" && (
                          <button type="button" className="mcc-insight-cta" onClick={() => handleSectionChange("staff")}>Review staff →</button>
                        )}
                        {insight.priority === "medium" && (
                          <button type="button" className="mcc-insight-cta" onClick={() => handleSectionChange("scenarios")}>Open scenarios →</button>
                        )}
                        {insight.priority === "low" && (
                          <button type="button" className="mcc-insight-cta" onClick={() => handleSectionChange("training")}>Continue →</button>
                        )}
                      </div>
                    ))}
                    {managerInsights.length === 0 && (
                      <p style={{ fontSize: 13, color: "var(--mcc-ink-500)" }}>Add staff to start generating insights.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Secondary row: Staff snapshot + Operational alerts ── */}
              <section className="mcc-secondary-row">
                {/* Staff snapshot */}
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Staff snapshot</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {needsAttention.length > 0 && (
                        <span className="mcc-pill mcc-pill-warn">{needsAttention.length} need attention</span>
                      )}
                      <button
                        type="button"
                        style={{ fontSize: 11, color: "var(--mcc-forest-700)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        onClick={() => handleSectionChange("staff")}
                      >
                        Open Staff →
                      </button>
                    </div>
                  </div>
                  {venueStaff.length > 0 ? (
                    <div>
                      {venueStaff.slice(0, 5).map((member) => {
                        const isGood = member.status === "on-track";
                        const avgScore = Math.round((member.serviceScore + member.salesScore + member.productScore) / 3);
                        return (
                          <div key={member.id} className="mcc-staff-row">
                            <div className="mcc-avatar" style={{ background: isGood ? "var(--mcc-sage)" : "var(--mcc-rule)" }}>
                              {member.name[0].toUpperCase()}
                            </div>
                            <div style={{ fontSize: 13, color: "var(--mcc-ink-900)", fontWeight: 500 }}>
                              {member.name}
                              <span style={{ color: "var(--mcc-ink-500)", fontWeight: 400, marginLeft: 8 }}>{member.role}</span>
                            </div>
                            <span className={`mcc-pill ${isGood ? "mcc-pill-good" : "mcc-pill-bad"}`}>
                              {member.status === "on-track" ? "On track" : member.status === "attention" ? "Needs attention" : "Not started"}
                            </span>
                            <div className="mcc-bar">
                              <div className="mcc-bar-fill" style={{ width: `${avgScore}%`, background: isGood ? "var(--mcc-sage)" : "var(--mcc-terra)" }} />
                            </div>
                            <span style={{ fontSize: 12, color: "var(--mcc-ink-500)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                              {member.lastActive}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: "24px 20px", fontSize: 13, color: "var(--mcc-ink-500)" }}>
                      No staff added yet.{" "}
                      <button type="button" style={{ color: "var(--mcc-forest-700)", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontFamily: "inherit" }} onClick={() => openAction("add-staff")}>
                        Add your first staff member →
                      </button>
                    </div>
                  )}
                </div>

                {/* Operational alerts */}
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Operational alerts</h2>
                    <span className="mcc-card-meta">{operationalAlerts.length} active</span>
                  </div>
                  <div style={{ padding: 4 }}>
                    {operationalAlerts.map((alert) => {
                      const isTraining = alert.title === "Training risk";
                      const isUpsell = alert.title === "Upsell performance";
                      const isInventory = alert.title === "Inventory intelligence";
                      const tone = isInventory ? "info" : (isTraining && needsAttention.length === 0) || (!isTraining && !isUpsell && inactiveCount === 0) ? "good" : "warn";
                      const iconChar = isTraining ? "◆" : isUpsell ? "→" : isInventory ? "≡" : "◉";
                      return (
                        <div key={alert.title} className="mcc-alert-item">
                          <div className={`mcc-alert-icon ${tone}`}>{iconChar}</div>
                          <div>
                            <div className="mcc-alert-title">{alert.title}</div>
                            <div className="mcc-alert-desc">{alert.detail}</div>
                          </div>
                          <button type="button" className="mcc-alert-cta" onClick={() => handleSectionChange(alert.section)}>
                            {alert.actionLabel} →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* ── Tertiary row: Training pillars + Compliance + Venue health ── */}
              <section className="mcc-tertiary-row">
                {/* Training pillars */}
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Training completion by pillar</h2>
                    <span className="mcc-card-meta">{selectedVenue?.name}</span>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    {[
                      { name: "Bartending",    val: Math.max(metrics.productSkill, metrics.avgCompletion), color: "var(--mcc-terra)" },
                      { name: "Sales",         val: metrics.salesSkill, color: "var(--mcc-amber)" },
                      { name: "Management",    val: venuePrograms.length ? Math.round(venuePrograms.reduce((s, p) => s + p.completion, 0) / venuePrograms.length) : 0, color: "var(--mcc-rose)" },
                      { name: "Menu Knowledge",val: venueInventory.length ? Math.min(venueInventory.reduce((s, i) => s + i.products.length, 0) * 5, 100) : 0, color: "var(--mcc-sage)" },
                      { name: "Service",       val: metrics.serviceSkill, color: "var(--mcc-forest-600)" },
                      { name: "Scenarios",     val: Math.min(todaySnapshot.scenariosCompleted * 3, 100), color: "var(--mcc-info)" },
                    ].map((p) => (
                      <div key={p.name} className="mcc-pillar-row">
                        <div className="mcc-pillar-name">{p.name}</div>
                        <div className="mcc-bar">
                          <div className="mcc-bar-fill" style={{ width: `${p.val}%`, background: p.color }} />
                        </div>
                        <div className="mcc-pillar-pct">{p.val}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance card */}
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Compliance</h2>
                    <span className={`mcc-pill ${needsAttention.length === 0 ? "mcc-pill-good" : "mcc-pill-warn"}`}>
                      {needsAttention.length === 0 ? "On track" : "Action needed"}
                    </span>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: "var(--mcc-ink-900)" }}>
                      {metrics.avgCompletion > 0 ? `${Math.min(100, Math.round(metrics.avgCompletion * 0.9 + 10))}%` : "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--mcc-ink-500)", marginBottom: 14 }}>Service standards assessment</div>
                    {([
                      ["RSA certified",     `${venueStaff.length} / ${venueStaff.length || "—"}`, metrics.avgCompletion > 50 ? "good" : "warn"],
                      ["Food safety",       `${venueStaff.length} / ${venueStaff.length || "—"}`, "good"],
                      ["Service protocols", `${venueStaff.filter(s => s.status === "on-track").length} / ${venueStaff.length || "—"}`, needsAttention.length > 0 ? "warn" : "good"],
                      ["Sign-off pending",  `${needsAttention.length} staff`, needsAttention.length > 0 ? "warn" : "good"],
                    ] as [string, string, string][]).map(([k, v, tone], i) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? "1px dashed var(--mcc-rule-2)" : "none", fontSize: 12 }}>
                        <span style={{ color: "var(--mcc-ink-700)" }}>{k}</span>
                        <span className={`mcc-pill mcc-pill-${tone}`} style={{ fontSize: 10 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Venue health breakdown */}
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Venue health</h2>
                    <span className="mcc-card-meta">Score</span>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                        {metrics.venueHealthScore > 0 ? metrics.venueHealthScore : "—"}
                      </div>
                      {metrics.venueHealthScore > 0 && <span style={{ fontSize: 16, color: "var(--mcc-ink-500)" }}>/100</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--mcc-ink-500)", marginBottom: 14 }}>Composite training &amp; performance index</div>
                    {([
                      ["Service", metrics.serviceSkill, "var(--mcc-sage)"],
                      ["Sales",   metrics.salesSkill,   "var(--mcc-amber)"],
                      ["Product", metrics.productSkill, "var(--mcc-terra)"],
                    ] as [string, number, string][]).map(([k, v, c]) => (
                      <div key={k} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--mcc-ink-700)", marginBottom: 4 }}>
                          <span>{k}</span>
                          <span style={{ fontVariantNumeric: "tabular-nums" }}>{v > 0 ? `${v}%` : "—"}</span>
                        </div>
                        <div className="mcc-bar">
                          <div className="mcc-bar-fill" style={{ width: `${v}%`, background: c }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </div>

          </div>
        )}

        {activeSection === "staff" && (
          <>
            {/* ── Staff Directory ── */}
            <section className="ops-grid ops-grid-main">
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Staff directory</h3>
                  <span>{venueStaff.length} {venueStaff.length === 1 ? "person" : "people"} · {selectedVenue?.name}</span>
                </div>
                {venueStaff.length ? (
                  <div className="ops-table-wrap">
                    <table className="ops-table ops-staff-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}></th>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Connection</th>
                          <th>Training progress</th>
                          <th>Last active</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {venueStaff.map((member) => {
                          const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                          const email = member.email ?? `${member.name.split(" ")[0].toLowerCase()}@sbe.io`;
                          return (
                            <tr
                              key={member.id}
                              className={selectedStaffId === member.id ? "active" : ""}
                              onClick={() => setSelectedStaffId(member.id)}
                            >
                              <td>
                                <div className="ops-staff-avatar">{initials}</div>
                              </td>
                              <td><strong>{member.name}</strong></td>
                              <td><span className="ops-staff-email">{email}</span></td>
                              <td>{member.role}</td>
                              <td>
                                <span className={`ops-badge ops-badge-${member.status === "on-track" ? "active" : member.status === "attention" ? "pending" : "removed"}`}>
                                  {member.status === "on-track" ? "On track" : member.status === "attention" ? "Needs attention" : "Inactive"}
                                </span>
                              </td>
                              <td>
                                {member.staffUserId ? (
                                  <span className="ops-badge ops-badge-active">Connected</span>
                                ) : member.email ? (
                                  <span className="ops-badge ops-badge-pending">Invited</span>
                                ) : (
                                  <span className="ops-badge ops-badge-removed">No account</span>
                                )}
                              </td>
                              <td>
                                <div className="ops-progress-inline">
                                  <div className="ops-progress-inline-bar">
                                    <div className="ops-progress-inline-fill" style={{ width: `${Math.max(0, Math.min(100, member.progress))}%` }} />
                                  </div>
                                  <span>{parseFloat(member.progress.toFixed(2))}%</span>
                                </div>
                              </td>
                              <td>{member.lastActive}</td>
                              <td>
                                <button
                                  type="button"
                                  className="ops-table-delete-btn"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteStaff(member.id, member.name); }}
                                  disabled={isSaving}
                                  aria-label={`Remove ${member.name}`}
                                >
                                  &times;
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState copy="No staff saved yet. Use Add staff to create the first roster entry for this venue." />
                )}
              </article>
            </section>

            {/* ── Staff profile detail panel ── */}
            {selectedStaff && (
              <section className="ops-grid ops-grid-main" style={{ marginTop: 12 }}>
                <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="ops-card-head">
                    <h3>{selectedStaff.name} — coaching profile</h3>
                    <span>{selectedStaff.role} · Last active {selectedStaff.lastActive}</span>
                  </div>
                  <div className="ops-profile-metrics">
                    <OpsKpiCard label="Completion" value={`${parseFloat(selectedStaff.progress.toFixed(2))}%`} />
                    <OpsKpiCard label="Service" value={`${parseFloat(selectedStaff.serviceScore.toFixed(2))}%`} />
                    <OpsKpiCard label="Sales" value={`${parseFloat(selectedStaff.salesScore.toFixed(2))}%`} />
                    <OpsKpiCard label="Product" value={`${parseFloat(selectedStaff.productScore.toFixed(2))}%`} />
                  </div>
                  <StaffBadges staff={selectedStaff} />
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
                </article>
              </section>
            )}

            {/* ── Roster Overview ── */}
            <section style={{ marginTop: 12 }}>
              <article className="ops-card">
                <div className="ops-card-head">
                  <h3>Roster overview</h3>
                  <span>by team</span>
                </div>
                {[
                  { label: "Bar Team", roles: ["Bartender"] },
                  { label: "Floor Team", roles: ["Floor"] },
                  { label: "Leadership Team", roles: ["Supervisor", "Manager"] },
                  { label: "New Staff", roles: ["New Staff"] },
                ].map((group) => {
                  const groupMembers = venueStaff.filter((m) => group.roles.includes(m.role));
                  if (!groupMembers.length) return null;
                  const isOpen = openRosterSections.has(group.label);
                  return (
                    <div key={group.label} className="ops-roster-accordion">
                      <button
                        type="button"
                        className="ops-roster-accordion-head"
                        onClick={() => toggleRosterSection(group.label)}
                      >
                        <span className="ops-roster-label">{group.label}</span>
                        <span className="ops-roster-count">{groupMembers.length} {groupMembers.length === 1 ? "member" : "members"}</span>
                        <span className="ops-roster-toggle">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div className="ops-roster-body">
                          <table className="ops-table ops-roster-table">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Progress</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupMembers.map((m) => {
                                const initials = m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                                return (
                                  <tr key={`roster-${m.id}`} onClick={() => setSelectedStaffId(m.id)} style={{ cursor: "pointer" }}>
                                    <td><div className="ops-staff-avatar ops-staff-avatar-sm">{initials}</div></td>
                                    <td><strong>{m.name}</strong></td>
                                    <td>{m.role}</td>
                                    <td>
                                      <div className="ops-progress-inline">
                                        <div className="ops-progress-inline-bar">
                                          <div className="ops-progress-inline-fill" style={{ width: `${Math.max(0, Math.min(100, m.progress))}%` }} />
                                        </div>
                                        <span>{parseFloat(m.progress.toFixed(2))}%</span>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`ops-badge ops-badge-${m.status === "on-track" ? "active" : m.status === "attention" ? "pending" : "removed"}`}>
                                        {m.status === "on-track" ? "On track" : m.status === "attention" ? "Attention" : "Inactive"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
                {!venueStaff.length && <EmptyState copy="No staff data for this venue yet." />}
              </article>
            </section>
          </>
        )}

        {/* ── Staff membership invites card ── */}
        {activeSection === "staff" && (
          <section className="ops-grid ops-grid-main" style={{ marginTop: 16 }}>
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Staff invites &amp; seat management</h3>
                <span>{membershipSeats.used} / {membershipSeats.max || "∞"} seats used</span>
              </div>

              <form className="ops-action-form" onSubmit={handleInviteStaff} style={{ marginBottom: 16 }}>
                <label className="label">
                  Staff email
                  <input
                    className="input"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@venue.com"
                    required
                  />
                </label>
                <button className="btn btn-primary" type="submit" disabled={inviteLoading}>
                  {inviteLoading ? "Inviting..." : "Invite staff member"}
                </button>
              </form>
              {inviteError && <p className="ops-notice ops-notice-error">{inviteError}</p>}

              {memberships.length > 0 ? (
                <div className="ops-table-wrap">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Invited</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberships.map((m) => (
                        <tr key={m.id}>
                          <td>{m.staff_email}</td>
                          <td><span className={`ops-badge ops-badge-${m.status}`}>{m.status}</span></td>
                          <td>{new Date(m.created_at).toLocaleDateString()}</td>
                          <td>
                            {m.status !== "removed" && (
                              <button
                                type="button"
                                className="ops-table-delete-btn"
                                onClick={() => handleRemoveMembership(m.id)}
                                aria-label={`Remove ${m.staff_email}`}
                              >
                                &times;
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState copy="No staff invites yet. Invite team members by email to give them sponsored access to training modules." />
              )}
            </article>
          </section>
        )}

        {activeSection === "teams" && (() => {
          const teamDefs = [
            { label: "Bar Team", roles: ["Bartender"] as StaffRole[] },
            { label: "Floor Team", roles: ["Floor", "New Staff"] as StaffRole[] },
            { label: "Leadership", roles: ["Supervisor", "Manager"] as StaffRole[] },
          ];
          const teams = teamDefs.map((def) => {
            const members = venueStaff.filter((s) => def.roles.includes(s.role));
            const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
            const avgProgress = avg(members.map((s) => s.progress));
            const avgService = avg(members.map((s) => s.serviceScore));
            const avgSales = avg(members.map((s) => s.salesScore));
            const avgProduct = avg(members.map((s) => s.productScore));
            const avgScore = avg(members.map((s) => Math.round((s.serviceScore + s.salesScore + s.productScore) / 3)));
            const attention = members.filter((s) => s.status !== "on-track");
            const top = members.length ? [...members].sort((a, b) => b.progress - a.progress)[0] : null;
            const weakest = (() => {
              const scores = { Service: avgService, Sales: avgSales, "Product knowledge": avgProduct };
              const [label] = Object.entries(scores).sort((a, b) => a[1] - b[1])[0] ?? [];
              return label ?? null;
            })();
            return { ...def, members, avgProgress, avgScore, avgService, avgSales, avgProduct, attention, top, weakest };
          });
          const allScores = teams.map((t) => t.avgScore);
          const maxScore = Math.max(...allScores, 1);
          return (
            <section className="ops-grid ops-grid-main">
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Team performance</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                {venueStaff.length === 0 ? (
                  <EmptyState copy="Add staff to see team performance breakdowns." />
                ) : (
                  <>
                    <div className="ops-module-grid" style={{ marginBottom: "1.5rem" }}>
                      {teams.map((team) => (
                        <div key={team.label} className="ops-module-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>{team.label}</strong>
                            <span style={{ fontSize: "0.78rem", color: "var(--mcc-ink-500)" }}>{team.members.length} member{team.members.length !== 1 ? "s" : ""}</span>
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "var(--mcc-ink-500)", display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Training completion</span>
                              <b style={{ color: "var(--mcc-ink-900)" }}>{team.avgProgress > 0 ? `${team.avgProgress}%` : "—"}</b>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Avg scenario score</span>
                              <b style={{ color: "var(--mcc-ink-900)" }}>{team.avgScore > 0 ? `${team.avgScore}%` : "—"}</b>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Needs attention</span>
                              <b style={{ color: team.attention.length > 0 ? "#b45309" : "#15803d" }}>{team.attention.length}</b>
                            </div>
                          </div>
                          {team.top && (
                            <div style={{ fontSize: "0.78rem", borderTop: "1px solid var(--mcc-border)", paddingTop: 6, marginTop: 2 }}>
                              <span style={{ color: "var(--mcc-ink-500)" }}>Top: </span>
                              <span style={{ fontWeight: 600, color: "var(--mcc-ink-900)" }}>{team.top.name}</span>
                              <span style={{ color: "var(--mcc-ink-500)" }}> · {team.top.progress}%</span>
                            </div>
                          )}
                          {team.weakest && team.members.length > 0 && (
                            <div style={{ fontSize: "0.78rem", color: "#b45309" }}>
                              Training gap: {team.weakest}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: "1px solid var(--mcc-border)", paddingTop: "1rem" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--mcc-ink-500)", marginBottom: 10 }}>Team comparison — avg scenario score</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {teams.map((team) => (
                          <div key={team.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 96, fontSize: "0.82rem", color: "var(--mcc-ink-700)", flexShrink: 0 }}>{team.label}</span>
                            <div style={{ flex: 1, height: 10, background: "var(--mcc-surface-2)", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${team.members.length ? (team.avgScore / maxScore) * 100 : 0}%`, background: "#1E5A3C", borderRadius: 999, transition: "width 0.4s ease" }} />
                            </div>
                            <span style={{ width: 36, fontSize: "0.82rem", fontWeight: 700, color: "var(--mcc-ink-900)", textAlign: "right" }}>
                              {team.members.length ? `${team.avgScore}%` : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {teams.some((t) => t.attention.length > 0) && (
                      <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--mcc-border)", paddingTop: "1rem" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#b45309", marginBottom: 8 }}>Needs attention</p>
                        <ul className="ops-plain-list ops-compact-list">
                          {teams.flatMap((t) => t.attention.map((s) => (
                            <li key={s.id}>
                              <span style={{ fontWeight: 600 }}>{s.name}</span>
                              <span style={{ color: "var(--mcc-ink-500)", marginLeft: 6 }}>{t.label} · {s.status === "inactive" ? "Inactive" : "Needs attention"} · {s.progress}% complete</span>
                            </li>
                          )))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </article>
            </section>
          );
        })()}

        {activeSection === "roles" && (() => {
          // Required modules per role (static config — editable in V2)
          const MODULE_REQS: Record<StaffRole, { label: string; required: boolean }[]> = {
            "Bartender":  [{ label: "Bartending", required: true }, { label: "Sales", required: true }, { label: "Management", required: false }],
            "Floor":      [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: false }],
            "Supervisor": [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: true }],
            "Manager":    [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: true }],
            "New Staff":  [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: false }],
          };
          const PERMISSIONS: { label: string; manager: boolean; supervisor: boolean; staff: boolean }[] = [
            { label: "Manager dashboard", manager: true, supervisor: false, staff: false },
            { label: "Staff management", manager: true, supervisor: true, staff: false },
            { label: "Training programs", manager: true, supervisor: true, staff: false },
            { label: "Inventory & menu", manager: true, supervisor: false, staff: false },
            { label: "Reports & analytics", manager: true, supervisor: true, staff: false },
            { label: "Complete training", manager: true, supervisor: true, staff: true },
            { label: "View own progress", manager: true, supervisor: true, staff: true },
          ];
          const roleGroups: StaffRole[] = ["Bartender", "Floor", "Supervisor", "Manager", "New Staff"];
          const roleStats = roleGroups.map((role) => {
            const members = venueStaff.filter((s) => s.role === role);
            const avgProgress = members.length ? Math.round(members.reduce((a, s) => a + s.progress, 0) / members.length) : null;
            const reqs = MODULE_REQS[role].filter((m) => m.required);
            const compliant = members.filter((s) => s.progress >= 80).length;
            return { role, members, avgProgress, reqs, compliant };
          });
          return (
            <section className="ops-grid ops-grid-main">
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Role training matrix</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--mcc-border)" }}>
                        <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Role</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Staff</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Bartending</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Sales</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Management</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Avg progress</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Compliant (&ge;80%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleStats.map((row) => {
                        const mods = MODULE_REQS[row.role];
                        const cell = (mod: { label: string; required: boolean }) => (
                          <td key={mod.label} style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--mcc-border)" }}>
                            <span style={{
                              display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600,
                              background: mod.required ? "#dcfce7" : "#f3f4f6",
                              color: mod.required ? "#15803d" : "#9ca3af",
                            }}>
                              {mod.required ? "Required" : "Optional"}
                            </span>
                          </td>
                        );
                        return (
                          <tr key={row.role} style={{ background: row.members.length ? "transparent" : "var(--mcc-surface-2)" }}>
                            <td style={{ padding: "10px 12px", fontWeight: 600, borderBottom: "1px solid var(--mcc-border)", color: "var(--mcc-ink-900)" }}>{row.role}</td>
                            <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--mcc-border)", color: "var(--mcc-ink-700)" }}>{row.members.length}</td>
                            {mods.map(cell)}
                            <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--mcc-border)", fontWeight: 700, color: "var(--mcc-ink-900)" }}>
                              {row.avgProgress !== null ? `${row.avgProgress}%` : "—"}
                            </td>
                            <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--mcc-border)" }}>
                              {row.members.length > 0
                                ? <span style={{ fontWeight: 600, color: row.compliant === row.members.length ? "#15803d" : "#b45309" }}>{row.compliant}/{row.members.length}</span>
                                : <span style={{ color: "var(--mcc-ink-400)" }}>—</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Permission matrix</h3>
                  <span>Dashboard access by role</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--mcc-border)" }}>
                        <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Capability</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Manager</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Supervisor</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSIONS.map((perm) => {
                        const dot = (has: boolean) => (
                          <td style={{ textAlign: "center", padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)" }}>
                            <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: has ? "#1E5A3C" : "#e5e7eb" }} />
                          </td>
                        );
                        return (
                          <tr key={perm.label}>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)", color: "var(--mcc-ink-700)" }}>{perm.label}</td>
                            {dot(perm.manager)}
                            {dot(perm.supervisor)}
                            {dot(perm.staff)}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          );
        })()}

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
              <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: 12 }}>Menu items added here are stored in your browser session only. Database persistence coming soon.</p>
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
                    {tab === "food" ? "Food" : tab === "cocktails" ? "Cocktails" : "Wine"}
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

        {activeSection === "compliance" && (() => {
          // Required modules per role (same mapping as Roles tab)
          const ROLE_REQUIRED: Record<StaffRole, string[]> = {
            "Bartender":  ["Bartending", "Sales"],
            "Floor":      ["Sales"],
            "Supervisor": ["Sales", "Management"],
            "Manager":    ["Sales", "Management"],
            "New Staff":  ["Sales"],
          };
          // Approximate which module a staff member has completed by score thresholds
          // Progress >= 60 → Sales; serviceScore >= 60 → Bartending; productScore >= 60 → Management
          const hasModule = (s: typeof venueStaff[0], mod: string) => {
            if (mod === "Sales") return s.salesScore >= 60 || s.progress >= 60;
            if (mod === "Bartending") return s.serviceScore >= 60;
            if (mod === "Management") return s.productScore >= 60;
            return false;
          };
          const complianceRows = venueStaff.map((s) => {
            const required = ROLE_REQUIRED[s.role] ?? [];
            const passed = required.filter((mod) => hasModule(s, mod));
            const isCompliant = passed.length === required.length && required.length > 0;
            return { ...s, required, passed, isCompliant };
          });
          const compliantCount = complianceRows.filter((r) => r.isCompliant).length;
          const totalWithRequired = complianceRows.filter((r) => r.required.length > 0).length;
          const allModules = ["Bartending", "Sales", "Management"];
          return (
            <section className="ops-grid ops-grid-main">
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Training compliance</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                {venueStaff.length === 0 ? (
                  <EmptyState copy="Add staff to track training compliance." />
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 160, padding: "14px 18px", background: compliantCount === totalWithRequired && totalWithRequired > 0 ? "#f0fdf4" : "#fff7ed", borderRadius: 10, border: `1.5px solid ${compliantCount === totalWithRequired && totalWithRequired > 0 ? "#86efac" : "#fed7aa"}` }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: compliantCount === totalWithRequired && totalWithRequired > 0 ? "#15803d" : "#b45309" }}>{compliantCount}/{totalWithRequired}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--mcc-ink-500)", marginTop: 2 }}>staff fully compliant with required training</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 160, padding: "14px 18px", background: "var(--mcc-surface-2)", borderRadius: 10, border: "1.5px solid var(--mcc-border)" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--mcc-ink-900)" }}>{venueStaff.filter((s) => s.status !== "on-track").length}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--mcc-ink-500)", marginTop: 2 }}>staff need attention or are inactive</div>
                      </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--mcc-border)" }}>
                            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Staff member</th>
                            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Role</th>
                            {allModules.map((mod) => (
                              <th key={mod} style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>{mod}</th>
                            ))}
                            <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {complianceRows.map((row) => (
                            <tr key={row.id}>
                              <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)", fontWeight: 600, color: "var(--mcc-ink-900)" }}>{row.name}</td>
                              <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)", color: "var(--mcc-ink-600)", fontSize: "0.8rem" }}>{row.role}</td>
                              {allModules.map((mod) => {
                                const isRequired = row.required.includes(mod);
                                const passed = hasModule(row, mod);
                                let bg = "#f3f4f6", color = "#9ca3af", label = "N/A";
                                if (isRequired && passed) { bg = "#dcfce7"; color = "#15803d"; label = "Done"; }
                                else if (isRequired && !passed) { bg = "#fff7ed"; color = "#b45309"; label = "Needed"; }
                                return (
                                  <td key={mod} style={{ textAlign: "center", padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)" }}>
                                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, background: bg, color }}>{label}</span>
                                  </td>
                                );
                              })}
                              <td style={{ textAlign: "center", padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)" }}>
                                {row.required.length === 0
                                  ? <span style={{ color: "var(--mcc-ink-400)", fontSize: "0.78rem" }}>No req.</span>
                                  : row.isCompliant
                                  ? <span style={{ fontWeight: 700, color: "#15803d", fontSize: "0.78rem" }}>Compliant</span>
                                  : <span style={{ fontWeight: 700, color: "#b45309", fontSize: "0.78rem" }}>Incomplete</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p style={{ marginTop: 12, fontSize: "0.78rem", color: "var(--mcc-ink-400)" }}>
                      Module completion is estimated from training scores. Required modules are set by role — editable in Roles &amp; Permissions.
                    </p>
                  </>
                )}
              </article>
            </section>
          );
        })()}

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

        {activeSection === "leaderboards" && (() => {
          const sorted = {
            progress: [...venueStaff].sort((a, b) => b.progress - a.progress),
            score: [...venueStaff].sort((a, b) => {
              const avgA = (a.serviceScore + a.salesScore + a.productScore) / 3;
              const avgB = (b.serviceScore + b.salesScore + b.productScore) / 3;
              return avgB - avgA;
            }),
            active: [...venueStaff].filter((s) => s.status === "on-track").sort((a, b) => b.progress - a.progress),
          };
          const ranked = sorted[leaderboardTab];
          const tabLabels: { key: "progress" | "score" | "active"; label: string }[] = [
            { key: "progress", label: "Training progress" },
            { key: "score", label: "Scenario score" },
            { key: "active", label: "On track" },
          ];
          const getValue = (s: typeof venueStaff[0]) => {
            if (leaderboardTab === "progress") return `${parseFloat(s.progress.toFixed(1))}%`;
            if (leaderboardTab === "score") return `${Math.round((s.serviceScore + s.salesScore + s.productScore) / 3)}%`;
            return `${parseFloat(s.progress.toFixed(1))}%`;
          };
          const podiumColors = ["#F59E0B", "#94A3B8", "#CD7F32"];
          const podiumLabels = ["1st", "2nd", "3rd"];
          return (
            <section className="ops-grid ops-grid-main">
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Leaderboards</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                {venueStaff.length === 0 ? (
                  <EmptyState copy="No leaderboard data yet. Add staff to start ranking progress." />
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
                      {tabLabels.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setLeaderboardTab(t.key)}
                          style={{
                            padding: "7px 16px", borderRadius: 999, border: "1.5px solid",
                            borderColor: leaderboardTab === t.key ? "#1E5A3C" : "var(--mcc-border)",
                            background: leaderboardTab === t.key ? "#1E5A3C" : "transparent",
                            color: leaderboardTab === t.key ? "white" : "var(--mcc-ink-600)",
                            fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {ranked.length >= 3 && (
                      <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "2rem", alignItems: "flex-end" }}>
                        {[1, 0, 2].map((pos) => {
                          const m = ranked[pos];
                          if (!m) return null;
                          const isFirst = pos === 0;
                          return (
                            <div key={m.id} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                              <div style={{ fontSize: isFirst ? "2rem" : "1.5rem", lineHeight: 1 }}>{isFirst ? "🥇" : pos === 1 ? "🥈" : "🥉"}</div>
                              <div style={{ fontWeight: 700, fontSize: isFirst ? "1rem" : "0.9rem", color: "var(--mcc-ink-900)" }}>{m.name}</div>
                              <div style={{ fontSize: "0.78rem", color: "var(--mcc-ink-500)" }}>{m.role}</div>
                              <div style={{
                                padding: "4px 12px", borderRadius: 999, fontWeight: 800, fontSize: "0.85rem",
                                background: podiumColors[pos] + "20", color: podiumColors[pos], border: `1.5px solid ${podiumColors[pos]}40`,
                              }}>{getValue(m)}</div>
                              <div style={{
                                width: isFirst ? 80 : 64, height: isFirst ? 10 : 7, borderRadius: 4,
                                background: podiumColors[pos], opacity: 0.7,
                              }} />
                              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: podiumColors[pos] }}>{podiumLabels[pos]}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <ul className="ops-ranked-list">
                      {ranked.slice(0, 8).map((member, idx) => (
                        <li key={member.id} style={{ paddingLeft: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 22, fontSize: "0.78rem", fontWeight: 700, color: idx < 3 ? podiumColors[idx] : "var(--mcc-ink-400)", textAlign: "center" }}>
                              {idx + 1}
                            </span>
                            <div>
                              <strong>{member.name}</strong>
                              <span>{member.role}</span>
                            </div>
                          </div>
                          <b>{getValue(member)}</b>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            </section>
          );
        })()}

        {activeSection === "notifications" && (() => {
          type NotifItem = { id: string; category: "training" | "performance" | "inventory"; urgency: "critical" | "warning" | "info"; title: string; body: string };
          const allNotifs: NotifItem[] = [
            ...(needsAttention.filter((s) => s.status === "inactive").map((s) => ({
              id: `inactive-${s.id}`,
              category: "training" as const,
              urgency: "critical" as const,
              title: "Staff inactive",
              body: `${s.name} (${s.role}) has not completed any training and is inactive.`,
            }))),
            ...(needsAttention.filter((s) => s.status === "attention").map((s) => ({
              id: `attention-${s.id}`,
              category: "training" as const,
              urgency: "warning" as const,
              title: "Training overdue",
              body: `${s.name} needs attention — currently at ${parseFloat(s.progress.toFixed(0))}% completion.`,
            }))),
            ...(venueStaff.filter((s) => s.salesScore > 0 && s.salesScore < 50).map((s) => ({
              id: `lowsales-${s.id}`,
              category: "performance" as const,
              urgency: "warning" as const,
              title: "Low upsell score",
              body: `${s.name} has a sales score of ${s.salesScore}% — consider targeted upsell training.`,
            }))),
            ...(metrics.salesSkill > 0 ? [{
              id: "upsell-avg",
              category: "performance" as const,
              urgency: metrics.salesSkill < 60 ? "warning" as const : "info" as const,
              title: "Venue upsell performance",
              body: `Average upsell performance is ${metrics.salesSkill}%.${metrics.salesSkill < 60 ? " Consider running a sales-focus training session." : " Tracking well."}`,
            }] : []),
            ...(venueInventory.length === 0 ? [{
              id: "no-inventory",
              category: "inventory" as const,
              urgency: "info" as const,
              title: "No inventory connected",
              body: "Add inventory categories to improve scenario realism for your team.",
            }] : [{
              id: "inventory-ok",
              category: "inventory" as const,
              urgency: "info" as const,
              title: "Inventory connected",
              body: `${venueInventory.length} inventory categor${venueInventory.length !== 1 ? "ies" : "y"} linked to training scenarios.`,
            }]),
            ...(venuePrograms.length === 0 ? [{
              id: "no-programs",
              category: "training" as const,
              urgency: "info" as const,
              title: "No training programs",
              body: "Create a training program to assign structured onboarding to your staff.",
            }] : []),
          ];
          const urgencyOrder = { critical: 0, warning: 1, info: 2 };
          const urgencyStyle: Record<string, { bg: string; border: string; dot: string; label: string }> = {
            critical: { bg: "#fff1f2", border: "#fca5a5", dot: "#dc2626", label: "Critical" },
            warning:  { bg: "#fff7ed", border: "#fed7aa", dot: "#f59e0b", label: "Warning" },
            info:     { bg: "var(--mcc-surface-2)", border: "var(--mcc-border)", dot: "#60a5fa", label: "Info" },
          };
          const filterTabs: { key: "all" | "training" | "performance" | "inventory"; label: string }[] = [
            { key: "all", label: "All" },
            { key: "training", label: "Training" },
            { key: "performance", label: "Performance" },
            { key: "inventory", label: "Inventory" },
          ];
          const visible = allNotifs
            .filter((n) => notifFilter === "all" || n.category === notifFilter)
            .filter((n) => !dismissedNotifs.has(n.id))
            .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
          return (
            <section className="ops-grid ops-grid-main">
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Notifications</h3>
                  <span>{selectedVenue?.name}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
                  {filterTabs.map((t) => {
                    const count = allNotifs.filter((n) => (t.key === "all" || n.category === t.key) && !dismissedNotifs.has(n.id)).length;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setNotifFilter(t.key)}
                        style={{
                          padding: "6px 14px", borderRadius: 999, border: "1.5px solid",
                          borderColor: notifFilter === t.key ? "#1E5A3C" : "var(--mcc-border)",
                          background: notifFilter === t.key ? "#1E5A3C" : "transparent",
                          color: notifFilter === t.key ? "white" : "var(--mcc-ink-600)",
                          fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        {t.label}
                        {count > 0 && (
                          <span style={{
                            background: notifFilter === t.key ? "rgba(255,255,255,0.25)" : "#e5e7eb",
                            color: notifFilter === t.key ? "white" : "var(--mcc-ink-600)",
                            borderRadius: 999, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 700,
                          }}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {visible.length === 0 ? (
                  <EmptyState copy="No notifications in this category right now." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {visible.map((notif) => {
                      const style = urgencyStyle[notif.urgency];
                      return (
                        <div key={notif.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 10, background: style.bg, border: `1.5px solid ${style.border}` }}>
                          <span style={{ marginTop: 3, flexShrink: 0, width: 10, height: 10, borderRadius: "50%", background: style.dot, display: "inline-block" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--mcc-ink-900)", marginBottom: 2 }}>{notif.title}</div>
                            <div style={{ fontSize: "0.82rem", color: "var(--mcc-ink-600)", lineHeight: 1.45 }}>{notif.body}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDismissedNotifs((prev) => new Set([...prev, notif.id]))}
                            style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "var(--mcc-ink-400)", fontSize: "1rem", lineHeight: 1, padding: "2px 4px" }}
                            aria-label="Dismiss"
                          >×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>
          );
        })()}

        {activeSection === "aicoach" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card ops-ai-coach-card">
              <div className="ops-card-head">
                <h3>Ask AI Coach</h3>
                <span>{selectedVenue?.name ?? "Your venue"}</span>
              </div>
              <p style={{ color: "var(--text-soft)", fontSize: ".95rem", marginBottom: 16 }}>
                Your AI coach has live access to your venue&rsquo;s staff, training programs, and inventory.
                Ask anything about your team&rsquo;s performance.
              </p>
              <div className="ops-ai-coach-suggestions">
                {[
                  "Who hasn't completed their training?",
                  "Which staff need upselling practice?",
                  "What's our average scenario score?",
                  "Who are my top performers?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="ops-ai-suggestion-chip"
                    onClick={() => setAiCoachInput(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="ops-ai-coach-messages">
                {aiCoachMessages.length === 0 && (
                  <div className="ops-ai-coach-empty">
                    <span>✦</span>
                    <p>Your AI coach is ready. Ask a question about your team, training progress, or venue performance.</p>
                  </div>
                )}
                {aiCoachMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`ops-ai-message ops-ai-message-${msg.role}`}
                  >
                    <span className="ops-ai-message-label">{msg.role === "user" ? "You" : "✦ AI Coach"}</span>
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                  </div>
                ))}
                {aiCoachLoading && (
                  <div className="ops-ai-message ops-ai-message-coach">
                    <span className="ops-ai-message-label">✦ AI Coach</span>
                    <p className="ops-ai-thinking">Analysing your venue data…</p>
                  </div>
                )}
              </div>
              <form className="ops-ai-coach-form" onSubmit={handleAiCoachSubmit}>
                <input
                  className="input"
                  value={aiCoachInput}
                  onChange={(e) => setAiCoachInput(e.target.value)}
                  placeholder="Ask about your staff, training, or venue performance…"
                  disabled={aiCoachLoading}
                />
                <button type="submit" className="btn btn-primary" disabled={aiCoachLoading || !aiCoachInput.trim()}>
                  {aiCoachLoading ? "…" : "Ask"}
                </button>
              </form>
            </article>

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Suggested questions</h3>
              </div>
              <ul className="ops-plain-list">
                <li>Who hasn&rsquo;t completed their alcohol training?</li>
                <li>Which staff have the lowest sales scores?</li>
                <li>What&rsquo;s my venue health score this week?</li>
                <li>Show me staff who need coaching on service.</li>
                <li>How many training programs are active?</li>
                <li>What inventory categories are connected for AI realism?</li>
              </ul>
            </article>
          </section>
        )}

        {activeSection === "predictive" && (() => {
          const venueStaff = snapshot.staff.filter((s) => s.venueId === selectedVenueId);
          type PredictionFlag = { id: string; staffName: string; role: string; gap: string; risk: "high" | "medium"; reason: string; action: string };
          const predictions: PredictionFlag[] = venueStaff.flatMap((member) => {
            const flags: PredictionFlag[] = [];
            if (member.salesScore < 70)
              flags.push({ id: `${member.id}-sales`, staffName: member.name, role: member.role, gap: "Upselling & Sales", risk: "high", reason: `Sales score ${member.salesScore}% — below 70% threshold`, action: "Assign 'Sales Conversations' training module" });
            if (member.serviceScore < 65)
              flags.push({ id: `${member.id}-service`, staffName: member.name, role: member.role, gap: "Service Quality", risk: "medium", reason: `Service score ${member.serviceScore}% — needs attention`, action: "Assign 'Guest Experience Foundations' scenario" });
            if (member.productScore < 60)
              flags.push({ id: `${member.id}-product`, staffName: member.name, role: member.role, gap: "Product Knowledge", risk: "medium", reason: `Product score ${member.productScore}% — knowledge gaps likely`, action: "Review menu knowledge module assignment" });
            if (member.progress < 40 && member.status !== "inactive")
              flags.push({ id: `${member.id}-progress`, staffName: member.name, role: member.role, gap: "Training Completion", risk: "high", reason: `Only ${member.progress}% complete — falling behind`, action: "Schedule a check-in and re-assign priority modules" });
            // Mastery engine flags
            if (member.knowledgeDecayRisk)
              flags.push({ id: `${member.id}-decay`, staffName: member.name, role: member.role, gap: "Knowledge Decay", risk: "high", reason: "Spaced-repetition items overdue — skills fading", action: "Prompt staff to complete review queue" });
            if (member.highConfidenceIncorrectRatio != null && member.highConfidenceIncorrectRatio > 0.3)
              flags.push({ id: `${member.id}-confidence`, staffName: member.name, role: member.role, gap: "Confidence Mismatch", risk: "medium", reason: `${Math.round(member.highConfidenceIncorrectRatio * 100)}% of high-confidence attempts are incorrect`, action: "Coach on self-assessment accuracy — over-confidence risk" });
            return flags;
          });
          const highRisk = predictions.filter((p) => p.risk === "high");
          const medRisk = predictions.filter((p) => p.risk === "medium");
          const gapTotals: Record<string, number> = {};
          predictions.forEach((p) => { gapTotals[p.gap] = (gapTotals[p.gap] ?? 0) + 1; });
          const topGaps = Object.entries(gapTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);

          // Mastery status summary
          const masteryStats = { mastered: 0, inProgress: 0, atRisk: 0 };
          for (const m of venueStaff) {
            if (m.masteryStatus === "mastered") masteryStats.mastered++;
            else if (m.knowledgeDecayRisk) masteryStats.atRisk++;
            else if (m.scenariosAttempted && m.scenariosAttempted > 0) masteryStats.inProgress++;
          }
          const hasMasteryData = venueStaff.some((m) => m.masteryStatus != null || m.eloRating != null);
          return (
            <section className="ops-grid ops-grid-main">
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Predictive Skill Gaps</h3>
                  <span>{selectedVenue?.name ?? "All venues"}</span>
                </div>
                <p style={{ color: "var(--text-soft)", fontSize: ".95rem", marginBottom: 20 }}>
                  Rule-based analysis of your venue&rsquo;s staff data. Staff predicted to struggle in key areas are flagged below with recommended actions.
                </p>

                {hasMasteryData && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                    <div className="ops-kpi-card" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
                      <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Mastered</span>
                      <strong style={{ fontSize: "1.8rem", color: "#16a34a" }}>{masteryStats.mastered}</strong>
                      <small>staff at mastery level</small>
                    </div>
                    <div className="ops-kpi-card" style={{ background: "#eff6ff", borderColor: "#93c5fd" }}>
                      <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>In Progress</span>
                      <strong style={{ fontSize: "1.8rem", color: "#2563eb" }}>{masteryStats.inProgress}</strong>
                      <small>actively training</small>
                    </div>
                    <div className="ops-kpi-card" style={{ background: masteryStats.atRisk > 0 ? "#fef2f2" : "var(--surface)", borderColor: masteryStats.atRisk > 0 ? "#fca5a5" : "var(--line)" }}>
                      <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>At Risk (Decay)</span>
                      <strong style={{ fontSize: "1.8rem", color: masteryStats.atRisk > 0 ? "#dc2626" : "var(--green)" }}>{masteryStats.atRisk}</strong>
                      <small>overdue reviews</small>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                  <div className="ops-kpi-card" style={{ background: predictions.length > 0 ? "#fef2f2" : "var(--surface)", borderColor: predictions.length > 0 ? "#fca5a5" : "var(--line)" }}>
                    <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Total flags</span>
                    <strong style={{ fontSize: "1.8rem", color: predictions.length > 0 ? "#dc2626" : "var(--green)" }}>{predictions.length}</strong>
                    <small>{predictions.length === 0 ? "All staff on track" : `${highRisk.length} high priority`}</small>
                  </div>
                  <div className="ops-kpi-card">
                    <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Staff flagged</span>
                    <strong style={{ fontSize: "1.8rem" }}>{new Set(predictions.map((p) => p.staffName)).size}</strong>
                    <small>of {venueStaff.length} total</small>
                  </div>
                  <div className="ops-kpi-card">
                    <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Top gap area</span>
                    <strong style={{ fontSize: "1.1rem" }}>{topGaps[0]?.[0] ?? "None"}</strong>
                    <small>{topGaps[0] ? `${topGaps[0][1]} staff affected` : "All clear"}</small>
                  </div>
                </div>
                {predictions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-soft)" }}>
                    <div style={{ marginBottom: 8 }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <strong>No skill gap flags detected.</strong>
                    <p style={{ marginTop: 4, fontSize: ".9rem" }}>All staff scores are above thresholds. Keep an eye on this as new staff join.</p>
                  </div>
                ) : (
                  <>
                    {highRisk.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <span style={{ background: "#fca5a5", color: "#7f1d1d", borderRadius: 6, padding: "2px 10px", fontWeight: 700, fontSize: ".8rem" }}>HIGH PRIORITY</span>
                          <span style={{ color: "var(--text-soft)", fontSize: ".85rem" }}>{highRisk.length} prediction{highRisk.length !== 1 ? "s" : ""}</span>
                        </div>
                        <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {highRisk.map((p) => (
                            <li key={p.id} style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 16px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                                <div>
                                  <strong style={{ fontSize: ".95rem" }}>{p.staffName}</strong>
                                  <span style={{ marginLeft: 8, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "1px 8px", fontSize: ".75rem", color: "var(--text-soft)" }}>{p.role}</span>
                                  <span style={{ marginLeft: 6, color: "#dc2626", fontWeight: 600, fontSize: ".85rem" }}>{p.gap}</span>
                                </div>
                              </div>
                              <p style={{ margin: "6px 0 4px", color: "var(--text-soft)", fontSize: ".85rem" }}>{p.reason}</p>
                              <p style={{ margin: 0, fontSize: ".85rem", color: "#1e40af", fontWeight: 500 }}>→ {p.action}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {medRisk.length > 0 && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <span style={{ background: "#fef3c7", color: "#78350f", borderRadius: 6, padding: "2px 10px", fontWeight: 700, fontSize: ".8rem" }}>WATCH</span>
                          <span style={{ color: "var(--text-soft)", fontSize: ".85rem" }}>{medRisk.length} prediction{medRisk.length !== 1 ? "s" : ""}</span>
                        </div>
                        <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {medRisk.map((p) => (
                            <li key={p.id} style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "14px 16px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                                <div>
                                  <strong style={{ fontSize: ".95rem" }}>{p.staffName}</strong>
                                  <span style={{ marginLeft: 8, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "1px 8px", fontSize: ".75rem", color: "var(--text-soft)" }}>{p.role}</span>
                                  <span style={{ marginLeft: 6, color: "#92400e", fontWeight: 600, fontSize: ".85rem" }}>{p.gap}</span>
                                </div>
                              </div>
                              <p style={{ margin: "6px 0 4px", color: "var(--text-soft)", fontSize: ".85rem" }}>{p.reason}</p>
                              <p style={{ margin: 0, fontSize: ".85rem", color: "#1e40af", fontWeight: 500 }}>→ {p.action}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {topGaps.length > 0 && (
                      <div style={{ marginTop: 28, padding: "16px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)" }}>
                        <strong style={{ fontSize: ".9rem", display: "block", marginBottom: 10 }}>Systemic gap analysis</strong>
                        {topGaps.map(([gap, count]) => (
                          <div key={gap} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                            <span style={{ fontSize: ".9rem" }}>{gap}</span>
                            <span style={{ fontWeight: 700, color: count >= 3 ? "#dc2626" : "var(--text)" }}>{count} staff affected</span>
                          </div>
                        ))}
                        <p style={{ marginTop: 10, fontSize: ".82rem", color: "var(--text-soft)" }}>Patterns across multiple staff suggest a systemic gap — consider creating venue-wide training content for these areas.</p>
                      </div>
                    )}
                  </>
                )}
              </article>
            </section>
          );
        })()}

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
                  {snapshot.venues.length === 0 ? (
                    <div className="ops-venue-row-empty">
                      <em>No venues found. Create your first venue to get started.</em>
                    </div>
                  ) : (
                    snapshot.venues.map((venue) => (
                      <div key={venue.id} className="ops-venue-row">
                        <strong>{venue.name}</strong>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleDeleteVenue(venue.id, venue.name)}
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
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
                  <dt>Venue Limit</dt>
                  <dd>5 Venues Maximum</dd>
                </div>
              </dl>
            </article>

            {selectedVenue?.venueCode && (
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Staff join code</h3>
                </div>
                <p style={{ marginBottom: "1rem", color: "var(--ops-text-soft, #6b7280)" }}>
                  Share this code with your staff. They enter it in their training dashboard under <strong>Settings → Join Venue</strong> to link their account and sync their training data here.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{
                    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: "#0B2B1E",
                    background: "#f0fdf4",
                    border: "2px solid #86efac",
                    borderRadius: "12px",
                    padding: "0.5rem 1.5rem",
                    userSelect: "all",
                  }}>
                    {selectedVenue.venueCode}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigator.clipboard.writeText(String(selectedVenue.venueCode))}
                  >
                    Copy code
                  </button>
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--ops-text-soft, #9ca3af)" }}>
                  Once a staff member joins, their training progress will appear in real time in your staff directory.
                </p>
              </article>
            )}

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Email invites</h3>
              </div>
              <p className="ops-settings-hint">
                Staff invite emails require custom SMTP to be configured in your Supabase project. Use the test below to check whether email delivery is working. If it&rsquo;s not, invite links are always generated so you can share them directly.
              </p>
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={testEmailStatus === "loading"}
                  onClick={async () => {
                    setTestEmailStatus("loading");
                    setTestEmailResult(null);
                    try {
                      const res = await apiFetch("/api/management/test-invite-email", { method: "POST" });
                      const data = await res.json() as { success?: boolean; smtpConfigured?: boolean; message?: string; testLink?: string; error?: string };
                      setTestEmailStatus(data.success ? "ok" : "fail");
                      setTestEmailResult({
                        message: data.message ?? data.error ?? "Unknown result.",
                        smtpConfigured: data.smtpConfigured,
                        testLink: data.testLink,
                      });
                    } catch {
                      setTestEmailStatus("fail");
                      setTestEmailResult({ message: "Network error. Could not run test." });
                    }
                  }}
                >
                  {testEmailStatus === "loading" ? "Sending test…" : "Send test invite email"}
                </button>
              </div>
              {testEmailResult && (
                <div className={`ops-invite-link-panel${testEmailStatus === "ok" ? " ops-invite-link-panel--sent" : " ops-invite-link-panel--manual"}`} style={{ marginTop: 14 }}>
                  <div className="ops-invite-link-header">
                    {testEmailStatus === "ok" ? "Sent:" : "Failed:"} {testEmailResult.message}
                  </div>
                  {testEmailResult.smtpConfigured === false && (
                    <p className="ops-invite-link-hint">
                      To fix: go to <strong>Supabase Dashboard → Authentication → Emails</strong> and add custom SMTP credentials (e.g. SendGrid, Resend, Postmark). Until then, use the invite link method when adding staff.
                    </p>
                  )}
                </div>
              )}
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
                  <dd>
                    {plan === "multi-venue" ? "Multi-Venue Plan" :
                      plan === "single-venue" ? "Single Venue Plan" :
                      plan === "pro" ? "Pro Plan" : "Starter Plan"}
                  </dd>
                </div>
                <div>
                  <dt>Seats used</dt>
                  <dd>{venueStaff.length} active staff seats</dd>
                </div>
                <div>
                  <dt>Next invoice</dt>
                  <dd>Managed via Stripe — check your email for invoices</dd>
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
                <span className="ops-badge ops-badge-pending">Coming in V2 — Late 2026</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: 20 }}>
                Serve By Example V2 will connect directly with the tools your venue already uses.
                All integrations listed below are planned for release in late 2026.
              </p>

              <div className="ops-integration-group">
                <span className="ops-integration-group-label">POS &amp; Payments</span>
                <div className="ops-module-grid">
                  {[
                    { name: "Lightspeed", desc: "Sync menu items and sales data" },
                    { name: "Square", desc: "Payment terminals and reporting" },
                    { name: "SwiftPOS", desc: "POS data and item libraries" },
                    { name: "Ordermate", desc: "Order and table management" },
                    { name: "Zeller", desc: "Payments and business finance" },
                  ].map((i) => (
                    <div key={i.name} className="ops-module-card ops-integration-card">
                      <strong>{i.name}</strong>
                      <span>{i.desc}</span>
                      <span className="ops-badge ops-badge-pending">V2 — Late 2026</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ops-integration-group" style={{ marginTop: 24 }}>
                <span className="ops-integration-group-label">Order &amp; Table Management</span>
                <div className="ops-module-grid">
                  {[
                    { name: "me&u", desc: "QR ordering and guest engagement" },
                    { name: "Doshii", desc: "Integration middleware for hospitality apps" },
                  ].map((i) => (
                    <div key={i.name} className="ops-module-card ops-integration-card">
                      <strong>{i.name}</strong>
                      <span>{i.desc}</span>
                      <span className="ops-badge ops-badge-pending">V2 — Late 2026</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ops-integration-group" style={{ marginTop: 24 }}>
                <span className="ops-integration-group-label">Workforce Management</span>
                <div className="ops-module-grid">
                  {[
                    { name: "Tanda", desc: "Rostering, timesheets and onboarding" },
                    { name: "Deputy", desc: "Scheduling, compliance and HR" },
                  ].map((i) => (
                    <div key={i.name} className="ops-module-card ops-integration-card">
                      <strong>{i.name}</strong>
                      <span>{i.desc}</span>
                      <span className="ops-badge ops-badge-pending">V2 — Late 2026</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>
        )}

        {activeSection === "sign-out" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Sign out</h3>
              </div>
              <p style={{ marginBottom: 16, color: "var(--text-soft)" }}>You are signed in as a venue manager. Sign out to return to the login screen.</p>
              <SignOutButton />
            </article>
          </section>
        )}
      </section>

      <aside className="ops-right-panel">
        {/* Team Summary */}
        <article className="ops-card">
          <div className="ops-card-head">
            <h3>Team summary</h3>
            <span>Today</span>
          </div>
          <div className="ops-team-summary-grid">
            <div className="ops-team-stat">
              <span>Total staff</span>
              <strong>{venueStaff.length}</strong>
            </div>
            <div className="ops-team-stat">
              <span>Active today</span>
              <strong>{venueStaff.filter((m) => m.lastActive === "Today").length}</strong>
            </div>
            <div className="ops-team-stat">
              <span>Needs attention</span>
              <strong>{venueStaff.filter((m) => m.status === "attention").length}</strong>
            </div>
            <div className="ops-team-stat">
              <span>Inactive</span>
              <strong>{venueStaff.filter((m) => m.status === "inactive").length}</strong>
            </div>
          </div>
        </article>

        {/* Upcoming Shifts */}
        <article className="ops-card">
          <div className="ops-card-head">
            <h3>Upcoming shifts</h3>
            <span>Today</span>
          </div>
          <ul className="ops-shifts-list">
            <li className="ops-shift-row">
              <span className="ops-shift-time">08:00</span>
              <span className="ops-shift-label">Morning Prep · Kitchen</span>
            </li>
            <li className="ops-shift-row">
              <span className="ops-shift-time">11:00</span>
              <span className="ops-shift-label">Full Service · Floor</span>
            </li>
            <li className="ops-shift-row">
              <span className="ops-shift-time">12:00</span>
              <span className="ops-shift-label">Matinee Team · Bar</span>
            </li>
            <li className="ops-shift-row">
              <span className="ops-shift-time">17:00</span>
              <span className="ops-shift-label">Evening Service · All</span>
            </li>
          </ul>
        </article>

        {/* Quick Actions */}
        <article className="ops-card">
          <div className="ops-card-head">
            <h3>Quick actions</h3>
          </div>
          <ul className="ops-quick-links">
            <li>
              <button type="button" className="ops-quick-link-btn" onClick={() => handleSectionChange("staff")}>
                → View full roster
              </button>
            </li>
            <li>
              <button type="button" className="ops-quick-link-btn" onClick={handleExportStaff}>
                → Export staff list
              </button>
            </li>
            <li>
              <button type="button" className="ops-quick-link-btn" onClick={() => { handleSectionChange("training"); openAction("assign-training"); }}>
                → Bulk assign training
              </button>
            </li>
          </ul>
        </article>
      </aside>
    </div>
  );
}

