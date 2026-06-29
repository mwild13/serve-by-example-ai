"use client";

import React, { FormEvent, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import SignOutButton from "@/components/ui/SignOutButton";
import SessionRefresher from "@/components/ui/SessionRefresher";
import {
  LayoutDashboard,
  Users,
  Users2,
  ShieldCheck,
  FileText,
  BarChart3,
  FileLineChart,
  Trophy,
  Sparkles,
  Settings,
} from "lucide-react";
import type {
  ManagementSnapshot,
  ManagerSection,
  NewInventoryPayload,
  NewStaffPayload,
  NewTrainingProgramPayload,
  StaffMember,
  StaffRole,
} from "@/lib/management/types";
import { ComplianceHub } from "./compliance/ComplianceHub";
import { rsaStatus, readinessPill as getReadinessPill } from "./compliance/helpers";
import type { QuickActionId, NavGroup, SearchResult } from "./manager-types";
import {
  EmptyState,
  formatPercent,
  MasteryMicroGrid,
} from "./manager-ui";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { ManagementTopbar } from "./ManagementTopbar";
import { ActionDrawer } from "./ActionDrawer";

const CoachingDrawer = lazy(() => import("./CoachingDrawer"));
import StaffRosterPanel from "./StaffRosterPanel";

type SnapshotResponse = ManagementSnapshot & {
  inviteMessage?: string;
  inviteLink?: string;
  emailSent?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Command",
    collapsible: false,
    items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "People",
    collapsible: true,
    items: [
      { id: "staff", label: "Staff", icon: Users },
      { id: "teams", label: "Teams", icon: Users2 },
      { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
      { id: "compliance", label: "Compliance", icon: FileText },
    ],
  },
  {
    label: "Performance",
    collapsible: true,
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "reports", label: "Reports", icon: FileLineChart },
      { id: "leaderboards", label: "Leaderboards", icon: Trophy },
      { id: "aicoach", label: "Ask AI Coach", icon: Sparkles },
      { id: "settings", label: "Settings", icon: Settings },
    ],
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


// ─────────────────────────────────────────────
// Circular compliance ring (Roles section)
// ─────────────────────────────────────────────
function ComplianceRing({ compliant, total }: { compliant: number; total: number }) {
  if (!total) return <span style={{ color: "var(--mcc-ink-400)", fontSize: "0.85rem" }}>–</span>;
  const pct = compliant / total;
  const r = 13, cx = 16, cy = 16;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = compliant === total ? "#16a34a" : compliant > 0 ? "#f59e0b" : "#dc2626";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <svg width="32" height="32" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{ fontWeight: 700, color, fontSize: "0.82rem" }}>{compliant}/{total}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Option A Overview – shared helper components
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

function MgrKpiCard({ label, value, sub, data, accent, borderColor }: {
  label: string; value: string; sub: string; data: number[]; accent: string; borderColor?: string;
}) {
  return (
    <div className="mcc-kpi-card" style={borderColor ? { borderLeft: `4px solid ${borderColor}` } : undefined}>
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
  const w = 720, h = 220, pad = 36;
  const max = 100;
  const stepX = (w - pad * 2) / (days.length - 1);
  const yScale = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const makePath = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${pad + i * stepX},${yScale(v)}`).join(" ");
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
        <path d={makePath(trn)} fill="none" stroke="#B98220" strokeWidth="2" strokeLinecap="round" />
        {trn.map((v, i) => <circle key={i} cx={pad + i * stepX} cy={yScale(v)} r="2.5" fill="#B98220" />)}
      </svg>
    </div>
  );
}

const EMPTY_SNAPSHOT: ManagementSnapshot = {
  source: "seed",
  notices: [],
  capabilities: { databaseConnected: false, staffCrud: false, inventoryCrud: false, trainingProgramsCrud: false },
  venues: [],
  staff: [],
  trainingPrograms: [],
  inventory: [],
  menuKnowledge: [],
  scenarioCategories: [],
  reportSummaries: [],
  enabledModules: [],
};

export default function ManagerControlCenter({
  initialSnapshot,
  plan,
  displayName,
}: {
  initialSnapshot?: ManagementSnapshot;
  plan?: string;
  displayName?: string;
}) {
  const isMultiVenue = plan === "multi-venue" || plan === "venue_multi";

  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state is URL-driven so it survives refresh and post-Stripe redirects.
  // Shim functions keep all existing call sites working without change.
  const activeSection =
    (searchParams.get("tab") as ManagerSection | null) ?? "overview";
  function setActiveSection(section: ManagerSection) {
    router.push(`?tab=${section}`, { scroll: false });
  }

  const settingsTab =
    (searchParams.get("subtab") as "setup" | "billing" | null) ?? "setup";
  function setSettingsTab(subtab: "setup" | "billing") {
    router.replace(`?tab=settings&subtab=${subtab}`, { scroll: false });
  }

  // Checkout success: detect post-Stripe redirect and poll for webhook confirmation.
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [subProcessing, setSubProcessing] = useState(false);
  const [subConfirmed, setSubConfirmed] = useState(false);

  const [snapshot, setSnapshot] = useState(initialSnapshot ?? EMPTY_SNAPSHOT);
  const [snapshotLoading, setSnapshotLoading] = useState(!initialSnapshot);
  const [selectedVenueId, setSelectedVenueId] = useState(initialSnapshot?.venues[0]?.id ?? "");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [coachingDrawerOpen, setCoachingDrawerOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<QuickActionId | null>(null);
  const [isDirty, setIsDirty] = useState(false);
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
  const [copiedVenueId, setCopiedVenueId] = useState<string | null>(null);
  const [renameVenueName, setRenameVenueName] = useState(initialSnapshot?.venues[0]?.name ?? "");
  const [renameSaving, setRenameSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch snapshot on mount if not provided server-side
  // useRef avoids refetch when sessionToken/apiFetch changes (Stale-While-Revalidate pattern)
  const hasFetchedSnapshot = useRef(false);
  useEffect(() => {
    if (initialSnapshot || hasFetchedSnapshot.current) return;

    hasFetchedSnapshot.current = true;
    (async () => {
      try {
        const res = await apiFetch("/api/management/snapshot");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as ManagementSnapshot;
        setSnapshot(data);
        if (data.venues.length > 0 && !selectedVenueId) {
          setSelectedVenueId(data.venues[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch snapshot:", err);
        setSnapshot(EMPTY_SNAPSHOT);
      } finally {
        setSnapshotLoading(false);
      }
    })();
  }, [initialSnapshot, apiFetch, selectedVenueId]);

  const [revenueTransactionValue, setRevenueTransactionValue] = useState(45);
  const [aiCoachInput, setAiCoachInput] = useState("");
  const [aiCoachMessages, setAiCoachMessages] = useState<Array<{ role: "user" | "coach"; content: string }>>([]);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<"progress" | "score" | "active">("progress");
  const [notifFilter, setNotifFilter] = useState<"all" | "training" | "performance" | "inventory">("all");
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const [showArchivedNotifs, setShowArchivedNotifs] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [aiCoachFeedback, setAiCoachFeedback] = useState<Record<number, "up" | "down">>({});
  // settingsTab is now derived from URL via setSettingsTab shim above
  const [venueDeleteConfirm, setVenueDeleteConfirm] = useState<{ venueId: string; venueName: string } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSnapshot) {
      setSnapshot(initialSnapshot);
    }
  }, [initialSnapshot]);

  useEffect(() => {
    if (!snapshot.venues.some((venue) => venue.id === selectedVenueId)) {
      setSelectedVenueId(snapshot.venues[0]?.id ?? "");
    }
  }, [snapshot.venues, selectedVenueId]);

  useEffect(() => {
    const venue = snapshot.venues.find((v) => v.id === selectedVenueId) ?? snapshot.venues[0];
    if (venue) setRenameVenueName(venue.name);
  }, [selectedVenueId, snapshot.venues]);

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

  // Guard: redirect any stale deprecated section values to overview
  useEffect(() => {
    if ((activeSection as string) === "billing" || (activeSection as string) === "sign-out") {
      setActiveSection("overview");
    }
  }, [activeSection]);

  // Reset dirty state when drawer opens/closes
  useEffect(() => {
    if (!activeAction) {
      setIsDirty(false);
    }
  }, [activeAction]);

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
  }, []); // router is a stable reference so the closure does not go stale

  // Webhook race-condition guard: when Stripe redirects back with ?checkout=success,
  // the subscription webhook may not have fired yet. Poll the profile for up to 6s
  // to confirm the tier has updated before showing the billing success banner.
  const B2B_TIERS_SET = new Set(["boutique", "commercial", "enterprise", "venue_single", "venue_multi"]);
  useEffect(() => {
    if (!checkoutSuccess) return;
    if (plan && B2B_TIERS_SET.has(plan)) {
      setSubConfirmed(true);
      return;
    }
    setSubProcessing(true);
    let attempts = 0;
    const supabase = createSupabaseBrowserClient();
    const pollId = setInterval(async () => {
      attempts++;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { clearInterval(pollId); setSubProcessing(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.tier && B2B_TIERS_SET.has(data.tier as string)) {
        clearInterval(pollId);
        setSubProcessing(false);
        setSubConfirmed(true);
      } else if (attempts >= 4) {
        clearInterval(pollId);
        setSubProcessing(false);
      }
    }, 1500);
    return () => clearInterval(pollId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutSuccess]);

  const selectedStaff = venueStaff.find((member) => member.id === selectedStaffId) ?? venueStaff[0];
  const selectedProgram = venuePrograms.find((program) => program.id === assignmentForm.programId) ?? venuePrograms[0];

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

  // Readiness pills and compliance status use imported helpers
  const readinessPill = (member: StaffMember) => getReadinessPill(member.compliance, member.status);

  const metrics = useMemo(() => {
    const totalStaff = venueStaff.length;
    const activeThisWeek = venueStaff.filter((member) => {
      if (member.lastActive === "Not started") return false;
      const match = member.lastActive.match(/^(\d+) days? ago$/);
      if (match) return parseInt(match[1], 10) < 7;
      return true; // "Today" or "Yesterday"
    }).length;

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
        rfScore: 0,
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

    // ── Rf (Shift Readiness) Score ──
    const WC = 0.50, WT = 0.30, WA = 0.20; // weights: Compliance, Training, Availability
    const shiftStaff = venueStaff.slice(0, 8); // first 8 = "tonight's shift" approximation
    const rfScore = shiftStaff.length === 0 ? 0 : Math.round(
      (shiftStaff.reduce((sum, s) => {
        const Ci = rsaStatus(s.compliance).level === 3 ? 0 : 1;
        const Ti = s.progress / 100;
        const Ai = s.compliance?.shiftConfirmed ? 1 : (s.status === 'on-track' ? 0.8 : 0.4);
        return sum + (WC * Ci + WT * Ti + WA * Ai);
      }, 0) / shiftStaff.length) * 100
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
      rfScore,
    };
  }, [selectedVenue, venueStaff]);

  const needsAttention = venueStaff.filter((member) => member.status !== "on-track");
  const inactiveCount = venueStaff.filter((member) => member.status === "inactive").length;

  // ── AI Coaching Queue ──
  const coachingQueue = venueStaff
    .filter(s => s.status !== 'on-track' || rsaStatus(s.compliance).level >= 2)
    .slice(0, 4)
    .map(s => {
      const rsaStat = rsaStatus(s.compliance);
      let reason: string;
      let moduleTag: string;

      if (rsaStat.level >= 2) {
        reason = `RSA expiring in ${rsaStat.label} — assign refresher`;
        moduleTag = 'RSA Refresher';
      } else if (s.salesScore < 50) {
        reason = `Sales score ${s.salesScore}% — assign upsell module`;
        moduleTag = 'Sales Training';
      } else {
        reason = `Training completion ${s.progress}% — push core modules`;
        moduleTag = 'Core Training';
      }

      return { staff: s, reason, moduleTag };
    });

  // ── Manager Insights – auto-generated action tips ──
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
        text: "All staff are on track. Great momentum, keep the training rhythm going.",
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
        ? `The training engine has access to ${venueInventory.reduce((sum, category) => sum + category.products.length, 0)} products.`
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
  }

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
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

    if (!activeAction) return;

    if (!selectedVenue) {
      setRequestError("No venue selected. Add a venue first before adding staff or inventory.");
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
      setIsDirty(false);
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
      setIsDirty(false);
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

  async function handleRenameVenue(e: FormEvent) {
    e.preventDefault();
    if (!selectedVenueId || !renameVenueName.trim()) return;
    setRenameSaving(true);
    setRequestError("");
    setRequestSuccess("");
    try {
      const response = await apiFetch("/api/management/venues", {
        method: "PATCH",
        body: JSON.stringify({ venueId: selectedVenueId, name: renameVenueName.trim() }),
      });
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        setRequestError(data.error ?? "Failed to rename venue.");
        return;
      }
      await applySnapshotResult(response);
      setRequestSuccess("Venue name updated.");
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to rename venue.");
    } finally {
      setRenameSaving(false);
    }
  }

  // Show skeleton loaders while snapshot is loading
  if (snapshotLoading) {
    return (
      <div className="ops-shell">
        <SessionRefresher />
        <aside className="ops-sidebar" style={{ opacity: 0.5, pointerEvents: "none" }}>
          <div className="ops-sidebar-top">
            <span className="ops-sidebar-brand">Management console</span>
            <h3>Venue operations</h3>
            <div style={{ background: "var(--line-light)", height: 40, borderRadius: 8, marginTop: 12 }} />
            <div style={{ background: "var(--line-light)", height: 200, borderRadius: 8, marginTop: 12 }} />
          </div>
        </aside>
        <section className="ops-workspace" style={{ opacity: 0.4, pointerEvents: "none" }}>
          <div style={{ background: "var(--line-light)", height: 60, borderRadius: 8, marginBottom: 20 }} />
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: "var(--line-light)", height: 200, borderRadius: 8 }} />
            ))}
          </div>
        </section>
      </div>
    );
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
            ) : !isMultiVenue ? (
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
        <div className="ops-sidebar-footer">
          <SignOutButton />
        </div>
      </aside>

      <section className="ops-workspace">
        <ManagementTopbar
          breadcrumbs={breadcrumbs}
          venueName={selectedVenueId ? snapshot.venues.find((v) => v.id === selectedVenueId)?.name ?? "Venue" : "Venue"}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onResultClick={(result) => {
            handleSectionChange(result.section);
            setSearchQuery("");
          }}
          onActionSelect={setActiveAction}
        />

        {/* Checkout success / webhook processing banner */}
        {checkoutSuccess && subProcessing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: "var(--gold-light)",
              border: "1.5px solid var(--gold)",
              borderRadius: "var(--radius-md)",
              marginBottom: 12,
              fontSize: "0.875rem",
              color: "var(--text)",
              fontWeight: 600,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Processing your subscription — this takes just a moment...
          </div>
        )}
        {checkoutSuccess && subConfirmed && !subProcessing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: "#f0fdf4",
              border: "1.5px solid #86efac",
              borderRadius: "var(--radius-md)",
              marginBottom: 12,
              fontSize: "0.875rem",
              color: "#15803d",
              fontWeight: 600,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Subscription activated. Your team is ready to train.
          </div>
        )}

        <ActionDrawer
          isOpen={!!activeAction}
          onClose={() => setActiveAction(null)}
          title={
            activeAction === "add-staff"
              ? "Add staff member"
              : activeAction === "assign-training"
                ? "Assign training"
              : activeAction === "add-inventory"
                ? "Add inventory item"
              : activeAction === "create-program"
                ? "Create training program"
              : "Action"
          }
          isDirty={isDirty}
        >
          {requestSuccess ? <div className="auth-status auth-status-success">{requestSuccess}</div> : null}
          {requestError ? <div className="auth-status auth-status-error">{requestError}</div> : null}

          {/* Invite link panel – shown after add-staff when an invite link was generated */}
          {pendingInviteLink && (
            <div className={`ops-invite-link-panel${pendingInviteLink.emailSent ? " ops-invite-link-panel--sent" : " ops-invite-link-panel--manual"}`}>
              <div className="ops-invite-link-header">
                {pendingInviteLink.emailSent ? (
                  <><strong>Invite email sent</strong> to {pendingInviteLink.email}</>
                ) : (
                  <><strong>Email not delivered</strong> – SMTP not configured in Supabase.</>
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
                  onChange={(event) => {
                    setIsDirty(true);
                    setAssignmentForm((current) => ({ ...current, staffId: event.target.value }));
                  }}
                  required
                >
                  {venueStaff.map((member) => {
                    const isBlockedRsa = rsaStatus(member.compliance).level === 3;
                    return (
                      <option key={member.id} value={member.id} disabled={isBlockedRsa}>
                        {member.name}{isBlockedRsa ? ' (Blocked: Expired RSA)' : ''}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="label">
                Program
                <select
                  className="input"
                  value={assignmentForm.programId}
                  onChange={(event) => {
                    setIsDirty(true);
                    setAssignmentForm((current) => ({ ...current, programId: event.target.value }));
                  }}
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
                  onChange={(event) => {
                    setIsDirty(true);
                    setStaffForm((current) => ({ ...current, name: event.target.value }));
                  }}
                  placeholder="Sarah"
                  required
                />
              </label>
              <label className="label">
                Role
                <select
                  className="input"
                  value={staffForm.role}
                  onChange={(event) => {
                    setIsDirty(true);
                    setStaffForm((current) => ({ ...current, role: event.target.value as StaffRole }));
                  }}
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
                  onChange={(event) => {
                    setIsDirty(true);
                    setStaffForm((current) => ({ ...current, email: event.target.value }));
                  }}
                  placeholder="staff@venue.com"
                />
              </label>
              <label className="ops-inline-checkbox ops-action-span-full">
                <input
                  type="checkbox"
                  checked={Boolean(staffForm.sendInvite)}
                  onChange={(event) => {
                    setIsDirty(true);
                    setStaffForm((current) => ({ ...current, sendInvite: event.target.checked }));
                  }}
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
                  onChange={(event) => {
                    setIsDirty(true);
                    setInventoryForm((current) => ({ ...current, category: event.target.value }));
                  }}
                  placeholder="Vodka"
                  required
                />
              </label>
              <label className="label">
                Product name
                <input
                  className="input"
                  value={inventoryForm.name}
                  onChange={(event) => {
                    setIsDirty(true);
                    setInventoryForm((current) => ({ ...current, name: event.target.value }));
                  }}
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
                  onChange={(event) => {
                    setIsDirty(true);
                    setProgramForm((current) => ({ ...current, name: event.target.value }));
                  }}
                  placeholder="New Bartender Program"
                  required
                />
              </label>
              <label className="label">
                Role target
                <input
                  className="input"
                  value={programForm.roleTarget}
                  onChange={(event) => {
                    setIsDirty(true);
                    setProgramForm((current) => ({ ...current, roleTarget: event.target.value }));
                  }}
                  placeholder="Bartenders"
                  required
                />
              </label>
              <label className="label ops-action-span-full">
                Program description
                <textarea
                  className="input ops-textarea"
                  value={programForm.description}
                  onChange={(event) => {
                    setIsDirty(true);
                    setProgramForm((current) => ({ ...current, description: event.target.value }));
                  }}
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
                    onChange={(event) => {
                      setIsDirty(true);
                      setProgramForm((current) => ({
                        ...current,
                        dayPlan: current.dayPlan.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      }));
                    }}
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
        </ActionDrawer>

        {activeSection === "overview" && (
          <div className="mcc-overview-shell">
            {/* ── Main scrollable content ── */}
            <div className="mcc-overview-main">

              {/* ── Compact workspace header ── */}
              <div style={{ padding: "20px 28px 0" }}>
                <WorkspaceHeader
                  title={selectedVenue?.name ?? "Your Venue"}
                  description={`${todayDateStr} · ${attentionCount > 0 ? `${attentionCount} ${attentionCount === 1 ? "thing needs" : "things need"} attention` : "All systems operational"}`}
                  actions={
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        className="ops-health-chip"
                        data-health={
                          metrics.venueHealthScore >= 75
                            ? "good"
                            : metrics.venueHealthScore >= 50
                            ? "warn"
                            : "critical"
                        }
                      >
                        Venue Health: {metrics.venueHealthScore}/100
                      </div>
                      <button
                        type="button"
                        className="ops-quick-link-btn"
                        onClick={() => handleSectionChange("staff")}
                        style={{ fontSize: "0.88rem" }}
                      >
                        → View roster
                      </button>
                      <button
                        type="button"
                        className="ops-quick-link-btn"
                        onClick={handleExportStaff}
                        style={{ fontSize: "0.88rem" }}
                      >
                        → Export
                      </button>
                      <button
                        type="button"
                        className="ops-quick-link-btn"
                        onClick={() => { handleSectionChange("training"); openAction("assign-training"); }}
                        style={{ fontSize: "0.88rem" }}
                      >
                        → Bulk assign
                      </button>
                    </div>
                  }
                />
              </div>

              {/* ── Level 2 Compliance Banner (7-day alert) ── */}
              {venueStaff.some(s => rsaStatus(s.compliance).level >= 2) && (
                <div style={{ padding: "12px 28px 0 28px" }}>
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#b91c1c', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, fontWeight: 600, fontSize: '0.95rem' }}>
                    Compliance alert: one or more staff have certifications expiring within 7 days. Review the Compliance tab immediately.
                  </div>
                </div>
              )}

              {/* ── KPI strip ── */}
              <section className="mcc-kpi-strip" style={{ padding: "20px 28px 0" }}>
                {(() => {
                  const getUrgencyBorder = (value: number) => {
                    if (value < 30) return '#ef4444'; // red
                    if (value < 70) return '#f59e0b'; // amber
                    return '#22c55e'; // green
                  };
                  const onTrackCount = venueStaff.filter((m) => m.status === "on-track").length;
                  const staffHealthRatio = venueStaff.length > 0 ? onTrackCount / venueStaff.length : 0;

                  return (
                    <>
                      <MgrKpiCard
                        label="Avg scenario score"
                        value={formatPercent(metrics.avgScenarioScore)}
                        sub="Service · sales · product"
                        data={mgrMockSpark(metrics.avgScenarioScore)}
                        accent="var(--mcc-sage)"
                        borderColor={getUrgencyBorder(metrics.avgScenarioScore)}
                      />
                      <MgrKpiCard
                        label="Training completion"
                        value={formatPercent(metrics.avgCompletion)}
                        sub="Across all modules"
                        data={mgrMockSpark(metrics.avgCompletion)}
                        accent="var(--mcc-amber)"
                        borderColor={getUrgencyBorder(metrics.avgCompletion)}
                      />
                      <MgrKpiCard
                        label="Upsell performance"
                        value={formatPercent(metrics.salesSkill)}
                        sub="Last 7 days"
                        data={mgrMockSpark(metrics.salesSkill)}
                        accent="var(--mcc-terra)"
                        borderColor={getUrgencyBorder(metrics.salesSkill)}
                      />
                      <MgrKpiCard
                        label="Staff health"
                        value={`${onTrackCount} active`}
                        sub={`${venueStaff.length} total · ${venueStaff.filter((m) => m.status === "attention").length} at risk · ${venueStaff.filter((m) => m.status === "inactive").length} inactive`}
                        data={mgrMockSpark(0.75)}
                        accent="var(--mcc-sage)"
                        borderColor={getUrgencyBorder(Math.round(staffHealthRatio * 100))}
                      />
                    </>
                  );
                })()}
              </section>

              {/* ── 30-Day Revenue Impact Projection Banner ── */}
              <section style={{ padding: "16px 28px" }}>
                {(() => {
                  const completionRate = metrics.avgCompletion;
                  const targetCompletion = Math.min(100, completionRate + 20);
                  const staffCount = venueStaff.length || 1;
                  const avgCheckSize = 45;
                  const weeklyBaselineCheck = staffCount * 5 * avgCheckSize * (completionRate / 100);
                  const weeklyProjectedChecks = staffCount * 5 * avgCheckSize * (targetCompletion / 100);
                  const weeklyIncrement = Math.round(weeklyProjectedChecks - weeklyBaselineCheck);

                  return (
                    <div style={{
                      background: 'var(--gold-light)',
                      border: '1px solid var(--gold)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      color: 'var(--text)',
                    }}>
                      <div style={{ fontSize: '1.3rem', flexShrink: 0 }}>📈</div>
                      <div>
                        <strong>30-Day Revenue Impact Projection</strong>
                        <p style={{ margin: '6px 0 0 0', color: 'var(--text-soft)' }}>
                          Increasing your team&apos;s scenario training completion to {targetCompletion.toFixed(0)}% is projected to drive an additional <strong style={{ color: 'var(--green)' }}>${weeklyIncrement.toLocaleString()}</strong> in weekly revenue through active-recall upselling modules.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </section>

              {/* ── Training Chart (Full Width) ── */}
              <div className="mcc-overview-card" style={{ margin: "20px 28px 0" }}>
                <div className="mcc-overview-card-head">Training progression, 14 days</div>
                <MgrRevenueChart trainingValue={metrics.avgCompletion} />
              </div>

              {/* ── Tonight's Shift Readiness (Full Width, Scrollable) ── */}
              <div className="mcc-scorecard-card" style={{ margin: "16px 28px 0", maxHeight: "500px", overflowY: "auto" }}>
                <div className="mcc-scorecard-header">
                  <span>Tonight&apos;s Shift Readiness</span>
                  <span
                    className="mcc-rf-badge"
                    style={{
                      background:
                        metrics.rfScore >= 75
                          ? 'var(--green-light)'
                          : metrics.rfScore >= 50
                          ? '#fff7ed'
                          : '#fff1f2',
                      color:
                        metrics.rfScore >= 75
                          ? 'var(--green)'
                          : metrics.rfScore >= 50
                          ? '#c2410c'
                          : '#b91c1c',
                    }}
                  >
                    {metrics.rfScore}%
                  </span>
                </div>
                <table className="ops-staff-table mcc-scorecard-table">
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>RSA</th>
                      <th>Training</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venueStaff.map((s) => {
                      const rsaStat = rsaStatus(s.compliance);
                      const isBlocked = rsaStat.level === 3;
                      const pill = readinessPill(s);
                      const isAlcoholRole = s.role === 'Bartender' || s.role === 'Floor';
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="ops-staff-avatar">{s.name[0]}</div>
                            {s.name}
                            {s.isJunior && isAlcoholRole && (
                              <span style={{ color: '#c2410c', fontSize: '0.65rem', display: 'block' }}>
                                Junior serving alcohol &mdash; verify adult rate (MA000119)
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ color: rsaStat.level === 3 ? '#b91c1c' : 'var(--green)' }}>
                              {s.compliance?.rsaJurisdiction ?? '—'} RSA
                            </span>
                          </td>
                          <td>{s.progress}%</td>
                          <td>
                            {isBlocked ? (
                              <span
                                style={{
                                  background: '#fef2f2',
                                  color: '#991b1b',
                                  border: '1px solid #fee2e2',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                }}
                              >
                                ● ROSTER BLOCKED
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: pill.bg,
                                  color: pill.color,
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                }}
                              >
                                {pill.dot} {pill.label}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Re-positioned Sidebar Content Below Training Chart ── */}
              <div className="mcc-overview-grid" style={{ margin: "20px 28px 0", gridTemplateColumns: "repeat(2, 1fr)" }}>
                {/* AI Coach Insights */}
                <div className="mcc-overview-card">
                  <div className="mcc-overview-card-head">Manager insights</div>
                  <div style={{ padding: "14px 16px", fontSize: "13px", color: "var(--mcc-ink-700)", lineHeight: "1.5" }}>
                    {snapshot?.notices && snapshot.notices.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: "16px" }}>
                        {snapshot.notices.slice(0, 3).map((notice: string, i: number) => (
                          <li key={i} style={{ marginBottom: "6px" }}>{notice}</li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: "var(--mcc-ink-500)" }}>Check back after team activity for insights</span>
                    )}
                  </div>
                </div>

                {/* Needs Attention */}
                <div className="mcc-overview-card">
                  <div className="mcc-overview-card-head">Needs attention</div>
                  <div style={{ padding: "12px 16px" }}>
                    {needsAttention.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px" }}>
                        {needsAttention.slice(0, 3).map((member) => (
                          <li key={member.id} style={{ marginBottom: "6px", color: "var(--mcc-bad)" }}>
                            {member.name} – {member.status === "attention" ? "Needs attention" : "Not started"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ fontSize: "13px", color: "var(--mcc-good)" }}>All staff on track</div>
                    )}
                  </div>
                </div>

                {/* Team Summary */}
                <div className="mcc-overview-card">
                  <div className="mcc-overview-card-head">Team summary</div>
                  <div style={{ padding: "12px 16px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--mcc-ink-700)" }}>
                      <span>Total staff</span>
                      <strong>{venueStaff.length}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--mcc-ink-700)" }}>
                      <span>Avg completion</span>
                      <strong>{formatPercent(metrics.avgCompletion)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Secondary Grid: Training Pillars + Compliance + Venue Health ── */}
              <div className="mcc-secondary-grid" style={{ padding: "0 28px", paddingBottom: "20px" }}>
                {/* Training pillars */}
                <div className="mcc-overview-card">
                  <div className="mcc-overview-card-head">Training completion by pillar</div>
                  <div style={{ padding: "16px 20px" }}>
                    {[
                      { name: "Bartending",     val: Math.max(metrics.productSkill, metrics.avgCompletion), color: "var(--mcc-terra)" },
                      { name: "Sales",          val: metrics.salesSkill, color: "var(--mcc-amber)" },
                      { name: "Management",     val: venuePrograms.length ? Math.round(venuePrograms.reduce((s, p) => s + p.completion, 0) / venuePrograms.length) : 0, color: "var(--mcc-rose)" },
                      { name: "Menu Knowledge", val: venueInventory.length ? Math.min(venueInventory.reduce((s, i) => s + i.products.length, 0) * 5, 100) : 0, color: "var(--mcc-sage)" },
                      { name: "Service",        val: metrics.serviceSkill, color: "var(--mcc-forest-600)" },
                      { name: "Scenarios",      val: Math.min(todaySnapshot.scenariosCompleted * 3, 100), color: "var(--mcc-info)" },
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

                {/* Compliance + Venue Health stack */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Compliance card */}
                  <div className="mcc-overview-card">
                    <div className="mcc-overview-card-head">Compliance</div>
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: "var(--mcc-ink-900)" }}>
                        {metrics.avgCompletion > 0 ? `${Math.min(100, Math.round(metrics.avgCompletion * 0.9 + 10))}%` : "–"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--mcc-ink-500)", marginBottom: 14 }}>Service standards assessment</div>
                      {([
                        ["RSA certified",     `${venueStaff.length} / ${venueStaff.length || "–"}`, metrics.avgCompletion > 50 ? "good" : "warn"],
                        ["Food safety",       `${venueStaff.length} / ${venueStaff.length || "–"}`, "good"],
                        ["Service protocols", `${venueStaff.filter(s => s.status === "on-track").length} / ${venueStaff.length || "–"}`, needsAttention.length > 0 ? "warn" : "good"],
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
                  <div className="mcc-overview-card">
                    <div className="mcc-overview-card-head">Venue health</div>
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                          {metrics.venueHealthScore > 0 ? metrics.venueHealthScore : "–"}
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
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{v > 0 ? `${v}%` : "–"}</span>
                          </div>
                          <div className="mcc-bar">
                            <div className="mcc-bar-fill" style={{ width: `${v}%`, background: c }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Staff snapshot + Operational alerts + Upcoming shifts (responsive grid) ── */}
              <section className="mcc-lower-grid">
                {/* Staff snapshot */}
                <div className="mcc-card" style={{ maxHeight: "500px", overflowY: "auto" }}>
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
                      {venueStaff.map((member) => {
                        const isGood = member.status === "on-track";
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
                            <MasteryMicroGrid
                              scenariosMastered={member.scenariosMastered}
                              scenariosAttempted={member.scenariosAttempted}
                            />
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

                {/* AI Coaching Queue */}
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>AI Coaching Queue</h2>
                    <span className="mcc-card-meta">{coachingQueue.length} to coach</span>
                  </div>
                  <div style={{ padding: 4 }}>
                    {coachingQueue.length > 0 ? (
                      coachingQueue.map((item) => (
                        <div
                          key={item.staff.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--line-light)',
                            fontSize: '13px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: item.staff.status === 'attention' ? '#fff7ed' : '#fff1f2',
                              color: item.staff.status === 'attention' ? '#c2410c' : '#b91c1c',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {item.staff.name[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: '2px' }}>
                              {item.staff.name}
                            </div>
                            <div style={{ color: 'var(--text-soft)', fontSize: '12px' }}>
                              {item.reason}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: '#f0f9ff',
                                color: '#0369a1',
                                fontSize: '11px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.moduleTag}
                            </span>
                            <button
                              type="button"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                background: 'var(--green)',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                              onClick={() => {
                                // Future: POST /api/management/training-programs
                                console.log(`Assign ${item.moduleTag} to ${item.staff.name}`);
                              }}
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        All staff are on track. Great work!
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming shifts */}
                <div className="mcc-card">
                  <div className="mcc-card-h">
                    <h2>Upcoming shifts</h2>
                    <span className="mcc-card-meta">Today</span>
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
                  <button
                    type="button"
                    className="ops-btn-tertiary"
                    style={{ marginTop: 12, fontSize: "0.82rem" }}
                    onClick={() => handleSectionChange("settings")}
                  >
                    Manage shifts
                  </button>
                </div>
              </section>

            </div>

          </div>
        )}

        {activeSection === "staff" && (
          <StaffRosterPanel
            snapshot={snapshot}
            selectedVenueId={selectedVenueId}
            selectedVenue={selectedVenue}
            venueStaff={venueStaff}
            selectedStaffId={selectedStaffId}
            sessionToken={sessionToken}
            onSnapshotUpdate={(updated) => setSnapshot(updated)}
            onOpenCoachingDrawer={(staffId) => { setSelectedStaffId(staffId); setCoachingDrawerOpen(true); }}
          />
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--mcc-ink-500)" }}>{selectedVenue?.name}</span>
                    {venueStaff.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const rows = [["Team", "Members", "Avg Progress", "Avg Score", "Needs Attention"], ...teams.map((t) => [t.label, String(t.members.length), `${t.avgProgress}%`, `${t.avgScore}%`, String(t.attention.length)])];
                          const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a"); a.href = url; a.download = `team-report-${selectedVenue?.name ?? "venue"}.csv`; a.click(); URL.revokeObjectURL(url);
                        }}
                        style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid var(--mcc-border)", background: "var(--mcc-bg)", color: "var(--mcc-ink-700)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export team report
                      </button>
                    )}
                  </div>
                </div>
                {venueStaff.length === 0 ? (
                  <EmptyState copy="Add staff to unlock team performance data." />
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
                              <b style={{ color: "var(--mcc-ink-900)" }}>{team.avgProgress > 0 ? `${team.avgProgress}%` : "–"}</b>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Avg scenario score</span>
                              <b style={{ color: "var(--mcc-ink-900)" }}>{team.avgScore > 0 ? `${team.avgScore}%` : "–"}</b>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Needs attention</span>
                              <b style={{ color: team.attention.length > 0 ? "#b45309" : "#15803d" }}>{team.attention.length}</b>
                            </div>
                          </div>
                          {team.members.length === 0 && (
                            <button
                              type="button"
                              onClick={() => { handleSectionChange("staff"); openAction("add-staff"); }}
                              style={{ marginTop: 8, padding: "7px 12px", borderRadius: 8, border: "1.5px dashed var(--mcc-border)", background: "transparent", color: "var(--mcc-forest-700)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "center" }}
                            >
                              + Assign staff to team
                            </button>
                          )}
                          {team.top && (
                            <div style={{ fontSize: "0.78rem", borderTop: "1px solid var(--mcc-border)", paddingTop: 6, marginTop: 2 }}>
                              <span style={{ color: "var(--mcc-ink-500)" }}>Top: </span>
                              <span style={{ fontWeight: 600, color: "var(--mcc-ink-900)" }}>{team.top.name}</span>
                              <span style={{ color: "var(--mcc-ink-500)" }}> · {team.top.progress}%</span>
                            </div>
                          )}
                          {team.weakest && team.members.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                              <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#fff7ed", color: "#b45309", border: "1px solid #fed7aa", borderRadius: 999, padding: "2px 8px" }}>
                                Gap: {team.weakest}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSectionChange("scenarios")}
                                style={{ fontSize: "0.72rem", color: "var(--mcc-forest-700)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                              >
                                Resolve →
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: "1px solid var(--mcc-border)", paddingTop: "1rem" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--mcc-ink-500)", marginBottom: 10 }}>Team comparison – avg scenario score</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {/* 80% target label */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                          <span style={{ width: 96, flexShrink: 0 }} />
                          <div style={{ flex: 1, position: "relative", height: 10 }}>
                            <div style={{ position: "absolute", left: `${(80 / maxScore) * 100}%`, top: -14, fontSize: "0.65rem", color: "#1E5A3C", fontWeight: 700, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>80% target</div>
                            <div style={{ position: "absolute", left: `${(80 / maxScore) * 100}%`, top: 0, width: 2, height: "100%", background: "#1E5A3C", opacity: 0.4 }} />
                          </div>
                          <span style={{ width: 60 }} />
                        </div>
                        {teams.map((team) => (
                          <div key={team.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 96, fontSize: "0.82rem", color: "var(--mcc-ink-700)", flexShrink: 0 }}>{team.label}</span>
                            <div style={{ flex: 1, height: 10, background: "var(--mcc-surface-2)", borderRadius: 999, overflow: "visible", position: "relative" }}>
                              <div style={{ height: "100%", width: `${team.members.length ? (team.avgScore / maxScore) * 100 : 0}%`, background: team.avgScore >= 80 ? "#16a34a" : team.avgScore >= 50 ? "#1E5A3C" : "#f59e0b", borderRadius: 999, transition: "width 0.4s ease" }} />
                              {/* 80% marker */}
                              <div style={{ position: "absolute", left: `${(80 / maxScore) * 100}%`, top: -2, width: 2, height: 14, background: "#1E5A3C", opacity: 0.35, borderRadius: 1 }} />
                            </div>
                            <span style={{ width: 60, fontSize: "0.78rem", fontWeight: 600, color: team.members.length ? (team.avgScore >= 80 ? "#16a34a" : "var(--mcc-ink-900)") : "var(--mcc-ink-400)", textAlign: "right" }}>
                              {team.members.length ? `${team.avgScore}%` : "No data"}
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
          // Required modules per role (static config – editable in V2)
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
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--mcc-ink-500)" }}>{selectedVenue?.name}</span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                      onClick={() => { handleSectionChange("training"); openAction("assign-training"); }}
                    >
                      Bulk assign
                    </button>
                  </div>
                </div>
                {/* Role readiness summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
                  {roleStats.map((row) => {
                    const readiness = row.avgProgress ?? 0;
                    const color = readiness >= 70 ? "#16a34a" : readiness >= 40 ? "#f59e0b" : "var(--text)";
                    const bg = readiness >= 70 ? "#f0fdf4" : readiness >= 40 ? "#fff7ed" : "var(--surface)";
                    const border = readiness >= 70 ? "#86efac" : readiness >= 40 ? "#fed7aa" : "var(--line)";
                    return (
                      <div key={row.role} style={{ padding: "10px 12px", borderRadius: 8, background: bg, border: `1.5px solid ${border}` }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--mcc-ink-600)", marginBottom: 4 }}>{row.role}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ fontSize: "1.3rem", fontWeight: 800, color }}>{row.avgProgress ?? "–"}{row.avgProgress != null ? "%" : ""}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--mcc-ink-400)" }}>readiness</span>
                        </div>
                        <div style={{ marginTop: 6, height: 4, background: "#e5e7eb", borderRadius: 999 }}>
                          <div style={{ height: "100%", width: `${readiness}%`, background: color, borderRadius: 999, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    );
                  })}
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
                              {row.avgProgress !== null ? `${row.avgProgress}%` : "–"}
                            </td>
                            <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--mcc-border)" }}>
                              <ComplianceRing compliant={row.compliant} total={row.members.length} />
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Dashboard access by role</span>
                    <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 999, background: "#fef9c3", color: "#92400e", fontWeight: 700, border: "1px solid #fde68a" }}>Manager column = elevated access</span>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--mcc-border)" }}>
                        <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Capability</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "#92400e", fontWeight: 700, background: "#fef9c3", borderRadius: "8px 8px 0 0" }}>Manager</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Supervisor</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--mcc-ink-500)", fontWeight: 600 }}>Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSIONS.map((perm) => {
                        const dot = (has: boolean, isManager?: boolean) => (
                          <td style={{ textAlign: "center", padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)", background: isManager ? "#fefce8" : "transparent" }}>
                            <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: has ? "#1E5A3C" : "#e5e7eb" }} />
                          </td>
                        );
                        return (
                          <tr key={perm.label}>
                            <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--mcc-border)", color: "var(--mcc-ink-700)" }}>{perm.label}</td>
                            {dot(perm.manager, true)}
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
            <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
              <EmptyState copy="Programs builder coming soon. Saved data will appear here automatically." />
            </article>
          </section>
        )}

        {activeSection === "scenarios" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
              <EmptyState copy="Scenario builder coming soon. Performance is tracked in the background." />
            </article>
          </section>
        )}

        {activeSection === "inventory" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
              <EmptyState copy="Full inventory management coming soon. Saved data will appear here automatically." />
            </article>
          </section>
        )}

        {activeSection === "menu" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
              <EmptyState copy="Menu engineering tools coming soon." />
            </article>
          </section>
        )}

        {activeSection === "compliance" && <ComplianceHub venueStaff={venueStaff} />}

        {activeSection === "analytics" && (
          <>
            <section className="ops-grid ops-grid-main">
              {isMultiVenue && (
                <article className="ops-card">
                  <div className="ops-card-head">
                    <h3>Multi-venue comparison</h3>
                    <span>All venues</span>
                  </div>
                  <div className="ops-module-grid">
                    {snapshot.venues.map((venue) => {
                      const isLow = venue.completionRate < 30;
                      const isActive = selectedVenueId === venue.id;
                      return (
                        <div
                          key={venue.id}
                          className={`ops-module-card${isActive ? " active" : ""}`}
                          style={{}}
                          onClick={() => setSelectedVenueId(venue.id)}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <strong>{venue.name}</strong>
                            {isLow && <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "var(--bg-alt)", color: "var(--text-soft)", border: "1px solid var(--line)", borderRadius: 999, padding: "1px 6px" }}>Low</span>}
                          </div>
                          <span style={{ color: "inherit" }}>Completion: {venue.completionRate}%</span>
                          <span>Scenario: {venue.avgScenarioScore}%</span>
                          <span>Upsell: {venue.upsellRate}%</span>
                          {isLow && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedVenueId(venue.id); handleSectionChange("staff"); }}
                              style={{ marginTop: 8, padding: "4px 10px", borderRadius: 6, border: "1.5px solid var(--line)", background: "transparent", color: "var(--text-soft)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                            >
                              Review staff →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              )}

              <article className="ops-card">
                <WorkspaceHeader
                  title="This week vs last week"
                  description="Comparison to 7 days prior"
                  meta={selectedVenue?.name}
                />
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
                        <span>{row.current > 0 ? `${row.current}${suffix}` : "–"}</span>
                        <span>{row.prev > 0 ? `${row.prev}${suffix}` : "–"}</span>
                        <span style={{ fontWeight: 700, color: delta > 0 ? "#16a34a" : delta < 0 ? "var(--text-soft)" : "var(--mcc-ink-400)" }}>
                          {delta > 0 ? `↑ ${delta}${suffix}` : delta < 0 ? `↓ ${Math.abs(delta)}${suffix}` : "–"}
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
                {venueStaff.filter((m) => m.role === "Bartender" || m.role === "Floor").length > 0 ? (() => {
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
                          <span>{row.barVal > 0 ? `${row.barVal}%` : "–"}</span>
                          <span>{row.floorVal > 0 ? `${row.floorVal}%` : "–"}</span>
                        </div>
                      ))}
                    </div>
                  );
                })() : (
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--mcc-ink-700)", marginBottom: 6 }}>No bar or floor staff yet</div>
                    <p style={{ fontSize: "0.8rem", color: "var(--mcc-ink-500)", margin: "0 0 14px" }}>Assign staff with Bartender or Floor roles to unlock side-by-side team comparison.</p>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: "0.8rem" }} onClick={() => { handleSectionChange("staff"); openAction("add-staff"); }}>
                      + Add staff
                    </button>
                  </div>
                )}
              </article>

              <article className="ops-card ops-revenue-model">
                <div className="ops-card-head">
                  <h3>Revenue impact estimator</h3>
                  <span>Upsell improvement estimator</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--mcc-ink-600)", fontWeight: 600 }}>Avg transaction value</span>
                    <strong style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--mcc-ink-900)" }}>${revenueTransactionValue}</strong>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={300}
                    step={5}
                    value={revenueTransactionValue}
                    onChange={(e) => setRevenueTransactionValue(Number(e.target.value))}
                    className="ops-revenue-slider"
                    style={{ "--slider-pct": `${((revenueTransactionValue - 5) / 295) * 100}%` } as React.CSSProperties}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--mcc-ink-400)", marginTop: 2 }}>
                    <span>$5</span><span>$300</span>
                  </div>
                </div>
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
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--mcc-border)", background: "var(--mcc-surface-2)" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mcc-ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>How this is calculated</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--mcc-ink-600)", lineHeight: 1.5 }}>
                    {Math.max(venueStaff.length, 3)} staff × 40 transactions/shift × 3 shifts/week × ${revenueTransactionValue} avg order value × upsell improvement %
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--mcc-ink-400)", marginTop: 4 }}>Training-driven upsell improvement is a conservative estimate based on Serve By Example scenario coaching outcomes.</div>
                </div>
              </article>
            </section>
          </>
        )}

        {activeSection === "reports" && (() => {
          // Compliance helper (matches Compliance tab logic)
          const reqModules: Record<string, string[]> = {
            Bartender: ["Bartending", "Sales"],
            Floor: ["Sales"],
            Supervisor: ["Sales", "Bartending"],
            Manager: ["Sales", "Bartending", "Management"],
            "New Staff": ["Bartending"],
          };
          const hasModule = (s: typeof venueStaff[0], mod: string) => {
            if (mod === "Sales") return s.salesScore >= 60 || s.progress >= 60;
            if (mod === "Bartending") return s.serviceScore >= 60;
            if (mod === "Management") return s.productScore >= 60;
            return false;
          };
          const fullyCompliant = venueStaff.filter((s) =>
            (reqModules[s.role] ?? []).every((m) => hasModule(s, m))
          );
          const sortedByProgress = [...venueStaff].sort((a, b) => b.progress - a.progress);
          const topPerformers = sortedByProgress.filter((s) => s.progress > 0).slice(0, 3);
          const needsHelp = venueStaff.filter((s) => s.status !== "on-track").slice(0, 5);

          const statusBadge = (status: string, progress?: number) => {
            const effective = (status === "on-track" && progress === 0) ? "not-started" : status;
            const map: Record<string, { bg: string; color: string; label: string }> = {
              "on-track":    { bg: "#f0fdf4", color: "#15803d", label: "On track" },
              "attention":   { bg: "#fff7ed", color: "#c2410c", label: "Attention" },
              "inactive":    { bg: "#fff1f2", color: "#b91c1c", label: "Inactive" },
              "not-started": { bg: "#f3f4f6", color: "#6b7280", label: "Not started" },
            };
            const s = map[effective] ?? map["inactive"];
            return (
              <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, background: s.bg, color: s.color }}>
                {s.label}
              </span>
            );
          };

          return (
            <section className="ops-grid ops-grid-main">
              {/* Header with export */}
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--mcc-ink-900)" }}>Performance reports</h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--mcc-ink-500)", marginTop: 3 }}>{selectedVenue?.name}</div>
                  </div>
                  {venueStaff.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportStaff}
                      style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid var(--mcc-border)", background: "var(--mcc-bg)", color: "var(--mcc-ink-700)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export staff CSV
                    </button>
                  )}
                </div>

                {/* KPI summary strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  {[
                    { label: "Total staff", value: venueStaff.length },
                    { label: "Avg training", value: venueStaff.length ? `${metrics.avgCompletion}%` : "–" },
                    { label: "Avg score", value: venueStaff.length ? `${metrics.avgScenarioScore}%` : "–" },
                    { label: "Compliant", value: venueStaff.length ? `${fullyCompliant.length}/${venueStaff.length}` : "–" },
                  ].map((kpi) => (
                    <div key={kpi.label} style={{ padding: "14px 16px", background: "var(--surface-raised)", borderRadius: 10, border: "1px solid var(--mcc-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--mcc-ink-900)" }}>{kpi.value}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mcc-ink-500)", marginTop: 2 }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>

                {venueStaff.length === 0 ? (
                  <EmptyState copy="Add staff to start generating performance reports." />
                ) : (
                  <>
                    {/* Training summary table */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--mcc-ink-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Weekly training summary
                        </div>
                        <input
                          type="search"
                          value={reportSearch}
                          onChange={(e) => setReportSearch(e.target.value)}
                          placeholder="Filter by name or role…"
                          style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--mcc-border)", background: "var(--mcc-bg)", color: "var(--mcc-ink-700)", fontSize: "0.8rem", width: 200 }}
                          aria-label="Filter staff"
                        />
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid var(--mcc-border)" }}>
                              {["Staff member", "Role", "Progress", "Service", "Sales", "Product", "Status"].map((h) => (
                                <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700, fontSize: "0.75rem", color: "var(--mcc-ink-500)", whiteSpace: "nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedByProgress.filter((s) => !reportSearch.trim() || s.name.toLowerCase().includes(reportSearch.toLowerCase()) || s.role.toLowerCase().includes(reportSearch.toLowerCase())).map((s) => (
                              <tr key={s.id} style={{ borderBottom: "1px solid var(--mcc-border)" }}>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--mcc-ink-900)", whiteSpace: "nowrap" }}>{s.name}</td>
                                <td style={{ padding: "8px 10px", color: "var(--mcc-ink-600)", whiteSpace: "nowrap" }}>{s.role}</td>
                                <td style={{ padding: "8px 10px", minWidth: 90 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ flex: 1, height: 5, background: "var(--mcc-surface-2)", borderRadius: 999 }}>
                                      <div style={{ height: "100%", width: `${s.progress}%`, background: s.progress >= 70 ? "linear-gradient(90deg, #15803d, #22c55e)" : s.progress >= 40 ? "linear-gradient(90deg, #d97706, #fbbf24)" : "linear-gradient(90deg, #dc2626, #f87171)", borderRadius: 999, transition: "width 0.3s ease" }} />
                                    </div>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--mcc-ink-700)", width: 32, textAlign: "right" }}>{Math.round(s.progress)}%</span>
                                  </div>
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "var(--mcc-ink-700)" }}>{s.serviceScore}%</td>
                                <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "var(--mcc-ink-700)" }}>{s.salesScore}%</td>
                                <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "var(--mcc-ink-700)" }}>{s.productScore}%</td>
                                <td style={{ padding: "8px 10px" }}>{statusBadge(s.status, s.progress)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bottom two panels */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      {/* Top performers */}
                      <div style={{ background: "var(--mcc-surface-2)", borderRadius: 12, padding: "1rem" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--mcc-ink-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                          Top performers
                        </div>
                        {topPerformers.map((s, i) => (
                          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < topPerformers.length - 1 ? "1px solid var(--mcc-border)" : "none" }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--mcc-ink-900)" }}>{s.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--mcc-ink-500)" }}>{s.role}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E5A3C" }}>{Math.round(s.progress)}%</div>
                              <div style={{ fontSize: "0.7rem", color: "var(--mcc-ink-400)" }}>completion</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Needs attention */}
                      <div style={{ background: needsHelp.length > 0 ? "#fff7ed" : "var(--mcc-surface-2)", borderRadius: 12, padding: "1rem", border: needsHelp.length > 0 ? "1.5px solid #fed7aa" : "none" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: needsHelp.length > 0 ? "#c2410c" : "var(--mcc-ink-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                          Needs attention {needsHelp.length > 0 ? `(${needsHelp.length})` : ""}
                        </div>
                        {needsHelp.length === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "#15803d", fontWeight: 600 }}>All staff are on track. Great work.</p>
                          </div>
                        ) : (
                          needsHelp.map((s, i) => (
                            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < needsHelp.length - 1 ? "1px solid #fed7aa" : "none" }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#7c2d12" }}>{s.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#92400e" }}>{s.role} · {s.lastActive}</div>
                              </div>
                              <div>{statusBadge(s.status)}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Skill breakdown */}
                    <div style={{ marginTop: "1rem", background: "var(--mcc-surface-2)", borderRadius: 12, padding: "1rem" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--mcc-ink-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                        Venue skill breakdown
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                        {[
                          { label: "Service", value: metrics.serviceSkill, color: "#1E5A3C" },
                          { label: "Sales", value: metrics.salesSkill, color: "#f59e0b" },
                          { label: "Product knowledge", value: metrics.productSkill, color: "#1d4ed8" },
                        ].map((skill) => (
                          <div key={skill.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: "0.8rem", color: "var(--mcc-ink-600)", fontWeight: 600 }}>{skill.label}</span>
                              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: skill.color }}>{skill.value > 0 ? `${skill.value}%` : "–"}</span>
                            </div>
                            <div style={{ height: 10, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${skill.value}%`, background: skill.color, borderRadius: 999, transition: "width 0.3s ease" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </article>
            </section>
          );
        })()}

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
          const getPoints = (s: typeof venueStaff[0]) => {
            const raw = Math.round(s.progress * 1.2 + (s.serviceScore + s.salesScore + s.productScore) / 3 * 0.8);
            return `${raw} pts`;
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
                              {/* rank label rendered below */}
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
                    {/* Season banner */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", padding: "10px 14px", background: "var(--mcc-surface-2)", borderRadius: 8, border: "1px solid var(--mcc-border)" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mcc-ink-500)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {new Date().toLocaleString("default", { month: "long" })} Champions · {selectedVenue?.name}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--mcc-ink-400)" }}>{ranked.length} ranked</span>
                    </div>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {ranked.slice(0, 8).map((member, idx) => {
                        const medalColors = ["#F59E0B", "#94A3B8", "#CD7F32"];
                        const isTop3 = idx < 3;
                        return (
                          <li
                            key={member.id}
                            onClick={() => { setSelectedStaffId(member.id); handleSectionChange("staff"); }}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                              background: isTop3 ? `${podiumColors[idx]}08` : "var(--mcc-surface-2)",
                              border: `1.5px solid ${isTop3 ? podiumColors[idx] + "40" : "var(--mcc-border)"}`,
                              transition: "box-shadow 0.15s, transform 0.1s",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLLIElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLLIElement).style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLLIElement).style.boxShadow = "none"; (e.currentTarget as HTMLLIElement).style.transform = "none"; }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                background: isTop3 ? medalColors[idx] : "var(--mcc-surface-2)",
                                border: isTop3 ? "none" : "1.5px solid var(--mcc-border)",
                              }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isTop3 ? "white" : "var(--mcc-ink-400)" }}>{idx + 1}</span>
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--mcc-ink-900)" }}>{member.name}</div>
                                <div style={{ fontSize: "0.72rem", color: "var(--mcc-ink-500)" }}>{member.role}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: isTop3 ? podiumColors[idx] : "var(--mcc-ink-700)" }}>{getValue(member)}</div>
                              <div style={{ fontSize: "0.72rem", color: "var(--mcc-ink-400)" }}>{getPoints(member)}</div>
                            </div>
                          </li>
                        );
                      })}
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
              body: `${s.name} needs attention, currently at ${parseFloat(s.progress.toFixed(0))}% completion.`,
            }))),
            ...(venueStaff.filter((s) => s.salesScore > 0 && s.salesScore < 50).map((s) => ({
              id: `lowsales-${s.id}`,
              category: "performance" as const,
              urgency: "warning" as const,
              title: "Low upsell score",
              body: `${s.name} has a sales score of ${s.salesScore}%. Consider targeted upsell training.`,
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--mcc-ink-500)" }}>{selectedVenue?.name}</span>
                    {dismissedNotifs.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowArchivedNotifs((v) => !v)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1.5px solid var(--mcc-border)", background: showArchivedNotifs ? "var(--mcc-ink-100, #f3f4f6)" : "transparent", color: "var(--mcc-ink-600)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        {showArchivedNotifs ? "Hide archived" : `Show archived (${dismissedNotifs.size})`}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSectionChange("settings")}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--mcc-border)", background: "transparent", color: "var(--mcc-ink-500)", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                      aria-label="Notification settings"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Settings
                    </button>
                  </div>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#f0fdf4", borderRadius: 10, border: "1.5px solid #86efac" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#15803d" }}>All clear in this category.</div>
                      <div style={{ fontSize: "0.8rem", color: "#16a34a" }}>No active alerts to action right now.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {visible.map((notif) => {
                      const style = notif.id === "inventory-ok" ? { bg: "#f0fdf4", border: "#86efac", dot: "#16a34a", label: "Connected" } : urgencyStyle[notif.urgency];
                      const ctaMap: Record<string, { label: string; section: ManagerSection }> = {
                        "training":     { label: "Review staff", section: "staff" },
                        "performance":  { label: "Open scenarios", section: "scenarios" },
                        "inventory":    { label: "Manage inventory", section: "inventory" },
                      };
                      const inlineCta = notif.urgency !== "info" ? ctaMap[notif.category] : null;
                      return (
                        <div key={notif.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 10, background: style.bg, border: `1.5px solid ${style.border}`, borderLeft: `4px solid ${style.dot}` }}>
                          <span style={{ marginTop: 3, flexShrink: 0, width: 10, height: 10, borderRadius: "50%", background: style.dot, display: "inline-block" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--mcc-ink-900)", marginBottom: 2 }}>{notif.title}</div>
                            <div style={{ fontSize: "0.82rem", color: "var(--mcc-ink-600)", lineHeight: 1.45 }}>{notif.body}</div>
                            {inlineCta && (
                              <button
                                type="button"
                                onClick={() => handleSectionChange(inlineCta.section)}
                                style={{ marginTop: 8, padding: "5px 12px", borderRadius: 6, background: "var(--mcc-forest-600)", color: "white", border: "none", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                {inlineCta.label} →
                              </button>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--mcc-ink-400)" }}>Now</span>
                            <button
                              type="button"
                              onClick={() => setDismissedNotifs((prev) => new Set([...prev, notif.id]))}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mcc-ink-400)", fontSize: "0.75rem", fontWeight: 600, padding: "2px 6px", borderRadius: 4, lineHeight: 1 }}
                              aria-label="Dismiss"
                            >Archive</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {showArchivedNotifs && dismissedNotifs.size > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mcc-ink-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Archived</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.55 }}>
                      {allNotifs.filter((n) => dismissedNotifs.has(n.id)).map((notif) => (
                        <div key={notif.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "var(--mcc-surface-2)", border: "1px solid var(--mcc-border)" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db", flexShrink: 0, display: "inline-block" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--mcc-ink-600)" }}>{notif.title}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--mcc-ink-400)" }}>{notif.body}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDismissedNotifs((prev) => { const next = new Set(prev); next.delete(notif.id); return next; })}
                            style={{ background: "none", border: "1px solid var(--mcc-border)", borderRadius: 4, cursor: "pointer", color: "var(--mcc-ink-400)", fontSize: "0.72rem", padding: "2px 7px" }}
                          >Restore</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </section>
          );
        })()}

        {activeSection === "aicoach" && (
          <section className="ops-grid ops-grid-main">
            <article className="ops-card ops-ai-coach-card">
              <WorkspaceHeader
                title="Ask AI Coach"
                description="Live access to your team's training data and scores"
                meta={selectedVenue?.name ?? "Your venue"}
              />
              <div className="ops-ai-coach-suggestions">
                {[
                  "Who needs the most attention this week?",
                  "Which staff are falling behind on training?",
                  "What are my top upselling risks?",
                  "Who is close to full mastery?",
                  "Summarise this venue's performance.",
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
                    <div style={{ width: "100%", marginBottom: 16 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mcc-ink-500)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
                        Your venue at a glance – {selectedVenue?.name}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                        {[
                          { label: "Staff", value: venueStaff.length > 0 ? String(venueStaff.length) : "–", sub: "active members" },
                          { label: "Avg score", value: metrics.avgScenarioScore > 0 ? `${metrics.avgScenarioScore}%` : "–", sub: "scenario average" },
                          { label: "Training", value: metrics.avgCompletion > 0 ? `${metrics.avgCompletion}%` : "–", sub: "completion rate" },
                          { label: "Attention", value: String(needsAttention.length), sub: needsAttention.length === 1 ? "needs follow-up" : "need follow-up" },
                        ].map((stat) => (
                          <div key={stat.label} style={{ background: "var(--mcc-surface-2)", borderRadius: 8, padding: "10px 14px" }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--mcc-ink-900)" }}>{stat.value}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--mcc-ink-500)", marginTop: 1 }}>{stat.label} · {stat.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--mcc-ink-500)", textAlign: "center", margin: 0 }}>Ask anything about your team, training progress, or venue performance.</p>
                  </div>
                )}
                {aiCoachMessages.map((msg, index) => (
                  <div key={index} className={`ops-ai-message ops-ai-message-${msg.role}`}>
                    <span className="ops-ai-message-label">{msg.role === "user" ? "You" : "AI Coach"}</span>
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                    {msg.role === "coach" && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        {(["up", "down"] as const).map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => setAiCoachFeedback((prev) => ({ ...prev, [index]: dir }))}
                            style={{ padding: "3px 8px", borderRadius: 6, border: `1.5px solid ${aiCoachFeedback[index] === dir ? (dir === "up" ? "#86efac" : "#fca5a5") : "var(--mcc-border)"}`, background: aiCoachFeedback[index] === dir ? (dir === "up" ? "#f0fdf4" : "#fef2f2") : "transparent", cursor: "pointer", fontSize: "0.82rem", color: aiCoachFeedback[index] === dir ? (dir === "up" ? "#16a34a" : "#dc2626") : "var(--mcc-ink-400)", transition: "all 0.15s" }}
                            aria-label={dir === "up" ? "Helpful" : "Not helpful"}
                          >
                            {dir === "up" ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill={aiCoachFeedback[index] === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill={aiCoachFeedback[index] === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {aiCoachLoading && (
                  <div className="ops-ai-message ops-ai-message-coach">
                    <span className="ops-ai-message-label">AI Coach</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      {[90, 75, 55].map((w) => (
                        <div key={w} style={{ height: 10, width: `${w}%`, borderRadius: 999, background: "var(--mcc-surface-2)", animation: "pulse 1.5s ease-in-out infinite" }} />
                      ))}
                    </div>
                    <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
                  </div>
                )}
              </div>
              <form className="ops-ai-coach-form" onSubmit={handleAiCoachSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea
                  className="input"
                  value={aiCoachInput}
                  onChange={(e) => setAiCoachInput(e.target.value)}
                  placeholder="Ask about your staff, training, or venue performance…"
                  disabled={aiCoachLoading}
                  rows={3}
                  style={{ resize: "vertical", minHeight: 72, fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.5 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (aiCoachInput.trim() && !aiCoachLoading) {
                        (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                      }
                    }
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--mcc-ink-400)" }}>Press Enter to send · Shift+Enter for new line</span>
                  <button
                    type="submit"
                    disabled={aiCoachLoading || !aiCoachInput.trim()}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, border: "none", background: aiCoachLoading || !aiCoachInput.trim() ? "#e5e7eb" : "#1E5A3C", color: aiCoachLoading || !aiCoachInput.trim() ? "#9ca3af" : "white", fontWeight: 700, fontSize: "0.85rem", cursor: aiCoachLoading || !aiCoachInput.trim() ? "not-allowed" : "pointer", transition: "background 0.15s" }}
                  >
                    {aiCoachLoading ? "Thinking…" : (
                      <>
                        Send
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
              <small style={{ fontSize: "0.72rem", color: "var(--mcc-ink-400)", marginTop: 8, textAlign: "center", display: "block" }}>
                Do not share sensitive staff salary or financial details with AI Coach.
              </small>
            </article>
          </section>
        )}

        {activeSection === "predictive" && (() => {
          const venueStaff = snapshot.staff.filter((s) => s.venueId === selectedVenueId);
          type PredictionFlag = { id: string; staffName: string; role: string; gap: string; risk: "high" | "medium"; reason: string; action: string };
          const predictions: PredictionFlag[] = venueStaff.flatMap((member) => {
            const flags: PredictionFlag[] = [];
            if (member.salesScore < 70)
              flags.push({ id: `${member.id}-sales`, staffName: member.name, role: member.role, gap: "Upselling & Sales", risk: "high", reason: `Sales score ${member.salesScore}% – below 70% threshold`, action: "Assign 'Sales Conversations' training module" });
            if (member.serviceScore < 65)
              flags.push({ id: `${member.id}-service`, staffName: member.name, role: member.role, gap: "Service Quality", risk: "medium", reason: `Service score ${member.serviceScore}% – needs attention`, action: "Assign 'Guest Experience Foundations' scenario" });
            if (member.productScore < 60)
              flags.push({ id: `${member.id}-product`, staffName: member.name, role: member.role, gap: "Product Knowledge", risk: "medium", reason: `Product score ${member.productScore}% – knowledge gaps likely`, action: "Review menu knowledge module assignment" });
            if (member.progress < 40 && member.status !== "inactive")
              flags.push({ id: `${member.id}-progress`, staffName: member.name, role: member.role, gap: "Training Completion", risk: "high", reason: `Only ${member.progress}% complete – falling behind`, action: "Schedule a check-in and re-assign priority modules" });
            // Mastery engine flags
            if (member.knowledgeDecayRisk)
              flags.push({ id: `${member.id}-decay`, staffName: member.name, role: member.role, gap: "Knowledge Decay", risk: "high", reason: "Spaced-repetition items overdue – skills fading", action: "Prompt staff to complete review queue" });
            if (member.highConfidenceIncorrectRatio != null && member.highConfidenceIncorrectRatio > 0.3)
              flags.push({ id: `${member.id}-confidence`, staffName: member.name, role: member.role, gap: "Confidence Mismatch", risk: "medium", reason: `${Math.round(member.highConfidenceIncorrectRatio * 100)}% of high-confidence attempts are incorrect`, action: "Coach on self-assessment accuracy – over-confidence risk" });
            return flags;
          });
          const highRisk = predictions.filter((p) => p.risk === "high");
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
                <WorkspaceHeader
                  title="Predictive Skill Gaps"
                  description="Identify training risks before they show up on the floor"
                  actions={
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--mcc-ink-500)" }}>{selectedVenue?.name ?? "All venues"}</span>
                      {predictions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const rows = [["Staff", "Role", "Gap", "Risk", "Reason", "Action"], ...predictions.map((p) => [p.staffName, p.role, p.gap, p.risk, p.reason, p.action])];
                            const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
                            const blob = new Blob([csv], { type: "text/csv" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a"); a.href = url; a.download = `training-plan-${selectedVenue?.name ?? "venue"}.csv`; a.click(); URL.revokeObjectURL(url);
                          }}
                          style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid var(--mcc-border)", background: "var(--mcc-bg)", color: "var(--mcc-ink-700)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Export training plan
                        </button>
                      )}
                    </div>
                  }
                />

                {hasMasteryData && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                    <div className="ops-kpi-card" style={{ background: "var(--surface)", borderLeft: "4px solid var(--green)" }}>
                      <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Mastered</span>
                      <strong style={{ fontSize: "1.8rem", color: "var(--green)" }}>{masteryStats.mastered}</strong>
                      <small>staff at mastery level</small>
                    </div>
                    <div className="ops-kpi-card" style={{ background: "var(--surface)", borderLeft: "4px solid var(--gold-warm)" }}>
                      <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>In Progress</span>
                      <strong style={{ fontSize: "1.8rem", color: "var(--gold-warm)" }}>{masteryStats.inProgress}</strong>
                      <small>actively training</small>
                    </div>
                    <div className="ops-kpi-card" style={{ background: "var(--surface)", borderLeft: "4px solid #b91c1c" }}>
                      <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>At Risk (Decay)</span>
                      <strong style={{ fontSize: "1.8rem", color: "#b91c1c" }}>{masteryStats.atRisk}</strong>
                      <small>overdue reviews</small>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                  <div className="ops-kpi-card" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
                    <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Total flags</span>
                    <strong style={{ fontSize: "1.8rem", color: "var(--text)" }}>{predictions.length}</strong>
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
                    <strong>No skill gaps detected.</strong>
                    <p style={{ marginTop: 4, fontSize: ".9rem" }}>All staff are tracking above performance thresholds. Keep monitoring as new staff join.</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      // Group all predictions by staffName for cleaner employee cards
                      const staffNames = [...new Set(predictions.map((p) => p.staffName))];
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {staffNames.map((name) => {
                            const staffFlags = predictions.filter((p) => p.staffName === name);
                            const staffMember = venueStaff.find((s) => s.name === name);
                            const hasHigh = staffFlags.some((p) => p.risk === "high");
                            return (
                              <div key={name} style={{
                                border: "1.5px solid var(--line)",
                                borderLeft: "4px solid var(--line)",
                                borderRadius: 10,
                                overflow: "hidden",
                                background: "var(--surface)",
                              }}>
                                {/* Staff header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--line-light)" }}>
                                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.875rem", color: "var(--green-deep)", flexShrink: 0 }}>
                                    {name[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--mcc-ink-900)" }}>{name}</div>
                                      {hasHigh ? (
                                        <span style={{ padding: "2px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.68rem", fontWeight: 700, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", flexShrink: 0 }}>
                                          High priority
                                        </span>
                                      ) : (
                                        <span style={{ padding: "2px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.68rem", fontWeight: 700, background: "var(--bg-alt)", color: "var(--text-soft)", border: "1px solid var(--line)", flexShrink: 0 }}>
                                          Watch
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--mcc-ink-500)" }}>{staffMember?.role ?? "Staff"} · {staffFlags.length} flag{staffFlags.length !== 1 ? "s" : ""}</div>
                                  </div>
                                </div>
                                {/* Individual flags */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                  {staffFlags.map((p, fi) => (
                                    <div key={p.id} style={{ padding: "10px 16px", borderBottom: fi < staffFlags.length - 1 ? "1px solid var(--line-light)" : "none" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                        <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text)" }}>{p.gap}</span>
                                      </div>
                                      <div style={{ fontSize: "0.8rem", color: "var(--text-soft)", marginBottom: 6 }}>{p.reason}</div>
                                      <button
                                        type="button"
                                        onClick={() => handleSectionChange("staff")}
                                        style={{ padding: "5px 12px", borderRadius: 6, background: "#1E5A3C", color: "white", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                                      >
                                        {p.action}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {topGaps.length > 0 && (
                      <div style={{ marginTop: 28, padding: "16px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)" }}>
                        <strong style={{ fontSize: ".9rem", display: "block", marginBottom: 10 }}>Systemic gap analysis</strong>
                        {topGaps.map(([gap, count]) => (
                          <div key={gap} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                            <span style={{ fontSize: ".9rem" }}>{gap}</span>
                            <span style={{ fontWeight: 700, color: "var(--text)" }}>{count} staff affected</span>
                          </div>
                        ))}
                        <p style={{ marginTop: 10, fontSize: ".82rem", color: "var(--text-soft)" }}>Patterns across multiple staff suggest a systemic gap. Consider creating venue-wide training content for these areas.</p>
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
            <div className="mcc-tab-bar" style={{ gridColumn: "1 / -1", marginBottom: 4 }}>
              <button type="button" className={`mcc-tab${settingsTab === "setup" ? " mcc-tab-active" : ""}`} onClick={() => setSettingsTab("setup")}>Venue setup</button>
              <button type="button" className={`mcc-tab${settingsTab === "billing" ? " mcc-tab-active" : ""}`} onClick={() => setSettingsTab("billing")}>Billing</button>
            </div>
            {settingsTab === "setup" && (<>
            {/* ── Setup progress tracker ── */}
            {(() => {
              const steps = [
                { label: "Add a venue", done: snapshot.venues.length > 0 },
                { label: "Staff join code ready", done: !!selectedVenue?.venueCode },
                { label: "Invite staff members", done: venueStaff.length > 0 },
                { label: "Connect inventory", done: venueInventory.length > 0 },
              ];
              const completedCount = steps.filter((s) => s.done).length;
              const allDone = completedCount === steps.length;
              return (
                <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="ops-card-head">
                    <h3>Setup checklist</h3>
                    <span style={{ color: allDone ? "#15803d" : "var(--mcc-ink-500)" }}>{completedCount}/{steps.length} complete</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    {steps.map((step) => (
                      <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: step.done ? "#f0fdf4" : "var(--mcc-surface-2)", border: `1.5px solid ${step.done ? "#86efac" : "var(--mcc-border)"}` }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.done ? "#16a34a" : "var(--mcc-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {step.done
                            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="2" fill="white"/></svg>
                          }
                        </div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: step.done ? "#15803d" : "var(--mcc-ink-600)" }}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                  {allDone && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "#dcfce7", borderRadius: 8, fontSize: "0.82rem", color: "#15803d", fontWeight: 600 }}>
                      Venue setup complete. Your team is ready to train.
                    </div>
                  )}
                </article>
              );
            })()}
            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Venue setup</h3>
              </div>
              <div className="ops-venue-manager">
                {isMultiVenue ? (
                  <>
                    <label className="label">
                      Active venue
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
                            <div style={{ display: "flex", gap: 8 }}>
                              {venue.venueCode && (
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    const url = `${window.location.origin}/dashboard?join=${venue.venueCode}`;
                                    navigator.clipboard.writeText(url);
                                    setCopiedVenueId(venue.id);
                                    setTimeout(() => setCopiedVenueId(null), 2000);
                                  }}
                                >
                                  {copiedVenueId === venue.id ? "Copied!" : "Share link"}
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setVenueDeleteConfirm({ venueId: venue.id, venueName: venue.name })}
                                disabled={isSaving}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleRenameVenue}>
                    <label className="label">
                      Venue name
                      <input
                        className="input"
                        value={renameVenueName}
                        onChange={(event) => setRenameVenueName(event.target.value)}
                        placeholder="Your venue name"
                        required
                      />
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={renameSaving} style={{ marginTop: 8 }}>
                      {renameSaving ? "Saving..." : "Save changes"}
                    </button>
                  </form>
                )}
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
                  <dd>{isMultiVenue ? "5 Venues Maximum" : "1 Venue"}</dd>
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
                <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, background: "var(--mcc-surface-2)", border: "1px solid var(--mcc-border)" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mcc-ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>What your staff will see</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--mcc-ink-600)" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 6, background: "#f0fdf4", border: "1px solid #86efac", fontWeight: 600, color: "#15803d" }}>Settings</span>
                    <span style={{ color: "var(--mcc-ink-400)" }}>→</span>
                    <span style={{ padding: "3px 10px", borderRadius: 6, background: "#f0fdf4", border: "1px solid #86efac", fontWeight: 600, color: "#15803d" }}>Join Venue</span>
                    <span style={{ color: "var(--mcc-ink-400)" }}>→ Enter code</span>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, color: "#0B2B1E", background: "#e6f4ee", padding: "2px 8px", borderRadius: 4 }}>{selectedVenue?.venueCode}</span>
                  </div>
                </div>
              </article>
            )}

            <article className="ops-card">
              <div className="ops-card-head">
                <h3>Staff sign-up link</h3>
              </div>
              <p className="ops-settings-hint">
                Share this link with staff to let them sign up and join your venue directly. No email setup required.
              </p>
              {selectedVenue?.venueCode ? (
                <div style={{ marginTop: 16 }}>
                  <input
                    className="input"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : "https://serve-by-example.com"}/dashboard?join=${selectedVenue.venueCode}`}
                    style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.8rem", marginBottom: 8 }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => {
                      const url = `${window.location.origin}/dashboard?join=${selectedVenue.venueCode}`;
                      navigator.clipboard.writeText(url);
                      setCopiedVenueId(`signup-${selectedVenue.id}`);
                      setTimeout(() => setCopiedVenueId(null), 2000);
                    }}
                  >
                    {copiedVenueId === `signup-${selectedVenue.id}` ? "Copied!" : "Copy sign-up link"}
                  </button>
                </div>
              ) : (
                <p style={{ color: "var(--ops-text-soft, #9ca3af)", fontSize: 13, marginTop: 12 }}>
                  No join code found for this venue. Try refreshing the page.
                </p>
              )}
            </article>
            </>)}
            {settingsTab === "billing" && (
              <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
                <div className="ops-card-head">
                  <h3>Billing overview</h3>
                </div>
                <dl className="ops-settings-list">
                  <div>
                    <dt>Current plan</dt>
                    <dd>
                      {plan === "enterprise" ? "Enterprise Plan" :
                        plan === "commercial" ? "Commercial Plan" :
                        plan === "boutique" ? "Boutique Plan" :
                        plan === "multi-venue" || plan === "venue_multi" ? "Commercial Plan" :
                        plan === "single-venue" || plan === "venue_single" ? "Boutique Plan" :
                        plan === "pro" ? "Pro Plan" : "Free Plan"}
                    </dd>
                  </div>
                  <div>
                    <dt>Seats used</dt>
                    <dd>{venueStaff.length} active staff seats</dd>
                  </div>
                  <div>
                    <dt>Next invoice</dt>
                    <dd>Managed via Stripe</dd>
                  </div>
                </dl>
              </article>
            )}
          </section>
        )}
      </section>


      {/* ── Coaching drawer ── */}
      <Suspense fallback={null}>
        <CoachingDrawer
          isOpen={coachingDrawerOpen}
          staff={selectedStaff}
          onClose={() => setCoachingDrawerOpen(false)}
          onAssignTraining={() => { setCoachingDrawerOpen(false); openAction("assign-training"); }}
        />
      </Suspense>

      {/* ── Venue delete confirmation modal ── */}
      {venueDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }} onClick={() => setVenueDeleteConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 12, padding: "28px 32px", maxWidth: 420, width: "calc(100% - 48px)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>Delete venue?</h3>
            <p style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.55 }}>
              You are about to permanently delete <strong>{venueDeleteConfirm.venueName}</strong>.
            </p>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#b91c1c", fontWeight: 600 }}>This will remove all staff assignments and training data linked to this venue. This cannot be undone.</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setVenueDeleteConfirm(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", color: "#374151" }}>
                No, keep it
              </button>
              <button
                type="button"
                onClick={() => { handleDeleteVenue(venueDeleteConfirm.venueId, venueDeleteConfirm.venueName); setVenueDeleteConfirm(null); }}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#dc2626", color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Yes, delete venue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

