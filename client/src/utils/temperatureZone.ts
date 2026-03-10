import type { TemperatureZone } from "../types";

// Thresholds are in internal 0–1 range (display 0–11).
// display ~8 = 0.727, ~9 = 0.818, ~10 = 0.909, ~10.7 = 0.97, 11 = 1.0
export function getTemperatureZone(temperature: number): TemperatureZone {
  if (temperature <= 0.72) return "clean";
  if (temperature <= 0.85) return "warm";
  if (temperature <= 0.93) return "warning";
  if (temperature <= 0.97) return "danger";
  return "chaos";
}
