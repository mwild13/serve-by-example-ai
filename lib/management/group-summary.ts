import type { StaffMember, Venue } from "@/lib/management/types";
import { computeSkillGapFlags, countShiftReadyStaff } from "@/lib/management/skill-gaps";
import { rsaStatus, fssStatus } from "@/components/mission-control/compliance/helpers";

// Cross-venue rollup for the Group Analytics view (Mission Control Batch 5).
// Pure, DB-agnostic reducers — mirrors the lib/management/skill-gaps.ts and
// lib/management/team-grouping.ts pattern (Batch 4): the actual Supabase
// query lives in lib/management/service.ts::getOrgGroupSummary(), this file
// only knows how to turn an already-fetched venues/staff array into the
// small aggregate shape the client renders.

export type VenueGroupStat = {
  venueId: string;
  venueName: string;
  headcount: number;
  avgCompletion: number;
  avgScenarioScore: number;
  avgSalesScore: number;
  shiftReadyCount: number;
  shiftReadyPct: number;
};

export type VenueComplianceRisk = {
  venueId: string;
  venueName: string;
  rsaPending: number; // recorded, expiring within 30 days but not yet expired
  rsaExpired: number;
  fssPending: number; // grace period active but closing (recorded, not fully lapsed)
  fssExpired: number; // grace period fully exhausted — venue has no valid FSS on file
};

export type OrgGroupSummary = {
  totalVenues: number;
  totalHeadcount: number;
  avgCompletion: number;
  avgMastery: number;
  shiftReadyCount: number;
  shiftReadyPct: number;
  venues: VenueGroupStat[];
  complianceRisk: VenueComplianceRisk[];
};

function avg(nums: number[]): number {
  return nums.length ? Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length) : 0;
}

// Same (service + sales + product) / 3 formula used everywhere else in this
// codebase's mastery displays — see lib/mastery.ts / ManagerControlCenter's
// per-venue `metrics.avgScenarioScore`. Do not invent a second formula here.
function masteryOf(member: StaffMember): number {
  return (member.serviceScore + member.salesScore + member.productScore) / 3;
}

export function computeComplianceRiskMatrix(
  venues: Array<Pick<Venue, "id" | "name">>,
  staff: StaffMember[],
): VenueComplianceRisk[] {
  return venues.map((venue) => {
    const members = staff.filter((member) => member.venueId === venue.id);
    let rsaPending = 0;
    let rsaExpired = 0;
    let fssPending = 0;
    let fssExpired = 0;

    for (const member of members) {
      const rsa = rsaStatus(member.compliance);
      if (rsa.level === 1 || rsa.level === 2) rsaPending += 1;
      else if (rsa.level === 3) rsaExpired += 1;

      const fss = fssStatus(member.compliance);
      if (fss.level === 1 || fss.level === 2) fssPending += 1;
      else if (fss.level === 3) fssExpired += 1;
    }

    return { venueId: venue.id, venueName: venue.name, rsaPending, rsaExpired, fssPending, fssExpired };
  });
}

export function computeOrgGroupSummary(
  venues: Array<Pick<Venue, "id" | "name">>,
  staff: StaffMember[],
): OrgGroupSummary {
  // One org-wide flag pass — countShiftReadyStaff only checks membership in
  // the high-risk id set, so reusing the full flag list per-venue below is
  // safe and avoids recomputing computeSkillGapFlags() per venue.
  const flags = computeSkillGapFlags(staff);

  const venueStats: VenueGroupStat[] = venues.map((venue) => {
    const members = staff.filter((member) => member.venueId === venue.id);
    const shiftReadyCount = countShiftReadyStaff(members, flags);
    return {
      venueId: venue.id,
      venueName: venue.name,
      headcount: members.length,
      avgCompletion: avg(members.map((m) => m.progress)),
      avgScenarioScore: avg(members.map((m) => (m.serviceScore + m.productScore) / 2)),
      avgSalesScore: avg(members.map((m) => m.salesScore)),
      shiftReadyCount,
      shiftReadyPct: members.length ? Math.round((shiftReadyCount / members.length) * 100) : 0,
    };
  });

  const totalHeadcount = staff.length;
  const shiftReadyCount = countShiftReadyStaff(staff, flags);

  return {
    totalVenues: venues.length,
    totalHeadcount,
    avgCompletion: avg(staff.map((m) => m.progress)),
    avgMastery: avg(staff.map(masteryOf)),
    shiftReadyCount,
    shiftReadyPct: totalHeadcount ? Math.round((shiftReadyCount / totalHeadcount) * 100) : 0,
    venues: venueStats,
    complianceRisk: computeComplianceRiskMatrix(venues, staff),
  };
}
