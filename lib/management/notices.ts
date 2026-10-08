import type { ManagerSection, StaffMember } from "@/lib/management/types";
import { fssStatus, rsaStatus } from "@/components/mission-control/compliance/helpers";
import { parseLastActiveDays, wasActiveWithinDays } from "@/lib/management/needs-attention";

// Sentences for the Overview notice reel (OverviewNoticeReel.tsx). Pure and
// derived from the same per-staff fields the rest of the console reads, so a
// notice can never disagree with the tile or tab it links to. Order is
// priority: the reel opens on the first item.

export type OverviewNotice = {
  id: string;
  label: string;
  text: string;
  section: ManagerSection;
};

const INACTIVE_DAYS = 45;
const COMPLETED_WITHIN_DAYS = 30;
const MAX_NAMES = 3;

// First names, with a last initial only where two people on the roster share
// a first name ("Mia M. and Mia T.").
function shortNames(members: StaffMember[], roster: StaffMember[]): string[] {
  const first = (name: string) => name.trim().split(/\s+/)[0] ?? name;
  const counts = new Map<string, number>();
  for (const m of roster) counts.set(first(m.name), (counts.get(first(m.name)) ?? 0) + 1);
  return members.map((m) => {
    const parts = m.name.trim().split(/\s+/);
    const shared = (counts.get(parts[0]) ?? 0) > 1;
    return shared && parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
  });
}

export function formatNameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length <= MAX_NAMES) return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  const rest = names.length - MAX_NAMES;
  return `${names.slice(0, MAX_NAMES).join(", ")} and ${rest} ${rest === 1 ? "other" : "others"}`;
}

export function buildOverviewNotices(staff: StaffMember[]): OverviewNotice[] {
  if (staff.length === 0) {
    return [{ id: "empty", label: "Getting started", text: "Add your first staff member to see team notices here.", section: "staff" }];
  }

  const notices: OverviewNotice[] = [];
  const add = (
    id: string,
    label: string,
    section: ManagerSection,
    members: StaffMember[],
    sentence: (who: string, plural: boolean) => string,
  ) => {
    if (members.length === 0) return;
    notices.push({ id, label, section, text: sentence(formatNameList(shortNames(members, staff)), members.length > 1) });
  };

  const rsaLevel = (m: StaffMember) => rsaStatus(m.compliance).level;

  add("rsa-expired", "Compliance", "compliance", staff.filter((m) => rsaLevel(m) === 3), (who, plural) =>
    plural
      ? `${who} have expired RSAs and cannot serve alcohol until they are renewed.`
      : `${who} has an expired RSA and cannot serve alcohol until it is renewed.`);

  add("rsa-7-days", "Compliance", "compliance", staff.filter((m) => rsaLevel(m) === 2), (who, plural) =>
    `${who} ${plural ? "have RSAs" : "has an RSA"} expiring within 7 days.`);

  add("rsa-30-days", "Compliance", "compliance", staff.filter((m) => rsaLevel(m) === 1), (who, plural) =>
    `${who} ${plural ? "have RSAs" : "has an RSA"} expiring within 30 days.`);

  add("fss-expired", "Compliance", "compliance", staff.filter((m) => fssStatus(m.compliance).level >= 1), (who, plural) =>
    `${who} ${plural ? "have expired Food Safety Supervisor certificates" : "has an expired Food Safety Supervisor certificate"}.`);

  const noRsaOnFile = staff.filter((m) => !m.compliance?.rsaExpiryDate).length;
  if (noRsaOnFile > 0) {
    notices.push({
      id: "rsa-missing",
      label: "Compliance",
      section: "compliance",
      text: `${noRsaOnFile} of ${staff.length} staff have no RSA expiry date on file.`,
    });
  }

  add("inactive", "Inactive", "staff", staff.filter((m) => (parseLastActiveDays(m.lastActive) ?? 0) >= INACTIVE_DAYS), (who, plural) =>
    `${who} ${plural ? "have" : "has"} not been online for more than ${INACTIVE_DAYS} days.`);

  add("not-started", "Not started", "staff", staff.filter((m) => m.lastActive === "Not started"), (who, plural) =>
    `${who} ${plural ? "have" : "has"} not started training yet.`);

  const needsFollowUp = notices.length > 0;

  add("completed", "Completed", "staff", staff.filter((m) => m.progress >= 100 && wasActiveWithinDays(m.lastActive, COMPLETED_WITHIN_DAYS + 1)), (who, plural) =>
    `${who} ${plural ? "have" : "has"} completed all modules.`);

  const activeThisWeek = staff.filter((m) => wasActiveWithinDays(m.lastActive, 7)).length;
  notices.push({
    id: "active-week",
    label: "This week",
    section: "staff",
    text: `${activeThisWeek} of ${staff.length} staff trained in the last 7 days.`,
  });

  if (!needsFollowUp) {
    notices.unshift({ id: "all-clear", label: "All clear", section: "compliance", text: "No certificates are expiring and no one needs follow-up." });
  }

  return notices;
}
