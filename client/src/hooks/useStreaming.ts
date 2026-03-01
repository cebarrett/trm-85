import { useCallback, useRef } from "react";

interface StreamCallbacks {
  onToken: (text: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: string) => void;
}

export function useStreaming() {
  const accumulatedTextRef = useRef("");

  const startStream = useCallback(
    async (response: Response, callbacks: StreamCallbacks) => {
      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError("No response body");
        return;
      }

      const decoder = new TextDecoder();
      accumulatedTextRef.current = "";
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);

              if (event.type === "content_block_delta" && event.delta?.text) {
                accumulatedTextRef.current += event.delta.text;
                callbacks.onToken(accumulatedTextRef.current);
              } else if (event.type === "message_stop") {
                callbacks.onComplete(accumulatedTextRef.current);
                return;
              } else if (event.type === "error") {
                callbacks.onError(
                  event.error?.message ?? "Stream error"
                );
                return;
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        // Stream ended without message_stop — still finalize
        callbacks.onComplete(accumulatedTextRef.current);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // EJECT: preserve partial text
          callbacks.onComplete(accumulatedTextRef.current);
        } else {
          callbacks.onError(
            error instanceof Error ? error.message : "Stream failed"
          );
        }
      }
    },
    []
  );

  return { startStream };
}
