import { describe, it, expect } from "vitest";
import { clamp } from "./clamp";

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it("clamps to minimum when value is below range", () => {
    expect(clamp(-0.5, 0, 1.1)).toBe(0);
  });

  it("clamps to maximum when value is above range", () => {
    expect(clamp(2.0, 0, 1.1)).toBe(1.1);
  });

  it("returns minimum when value equals minimum", () => {
    expect(clamp(0, 0, 1.1)).toBe(0);
  });

  it("returns maximum when value equals maximum", () => {
    expect(clamp(1.1, 0, 1.1)).toBe(1.1);
  });

  it("works with negative ranges", () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it("handles the full temperature range", () => {
    expect(clamp(0.0, 0.0, 1.1)).toBe(0.0);
    expect(clamp(0.55, 0.0, 1.1)).toBe(0.55);
    expect(clamp(1.1, 0.0, 1.1)).toBe(1.1);
    expect(clamp(1.2, 0.0, 1.1)).toBe(1.1);
  });
});
