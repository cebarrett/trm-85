import { describe, it, expect } from "vitest";
import { eqToFragments, type EqBand } from "./eqToFragments";

const BANDS: EqBand[] = [
  { id: "wit", label: "Wit", high: "witty and funny", low: "dry and deadpan" },
  { id: "gravity", label: "Gravity", high: "dark and heavy", low: "light and breezy" },
];

describe("eqToFragments", () => {
  it("returns nothing when all bands are centered", () => {
    expect(eqToFragments({}, BANDS)).toEqual([]);
    expect(eqToFragments({ wit: 0, gravity: 0.1 }, BANDS)).toEqual([]);
  });

  it("uses the high phrase when a band is boosted", () => {
    expect(eqToFragments({ wit: 1 }, BANDS)).toEqual(["Be very witty and funny."]);
  });

  it("uses the low phrase when a band is cut", () => {
    expect(eqToFragments({ gravity: -1 }, BANDS)).toEqual([
      "Be very light and breezy.",
    ]);
  });

  it("scales the intensity word with magnitude", () => {
    expect(eqToFragments({ wit: 0.3 }, BANDS)).toEqual(["Be a little witty and funny."]);
    expect(eqToFragments({ wit: 0.6 }, BANDS)).toEqual(["Be noticeably witty and funny."]);
  });

  it("emits one fragment per active band", () => {
    expect(eqToFragments({ wit: 1, gravity: -1 }, BANDS)).toHaveLength(2);
  });
});
