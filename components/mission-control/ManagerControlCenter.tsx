"use client";

import React, { FormEvent, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
  ChevronDown,
} from "lucide-react";
import type {
  ManagementSnapshot,
  ManagerSection,
  NewInventoryPayload,
  NewStaffPayload,
  NewTrainingProgramPayload,
  StaffRole,
} from "@/lib/management/types";
import { ComplianceHub } from "./compliance/ComplianceHub";
import { rsaStatus } from "./compliance/helpers";
import type { QuickActionId, NavGroup, SearchResult } from "./manager-types";
import { EmptyState } from "./manager-ui";
import { WorkspaceHeader } from "@/app/management/dashboard/_components/WorkspaceHeader";
import { ManagementTopbar } from "@/app/management/dashboard/_components/ManagementTopbar";
import { ActionDrawer } from "@/app/management/dashboard/_components/ActionDrawer";

const CoachingDrawer = lazy(() => import("@/app/management/dashboard/_components/CoachingDrawer"));
import StaffDirectoryTable from "./StaffDirectoryTable";
import { TeamsPerformancePanel } from "./TeamsPerformancePanel";
import { RolesPermissionsMatrix } from "./RolesPermissionsMatrix";
import { ReportsPanel } from "./ReportsPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { PredictivePanel } from "./PredictivePanel";
import { SettingsPanel } from "./SettingsPanel";
import { LeaderboardBoard } from "./LeaderboardBoard";
import { OverviewPanel } from "./OverviewPanel";
import { TrialStatusPill } from "./TrialStatusPill";
import { TrialExpiredModal } from "./TrialExpiredModal";
import { isB2BTier, isMultiVenueTier } from "@/lib/session";

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
  trialTier,
  trialEndsAt,
  daysRemaining,
  trialExpired,
  showExpiredModal,
}: {
  initialSnapshot?: ManagementSnapshot;
  plan?: string;
  displayName?: string;
  trialTier?: string | null;
  trialEndsAt?: string | null;
  daysRemaining?: number;
  trialExpired?: boolean;
  showExpiredModal?: boolean;
}) {
  const isMultiVenue = isMultiVenueTier(plan);

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
    (searchParams.get("subtab") as "setup" | "billing" | "account" | null) ?? "setup";
  function setSettingsTab(subtab: "setup" | "billing" | "account") {
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
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  }, [initialSnapshot, apiFetch]);

  const [revenueTransactionValue, setRevenueTransactionValue] = useState(() => {
    if (typeof window === 'undefined') return 45;
    try {
      const v = localStorage.getItem('sbe_revenue_slider');
      return v ? Math.max(5, Math.min(300, Number(v))) : 45;
    } catch { return 45; }
  });
  useEffect(() => {
    try { localStorage.setItem('sbe_revenue_slider', String(revenueTransactionValue)); } catch { /* storage unavailable */ }
  }, [revenueTransactionValue]);

  const [aiCoachInput, setAiCoachInput] = useState("");
  const [aiCoachMessages, setAiCoachMessages] = useState<Array<{ role: "user" | "coach"; content: string }>>([]);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  // leaderboardTab moved into LeaderboardBoard.tsx — local UI-only state.
  // notifFilter/dismissedNotifs/showArchivedNotifs moved into
  // NotificationsPanel.tsx — local UI-only state.
  // reportSearch/reportSortKey/reportSortDir moved into ReportsPanel.tsx —
  // local UI-only state, nothing outside that tab ever read them.
  const [aiCoachFeedback, setAiCoachFeedback] = useState<Record<number, "up" | "down">>({});
  // settingsTab is now derived from URL via setSettingsTab shim above
  const [venueDeleteConfirm, setVenueDeleteConfirm] = useState<{ venueId: string; venueName: string } | null>(null);
  const [accountDisplayName, setAccountDisplayName] = useState(displayName ?? "");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);

  // A30 — Staff recognition
  const [recogniseTarget, setRecogniseTarget] = useState<{ id: string; name: string } | null>(null);
  const [recogniseMessage, setRecogniseMessage] = useState("");
  const [recogniseSaving, setRecogniseSaving] = useState(false);
  const [recogniseSent, setRecogniseSent] = useState(false);

  // A31 — AI Coach history
  const [aiCoachHistoryLoaded, setAiCoachHistoryLoaded] = useState(false);

  // A27 — Report schedule
  const [reportScheduleEnabled, setReportScheduleEnabled] = useState(false);
  const [reportScheduleDay, setReportScheduleDay] = useState(1);
  const [reportScheduleSaving, setReportScheduleSaving] = useState(false);
  const [reportScheduleSaved, setReportScheduleSaved] = useState(false);

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

  // A31 — Load AI Coach history the first time the user opens the AI Coach section
  useEffect(() => {
    if (activeSection !== "aicoach" || aiCoachHistoryLoaded || aiCoachMessages.length > 0) return;
    setAiCoachHistoryLoaded(true);
    const qs = selectedVenueId ? `?venueId=${encodeURIComponent(selectedVenueId)}&limit=40` : "?limit=40";
    apiFetch(`/api/management/coach/history${qs}`)
      .then((r) => r.json())
      .then((data: { messages?: Array<{ role: "user" | "coach"; content: string }> }) => {
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setAiCoachMessages(data.messages);
        }
      })
      .catch(() => { /* non-blocking */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

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
  useEffect(() => {
    if (!checkoutSuccess) return;
    if (plan && isB2BTier(plan)) {
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
      if (data?.tier && isB2BTier(data.tier as string)) {
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

  // Explicit attention tracking: captures onboarding stagnation, inactivity, and zero progress
  const parseLastActiveDays = (lastActive: string): number | null => {
    if (lastActive === "Not started") return null; // flag for onboarding stagnation
    const match = lastActive.match(/^(\d+)\s+days?\s+ago$/);
    if (match) return parseInt(match[1], 10);
    if (lastActive === "Today") return 0;
    if (lastActive === "Yesterday") return 1;
    return null;
  };

  const needsAttention = venueStaff.filter((member) => {
    // Onboarding Stagnation: never started training
    if (member.lastActive === "Not started") return true;

    // Inactivity/Absence: no activity for 14+ days
    const daysInactive = parseLastActiveDays(member.lastActive);
    if (daysInactive !== null && daysInactive >= 14) return true;

    // Zero-Progress Alert: 0% completion on active staff
    if (member.progress === 0 && member.lastActive !== "Not started") return true;

    // Fallback to status-based flagging for other issues
    return member.status !== "on-track";
  });

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
        // A31 — persist exchange to DB (fire and forget)
        apiFetch("/api/management/coach/history", {
          method: "POST",
          body: JSON.stringify({
            venueId: selectedVenueId,
            messages: [
              { role: "user", content: question },
              { role: "coach", content: data.answer },
            ],
          }),
        }).catch(() => { /* non-blocking */ });
      }
    } catch {
      setAiCoachMessages((prev) => [...prev, { role: "coach", content: "Unable to reach AI coach. Check your connection." }]);
    } finally {
      setAiCoachLoading(false);
    }
  }

  // A30 — Send staff recognition
  async function handleSendRecognition() {
    if (!recogniseTarget || !recogniseMessage.trim() || recogniseSaving) return;
    setRecogniseSaving(true);
    try {
      await apiFetch("/api/management/recognitions", {
        method: "POST",
        body: JSON.stringify({ staffId: recogniseTarget.id, message: recogniseMessage.trim() }),
      });
      setRecogniseSent(true);
      setTimeout(() => {
        setRecogniseTarget(null);
        setRecogniseMessage("");
        setRecogniseSent(false);
      }, 2000);
    } catch { /* silent */ } finally {
      setRecogniseSaving(false);
    }
  }

  // A27 — Save weekly report schedule
  async function handleSaveReportSchedule() {
    if (!selectedVenueId) return;
    setReportScheduleSaving(true);
    try {
      await apiFetch("/api/management/venues", {
        method: "PATCH",
        body: JSON.stringify({
          venueId: selectedVenueId,
          reportSchedule: { enabled: reportScheduleEnabled, dayOfWeek: reportScheduleDay },
        }),
      });
      setReportScheduleSaved(true);
      setTimeout(() => setReportScheduleSaved(false), 3000);
    } catch { /* silent */ } finally {
      setReportScheduleSaving(false);
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

    if (activeAction === "add-staff") {
      const limit = selectedVenue.staffLimit ?? (isMultiVenue ? 35 : 15);
      if (venueStaff.length >= limit) {
        setRequestError(`You've reached the ${limit}-seat limit for ${selectedVenue.name}. Upgrade your plan to add more staff.`);
        return;
      }
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
      <div className="ops-shell mc-shell">
        <SessionRefresher />
        <aside className="mc-sidebar" style={{ opacity: 0.5, pointerEvents: "none" }}>
          <div className="mc-sidebar-logo" style={{ width: "100%", height: 64, display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image src="/logo.webp" alt="Serve By Example Logo" width={32} height={32} style={{ borderRadius: 8, flexShrink: 0 }} />
            <div className="mc-sidebar-logo-text">
              <span className="mc-sidebar-logo-brand">Serve By Example</span>
              <span className="mc-sidebar-logo-sub">Management Console</span>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ background: "var(--mc-line)", height: 40, borderRadius: 8 }} />
            <div style={{ background: "var(--mc-line)", height: 200, borderRadius: 8, marginTop: 12 }} />
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
    <div className="ops-shell mc-shell">
      <SessionRefresher />
      {showExpiredModal && trialTier && (
        <TrialExpiredModal trialTier={trialTier} />
      )}
      <aside className="mc-sidebar">
        <div className="mc-sidebar-logo">
          <img src="/logo.webp" alt="Serve By Example" />
          <div className="mc-sidebar-logo-text">
            <span className="mc-sidebar-logo-brand">Serve By Example</span>
            <span className="mc-sidebar-logo-sub">Management Console</span>
          </div>
        </div>

        <div className="mc-sidebar-scroll">
          <nav>
            {NAV_GROUPS.map((group) => {
              const isCollapsed = group.collapsible && collapsedGroups.has(group.label);
              return (
                <div key={group.label} className="mc-nav-group">
                  {group.collapsible ? (
                    <button
                      type="button"
                      className="mc-nav-group-toggle"
                      onClick={() => toggleGroup(group.label)}
                      aria-expanded={!isCollapsed}
                    >
                      <span>{group.label}</span>
                      <ChevronDown size={12} strokeWidth={2} className={`mc-nav-chevron${isCollapsed ? " collapsed" : ""}`} aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="mc-nav-group-label">{group.label}</div>
                  )}
                  {!isCollapsed && (
                    <div className="mc-nav-items">
                      {group.items.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          className={`mc-nav-item${activeSection === section.id ? " active" : ""}`}
                          onClick={() => handleSectionChange(section.id)}
                        >
                          <section.icon size={15} strokeWidth={1.5} aria-hidden="true" />
                          <span className="mc-nav-item-label">{section.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="mc-sidebar-bottom">
          {trialTier && trialEndsAt && typeof daysRemaining === "number" && (
            <TrialStatusPill
              trialTier={trialTier}
              trialEndsAt={trialEndsAt}
              daysRemaining={daysRemaining}
              isExpired={trialExpired}
            />
          )}
          <div className="mc-profile-row">
            <div className="mc-profile-avatar">
              {(accountDisplayName || "M").trim().slice(0, 1).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="mc-profile-name">{accountDisplayName || "Manager"}</div>
              <div className="mc-profile-role">Venue Manager</div>
            </div>
          </div>
          <SignOutButton className="mc-signout-btn" />
        </div>
      </aside>

      <section className="ops-workspace">
        <ManagementTopbar
          breadcrumbs={breadcrumbs}
          venueName={
            snapshot.venues.length === 0
              ? "No venues"
              : selectedVenueId
              ? snapshot.venues.find((v) => v.id === selectedVenueId)?.name ?? "Venue"
              : "Venue"
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onResultClick={(result) => {
            handleSectionChange(result.section);
            setSearchQuery("");
          }}
          onActionSelect={setActiveAction}
          venues={snapshot.venues.map((v) => ({ id: v.id, name: v.name }))}
          selectedVenueId={selectedVenueId}
          onVenueChange={setSelectedVenueId}
          isMultiVenue={isMultiVenue}
          onGroupAnalytics={() => handleSectionChange("analytics")}
          onAICoach={() => handleSectionChange("aicoach")}
          displayName={accountDisplayName || displayName}
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
              background: "var(--green-light)",
              border: "1.5px solid var(--green)",
              borderRadius: "var(--radius-md)",
              marginBottom: 12,
              fontSize: "0.875rem",
              color: "var(--green-deep)",
              fontWeight: 600,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
                      copyTimeoutRef.current = setTimeout(() => setInviteLinkCopied(false), 2500);
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
          <OverviewPanel
            metrics={metrics}
            venueStaff={venueStaff}
            needsAttention={needsAttention}
            handleSectionChange={handleSectionChange}
            onOpenCoachingDrawer={(staffId) => { setSelectedStaffId(staffId); setCoachingDrawerOpen(true); }}
          />
        )}

        {activeSection === "staff" && (
          <StaffDirectoryTable
            snapshot={snapshot}
            selectedVenueId={selectedVenueId}
            selectedVenue={selectedVenue}
            venueStaff={venueStaff}
            selectedStaffId={selectedStaffId}
            sessionToken={sessionToken}
            onSnapshotUpdate={(updated) => setSnapshot(updated)}
            onOpenCoachingDrawer={(staffId) => { setSelectedStaffId(staffId); setCoachingDrawerOpen(true); }}
            onAddStaff={() => openAction("add-staff")}
            handleExportStaff={handleExportStaff}
          />
        )}

        {activeSection === "teams" && (
          <TeamsPerformancePanel
            venueStaff={venueStaff}
            selectedVenueName={selectedVenue?.name}
            onAssignStaffToTeam={() => { handleSectionChange("staff"); openAction("add-staff"); }}
            onResolveSkillGap={(prompt) => { setAiCoachInput(prompt); handleSectionChange("aicoach"); }}
          />
        )}

        {activeSection === "roles" && (
          <RolesPermissionsMatrix venueStaff={venueStaff} selectedVenueName={selectedVenue?.name} />
        )}

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

        {activeSection === "compliance" && (
          <ComplianceHub
            venueStaff={venueStaff}
            sessionToken={sessionToken}
            onSnapshotUpdate={(updated) => setSnapshot(updated)}
          />
        )}

        {activeSection === "analytics" && (
          <>
            <section className="ops-grid ops-grid-main">
              {isMultiVenue && (
                <article className="ops-card">
                  <div className="ops-card-head">
                    <h3>Multi-venue comparison</h3>
                    <span>All venues</span>
                  </div>
                  {snapshot.venues.length === 0 ? (
                    <EmptyState
                      copy="No venues yet."
                      ctaLabel="+ Add venue"
                      onCtaClick={() => handleSectionChange("settings")}
                    />
                  ) : (
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
                              className="sbe-button-outline sbe-button-outline--sm"
                              style={{ marginTop: 8 }}
                            >
                              Review staff →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
                </article>
              )}

              <article className="ops-card">
                <WorkspaceHeader
                  title="This week"
                  description="Current-period snapshot"
                  meta={selectedVenue?.name}
                />
                {/* Prior-week column intentionally omitted: no historical
                    snapshot table exists yet to compare against, so a "vs
                    last week" figure would be fabricated. Re-add once
                    historical tracking is wired up (see feature-data-audit). */}
                <div className="ops-compare-grid" style={{ gridTemplateColumns: "1fr auto" }}>
                  <div className="ops-compare-row ops-compare-head" style={{ gridTemplateColumns: "1fr auto" }}>
                    <span>Metric</span><span>Current</span>
                  </div>
                  {[
                    { label: "Training completion", current: metrics.avgCompletion, suffix: "%" },
                    { label: "Scenario score", current: metrics.avgScenarioScore, suffix: "%" },
                    { label: "Upsell rate", current: metrics.salesSkill, suffix: "%" },
                    { label: "Active staff", current: metrics.activeThisWeek, suffix: "" },
                  ].map((row) => (
                    <div key={row.label} className="ops-compare-row" style={{ gridTemplateColumns: "1fr auto" }}>
                      <span>{row.label}</span>
                      <span>{row.current > 0 ? `${row.current}${row.suffix}` : "–"}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "10px 0 0", fontStyle: "italic" }}>
                  Week-on-week trend comparison will appear once historical tracking is live.
                </p>
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
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-soft)", marginBottom: 6 }}>No bar or floor staff yet</div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 14px" }}>Assign staff with Bartender or Floor roles to unlock side-by-side team comparison.</p>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: "0.8rem" }} onClick={() => { handleSectionChange("staff"); openAction("add-staff"); }}>
                      + Add staff
                    </button>
                  </div>
                )}
              </article>

              <article className="ops-card ops-revenue-model">
                <div className="ops-card-head">
                  <h3>Revenue Impact Simulator</h3>
                  <span>Formula projection, not live POS data</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-soft)", fontWeight: 600 }}>Avg transaction value</span>
                    <strong style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>${revenueTransactionValue}</strong>
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
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
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
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg-alt)" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>How this is calculated</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-soft)", lineHeight: 1.5 }}>
                    {Math.max(venueStaff.length, 3)} staff × 40 transactions/shift × 3 shifts/week × ${revenueTransactionValue} avg order value × upsell improvement %
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>Training-driven upsell improvement is a conservative estimate based on Serve By Example scenario coaching outcomes.</div>
                </div>
              </article>
            </section>
          </>
        )}

        {activeSection === "reports" && (
          <ReportsPanel
            venueStaff={venueStaff}
            selectedVenueName={selectedVenue?.name}
            metrics={metrics}
            handleExportStaff={handleExportStaff}
            onOpenCoachingDrawer={(staffId) => { setSelectedStaffId(staffId); setCoachingDrawerOpen(true); }}
            onAddStaff={() => { handleSectionChange("staff"); openAction("add-staff"); }}
            reportScheduleEnabled={reportScheduleEnabled}
            setReportScheduleEnabled={setReportScheduleEnabled}
            reportScheduleDay={reportScheduleDay}
            setReportScheduleDay={setReportScheduleDay}
            reportScheduleSaving={reportScheduleSaving}
            reportScheduleSaved={reportScheduleSaved}
            handleSaveReportSchedule={handleSaveReportSchedule}
          />
        )}

        {activeSection === "leaderboards" && (
          <LeaderboardBoard
            venueStaff={venueStaff}
            selectedVenueName={selectedVenue?.name}
            onSelectStaff={(staffId) => { setSelectedStaffId(staffId); handleSectionChange("staff"); }}
            onRecognise={(member) => { setRecogniseTarget(member); setRecogniseMessage(""); setRecogniseSent(false); }}
            onAddStaff={() => { handleSectionChange("staff"); openAction("add-staff"); }}
          />
        )}

        {activeSection === "notifications" && (
          <NotificationsPanel
            venueStaff={venueStaff}
            needsAttention={needsAttention}
            venueInventory={venueInventory}
            venuePrograms={venuePrograms}
            metrics={metrics}
            selectedVenueName={selectedVenue?.name}
            handleSectionChange={handleSectionChange}
          />
        )}

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
                {needsAttention.slice(0, 5).map((s) => (
                  <button
                    key={`staff-${s.id}`}
                    type="button"
                    className="ops-ai-suggestion-chip"
                    style={{ borderColor: "var(--gold)", color: "var(--gold-warm)" }}
                    onClick={() => setAiCoachInput(`${s.name} (${s.role}, ${Math.round(s.progress)}% training, last active ${s.lastActive}): `)}
                  >
                    Coach: {s.name}
                  </button>
                ))}
              </div>
              <div className="ops-ai-coach-messages">
                {aiCoachMessages.length === 0 && (
                  <div className="ops-ai-coach-empty">
                    <div style={{ width: "100%", marginBottom: 16 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
                        Your venue at a glance – {selectedVenue?.name}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                        {[
                          { label: "Staff", value: venueStaff.length > 0 ? String(venueStaff.length) : "–", sub: "active members" },
                          { label: "Avg score", value: metrics.avgScenarioScore > 0 ? `${metrics.avgScenarioScore}%` : "–", sub: "scenario average" },
                          { label: "Training", value: metrics.avgCompletion > 0 ? `${metrics.avgCompletion}%` : "–", sub: "completion rate" },
                          { label: "Attention", value: String(needsAttention.length), sub: needsAttention.length === 1 ? "needs follow-up" : "need follow-up" },
                        ].map((stat) => (
                          <div key={stat.label} style={{ background: "var(--bg-alt)", borderRadius: 8, padding: "10px 14px" }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)" }}>{stat.value}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 1 }}>{stat.label} · {stat.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", margin: 0 }}>Ask anything about your team, training progress, or venue performance.</p>
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
                            style={{ padding: "3px 8px", borderRadius: 6, border: `1.5px solid ${aiCoachFeedback[index] === dir ? (dir === "up" ? "var(--status-success-border)" : "var(--status-critical-border)") : "var(--line)"}`, background: aiCoachFeedback[index] === dir ? (dir === "up" ? "var(--status-success-bg)" : "var(--status-critical-light)") : "transparent", cursor: "pointer", fontSize: "0.82rem", color: aiCoachFeedback[index] === dir ? (dir === "up" ? "var(--status-success)" : "var(--status-critical)") : "var(--text-muted)", transition: "all 0.15s" }}
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
                        <div key={w} style={{ height: 10, width: `${w}%`, borderRadius: 999, background: "var(--line)", animation: "pulse 1.5s ease-in-out infinite" }} />
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
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Press Enter to send · Shift+Enter for new line</span>
                  <button
                    type="submit"
                    disabled={aiCoachLoading || !aiCoachInput.trim()}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, border: "none", background: aiCoachLoading || !aiCoachInput.trim() ? "var(--viz-neutral-light)" : "var(--color-mastery-technical)", color: aiCoachLoading || !aiCoachInput.trim() ? "var(--color-text-faint)" : "white", fontWeight: 700, fontSize: "0.85rem", cursor: aiCoachLoading || !aiCoachInput.trim() ? "not-allowed" : "pointer", transition: "background 0.15s" }}
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
              <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 8, textAlign: "center", display: "block" }}>
                Do not share sensitive staff salary or financial details with AI Coach.
              </small>
            </article>
          </section>
        )}

        {activeSection === "predictive" && (
          <PredictivePanel
            venueStaff={venueStaff}
            selectedVenueName={selectedVenue?.name}
            handleSectionChange={handleSectionChange}
          />
        )}

        {activeSection === "settings" && (
          <SettingsPanel
            settingsTab={settingsTab}
            setSettingsTab={setSettingsTab}
            snapshot={snapshot}
            selectedVenue={selectedVenue}
            selectedVenueId={selectedVenueId}
            setSelectedVenueId={setSelectedVenueId}
            isMultiVenue={isMultiVenue}
            handleAddVenue={handleAddVenue}
            newVenueName={newVenueName}
            setNewVenueName={setNewVenueName}
            isSaving={isSaving}
            copiedVenueId={copiedVenueId}
            setCopiedVenueId={setCopiedVenueId}
            copyTimeoutRef={copyTimeoutRef}
            setVenueDeleteConfirm={setVenueDeleteConfirm}
            handleRenameVenue={handleRenameVenue}
            renameVenueName={renameVenueName}
            setRenameVenueName={setRenameVenueName}
            renameSaving={renameSaving}
            venueStaff={venueStaff}
            accountDisplayName={accountDisplayName}
            setAccountDisplayName={setAccountDisplayName}
            accountSaving={accountSaving}
            setAccountSaving={setAccountSaving}
            accountSaved={accountSaved}
            setAccountSaved={setAccountSaved}
            sessionToken={sessionToken}
            trialTier={trialTier}
            trialEndsAt={trialEndsAt}
            daysRemaining={daysRemaining}
            plan={plan}
          />
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
      {/* A30 — Staff recognition modal */}
      {recogniseTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }} onClick={() => setRecogniseTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface-raised, var(--surface-raised))", borderRadius: "var(--radius-lg)", padding: "28px 32px", maxWidth: 460, width: "calc(100% - 48px)", boxShadow: "var(--shadow-xl)" }}>
            <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-fraunces)", color: "var(--text)" }}>Recognise {recogniseTarget.name}</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "var(--text-soft)" }}>Your message will be saved and emailed to the staff member if they have a linked account.</p>
            <textarea
              rows={4}
              value={recogniseMessage}
              onChange={(e) => setRecogniseMessage(e.target.value)}
              placeholder={`E.g. "${recogniseTarget.name} crushed it during Friday service — best upsell numbers of the month."`}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)", background: "var(--surface)", fontSize: "0.875rem", resize: "vertical", minHeight: 90, boxSizing: "border-box" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button type="button" onClick={() => setRecogniseTarget(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--line)", background: "var(--surface)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", color: "var(--text-soft)" }}>
                Cancel
              </button>
              {recogniseSent ? (
                <button type="button" disabled style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "var(--green)", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                  Sent!
                </button>
              ) : (
                <button
                  type="button"
                  disabled={recogniseSaving || !recogniseMessage.trim()}
                  onClick={handleSendRecognition}
                  style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: recogniseSaving || !recogniseMessage.trim() ? "var(--viz-neutral-light)" : "var(--green)", color: recogniseSaving || !recogniseMessage.trim() ? "var(--color-text-faint)" : "white", fontWeight: 700, fontSize: "0.875rem", cursor: recogniseSaving || !recogniseMessage.trim() ? "not-allowed" : "pointer" }}
                >
                  {recogniseSaving ? "Sending…" : "Send recognition"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {venueDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }} onClick={() => setVenueDeleteConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 12, padding: "28px 32px", maxWidth: 420, width: "calc(100% - 48px)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "var(--color-ink)" }}>Delete venue?</h3>
            <p style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.55 }}>
              You are about to permanently delete <strong>{venueDeleteConfirm.venueName}</strong>.
            </p>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--status-critical-light)", border: "1px solid var(--status-critical-border)", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--status-critical-text)", fontWeight: 600 }}>This will remove all staff assignments and training data linked to this venue. This cannot be undone.</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setVenueDeleteConfirm(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--viz-neutral-light)", background: "white", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                No, keep it
              </button>
              <button
                type="button"
                onClick={() => { handleDeleteVenue(venueDeleteConfirm.venueId, venueDeleteConfirm.venueName); setVenueDeleteConfirm(null); }}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "var(--status-critical)", color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
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

