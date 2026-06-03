import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./buildSystemPrompt";

describe("buildSystemPrompt", () => {
  it("returns an empty string when there are no fragments", () => {
    expect(buildSystemPrompt([])).toBe("");
  });

  it("numbers a single fragment starting at 1", () => {
    const result = buildSystemPrompt(["Be poetic."]);
    expect(result).toContain("1. Be poetic.");
    expect(result).not.toContain("2.");
  });

  it("numbers multiple fragments sequentially", () => {
    const result = buildSystemPrompt(["First.", "Second.", "Third."]);
    expect(result).toContain("1. First.");
    expect(result).toContain("2. Second.");
    expect(result).toContain("3. Third.");
  });

  it("includes the fictional/comedic framing preamble", () => {
    const result = buildSystemPrompt(["Be poetic."]);
    expect(result).toContain("You are TRM-85");
    expect(result).toContain("fictional");
  });

  it("includes the soft guardrail", () => {
    const result = buildSystemPrompt(["Be poetic."]);
    expect(result).toContain("PG-13");
    expect(result).toContain("Never produce genuinely harmful content");
  });
});
