import type { StaffMember } from "@/lib/management/types";

// Single source of truth for the six skill-gap threshold checks. Used to
// live as two hand-duplicated copies of the same six `if` checks —
// PredictivePanel.tsx's full per-staff flag list and
// SkillGapsSummaryCard.tsx's condensed Overview-tab rollup. Any threshold
// tweak had to be made twice or the two views silently disagreed. Both now
// call this and derive whatever shape they need from the result.

export type SkillGapId = "sales" | "service" | "product" | "progress" | "decay" | "confidence";
export type SkillGapRisk = "high" | "medium";

export type SkillGapFlag = {
  id: string;
  gapId: SkillGapId;
  staffId: string;
  staffName: string;
  role: string;
  gap: string;
  risk: SkillGapRisk;
  reason: string;
  action: string;
};

export function computeSkillGapFlags(staff: StaffMember[]): SkillGapFlag[] {
  return staff.flatMap((member) => {
    const flags: SkillGapFlag[] = [];
    const push = (gapId: SkillGapId, gap: string, risk: SkillGapRisk, reason: string, action: string) => {
      flags.push({ id: `${member.id}-${gapId}`, gapId, staffId: member.id, staffName: member.name, role: member.role, gap, risk, reason, action });
    };

    if (member.salesScore < 70)
      push("sales", "Upselling & Sales", "high", `Sales score ${member.salesScore}% – below 70% threshold`, "Assign 'Sales Conversations' training module");
    if (member.serviceScore < 65)
      push("service", "Service Quality", "medium", `Service score ${member.serviceScore}% – needs attention`, "Assign 'Guest Experience Foundations' scenario");
    if (member.productScore < 60)
      push("product", "Product Knowledge", "medium", `Product score ${member.productScore}% – knowledge gaps likely`, "Review menu knowledge module assignment");
    if (member.progress < 40 && member.status !== "inactive")
      push("progress", "Training Completion", "high", `Only ${member.progress}% complete – falling behind`, "Schedule a check-in and re-assign priority modules");
    if (member.knowledgeDecayRisk)
      push("decay", "Knowledge Decay", "high", "Spaced-repetition items overdue – skills fading", "Prompt staff to complete review queue");
    if (member.highConfidenceIncorrectRatio != null && member.highConfidenceIncorrectRatio > 0.3)
      push("confidence", "Confidence Mismatch", "medium", `${Math.round(member.highConfidenceIncorrectRatio * 100)}% of high-confidence attempts are incorrect`, "Coach on self-assessment accuracy – over-confidence risk");

    return flags;
  });
}

// Gap categories rolled up across the venue, ranked by how many staff they
// affect. `risk` escalates to "high" if any single flag in that category is
// high-risk for anyone on the team.
export function groupSkillGapsByCategory(flags: SkillGapFlag[]): Array<[string, { count: number; risk: SkillGapRisk }]> {
  const totals = new Map<string, { count: number; risk: SkillGapRisk }>();
  for (const f of flags) {
    const existing = totals.get(f.gap);
    if (existing) {
      existing.count += 1;
      if (f.risk === "high") existing.risk = "high";
    } else {
      totals.set(f.gap, { count: 1, risk: f.risk });
    }
  }
  return [...totals.entries()].sort((a, b) => b[1].count - a[1].count);
}

// A staff member is "shift-ready" once none of their flags are high-risk —
// medium-risk gaps (a slightly slow service score, say) don't block them
// from working a shift, they just need continued coaching.
export function countShiftReadyStaff(staff: StaffMember[], flags: SkillGapFlag[]): number {
  const highRiskStaffIds = new Set(flags.filter((f) => f.risk === "high").map((f) => f.staffId));
  return staff.filter((m) => !highRiskStaffIds.has(m.id)).length;
}

// "Urgent" bottleneck = a gap category that's both high-risk and systemic
// (affects 2+ staff, not just one person's one-off dip) — the same
// threshold the existing "systemic gap analysis" copy already used to
// decide when to suggest venue-wide training content.
export function countUrgentBottlenecks(grouped: Array<[string, { count: number; risk: SkillGapRisk }]>): number {
  return grouped.filter(([, info]) => info.risk === "high" && info.count >= 2).length;
}
