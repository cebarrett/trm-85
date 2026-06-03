import type { TemperatureZone } from "../types";

// Temperature range is 0–1.1.
export function getTemperatureZone(temperature: number): TemperatureZone {
  if (temperature <= 0.70) return "clean";
  if (temperature <= 0.90) return "warm";
  if (temperature <= 1.00) return "warning";
  if (temperature <= 1.05) return "danger";
  return "chaos";
}
