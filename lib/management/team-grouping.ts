import type { StaffMember, StaffRole } from "@/lib/management/types";

// Used to render Bartender and Floor as the only two comparison columns,
// unconditionally — so a venue whose roster is Supervisor/Manager/New-Staff
// heavy (or just doesn't use those exact two role labels) rendered "No bar
// or floor staff yet" even with a fully staffed team. This derives columns
// from whichever roles are actually present, in a stable presentation order
// (matches the StaffRole declaration order in lib/management/types.ts).

const ROLE_ORDER: StaffRole[] = ["Bartender", "Floor", "Supervisor", "Manager", "New Staff"];

export type RoleGroup = {
  role: StaffRole;
  members: StaffMember[];
};

// `maxColumns` caps how many role columns come back, largest group first —
// ManagerControlCenter.tsx's .ops-compare-grid CSS only has a fixed-width
// rule for up to 3 value columns (.ops-compare-row / :has(span:nth-child(4))),
// so callers rendering into that grid should pass 3.
export function groupStaffByPresentRoles(staff: StaffMember[], maxColumns?: number): RoleGroup[] {
  const groups = ROLE_ORDER
    .map((role) => ({ role, members: staff.filter((s) => s.role === role) }))
    .filter((group) => group.members.length > 0);

  if (maxColumns == null || groups.length <= maxColumns) return groups;

  return [...groups]
    .sort((a, b) => b.members.length - a.members.length)
    .slice(0, maxColumns);
}
