import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTokenRate } from "./useTokenRate";

describe("useTokenRate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with a rate of zero", () => {
    const { result } = renderHook(() => useTokenRate());
    expect(result.current.tokenRate).toBe(0);
  });

  it("calculates rate after recording tokens", () => {
    const { result } = renderHook(() => useTokenRate());

    act(() => {
      result.current.recordTokens(10);
    });

    // Rate should be positive after recording tokens
    expect(result.current.tokenRate).toBeGreaterThan(0);
  });

  it("returns zero rate when no tokens have been recorded recently", () => {
    const { result } = renderHook(() => useTokenRate());

    act(() => {
      result.current.recordTokens(5);
    });

    // Advance time beyond the window (1 second)
    act(() => {
      vi.advanceTimersByTime(2000);
      result.current.recordTokens(0);
    });

    // After the window expires with no new tokens, rate should be 0
    expect(result.current.tokenRate).toBe(0);
  });

  it("accumulates tokens from multiple calls within the window", () => {
    const { result } = renderHook(() => useTokenRate());

    act(() => {
      result.current.recordTokens(5);
    });

    act(() => {
      vi.advanceTimersByTime(100);
      result.current.recordTokens(5);
    });

    // Should reflect roughly 10 tokens in ~100ms
    expect(result.current.tokenRate).toBeGreaterThan(0);
  });
});
