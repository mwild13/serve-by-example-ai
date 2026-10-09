import { describe, expect, it } from "vitest";
import type { StaffMember } from "@/lib/management/types";
import { buildOverviewNotices, formatNameList } from "@/lib/management/notices";

// A calendar date in local time, as a manager would enter it. (Slicing a UTC
// ISO string gives yesterday's date for part of each day in Australia.)
function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function member(name: string, over: Partial<StaffMember> = {}, rsaInDays: number | null = 200): StaffMember {
  return {
    id: name,
    venueId: "v1",
    name,
    role: "Bartender",
    progress: 50,
    serviceScore: 80,
    salesScore: 80,
    productScore: 80,
    lastActive: "Today",
    status: "on-track",
    strengths: [],
    improvements: [],
    compliance: {
      staffId: name,
      rsaJurisdiction: "VIC",
      rsaExpiryDate: rsaInDays === null ? null : isoDaysFromNow(rsaInDays),
      fssExpiryDate: null,
      fssOnSiteCopy: false,
      shiftConfirmed: false,
    },
    ...over,
  };
}

const byId = (staff: StaffMember[]) => Object.fromEntries(buildOverviewNotices(staff).map((n) => [n.id, n.text]));

describe("certificate expiry", () => {
  it("treats a certificate that expired yesterday as expired, and one expiring today as current", () => {
    expect(byId([member("Mia Murphy", {}, -1)])["rsa-expired"]).toBeDefined();
    expect(byId([member("Mia Murphy", {}, 0)])["rsa-expired"]).toBeUndefined();
  });
});

describe("formatNameList", () => {
  it("joins up to three names and counts the rest", () => {
    expect(formatNameList(["Mia"])).toBe("Mia");
    expect(formatNameList(["Mia", "Adam"])).toBe("Mia and Adam");
    expect(formatNameList(["Mia", "Adam", "Rick"])).toBe("Mia, Adam and Rick");
    expect(formatNameList(["Mia", "Adam", "Rick", "Levi"])).toBe("Mia, Adam, Rick and 1 other");
    expect(formatNameList(["Mia", "Adam", "Rick", "Levi", "Xavier"])).toBe("Mia, Adam, Rick and 2 others");
  });
});

describe("buildOverviewNotices", () => {
  it("names staff with expired and expiring RSAs, most urgent first", () => {
    const staff = [
      member("Mia Murphy", {}, -3),
      member("Adam Lee", {}, 5),
      member("Rick Shaw", {}, 20),
      member("Levi Stone", {}, 21),
    ];
    const notices = buildOverviewNotices(staff);
    expect(notices.map((n) => n.id).slice(0, 3)).toEqual(["rsa-expired", "rsa-7-days", "rsa-30-days"]);
    expect(notices[0].text).toBe("Mia has an expired RSA and cannot serve alcohol until it is renewed.");
    expect(notices[1].text).toBe("Adam has an RSA expiring within 7 days.");
    expect(notices[2].text).toBe("Rick and Levi have RSAs expiring within 30 days.");
    expect(notices[0].section).toBe("compliance");
  });

  it("reports long inactivity, staff who never started, and completions", () => {
    const texts = byId([
      member("Amelia Ross", { lastActive: "46 days ago" }),
      member("Ronan Hale", { lastActive: "90 days ago" }),
      member("Sam Poe", { lastActive: "44 days ago" }),
      member("Nina Cole", { lastActive: "Not started", progress: 0 }),
      member("Levi Stone", { progress: 100, lastActive: "3 days ago" }),
      member("Old Hand", { progress: 100, lastActive: "60 days ago" }),
    ]);
    expect(texts["inactive"]).toBe("Amelia, Ronan and Old have not been online for more than 45 days.");
    expect(texts["not-started"]).toBe("Nina has not started training yet.");
    expect(texts["completed"]).toBe("Levi has completed all modules.");
    expect(texts["active-week"]).toBe("1 of 6 staff trained in the last 7 days.");
  });

  it("adds a last initial when two people share a first name", () => {
    const texts = byId([member("Mia Murphy", {}, -1), member("Mia Tran", {}, -1), member("Adam Lee")]);
    expect(texts["rsa-expired"]).toBe("Mia M. and Mia T. have expired RSAs and cannot serve alcohol until they are renewed.");
  });

  it("counts staff with no RSA date on file instead of calling them current", () => {
    const texts = byId([member("Mia Murphy", {}, null), member("Adam Lee")]);
    expect(texts["rsa-missing"]).toBe("1 of 2 staff have no RSA expiry date on file.");
    expect(texts["all-clear"]).toBeUndefined();
  });

  it("opens with an all-clear line when nothing needs follow-up", () => {
    const notices = buildOverviewNotices([member("Mia Murphy"), member("Adam Lee", { lastActive: "Yesterday" })]);
    expect(notices.map((n) => n.id)).toEqual(["all-clear", "active-week"]);
  });

  it("gives an empty venue a single getting-started line", () => {
    expect(buildOverviewNotices([]).map((n) => n.id)).toEqual(["empty"]);
  });
});
