import type { TemperatureZone } from "../types";

export function getTemperatureZone(temperature: number): TemperatureZone {
  if (temperature <= 0.7) return "clean";
  if (temperature <= 0.9) return "warm";
  if (temperature <= 1.0) return "warning";
  if (temperature <= 1.05) return "danger";
  return "chaos";
}
