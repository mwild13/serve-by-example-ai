import { describe, expect, it } from "vitest";
import type { StaffMember } from "@/lib/management/types";
import { needsAttention } from "@/lib/management/needs-attention";

function member(over: Partial<StaffMember> = {}): StaffMember {
  return {
    id: "s1",
    venueId: "v1",
    name: "Mia Murphy",
    role: "Bartender",
    progress: 50,
    serviceScore: 80,
    salesScore: 80,
    productScore: 80,
    lastActive: "Today",
    status: "on-track",
    strengths: [],
    improvements: [],
    ...over,
  };
}

describe("needsAttention", () => {
  it("leaves an active, on-track person alone", () => {
    expect(needsAttention(member())).toBe(false);
  });

  it("flags someone who never started, went quiet for 14 days, or has no progress", () => {
    expect(needsAttention(member({ lastActive: "Not started", progress: 0 }))).toBe(true);
    expect(needsAttention(member({ lastActive: "14 days ago" }))).toBe(true);
    expect(needsAttention(member({ progress: 0 }))).toBe(true);
    expect(needsAttention(member({ status: "attention" }))).toBe(true);
  });

  it("does not flag someone who has finished training, even after a long gap", () => {
    expect(needsAttention(member({ progress: 100, lastActive: "30 days ago" }))).toBe(false);
    expect(needsAttention(member({ progress: 100, status: "inactive" }))).toBe(false);
  });
});
