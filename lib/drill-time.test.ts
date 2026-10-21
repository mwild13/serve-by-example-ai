import { describe, expect, it } from "vitest";
import { drillTime } from "./drill-time";

describe("drillTime", () => {
  it("says seconds under a minute", () => {
    expect(drillTime(45)).toBe("45 seconds");
    expect(drillTime(0.4)).toBe("1 second");
  });

  it("says minutes and the seconds after them", () => {
    expect(drillTime(161)).toBe("2 minutes 41");
    expect(drillTime(60)).toBe("1 minute");
    expect(drillTime(65)).toBe("1 minute 5");
    expect(drillTime(180)).toBe("3 minutes");
  });
});
