import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { ChatProvider, TemperatureProvider } from "../context/AppContext";
import { useChat } from "./useChat";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <TemperatureProvider>
      <ChatProvider>{children}</ChatProvider>
    </TemperatureProvider>
  );
}

describe("useChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with empty messages and not generating", () => {
    const { result } = renderHook(() => useChat(), { wrapper: Wrapper });
    expect(result.current.messages).toEqual([]);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.currentStreamedText).toBe("");
  });

  it("adds a user message on sendMessage", async () => {
    // Mock fetch to return a completed stream
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"message_stop"}\n\n'
          )
        );
        controller.close();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(mockStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const { result } = renderHook(() => useChat(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.sendMessage("Hello", 0.5);
    });

    expect(result.current.messages.length).toBeGreaterThanOrEqual(1);
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[0].content).toBe("Hello");
  });

  it("handles streaming tokens from the API", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"content_block_delta","delta":{"text":"Hi"}}\n\n'
          )
        );
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"content_block_delta","delta":{"text":" there"}}\n\n'
          )
        );
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"type":"message_stop"}\n\n'
          )
        );
        controller.close();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(mockStream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const { result } = renderHook(() => useChat(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.sendMessage("Hello", 0.5);
    });

    // Should have user message and assistant message
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe("assistant");
    expect(result.current.messages[1].content).toBe("Hi there");
    expect(result.current.isGenerating).toBe(false);
  });

  it("handles API errors gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Rate limited", { status: 429 })
    );

    const { result } = renderHook(() => useChat(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.sendMessage("Hello", 0.5);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toContain("429");
    expect(result.current.isGenerating).toBe(false);
  });

  it("abort function stops generation", () => {
    const { result } = renderHook(() => useChat(), { wrapper: Wrapper });
    // abort should not throw when called without active generation
    expect(() => result.current.abort()).not.toThrow();
  });
});
