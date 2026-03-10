import type { Request, Response } from "express";

export async function chatRoute(request: Request, response: Response) {
  const { messages, temperature, system } = request.body;

  if (!Array.isArray(messages) || typeof temperature !== "number") {
    response.status(400).json({ error: "Invalid request body" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: "API key not configured" });
    return;
  }

  const clampedTemperature = Math.min(Math.max(temperature, 0), 1.0);

  // Set SSE headers
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");

  try {
    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          temperature: clampedTemperature,
          stream: true,
          ...(typeof system === "string" && system ? { system } : {}),
          messages,
        }),
      }
    );

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      response.write(
        `data: ${JSON.stringify({ type: "error", error: { message: `API error: ${anthropicResponse.status} - ${errorBody}` } })}\n\n`
      );
      response.end();
      return;
    }

    const reader = anthropicResponse.body?.getReader();
    if (!reader) {
      response.write(
        `data: ${JSON.stringify({ type: "error", error: { message: "No response body from API" } })}\n\n`
      );
      response.end();
      return;
    }

    // Handle client disconnect (EJECT)
    let aborted = false;
    request.on("close", () => {
      aborted = true;
      reader.cancel();
    });

    // Pipe raw SSE bytes directly to client
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done || aborted) break;
        response.write(Buffer.from(value));
      }
      response.end();
    };

    await pump();
  } catch (error) {
    if (!response.headersSent) {
      response.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    } else {
      response.end();
    }
  }
}
