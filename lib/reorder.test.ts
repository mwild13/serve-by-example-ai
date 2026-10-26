import { describe, expect, it } from "vitest";
import { dropIndex, moveItem } from "./reorder";

describe("moveItem", () => {
  it("moves an item up or down any distance, keeping the rest in order", () => {
    expect(moveItem(["a", "b", "c", "d"], 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(moveItem(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(["a", "b", "c", "d"], 1, 2)).toEqual(["a", "c", "b", "d"]);
  });

  it("leaves the list alone when the move is out of range, and never changes the original", () => {
    const list = ["a", "b"];
    expect(moveItem(list, 0, 5)).toEqual(["a", "b"]);
    expect(moveItem(list, -1, 0)).toEqual(["a", "b"]);
    moveItem(list, 0, 1);
    expect(list).toEqual(["a", "b"]);
  });
});

describe("dropIndex", () => {
  const middles = [100, 160, 220, 280];
  it("finds the row the pointer is over", () => {
    expect(dropIndex(middles, 50)).toBe(0);
    expect(dropIndex(middles, 130)).toBe(0);
    expect(dropIndex(middles, 170)).toBe(1);
    expect(dropIndex(middles, 250)).toBe(2);
    expect(dropIndex(middles, 900)).toBe(3);
  });
});
