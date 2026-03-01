import { useCallback, useRef } from "react";
import { useChatContext } from "../context/AppContext";
import { useStreaming } from "./useStreaming";
import { useTokenRate } from "./useTokenRate";
import type { Message } from "../types";

export function useChat() {
  const {
    messages,
    currentStreamedText,
    isGenerating,
    tokenCount,
    tokenRate,
    dispatch,
    abortControllerRef,
  } = useChatContext();
  const { startStream } = useStreaming();
  const { recordTokens } = useTokenRate();
  const temperatureRef = useRef(0.5);
  const prevLengthRef = useRef(0);

  const setTemperatureRef = useCallback((temperature: number) => {
    temperatureRef.current = temperature;
  }, []);

  const sendMessage = useCallback(
    async (content: string, temperature: number) => {
      const userMessage: Message = {
        role: "user",
        content,
        temperature,
        timestamp: Date.now(),
      };

      dispatch({ type: "ADD_MESSAGE", payload: userMessage });
      dispatch({ type: "SET_GENERATING", payload: true });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const conversationMessages = [
        ...messages,
        { role: "user" as const, content },
      ].slice(-20);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversationMessages.map(({ role, content: text }) => ({
              role,
              content: text,
            })),
            temperature,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          dispatch({
            type: "FINISH_GENERATION",
            payload: {
              assistantMessage: {
                role: "assistant",
                content: `Error: ${response.status} — ${errorText || "Request failed"}`,
                temperature,
                timestamp: Date.now(),
              },
            },
          });
          return;
        }

        prevLengthRef.current = 0;

        await startStream(response, {
          onToken: (fullText: string) => {
            dispatch({ type: "SET_STREAMED_TEXT", payload: fullText });
            const newTokens = fullText.length - prevLengthRef.current;
            if (newTokens > 0) {
              dispatch({ type: "ADD_TOKENS", payload: newTokens });
              recordTokens(newTokens);
            }
            prevLengthRef.current = fullText.length;
          },
          onComplete: (fullText: string) => {
            dispatch({
              type: "FINISH_GENERATION",
              payload: {
                assistantMessage: {
                  role: "assistant",
                  content: fullText,
                  temperature,
                  timestamp: Date.now(),
                },
              },
            });
            abortControllerRef.current = null;
          },
          onError: (errorMessage: string) => {
            dispatch({
              type: "FINISH_GENERATION",
              payload: {
                assistantMessage: {
                  role: "assistant",
                  content: `Error: ${errorMessage}`,
                  temperature,
                  timestamp: Date.now(),
                },
              },
            });
            abortControllerRef.current = null;
          },
        });
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }
        dispatch({
          type: "FINISH_GENERATION",
          payload: {
            assistantMessage: {
              role: "assistant",
              content: "Signal lost — connection failed",
              temperature,
              timestamp: Date.now(),
            },
          },
        });
        abortControllerRef.current = null;
      }
    },
    [messages, dispatch, abortControllerRef, startStream, recordTokens]
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, [abortControllerRef]);

  return {
    messages,
    currentStreamedText,
    isGenerating,
    tokenCount,
    tokenRate,
    sendMessage,
    abort,
    setTemperatureRef,
  };
}
