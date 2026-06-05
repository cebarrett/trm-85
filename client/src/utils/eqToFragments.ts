export interface EqBand {
  id: string;
  label: string;
  /** adjective phrase applied when the band is boosted (value > 0) */
  high: string;
  /** adjective phrase applied when the band is cut (value < 0) */
  low: string;
}

/**
 * Convert equalizer band values (-1..1, 0 = neutral) into weighted tone
 * instructions for the system prompt. Bands inside a small deadzone around
 * center contribute nothing.
 */
export function eqToFragments(
  values: Record<string, number>,
  bands: EqBand[]
): string[] {
  const fragments: string[] = [];
  for (const band of bands) {
    const value = values[band.id] ?? 0;
    if (Math.abs(value) < 0.15) continue;
    const magnitude = Math.abs(value);
    const intensity =
      magnitude < 0.45 ? "a little" : magnitude < 0.8 ? "noticeably" : "very";
    const trait = value > 0 ? band.high : band.low;
    fragments.push(`Be ${intensity} ${trait}.`);
  }
  return fragments;
}
