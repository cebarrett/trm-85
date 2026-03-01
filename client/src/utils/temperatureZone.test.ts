import { describe, it, expect } from "vitest";
import { getTemperatureZone } from "./temperatureZone";

describe("getTemperatureZone", () => {
  it("returns 'clean' for temperature 0.0", () => {
    expect(getTemperatureZone(0.0)).toBe("clean");
  });

  it("returns 'clean' for temperature 0.5", () => {
    expect(getTemperatureZone(0.5)).toBe("clean");
  });

  it("returns 'clean' for temperature 0.7 (boundary)", () => {
    expect(getTemperatureZone(0.7)).toBe("clean");
  });

  it("returns 'warm' for temperature 0.71", () => {
    expect(getTemperatureZone(0.71)).toBe("warm");
  });

  it("returns 'warm' for temperature 0.8", () => {
    expect(getTemperatureZone(0.8)).toBe("warm");
  });

  it("returns 'warm' for temperature 0.9 (boundary)", () => {
    expect(getTemperatureZone(0.9)).toBe("warm");
  });

  it("returns 'warning' for temperature 0.91", () => {
    expect(getTemperatureZone(0.91)).toBe("warning");
  });

  it("returns 'warning' for temperature 1.0 (boundary)", () => {
    expect(getTemperatureZone(1.0)).toBe("warning");
  });

  it("returns 'danger' for temperature 1.01", () => {
    expect(getTemperatureZone(1.01)).toBe("danger");
  });

  it("returns 'danger' for temperature 1.05 (boundary)", () => {
    expect(getTemperatureZone(1.05)).toBe("danger");
  });

  it("returns 'chaos' for temperature 1.06", () => {
    expect(getTemperatureZone(1.06)).toBe("chaos");
  });

  it("returns 'chaos' for temperature 1.1", () => {
    expect(getTemperatureZone(1.1)).toBe("chaos");
  });
});
