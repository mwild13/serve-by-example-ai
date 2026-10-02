import { describe, expect, it } from "vitest";
import { createAttemptIdKeeper } from "./attempt-id";

describe("createAttemptIdKeeper", () => {
  it("reuses the id when the same submission is retried", () => {
    const keeper = createAttemptIdKeeper();
    expect(keeper.idFor("a")).toBe(keeper.idFor("a"));
  });

  it("issues a new id when what's being submitted changes", () => {
    const keeper = createAttemptIdKeeper();
    expect(keeper.idFor("a")).not.toBe(keeper.idFor("b"));
  });

  it("issues a new id after a successful submit", () => {
    const keeper = createAttemptIdKeeper();
    const first = keeper.idFor("a");
    keeper.settle();
    expect(keeper.idFor("a")).not.toBe(first);
  });
});
